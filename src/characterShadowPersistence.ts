import type { RoomMetadata } from "./defaultVisibility";
import {
  importRoomCharacterMetadataToLocal,
  type CharacterRoomImportLocalStore,
  type CharacterRoomImportResult,
} from "./characterRoomImport";
import {
  CharacterReconciliationCoordinator,
  type CharacterCoordinatorIssue,
  type CharacterCoordinatorLocalStore,
  type CharacterCoordinatorSceneStore,
  type CharacterReconciliationExecutor,
} from "./characterReconciliationCoordinator";
import type { CharacterReconciliationOptions } from "./characterReconciliation";
import type { CharacterStorageExecutionResult } from "./characterStorageExecutor";
import { executeCharacterReconciliation } from "./characterStorageExecutor";
import type { CharacterMutationLock } from "./characterMutationLock";

export interface CharacterShadowRoomStore {
  getMetadata(): Promise<RoomMetadata>;
  subscribe(callback: (metadata: RoomMetadata) => void): () => void;
}

export interface CharacterShadowPersistenceOptions {
  reconciliation: CharacterReconciliationOptions;
  mutationLock: CharacterMutationLock;
  /** Optional test injection. */
  executor?: CharacterReconciliationExecutor;
  onImportResult?(result: CharacterRoomImportResult): void;
  onResult?(result: CharacterStorageExecutionResult): void;
  onIssue?(issue: CharacterCoordinatorIssue): void;
  onError?(error: unknown): void;
}

/**
 * Mirrors authoritative room Characters into local/scene history storage.
 * It deliberately has no room write capability.
 */
export class CharacterShadowPersistence {
  private unsubscribeRoom: (() => void) | undefined;
  private sceneCoordinator: CharacterReconciliationCoordinator | undefined;
  private active = false;
  private importChain = Promise.resolve();

  constructor(
    private readonly localStore: CharacterCoordinatorLocalStore &
      CharacterRoomImportLocalStore,
    private readonly roomStore: CharacterShadowRoomStore,
    private readonly options: CharacterShadowPersistenceOptions,
  ) {}

  async start(): Promise<void> {
    if (this.active) return;
    this.active = true;

    try {
      this.unsubscribeRoom = this.roomStore.subscribe((metadata) => {
        if (this.active) void this.queueImport(metadata);
      });
    } catch (error) {
      this.reportError(error);
    }

    try {
      const metadata = await this.roomStore.getMetadata();
      if (this.active) await this.queueImport(metadata);
    } catch (error) {
      this.reportError(error);
    }
  }

  async startScene(
    sceneStore: CharacterCoordinatorSceneStore,
    generation: number,
    isGenerationCurrent: (generation: number) => boolean,
  ): Promise<void> {
    this.stopScene();
    if (!this.active || !isGenerationCurrent(generation)) return;

    const coordinator = new CharacterReconciliationCoordinator(
      this.localStore,
      sceneStore,
      {
        reconciliation: this.options.reconciliation,
        sceneGeneration: generation,
        isSceneGenerationCurrent: isGenerationCurrent,
        onResult: (result) => this.reportResult(result),
        onIssue: (issue) => this.reportIssue(issue),
        onError: (error) => this.reportError(error),
        executor: (...args) =>
          this.options.mutationLock.runExclusive(this.localStore.roomId, () =>
            (this.options.executor ?? executeCharacterReconciliation)(...args),
          ),
      },
    );

    this.sceneCoordinator = coordinator;

    try {
      await coordinator.start();
    } catch (error) {
      coordinator.stop();
      if (this.sceneCoordinator === coordinator) {
        this.sceneCoordinator = undefined;
      }
      this.reportError(error);
      return;
    }

    if (
      !this.active ||
      this.sceneCoordinator !== coordinator ||
      !isGenerationCurrent(generation)
    ) {
      coordinator.stop();
      if (this.sceneCoordinator === coordinator) {
        this.sceneCoordinator = undefined;
      }
    }
  }

  stopScene(): void {
    const coordinator = this.sceneCoordinator;
    this.sceneCoordinator = undefined;
    coordinator?.stop();
  }

  async whenSceneIdle(): Promise<void> {
    await this.importChain;
    const coordinator = this.sceneCoordinator;
    if (coordinator) await coordinator.whenIdle();
  }

  stop(): void {
    if (!this.active) return;
    this.active = false;
    this.unsubscribeRoom?.();
    this.unsubscribeRoom = undefined;
    this.stopScene();
  }

  private queueImport(metadata: RoomMetadata): Promise<void> {
    const task = this.importChain.then(async () => {
      if (!this.active) return;
      const result = await this.options.mutationLock.runExclusive(
        this.localStore.roomId,
        async () =>
          importRoomCharacterMetadataToLocal(metadata, this.localStore),
      );
      this.reportImportResult(result);
    });
    this.importChain = task.catch((error) => this.reportError(error));
    return this.importChain;
  }

  private reportImportResult(result: CharacterRoomImportResult): void {
    try {
      this.options.onImportResult?.(result);
    } catch (error) {
      this.reportError(error);
    }
  }

  private reportResult(result: CharacterStorageExecutionResult): void {
    try {
      this.options.onResult?.(result);
    } catch (error) {
      this.reportError(error);
    }
  }

  private reportIssue(issue: CharacterCoordinatorIssue): void {
    try {
      this.options.onIssue?.(issue);
    } catch (error) {
      this.reportError(error);
    }
  }

  private reportError(error: unknown): void {
    try {
      (this.options.onError ?? console.error)(error);
    } catch {
      // Diagnostics must never poison shadow synchronization.
    }
  }
}
