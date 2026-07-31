import { describe, expect, it } from "vitest";
import {
  clearCreatureClipboard,
  createCreatureClipboardPayload,
  CREATURE_CLIPBOARD_STORAGE_KEY,
  creatureFieldsFromClipboard,
  readCreatureClipboard,
  writeCreatureClipboard,
  type ClipboardStorage,
} from "./creatureClipboard";

class FakeStorage implements ClipboardStorage {
  values = new Map<string, string>();

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }

  removeItem(key: string): void {
    this.values.delete(key);
  }
}

describe("creature clipboard", () => {
  it("stores and restores a normalized versioned snapshot", () => {
    const storage = new FakeStorage();
    const payload = createCreatureClipboardPayload(
      { hpCurrent: 4, tags: "  Small  ", alignment: " " },
      " Goblin ",
      "2026-07-30T18:00:00.000Z",
    );

    writeCreatureClipboard(storage, payload);

    expect(readCreatureClipboard(storage)).toEqual({
      schemaVersion: 1,
      sourceName: "Goblin",
      copiedAt: "2026-07-30T18:00:00.000Z",
      data: { hpCurrent: 4, tags: "Small" },
    });
  });

  it("persists until replaced or explicitly cleared", () => {
    const storage = new FakeStorage();
    writeCreatureClipboard(
      storage,
      createCreatureClipboardPayload(
        { armor: 1 },
        "First",
        "2026-07-30T18:00:00.000Z",
      ),
    );
    writeCreatureClipboard(
      storage,
      createCreatureClipboardPayload(
        { armor: 2 },
        "Second",
        "2026-07-30T19:00:00.000Z",
      ),
    );
    expect(readCreatureClipboard(storage)?.sourceName).toBe("Second");

    clearCreatureClipboard(storage);
    expect(readCreatureClipboard(storage)).toBeUndefined();
  });

  it("stages an exact source snapshot while preserving the target name", () => {
    const payload = createCreatureClipboardPayload(
      { hpCurrent: 8, moves: "Strike" },
      "Source",
      "2026-07-30T18:00:00.000Z",
    );

    expect(creatureFieldsFromClipboard("Target label", payload)).toEqual({
      name: "Target label",
      hpCurrent: 8,
      moves: "Strike",
    });
  });

  it.each([
    "{not-json",
    JSON.stringify({ schemaVersion: 2, sourceName: "Old", data: {} }),
    JSON.stringify({
      schemaVersion: 1,
      sourceName: "Goblin",
      copiedAt: "not-a-date",
      data: {},
    }),
    JSON.stringify({
      schemaVersion: 1,
      sourceName: "Goblin",
      copiedAt: "2026-07-30T18:00:00.000Z",
      data: { level: 99 },
    }),
  ])("clears malformed or unsupported storage", (stored) => {
    const storage = new FakeStorage();
    storage.values.set(CREATURE_CLIPBOARD_STORAGE_KEY, stored);

    expect(readCreatureClipboard(storage)).toBeUndefined();
    expect(storage.values.has(CREATURE_CLIPBOARD_STORAGE_KEY)).toBe(false);
  });

  it("treats unavailable browser storage as an empty clipboard", () => {
    const storage: ClipboardStorage = {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("blocked");
      },
      removeItem: () => {
        throw new Error("blocked");
      },
    };

    expect(readCreatureClipboard(storage)).toBeUndefined();
  });
});
