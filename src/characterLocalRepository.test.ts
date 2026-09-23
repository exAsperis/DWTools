import { describe, expect, it } from "vitest";
import { CharacterLocalRepository } from "./characterLocalRepository";
import {
  CharacterLocalStore,
  characterLocalStorageKey,
} from "./characterLocalStore";
import type { CharacterMutationLock } from "./characterMutationLock";
import {
  CharacterRepositoryError,
  type CharacterRecord,
} from "./characterRepository";
import { activeRecord } from "./characterTestHelpers";
import type { CharacterHistory } from "./characterRevision";
import {
  CharacterTransferJournalStore,
  characterTransferJournalStorageKey,
  type CharacterTransferJournalStorage,
} from "./characterTransferJournal";

class MemoryStorage implements Storage {
  private readonly values = new Map<string, string>();
  beforeSet?: (key: string, value: string) => void;
  beforeRemove?: (key: string) => void;
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
    this.beforeRemove?.(key);
    this.values.delete(key);
  }
  setItem(key: string, value: string): void {
    this.beforeSet?.(key, value);
    this.values.set(key, value);
  }
}

class SerialMutationLock implements CharacterMutationLock {
  private tail: Promise<void> = Promise.resolve();
  async runExclusive<T>(
    _roomId: string,
    operation: () => Promise<T>,
  ): Promise<T> {
    const previous = this.tail;
    let release: (() => void) | undefined;
    this.tail = new Promise<void>((resolve) => {
      release = resolve;
    });
    await previous;
    try {
      return await operation();
    } finally {
      release?.();
    }
  }
}

const timestamp = "2026-09-21T12:00:00.000Z";

function history(...records: CharacterRecord[]): CharacterHistory {
  return {
    formatVersion: 1,
    characterId: records[0].id,
    revisions: Object.fromEntries(
      records.map((record) => [record.writeId, record]),
    ),
    heads: [records.at(-1)!.writeId],
  };
}

function seed(store: CharacterLocalStore, value: CharacterHistory): void {
  store.put({
    formatVersion: 1,
    roomId: store.roomId,
    characterId: value.characterId,
    history: value,
    sync: { pendingRevisionIds: [] },
  });
}

function repo(
  store: CharacterLocalStore,
  lock: CharacterMutationLock = new SerialMutationLock(),
  ids: string[] = ["next"],
  transferJournal?: CharacterTransferJournalStorage,
) {
  return new CharacterLocalRepository(store, {
    getActorId: async () => "actor-1",
    mutationLock: lock,
    now: () => new Date(timestamp),
    randomUUID: () => {
      const value = ids.shift();
      if (!value) throw new Error("Missing test UUID");
      return value;
    },
    transferJournal,
  });
}

function transferSetup() {
  const storage = new MemoryStorage();
  const store = new CharacterLocalStore(storage, "room-1");
  const journals = new CharacterTransferJournalStore(storage, "room-1");
  const source = activeRecord("source", {
    writeId: "A",
    inventory: [["Potion", 0, 5]],
  });
  const destination = activeRecord("destination", {
    writeId: "X",
    inventory: [],
  });
  seed(store, history(source));
  seed(store, history(destination));
  return { storage, store, journals, source, destination };
}

function code(error: unknown): string | undefined {
  return error instanceof CharacterRepositoryError ? error.code : undefined;
}

describe("CharacterLocalRepository", () => {
  it("creates a schema-4 root and marks it pending", async () => {
    const store = new CharacterLocalStore(new MemoryStorage(), "room-1");
    const created = await repo(store, undefined, ["character-1", "A"]).create(
      activeRecord("ignored").fields,
    );
    const entry = store.get(created.id)!;
    expect(created).toMatchObject({
      schemaVersion: 4,
      revision: 1,
      parents: [],
      writeId: "A",
    });
    expect(entry.history.heads).toEqual(["A"]);
    expect(entry.sync.pendingRevisionIds).toEqual(["A"]);
  });

  it("patches by appending a descendant and preserving ancestry", async () => {
    const store = new CharacterLocalStore(new MemoryStorage(), "room-1");
    seed(store, history(activeRecord("character-1", { writeId: "A" })));
    await repo(store, undefined, ["B"]).patch("character-1", { hpCurrent: 4 });
    const entry = store.get("character-1")!;
    expect(Object.keys(entry.history.revisions).sort()).toEqual(["A", "B"]);
    expect(entry.history.revisions.B.parents).toEqual(["A"]);
    expect(entry.history.heads).toEqual(["B"]);
    expect(entry.sync.pendingRevisionIds).toEqual(["B"]);
  });

  it("replaces fields while preserving identity and creation audit", async () => {
    const store = new CharacterLocalStore(new MemoryStorage(), "room-1");
    const root = activeRecord("character-1", { writeId: "A" });
    seed(store, history(root));
    const replaced = await repo(store, undefined, ["B"]).replace(
      "character-1",
      {
        ...root.fields,
        name: "New name",
      },
    );
    expect(replaced).toMatchObject({
      id: root.id,
      createdAt: root.createdAt,
      createdBy: root.createdBy,
    });
    expect(replaced.fields.name).toBe("New name");
  });

  it("creates one linear chain across successive mutations", async () => {
    const store = new CharacterLocalStore(new MemoryStorage(), "room-1");
    seed(store, history(activeRecord("character-1", { writeId: "A" })));
    const repository = repo(store, undefined, ["B", "C", "D"]);
    await repository.patch("character-1", { hpCurrent: 7 });
    await repository.patch("character-1", { armor: 2 });
    await repository.patch("character-1", { hpMax: 12 });
    const entry = store.get("character-1")!;
    expect(entry.history.revisions.C.parents).toEqual(["B"]);
    expect(entry.history.revisions.D.parents).toEqual(["C"]);
    expect(entry.history.revisions.D.revision).toBe(4);
    expect(entry.history.heads).toEqual(["D"]);
  });

  it("serializes two repository instances over shared browser storage", async () => {
    const storage = new MemoryStorage();
    const first = new CharacterLocalStore(storage, "room-1");
    const second = new CharacterLocalStore(storage, "room-1");
    const lock = new SerialMutationLock();
    seed(first, history(activeRecord("character-1", { writeId: "A" })));
    await Promise.all([
      repo(first, lock, ["B"]).patch("character-1", { hpCurrent: 5 }),
      repo(second, lock, ["C"]).patch("character-1", { armor: 3 }),
    ]);
    const entry = first.get("character-1")!;
    const head = entry.history.revisions[entry.history.heads[0]];
    if (head.deleted) throw new Error("Expected active head");
    expect(head.fields).toMatchObject({ hpCurrent: 5, armor: 3 });
    expect(entry.history.heads).toHaveLength(1);
    expect(entry.history.revisions.C.parents).toEqual(["B"]);
  });

  it("serializes relative HP adjustment against the latest head", async () => {
    const storage = new MemoryStorage();
    const first = new CharacterLocalStore(storage, "room-1");
    const second = new CharacterLocalStore(storage, "room-1");
    const lock = new SerialMutationLock();
    seed(first, history(activeRecord("character-1", { writeId: "A" })));
    await Promise.all([
      repo(first, lock, ["B"]).adjustHp("character-1", -1),
      repo(second, lock, ["C"]).adjustHp("character-1", -1),
    ]);
    const lookup = await repo(first).inspect("character-1");
    expect(lookup.status).toBe("active");
    if (lookup.status === "active") {
      expect(lookup.record.fields.hpCurrent).toBe(6);
      expect(lookup.history.revisions.C.parents).toEqual(["B"]);
    }
  });

  it("floors relative HP at zero", async () => {
    const store = new CharacterLocalStore(new MemoryStorage(), "room-1");
    seed(
      store,
      history(
        activeRecord("character-1", {
          writeId: "A",
          fields: { ...activeRecord("x").fields, hpCurrent: 1 },
        }),
      ),
    );
    expect(
      (await repo(store, undefined, ["B"]).adjustHp("character-1", -5)).fields
        .hpCurrent,
    ).toBe(0);
  });

  it("rejects relative adjustment when HP is undefined", async () => {
    const store = new CharacterLocalStore(new MemoryStorage(), "room-1");
    const fields = { ...activeRecord("x").fields };
    delete fields.hpCurrent;
    seed(store, history(activeRecord("character-1", { writeId: "A", fields })));
    await expect(repo(store).adjustHp("character-1", -1)).rejects.toSatisfy(
      (error) => code(error) === "VALIDATION",
    );
  });

  it("refuses to mutate unresolved multi-head history", async () => {
    const store = new CharacterLocalStore(new MemoryStorage(), "room-1");
    const A = activeRecord("character-1", { writeId: "A" });
    const B = activeRecord("character-1", {
      writeId: "B",
      revision: 2,
      parents: ["A"],
    });
    const C = activeRecord("character-1", {
      writeId: "C",
      revision: 2,
      parents: ["A"],
    });
    const value = history(A, B, C);
    value.heads = ["B", "C"];
    seed(store, value);
    const before = structuredClone(store.get("character-1"));
    await expect(
      repo(store).patch("character-1", { armor: 4 }),
    ).rejects.toSatisfy((error) => code(error) === "CONFLICT");
    expect(store.get("character-1")).toEqual(before);
  });

  it("appends a versioned tombstone without removing history", async () => {
    const store = new CharacterLocalStore(new MemoryStorage(), "room-1");
    const root = activeRecord("character-1", { writeId: "A" });
    seed(store, history(root));
    const tombstone = await repo(store, undefined, ["T"]).delete("character-1");
    expect(tombstone).toMatchObject({
      deleted: true,
      parents: ["A"],
      revision: 2,
      writeId: "T",
      name: root.fields.name,
      deletedAt: timestamp,
      deletedBy: "actor-1",
    });
    const entry = store.get("character-1")!;
    expect(Object.keys(entry.history.revisions).sort()).toEqual(["A", "T"]);
    expect(entry.history.heads).toEqual(["T"]);
    expect(entry.sync.pendingRevisionIds).toEqual(["T"]);
  });

  it("rejects every edit operation for a deleted Character", async () => {
    const store = new CharacterLocalStore(new MemoryStorage(), "room-1");
    seed(store, history(activeRecord("character-1", { writeId: "A" })));
    const repository = repo(store, undefined, ["T"]);
    await repository.delete("character-1");
    const operations = [
      repository.patch("character-1", { armor: 2 }),
      repository.replace("character-1", activeRecord("x").fields),
      repository.adjustHp("character-1", -1),
      repository.addInventoryItem("character-1", ["Rope", 1, 1]),
    ];
    for (const operation of operations) {
      await expect(operation).rejects.toSatisfy(
        (error) => code(error) === "TOMBSTONED",
      );
    }
  });

  it("inspects a deleted Character as deleted", async () => {
    const store = new CharacterLocalStore(new MemoryStorage(), "room-1");
    seed(store, history(activeRecord("character-1", { writeId: "A" })));
    const repository = repo(store, undefined, ["T"]);
    await repository.delete("character-1");
    expect((await repository.inspect("character-1")).status).toBe("deleted");
  });

  it("inspects multi-head history as an intact conflict", async () => {
    const store = new CharacterLocalStore(new MemoryStorage(), "room-1");
    const A = activeRecord("character-1", { writeId: "A" });
    const B = activeRecord("character-1", {
      writeId: "B",
      revision: 2,
      parents: ["A"],
    });
    const C = activeRecord("character-1", {
      writeId: "C",
      revision: 2,
      parents: ["A"],
    });
    const value = history(A, B, C);
    value.heads = ["B", "C"];
    seed(store, value);
    const lookup = await repo(store).inspect("character-1");
    expect(lookup).toMatchObject({ status: "conflict", history: value });
  });

  it("uses indexed and tuple-fallback inventory selection and removes count zero", async () => {
    const store = new CharacterLocalStore(new MemoryStorage(), "room-1");
    const root = activeRecord("character-1", {
      writeId: "A",
      inventory: [
        ["Sword", 1, 1],
        ["Potion", 0, 2],
      ],
    });
    seed(store, history(root));
    const repository = repo(store, undefined, ["B", "C"]);
    const changed = await repository.changeInventoryItemCount(
      "character-1",
      { sourceIndex: 0, expected: ["Potion", 0, 2] },
      -1,
    );
    expect(changed.inventory).toEqual([
      ["Sword", 1, 1],
      ["Potion", 0, 1],
    ]);
    const removed = await repository.changeInventoryItemCount(
      "character-1",
      { sourceIndex: 1, expected: ["Potion", 0, 1] },
      -1,
    );
    expect(removed.inventory).toEqual([["Sword", 1, 1]]);
    await expect(
      repository.removeInventoryItem("character-1", {
        sourceIndex: 4,
        expected: ["Missing", 0, 1],
      }),
    ).rejects.toSatisfy((error) => code(error) === "CONFLICT");
  });

  it("rejects a generated revision-ID collision without changing storage", async () => {
    const store = new CharacterLocalStore(new MemoryStorage(), "room-1");
    seed(store, history(activeRecord("character-1", { writeId: "A" })));
    const before = structuredClone(store.get("character-1"));
    await expect(
      repo(store, undefined, ["A"]).patch("character-1", { armor: 2 }),
    ).rejects.toSatisfy((error) => code(error) === "CONFLICT");
    expect(store.get("character-1")).toEqual(before);
  });

  it("rejects a generated Character-ID collision", async () => {
    const store = new CharacterLocalStore(new MemoryStorage(), "room-1");
    seed(store, history(activeRecord("character-1", { writeId: "A" })));
    await expect(
      repo(store, undefined, ["character-1"]).create(activeRecord("x").fields),
    ).rejects.toSatisfy((error) => code(error) === "CONFLICT");
    expect(store.scan().entries).toHaveLength(1);
  });

  it("transfers inventory with two independent descendant revisions", async () => {
    const { store, journals } = transferSetup();
    const result = await repo(
      store,
      undefined,
      ["B", "Y", "transaction"],
      journals,
    ).transferInventoryItem(
      "source",
      "destination",
      { sourceIndex: 0, expected: ["Potion", 0, 5] },
      2,
    );
    expect(result.source.inventory).toEqual([["Potion", 0, 3]]);
    expect(result.destination.inventory).toEqual([["Potion", 0, 2]]);
    expect(result.source.parents).toEqual(["A"]);
    expect(result.destination.parents).toEqual(["X"]);
    expect(result.source.writeId).not.toBe(result.destination.writeId);
    expect(result.source.updatedAt).toBe(result.destination.updatedAt);
    expect(result.source.updatedBy).toBe(result.destination.updatedBy);
    expect(store.get("source")?.sync.pendingRevisionIds).toEqual(["B"]);
    expect(store.get("destination")?.sync.pendingRevisionIds).toEqual(["Y"]);
    expect(journals.get()).toBeUndefined();
  });

  it("does not write either Character when journal creation fails", async () => {
    const { storage, store, journals } = transferSetup();
    const beforeSource = structuredClone(store.get("source"));
    const beforeDestination = structuredClone(store.get("destination"));
    storage.beforeSet = (key) => {
      if (key === characterTransferJournalStorageKey("room-1"))
        throw new Error("journal failed");
    };
    await expect(
      repo(
        store,
        undefined,
        ["B", "Y", "transaction"],
        journals,
      ).transferInventoryItem(
        "source",
        "destination",
        { sourceIndex: 0, expected: ["Potion", 0, 5] },
        2,
      ),
    ).rejects.toThrow("could not start");
    expect(store.get("source")).toEqual(beforeSource);
    expect(store.get("destination")).toEqual(beforeDestination);
  });

  it("recovers both revisions after a source write failure", async () => {
    const { storage, store, journals } = transferSetup();
    storage.beforeSet = (key) => {
      if (key === characterLocalStorageKey("room-1", "source"))
        throw new Error("source failed");
    };
    await expect(
      repo(
        store,
        undefined,
        ["B", "Y", "transaction"],
        journals,
      ).transferInventoryItem(
        "source",
        "destination",
        { sourceIndex: 0, expected: ["Potion", 0, 5] },
        2,
      ),
    ).rejects.toThrow("interrupted");
    expect(journals.get()).toBeDefined();
    expect(store.get("source")?.history.heads).toEqual(["A"]);
    expect(store.get("destination")?.history.heads).toEqual(["X"]);
    storage.beforeSet = undefined;
    const freshStore = new CharacterLocalStore(storage, "room-1");
    await repo(
      freshStore,
      undefined,
      ["unused"],
      journals,
    ).recoverPendingTransfer();
    expect(freshStore.get("source")?.history.heads).toEqual(["B"]);
    expect(freshStore.get("destination")?.history.heads).toEqual(["Y"]);
    expect(journals.get()).toBeUndefined();
  });

  it("recovers only the missing destination after its write fails", async () => {
    const { storage, store, journals } = transferSetup();
    storage.beforeSet = (key) => {
      if (key === characterLocalStorageKey("room-1", "destination"))
        throw new Error("destination failed");
    };
    await expect(
      repo(
        store,
        undefined,
        ["B", "Y", "transaction"],
        journals,
      ).transferInventoryItem(
        "source",
        "destination",
        { sourceIndex: 0, expected: ["Potion", 0, 5] },
        2,
      ),
    ).rejects.toThrow("interrupted");
    expect(store.get("source")?.history.heads).toEqual(["B"]);
    expect(store.get("destination")?.history.heads).toEqual(["X"]);
    storage.beforeSet = undefined;
    await repo(
      new CharacterLocalStore(storage, "room-1"),
      undefined,
      ["unused"],
      journals,
    ).recoverPendingTransfer();
    expect(Object.keys(store.get("source")!.history.revisions)).toEqual([
      "A",
      "B",
    ]);
    expect(store.get("destination")?.history.heads).toEqual(["Y"]);
  });

  it("recovers by only clearing a stale journal after both writes succeeded", async () => {
    const { storage, store, journals } = transferSetup();
    storage.beforeRemove = (key) => {
      if (key === characterTransferJournalStorageKey("room-1"))
        throw new Error("clear failed");
    };
    await expect(
      repo(
        store,
        undefined,
        ["B", "Y", "transaction"],
        journals,
      ).transferInventoryItem(
        "source",
        "destination",
        { sourceIndex: 0, expected: ["Potion", 0, 5] },
        2,
      ),
    ).rejects.toThrow("could not clear");
    const before = [
      Object.keys(store.get("source")!.history.revisions),
      Object.keys(store.get("destination")!.history.revisions),
    ];
    storage.beforeRemove = undefined;
    await repo(store, undefined, ["unused"], journals).recoverPendingTransfer();
    expect(Object.keys(store.get("source")!.history.revisions)).toEqual(
      before[0],
    );
    expect(Object.keys(store.get("destination")!.history.revisions)).toEqual(
      before[1],
    );
    expect(journals.get()).toBeUndefined();
  });

  it("automatically recovers before an ordinary mutation", async () => {
    const { storage, store, journals } = transferSetup();
    storage.beforeSet = (key) => {
      if (key === characterLocalStorageKey("room-1", "destination"))
        throw new Error("destination failed");
    };
    await expect(
      repo(
        store,
        undefined,
        ["B", "Y", "transaction"],
        journals,
      ).transferInventoryItem(
        "source",
        "destination",
        { sourceIndex: 0, expected: ["Potion", 0, 5] },
        2,
      ),
    ).rejects.toThrow();
    storage.beforeSet = undefined;
    const patched = await repo(store, undefined, ["C"], journals).patch(
      "source",
      { armor: 3 },
    );
    expect(patched.parents).toEqual(["B"]);
    expect(store.get("destination")?.history.heads).toEqual(["Y"]);
    expect(journals.get()).toBeUndefined();
  });

  it("refuses transfer against an unresolved branch without a journal", async () => {
    const { store, journals } = transferSetup();
    const A = store.get("source")!.history.revisions.A as CharacterRecord;
    const B = activeRecord("source", {
      writeId: "B",
      revision: 2,
      parents: ["A"],
    });
    const C = activeRecord("source", {
      writeId: "C",
      revision: 2,
      parents: ["A"],
    });
    const branched = history(A, B, C);
    branched.heads = ["B", "C"];
    seed(store, branched);
    await expect(
      repo(store, undefined, ["unused"], journals).transferInventoryItem(
        "source",
        "destination",
        { sourceIndex: 0, expected: ["Potion", 0, 5] },
        1,
      ),
    ).rejects.toSatisfy((error) => code(error) === "CONFLICT");
    expect(journals.get()).toBeUndefined();
  });

  it("refuses transfer against a tombstone without a journal", async () => {
    const { store, journals } = transferSetup();
    await repo(store, undefined, ["T"]).delete("destination");
    await expect(
      repo(store, undefined, ["unused"], journals).transferInventoryItem(
        "source",
        "destination",
        { sourceIndex: 0, expected: ["Potion", 0, 5] },
        1,
      ),
    ).rejects.toSatisfy((error) => code(error) === "TOMBSTONED");
    expect(journals.get()).toBeUndefined();
  });

  it("uses exact tuple fallback after the selected row moves", async () => {
    const { store, journals } = transferSetup();
    const source = store.get("source")!;
    const A = source.history.revisions.A as CharacterRecord;
    A.inventory = [
      ["Rope", 1, 1],
      ["Potion", 0, 5],
    ];
    seed(store, history(A));
    const result = await repo(
      store,
      undefined,
      ["B", "Y", "transaction"],
      journals,
    ).transferInventoryItem(
      "source",
      "destination",
      { sourceIndex: 0, expected: ["Potion", 0, 5] },
      2,
    );
    expect(result.source.inventory).toEqual([
      ["Rope", 1, 1],
      ["Potion", 0, 3],
    ]);
  });

  it("rejects a missing transfer tuple without creating a journal", async () => {
    const { store, journals } = transferSetup();
    await expect(
      repo(store, undefined, ["unused"], journals).transferInventoryItem(
        "source",
        "destination",
        { sourceIndex: 4, expected: ["Missing", 0, 1] },
        1,
      ),
    ).rejects.toSatisfy((error) => code(error) === "CONFLICT");
    expect(journals.get()).toBeUndefined();
  });

  it("resolves a multi-head conflict with a new all-heads revision", async () => {
    const store = new CharacterLocalStore(new MemoryStorage(), "room-1");
    const root = activeRecord("character-1", { writeId: "A" });
    const left = activeRecord("character-1", {
      writeId: "B",
      revision: 2,
      parents: ["A"],
      fields: { ...root.fields, hpCurrent: 3 },
      inventory: [["Rope", 1, 1]],
    });
    const right = activeRecord("character-1", {
      writeId: "C",
      revision: 4,
      parents: ["A"],
      fields: { ...root.fields, hpCurrent: 8 },
    });
    seed(store, {
      formatVersion: 1,
      characterId: "character-1",
      revisions: { A: root, B: left, C: right },
      heads: ["C", "B"],
    });
    const resolution = await repo(store, undefined, ["R"]).resolveConflict(
      "character-1",
      "B",
    );
    expect(resolution).toMatchObject({
      writeId: "R",
      revision: 5,
      parents: ["B", "C"],
      fields: { hpCurrent: 3 },
      inventory: [["Rope", 1, 1]],
    });
    const entry = store.get("character-1")!;
    expect(entry.history.heads).toEqual(["R"]);
    expect(Object.keys(entry.history.revisions).sort()).toEqual([
      "A",
      "B",
      "C",
      "R",
    ]);
    expect(entry.sync.pendingRevisionIds).toEqual(["R"]);
  });

  it("resolves active-vs-tombstone by explicitly choosing deletion", async () => {
    const store = new CharacterLocalStore(new MemoryStorage(), "room-1");
    const active = activeRecord("character-1", { writeId: "B" });
    const tombstone = {
      schemaVersion: 4 as const,
      id: "character-1",
      revision: 3,
      writeId: "T",
      parents: ["B"],
      deleted: true as const,
      deletedAt: timestamp,
      deletedBy: "actor-2",
    };
    seed(store, {
      formatVersion: 1,
      characterId: "character-1",
      revisions: { B: active, T: tombstone },
      heads: ["B", "T"],
    });
    const resolution = await repo(store, undefined, ["R"]).resolveConflict(
      "character-1",
      "T",
    );
    expect(resolution).toMatchObject({
      deleted: true,
      name: active.fields.name,
      parents: ["B", "T"],
      revision: 4,
    });
  });

  it("rejects stale or non-conflicted resolution selections", async () => {
    const store = new CharacterLocalStore(new MemoryStorage(), "room-1");
    const active = activeRecord("character-1", { writeId: "A" });
    seed(store, history(active));
    await expect(
      repo(store).resolveConflict("character-1", "A"),
    ).rejects.toSatisfy((error) => code(error) === "CONFLICT");
  });
});
