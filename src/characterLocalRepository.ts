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
} from "./characterLocalStore";
import type { CharacterMutationLock } from "./characterMutationLock";
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

export interface CharacterLocalMutationStore {
  readonly roomId: string;
  get(characterId: string): CharacterLocalEntry | undefined;
  scan(): CharacterLocalStoreScan;
  put(entry: CharacterLocalEntry): CharacterLocalEntry;
}

export interface CharacterLocalRepositoryOptions {
  getActorId: () => Promise<string>;
  mutationLock: CharacterMutationLock;
  now?: () => Date;
  randomUUID?: () => string;
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
    return this.store
      .scan()
      .entries.flatMap((entry) => {
        const lookup = activeLookup(entry);
        return lookup.status === "active" ? [lookup.record] : [];
      })
      .sort((left, right) =>
        left.fields.name.localeCompare(right.fields.name, undefined, {
          sensitivity: "base",
        }),
      );
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

  private writeDescendant(
    entry: CharacterLocalEntry,
    record: StoredCharacterRecord,
  ): void {
    if (record.writeId in entry.history.revisions) {
      throw new CharacterRepositoryError(
        "CONFLICT",
        "The generated Character revision ID already exists.",
        { characterId: entry.characterId, writeId: record.writeId },
      );
    }
    this.store.put({
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
    });
  }

  private withLock<T>(operation: () => Promise<T>): Promise<T> {
    return this.options.mutationLock.runExclusive(this.store.roomId, operation);
  }
}
