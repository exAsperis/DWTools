import { EXTENSION_ID } from "./constants";

import { parseCharacterHistory } from "./characterHistoryCodec";

import type { CharacterHistory } from "./characterRevision";

export const LOCAL_CHARACTER_ENTRY_FORMAT_VERSION = 1;

const LOCAL_CHARACTER_STORAGE_PREFIX = `${EXTENSION_ID}/character-local/v1/`;

const LOCAL_CHARACTER_CHANNEL_PREFIX = `${EXTENSION_ID}/character-local-changes/v1/`;

export interface CharacterLocalSyncState {
  pendingRevisionIds: string[];
}

export interface CharacterLocalEntry {
  formatVersion: typeof LOCAL_CHARACTER_ENTRY_FORMAT_VERSION;

  roomId: string;
  characterId: string;

  history: CharacterHistory;

  sync: CharacterLocalSyncState;
}

export type CharacterLocalStoreErrorCode =
  "READ" | "WRITE" | "MALFORMED" | "VALIDATION";

export class CharacterLocalStoreError extends Error {
  constructor(
    readonly code: CharacterLocalStoreErrorCode,
    message: string,
    readonly details?: Record<string, unknown>,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = "CharacterLocalStoreError";
  }
}

export interface CharacterLocalStoreIssue {
  key: string;
  characterId?: string;
  code: CharacterLocalStoreErrorCode;
  message: string;
}

export interface CharacterLocalStoreScan {
  entries: CharacterLocalEntry[];
  issues: CharacterLocalStoreIssue[];
}

export type CharacterLocalChangeSource = "local" | "broadcast";

export interface CharacterLocalChange {
  characterId: string;
  source: CharacterLocalChangeSource;
}

export interface CharacterLocalChangeMessage {
  formatVersion: 1;
  roomId: string;
  characterId: string;
  sourceId: string;
}

export interface CharacterLocalChangeBus {
  postMessage(message: CharacterLocalChangeMessage): void;

  subscribe(callback: (message: unknown) => void): () => void;

  close(): void;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizePendingRevisionIds(
  value: unknown,
  history: CharacterHistory,
): string[] {
  if (!Array.isArray(value)) {
    throw new CharacterLocalStoreError(
      "VALIDATION",
      "Local Character sync state requires pending revision IDs.",
      {
        characterId: history.characterId,
      },
    );
  }

  const pendingRevisionIds: string[] = [];
  const seen = new Set<string>();

  for (const revisionId of value) {
    if (
      typeof revisionId !== "string" ||
      revisionId.length === 0 ||
      seen.has(revisionId) ||
      !(revisionId in history.revisions)
    ) {
      throw new CharacterLocalStoreError(
        "VALIDATION",
        "Local Character sync state contains an invalid pending revision ID.",
        {
          characterId: history.characterId,
          revisionId,
        },
      );
    }

    seen.add(revisionId);
    pendingRevisionIds.push(revisionId);
  }

  return pendingRevisionIds;
}

export function characterLocalStorageRoomPrefix(roomId: string): string {
  if (!roomId) {
    throw new CharacterLocalStoreError(
      "VALIDATION",
      "A room ID is required for Character local storage.",
    );
  }

  return LOCAL_CHARACTER_STORAGE_PREFIX + encodeURIComponent(roomId) + "/";
}

export function characterLocalStorageKey(
  roomId: string,
  characterId: string,
): string {
  if (!characterId) {
    throw new CharacterLocalStoreError(
      "VALIDATION",
      "A Character ID is required for Character local storage.",
    );
  }

  return (
    characterLocalStorageRoomPrefix(roomId) + encodeURIComponent(characterId)
  );
}

export function characterIdFromLocalStorageKey(
  roomId: string,
  key: string,
): string | undefined {
  const prefix = characterLocalStorageRoomPrefix(roomId);

  if (!key.startsWith(prefix)) {
    return undefined;
  }

  const encoded = key.slice(prefix.length);

  if (!encoded) return undefined;

  try {
    const characterId = decodeURIComponent(encoded);

    return characterId || undefined;
  } catch {
    return undefined;
  }
}

export function parseCharacterLocalEntry(
  value: unknown,
  expectedRoomId: string,
  expectedCharacterId?: string,
): CharacterLocalEntry {
  if (!isObject(value)) {
    throw new CharacterLocalStoreError(
      "VALIDATION",
      "Local Character entry must be an object.",
    );
  }

  if (value.formatVersion !== LOCAL_CHARACTER_ENTRY_FORMAT_VERSION) {
    throw new CharacterLocalStoreError(
      "VALIDATION",
      "Unsupported local Character entry format.",
      {
        formatVersion: value.formatVersion,
      },
    );
  }

  if (typeof value.roomId !== "string" || value.roomId !== expectedRoomId) {
    throw new CharacterLocalStoreError(
      "VALIDATION",
      "Local Character entry belongs to a different room.",
      {
        expectedRoomId,
        actualRoomId: value.roomId,
      },
    );
  }

  if (typeof value.characterId !== "string" || value.characterId.length === 0) {
    throw new CharacterLocalStoreError(
      "VALIDATION",
      "Local Character entry requires a Character ID.",
    );
  }

  if (
    expectedCharacterId !== undefined &&
    value.characterId !== expectedCharacterId
  ) {
    throw new CharacterLocalStoreError(
      "VALIDATION",
      "Local Character entry belongs to a different Character.",
      {
        expectedCharacterId,
        actualCharacterId: value.characterId,
      },
    );
  }

  let history: CharacterHistory;

  try {
    history = parseCharacterHistory(value.history, value.characterId);
  } catch (error) {
    throw new CharacterLocalStoreError(
      "VALIDATION",
      "Local Character entry contains invalid revision history.",
      {
        characterId: value.characterId,
      },
      { cause: error },
    );
  }

  if (!isObject(value.sync)) {
    throw new CharacterLocalStoreError(
      "VALIDATION",
      "Local Character entry requires synchronization state.",
      {
        characterId: value.characterId,
      },
    );
  }

  return {
    formatVersion: LOCAL_CHARACTER_ENTRY_FORMAT_VERSION,
    roomId: expectedRoomId,
    characterId: value.characterId,
    history,
    sync: {
      pendingRevisionIds: normalizePendingRevisionIds(
        value.sync.pendingRevisionIds,
        history,
      ),
    },
  };
}

function parseSerializedEntry(
  serialized: string,
  roomId: string,
  characterId: string,
): CharacterLocalEntry {
  let value: unknown;

  try {
    value = JSON.parse(serialized);
  } catch (error) {
    throw new CharacterLocalStoreError(
      "MALFORMED",
      "Stored local Character entry is not valid JSON.",
      {
        roomId,
        characterId,
      },
      { cause: error },
    );
  }

  try {
    return parseCharacterLocalEntry(value, roomId, characterId);
  } catch (error) {
    throw new CharacterLocalStoreError(
      "MALFORMED",
      "Stored local Character entry is invalid.",
      {
        roomId,
        characterId,
      },
      { cause: error },
    );
  }
}

function isChangeMessage(value: unknown): value is CharacterLocalChangeMessage {
  if (!isObject(value)) return false;

  return (
    value.formatVersion === 1 &&
    typeof value.roomId === "string" &&
    typeof value.characterId === "string" &&
    value.characterId.length > 0 &&
    typeof value.sourceId === "string" &&
    value.sourceId.length > 0
  );
}

export class CharacterLocalStore {
  private readonly listeners = new Set<
    (change: CharacterLocalChange) => void
  >();

  private readonly unsubscribeBus: (() => void) | undefined;

  private closed = false;

  constructor(
    private readonly storage: Storage,
    readonly roomId: string,
    private readonly bus?: CharacterLocalChangeBus,
    private readonly instanceId: string = crypto.randomUUID(),
  ) {
    characterLocalStorageRoomPrefix(roomId);

    this.unsubscribeBus = this.bus?.subscribe((message) => {
      if (
        this.closed ||
        !isChangeMessage(message) ||
        message.roomId !== this.roomId ||
        message.sourceId === this.instanceId
      ) {
        return;
      }

      this.notify({
        characterId: message.characterId,
        source: "broadcast",
      });
    });
  }

  get(characterId: string): CharacterLocalEntry | undefined {
    const key = characterLocalStorageKey(this.roomId, characterId);

    let serialized: string | null;

    try {
      serialized = this.storage.getItem(key);
    } catch (error) {
      throw new CharacterLocalStoreError(
        "READ",
        "DWTools could not read local Character storage.",
        {
          roomId: this.roomId,
          characterId,
          key,
        },
        { cause: error },
      );
    }

    if (serialized === null) {
      return undefined;
    }

    return parseSerializedEntry(serialized, this.roomId, characterId);
  }

  scan(): CharacterLocalStoreScan {
    const entries: CharacterLocalEntry[] = [];
    const issues: CharacterLocalStoreIssue[] = [];

    const prefix = characterLocalStorageRoomPrefix(this.roomId);

    let keys: string[];

    try {
      keys = Array.from(
        {
          length: this.storage.length,
        },
        (_, index) => this.storage.key(index),
      ).filter(
        (key): key is string =>
          typeof key === "string" && key.startsWith(prefix),
      );
    } catch (error) {
      throw new CharacterLocalStoreError(
        "READ",
        "DWTools could not enumerate local Character storage.",
        {
          roomId: this.roomId,
        },
        { cause: error },
      );
    }

    keys.sort();

    for (const key of keys) {
      const characterId = characterIdFromLocalStorageKey(this.roomId, key);

      if (!characterId) {
        issues.push({
          key,
          code: "MALFORMED",
          message: "Local Character storage key is malformed.",
        });
        continue;
      }

      let serialized: string | null;

      try {
        serialized = this.storage.getItem(key);
      } catch (error) {
        issues.push({
          key,
          characterId,
          code: "READ",
          message:
            error instanceof Error
              ? error.message
              : "Local Character entry could not be read.",
        });
        continue;
      }

      if (serialized === null) {
        continue;
      }

      try {
        entries.push(
          parseSerializedEntry(serialized, this.roomId, characterId),
        );
      } catch (error) {
        issues.push({
          key,
          characterId,
          code:
            error instanceof CharacterLocalStoreError
              ? error.code
              : "MALFORMED",
          message:
            error instanceof Error
              ? error.message
              : "Local Character entry is malformed.",
        });
      }
    }

    entries.sort((left, right) =>
      left.characterId.localeCompare(right.characterId),
    );

    return { entries, issues };
  }

  put(entry: CharacterLocalEntry): CharacterLocalEntry {
    if (this.closed) {
      throw new CharacterLocalStoreError(
        "WRITE",
        "Character local storage is closed.",
      );
    }

    let normalized: CharacterLocalEntry;

    try {
      normalized = parseCharacterLocalEntry(
        entry,
        this.roomId,
        entry.characterId,
      );
    } catch (error) {
      if (error instanceof CharacterLocalStoreError) {
        throw error;
      }

      throw new CharacterLocalStoreError(
        "VALIDATION",
        "Character local entry is invalid.",
        undefined,
        { cause: error },
      );
    }

    const key = characterLocalStorageKey(this.roomId, normalized.characterId);

    let serialized: string;

    try {
      serialized = JSON.stringify(normalized);
    } catch (error) {
      throw new CharacterLocalStoreError(
        "WRITE",
        "DWTools could not serialize local Character data.",
        {
          roomId: this.roomId,
          characterId: normalized.characterId,
        },
        { cause: error },
      );
    }

    try {
      this.storage.setItem(key, serialized);
    } catch (error) {
      throw new CharacterLocalStoreError(
        "WRITE",
        "DWTools could not save local Character data.",
        {
          roomId: this.roomId,
          characterId: normalized.characterId,
          key,
        },
        { cause: error },
      );
    }

    this.notify({
      characterId: normalized.characterId,
      source: "local",
    });

    try {
      this.bus?.postMessage({
        formatVersion: 1,
        roomId: this.roomId,
        characterId: normalized.characterId,
        sourceId: this.instanceId,
      });
    } catch {
      /*
       * Persistence already succeeded.
       * A notification failure must not
       * turn a successful durable write
       * into a reported storage failure.
       */
    }

    return normalized;
  }

  subscribe(callback: (change: CharacterLocalChange) => void): () => void {
    this.listeners.add(callback);

    return () => this.listeners.delete(callback);
  }

  close(): void {
    if (this.closed) return;

    this.closed = true;

    this.unsubscribeBus?.();
    this.bus?.close();
    this.listeners.clear();
  }

  private notify(change: CharacterLocalChange): void {
    for (const listener of this.listeners) {
      listener(change);
    }
  }
}

export class BroadcastCharacterLocalChangeBus implements CharacterLocalChangeBus {
  private readonly channel: BroadcastChannel;

  constructor(roomId: string) {
    this.channel = new BroadcastChannel(
      LOCAL_CHARACTER_CHANNEL_PREFIX + encodeURIComponent(roomId),
    );
  }

  postMessage(message: CharacterLocalChangeMessage): void {
    this.channel.postMessage(message);
  }

  subscribe(callback: (message: unknown) => void): () => void {
    const listener = (event: MessageEvent<unknown>) => callback(event.data);

    this.channel.addEventListener("message", listener);

    return () => this.channel.removeEventListener("message", listener);
  }

  close(): void {
    this.channel.close();
  }
}

export function createBrowserCharacterLocalStore(
  roomId: string,
): CharacterLocalStore {
  const bus =
    typeof BroadcastChannel === "function"
      ? new BroadcastCharacterLocalChangeBus(roomId)
      : undefined;

  return new CharacterLocalStore(
    window.localStorage,
    roomId,
    bus,
    crypto.randomUUID(),
  );
}
