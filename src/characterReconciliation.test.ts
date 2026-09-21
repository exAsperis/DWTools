import { describe, expect, it, vi } from "vitest";

import {
  CHARACTER_RECORD_SCHEMA_VERSION,
  type CharacterRecord,
  type CharacterTombstone,
} from "./characterRepository";

import { activeRecord } from "./characterTestHelpers";

import { parseCharacterHistory } from "./characterHistoryCodec";

import {
  reconcileCharacterHistories,
  reconciliationHasHistory,
  type CharacterReconciliationOptions,
} from "./characterReconciliation";

import type {
  CharacterHistory,
  VersionedCharacterRecord,
} from "./characterRevision";

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

function tombstone(
  writeId: string,
  parents: string[],
  revision: number,
): CharacterTombstone {
  return {
    schemaVersion: CHARACTER_RECORD_SCHEMA_VERSION,

    id: "character-1",

    revision,

    writeId,

    parents,

    deleted: true,

    deletedAt: "2026-09-21T12:00:00.000Z",

    deletedBy: "gm-1",
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

function mergeOptions(writeId = "merge-write"): CharacterReconciliationOptions {
  return {
    createMergeRevisionOptions: () => ({
      writeId,

      actorId: "gm-1",

      updatedAt: "2026-09-21T13:00:00.000Z",
    }),
  };
}

describe("Character history reconciliation", () => {
  it("reports absent when neither store contains the Character", () => {
    expect(
      reconcileCharacterHistories(undefined, undefined, mergeOptions()),
    ).toEqual({
      status: "absent",

      writeLocal: false,

      writeScene: false,
    });
  });

  it("copies a local-only Character to the scene", () => {
    const root = record("root");

    const local = history(["root"], root);

    const result = reconcileCharacterHistories(
      local,
      undefined,
      mergeOptions(),
    );

    expect(result.status).toBe("update-scene");

    if (!reconciliationHasHistory(result)) {
      throw new Error("Expected history");
    }

    expect(result.writeLocal).toBe(false);

    expect(result.writeScene).toBe(true);

    expect(result.history).toEqual(local);
  });

  it("copies a scene-only Character to local storage", () => {
    const root = record("root");

    const scene = history(["root"], root);

    const result = reconcileCharacterHistories(
      undefined,
      scene,
      mergeOptions(),
    );

    expect(result.status).toBe("update-local");

    if (!reconciliationHasHistory(result)) {
      throw new Error("Expected history");
    }

    expect(result.writeLocal).toBe(true);

    expect(result.writeScene).toBe(false);
  });

  it("reports unchanged for identical histories", () => {
    const root = record("root");

    const value = history(["root"], root);

    const result = reconcileCharacterHistories(value, value, mergeOptions());

    expect(result.status).toBe("unchanged");

    if (!reconciliationHasHistory(result)) {
      throw new Error("Expected history");
    }

    expect(result.writeLocal).toBe(false);

    expect(result.writeScene).toBe(false);
  });

  it("fast-forwards the scene when local history is ahead", () => {
    const root = record("root");

    const next = record(
      "next",
      ["root"],
      {
        hpCurrent: 6,
      },
      {
        revision: 2,
      },
    );

    const local = history(["next"], root, next);

    const scene = history(["root"], root);

    const result = reconcileCharacterHistories(local, scene, mergeOptions());

    expect(result.status).toBe("update-scene");

    if (!reconciliationHasHistory(result)) {
      throw new Error("Expected history");
    }

    expect(result.history.heads).toEqual(["next"]);

    expect(result.writeLocal).toBe(false);

    expect(result.writeScene).toBe(true);
  });

  it("fast-forwards local storage when scene history is ahead", () => {
    const root = record("root");

    const next = record(
      "next",
      ["root"],
      {
        armor: 2,
      },
      {
        revision: 2,
      },
    );

    const local = history(["root"], root);

    const scene = history(["next"], root, next);

    const result = reconcileCharacterHistories(local, scene, mergeOptions());

    expect(result.status).toBe("update-local");

    if (!reconciliationHasHistory(result)) {
      throw new Error("Expected history");
    }

    expect(result.history.heads).toEqual(["next"]);
  });

  it("restores missing ancestry knowledge without creating a new Character revision", () => {
    const root = record("root");

    const next = record(
      "next",
      ["root"],
      {},
      {
        revision: 2,
      },
    );

    const local = history(["next"], next);

    const scene = history(["next"], root, next);

    const factory = vi.fn(mergeOptions().createMergeRevisionOptions);

    const result = reconcileCharacterHistories(local, scene, {
      createMergeRevisionOptions: factory,
    });

    expect(result.status).toBe("update-local");

    expect(factory).not.toHaveBeenCalled();

    if (!reconciliationHasHistory(result)) {
      throw new Error("Expected history");
    }

    expect(Object.keys(result.history.revisions).sort()).toEqual([
      "next",
      "root",
    ]);

    expect(result.history.heads).toEqual(["next"]);
  });

  it("automatically merges independent field changes", () => {
    const root = record(
      "root",
      [],
      {
        hpCurrent: 10,
        armor: 1,
      },
      {
        revision: 1,
      },
    );

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

    const local = history(["left"], root, left);

    const scene = history(["right"], root, right);

    const factory = vi.fn((context) => {
      expect(context).toEqual({
        characterId: "character-1",

        baseWriteId: "root",

        parentWriteIds: ["left", "right"],
      });

      return {
        writeId: "merged",

        actorId: "gm-1",

        updatedAt: "2026-09-21T13:00:00.000Z",
      };
    });

    const result = reconcileCharacterHistories(local, scene, {
      createMergeRevisionOptions: factory,
    });

    expect(result.status).toBe("merged");

    if (result.status !== "merged") {
      throw new Error("Expected merge");
    }

    expect(factory).toHaveBeenCalledTimes(1);

    expect(result.mergeRevisionId).toBe("merged");

    expect(result.writeLocal).toBe(true);

    expect(result.writeScene).toBe(true);

    expect(result.history.heads).toEqual(["merged"]);

    const merged = result.history.revisions.merged;

    expect(merged.parents).toEqual(["left", "right"]);

    if (merged.deleted === true) {
      throw new Error("Expected active Character");
    }

    expect(merged.fields.hpCurrent).toBe(7);

    expect(merged.fields.armor).toBe(2);

    expect(merged.revision).toBe(3);

    expect(parseCharacterHistory(result.history)).toEqual(result.history);
  });

  it("uses deterministic parent ordering for a new automatic merge revision", () => {
    const root = record("root");

    const z = record(
      "z-branch",
      ["root"],
      {
        armor: 3,
      },
      {
        revision: 2,
      },
    );

    const a = record(
      "a-branch",
      ["root"],
      {
        hpCurrent: 4,
      },
      {
        revision: 2,
      },
    );

    const result = reconcileCharacterHistories(
      history(["z-branch"], root, z),
      history(["a-branch"], root, a),
      mergeOptions("merged"),
    );

    expect(result.status).toBe("merged");

    if (result.status !== "merged") {
      throw new Error("Expected merge");
    }

    expect(result.history.revisions.merged.parents).toEqual([
      "a-branch",
      "z-branch",
    ]);
  });

  it("preserves incompatible same-field branches as a conflict", () => {
    const root = record("root", [], {
      hpCurrent: 10,
    });

    const left = record(
      "left",
      ["root"],
      {
        hpCurrent: 7,
      },
      {
        revision: 2,
      },
    );

    const right = record(
      "right",
      ["root"],
      {
        hpCurrent: 12,
      },
      {
        revision: 2,
      },
    );

    const factory = vi.fn(() => {
      throw new Error("merge metadata should not be requested");
    });

    const result = reconcileCharacterHistories(
      history(["left"], root, left),

      history(["right"], root, right),

      {
        createMergeRevisionOptions: factory,
      },
    );

    expect(result.status).toBe("conflict");

    if (result.status !== "conflict") {
      throw new Error("Expected conflict");
    }

    expect(result.reason).toBe("merge-conflict");

    expect(result.fields).toEqual(["fields.hpCurrent"]);

    expect(result.history?.heads).toEqual(["left", "right"]);

    expect(result.writeLocal).toBe(true);

    expect(result.writeScene).toBe(true);

    expect(factory).not.toHaveBeenCalled();
  });

  it("treats independently changed inventory as a conflict", () => {
    const root = record(
      "root",
      [],
      {},
      {
        inventory: [["Potion", 1, 1]],
      },
    );

    const left = record(
      "left",
      ["root"],
      {},
      {
        revision: 2,

        inventory: [["Potion", 1, 2]],
      },
    );

    const right = record(
      "right",
      ["root"],
      {},
      {
        revision: 2,

        inventory: [["Potion", 1, 3]],
      },
    );

    const result = reconcileCharacterHistories(
      history(["left"], root, left),

      history(["right"], root, right),

      mergeOptions(),
    );

    expect(result).toMatchObject({
      status: "conflict",

      reason: "merge-conflict",

      fields: ["inventory"],
    });
  });

  it("does not automatically merge a deletion with a divergent edit", () => {
    const root = record("root");

    const edited = record(
      "edited",
      ["root"],
      {
        hpCurrent: 4,
      },
      {
        revision: 2,
      },
    );

    const deleted = tombstone("deleted", ["root"], 2);

    const result = reconcileCharacterHistories(
      history(["edited"], root, edited),

      history(["deleted"], root, deleted),

      mergeOptions(),
    );

    expect(result).toMatchObject({
      status: "conflict",

      reason: "merge-conflict",
    });

    if (result.status === "conflict") {
      expect(result.fields).toContain("deleted");
    }
  });

  it("preserves uncertain heads when ancestry is incomplete", () => {
    const root = record("root");

    const unknown = record(
      "unknown",
      ["missing"],
      {
        hpCurrent: 4,
      },
      {
        revision: 5,
      },
    );

    const result = reconcileCharacterHistories(
      history(["unknown"], unknown),

      history(["root"], root),

      mergeOptions(),
    );

    expect(result.status).toBe("conflict");

    if (result.status !== "conflict") {
      throw new Error("Expected conflict");
    }

    expect(result.reason).toBe("unknown-ancestry");

    expect(result.history?.heads).toEqual(["root", "unknown"]);
  });

  it("preserves disconnected roots instead of guessing which is newer", () => {
    const left = record(
      "left-root",
      [],
      {
        hpCurrent: 4,
      },
      {
        revision: 99,
      },
    );

    const right = record(
      "right-root",
      [],
      {
        hpCurrent: 20,
      },
      {
        revision: 2,
      },
    );

    const result = reconcileCharacterHistories(
      history(["left-root"], left),

      history(["right-root"], right),

      mergeOptions(),
    );

    expect(result).toMatchObject({
      status: "conflict",

      reason: "no-common-ancestor",
    });

    /*
     * The larger numerical revision must not win.
     */
    if (result.status === "conflict") {
      expect(new Set(result.history?.heads)).toEqual(
        new Set(["left-root", "right-root"]),
      );
    }
  });

  it("reports an ambiguous common ancestor rather than choosing one arbitrarily", () => {
    const root = record("root");

    const a = record(
      "a",
      ["root"],
      {},
      {
        revision: 2,
      },
    );

    const b = record(
      "b",
      ["root"],
      {},
      {
        revision: 2,
      },
    );

    const left = record(
      "left",
      ["a", "b"],
      {
        hpCurrent: 4,
      },
      {
        revision: 3,
      },
    );

    const right = record(
      "right",
      ["b", "a"],
      {
        armor: 3,
      },
      {
        revision: 3,
      },
    );

    const value = history(
      ["left", "right"],

      root,
      a,
      b,
      left,
      right,
    );

    const result = reconcileCharacterHistories(
      value,
      undefined,
      mergeOptions(),
    );

    expect(result).toMatchObject({
      status: "conflict",

      reason: "ambiguous-common-ancestor",
    });
  });

  it("preserves more than two unresolved heads without attempting a pairwise merge", () => {
    const root = record("root");

    const a = record(
      "a",
      ["root"],
      {
        hpCurrent: 4,
      },
      {
        revision: 2,
      },
    );

    const b = record(
      "b",
      ["root"],
      {
        armor: 3,
      },
      {
        revision: 2,
      },
    );

    const c = record(
      "c",
      ["root"],
      {
        damage: "d10",
      },
      {
        revision: 2,
      },
    );

    const factory = vi.fn(mergeOptions().createMergeRevisionOptions);

    const result = reconcileCharacterHistories(
      history(["c", "a", "b"], root, a, b, c),

      undefined,

      {
        createMergeRevisionOptions: factory,
      },
    );

    expect(result).toMatchObject({
      status: "conflict",

      reason: "too-many-heads",

      heads: ["a", "b", "c"],

      writeLocal: false,

      writeScene: true,
    });

    expect(factory).not.toHaveBeenCalled();
  });

  it("does not create writes merely because two conflicting head arrays are ordered differently", () => {
    const root = record("root", [], {
      hpCurrent: 10,
    });

    const a = record(
      "a",
      ["root"],
      {
        hpCurrent: 5,
      },
      {
        revision: 2,
      },
    );

    const b = record(
      "b",
      ["root"],
      {
        hpCurrent: 15,
      },
      {
        revision: 2,
      },
    );

    const local = history(["a", "b"], root, a, b);

    const scene = history(["b", "a"], root, a, b);

    const result = reconcileCharacterHistories(local, scene, mergeOptions());

    expect(result).toMatchObject({
      status: "conflict",

      reason: "merge-conflict",

      heads: ["a", "b"],

      writeLocal: false,

      writeScene: false,
    });
  });

  it("rejects a revision-ID collision without overwriting either source", () => {
    const localRoot = record("same-id", [], {
      hpCurrent: 5,
    });

    const sceneRoot = record("same-id", [], {
      hpCurrent: 15,
    });

    const result = reconcileCharacterHistories(
      history(["same-id"], localRoot),

      history(["same-id"], sceneRoot),

      mergeOptions(),
    );

    expect(result).toMatchObject({
      status: "conflict",

      reason: "history-conflict",

      writeLocal: false,

      writeScene: false,
    });

    if (result.status === "conflict") {
      expect(result.history).toBeUndefined();
    }
  });

  it("rejects histories belonging to different Characters", () => {
    const first = history(["one"], record("one"));

    const otherRecord = activeRecord("character-2", {
      writeId: "two",
    });

    const second: CharacterHistory = {
      formatVersion: 1,

      characterId: "character-2",

      revisions: {
        two: otherRecord,
      },

      heads: ["two"],
    };

    const result = reconcileCharacterHistories(first, second, mergeOptions());

    expect(result).toMatchObject({
      status: "conflict",

      reason: "character-mismatch",

      writeLocal: false,

      writeScene: false,
    });
  });

  it("rejects an automatic merge writeId that already exists anywhere in known history", () => {
    const root = record("root");

    const historical = record(
      "historical-id",
      ["root"],
      {},
      {
        revision: 2,
      },
    );

    const left = record(
      "left",
      ["historical-id"],
      {
        hpCurrent: 4,
      },
      {
        revision: 3,
      },
    );

    const right = record(
      "right",
      ["historical-id"],
      {
        armor: 3,
      },
      {
        revision: 3,
      },
    );

    const result = reconcileCharacterHistories(
      history(["left"], root, historical, left),

      history(["right"], root, historical, right),

      mergeOptions("root"),
    );

    expect(result).toMatchObject({
      status: "conflict",

      reason: "merge-write-id-collision",
    });
  });

  it("does not request merge metadata during ordinary fast-forward reconciliation", () => {
    const root = record("root");

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

    const factory = vi.fn(() => {
      throw new Error("should not run");
    });

    const result = reconcileCharacterHistories(
      history(["next"], root, next),

      history(["root"], root),

      {
        createMergeRevisionOptions: factory,
      },
    );

    expect(result.status).toBe("update-scene");

    expect(factory).not.toHaveBeenCalled();
  });

  it("reports merge metadata factory failure without altering either branch", () => {
    const root = record("root");

    const left = record(
      "left",
      ["root"],
      {
        hpCurrent: 4,
      },
      {
        revision: 2,
      },
    );

    const right = record(
      "right",
      ["root"],
      {
        armor: 3,
      },
      {
        revision: 2,
      },
    );

    const result = reconcileCharacterHistories(
      history(["left"], root, left),

      history(["right"], root, right),

      {
        createMergeRevisionOptions: () => {
          throw new Error("UUID unavailable");
        },
      },
    );

    expect(result).toMatchObject({
      status: "conflict",

      reason: "merge-metadata-error",

      message: "UUID unavailable",
    });
  });

  it("does not mutate either input history", () => {
    const root = record("root");

    const left = record(
      "left",
      ["root"],
      {
        hpCurrent: 4,
      },
      {
        revision: 2,
      },
    );

    const right = record(
      "right",
      ["root"],
      {
        armor: 3,
      },
      {
        revision: 2,
      },
    );

    const local = history(["left"], root, left);

    const scene = history(["right"], root, right);

    const beforeLocal = JSON.stringify(local);

    const beforeScene = JSON.stringify(scene);

    reconcileCharacterHistories(local, scene, mergeOptions());

    expect(JSON.stringify(local)).toBe(beforeLocal);

    expect(JSON.stringify(scene)).toBe(beforeScene);
  });
});
