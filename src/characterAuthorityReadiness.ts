import {
  CharacterReconciliationCoordinator,
  type CharacterCoordinatorLocalStore,
  type CharacterCoordinatorSceneStore,
} from "./characterReconciliationCoordinator";
import type { CharacterMutationLock } from "./characterMutationLock";
import type { CharacterReconciliationOptions } from "./characterReconciliation";
import {
  executeCharacterReconciliation,
  type CharacterStorageExecutionResult,
} from "./characterStorageExecutor";
import { CharacterRepositoryError } from "./characterRepository";

export interface CharacterAuthorityReadinessOptions {
  localStore: CharacterCoordinatorLocalStore;
  sceneStore: CharacterCoordinatorSceneStore;
  mutationLock: CharacterMutationLock;
  reconciliation: CharacterReconciliationOptions;
  onResult?(result: CharacterStorageExecutionResult): void;
}

export async function reconcileCharacterAuthorityWithScene(
  options: CharacterAuthorityReadinessOptions,
): Promise<void> {
  const results: CharacterStorageExecutionResult[] = [];
  const errors: unknown[] = [];
  const issues: unknown[] = [];
  const coordinator = new CharacterReconciliationCoordinator(
    options.localStore,
    options.sceneStore,
    {
      reconciliation: options.reconciliation,
      sceneGeneration: 1,
      isSceneGenerationCurrent: () => true,
      executor: (...args) =>
        options.mutationLock.runExclusive(options.localStore.roomId, () =>
          executeCharacterReconciliation(...args),
        ),
      onResult: (result) => {
        results.push(result);
        options.onResult?.(result);
      },
      onError: (error) => errors.push(error),
      onIssue: (issue) => issues.push(issue),
    },
  );
  try {
    await coordinator.start();
    await coordinator.whenIdle();
  } finally {
    coordinator.stop();
  }
  const blocking = results.filter(
    (result) =>
      result.status === "failed" ||
      result.status === "retry" ||
      (result.status === "conflict" && !("history" in result.reconciliation)),
  );
  if (blocking.length || errors.length || issues.length) {
    throw new CharacterRepositoryError(
      "CONFLICT",
      "DWTools could not safely reconcile Character storage with the current scene.",
      { results, errors, issues },
    );
  }
}
