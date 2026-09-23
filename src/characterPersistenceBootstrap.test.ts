import { describe, expect, it } from "vitest";
import { bootstrapCharacterPersistenceAuthority } from "./characterPersistenceBootstrap";
import {
  CharacterLocalStore,
  characterLocalStorageKey,
} from "./characterLocalStore";
import type { CharacterMutationLock } from "./characterMutationLock";
import type { CharacterTransferJournalStorage } from "./characterTransferJournal";
import { activeRecord } from "./characterTestHelpers";
import { CHARACTER_KEY_PREFIX, CHARACTER_STORAGE_STATE_KEY } from "./constants";

class MemoryStorage implements Storage {
  private readonly values = new Map<string, string>();
  get length(): number {
    return this.values.size;
  }
  clear(): void {
    this.values.clear();
  }
  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }
  key(index: number): string | null {
    return [...this.values.keys()][index] ?? null;
  }
  removeItem(key: string): void {
    this.values.delete(key);
  }
  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }
}

function journal(roomId: string): CharacterTransferJournalStorage {
  return {
    roomId,
    get: () => undefined,
    put: (value) => value,
    clear: () => undefined,
  };
}

describe("bootstrapCharacterPersistenceAuthority", () => {
  async function bootstrapWith(metadata: Record<string, unknown>) {
    const storage = new MemoryStorage();
    const localStore = new CharacterLocalStore(storage, "room-1");
    const authority = await bootstrapCharacterPersistenceAuthority({
      localStore,
      transferJournal: journal("room-1"),
      roomStore: { getMetadata: async () => metadata },
      mutationLock: { runExclusive: (_roomId, operation) => operation() },
      getActorId: async () => "actor-1",
    });
    return authority;
  }

  it("imports room records for legacy and frozen rooms but not retired rooms", async () => {
    const record = activeRecord("character-1", { writeId: "A" });
    const key = CHARACTER_KEY_PREFIX + "character-1";
    const legacy = await bootstrapWith({ [key]: record });
    expect(await legacy.repository.list()).toHaveLength(1);
    const frozen = await bootstrapWith({
      [key]: record,
      [CHARACTER_STORAGE_STATE_KEY]: {
        formatVersion: 1,
        authority: "local-scene-v1",
        roomRecords: "frozen",
        hasCharacterHistory: true,
      },
    });
    expect(await frozen.repository.list()).toHaveLength(1);
    const retired = await bootstrapWith({
      [key]: record,
      [CHARACTER_STORAGE_STATE_KEY]: {
        formatVersion: 1,
        authority: "local-scene-v1",
        roomRecords: "retired",
        hasCharacterHistory: true,
      },
    });
    expect(await retired.repository.list()).toEqual([]);
    legacy.close();
    frozen.close();
    retired.close();
  });
  it("performs recovery, import, and validation under one room lock", async () => {
    const order: string[] = [];
    const storage = new MemoryStorage();
    const localStore = new CharacterLocalStore(storage, "room-1");
    const mutationLock: CharacterMutationLock = {
      runExclusive: async (roomId, operation) => {
        order.push(`lock:${roomId}`);
        const result = await operation();
        order.push("unlock");
        return result;
      },
    };
    const authority = await bootstrapCharacterPersistenceAuthority({
      localStore,
      transferJournal: journal("room-1"),
      roomStore: {
        getMetadata: async () => {
          order.push("room-read");
          return {};
        },
      },
      mutationLock,
      getActorId: async () => "actor-1",
    });

    expect(order).toEqual(["lock:room-1", "room-read", "unlock"]);
    expect(await authority.repository.list()).toEqual([]);
    authority.close();
  });

  it("blocks startup when local storage is malformed", async () => {
    const storage = new MemoryStorage();
    storage.setItem(characterLocalStorageKey("room-1", "broken"), "{");
    const localStore = new CharacterLocalStore(storage, "room-1");
    const mutationLock: CharacterMutationLock = {
      runExclusive: (_roomId, operation) => operation(),
    };

    await expect(
      bootstrapCharacterPersistenceAuthority({
        localStore,
        transferJournal: journal("room-1"),
        roomStore: { getMetadata: async () => ({}) },
        mutationLock,
        getActorId: async () => "actor-1",
      }),
    ).rejects.toMatchObject({ code: "MALFORMED" });
    localStore.close();
  });
});
