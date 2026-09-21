import {
  CHARACTER_RECORD_SCHEMA_VERSION,
  CharacterRepositoryError,
  type CharacterRecord,
  type CharacterTombstone,
  type StoredCharacterRecord,
} from "./characterRepository";
import {
  LOCAL_CHARACTER_ENTRY_FORMAT_VERSION,
  type CharacterLocalEntry,
  type CharacterLocalStoreScan,
  type CharacterLocalChange,
} from "./characterLocalStore";
import type { CharacterMutationLock } from "./characterMutationLock";
import {
  CHARACTER_TRANSFER_JOURNAL_FORMAT_VERSION,
  recoverCharacterTransferJournal,
  type CharacterTransferJournal,
  type CharacterTransferJournalStorage,
  type CharacterTransferRecoveryResult,
} from "./characterTransferJournal";
import {
  mergeCreatureFieldPatch,
  normalizeCreatureFields,
} from "./creatureFields";
import type { CreatureFieldPatch, CreatureFields } from "./constants";
import {
  findSelectedInventoryIndex,
  normalizeInventory,
  normalizeInventoryItem,
  type InventoryItem,
  type InventorySelection,
} from "./inventory";
import { adjustedHp } from "./hp";
import type { CharacterHistory } from "./characterRevision";
import type { CharacterRepositoryConflict } from "./characterRepositoryContract";

export interface CharacterLocalMutationStore {
  readonly roomId: string;
  get(characterId: string): CharacterLocalEntry | undefined;
  scan(): CharacterLocalStoreScan;
  put(entry: CharacterLocalEntry): CharacterLocalEntry;
  subscribe?(callback: (change: CharacterLocalChange) => void): () => void;
}

export interface CharacterLocalRepositoryOptions {
  getActorId: () => Promise<string>;
  mutationLock: CharacterMutationLock;
  now?: () => Date;
  randomUUID?: () => string;
  transferJournal?: CharacterTransferJournalStorage;
}

export type CharacterLocalLookup =
  | { status: "active"; record: CharacterRecord; history: CharacterHistory }
  | { status: "deleted"; record: CharacterTombstone; history: CharacterHistory }
  | { status: "conflict"; history: CharacterHistory }
  | { status: "missing" };

function sortedHeads(history: CharacterHistory): string[] {
  return [...history.heads].sort((left, right) => left.localeCompare(right));
}

function currentRecord(
  entry: CharacterLocalEntry,
): StoredCharacterRecord | undefined {
  if (entry.history.heads.length !== 1) return undefined;
  return entry.history.revisions[entry.history.heads[0]];
}

function activeLookup(entry: CharacterLocalEntry): CharacterLocalLookup {
  if (entry.history.heads.length !== 1) {
    return { status: "conflict", history: entry.history };
  }
  const record = currentRecord(entry);
  if (!record) {
    throw new CharacterRepositoryError(
      "MALFORMED",
      "Local Character history has a missing head revision.",
      { characterId: entry.characterId, heads: entry.history.heads },
    );
  }
  return record.deleted
    ? { status: "deleted", record, history: entry.history }
    : { status: "active", record, history: entry.history };
}

export class CharacterLocalRepository {
  private readonly now: () => Date;
  private readonly randomUUID: () => string;

  constructor(
    private readonly store: CharacterLocalMutationStore,
    private readonly options: CharacterLocalRepositoryOptions,
  ) {
    this.now = options.now ?? (() => new Date());
    this.randomUUID = options.randomUUID ?? (() => crypto.randomUUID());
  }

  async list(): Promise<CharacterRecord[]> {
    const scan = this.store.scan();
    if (scan.issues.length) {
      throw new CharacterRepositoryError(
        "MALFORMED",
        "Local Character storage contains malformed entries.",
        { issues: scan.issues },
      );
    }
    return scan.entries
      .flatMap((entry) => {
        const lookup = activeLookup(entry);
        return lookup.status === "active" ? [lookup.record] : [];
      })
      .sort((left, right) =>
        left.fields.name.localeCompare(right.fields.name, undefined, {
          sensitivity: "base",
        }),
      );
  }

  async listConflicts(): Promise<CharacterRepositoryConflict[]> {
    const scan = this.store.scan();
    if (scan.issues.length) {
      throw new CharacterRepositoryError(
        "MALFORMED",
        "Local Character storage contains malformed entries.",
        { issues: scan.issues },
      );
    }
    return scan.entries
      .filter((entry) => entry.history.heads.length > 1)
      .map((entry) => ({
        characterId: entry.characterId,
        history: entry.history,
      }))
      .sort((left, right) => left.characterId.localeCompare(right.characterId));
  }

  async inspect(characterId: string): Promise<CharacterLocalLookup> {
    const entry = this.store.get(characterId);
    return entry ? activeLookup(entry) : { status: "missing" };
  }

  async read(characterId: string): Promise<StoredCharacterRecord | undefined> {
    const lookup = await this.inspect(characterId);
    return lookup.status === "active" || lookup.status === "deleted"
      ? lookup.record
      : undefined;
  }

  async create(fields: CreatureFields): Promise<CharacterRecord> {
    const normalized = normalizeCreatureFields(fields);
    return this.withLock(async () => {
      const characterId = this.randomUUID();
      if (this.store.get(characterId)) {
        throw new CharacterRepositoryError(
          "CONFLICT",
          "A Character with the generated ID already exists.",
          { characterId },
        );
      }
      const actorId = await this.options.getActorId();
      const timestamp = this.now().toISOString();
      const record: CharacterRecord = {
        schemaVersion: CHARACTER_RECORD_SCHEMA_VERSION,
        id: characterId,
        fields: normalized,
        revision: 1,
        parents: [],
        createdAt: timestamp,
        createdBy: actorId,
        updatedAt: timestamp,
        updatedBy: actorId,
        writeId: this.randomUUID(),
      };
      this.store.put({
        formatVersion: LOCAL_CHARACTER_ENTRY_FORMAT_VERSION,
        roomId: this.store.roomId,
        characterId,
        history: {
          formatVersion: 1,
          characterId,
          revisions: { [record.writeId]: record },
          heads: [record.writeId],
        },
        sync: { pendingRevisionIds: [record.writeId] },
      });
      return record;
    });
  }

  async patch(
    characterId: string,
    patch: CreatureFieldPatch,
  ): Promise<CharacterRecord> {
    return this.mutateActive(characterId, (current) => ({
      ...current,
      fields: mergeCreatureFieldPatch(current.fields, patch),
    }));
  }

  async replace(
    characterId: string,
    fields: CreatureFields,
  ): Promise<CharacterRecord> {
    const normalized = normalizeCreatureFields(fields);
    return this.mutateActive(characterId, (current) => ({
      ...current,
      fields: normalized,
    }));
  }

  async adjustHp(
    characterId: string,
    amount: number,
  ): Promise<CharacterRecord> {
    if (!Number.isInteger(amount) || amount === 0) {
      throw new CharacterRepositoryError(
        "VALIDATION",
        "HP adjustment must be a non-zero whole number.",
      );
    }
    return this.mutateActive(characterId, (current) => {
      const hp = current.fields.hpCurrent;
      if (hp === undefined) {
        throw new CharacterRepositoryError(
          "VALIDATION",
          "This Character does not have a current HP value.",
          { characterId },
        );
      }
      return {
        ...current,
        fields: { ...current.fields, hpCurrent: adjustedHp(hp, amount) },
      };
    });
  }

  async adjustXp(
    characterId: string,
    amount: number,
  ): Promise<CharacterRecord> {
    if (!Number.isInteger(amount) || amount === 0) {
      throw new CharacterRepositoryError(
        "VALIDATION",
        "XP adjustment must be a non-zero whole number.",
      );
    }
    return this.mutateActive(characterId, (current) => ({
      ...current,
      fields: {
        ...current.fields,
        xp: Math.max(0, (current.fields.xp ?? 0) + amount),
      },
    }));
  }

  subscribe(
    callback: (
      changes: import("./characterRepositoryContract").CharacterRepositoryChange[],
    ) => void,
  ): () => void {
    if (!this.store.subscribe) return () => undefined;
    return this.store.subscribe((change) => {
      void this.inspect(change.characterId)
        .then((lookup) =>
          callback([{ characterId: change.characterId, lookup }]),
        )
        .catch((error) =>
          callback([
            {
              characterId: change.characterId,
              lookup: { status: "malformed", value: error },
            },
          ]),
        );
    });
  }

  async addInventoryItem(
    characterId: string,
    item: InventoryItem,
  ): Promise<CharacterRecord> {
    const normalized = normalizeInventoryItem(item);
    return this.mutateActive(characterId, (current) =>
      this.withInventory(current, [...(current.inventory ?? []), normalized]),
    );
  }

  async updateInventoryItem(
    characterId: string,
    selection: InventorySelection,
    replacement: InventoryItem,
  ): Promise<CharacterRecord> {
    const normalized = normalizeInventoryItem(replacement);
    return this.mutateSelectedInventoryItem(
      characterId,
      selection,
      (_item, inventory, index) => {
        inventory[index] = normalized;
      },
    );
  }

  async changeInventoryItemCount(
    characterId: string,
    selection: InventorySelection,
    change: number,
  ): Promise<CharacterRecord> {
    if (!Number.isInteger(change) || change === 0) {
      throw new CharacterRepositoryError(
        "VALIDATION",
        "Inventory count changes must be a non-zero integer.",
      );
    }
    return this.mutateSelectedInventoryItem(
      characterId,
      selection,
      (item, inventory, index) => {
        const nextCount = item[2] + change;
        if (nextCount < 0) {
          throw new CharacterRepositoryError(
            "VALIDATION",
            "Inventory item count cannot be negative.",
          );
        }
        if (nextCount === 0) inventory.splice(index, 1);
        else inventory[index] = [item[0], item[1], nextCount];
      },
    );
  }

  async removeInventoryItem(
    characterId: string,
    selection: InventorySelection,
  ): Promise<CharacterRecord> {
    return this.mutateSelectedInventoryItem(
      characterId,
      selection,
      (_item, inventory, index) => inventory.splice(index, 1),
    );
  }

  async recoverPendingTransfer(): Promise<CharacterTransferRecoveryResult> {
    const journal = this.options.transferJournal;
    if (!journal) return { status: "none" };
    return this.options.mutationLock.runExclusive(this.store.roomId, async () =>
      recoverCharacterTransferJournal(this.store, journal),
    );
  }

  async transferInventoryItem(
    sourceCharacterId: string,
    destinationCharacterId: string,
    selection: InventorySelection,
    count: number,
  ): Promise<{ source: CharacterRecord; destination: CharacterRecord }> {
    if (sourceCharacterId === destinationCharacterId) {
      throw new CharacterRepositoryError(
        "VALIDATION",
        "Choose a different destination Character.",
      );
    }
    if (!Number.isInteger(count) || count <= 0) {
      throw new CharacterRepositoryError(
        "VALIDATION",
        "Transfer count must be a positive integer.",
      );
    }
    const journalStore = this.options.transferJournal;
    if (!journalStore) {
      throw new CharacterRepositoryError(
        "API",
        "Local Character inventory transfer requires a recovery journal.",
      );
    }
    if (journalStore.roomId !== this.store.roomId) {
      throw new CharacterRepositoryError(
        "VALIDATION",
        "Character transfer journal belongs to another room.",
      );
    }

    return this.withLock(async () => {
      const source = this.requireActive(sourceCharacterId);
      const destination = this.requireActive(destinationCharacterId);
      const sourceInventory = normalizeInventory(source.record.inventory);
      const sourceIndex = findSelectedInventoryIndex(
        sourceInventory,
        selection,
      );
      if (sourceIndex < 0) {
        throw new CharacterRepositoryError(
          "CONFLICT",
          "That inventory item changed before the update could be applied. Refresh and try again.",
          { characterId: sourceCharacterId },
        );
      }
      const item = sourceInventory[sourceIndex];
      if (count > item[2]) {
        throw new CharacterRepositoryError(
          "VALIDATION",
          "Transfer count cannot exceed the source item count.",
        );
      }
      if (count === item[2]) sourceInventory.splice(sourceIndex, 1);
      else sourceInventory[sourceIndex] = [item[0], item[1], item[2] - count];
      const destinationInventory = [
        ...(destination.record.inventory ?? []),
        [item[0], item[1], count] satisfies InventoryItem,
      ];
      const actorId = await this.options.getActorId();
      const timestamp = this.now().toISOString();
      const sourceWriteId = this.randomUUID();
      const destinationWriteId = this.randomUUID();
      const transactionId = this.randomUUID();
      const knownIds = new Set([
        ...Object.keys(source.entry.history.revisions),
        ...Object.keys(destination.entry.history.revisions),
      ]);
      if (
        new Set([sourceWriteId, destinationWriteId, transactionId]).size !==
          3 ||
        [sourceWriteId, destinationWriteId, transactionId].some((id) =>
          knownIds.has(id),
        )
      ) {
        throw new CharacterRepositoryError(
          "CONFLICT",
          "Generated Character transfer identities must be unique.",
        );
      }
      const sourceCandidate: CharacterRecord = {
        ...this.withInventory(source.record, sourceInventory),
        revision: source.record.revision + 1,
        writeId: sourceWriteId,
        parents: [source.record.writeId],
        createdAt: source.record.createdAt,
        createdBy: source.record.createdBy,
        updatedAt: timestamp,
        updatedBy: actorId,
      };
      const destinationCandidate: CharacterRecord = {
        ...this.withInventory(destination.record, destinationInventory),
        revision: destination.record.revision + 1,
        writeId: destinationWriteId,
        parents: [destination.record.writeId],
        createdAt: destination.record.createdAt,
        createdBy: destination.record.createdBy,
        updatedAt: timestamp,
        updatedBy: actorId,
      };
      const sourceAfter = this.entryWithDescendant(
        source.entry,
        sourceCandidate,
      );
      const destinationAfter = this.entryWithDescendant(
        destination.entry,
        destinationCandidate,
      );
      const journal: CharacterTransferJournal = {
        formatVersion: CHARACTER_TRANSFER_JOURNAL_FORMAT_VERSION,
        roomId: this.store.roomId,
        transactionId,
        createdAt: timestamp,
        sourceCharacterId,
        destinationCharacterId,
        sourceBefore: source.entry,
        sourceAfter,
        destinationBefore: destination.entry,
        destinationAfter,
      };
      try {
        journalStore.put(journal);
      } catch (error) {
        throw new CharacterRepositoryError(
          "API",
          "DWTools could not start a recoverable inventory transfer.",
          { transactionId, sourceCharacterId, destinationCharacterId },
          { cause: error },
        );
      }
      try {
        this.store.put(sourceAfter);
        this.store.put(destinationAfter);
      } catch (error) {
        throw new CharacterRepositoryError(
          "API",
          "The inventory transfer was interrupted. DWTools preserved a recovery journal and will attempt to complete it before the next Character mutation.",
          { transactionId, sourceCharacterId, destinationCharacterId },
          { cause: error },
        );
      }
      try {
        journalStore.clear(transactionId);
      } catch (error) {
        throw new CharacterRepositoryError(
          "API",
          "The inventory transfer was saved, but DWTools could not clear its recovery journal. Reload before making more Character changes.",
          { transactionId, sourceCharacterId, destinationCharacterId },
          { cause: error },
        );
      }
      return { source: sourceCandidate, destination: destinationCandidate };
    });
  }

  async delete(characterId: string): Promise<CharacterTombstone> {
    return this.withLock(async () => {
      const { entry, record } = this.requireActive(characterId);
      const actorId = await this.options.getActorId();
      const timestamp = this.now().toISOString();
      const tombstone: CharacterTombstone = {
        schemaVersion: CHARACTER_RECORD_SCHEMA_VERSION,
        id: characterId,
        revision: record.revision + 1,
        writeId: this.randomUUID(),
        parents: [record.writeId],
        name: record.fields.name,
        deleted: true,
        deletedAt: timestamp,
        deletedBy: actorId,
      };
      this.writeDescendant(entry, tombstone);
      return tombstone;
    });
  }

  async resolveConflict(
    characterId: string,
    selectedHeadWriteId: string,
  ): Promise<CharacterRecord | CharacterTombstone> {
    return this.withLock(async () => {
      const entry = this.store.get(characterId);
      if (!entry || entry.history.heads.length <= 1) {
        throw new CharacterRepositoryError(
          "CONFLICT",
          "This Character is no longer conflicted.",
          { characterId },
        );
      }
      const heads = [...entry.history.heads].sort();
      if (!heads.includes(selectedHeadWriteId)) {
        throw new CharacterRepositoryError(
          "CONFLICT",
          "The selected Character version is no longer a current head.",
          { characterId, selectedHeadWriteId, heads },
        );
      }
      const records = heads.map((id) => entry.history.revisions[id]);
      if (records.some((record) => !record)) {
        throw new CharacterRepositoryError(
          "MALFORMED",
          "A conflicted Character head is missing its revision.",
          { characterId, heads },
        );
      }
      const selected = entry.history.revisions[selectedHeadWriteId]!;
      const actorId = await this.options.getActorId();
      const timestamp = this.now().toISOString();
      const common = {
        schemaVersion: CHARACTER_RECORD_SCHEMA_VERSION,
        id: characterId,
        revision: Math.max(...records.map((record) => record.revision)) + 1,
        writeId: this.randomUUID(),
        parents: heads,
      } as const;
      let resolution: CharacterRecord | CharacterTombstone;
      if (selected.deleted === true) {
        const activeName = records.find((record) => record.deleted !== true)
          ?.fields.name;
        resolution = {
          ...common,
          deleted: true,
          name: selected.name ?? activeName,
          deletedAt: timestamp,
          deletedBy: actorId,
        };
      } else {
        resolution = {
          ...common,
          fields: selected.fields,
          ...(selected.inventory ? { inventory: selected.inventory } : {}),
          createdAt: selected.createdAt,
          createdBy: selected.createdBy,
          updatedAt: timestamp,
          updatedBy: actorId,
        };
      }
      this.writeDescendant(entry, resolution);
      return resolution;
    });
  }

  private async mutateActive(
    characterId: string,
    mutate: (current: CharacterRecord) => CharacterRecord,
  ): Promise<CharacterRecord> {
    return this.withLock(async () => {
      const { entry, record } = this.requireActive(characterId);
      const actorId = await this.options.getActorId();
      const timestamp = this.now().toISOString();
      const mutated = mutate(record);
      const candidate: CharacterRecord = {
        ...mutated,
        schemaVersion: CHARACTER_RECORD_SCHEMA_VERSION,
        id: record.id,
        revision: record.revision + 1,
        writeId: this.randomUUID(),
        parents: [record.writeId],
        createdAt: record.createdAt,
        createdBy: record.createdBy,
        updatedAt: timestamp,
        updatedBy: actorId,
      };
      this.writeDescendant(entry, candidate);
      return candidate;
    });
  }

  private mutateSelectedInventoryItem(
    characterId: string,
    selection: InventorySelection,
    mutate: (
      item: InventoryItem,
      inventory: InventoryItem[],
      index: number,
    ) => void,
  ): Promise<CharacterRecord> {
    return this.mutateActive(characterId, (current) => {
      const inventory = normalizeInventory(current.inventory);
      const index = findSelectedInventoryIndex(inventory, selection);
      if (index < 0) {
        throw new CharacterRepositoryError(
          "CONFLICT",
          "That inventory item changed before the update could be applied. Refresh and try again.",
          { characterId },
        );
      }
      mutate(inventory[index], inventory, index);
      return this.withInventory(current, inventory);
    });
  }

  private withInventory(
    record: CharacterRecord,
    inventory: InventoryItem[],
  ): CharacterRecord {
    const normalized = normalizeInventory(inventory);
    const next: CharacterRecord = { ...record };
    if (normalized.length === 0) delete next.inventory;
    else next.inventory = normalized;
    return next;
  }

  private requireActive(characterId: string): {
    entry: CharacterLocalEntry;
    record: CharacterRecord;
  } {
    const entry = this.store.get(characterId);
    if (!entry) {
      throw new CharacterRepositoryError(
        "NOT_FOUND",
        "That Character record is no longer available.",
        { characterId },
      );
    }
    const lookup = activeLookup(entry);
    if (lookup.status === "conflict") {
      throw new CharacterRepositoryError(
        "CONFLICT",
        "This Character has unresolved revision branches and cannot be edited until they are resolved.",
        { characterId, heads: sortedHeads(entry.history) },
      );
    }
    if (lookup.status === "deleted") {
      throw new CharacterRepositoryError(
        "TOMBSTONED",
        "This Character has been deleted.",
        { characterId, writeId: lookup.record.writeId },
      );
    }
    if (lookup.status !== "active") {
      throw new CharacterRepositoryError(
        "NOT_FOUND",
        "That Character record is no longer available.",
        { characterId },
      );
    }
    return { entry, record: lookup.record };
  }

  private entryWithDescendant(
    entry: CharacterLocalEntry,
    record: StoredCharacterRecord,
  ): CharacterLocalEntry {
    if (record.writeId in entry.history.revisions) {
      throw new CharacterRepositoryError(
        "CONFLICT",
        "The generated Character revision ID already exists.",
        { characterId: entry.characterId, writeId: record.writeId },
      );
    }
    return {
      formatVersion: LOCAL_CHARACTER_ENTRY_FORMAT_VERSION,
      roomId: this.store.roomId,
      characterId: entry.characterId,
      history: {
        formatVersion: entry.history.formatVersion,
        characterId: entry.characterId,
        revisions: { ...entry.history.revisions, [record.writeId]: record },
        heads: [record.writeId],
      },
      sync: { pendingRevisionIds: [record.writeId] },
    };
  }

  private writeDescendant(
    entry: CharacterLocalEntry,
    record: StoredCharacterRecord,
  ): void {
    this.store.put(this.entryWithDescendant(entry, record));
  }

  private withLock<T>(operation: () => Promise<T>): Promise<T> {
    return this.options.mutationLock.runExclusive(
      this.store.roomId,
      async () => {
        const journal = this.options.transferJournal;
        if (journal) recoverCharacterTransferJournal(this.store, journal);
        return operation();
      },
    );
  }
}
