import type { CharacterRepository } from "./characterRepository";
import {
  syncAllLinkedCharactersInCurrentScene,
  syncCharacterToCurrentScene,
  type SceneItemStore,
} from "./characterService";

export interface SceneReadySource {
  isReady(): Promise<boolean>;
  onReadyChange(callback: (ready: boolean) => void): () => void;
}

export class CharacterSyncCoordinator {
  private unsubscribeMetadata: (() => void) | undefined;
  private unsubscribeReady: (() => void) | undefined;
  private chain = Promise.resolve();
  private stopped = false;

  constructor(
    private readonly repository: CharacterRepository,
    private readonly scene: SceneItemStore,
    private readonly readiness: SceneReadySource,
    private readonly onError: (error: unknown) => void = console.error,
    private readonly beforeSync: () => Promise<void> = async () => undefined,
  ) {}

  start(): void {
    this.stopped = false;
    this.unsubscribeMetadata = this.repository.subscribe((changes) => {
      for (const change of changes) {
        if (
          change.lookup.status === "missing" ||
          change.lookup.status === "malformed"
        ) {
          continue;
        }
        this.enqueue(() =>
          syncCharacterToCurrentScene(
            this.repository,
            this.scene,
            change.characterId,
          ),
        );
      }
    });
    this.unsubscribeReady = this.readiness.onReadyChange((ready) => {
      if (ready) this.enqueue(() => this.syncReadyScene());
    });
    this.enqueue(() => this.syncReadyScene());
  }

  stop(): void {
    this.stopped = true;
    this.unsubscribeMetadata?.();
    this.unsubscribeMetadata = undefined;
    this.unsubscribeReady?.();
    this.unsubscribeReady = undefined;
  }

  whenIdle(): Promise<void> {
    return this.chain;
  }

  private enqueue(task: () => Promise<unknown>): void {
    this.chain = this.chain
      .then(async () => {
        if (!this.stopped) await task();
      })
      .catch(this.onError);
  }

  private async syncReadyScene(): Promise<void> {
    if (await this.readiness.isReady()) {
      await this.beforeSync();
      if (!(await this.readiness.isReady())) return;
      await syncAllLinkedCharactersInCurrentScene(this.repository, this.scene);
    }
  }
}
