import { describe, expect, it } from "vitest";

import { activeRecord } from "./characterTestHelpers";

import type {
  CharacterHistory,
  VersionedCharacterRecord,
} from "./characterRevision";

import {
  CharacterLocalStore,
  CharacterLocalStoreError,
  characterLocalStorageKey,
  type CharacterLocalChangeBus,
  type CharacterLocalChangeMessage,
  type CharacterLocalEntry,
} from "./characterLocalStore";

class MemoryStorage implements Storage {
  private readonly values = new Map<string, string>();

  failWrites = false;
  failReads = false;

  get length(): number {
    return this.values.size;
  }

  clear(): void {
    this.values.clear();
  }

  getItem(key: string): string | null {
    if (this.failReads) {
      throw new Error("read failed");
    }

    return this.values.get(key) ?? null;
  }

  key(index: number): string | null {
    return [...this.values.keys()][index] ?? null;
  }

  removeItem(key: string): void {
    this.values.delete(key);
  }

  setItem(key: string, value: string): void {
    if (this.failWrites) {
      throw new Error("quota exceeded");
    }

    this.values.set(key, value);
  }

  raw(key: string): string | null {
    return this.values.get(key) ?? null;
  }
}

class FakeBusHub {
  readonly buses = new Set<FakeBus>();

  connect(): FakeBus {
    const bus = new FakeBus(this);
    this.buses.add(bus);
    return bus;
  }

  send(source: FakeBus, message: CharacterLocalChangeMessage): void {
    for (const bus of this.buses) {
      if (bus !== source && !bus.closed) {
        bus.receive(message);
      }
    }
  }

  disconnect(bus: FakeBus): void {
    this.buses.delete(bus);
  }
}

class FakeBus implements CharacterLocalChangeBus {
  readonly listeners = new Set<(message: unknown) => void>();

  closed = false;

  constructor(private readonly hub: FakeBusHub) {}

  postMessage(message: CharacterLocalChangeMessage): void {
    this.hub.send(this, message);
  }

  subscribe(callback: (message: unknown) => void): () => void {
    this.listeners.add(callback);

    return () => this.listeners.delete(callback);
  }

  close(): void {
    if (this.closed) return;

    this.closed = true;
    this.listeners.clear();
    this.hub.disconnect(this);
  }

  receive(message: unknown): void {
    for (const listener of this.listeners) {
      listener(message);
    }
  }
}

function revision(
  characterId: string,
  writeId: string,
  parents: string[] = [],
  revisionNumber = 1,
): VersionedCharacterRecord {
  return {
    ...activeRecord(characterId, {
      writeId,
      revision: revisionNumber,
    }),
    parents,
  };
}

function history(characterId: string, writeId = "root"): CharacterHistory {
  const root = revision(characterId, writeId);

  return {
    formatVersion: 1,
    characterId,
    revisions: {
      [writeId]: root,
    },
    heads: [writeId],
  };
}

function entry(
  roomId: string,
  characterId: string,
  pendingRevisionIds: string[] = [],
): CharacterLocalEntry {
  return {
    formatVersion: 1,
    roomId,
    characterId,
    history: history(characterId),
    sync: {
      pendingRevisionIds,
    },
  };
}

describe("CharacterLocalStore", () => {
  it("stores and retrieves a Character entry", () => {
    const storage = new MemoryStorage();

    const store = new CharacterLocalStore(
      storage,
      "room-a",
      undefined,
      "store-a",
    );

    const saved = store.put(entry("room-a", "character-1", ["root"]));

    expect(saved).toEqual(entry("room-a", "character-1", ["root"]));

    expect(store.get("character-1")).toEqual(saved);
  });

  it("stores history and pending state in the same localStorage value", () => {
    const storage = new MemoryStorage();

    const store = new CharacterLocalStore(
      storage,
      "room-a",
      undefined,
      "store-a",
    );

    store.put(entry("room-a", "character-1", ["root"]));

    const raw = storage.raw(characterLocalStorageKey("room-a", "character-1"));

    expect(raw).not.toBeNull();

    const parsed = JSON.parse(raw!);

    expect(parsed.history.heads).toEqual(["root"]);

    expect(parsed.sync.pendingRevisionIds).toEqual(["root"]);
  });

  it("isolates Character storage by room", () => {
    const storage = new MemoryStorage();

    const roomA = new CharacterLocalStore(
      storage,
      "room-a",
      undefined,
      "store-a",
    );

    const roomB = new CharacterLocalStore(
      storage,
      "room-b",
      undefined,
      "store-b",
    );

    roomA.put(entry("room-a", "character-1"));

    roomB.put(entry("room-b", "character-2"));

    expect(roomA.scan().entries.map((value) => value.characterId)).toEqual([
      "character-1",
    ]);

    expect(roomB.scan().entries.map((value) => value.characterId)).toEqual([
      "character-2",
    ]);
  });

  it("does not include unrelated localStorage keys", () => {
    const storage = new MemoryStorage();

    storage.setItem("something/unrelated", '{"hello":true}');

    const store = new CharacterLocalStore(
      storage,
      "room-a",
      undefined,
      "store-a",
    );

    store.put(entry("room-a", "character-1"));

    expect(store.scan().entries).toHaveLength(1);

    expect(storage.getItem("something/unrelated")).toBe('{"hello":true}');
  });

  it("surfaces malformed entries without deleting them", () => {
    const storage = new MemoryStorage();

    const key = characterLocalStorageKey("room-a", "broken");

    storage.setItem(key, "{not-json");

    const store = new CharacterLocalStore(
      storage,
      "room-a",
      undefined,
      "store-a",
    );

    const scan = store.scan();

    expect(scan.entries).toEqual([]);

    expect(scan.issues).toEqual([
      expect.objectContaining({
        key,
        characterId: "broken",
        code: "MALFORMED",
      }),
    ]);

    expect(storage.getItem(key)).toBe("{not-json");
  });

  it("throws when directly reading a malformed entry", () => {
    const storage = new MemoryStorage();

    storage.setItem(characterLocalStorageKey("room-a", "broken"), "{bad");

    const store = new CharacterLocalStore(
      storage,
      "room-a",
      undefined,
      "store-a",
    );

    expect(() => store.get("broken")).toThrow(CharacterLocalStoreError);
  });

  it("rejects pending IDs that are absent from the history", () => {
    const storage = new MemoryStorage();

    const store = new CharacterLocalStore(
      storage,
      "room-a",
      undefined,
      "store-a",
    );

    expect(() =>
      store.put(entry("room-a", "character-1", ["missing"])),
    ).toThrow(CharacterLocalStoreError);
  });

  it("reports write failure without replacing the previous durable value", () => {
    const storage = new MemoryStorage();

    const store = new CharacterLocalStore(
      storage,
      "room-a",
      undefined,
      "store-a",
    );

    const original = entry("room-a", "character-1");

    store.put(original);

    const key = characterLocalStorageKey("room-a", "character-1");

    const before = storage.raw(key);

    storage.failWrites = true;

    const replacement = entry("room-a", "character-1");

    replacement.sync.pendingRevisionIds = ["root"];

    expect(() => store.put(replacement)).toThrow(
      "DWTools could not save local Character data.",
    );

    expect(storage.raw(key)).toBe(before);
  });

  it("notifies subscribers for same-context writes", () => {
    const storage = new MemoryStorage();

    const store = new CharacterLocalStore(
      storage,
      "room-a",
      undefined,
      "store-a",
    );

    const changes: Array<{
      characterId: string;
      source: string;
    }> = [];

    store.subscribe((change) => changes.push(change));

    store.put(entry("room-a", "character-1"));

    expect(changes).toEqual([
      {
        characterId: "character-1",
        source: "local",
      },
    ]);
  });

  it("notifies another context through the change bus", () => {
    const storage = new MemoryStorage();

    const hub = new FakeBusHub();

    const first = new CharacterLocalStore(
      storage,
      "room-a",
      hub.connect(),
      "first",
    );

    const second = new CharacterLocalStore(
      storage,
      "room-a",
      hub.connect(),
      "second",
    );

    const changes: Array<{
      characterId: string;
      source: string;
    }> = [];

    second.subscribe((change) => changes.push(change));

    first.put(entry("room-a", "character-1"));

    expect(changes).toEqual([
      {
        characterId: "character-1",
        source: "broadcast",
      },
    ]);

    expect(second.get("character-1")).toBeDefined();

    first.close();
    second.close();
  });

  it("ignores its own broadcast messages", () => {
    const storage = new MemoryStorage();

    const hub = new FakeBusHub();

    const bus = hub.connect();

    const store = new CharacterLocalStore(
      storage,
      "room-a",
      bus,
      "same-source",
    );

    const changes: string[] = [];

    store.subscribe((change) => changes.push(change.source));

    bus.receive({
      formatVersion: 1,
      roomId: "room-a",
      characterId: "character-1",
      sourceId: "same-source",
    });

    expect(changes).toEqual([]);

    store.close();
  });

  it("ignores broadcast messages for another room", () => {
    const storage = new MemoryStorage();

    const hub = new FakeBusHub();

    const bus = hub.connect();

    const store = new CharacterLocalStore(storage, "room-a", bus, "store-a");

    const changes: string[] = [];

    store.subscribe((change) => changes.push(change.characterId));

    bus.receive({
      formatVersion: 1,
      roomId: "room-b",
      characterId: "character-2",
      sourceId: "other",
    });

    expect(changes).toEqual([]);

    store.close();
  });
});
