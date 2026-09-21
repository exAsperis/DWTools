import { cloneCharacterHistory } from "./characterHistoryCodec";

import {
  combineHistories,
  createMergeRevision,
  deepEqual,
  findCommonAncestor,
  historyGraph,
  mergeCharacterSnapshots,
  type CharacterHistory,
  type MergeRevisionOptions,
} from "./characterRevision";

export type CharacterReconciliationStatus =
  | "absent"
  | "unchanged"
  | "update-local"
  | "update-scene"
  | "update-both"
  | "merged"
  | "conflict";

export type CharacterReconciliationConflictReason =
  | "invalid-local-history"
  | "invalid-scene-history"
  | "character-mismatch"
  | "history-conflict"
  | "too-many-heads"
  | "unknown-ancestry"
  | "no-common-ancestor"
  | "ambiguous-common-ancestor"
  | "merge-conflict"
  | "merge-metadata-error"
  | "merge-write-id-collision";

export interface CharacterAutomaticMergeContext {
  characterId: string;

  /**
   * The known common ancestor used as the three-way
   * merge base.
   */
  baseWriteId: string;

  /**
   * Ordered deterministically by writeId.
   *
   * Existing revision parent arrays are never reordered.
   * This ordering applies only to the newly created merge
   * revision.
   */
  parentWriteIds: readonly [string, string];
}

export interface CharacterReconciliationOptions {
  /**
   * Called only when two divergent heads have a usable
   * common ancestor and need an automatic merge revision.
   *
   * The caller supplies identity/time information because
   * the pure reconciliation engine must not call
   * crypto.randomUUID(), Date.now(), or Owlbear APIs.
   */
  createMergeRevisionOptions(
    context: CharacterAutomaticMergeContext,
  ): MergeRevisionOptions;
}

export interface CharacterReconciliationPlan {
  characterId: string;

  /**
   * Canonical desired history after reconciliation.
   */
  history: CharacterHistory;

  /**
   * Later storage code should write `history` to the local
   * store when true.
   */
  writeLocal: boolean;

  /**
   * Later storage code should write `history` to the
   * current scene when true.
   */
  writeScene: boolean;
}

export type CharacterReconciliationResult =
  | {
      status: "absent";
      writeLocal: false;
      writeScene: false;
    }
  | ({
      status: "unchanged" | "update-local" | "update-scene" | "update-both";
    } & CharacterReconciliationPlan)
  | ({
      status: "merged";
      mergeRevisionId: string;
    } & CharacterReconciliationPlan)
  | {
      status: "conflict";

      reason: CharacterReconciliationConflictReason;

      /**
       * Present when the known histories could safely be
       * unioned even though their heads could not be
       * resolved.
       *
       * Later storage code may persist this union so no
       * known branch is lost.
       *
       * Absent for fundamentally incompatible inputs such
       * as a revision-ID collision.
       */
      history?: CharacterHistory;

      characterId?: string;

      heads: string[];

      /**
       * Three-way merge field conflicts, when applicable.
       */
      fields?: string[];

      /**
       * Diagnostic detail. Not intended as the final
       * user-facing message.
       */
      message?: string;

      writeLocal: boolean;
      writeScene: boolean;
    };

interface WriteFlags {
  writeLocal: boolean;
  writeScene: boolean;
}

/**
 * CharacterHistory.heads is semantically a set.
 *
 * Canonicalizing only the history-level head order avoids
 * false differences between:
 *
 *   ["A", "B"]
 *
 * and:
 *
 *   ["B", "A"]
 *
 * Revision parent arrays are deliberately NOT reordered.
 */
function canonicalHistory(history: CharacterHistory): CharacterHistory {
  const copy = cloneCharacterHistory(history);

  copy.heads.sort((left, right) => left.localeCompare(right));

  return copy;
}

function writeFlags(
  local: CharacterHistory | undefined,
  scene: CharacterHistory | undefined,
  desired: CharacterHistory,
): WriteFlags {
  return {
    writeLocal: local === undefined || !deepEqual(local, desired),

    writeScene: scene === undefined || !deepEqual(scene, desired),
  };
}

function resolvedStatus(
  flags: WriteFlags,
): "unchanged" | "update-local" | "update-scene" | "update-both" {
  if (!flags.writeLocal && !flags.writeScene) {
    return "unchanged";
  }

  if (flags.writeLocal && flags.writeScene) {
    return "update-both";
  }

  return flags.writeLocal ? "update-local" : "update-scene";
}

function conflictWithHistory(
  reason: CharacterReconciliationConflictReason,
  history: CharacterHistory,
  local: CharacterHistory | undefined,
  scene: CharacterHistory | undefined,
  options: {
    fields?: string[];
    message?: string;
  } = {},
): CharacterReconciliationResult {
  const desired = canonicalHistory(history);

  const flags = writeFlags(local, scene, desired);

  return {
    status: "conflict",
    reason,
    characterId: desired.characterId,
    history: desired,
    heads: [...desired.heads],
    fields: options.fields,
    message: options.message,
    ...flags,
  };
}

function sourceValidationConflict(
  reason: "invalid-local-history" | "invalid-scene-history",
  error: unknown,
  source: CharacterHistory,
): CharacterReconciliationResult {
  return {
    status: "conflict",
    reason,
    characterId: source.characterId,
    heads: [],
    message:
      error instanceof Error ? error.message : "Character history is invalid.",
    writeLocal: false,
    writeScene: false,
  };
}

function normalizedSource(
  history: CharacterHistory | undefined,
): CharacterHistory | undefined {
  return history === undefined ? undefined : canonicalHistory(history);
}

/**
 * Reconcile the histories known by the browser and the
 * current scene.
 *
 * This function is deliberately storage-agnostic.
 *
 * It does not perform any writes.
 *
 * It does not decide which side is authoritative.
 *
 * It combines revision knowledge, removes only heads that
 * are provably ancestors of another known head, performs a
 * conservative two-head three-way merge when possible, and
 * otherwise preserves unresolved branches.
 */
export function reconcileCharacterHistories(
  localInput: CharacterHistory | undefined,
  sceneInput: CharacterHistory | undefined,
  options: CharacterReconciliationOptions,
): CharacterReconciliationResult {
  if (localInput === undefined && sceneInput === undefined) {
    return {
      status: "absent",
      writeLocal: false,
      writeScene: false,
    };
  }

  let local: CharacterHistory | undefined;

  let scene: CharacterHistory | undefined;

  try {
    local = normalizedSource(localInput);
  } catch (error) {
    return sourceValidationConflict(
      "invalid-local-history",
      error,
      localInput!,
    );
  }

  try {
    scene = normalizedSource(sceneInput);
  } catch (error) {
    return sourceValidationConflict(
      "invalid-scene-history",
      error,
      sceneInput!,
    );
  }

  if (local && scene && local.characterId !== scene.characterId) {
    return {
      status: "conflict",
      reason: "character-mismatch",
      heads: [...new Set([...local.heads, ...scene.heads])].sort(),
      message: "Local and scene histories belong to different Characters.",
      writeLocal: false,
      writeScene: false,
    };
  }

  const characterId = local?.characterId ?? scene!.characterId;

  let combined: CharacterHistory;

  if (local && scene) {
    const result = combineHistories(local, scene);

    if (result.status === "conflict") {
      return {
        status: "conflict",
        reason: "history-conflict",
        characterId,
        heads: [...new Set([...local.heads, ...scene.heads])].sort(),
        message: result.reason,
        writeLocal: false,
        writeScene: false,
      };
    }

    combined = canonicalHistory(result.history);
  } else {
    combined = canonicalHistory((local ?? scene)!);
  }

  if (combined.heads.length === 1) {
    const flags = writeFlags(local, scene, combined);

    return {
      status: resolvedStatus(flags),
      characterId,
      history: combined,
      ...flags,
    };
  }

  if (combined.heads.length > 2) {
    return conflictWithHistory("too-many-heads", combined, local, scene, {
      message: "Character history has more than two unresolved heads.",
    });
  }

  /*
   * CharacterHistory validation requires at least one
   * head, so the only remaining case is exactly two.
   */
  const parentWriteIds = [combined.heads[0], combined.heads[1]] as const;

  const graph = historyGraph(combined);

  const commonAncestor = findCommonAncestor(
    graph,
    parentWriteIds[0],
    parentWriteIds[1],
  );

  switch (commonAncestor.status) {
    case "unknown":
      return conflictWithHistory("unknown-ancestry", combined, local, scene, {
        message:
          "Missing revision history prevents DWTools from establishing a safe merge base.",
      });

    case "none":
      return conflictWithHistory("no-common-ancestor", combined, local, scene, {
        message:
          "The divergent Character revisions have no known common ancestor.",
      });

    case "ambiguous":
      return conflictWithHistory(
        "ambiguous-common-ancestor",
        combined,
        local,
        scene,
        {
          message:
            "The divergent Character revisions have multiple incomparable common ancestors.",
        },
      );

    case "found":
      break;
  }

  const base = combined.revisions[commonAncestor.id];

  const left = combined.revisions[parentWriteIds[0]];

  const right = combined.revisions[parentWriteIds[1]];

  /*
   * Heads and the returned common ancestor must exist in a
   * valid CharacterHistory. Keep this defensive guard
   * anyway because reconciliation must fail conservatively
   * rather than manufacture state.
   */
  if (!base || !left || !right) {
    return conflictWithHistory("unknown-ancestry", combined, local, scene, {
      message: "A required Character revision is unavailable.",
    });
  }

  const mergePreview = mergeCharacterSnapshots(base, left, right);

  if (mergePreview.status === "conflict") {
    return conflictWithHistory("merge-conflict", combined, local, scene, {
      fields: [...mergePreview.fields].sort(),

      message: "The divergent Character revisions changed incompatible data.",
    });
  }

  let mergeOptions: MergeRevisionOptions;

  try {
    mergeOptions = options.createMergeRevisionOptions({
      characterId,
      baseWriteId: commonAncestor.id,
      parentWriteIds,
    });
  } catch (error) {
    return conflictWithHistory("merge-metadata-error", combined, local, scene, {
      message:
        error instanceof Error
          ? error.message
          : "Automatic merge metadata could not be created.",
    });
  }

  /*
   * createMergeRevision checks collisions against the
   * base and the two direct parents.
   *
   * Reconciliation must additionally reject a generated
   * writeId that collides with ANY known historical
   * revision.
   */
  if (
    Object.prototype.hasOwnProperty.call(
      combined.revisions,
      mergeOptions.writeId,
    )
  ) {
    return conflictWithHistory(
      "merge-write-id-collision",
      combined,
      local,
      scene,
      {
        message: `Automatic merge writeId ${mergeOptions.writeId} already exists in Character history.`,
      },
    );
  }

  let merge;

  try {
    merge = createMergeRevision(base, left, right, mergeOptions);
  } catch (error) {
    return conflictWithHistory("merge-metadata-error", combined, local, scene, {
      message:
        error instanceof Error
          ? error.message
          : "Automatic merge revision could not be created.",
    });
  }

  if (merge.status === "conflict") {
    return conflictWithHistory("merge-conflict", combined, local, scene, {
      fields: [...merge.fields].sort(),

      message: "The divergent Character revisions changed incompatible data.",
    });
  }

  const mergedHistory = canonicalHistory({
    formatVersion: 1,

    characterId,

    revisions: {
      ...combined.revisions,

      [merge.record.writeId]: merge.record,
    },

    heads: [merge.record.writeId],
  });

  return {
    status: "merged",

    characterId,

    history: mergedHistory,

    mergeRevisionId: merge.record.writeId,

    /*
     * The merge revision is brand new, so neither input
     * store can already contain the desired history.
     */
    writeLocal: true,
    writeScene: true,
  };
}

/**
 * Test/helper predicate for downstream storage code.
 */
export function reconciliationHasHistory(
  result: CharacterReconciliationResult,
): result is Exclude<
  CharacterReconciliationResult,
  {
    status: "absent";
  }
> & {
  history: CharacterHistory;
} {
  return "history" in result && result.history !== undefined;
}
