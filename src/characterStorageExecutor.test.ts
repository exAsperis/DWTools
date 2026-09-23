import { describe, expect, it, vi } from "vitest";

import { activeRecord } from "./characterTestHelpers";

import {
  LOCAL_CHARACTER_ENTRY_FORMAT_VERSION,
  type CharacterLocalEntry,
} from "./characterLocalStore";

import { type CharacterReconciliationOptions } from "./characterReconciliation";

import {
  executeCharacterReconciliation,
  type CharacterLocalExecutionStore,
  type CharacterSceneExecutionStore,
} from "./characterStorageExecutor";

import type {
  CharacterHistory,
  VersionedCharacterRecord,
} from "./characterRevision";

import type { CharacterRecord } from "./characterRepository";

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function record(
  writeId: string,
  parents: string[] = [],
  changes: Partial<CharacterRecord["fields"]> = {},
  overrides: Partial<CharacterRecord> = {},
): CharacterRecord {
  const original = activeRecord("character-1");

  return {
    ...original,
    ...overrides,

    id: "character-1",

    writeId,
    parents,

    fields: {
      ...original.fields,
      ...changes,
    },
  };
}

function history(
  heads: string[],
  ...records: VersionedCharacterRecord[]
): CharacterHistory {
  return {
    formatVersion: 1,

    characterId: "character-1",

    heads: [...heads],

    revisions: Object.fromEntries(
      records.map((entry) => [entry.writeId, entry]),
    ),
  };
}

function entry(
  value: CharacterHistory,
  pendingRevisionIds: string[] = [],
): CharacterLocalEntry {
  return {
    formatVersion: LOCAL_CHARACTER_ENTRY_FORMAT_VERSION,

    roomId: "room-1",

    characterId: value.characterId,

    history: clone(value),

    sync: {
      pendingRevisionIds: [...pendingRevisionIds],
    },
  };
}

function options(writeId = "merge-write"): CharacterReconciliationOptions {
  return {
    createMergeRevisionOptions: () => ({
      writeId,

      actorId: "gm-1",

      updatedAt: "2026-09-21T14:00:00.000Z",
    }),
  };
}

class FakeLocalStore implements CharacterLocalExecutionStore {
  readonly roomId = "room-1";

  current: CharacterLocalEntry | undefined;

  getCalls = 0;

  readonly putCalls: CharacterLocalEntry[] = [];

  readonly failGetCalls = new Set<number>();

  readonly failPutCalls = new Set<number>();

  readonly beforeGet = new Map<number, () => void>();

  constructor(initial?: CharacterLocalEntry) {
    this.current = initial ? clone(initial) : undefined;
  }

  get(): CharacterLocalEntry | undefined {
    this.getCalls += 1;

    this.beforeGet.get(this.getCalls)?.();

    if (this.failGetCalls.has(this.getCalls)) {
      throw new Error(`local get ${this.getCalls} failed`);
    }

    return this.current ? clone(this.current) : undefined;
  }

  put(value: CharacterLocalEntry): CharacterLocalEntry {
    const call = this.putCalls.length + 1;

    if (this.failPutCalls.has(call)) {
      throw new Error(`local put ${call} failed`);
    }

    const saved = clone(value);

    this.putCalls.push(saved);

    this.current = saved;

    return clone(saved);
  }
}

class FakeSceneStore implements CharacterSceneExecutionStore {
  current: CharacterHistory | undefined;

  getCalls = 0;

  readonly putCalls: CharacterHistory[] = [];

  readonly failGetCalls = new Set<number>();

  readonly failPutCalls = new Set<number>();

  readonly beforeGet = new Map<number, () => void>();

  afterPut?: (store: FakeSceneStore) => void;

  constructor(initial?: CharacterHistory) {
    this.current = initial ? clone(initial) : undefined;
  }

  async get(): Promise<CharacterHistory | undefined> {
    this.getCalls += 1;

    this.beforeGet.get(this.getCalls)?.();

    if (this.failGetCalls.has(this.getCalls)) {
      throw new Error(`scene get ${this.getCalls} failed`);
    }

    return this.current ? clone(this.current) : undefined;
  }

  async put(value: CharacterHistory): Promise<CharacterHistory> {
    const call = this.putCalls.length + 1;

    if (this.failPutCalls.has(call)) {
      throw new Error(`scene put ${call} failed`);
    }

    const saved = clone(value);

    this.putCalls.push(saved);

    this.current = saved;

    this.afterPut?.(this);

    return clone(saved);
  }
}

describe("Character storage executor", () => {
  it("does nothing when the Character is absent from both stores", async () => {
    const local = new FakeLocalStore();

    const scene = new FakeSceneStore();

    const result = await executeCharacterReconciliation(
      "character-1",
      local,
      scene,
      options(),
    );

    expect(result.status).toBe("absent");

    expect(local.putCalls).toHaveLength(0);

    expect(scene.putCalls).toHaveLength(0);
  });

  it("persists local pending state before writing a local-only Character to the scene", async () => {
    const root = record("root");

    const value = history(["root"], root);

    const local = new FakeLocalStore(entry(value));

    const scene = new FakeSceneStore();

    const result = await executeCharacterReconciliation(
      "character-1",
      local,
      scene,
      options(),
    );

    expect(result.status).toBe("synchronized");

    expect(local.putCalls).toHaveLength(2);

    expect(local.putCalls[0].sync.pendingRevisionIds).toEqual(["root"]);

    expect(scene.putCalls).toHaveLength(1);

    expect(scene.putCalls[0]).toEqual(value);

    expect(local.putCalls[1].sync.pendingRevisionIds).toEqual([]);

    expect(local.current?.sync.pendingRevisionIds).toEqual([]);
  });

  it("copies a scene-only Character locally without rewriting the scene", async () => {
    const root = record("root");

    const value = history(["root"], root);

    const local = new FakeLocalStore();

    const scene = new FakeSceneStore(value);

    const result = await executeCharacterReconciliation(
      "character-1",
      local,
      scene,
      options(),
    );

    expect(result.status).toBe("synchronized");

    expect(local.putCalls).toHaveLength(1);

    expect(local.current?.history).toEqual(value);

    expect(local.current?.sync.pendingRevisionIds).toEqual([]);

    expect(scene.putCalls).toHaveLength(0);
  });

  it("does not write the scene when the required local durable write fails", async () => {
    const root = record("root");

    const value = history(["root"], root);

    const local = new FakeLocalStore(entry(value));

    local.failPutCalls.add(1);

    const scene = new FakeSceneStore();

    const result = await executeCharacterReconciliation(
      "character-1",
      local,
      scene,
      options(),
    );

    expect(result).toMatchObject({
      status: "failed",

      phase: "write-local",
    });

    expect(scene.putCalls).toHaveLength(0);

    expect(local.current?.sync.pendingRevisionIds).toEqual([]);
  });

  it("leaves the desired heads pending when the scene write fails", async () => {
    const root = record("root");

    const value = history(["root"], root);

    const local = new FakeLocalStore(entry(value));

    const scene = new FakeSceneStore();

    scene.failPutCalls.add(1);

    const result = await executeCharacterReconciliation(
      "character-1",
      local,
      scene,
      options(),
    );

    expect(result).toMatchObject({
      status: "retry",

      reason: "scene-write-failed",

      sceneConfirmed: false,
    });

    expect(local.current?.sync.pendingRevisionIds).toEqual(["root"]);

    expect(scene.current).toBeUndefined();
  });

  it("does not overwrite a scene that changed after planning", async () => {
    const root = record("root");

    const localHistory = history(["root"], root);

    const competing = record("competing", [], {
      hpCurrent: 3,
    });

    const competingHistory = history(["competing"], competing);

    const local = new FakeLocalStore(entry(localHistory));

    const scene = new FakeSceneStore();

    /*
     * Scene get #1 is the initial read.
     * Scene get #2 is the preflight before write.
     */
    scene.beforeGet.set(2, () => {
      scene.current = clone(competingHistory);
    });

    const result = await executeCharacterReconciliation(
      "character-1",
      local,
      scene,
      options(),
    );

    expect(result).toMatchObject({
      status: "retry",

      reason: "scene-changed-before-write",
    });

    expect(scene.putCalls).toHaveLength(0);

    expect(scene.current).toEqual(competingHistory);

    expect(local.current?.sync.pendingRevisionIds).toEqual(["root"]);
  });

  it("skips a redundant scene write when another context already wrote the desired history", async () => {
    const root = record("root");

    const value = history(["root"], root);

    const local = new FakeLocalStore(entry(value));

    const scene = new FakeSceneStore();

    scene.beforeGet.set(2, () => {
      scene.current = clone(value);
    });

    const result = await executeCharacterReconciliation(
      "character-1",
      local,
      scene,
      options(),
    );

    expect(result.status).toBe("synchronized");

    expect(scene.putCalls).toHaveLength(0);

    expect(local.current?.sync.pendingRevisionIds).toEqual([]);
  });

  it("does not send an obsolete scene write when local state changes during scene preflight", async () => {
    const root = record("root");

    const value = history(["root"], root);

    const newer = record(
      "newer",
      ["root"],
      {
        hpCurrent: 3,
      },
      {
        revision: 2,
      },
    );

    const newerHistory = history(["newer"], root, newer);

    const local = new FakeLocalStore(entry(value));

    const scene = new FakeSceneStore();

    /*
     * Local gets:
     * 1 = initial
     * 2 = preflight before pending write
     * 3 = immediate check before scene write
     */
    local.beforeGet.set(3, () => {
      local.current = entry(newerHistory, ["newer"]);
    });

    const result = await executeCharacterReconciliation(
      "character-1",
      local,
      scene,
      options(),
    );

    expect(result).toMatchObject({
      status: "retry",

      reason: "local-changed-before-scene-write",
    });

    expect(scene.putCalls).toHaveLength(0);

    expect(local.current?.history).toEqual(newerHistory);
  });

  it("keeps pending state when the scene readback does not match the submitted history", async () => {
    const root = record("root");

    const value = history(["root"], root);

    const competing = record("competing", [], {
      armor: 9,
    });

    const competingHistory = history(["competing"], competing);

    const local = new FakeLocalStore(entry(value));

    const scene = new FakeSceneStore();

    scene.afterPut = (target) => {
      target.current = clone(competingHistory);
    };

    const result = await executeCharacterReconciliation(
      "character-1",
      local,
      scene,
      options(),
    );

    expect(result).toMatchObject({
      status: "retry",

      reason: "scene-not-confirmed",

      sceneConfirmed: false,
    });

    expect(local.current?.sync.pendingRevisionIds).toEqual(["root"]);

    expect(scene.current).toEqual(competingHistory);
  });

  it("does not overwrite newer local state while clearing a confirmed pending marker", async () => {
    const root = record("root");

    const value = history(["root"], root);

    const newer = record(
      "newer",
      ["root"],
      {
        hpCurrent: 2,
      },
      {
        revision: 2,
      },
    );

    const newerHistory = history(["newer"], root, newer);

    const local = new FakeLocalStore(entry(value));

    const scene = new FakeSceneStore();

    /*
     * Local gets:
     * 1 = initial
     * 2 = preflight before pending write
     * 3 = before scene write
     * 4 = after confirmed scene write
     */
    local.beforeGet.set(4, () => {
      local.current = entry(newerHistory, ["newer"]);
    });

    const result = await executeCharacterReconciliation(
      "character-1",
      local,
      scene,
      options(),
    );

    expect(result).toMatchObject({
      status: "retry",

      reason: "local-changed-after-scene",

      sceneConfirmed: true,
    });

    expect(local.current?.history).toEqual(newerHistory);

    expect(local.current?.sync.pendingRevisionIds).toEqual(["newer"]);

    expect(scene.current).toEqual(value);
  });

  it("does not clear an existing pending marker before final scene verification", async () => {
    const root = record("root");

    const value = history(["root"], root);

    const next = record(
      "next",
      ["root"],
      {
        hpCurrent: 4,
      },
      {
        revision: 2,
      },
    );

    const newer = history(["next"], root, next);

    const local = new FakeLocalStore(entry(value, ["root"]));

    const scene = new FakeSceneStore(value);

    /*
     * Scene get 1 establishes the original matching
     * scene history.
     *
     * Scene get 2 is final verification.
     */
    scene.beforeGet.set(2, () => {
      scene.current = clone(newer);
    });

    const result = await executeCharacterReconciliation(
      "character-1",
      local,
      scene,
      options(),
    );

    expect(result).toMatchObject({
      status: "retry",

      reason: "scene-changed-during-reconciliation",

      sceneConfirmed: false,
    });

    /*
     * Confirmation failed, so the conservative pending
     * marker must survive.
     */
    expect(local.current?.sync.pendingRevisionIds).toEqual(["root"]);

    /*
     * The executor should not have cleared and rewritten
     * the local entry before verification.
     */
    expect(local.putCalls).toHaveLength(0);

    expect(scene.current).toEqual(newer);
  });

  it("clears an old pending marker when the scene already confirms the same history", async () => {
    const root = record("root");

    const value = history(["root"], root);

    const local = new FakeLocalStore(entry(value, ["root"]));

    const scene = new FakeSceneStore(value);

    const result = await executeCharacterReconciliation(
      "character-1",
      local,
      scene,
      options(),
    );

    expect(result.status).toBe("synchronized");

    expect(scene.putCalls).toHaveLength(0);

    expect(local.putCalls).toHaveLength(1);

    expect(local.current?.sync.pendingRevisionIds).toEqual([]);
  });

  it("propagates a safe unresolved conflict without choosing a winner", async () => {
    const root = record("root", [], {
      hpCurrent: 10,
    });

    const left = record(
      "left",
      ["root"],
      {
        hpCurrent: 5,
      },
      {
        revision: 2,
      },
    );

    const right = record(
      "right",
      ["root"],
      {
        hpCurrent: 15,
      },
      {
        revision: 2,
      },
    );

    const local = new FakeLocalStore(entry(history(["left"], root, left)));

    const scene = new FakeSceneStore(history(["right"], root, right));

    const factory = vi.fn(() => {
      throw new Error("must not request merge metadata");
    });

    const result = await executeCharacterReconciliation(
      "character-1",
      local,
      scene,
      {
        createMergeRevisionOptions: factory,
      },
    );

    expect(result.status).toBe("conflict");

    expect(factory).not.toHaveBeenCalled();

    expect(local.current?.history.heads).toEqual(["left", "right"]);

    expect(local.current?.sync.pendingRevisionIds).toEqual([]);

    expect(scene.current?.heads).toEqual(["left", "right"]);

    expect(scene.current?.revisions.left).toBeDefined();

    expect(scene.current?.revisions.right).toBeDefined();
  });

  it("does not write either store for an unsafe revision-ID collision", async () => {
    const localRevision = record("same-id", [], {
      hpCurrent: 5,
    });

    const sceneRevision = record("same-id", [], {
      hpCurrent: 15,
    });

    const local = new FakeLocalStore(
      entry(history(["same-id"], localRevision)),
    );

    const scene = new FakeSceneStore(history(["same-id"], sceneRevision));

    const result = await executeCharacterReconciliation(
      "character-1",
      local,
      scene,
      options(),
    );

    expect(result).toMatchObject({
      status: "conflict",

      sceneConfirmed: false,
    });

    expect(local.putCalls).toHaveLength(0);

    expect(scene.putCalls).toHaveLength(0);

    expect(local.current?.history.revisions["same-id"].deleted).not.toBe(true);
  });

  it("persists an automatic merge locally before synchronizing it to the scene", async () => {
    const root = record("root", [], {
      hpCurrent: 10,
      armor: 1,
    });

    const left = record(
      "left",
      ["root"],
      {
        hpCurrent: 7,
        armor: 1,
      },
      {
        revision: 2,
      },
    );

    const right = record(
      "right",
      ["root"],
      {
        hpCurrent: 10,
        armor: 2,
      },
      {
        revision: 2,
      },
    );

    const local = new FakeLocalStore(entry(history(["left"], root, left)));

    const scene = new FakeSceneStore(history(["right"], root, right));

    const result = await executeCharacterReconciliation(
      "character-1",
      local,
      scene,
      options("merged"),
    );

    expect(result.status).toBe("synchronized");

    expect(local.putCalls[0].history.heads).toEqual(["merged"]);

    expect(local.putCalls[0].sync.pendingRevisionIds).toEqual(["merged"]);

    expect(scene.putCalls[0].heads).toEqual(["merged"]);

    expect(local.current?.sync.pendingRevisionIds).toEqual([]);

    expect(local.current?.history.revisions.merged).toBeDefined();
  });

  it("keeps the conservative pending marker when clearing it fails after scene confirmation", async () => {
    const root = record("root");

    const value = history(["root"], root);

    const local = new FakeLocalStore(entry(value));

    /*
     * Put 1 marks the head pending.
     * Put 2 attempts to clear it.
     */
    local.failPutCalls.add(2);

    const scene = new FakeSceneStore();

    const result = await executeCharacterReconciliation(
      "character-1",
      local,
      scene,
      options(),
    );

    expect(result).toMatchObject({
      status: "retry",

      reason: "local-confirmation-write-failed",

      sceneConfirmed: true,
    });

    expect(scene.current).toEqual(value);

    expect(local.current?.sync.pendingRevisionIds).toEqual(["root"]);
  });

  it("notices a scene change even when no scene write was originally needed", async () => {
    const root = record("root");

    const value = history(["root"], root);

    const next = record(
      "next",
      ["root"],
      {
        hpCurrent: 4,
      },
      {
        revision: 2,
      },
    );

    const newer = history(["next"], root, next);

    const local = new FakeLocalStore(entry(value));

    const scene = new FakeSceneStore(value);

    /*
     * Scene get 1 = reconciliation input.
     * Scene get 2 = final verification.
     */
    scene.beforeGet.set(2, () => {
      scene.current = clone(newer);
    });

    const result = await executeCharacterReconciliation(
      "character-1",
      local,
      scene,
      options(),
    );

    expect(result).toMatchObject({
      status: "retry",

      reason: "scene-changed-during-reconciliation",

      sceneConfirmed: false,
    });

    expect(scene.putCalls).toHaveLength(0);

    expect(scene.current).toEqual(newer);
  });

  it("reports initial local read failure without touching the scene", async () => {
    const local = new FakeLocalStore();

    local.failGetCalls.add(1);

    const scene = new FakeSceneStore();

    const result = await executeCharacterReconciliation(
      "character-1",
      local,
      scene,
      options(),
    );

    expect(result).toMatchObject({
      status: "failed",

      phase: "read-local",
    });

    expect(scene.getCalls).toBe(0);

    expect(scene.putCalls).toHaveLength(0);
  });

  it("reports initial scene read failure before making local changes", async () => {
    const root = record("root");

    const value = history(["root"], root);

    const local = new FakeLocalStore(entry(value));

    const scene = new FakeSceneStore();

    scene.failGetCalls.add(1);

    const result = await executeCharacterReconciliation(
      "character-1",
      local,
      scene,
      options(),
    );

    expect(result).toMatchObject({
      status: "failed",

      phase: "read-scene",
    });

    expect(local.putCalls).toHaveLength(0);

    expect(scene.putCalls).toHaveLength(0);
  });
});
