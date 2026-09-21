import { EXTENSION_ID } from "./constants";
import {
  parseCharacterLocalEntry,
  type CharacterLocalEntry,
} from "./characterLocalStore";
import {
  CharacterRepositoryError,
  type CharacterRecord,
} from "./characterRepository";
import { deepEqual } from "./characterRevision";

export const CHARACTER_TRANSFER_JOURNAL_FORMAT_VERSION = 1;
const CHARACTER_TRANSFER_JOURNAL_PREFIX = `${EXTENSION_ID}/character-transfer-journal/v1/`;

export interface CharacterTransferJournal {
  formatVersion: typeof CHARACTER_TRANSFER_JOURNAL_FORMAT_VERSION;
  roomId: string;
  transactionId: string;
  createdAt: string;
  sourceCharacterId: string;
  destinationCharacterId: string;
  sourceBefore: CharacterLocalEntry;
  sourceAfter: CharacterLocalEntry;
  destinationBefore: CharacterLocalEntry;
  destinationAfter: CharacterLocalEntry;
}

export interface CharacterTransferJournalStorage {
  readonly roomId: string;
  get(): CharacterTransferJournal | undefined;
  put(journal: CharacterTransferJournal): CharacterTransferJournal;
  clear(transactionId: string): void;
}

export interface CharacterTransferRecoveryStore {
  readonly roomId: string;
  get(characterId: string): CharacterLocalEntry | undefined;
  put(entry: CharacterLocalEntry): CharacterLocalEntry;
}

export type CharacterTransferRecoveryResult =
  | { status: "none" }
  | {
      status: "recovered";
      transactionId: string;
      source: CharacterRecord;
      destination: CharacterRecord;
    };

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function malformed(message: string): never {
  throw new CharacterRepositoryError("MALFORMED", message);
}

export function characterTransferJournalStorageKey(roomId: string): string {
  if (!roomId.trim()) {
    throw new CharacterRepositoryError(
      "VALIDATION",
      "A room ID is required for the Character transfer journal.",
    );
  }
  return CHARACTER_TRANSFER_JOURNAL_PREFIX + encodeURIComponent(roomId);
}

function validateJournalSide(
  before: CharacterLocalEntry,
  after: CharacterLocalEntry,
  characterId: string,
): CharacterRecord {
  if (before.history.heads.length !== 1 || after.history.heads.length !== 1) {
    return malformed("Transfer journal histories must each have one head.");
  }
  const beforeHead = before.history.heads[0];
  const afterHead = after.history.heads[0];
  if (afterHead in before.history.revisions) {
    return malformed("Transfer journal after revision must be new.");
  }
  const beforeIds = Object.keys(before.history.revisions);
  const afterIds = Object.keys(after.history.revisions);
  if (afterIds.length !== beforeIds.length + 1) {
    return malformed(
      "Transfer journal after state must add exactly one revision.",
    );
  }
  for (const writeId of beforeIds) {
    if (
      !deepEqual(
        before.history.revisions[writeId],
        after.history.revisions[writeId],
      )
    ) {
      return malformed(
        "Transfer journal cannot alter immutable prior revisions.",
      );
    }
  }
  const record = after.history.revisions[afterHead];
  if (!record || record.deleted === true) {
    return malformed(
      "Transfer journal after head must be an active Character revision.",
    );
  }
  if (!deepEqual(record.parents, [beforeHead])) {
    return malformed(
      "Transfer journal after revision must descend from the before head.",
    );
  }
  if (!deepEqual(after.sync.pendingRevisionIds, [afterHead])) {
    return malformed(
      "Transfer journal after head must be the only pending revision.",
    );
  }
  if (record.id !== characterId) {
    return malformed(
      "Transfer journal revision belongs to the wrong Character.",
    );
  }
  return record;
}

export function parseCharacterTransferJournal(
  value: unknown,
  expectedRoomId: string,
): CharacterTransferJournal {
  if (!isObject(value))
    malformed("Character transfer journal must be an object.");
  if (value.formatVersion !== CHARACTER_TRANSFER_JOURNAL_FORMAT_VERSION) {
    malformed("Character transfer journal format is unsupported.");
  }
  const strings = [
    "roomId",
    "transactionId",
    "createdAt",
    "sourceCharacterId",
    "destinationCharacterId",
  ] as const;
  for (const key of strings) {
    if (typeof value[key] !== "string" || !value[key].trim()) {
      malformed(`Character transfer journal requires ${key}.`);
    }
  }
  const roomId = value.roomId as string;
  const sourceCharacterId = value.sourceCharacterId as string;
  const destinationCharacterId = value.destinationCharacterId as string;
  if (roomId !== expectedRoomId)
    malformed("Character transfer journal belongs to another room.");
  if (sourceCharacterId === destinationCharacterId) {
    malformed(
      "Character transfer journal requires different source and destination Characters.",
    );
  }
  let sourceBefore: CharacterLocalEntry;
  let sourceAfter: CharacterLocalEntry;
  let destinationBefore: CharacterLocalEntry;
  let destinationAfter: CharacterLocalEntry;
  try {
    sourceBefore = parseCharacterLocalEntry(
      value.sourceBefore,
      roomId,
      sourceCharacterId,
    );
    sourceAfter = parseCharacterLocalEntry(
      value.sourceAfter,
      roomId,
      sourceCharacterId,
    );
    destinationBefore = parseCharacterLocalEntry(
      value.destinationBefore,
      roomId,
      destinationCharacterId,
    );
    destinationAfter = parseCharacterLocalEntry(
      value.destinationAfter,
      roomId,
      destinationCharacterId,
    );
  } catch (error) {
    throw new CharacterRepositoryError(
      "MALFORMED",
      "Character transfer journal contains an invalid local entry.",
      undefined,
      { cause: error },
    );
  }
  validateJournalSide(sourceBefore, sourceAfter, sourceCharacterId);
  validateJournalSide(
    destinationBefore,
    destinationAfter,
    destinationCharacterId,
  );
  return {
    formatVersion: CHARACTER_TRANSFER_JOURNAL_FORMAT_VERSION,
    roomId,
    transactionId: value.transactionId as string,
    createdAt: value.createdAt as string,
    sourceCharacterId,
    destinationCharacterId,
    sourceBefore,
    sourceAfter,
    destinationBefore,
    destinationAfter,
  };
}

export class CharacterTransferJournalStore implements CharacterTransferJournalStorage {
  constructor(
    private readonly storage: Storage,
    readonly roomId: string,
  ) {
    characterTransferJournalStorageKey(roomId);
  }

  get(): CharacterTransferJournal | undefined {
    let serialized: string | null;
    try {
      serialized = this.storage.getItem(
        characterTransferJournalStorageKey(this.roomId),
      );
    } catch (error) {
      throw new CharacterRepositoryError(
        "API",
        "DWTools could not read the Character transfer recovery journal.",
        undefined,
        { cause: error },
      );
    }
    if (serialized === null) return undefined;
    try {
      return parseCharacterTransferJournal(JSON.parse(serialized), this.roomId);
    } catch (error) {
      if (
        error instanceof CharacterRepositoryError &&
        error.code === "MALFORMED"
      )
        throw error;
      throw new CharacterRepositoryError(
        "MALFORMED",
        "Character transfer recovery journal is malformed.",
        undefined,
        { cause: error },
      );
    }
  }

  put(journal: CharacterTransferJournal): CharacterTransferJournal {
    const normalized = parseCharacterTransferJournal(journal, this.roomId);
    try {
      this.storage.setItem(
        characterTransferJournalStorageKey(this.roomId),
        JSON.stringify(normalized),
      );
    } catch (error) {
      throw new CharacterRepositoryError(
        "API",
        "DWTools could not save the Character transfer recovery journal.",
        undefined,
        { cause: error },
      );
    }
    return normalized;
  }

  clear(transactionId: string): void {
    const current = this.get();
    if (!current) return;
    if (current.transactionId !== transactionId) {
      throw new CharacterRepositoryError(
        "CONFLICT",
        "A different Character transfer recovery journal is active.",
      );
    }
    try {
      this.storage.removeItem(characterTransferJournalStorageKey(this.roomId));
    } catch (error) {
      throw new CharacterRepositoryError(
        "API",
        "DWTools could not clear the Character transfer recovery journal.",
        undefined,
        { cause: error },
      );
    }
  }
}

export function createBrowserCharacterTransferJournalStore(
  roomId: string,
): CharacterTransferJournalStore {
  return new CharacterTransferJournalStore(window.localStorage, roomId);
}

type RecoveryClassification = "before" | "after" | "unsafe";

function classify(
  current: CharacterLocalEntry | undefined,
  before: CharacterLocalEntry,
  after: CharacterLocalEntry,
): RecoveryClassification {
  if (!current) return "unsafe";
  if (deepEqual(current.history, before.history)) return "before";
  const afterHead = after.history.heads[0];
  return deepEqual(
    current.history.revisions[afterHead],
    after.history.revisions[afterHead],
  )
    ? "after"
    : "unsafe";
}

function expectedAfterRecord(entry: CharacterLocalEntry): CharacterRecord {
  return entry.history.revisions[entry.history.heads[0]] as CharacterRecord;
}

export function recoverCharacterTransferJournal(
  store: CharacterTransferRecoveryStore,
  journalStore: CharacterTransferJournalStorage,
): CharacterTransferRecoveryResult {
  if (store.roomId !== journalStore.roomId) {
    throw new CharacterRepositoryError(
      "VALIDATION",
      "Character transfer recovery stores must belong to the same room.",
    );
  }
  const journal = journalStore.get();
  if (!journal) return { status: "none" };
  let sourceCurrent: CharacterLocalEntry | undefined;
  let destinationCurrent: CharacterLocalEntry | undefined;
  try {
    sourceCurrent = store.get(journal.sourceCharacterId);
    destinationCurrent = store.get(journal.destinationCharacterId);
  } catch (error) {
    throw new CharacterRepositoryError(
      "CONFLICT",
      "Character transfer recovery could not safely inspect current state.",
      { transactionId: journal.transactionId },
      { cause: error },
    );
  }
  const sourceState = classify(
    sourceCurrent,
    journal.sourceBefore,
    journal.sourceAfter,
  );
  const destinationState = classify(
    destinationCurrent,
    journal.destinationBefore,
    journal.destinationAfter,
  );
  if (sourceState === "unsafe" || destinationState === "unsafe") {
    throw new CharacterRepositoryError(
      "CONFLICT",
      "Character transfer recovery found incompatible Character history.",
      { transactionId: journal.transactionId },
    );
  }
  if (sourceState === "before") store.put(journal.sourceAfter);
  if (destinationState === "before") store.put(journal.destinationAfter);
  let sourceAfter: CharacterLocalEntry | undefined;
  let destinationAfter: CharacterLocalEntry | undefined;
  try {
    sourceAfter = store.get(journal.sourceCharacterId);
    destinationAfter = store.get(journal.destinationCharacterId);
  } catch (error) {
    throw new CharacterRepositoryError(
      "CONFLICT",
      "Character transfer recovery could not confirm both intended revisions.",
      { transactionId: journal.transactionId },
      { cause: error },
    );
  }
  if (
    classify(sourceAfter, journal.sourceBefore, journal.sourceAfter) !==
      "after" ||
    classify(
      destinationAfter,
      journal.destinationBefore,
      journal.destinationAfter,
    ) !== "after"
  ) {
    throw new CharacterRepositoryError(
      "CONFLICT",
      "Character transfer recovery could not confirm both intended revisions.",
      { transactionId: journal.transactionId },
    );
  }
  journalStore.clear(journal.transactionId);
  return {
    status: "recovered",
    transactionId: journal.transactionId,
    source: expectedAfterRecord(journal.sourceAfter),
    destination: expectedAfterRecord(journal.destinationAfter),
  };
}
