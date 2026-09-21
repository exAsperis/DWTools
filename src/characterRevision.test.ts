import { describe, expect, it } from "vitest";

import type { CharacterRecord } from "./characterRepository";

import {
  combineHistories,
  compareAncestry,
  createMergeRevision,
  deepEqual,
  findCommonAncestor,
  historyGraph,
  mergeCharacterSnapshots,
  validateHistory,
  type CharacterHistory,
  type VersionedCharacterRecord,
} from "./characterRevision";

import { activeRecord } from "./characterTestHelpers";

function record(
  writeId: string,
  parents: string[] = [],
  changes: Partial<CharacterRecord["fields"]> = {},
  overrides: Partial<CharacterRecord> = {},
): VersionedCharacterRecord {
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

    heads,

    revisions: Object.fromEntries(
      records.map((entry) => [entry.writeId, entry]),
    ),
  };
}

describe("deepEqual", () => {
  it("ignores object property insertion order", () => {
    expect(deepEqual({ a: 1, b: 2 }, { b: 2, a: 1 })).toBe(true);
  });

  it("preserves array ordering", () => {
    expect(deepEqual(["a", "b"], ["b", "a"])).toBe(false);
  });

  it("distinguishes missing and undefined properties", () => {
    expect(deepEqual({}, { hpCurrent: undefined })).toBe(false);
  });

  it("compares nested values structurally", () => {
    expect(
      deepEqual(
        {
          inventory: [["Potion", 1, 3]],
        },
        {
          inventory: [["Potion", 1, 3]],
        },
      ),
    ).toBe(true);
  });
});

describe("revision ancestry", () => {
  const root = record("root");

  const second = record("second", ["root"]);

  const third = record("third", ["second"]);

  const branch = record("branch", ["root"]);

  const graph = historyGraph(
    history(["third", "branch"], root, second, third, branch),
  );

  it("recognizes identical revisions", () => {
    expect(compareAncestry(graph, "root", "root")).toBe("same");
  });

  it("recognizes indirect ancestry", () => {
    expect(compareAncestry(graph, "root", "third")).toBe("ancestor");
  });

  it("does not reverse ancestry", () => {
    expect(compareAncestry(graph, "third", "root")).toBe("diverged");
  });

  it("recognizes divergent branches", () => {
    expect(compareAncestry(graph, "third", "branch")).toBe("diverged");
  });

  it("reports unknown ancestry when a node is absent", () => {
    const incomplete = historyGraph(
      history(["third"], root, record("third", ["missing"])),
    );

    expect(compareAncestry(incomplete, "root", "third")).toBe("unknown");
  });

  it("finds the nearest common ancestor", () => {
    expect(findCommonAncestor(graph, "third", "branch")).toEqual({
      status: "found",
      id: "root",
    });
  });

  it("returns unknown when ancestor history is incomplete", () => {
    const incomplete = historyGraph(
      history(
        ["left", "right"],
        record("left", ["missing"]),
        record("right", ["missing"]),
      ),
    );

    expect(findCommonAncestor(incomplete, "left", "right")).toEqual({
      status: "unknown",
    });
  });

  it("does not invent a common ancestor", () => {
    const disconnected = historyGraph(
      history(["left", "right"], record("left"), record("right")),
    );

    expect(findCommonAncestor(disconnected, "left", "right")).toEqual({
      status: "none",
    });
  });

  it("recognizes multiple incomparable merge bases", () => {
    const ambiguous = historyGraph(
      history(
        ["left", "right"],

        record("root"),

        record("a", ["root"]),
        record("b", ["root"]),

        record("left", ["a", "b"]),

        record("right", ["b", "a"]),
      ),
    );

    expect(findCommonAncestor(ambiguous, "left", "right")).toEqual({
      status: "ambiguous",
    });
  });
});

describe("history validation", () => {
  it("accepts a valid history", () => {
    const result = validateHistory(
      history(["second"], record("root"), record("second", ["root"])),
    );

    expect(result).toEqual([]);
  });

  it("reports missing parent records", () => {
    const result = validateHistory(
      history(["second"], record("second", ["missing"])),
    );

    expect(result).toContainEqual({
      code: "missing-parent",
      revisionId: "second",
      relatedId: "missing",
    });
  });

  it("reports duplicate parents", () => {
    const result = validateHistory(
      history(["second"], record("root"), record("second", ["root", "root"])),
    );

    expect(result.some((issue) => issue.code === "duplicate-parent")).toBe(
      true,
    );
  });

  it("detects revision cycles", () => {
    const result = validateHistory(
      history(["a"], record("a", ["b"]), record("b", ["a"])),
    );

    expect(result.some((issue) => issue.code === "cycle")).toBe(true);
  });

  it("reports missing heads", () => {
    const result = validateHistory(history(["missing"], record("root")));

    expect(result).toContainEqual({
      code: "missing-head",
      revisionId: "missing",
    });
  });

  it("rejects a revision associated with another Character", () => {
    const incorrect = {
      ...record("root"),
      id: "another-character",
    };

    const result = validateHistory(history(["root"], incorrect));

    expect(result.some((issue) => issue.code === "invalid-identity")).toBe(
      true,
    );
  });
});

describe("combining histories", () => {
  it("fast-forwards a known ancestor", () => {
    const root = record("root");
    const next = record("next", ["root"]);

    const result = combineHistories(
      history(["root"], root),

      history(["next"], root, next),
    );

    expect(result.status).toBe("combined");

    if (result.status !== "combined") {
      throw new Error(result.reason);
    }

    expect(result.history.heads).toEqual(["next"]);

    expect(Object.keys(result.history.revisions)).toHaveLength(2);
  });

  it("preserves divergent heads", () => {
    const root = record("root");

    const left = record("left", ["root"]);

    const right = record("right", ["root"]);

    const result = combineHistories(
      history(["left"], root, left),

      history(["right"], root, right),
    );

    expect(result.status).toBe("combined");

    if (result.status !== "combined") {
      throw new Error(result.reason);
    }

    expect(new Set(result.history.heads)).toEqual(new Set(["left", "right"]));
  });

  it("does not discard an uncertain head", () => {
    const root = record("root");

    const unknown = record("unknown", ["missing"]);

    const result = combineHistories(
      history(["root"], root),

      history(["unknown"], unknown),
    );

    expect(result.status).toBe("combined");

    if (result.status !== "combined") {
      throw new Error(result.reason);
    }

    expect(new Set(result.history.heads)).toEqual(new Set(["root", "unknown"]));
  });

  it("rejects identical revision IDs with different contents", () => {
    const left = record("same-id", [], { hpCurrent: 10 });

    const right = record("same-id", [], { hpCurrent: 5 });

    const result = combineHistories(
      history(["same-id"], left),

      history(["same-id"], right),
    );

    expect(result.status).toBe("conflict");
  });

  it("does not mutate either source history", () => {
    const root = record("root");

    const original = history(["root"], root);

    const before = JSON.stringify(original);

    const result = combineHistories(original, history(["root"], root));

    expect(result.status).toBe("combined");
    expect(JSON.stringify(original)).toBe(before);
  });
});

describe("three-way Character merging", () => {
  const base = record(
    "base",
    [],
    {
      hpCurrent: 15,
      armor: 1,
    },
    {
      revision: 12,
      inventory: [["Potion", 1, 3]],
    },
  );

  const local = record(
    "local",
    ["base"],
    {
      hpCurrent: 12,
      armor: 1,
    },
    {
      revision: 13,
      inventory: [["Potion", 1, 3]],
    },
  );

  const remote = record(
    "remote",
    ["base"],
    {
      hpCurrent: 15,
      armor: 2,
    },
    {
      revision: 13,
      inventory: [["Potion", 1, 3]],
    },
  );

  it("merges independent field changes", () => {
    const result = mergeCharacterSnapshots(base, local, remote);

    expect(result.status).toBe("merged");

    if (result.status !== "merged") {
      throw new Error(result.fields.join(", "));
    }

    expect(result.data.fields.hpCurrent).toBe(12);
    expect(result.data.fields.armor).toBe(2);
  });

  it("does not mutate its input records", () => {
    const before = JSON.stringify([base, local, remote]);

    mergeCharacterSnapshots(base, local, remote);

    expect(JSON.stringify([base, local, remote])).toBe(before);
  });

  it("reports incompatible changes to the same field", () => {
    const conflictingRemote = record(
      "conflicting",
      ["base"],
      {
        hpCurrent: 18,
        armor: 1,
      },
      {
        revision: 13,
        inventory: [["Potion", 1, 3]],
      },
    );

    const result = mergeCharacterSnapshots(base, local, conflictingRemote);

    expect(result).toEqual({
      status: "conflict",
      fields: ["fields.hpCurrent"],
    });
  });

  it("accepts identical independent field changes", () => {
    const other = record(
      "other",
      ["base"],
      {
        hpCurrent: 12,
        armor: 1,
      },
      {
        revision: 13,
        inventory: [["Potion", 1, 3]],
      },
    );

    const result = mergeCharacterSnapshots(base, local, other);

    expect(result.status).toBe("merged");
  });

  it("merges an HP change with an inventory change", () => {
    const inventoryBranch = record(
      "inventory-branch",
      ["base"],
      {
        hpCurrent: 15,
        armor: 1,
      },
      {
        revision: 13,
        inventory: [["Potion", 1, 4]],
      },
    );

    const result = mergeCharacterSnapshots(base, local, inventoryBranch);

    expect(result.status).toBe("merged");

    if (result.status !== "merged") {
      throw new Error(result.fields.join(", "));
    }

    expect(result.data.fields.hpCurrent).toBe(12);

    expect(result.data.inventory).toEqual([["Potion", 1, 4]]);
  });

  it("refuses incompatible inventory changes", () => {
    const inventoryLeft = record(
      "inventory-left",
      ["base"],
      {},
      {
        revision: 13,
        inventory: [["Potion", 1, 2]],
      },
    );

    const inventoryRight = record(
      "inventory-right",
      ["base"],
      {},
      {
        revision: 13,
        inventory: [["Potion", 1, 4]],
      },
    );

    const result = mergeCharacterSnapshots(base, inventoryLeft, inventoryRight);

    expect(result).toEqual({
      status: "conflict",
      fields: ["inventory"],
    });
  });

  it("refuses incompatible deletion and editing", () => {
    const deleted: VersionedCharacterRecord = {
      schemaVersion: 4,
      id: "character-1",
      revision: 13,
      writeId: "deleted",
      parents: ["base"],

      deleted: true,
      deletedAt: "2026-07-27T12:00:00.000Z",
      deletedBy: "gm-1",
    };

    const result = mergeCharacterSnapshots(base, local, deleted);

    expect(result.status).toBe("conflict");
  });

  it("creates a merge revision with two parents", () => {
    const result = createMergeRevision(base, local, remote, {
      writeId: "merged",
      actorId: "gm-1",
      updatedAt: "2026-07-28T12:00:00.000Z",
    });

    expect(result.status).toBe("merged");

    if (result.status !== "merged") {
      throw new Error(result.fields.join(", "));
    }

    expect(result.record.writeId).toBe("merged");

    expect(result.record.parents).toEqual(["local", "remote"]);

    expect(result.record.revision).toBe(14);

    expect(result.record.fields.hpCurrent).toBe(12);
    expect(result.record.fields.armor).toBe(2);

    expect(result.record.updatedBy).toBe("gm-1");
  });

  it("recognizes a merge commit as a descendant of both branches", () => {
    const merged = createMergeRevision(base, local, remote, {
      writeId: "merged",
      actorId: "gm-1",
      updatedAt: "2026-07-28T12:00:00.000Z",
    });

    if (merged.status !== "merged") {
      throw new Error(merged.fields.join(", "));
    }

    const graph = historyGraph(
      history(["merged"], base, local, remote, merged.record),
    );

    expect(compareAncestry(graph, "local", "merged")).toBe("ancestor");

    expect(compareAncestry(graph, "remote", "merged")).toBe("ancestor");
  });

  it("refuses to reuse a parent revision ID", () => {
    expect(() =>
      createMergeRevision(base, local, remote, {
        writeId: "local",
        actorId: "gm-1",
        updatedAt: "2026-07-28T12:00:00.000Z",
      }),
    ).toThrow();
  });
});
