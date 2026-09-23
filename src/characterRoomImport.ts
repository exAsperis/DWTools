import { CHARACTER_KEY_PREFIX, LEGACY_CHARACTER_KEY_PREFIX } from "./constants";

import type { RoomMetadata } from "./defaultVisibility";

import {
  parseCharacterRecord,
  type StoredCharacterRecord,
} from "./characterRepository";

import {
  LOCAL_CHARACTER_ENTRY_FORMAT_VERSION,
  type CharacterLocalEntry,
} from "./characterLocalStore";

import { cloneCharacterHistory } from "./characterHistoryCodec";

import {
  combineHistories,
  deepEqual,
  type CharacterHistory,
} from "./characterRevision";

export type CharacterRoomImportSource = "current" | "legacy";

export type CharacterRoomImportIssue =
  | {
      kind: "malformed-room-key";

      source: CharacterRoomImportSource;

      key: string;

      message: string;
    }
  | {
      kind: "malformed-room-record";

      source: CharacterRoomImportSource;

      key: string;

      characterId: string;

      message: string;
    }
  | {
      kind: "room-history-conflict";

      characterId: string;

      message: string;
    }
  | {
      kind: "local-read-failed";

      characterId: string;

      message: string;

      error: unknown;
    }
  | {
      kind: "local-history-conflict";

      characterId: string;

      message: string;
    }
  | {
      kind: "local-write-failed";

      characterId: string;

      message: string;

      error: unknown;
    };

export interface CharacterRoomImportScan {
  histories: CharacterHistory[];

  issues: CharacterRoomImportIssue[];

  /**
   * Character IDs for which room sources could not safely
   * be represented as one revision history.
   */
  blockedCharacterIds: string[];
}

export interface CharacterRoomImportResult {
  importedCharacterIds: string[];

  unchangedCharacterIds: string[];

  blockedCharacterIds: string[];

  issues: CharacterRoomImportIssue[];
}

export interface CharacterRoomImportLocalStore {
  readonly roomId: string;

  get(characterId: string): CharacterLocalEntry | undefined;

  put(entry: CharacterLocalEntry): CharacterLocalEntry;
}

export interface CharacterRoomImportSourceStore {
  getMetadata(): Promise<RoomMetadata>;
}

export class CharacterRoomImportError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);

    this.name = "CharacterRoomImportError";
  }
}

function characterIdFromPrefixedKey(
  key: string,
  prefix: string,
): string | undefined {
  if (!key.startsWith(prefix)) {
    return undefined;
  }

  const characterId = key.slice(prefix.length);

  return characterId || undefined;
}

function sourceForKey(key: string):
  | {
      source: CharacterRoomImportSource;

      prefix: string;
    }
  | undefined {
  if (key.startsWith(CHARACTER_KEY_PREFIX)) {
    return {
      source: "current",
      prefix: CHARACTER_KEY_PREFIX,
    };
  }

  if (key.startsWith(LEGACY_CHARACTER_KEY_PREFIX)) {
    return {
      source: "legacy",
      prefix: LEGACY_CHARACTER_KEY_PREFIX,
    };
  }

  return undefined;
}

function historyFromRecord(record: StoredCharacterRecord): CharacterHistory {
  return {
    formatVersion: 1,

    characterId: record.id,

    revisions: {
      [record.writeId]: record,
    },

    heads: [record.writeId],
  };
}

function canonicalHistory(history: CharacterHistory): CharacterHistory {
  const copy = cloneCharacterHistory(history);

  copy.heads.sort((left, right) => left.localeCompare(right));

  return copy;
}

function historiesEquivalent(
  left: CharacterHistory,
  right: CharacterHistory,
): boolean {
  return deepEqual(canonicalHistory(left), canonicalHistory(right));
}

function localEntryForImport(
  roomId: string,
  history: CharacterHistory,
): CharacterLocalEntry {
  const canonical = canonicalHistory(history);

  return {
    formatVersion: LOCAL_CHARACTER_ENTRY_FORMAT_VERSION,

    roomId,

    characterId: canonical.characterId,

    history: canonical,

    /*
     * Imported room state has not yet been confirmed in
     * scene metadata.
     *
     * The coordinator/executor will clear these after
     * successful scene confirmation.
     */
    sync: {
      pendingRevisionIds: [...canonical.heads],
    },
  };
}

/**
 * Read both room Character namespaces as independent
 * migration sources.
 *
 * This function is pure with respect to storage. It never
 * alters the supplied metadata.
 */
export function scanRoomCharacterHistories(
  metadata: RoomMetadata,
): CharacterRoomImportScan {
  const histories = new Map<string, CharacterHistory>();

  const blocked = new Set<string>();

  const issues: CharacterRoomImportIssue[] = [];

  for (const [key, value] of Object.entries(metadata)) {
    const sourceInfo = sourceForKey(key);

    if (!sourceInfo) {
      continue;
    }

    const characterId = characterIdFromPrefixedKey(key, sourceInfo.prefix);

    if (!characterId) {
      issues.push({
        kind: "malformed-room-key",

        source: sourceInfo.source,

        key,

        message: "Room Character metadata key has no Character ID.",
      });

      continue;
    }

    const record = parseCharacterRecord(value, characterId);

    if (!record) {
      issues.push({
        kind: "malformed-room-record",

        source: sourceInfo.source,

        key,

        characterId,

        message:
          "Room Character record is malformed and was preserved without import.",
      });

      continue;
    }

    if (blocked.has(characterId)) {
      continue;
    }

    const candidate = historyFromRecord(record);

    const existing = histories.get(characterId);

    if (!existing) {
      histories.set(characterId, candidate);

      continue;
    }

    const combined = combineHistories(existing, candidate);

    if (combined.status === "conflict") {
      histories.delete(characterId);

      blocked.add(characterId);

      issues.push({
        kind: "room-history-conflict",

        characterId,

        message: combined.reason,
      });

      continue;
    }

    histories.set(characterId, canonicalHistory(combined.history));
  }

  return {
    histories: [...histories.values()].sort((left, right) =>
      left.characterId.localeCompare(right.characterId),
    ),

    issues,

    blockedCharacterIds: [...blocked].sort(),
  };
}

/**
 * Import a room metadata snapshot into durable local
 * Character histories.
 *
 * Existing local history is unioned with room history.
 *
 * No room values are modified.
 *
 * No scene values are modified.
 */
export function importRoomCharacterMetadataToLocal(
  metadata: RoomMetadata,

  localStore: CharacterRoomImportLocalStore,
): CharacterRoomImportResult {
  const scan = scanRoomCharacterHistories(metadata);

  const issues = [...scan.issues];

  const imported = new Set<string>();

  const unchanged = new Set<string>();

  const blocked = new Set<string>(scan.blockedCharacterIds);

  for (const roomHistory of scan.histories) {
    const characterId = roomHistory.characterId;

    let existing: CharacterLocalEntry | undefined;

    try {
      existing = localStore.get(characterId);
    } catch (error) {
      blocked.add(characterId);

      issues.push({
        kind: "local-read-failed",

        characterId,

        message:
          "Existing local Character history could not be read and was not overwritten.",

        error,
      });

      continue;
    }

    let desiredHistory = roomHistory;

    if (existing) {
      const combined = combineHistories(existing.history, roomHistory);

      if (combined.status === "conflict") {
        blocked.add(characterId);

        issues.push({
          kind: "local-history-conflict",

          characterId,

          message: combined.reason,
        });

        continue;
      }

      desiredHistory = canonicalHistory(combined.history);

      if (historiesEquivalent(existing.history, desiredHistory)) {
        /*
         * Do not rewrite an identical local history.
         *
         * In particular, preserve whatever pending state
         * already exists. The importer must never clear
         * synchronization state.
         */
        unchanged.add(characterId);

        continue;
      }
    }

    const entry = localEntryForImport(localStore.roomId, desiredHistory);

    try {
      localStore.put(entry);

      imported.add(characterId);
    } catch (error) {
      blocked.add(characterId);

      issues.push({
        kind: "local-write-failed",

        characterId,

        message: "Imported Character history could not be saved locally.",

        error,
      });
    }
  }

  return {
    importedCharacterIds: [...imported].sort(),

    unchangedCharacterIds: [...unchanged].sort(),

    blockedCharacterIds: [...blocked].sort(),

    issues,
  };
}

/**
 * Convenience wrapper for the real room metadata source.
 */
export async function importRoomCharactersToLocal(
  roomStore: CharacterRoomImportSourceStore,

  localStore: CharacterRoomImportLocalStore,
): Promise<CharacterRoomImportResult> {
  let metadata: RoomMetadata;

  try {
    metadata = await roomStore.getMetadata();
  } catch (error) {
    throw new CharacterRoomImportError(
      "DWTools could not read room Character records for migration.",
      {
        cause: error,
      },
    );
  }

  return importRoomCharacterMetadataToLocal(metadata, localStore);
}
