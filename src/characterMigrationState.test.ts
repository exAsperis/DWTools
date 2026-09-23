import { describe, expect, it } from "vitest";
import {
  assessCharacterRoomRetirement,
  parseCharacterSceneReplicaState,
  parseCharacterStorageState,
  ensureCharacterSceneReplicaState,
  type CharacterStorageState,
} from "./characterMigrationState";
import { activeRecord } from "./characterTestHelpers";
import type { CharacterLocalStoreScan } from "./characterLocalStore";
import type { CharacterSceneStoreScan } from "./characterSceneStore";

const frozen: CharacterStorageState = {
  formatVersion: 1,
  authority: "local-scene-v1",
  roomRecords: "frozen",
  hasCharacterHistory: false,
};

describe("Character migration state", () => {
  it("parses missing and valid room markers strictly", () => {
    expect(parseCharacterStorageState(undefined)).toBeUndefined();
    expect(parseCharacterStorageState(frozen)).toEqual(frozen);
    expect(
      parseCharacterStorageState({
        ...frozen,
        roomRecords: "retired",
        hasCharacterHistory: true,
      }),
    ).toMatchObject({ roomRecords: "retired", hasCharacterHistory: true });
  });

  it("rejects malformed, unsupported, and non-boolean room markers", () => {
    for (const value of [
      {},
      { ...frozen, formatVersion: 2 },
      { ...frozen, hasCharacterHistory: 1 },
    ]) {
      expect(() => parseCharacterStorageState(value)).toThrow();
    }
  });

  it("parses scene replica markers strictly", () => {
    expect(parseCharacterSceneReplicaState(undefined)).toBeUndefined();
    expect(
      parseCharacterSceneReplicaState({ formatVersion: 1, initialized: true }),
    ).toEqual({ formatVersion: 1, initialized: true });
    expect(() =>
      parseCharacterSceneReplicaState({ formatVersion: 1, initialized: false }),
    ).toThrow();
  });

  it("writes the scene marker only after the caller requests successful initialization", async () => {
    const metadata: Record<string, unknown> = {};
    const writes: Record<string, unknown>[] = [];
    const store = {
      getMetadata: async () => metadata,
      setMetadata: async (update: Record<string, unknown>) => {
        writes.push(update);
        Object.assign(metadata, update);
      },
    };
    expect(writes).toEqual([]);
    await ensureCharacterSceneReplicaState(store);
    expect(writes).toHaveLength(1);
    await ensureCharacterSceneReplicaState(store);
    expect(writes).toHaveLength(1);
  });
});

describe("assessCharacterRoomRetirement", () => {
  const record = activeRecord("character-1", { writeId: "A" });
  const history = {
    formatVersion: 1 as const,
    characterId: "character-1",
    revisions: { A: record },
    heads: ["A"],
  };
  const local = (
    pending: string[] = [],
    heads = ["A"],
  ): CharacterLocalStoreScan => ({
    entries: [
      {
        formatVersion: 1,
        roomId: "room-1",
        characterId: "character-1",
        history: { ...history, heads },
        sync: { pendingRevisionIds: pending },
      },
    ],
    issues: [],
  });
  const scene = (value = history): CharacterSceneStoreScan => ({
    histories: [value],
    issues: [],
  });
  const replica = { formatVersion: 1 as const, initialized: true as const };

  it("is ready only for completely settled local and scene history", () => {
    expect(
      assessCharacterRoomRetirement(frozen, local(), scene(), replica, false),
    ).toEqual({ ready: true, reasons: [] });
  });

  it("reports every retirement blocker", () => {
    expect(
      assessCharacterRoomRetirement(
        undefined,
        {
          entries: [],
          issues: [{ key: "bad", code: "MALFORMED", message: "bad" }],
        },
        undefined,
        undefined,
        true,
      ),
    ).toMatchObject({ ready: false });
    expect(
      assessCharacterRoomRetirement(
        frozen,
        local(["A"], ["A", "B"]),
        { histories: [], issues: [] },
        replica,
        false,
      ).reasons.join(" "),
    ).toMatch(/pending|unresolved|missing/i);
    const divergent = {
      ...history,
      revisions: { A: { ...record, fields: { ...record.fields, armor: 9 } } },
    };
    expect(
      assessCharacterRoomRetirement(
        frozen,
        local(),
        scene(divergent),
        replica,
        false,
      ).reasons.join(" "),
    ).toMatch(/differs/i);
  });
});
