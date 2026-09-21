import { cloneCharacterHistory } from "./characterHistoryCodec";

import {
  LOCAL_CHARACTER_ENTRY_FORMAT_VERSION,
  type CharacterLocalEntry,
} from "./characterLocalStore";

import {
  reconcileCharacterHistories,
  reconciliationHasHistory,
  type CharacterReconciliationOptions,
  type CharacterReconciliationResult,
} from "./characterReconciliation";

import { deepEqual, type CharacterHistory } from "./characterRevision";

export interface CharacterLocalExecutionStore {
  readonly roomId: string;

  get(characterId: string): CharacterLocalEntry | undefined;

  put(entry: CharacterLocalEntry): CharacterLocalEntry;
}

export interface CharacterSceneExecutionStore {
  get(characterId: string): Promise<CharacterHistory | undefined>;

  put(history: CharacterHistory): Promise<CharacterHistory>;
}

export type CharacterStorageRetryReason =
  | "local-changed-before-write"
  | "scene-preflight-read-failed"
  | "scene-changed-before-write"
  | "local-changed-before-scene-write"
  | "scene-write-failed"
  | "scene-verification-read-failed"
  | "scene-not-confirmed"
  | "scene-changed-during-reconciliation"
  | "local-post-scene-read-failed"
  | "local-changed-after-scene"
  | "local-confirmation-write-failed";

export type CharacterStorageFailurePhase =
  "read-local" | "read-scene" | "preflight-local" | "write-local";

export type CharacterStorageExecutionResult =
  | {
      status: "absent";

      characterId: string;

      reconciliation: CharacterReconciliationResult;
    }
  | {
      status: "synchronized";

      characterId: string;

      reconciliation: CharacterReconciliationResult;

      localEntry: CharacterLocalEntry;

      sceneConfirmed: true;
    }
  | {
      status: "conflict";

      characterId: string;

      reconciliation: CharacterReconciliationResult;

      localEntry?: CharacterLocalEntry;

      /**
       * True only when the safe combined history, when
       * one exists, is known to be present in the scene.
       *
       * Unsafe history conflicts do not have a combined
       * history and therefore return false.
       */
      sceneConfirmed: boolean;
    }
  | {
      status: "retry";

      characterId: string;

      reason: CharacterStorageRetryReason;

      reconciliation: CharacterReconciliationResult;

      localEntry?: CharacterLocalEntry;

      sceneConfirmed: boolean;

      error?: unknown;
    }
  | {
      status: "failed";

      characterId: string;

      phase: CharacterStorageFailurePhase;

      error: unknown;

      reconciliation?: CharacterReconciliationResult;
    };

function canonicalHistory(history: CharacterHistory): CharacterHistory {
  const copy = cloneCharacterHistory(history);

  copy.heads.sort((left, right) => left.localeCompare(right));

  return copy;
}

function historiesEquivalent(
  left: CharacterHistory | undefined,
  right: CharacterHistory | undefined,
): boolean {
  if (left === undefined || right === undefined) {
    return left === undefined && right === undefined;
  }

  return deepEqual(canonicalHistory(left), canonicalHistory(right));
}

function canonicalEntry(
  entry: CharacterLocalEntry | undefined,
): CharacterLocalEntry | undefined {
  if (!entry) {
    return undefined;
  }

  return {
    ...entry,

    history: canonicalHistory(entry.history),

    sync: {
      pendingRevisionIds: [...entry.sync.pendingRevisionIds].sort(),
    },
  };
}

function localEntriesEquivalent(
  left: CharacterLocalEntry | undefined,
  right: CharacterLocalEntry | undefined,
): boolean {
  return deepEqual(canonicalEntry(left), canonicalEntry(right));
}

function localEntryFor(
  roomId: string,
  history: CharacterHistory,
  pendingRevisionIds: readonly string[],
): CharacterLocalEntry {
  const canonical = canonicalHistory(history);

  return {
    formatVersion: LOCAL_CHARACTER_ENTRY_FORMAT_VERSION,

    roomId,

    characterId: canonical.characterId,

    history: canonical,

    sync: {
      pendingRevisionIds: [...new Set(pendingRevisionIds)].sort(),
    },
  };
}

function completedResult(
  characterId: string,
  reconciliation: CharacterReconciliationResult,
  localEntry: CharacterLocalEntry,
): CharacterStorageExecutionResult {
  if (reconciliation.status === "conflict") {
    return {
      status: "conflict",

      characterId,

      reconciliation,

      localEntry,

      sceneConfirmed: true,
    };
  }

  return {
    status: "synchronized",

    characterId,

    reconciliation,

    localEntry,

    sceneConfirmed: true,
  };
}

function retryResult(
  characterId: string,
  reason: CharacterStorageRetryReason,
  reconciliation: CharacterReconciliationResult,
  localEntry: CharacterLocalEntry | undefined,
  sceneConfirmed: boolean,
  error?: unknown,
): CharacterStorageExecutionResult {
  return {
    status: "retry",

    characterId,

    reason,

    reconciliation,

    localEntry,

    sceneConfirmed,

    ...(error === undefined ? {} : { error }),
  };
}

/**
 * Execute reconciliation for exactly one Character.
 *
 * This function deliberately does not subscribe to store
 * changes or retry itself. A higher-level coordinator will
 * serialize calls and decide when to invoke it again.
 *
 * The ordering is intentionally local-first:
 *
 *   read
 *   -> plan
 *   -> persist desired local history + pending marker
 *   -> preflight both sources
 *   -> write scene
 *   -> verify scene
 *   -> clear local pending marker
 *
 * This prevents a failed scene write from becoming the
 * only surviving copy of a Character revision.
 */
export async function executeCharacterReconciliation(
  characterId: string,
  localStore: CharacterLocalExecutionStore,
  sceneStore: CharacterSceneExecutionStore,
  options: CharacterReconciliationOptions,
): Promise<CharacterStorageExecutionResult> {
  let initialLocal: CharacterLocalEntry | undefined;

  try {
    initialLocal = localStore.get(characterId);
  } catch (error) {
    return {
      status: "failed",

      characterId,

      phase: "read-local",

      error,
    };
  }

  let initialScene: CharacterHistory | undefined;

  try {
    initialScene = await sceneStore.get(characterId);
  } catch (error) {
    return {
      status: "failed",

      characterId,

      phase: "read-scene",

      error,
    };
  }

  const reconciliation = reconcileCharacterHistories(
    initialLocal?.history,
    initialScene,
    options,
  );

  if (reconciliation.status === "absent") {
    return {
      status: "absent",

      characterId,

      reconciliation,
    };
  }

  /*
   * Unsafe history conflicts, such as two different
   * contents using the same writeId, deliberately have
   * no combined history.
   *
   * Never overwrite either source in that case.
   */
  if (
    reconciliation.status === "conflict" &&
    !reconciliationHasHistory(reconciliation)
  ) {
    return {
      status: "conflict",

      characterId,

      reconciliation,

      localEntry: initialLocal,

      sceneConfirmed: false,
    };
  }

  if (!reconciliationHasHistory(reconciliation)) {
    /*
     * The only history-less non-conflict result is
     * "absent", already handled above.
     *
     * Keep this defensive guard non-destructive.
     */
    return {
      status: "conflict",

      characterId,

      reconciliation,

      localEntry: initialLocal,

      sceneConfirmed: false,
    };
  }

  const desiredHistory = reconciliation.history;

  /*
   * When the scene needs a write, the desired HEAD SET is
   * the durable local marker that the desired scene state
   * has not yet been confirmed.
   *
   * When no scene write is currently planned, preserve any
   * existing pending marker until the final scene
   * verification succeeds. A stale pending marker is safer
   * than clearing one before confirmation.
   */
  const desiredPendingIds = reconciliation.writeScene
    ? [...desiredHistory.heads].sort()
    : [...(initialLocal?.sync.pendingRevisionIds ?? [])].sort();

  const desiredLocalEntry = localEntryFor(
    localStore.roomId,
    desiredHistory,
    desiredPendingIds,
  );

  let persistedLocal = initialLocal;

  const localNeedsWrite = !localEntriesEquivalent(
    initialLocal,
    desiredLocalEntry,
  );

  if (localNeedsWrite) {
    let preflightLocal: CharacterLocalEntry | undefined;

    try {
      preflightLocal = localStore.get(characterId);
    } catch (error) {
      return {
        status: "failed",

        characterId,

        phase: "preflight-local",

        error,

        reconciliation,
      };
    }

    if (!localEntriesEquivalent(preflightLocal, initialLocal)) {
      return retryResult(
        characterId,
        "local-changed-before-write",
        reconciliation,
        preflightLocal,
        false,
      );
    }

    try {
      persistedLocal = localStore.put(desiredLocalEntry);
    } catch (error) {
      /*
       * The local durable write failed.
       *
       * Do NOT attempt a scene write.
       */
      return {
        status: "failed",

        characterId,

        phase: "write-local",

        error,

        reconciliation,
      };
    }
  }

  if (!persistedLocal) {
    /*
     * Every non-absent reconciled Character must exist
     * locally before we continue.
     */
    return {
      status: "failed",

      characterId,

      phase: "write-local",

      error: new Error("Reconciled Character was not persisted locally."),

      reconciliation,
    };
  }

  if (!reconciliation.writeScene) {
    let verifiedScene: CharacterHistory | undefined;

    try {
      verifiedScene = await sceneStore.get(characterId);
    } catch (error) {
      return retryResult(
        characterId,
        "scene-verification-read-failed",
        reconciliation,
        persistedLocal,
        false,
        error,
      );
    }

    if (!historiesEquivalent(verifiedScene, desiredHistory)) {
      /*
       * Do not clear an existing pending marker.
       *
       * The scene changed before final confirmation.
       * Reconciliation must run again with the new scene
       * history.
       */
      return retryResult(
        characterId,
        "scene-changed-during-reconciliation",
        reconciliation,
        persistedLocal,
        false,
      );
    }

    /*
     * The scene now confirms desiredHistory.
     *
     * Clear pending state only if local storage still
     * contains exactly the entry whose scene state we just
     * confirmed.
     */
    let currentLocal: CharacterLocalEntry | undefined;

    try {
      currentLocal = localStore.get(characterId);
    } catch (error) {
      return retryResult(
        characterId,
        "local-post-scene-read-failed",
        reconciliation,
        persistedLocal,
        true,
        error,
      );
    }

    if (!localEntriesEquivalent(currentLocal, persistedLocal)) {
      return retryResult(
        characterId,
        "local-changed-after-scene",
        reconciliation,
        currentLocal,
        true,
      );
    }

    const confirmedLocal = localEntryFor(localStore.roomId, desiredHistory, []);

    if (localEntriesEquivalent(currentLocal, confirmedLocal)) {
      return completedResult(characterId, reconciliation, currentLocal!);
    }

    let savedConfirmedLocal: CharacterLocalEntry;

    try {
      savedConfirmedLocal = localStore.put(confirmedLocal);
    } catch (error) {
      return retryResult(
        characterId,
        "local-confirmation-write-failed",
        reconciliation,
        currentLocal,
        true,
        error,
      );
    }

    return completedResult(characterId, reconciliation, savedConfirmedLocal);
  }

  /*
   * The desired history is now durable locally and its
   * desired heads are marked pending.
   *
   * Re-read the scene before writing so we do not knowingly
   * overwrite a scene revision that appeared after the
   * original reconciliation read.
   */
  let preflightScene: CharacterHistory | undefined;

  try {
    preflightScene = await sceneStore.get(characterId);
  } catch (error) {
    return retryResult(
      characterId,
      "scene-preflight-read-failed",
      reconciliation,
      persistedLocal,
      false,
      error,
    );
  }

  /*
   * Another context may already have written exactly the
   * desired history.
   *
   * In that case, skip the redundant scene write and go
   * directly to local confirmation.
   */
  const sceneAlreadyDesired = historiesEquivalent(
    preflightScene,
    desiredHistory,
  );

  if (
    !sceneAlreadyDesired &&
    !historiesEquivalent(preflightScene, initialScene)
  ) {
    return retryResult(
      characterId,
      "scene-changed-before-write",
      reconciliation,
      persistedLocal,
      false,
    );
  }

  if (!sceneAlreadyDesired) {
    /*
     * The local entry could itself have changed while the
     * scene preflight read was in flight.
     *
     * Re-read it immediately before sending a scene write.
     */
    let beforeSceneLocal: CharacterLocalEntry | undefined;

    try {
      beforeSceneLocal = localStore.get(characterId);
    } catch (error) {
      return retryResult(
        characterId,
        "local-changed-before-scene-write",
        reconciliation,
        persistedLocal,
        false,
        error,
      );
    }

    if (!localEntriesEquivalent(beforeSceneLocal, persistedLocal)) {
      return retryResult(
        characterId,
        "local-changed-before-scene-write",
        reconciliation,
        beforeSceneLocal,
        false,
      );
    }

    try {
      await sceneStore.put(desiredHistory);
    } catch (error) {
      /*
       * Local history remains durable with pending heads.
       */
      return retryResult(
        characterId,
        "scene-write-failed",
        reconciliation,
        persistedLocal,
        false,
        error,
      );
    }

    let readBack: CharacterHistory | undefined;

    try {
      readBack = await sceneStore.get(characterId);
    } catch (error) {
      return retryResult(
        characterId,
        "scene-verification-read-failed",
        reconciliation,
        persistedLocal,
        false,
        error,
      );
    }

    if (!historiesEquivalent(readBack, desiredHistory)) {
      /*
       * Either the write was not retained or another
       * browser changed the scene immediately afterward.
       *
       * Preserve pending local state and reconcile again.
       */
      return retryResult(
        characterId,
        "scene-not-confirmed",
        reconciliation,
        persistedLocal,
        false,
      );
    }
  }

  /*
   * Scene persistence is now confirmed.
   *
   * Clear pending local heads only if the local entry is
   * still exactly the entry whose scene synchronization we
   * just confirmed.
   *
   * A newer local revision must never be overwritten by
   * this cleanup.
   */
  let currentLocal: CharacterLocalEntry | undefined;

  try {
    currentLocal = localStore.get(characterId);
  } catch (error) {
    return retryResult(
      characterId,
      "local-post-scene-read-failed",
      reconciliation,
      persistedLocal,
      true,
      error,
    );
  }

  if (!localEntriesEquivalent(currentLocal, persistedLocal)) {
    return retryResult(
      characterId,
      "local-changed-after-scene",
      reconciliation,
      currentLocal,
      true,
    );
  }

  const confirmedLocal = localEntryFor(localStore.roomId, desiredHistory, []);

  if (localEntriesEquivalent(currentLocal, confirmedLocal)) {
    return completedResult(characterId, reconciliation, currentLocal!);
  }

  let savedConfirmedLocal: CharacterLocalEntry;

  try {
    savedConfirmedLocal = localStore.put(confirmedLocal);
  } catch (error) {
    /*
     * Scene history is confirmed.
     *
     * The stale pending marker is conservative and can be
     * cleared on a later reconciliation pass.
     */
    return retryResult(
      characterId,
      "local-confirmation-write-failed",
      reconciliation,
      currentLocal,
      true,
      error,
    );
  }

  return completedResult(characterId, reconciliation, savedConfirmedLocal);
}
