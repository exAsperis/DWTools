import type {
  CharacterLocalChange,
  CharacterLocalStoreIssue,
  CharacterLocalStoreScan,
} from "./characterLocalStore";

import type {
  CharacterSceneChange,
  CharacterSceneStoreIssue,
  CharacterSceneStoreScan,
} from "./characterSceneStore";

import type { CharacterReconciliationOptions } from "./characterReconciliation";

import {
  executeCharacterReconciliation,
  type CharacterLocalExecutionStore,
  type CharacterSceneExecutionStore,
  type CharacterStorageExecutionResult,
} from "./characterStorageExecutor";

import type { CharacterHistory } from "./characterRevision";

export interface CharacterCoordinatorLocalStore extends CharacterLocalExecutionStore {
  scan(): CharacterLocalStoreScan;

  subscribe(callback: (change: CharacterLocalChange) => void): () => void;
}

export interface CharacterCoordinatorSceneStore extends CharacterSceneExecutionStore {
  scan(): Promise<CharacterSceneStoreScan>;

  subscribe(callback: (changes: CharacterSceneChange[]) => void): () => void;
}

export type CharacterCoordinatorIssue =
  | {
      source: "local";
      issue: CharacterLocalStoreIssue;
    }
  | {
      source: "scene";
      issue: CharacterSceneStoreIssue;
    };

export type CharacterReconciliationExecutor = (
  characterId: string,
  localStore: CharacterLocalExecutionStore,
  sceneStore: CharacterSceneExecutionStore,
  options: CharacterReconciliationOptions,
) => Promise<CharacterStorageExecutionResult>;

export interface CharacterReconciliationCoordinatorOptions {
  reconciliation: CharacterReconciliationOptions;

  /**
   * Generation captured for the scene to which this
   * coordinator belongs.
   */
  sceneGeneration: number;

  /**
   * Returns true only while the coordinator's captured
   * generation is still the current active-scene
   * generation.
   */
  isSceneGenerationCurrent(generation: number): boolean;

  onResult?(result: CharacterStorageExecutionResult): void;

  onIssue?(issue: CharacterCoordinatorIssue): void;

  onError?(error: unknown): void;

  /**
   * Injection point for tests.
   *
   * Production/default behavior uses the real
   * executeCharacterReconciliation().
   */
  executor?: CharacterReconciliationExecutor;
}

export class CharacterSceneGenerationError extends Error {
  constructor(readonly generation: number) {
    super(`Character scene generation ${generation} is no longer current.`);

    this.name = "CharacterSceneGenerationError";
  }
}

/**
 * Wrap a CharacterSceneExecutionStore so stale scene
 * generations cannot knowingly continue reading or
 * writing through it.
 *
 * We check both before and after async calls.
 *
 * A generation change during the underlying Owlbear
 * setMetadata call cannot be atomically cancelled by this
 * wrapper. The local-first executor still preserves the
 * desired history and pending markers so a later
 * reconciliation can recover.
 */
export class GenerationGuardedCharacterSceneStore implements CharacterSceneExecutionStore {
  constructor(
    private readonly store: CharacterSceneExecutionStore,

    private readonly generation: number,

    private readonly isCurrent: (generation: number) => boolean,
  ) {}

  async get(characterId: string): Promise<CharacterHistory | undefined> {
    this.assertCurrent();

    const result = await this.store.get(characterId);

    this.assertCurrent();

    return result;
  }

  async put(history: CharacterHistory): Promise<CharacterHistory> {
    this.assertCurrent();

    const result = await this.store.put(history);

    this.assertCurrent();

    return result;
  }

  private assertCurrent(): void {
    if (!this.isCurrent(this.generation)) {
      throw new CharacterSceneGenerationError(this.generation);
    }
  }
}

export class CharacterReconciliationCoordinator {
  private readonly pendingCharacterIds = new Set<string>();

  private readonly idleResolvers: Array<() => void> = [];

  private readonly executor: CharacterReconciliationExecutor;

  private readonly guardedSceneStore: GenerationGuardedCharacterSceneStore;

  private unsubscribeLocal: (() => void) | undefined;

  private unsubscribeScene: (() => void) | undefined;

  private active = false;
  private bootstrapping = false;
  private running = false;

  constructor(
    private readonly localStore: CharacterCoordinatorLocalStore,

    private readonly sceneStore: CharacterCoordinatorSceneStore,

    private readonly options: CharacterReconciliationCoordinatorOptions,
  ) {
    this.executor = options.executor ?? executeCharacterReconciliation;

    this.guardedSceneStore = new GenerationGuardedCharacterSceneStore(
      sceneStore,
      options.sceneGeneration,
      () => this.isActiveGeneration(),
    );
  }

  /**
   * Subscribe first, then scan.
   *
   * Events arriving during bootstrap are queued but not
   * executed until both initial scans finish. This avoids
   * the classic scan/subscribe gap in which a newly added
   * Character could otherwise be missed.
   */
  async start(): Promise<void> {
    if (this.active) {
      return;
    }

    this.active = true;
    this.bootstrapping = true;

    this.unsubscribeLocal = this.localStore.subscribe((change) => {
      this.request(change.characterId);
    });

    this.unsubscribeScene = this.sceneStore.subscribe((changes) => {
      this.requestMany(changes.map((change) => change.characterId));
    });

    try {
      await this.scanAndQueueAll();
    } finally {
      this.bootstrapping = false;

      if (this.active && this.isActiveGeneration()) {
        this.kick();
      } else {
        this.pendingCharacterIds.clear();
        this.resolveIdleIfNeeded();
      }
    }
  }

  /**
   * Stop accepting new work.
   *
   * Work already inside an awaited scene operation cannot
   * be force-cancelled, but the guarded scene adapter
   * rejects subsequent stale operations.
   */
  stop(): void {
    if (!this.active) {
      return;
    }

    this.active = false;

    this.unsubscribeLocal?.();
    this.unsubscribeLocal = undefined;

    this.unsubscribeScene?.();
    this.unsubscribeScene = undefined;

    this.pendingCharacterIds.clear();

    this.resolveIdleIfNeeded();
  }

  /**
   * Request reconciliation for one Character.
   *
   * Repeated requests collapse into one pending set entry.
   */
  request(characterId: string): void {
    if (!this.active || !this.isActiveGeneration() || !characterId) {
      return;
    }

    this.pendingCharacterIds.add(characterId);

    if (!this.bootstrapping) {
      this.kick();
    }
  }

  /**
   * Public explicit rescan.
   *
   * Useful later for scene-open initialization and manual
   * recovery without duplicating discovery logic.
   */
  async requestAll(): Promise<void> {
    if (!this.active || !this.isActiveGeneration()) {
      return;
    }

    await this.scanAndQueueAll();

    if (!this.bootstrapping) {
      this.kick();
    }
  }

  whenIdle(): Promise<void> {
    if (!this.running && this.pendingCharacterIds.size === 0) {
      return Promise.resolve();
    }

    return new Promise((resolve) => this.idleResolvers.push(resolve));
  }

  private requestMany(characterIds: Iterable<string>): void {
    if (!this.active || !this.isActiveGeneration()) {
      return;
    }

    let added = false;

    for (const characterId of characterIds) {
      if (!characterId) {
        continue;
      }

      const before = this.pendingCharacterIds.size;

      this.pendingCharacterIds.add(characterId);

      if (this.pendingCharacterIds.size !== before) {
        added = true;
      }
    }

    if (added && !this.bootstrapping) {
      this.kick();
    }
  }

  private async scanAndQueueAll(): Promise<void> {
    const characterIds = new Set<string>();

    try {
      const localScan = this.localStore.scan();

      for (const entry of localScan.entries) {
        characterIds.add(entry.characterId);
      }

      for (const issue of localScan.issues) {
        this.reportIssue({
          source: "local",
          issue,
        });
      }
    } catch (error) {
      this.reportError(error);
    }

    if (!this.active || !this.isActiveGeneration()) {
      return;
    }

    try {
      const sceneScan = await this.sceneStore.scan();

      if (!this.active || !this.isActiveGeneration()) {
        return;
      }

      for (const history of sceneScan.histories) {
        characterIds.add(history.characterId);
      }

      for (const issue of sceneScan.issues) {
        this.reportIssue({
          source: "scene",
          issue,
        });
      }
    } catch (error) {
      this.reportError(error);
    }

    if (!this.active || !this.isActiveGeneration()) {
      return;
    }

    /*
     * Add all IDs before kicking the queue so startup order
     * is deterministic rather than dependent on which scan
     * happened to complete first.
     */
    for (const characterId of characterIds) {
      this.pendingCharacterIds.add(characterId);
    }
  }

  private kick(): void {
    if (
      this.running ||
      !this.active ||
      this.bootstrapping ||
      !this.isActiveGeneration() ||
      this.pendingCharacterIds.size === 0
    ) {
      this.resolveIdleIfNeeded();
      return;
    }

    void this.drain();
  }

  /**
   * One global serialized queue is intentional.
   *
   * Individual Character metadata keys are independent,
   * but serial execution makes scene generation changes,
   * self-generated notifications, and result ordering much
   * easier to reason about.
   *
   * A notification arriving while Character X is running
   * simply re-adds X to the pending set. X gets one settling
   * reconciliation pass after the current pass finishes.
   */
  private async drain(): Promise<void> {
    if (this.running) {
      return;
    }

    this.running = true;

    try {
      while (
        this.active &&
        this.isActiveGeneration() &&
        this.pendingCharacterIds.size > 0
      ) {
        const characterId = [...this.pendingCharacterIds].sort((left, right) =>
          left.localeCompare(right),
        )[0];

        this.pendingCharacterIds.delete(characterId);

        try {
          const result = await this.executor(
            characterId,
            this.localStore,
            this.guardedSceneStore,
            this.options.reconciliation,
          );

          /*
           * If the scene changed while the executor was
           * running, its result belongs to the stale
           * generation. Do not publish it as current
           * status.
           */
          if (this.active && this.isActiveGeneration()) {
            this.reportResult(result);
          }
        } catch (error) {
          /*
           * The default executor returns structured failure
           * results for expected storage failures.
           *
           * This catch is for truly unexpected exceptions,
           * including injected/test executors.
           */
          if (this.active && this.isActiveGeneration()) {
            this.reportError(error);
          }
        }
      }

      if (!this.isActiveGeneration()) {
        this.pendingCharacterIds.clear();
      }
    } finally {
      this.running = false;

      this.resolveIdleIfNeeded();

      /*
       * An event can arrive after the while condition was
       * evaluated but before running becomes false.
       */
      if (
        this.active &&
        !this.bootstrapping &&
        this.isActiveGeneration() &&
        this.pendingCharacterIds.size > 0
      ) {
        this.kick();
      }
    }
  }

  private isActiveGeneration(): boolean {
    return (
      this.active &&
      this.options.isSceneGenerationCurrent(this.options.sceneGeneration)
    );
  }

  private resolveIdleIfNeeded(): void {
    if (this.running || this.pendingCharacterIds.size > 0) {
      return;
    }

    for (const resolve of this.idleResolvers.splice(0)) {
      resolve();
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
      /*
       * Error reporting itself must never poison the
       * reconciliation queue.
       */
    }
  }
}
