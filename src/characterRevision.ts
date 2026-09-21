import type {
  CharacterRecord,
  StoredCharacterRecord,
} from "./characterRepository";

import type { CreatureFields } from "./constants";

/**
 * A Character record with revision ancestry.
 *
 * This separate type allows the revision engine to be developed
 * before CharacterRepository's production schema changes.
 *
 * In Chunk 3, parents will become part of the normal record schema.
 */
export type VersionedCharacterRecord =
  StoredCharacterRecord & {
    parents: string[];
  };

/**
 * The key is the record's existing writeId.
 *
 * A history may have multiple heads when independently created
 * revisions have not yet been reconciled.
 */
export interface CharacterHistory {
  formatVersion: 1;
  characterId: string;

  revisions: Record<string, VersionedCharacterRecord>;
  heads: string[];
}

export interface RevisionNode {
  parents: readonly string[];
}

export type RevisionGraph =
  ReadonlyMap<string, RevisionNode>;

export type Ancestry =
  | "same"
  | "ancestor"
  | "diverged"
  | "unknown";

export type CommonAncestorResult =
  | { status: "found"; id: string }
  | { status: "none" }
  | { status: "unknown" }
  | { status: "ambiguous" };

export type RevisionIssueCode =
  | "invalid-identity"
  | "invalid-parent"
  | "duplicate-parent"
  | "missing-parent"
  | "missing-head"
  | "duplicate-head"
  | "cycle";

export interface RevisionIssue {
  code: RevisionIssueCode;
  revisionId: string;
  relatedId?: string;
}

export type CombineHistoryResult =
  | {
      status: "combined";
      history: CharacterHistory;
    }
  | {
      status: "conflict";
      reason: string;
    };

export interface MergedCharacterData {
  fields: CreatureFields;
  inventory?: CharacterRecord["inventory"];
}

export type CharacterMergeResult =
  | {
      status: "merged";
      data: MergedCharacterData;
    }
  | {
      status: "conflict";
      fields: string[];
    };

export type MergeRevisionResult =
  | {
      status: "merged";
      record: VersionedCharacterRecord & CharacterRecord;
    }
  | {
      status: "conflict";
      fields: string[];
    };

export interface MergeRevisionOptions {
  writeId: string;
  actorId: string;
  updatedAt: string;
}

const hasOwn = (
  object: object,
  key: string,
): boolean =>
  Object.prototype.hasOwnProperty.call(object, key);

/**
 * Compare JSON-like values structurally.
 *
 * Object key order is irrelevant.
 * Array order is significant.
 * A missing property differs from a property explicitly
 * containing undefined.
 *
 * No input values are modified.
 */
export function deepEqual(
  left: unknown,
  right: unknown,
): boolean {
  if (Object.is(left, right)) return true;

  if (
    left === null ||
    right === null ||
    typeof left !== "object" ||
    typeof right !== "object"
  ) {
    return false;
  }

  if (Array.isArray(left) || Array.isArray(right)) {
    if (!Array.isArray(left) || !Array.isArray(right)) {
      return false;
    }

    if (left.length !== right.length) return false;

    return left.every((value, index) =>
      deepEqual(value, right[index]),
    );
  }

  const leftObject = left as Record<string, unknown>;
  const rightObject = right as Record<string, unknown>;

  const leftKeys = Object.keys(leftObject);
  const rightKeys = Object.keys(rightObject);

  if (leftKeys.length !== rightKeys.length) {
    return false;
  }

  return leftKeys.every(
    (key) =>
      hasOwn(rightObject, key) &&
      deepEqual(leftObject[key], rightObject[key]),
  );
}

/**
 * Clone the JSON-like data used in Character records.
 *
 * This intentionally does not use JSON.stringify/parse,
 * which would discard undefined properties.
 */
function cloneValue<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => cloneValue(item)) as T;
  }

  if (
    value !== null &&
    typeof value === "object"
  ) {
    return Object.fromEntries(
      Object.entries(value).map(
        ([key, item]) => [key, cloneValue(item)],
      ),
    ) as T;
  }

  return value;
}

/**
 * Determine whether olderId is an ancestor of newerId.
 *
 * "unknown" means missing history prevents a conclusive
 * comparison.
 *
 * The graph should be validated before using this result
 * to authorize synchronization.
 */
export function compareAncestry(
  graph: RevisionGraph,
  olderId: string,
  newerId: string,
): Ancestry {
  if (!graph.has(olderId) || !graph.has(newerId)) {
    return "unknown";
  }

  if (olderId === newerId) return "same";

  const visited = new Set<string>();
  const pending = [newerId];

  let missingHistory = false;

  while (pending.length > 0) {
    const id = pending.pop()!;

    if (id === olderId) {
      return "ancestor";
    }

    if (visited.has(id)) continue;
    visited.add(id);

    const revision = graph.get(id);

    if (!revision) {
      missingHistory = true;
      continue;
    }

    pending.push(...revision.parents);
  }

  return missingHistory ? "unknown" : "diverged";
}

interface AncestorTraversal {
  ids: Set<string>;
  complete: boolean;
}

/**
 * Collect every known ancestor, including the starting
 * revision itself.
 *
 * A missing node marks the traversal incomplete.
 */
function collectAncestors(
  graph: RevisionGraph,
  startId: string,
): AncestorTraversal {
  const ids = new Set<string>();
  const pending = [startId];

  let complete = true;

  while (pending.length > 0) {
    const id = pending.pop()!;

    if (ids.has(id)) continue;

    const revision = graph.get(id);

    if (!revision) {
      complete = false;
      continue;
    }

    ids.add(id);
    pending.push(...revision.parents);
  }

  return { ids, complete };
}

/**
 * Find the unique nearest common ancestor of two revisions.
 *
 * If multiple incomparable common ancestors exist, return
 * "ambiguous" rather than choosing an arbitrary merge base.
 *
 * If either ancestry traversal is incomplete, return
 * "unknown" rather than pretending that the available
 * history is complete.
 */
export function findCommonAncestor(
  graph: RevisionGraph,
  leftId: string,
  rightId: string,
): CommonAncestorResult {
  const left = collectAncestors(graph, leftId);
  const right = collectAncestors(graph, rightId);

  if (!left.complete || !right.complete) {
    return { status: "unknown" };
  }

  const common = [...left.ids].filter(
    (id) => right.ids.has(id),
  );

  if (common.length === 0) {
    return { status: "none" };
  }

  /*
   * Discard a common ancestor if another common ancestor
   * descends from it.
   *
   * The remaining nodes are the maximal common ancestors.
   */
  const nearest = common.filter(
    (candidate) =>
      !common.some(
        (other) =>
          other !== candidate &&
          compareAncestry(
            graph,
            candidate,
            other,
          ) === "ancestor",
      ),
  );

  if (nearest.length !== 1) {
    return { status: "ambiguous" };
  }

  return {
    status: "found",
    id: nearest[0],
  };
}

/**
 * Validate the structural integrity of one Character history.
 *
 * Missing parents are reported rather than fabricated.
 *
 * The caller may retain incomplete histories for recovery,
 * but must not assume that unknown ancestry establishes
 * an authoritative ordering.
 */
export function validateHistory(
  history: CharacterHistory,
): RevisionIssue[] {
  const issues: RevisionIssue[] = [];

  if (
    history.formatVersion !== 1 ||
    !history.characterId.trim()
  ) {
    issues.push({
      code: "invalid-identity",
      revisionId: history.characterId,
    });
  }

  const revisions = history.revisions;

  for (const [id, record] of Object.entries(revisions)) {
    if (
      record.writeId !== id ||
      record.id !== history.characterId ||
      !Number.isInteger(record.revision) ||
      record.revision < 1
    ) {
      issues.push({
        code: "invalid-identity",
        revisionId: id,
      });
    }

    if (!Array.isArray(record.parents)) {
      issues.push({
        code: "invalid-parent",
        revisionId: id,
      });
      continue;
    }

    const seenParents = new Set<string>();

    for (const parentId of record.parents) {
      if (
        typeof parentId !== "string" ||
        parentId.length === 0
      ) {
        issues.push({
          code: "invalid-parent",
          revisionId: id,
        });
        continue;
      }

      if (seenParents.has(parentId)) {
        issues.push({
          code: "duplicate-parent",
          revisionId: id,
          relatedId: parentId,
        });
      }

      seenParents.add(parentId);

      if (!hasOwn(revisions, parentId)) {
        issues.push({
          code: "missing-parent",
          revisionId: id,
          relatedId: parentId,
        });
      }
    }
  }

  const seenHeads = new Set<string>();

  for (const headId of history.heads) {
    if (seenHeads.has(headId)) {
      issues.push({
        code: "duplicate-head",
        revisionId: headId,
      });
    }

    seenHeads.add(headId);

    if (!hasOwn(revisions, headId)) {
      issues.push({
        code: "missing-head",
        revisionId: headId,
      });
    }
  }

  /*
   * Detect cycles using a depth-first traversal.
   *
   * 0 = unvisited
   * 1 = visiting
   * 2 = complete
   */
  const states = new Map<string, number>();
  const reportedCycles = new Set<string>();

  function visit(id: string): void {
    const state = states.get(id) ?? 0;

    if (state === 2) return;

    if (state === 1) {
      if (!reportedCycles.has(id)) {
        issues.push({
          code: "cycle",
          revisionId: id,
        });

        reportedCycles.add(id);
      }

      return;
    }

    const revision = revisions[id];

    if (!revision) return;

    states.set(id, 1);

    if (Array.isArray(revision.parents)) {
      for (const parentId of revision.parents) {
        if (typeof parentId === "string") {
          visit(parentId);
        }
      }
    }

    states.set(id, 2);
  }

  for (const id of Object.keys(revisions)) {
    visit(id);
  }

  return issues;
}

/**
 * Convert a Character history to an ancestry graph.
 *
 * The returned nodes share no mutable parent arrays
 * with the original history.
 */
export function historyGraph(
  history: CharacterHistory,
): Map<string, RevisionNode> {
  return new Map(
    Object.entries(history.revisions).map(
      ([id, record]) => [
        id,
        { parents: [...record.parents] },
      ],
    ),
  );
}

/**
 * Combine the known histories of the same Character.
 *
 * This does not generate a new revision or perform a
 * three-way data merge.
 *
 * It unions the revision nodes and removes a head only
 * when another head is its known descendant.
 *
 * Missing ancestry must never justify removing a head.
 */
export function combineHistories(
  left: CharacterHistory,
  right: CharacterHistory,
): CombineHistoryResult {
  if (left.characterId !== right.characterId) {
    return {
      status: "conflict",
      reason: "Histories belong to different Characters.",
    };
  }

  const invalidCodes = new Set<RevisionIssueCode>([
    "invalid-identity",
    "invalid-parent",
    "duplicate-parent",
    "missing-head",
    "duplicate-head",
    "cycle",
  ]);

  for (const history of [left, right]) {
    const invalid = validateHistory(history).find(
      (issue) => invalidCodes.has(issue.code),
    );

    if (invalid) {
      return {
        status: "conflict",
        reason:
          `Invalid revision history: ${invalid.code} ` +
          `at ${invalid.revisionId}.`,
      };
    }
  }

  const revisions:
    Record<string, VersionedCharacterRecord> = {};

  for (const history of [left, right]) {
    for (
      const [id, record]
      of Object.entries(history.revisions)
    ) {
      const existing = revisions[id];

      if (
        existing &&
        !deepEqual(existing, record)
      ) {
        return {
          status: "conflict",
          reason:
            `Revision ${id} has different contents ` +
            "in the two histories.",
        };
      }

      revisions[id] = cloneValue(record);
    }
  }

  const combined: CharacterHistory = {
    formatVersion: 1,
    characterId: left.characterId,
    revisions,
    heads: [],
  };

  const graph = historyGraph(combined);

  const candidateHeads = [
    ...new Set([...left.heads, ...right.heads]),
  ];

  combined.heads = candidateHeads.filter(
    (candidate) =>
      !candidateHeads.some(
        (other) =>
          other !== candidate &&
          compareAncestry(
            graph,
            candidate,
            other,
          ) === "ancestor",
      ),
  );

  return {
    status: "combined",
    history: combined,
  };
}

/**
 * Compare whether a particular property has the same
 * presence and value in two objects.
 *
 * Property presence is significant.
 */
function sameProperty(
  left: Record<string, unknown>,
  right: Record<string, unknown>,
  key: string,
): boolean {
  const leftHas = hasOwn(left, key);
  const rightHas = hasOwn(right, key);

  if (leftHas !== rightHas) return false;

  return (
    !leftHas ||
    deepEqual(left[key], right[key])
  );
}

interface PropertyMergeResult {
  values: Record<string, unknown>;
  conflicts: string[];
}

/**
 * Perform a conservative three-way merge of the requested
 * object properties.
 *
 * The merge is independent for each top-level property.
 *
 * Nested objects and arrays are indivisible values.
 */
function mergeProperties(
  base: Record<string, unknown>,
  local: Record<string, unknown>,
  remote: Record<string, unknown>,
  keys: readonly string[],
): PropertyMergeResult {
  const values: Record<string, unknown> = {};
  const conflicts: string[] = [];

  for (const key of keys) {
    let selected: Record<string, unknown>;

    if (sameProperty(local, remote, key)) {
      selected = local;
    } else if (sameProperty(local, base, key)) {
      selected = remote;
    } else if (sameProperty(remote, base, key)) {
      selected = local;
    } else {
      conflicts.push(key);
      continue;
    }

    if (hasOwn(selected, key)) {
      values[key] = cloneValue(selected[key]);
    }
  }

  return { values, conflicts };
}

/**
 * Merge the contents of three Character revisions.
 *
 * The caller must establish that base is a valid common
 * ancestor before calling this function.
 *
 * This function does not infer ancestry from revision
 * numbers, timestamps, or write IDs.
 *
 * It does not create a new revision.
 */
export function mergeCharacterSnapshots(
  base: VersionedCharacterRecord,
  local: VersionedCharacterRecord,
  remote: VersionedCharacterRecord,
): CharacterMergeResult {
  const identityConflicts: string[] = [];

  if (
    base.id !== local.id ||
    base.id !== remote.id
  ) {
    identityConflicts.push("id");
  }

  if (
    base.schemaVersion !== local.schemaVersion ||
    base.schemaVersion !== remote.schemaVersion
  ) {
    identityConflicts.push("schemaVersion");
  }

  if (
    base.deleted === true ||
    local.deleted === true ||
    remote.deleted === true
  ) {
    identityConflicts.push("deleted");
  }

  if (
    base.deleted === true ||
    local.deleted === true ||
    remote.deleted === true
  ) {
    return {
      status: "conflict",
      fields: [...new Set(identityConflicts)],
    };
  }

  if (
    base.createdAt !== local.createdAt ||
    base.createdAt !== remote.createdAt
  ) {
    identityConflicts.push("createdAt");
  }

  if (
    base.createdBy !== local.createdBy ||
    base.createdBy !== remote.createdBy
  ) {
    identityConflicts.push("createdBy");
  }

  if (identityConflicts.length > 0) {
    return {
      status: "conflict",
      fields: identityConflicts,
    };
  }

  const baseFields =
    base.fields as unknown as Record<string, unknown>;

  const localFields =
    local.fields as unknown as Record<string, unknown>;

  const remoteFields =
    remote.fields as unknown as Record<string, unknown>;

  const fieldKeys = [
    ...new Set([
      ...Object.keys(baseFields),
      ...Object.keys(localFields),
      ...Object.keys(remoteFields),
    ]),
  ].sort();

  const fieldMerge = mergeProperties(
    baseFields,
    localFields,
    remoteFields,
    fieldKeys,
  );

  const inventoryMerge = mergeProperties(
    base as unknown as Record<string, unknown>,
    local as unknown as Record<string, unknown>,
    remote as unknown as Record<string, unknown>,
    ["inventory"],
  );

  const conflicts = [
    ...fieldMerge.conflicts.map(
      (field) => `fields.${field}`,
    ),
    ...inventoryMerge.conflicts,
  ];

  if (conflicts.length > 0) {
    return {
      status: "conflict",
      fields: conflicts,
    };
  }

  const data: MergedCharacterData = {
    fields:
      fieldMerge.values as unknown as CreatureFields,
  };

  if (hasOwn(inventoryMerge.values, "inventory")) {
    data.inventory =
      inventoryMerge.values.inventory as
        CharacterRecord["inventory"];
  }

  return {
    status: "merged",
    data,
  };
}

/**
 * Create a merge commit from two divergent Character
 * revisions and their established common ancestor.
 *
 * This function does not discover the common ancestor.
 * The caller must supply it.
 *
 * Revision IDs, actor IDs, and timestamps are injected
 * so tests remain deterministic.
 *
 * No input record is mutated.
 */
export function createMergeRevision(
  base: VersionedCharacterRecord,
  local: VersionedCharacterRecord,
  remote: VersionedCharacterRecord,
  options: MergeRevisionOptions,
): MergeRevisionResult {
  if (
    !options.writeId.trim() ||
    !options.actorId.trim() ||
    !options.updatedAt.trim()
  ) {
    throw new Error(
      "A merge requires a write ID, actor ID, and timestamp.",
    );
  }

  if (
    local.writeId === remote.writeId ||
    options.writeId === local.writeId ||
    options.writeId === remote.writeId ||
    options.writeId === base.writeId
  ) {
    throw new Error(
      "A merge must have two distinct parent revisions " +
      "and a new revision ID.",
    );
  }

  const merged = mergeCharacterSnapshots(
    base,
    local,
    remote,
  );

  if (merged.status === "conflict") {
    return merged;
  }

  /*
   * mergeCharacterSnapshots already rejected tombstones.
   * The following guard also makes the type narrowing
   * explicit to TypeScript.
   */
  if (
    local.deleted === true ||
    remote.deleted === true
  ) {
    return {
      status: "conflict",
      fields: ["deleted"],
    };
  }

  const record:
    VersionedCharacterRecord & CharacterRecord = {
      ...cloneValue(local),

      fields: cloneValue(merged.data.fields),

      revision:
        Math.max(
          local.revision,
          remote.revision,
        ) + 1,

      writeId: options.writeId,

      parents: [
        local.writeId,
        remote.writeId,
      ],

      updatedAt: options.updatedAt,
      updatedBy: options.actorId,
    };

  /*
   * Inventory is optional. Preserve the canonical
   * omitted-property representation for empty inventory.
   */
  if (merged.data.inventory === undefined) {
    delete record.inventory;
  } else {
    record.inventory =
      cloneValue(merged.data.inventory);
  }

  return {
    status: "merged",
    record,
  };
}
