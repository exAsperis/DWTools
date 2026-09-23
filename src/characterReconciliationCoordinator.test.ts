import { describe, expect, it, vi } from "vitest";

import { activeRecord } from "./characterTestHelpers";

import {
  LOCAL_CHARACTER_ENTRY_FORMAT_VERSION,
  type CharacterLocalChange,
  type CharacterLocalEntry,
  type CharacterLocalStoreIssue,
  type CharacterLocalStoreScan,
} from "./characterLocalStore";

import {
  type CharacterSceneChange,
  type CharacterSceneStoreIssue,
  type CharacterSceneStoreScan,
} from "./characterSceneStore";

import {
  CharacterReconciliationCoordinator,
  CharacterSceneGenerationError,
  GenerationGuardedCharacterSceneStore,
  type CharacterCoordinatorLocalStore,
  type CharacterCoordinatorSceneStore,
  type CharacterReconciliationExecutor,
} from "./characterReconciliationCoordinator";

import type { CharacterReconciliationOptions } from "./characterReconciliation";

import type { CharacterStorageExecutionResult } from "./characterStorageExecutor";

import type { CharacterHistory } from "./characterRevision";

function history(characterId: string, writeId = "root"): CharacterHistory {
  const record = activeRecord(characterId, {
    writeId,
  });

  return {
    formatVersion: 1,

    characterId,

    revisions: {
      [writeId]: record,
    },

    heads: [writeId],
  };
}

function localEntry(characterId: string): CharacterLocalEntry {
  return {
    formatVersion: LOCAL_CHARACTER_ENTRY_FORMAT_VERSION,

    roomId: "room-1",

    characterId,

    history: history(characterId),

    sync: {
      pendingRevisionIds: [],
    },
  };
}

function reconciliationOptions(): CharacterReconciliationOptions {
  return {
    createMergeRevisionOptions: () => ({
      writeId: "merge-write",

      actorId: "gm-1",

      updatedAt: "2026-09-21T15:00:00.000Z",
    }),
  };
}

function synchronized(characterId: string): CharacterStorageExecutionResult {
  const value = localEntry(characterId);

  return {
    status: "synchronized",

    characterId,

    reconciliation: {
      status: "unchanged",

      characterId,

      history: value.history,

      writeLocal: false,

      writeScene: false,
    },

    localEntry: value,

    sceneConfirmed: true,
  };
}

class FakeCoordinatorLocalStore implements CharacterCoordinatorLocalStore {
  readonly roomId = "room-1";

  entries = new Map<string, CharacterLocalEntry>();

  issues: CharacterLocalStoreIssue[] = [];

  scanError: unknown;

  private readonly listeners = new Set<
    (change: CharacterLocalChange) => void
  >();

  constructor(characterIds: string[] = []) {
    for (const characterId of characterIds) {
      this.entries.set(characterId, localEntry(characterId));
    }
  }

  scan(): CharacterLocalStoreScan {
    if (this.scanError !== undefined) {
      throw this.scanError;
    }

    return {
      entries: [...this.entries.values()],

      issues: [...this.issues],
    };
  }

  get(characterId: string): CharacterLocalEntry | undefined {
    return this.entries.get(characterId);
  }

  put(entry: CharacterLocalEntry): CharacterLocalEntry {
    this.entries.set(entry.characterId, entry);

    this.emit(entry.characterId);

    return entry;
  }

  subscribe(callback: (change: CharacterLocalChange) => void): () => void {
    this.listeners.add(callback);

    return () => this.listeners.delete(callback);
  }

  emit(characterId: string): void {
    for (const listener of this.listeners) {
      listener({
        characterId,
        source: "local",
      });
    }
  }

  listenerCount(): number {
    return this.listeners.size;
  }
}

class FakeCoordinatorSceneStore implements CharacterCoordinatorSceneStore {
  histories = new Map<string, CharacterHistory>();

  issues: CharacterSceneStoreIssue[] = [];

  scanError: unknown;

  getCalls = 0;
  putCalls = 0;

  beforeGet?: () => void;

  beforePut?: () => void;

  private readonly listeners = new Set<
    (changes: CharacterSceneChange[]) => void
  >();

  constructor(characterIds: string[] = []) {
    for (const characterId of characterIds) {
      this.histories.set(characterId, history(characterId));
    }
  }

  async scan(): Promise<CharacterSceneStoreScan> {
    if (this.scanError !== undefined) {
      throw this.scanError;
    }

    return {
      histories: [...this.histories.values()],

      issues: [...this.issues],
    };
  }

  async get(characterId: string): Promise<CharacterHistory | undefined> {
    this.getCalls += 1;

    this.beforeGet?.();

    return this.histories.get(characterId);
  }

  async put(value: CharacterHistory): Promise<CharacterHistory> {
    this.putCalls += 1;

    this.beforePut?.();

    this.histories.set(value.characterId, value);

    this.emit([
      {
        characterId: value.characterId,

        kind: "changed",
      },
    ]);

    return value;
  }

  subscribe(callback: (changes: CharacterSceneChange[]) => void): () => void {
    this.listeners.add(callback);

    return () => this.listeners.delete(callback);
  }

  emit(changes: CharacterSceneChange[]): void {
    for (const listener of this.listeners) {
      listener(changes);
    }
  }

  listenerCount(): number {
    return this.listeners.size;
  }
}

function deferred(): {
  promise: Promise<void>;
  resolve(): void;
} {
  let resolve: (() => void) | undefined;

  const promise = new Promise<void>((next) => {
    resolve = next;
  });

  return {
    promise,

    resolve: () => resolve?.(),
  };
}

describe("GenerationGuardedCharacterSceneStore", () => {
  it("rejects a stale generation before reading", async () => {
    const scene = new FakeCoordinatorSceneStore(["character-1"]);

    const current = false;

    const guarded = new GenerationGuardedCharacterSceneStore(
      scene,
      7,
      () => current,
    );

    await expect(guarded.get("character-1")).rejects.toBeInstanceOf(
      CharacterSceneGenerationError,
    );

    expect(scene.getCalls).toBe(0);
  });

  it("rejects a generation that changes while a read is in flight", async () => {
    const scene = new FakeCoordinatorSceneStore(["character-1"]);

    let current = true;

    scene.beforeGet = () => {
      current = false;
    };

    const guarded = new GenerationGuardedCharacterSceneStore(
      scene,
      7,
      () => current,
    );

    await expect(guarded.get("character-1")).rejects.toBeInstanceOf(
      CharacterSceneGenerationError,
    );

    expect(scene.getCalls).toBe(1);
  });

  it("does not begin a scene write after the generation is stale", async () => {
    const scene = new FakeCoordinatorSceneStore();

    const guarded = new GenerationGuardedCharacterSceneStore(
      scene,
      7,
      () => false,
    );

    await expect(guarded.put(history("character-1"))).rejects.toBeInstanceOf(
      CharacterSceneGenerationError,
    );

    expect(scene.putCalls).toBe(0);
  });
});

describe("CharacterReconciliationCoordinator", () => {
  it("discovers the union of local and scene Characters on start", async () => {
    const local = new FakeCoordinatorLocalStore(["b", "a"]);

    const scene = new FakeCoordinatorSceneStore(["b", "c"]);

    const calls: string[] = [];

    const executor: CharacterReconciliationExecutor = async (characterId) => {
      calls.push(characterId);

      return synchronized(characterId);
    };

    const coordinator = new CharacterReconciliationCoordinator(local, scene, {
      reconciliation: reconciliationOptions(),

      sceneGeneration: 1,

      isSceneGenerationCurrent: () => true,

      executor,
    });

    await coordinator.start();
    await coordinator.whenIdle();

    expect(calls).toEqual(["a", "b", "c"]);

    coordinator.stop();
  });

  it("coalesces repeated notifications for one Character while it is already running", async () => {
    const local = new FakeCoordinatorLocalStore(["character-1"]);

    const scene = new FakeCoordinatorSceneStore();

    const first = deferred();

    const calls: string[] = [];

    const executor: CharacterReconciliationExecutor = async (characterId) => {
      calls.push(characterId);

      if (calls.length === 1) {
        await first.promise;
      }

      return synchronized(characterId);
    };

    const coordinator = new CharacterReconciliationCoordinator(local, scene, {
      reconciliation: reconciliationOptions(),

      sceneGeneration: 1,

      isSceneGenerationCurrent: () => true,

      executor,
    });

    await coordinator.start();

    /*
     * The initial request is now inside the executor.
     */
    local.emit("character-1");

    local.emit("character-1");

    scene.emit([
      {
        characterId: "character-1",

        kind: "changed",
      },
    ]);

    first.resolve();

    await coordinator.whenIdle();

    /*
     * Three notifications collapse to one settling pass.
     */
    expect(calls).toEqual(["character-1", "character-1"]);

    coordinator.stop();
  });

  it("serializes different Characters instead of running their executors concurrently", async () => {
    const local = new FakeCoordinatorLocalStore(["a", "b", "c"]);

    const scene = new FakeCoordinatorSceneStore();

    let concurrent = 0;
    let maximumConcurrent = 0;

    const executor: CharacterReconciliationExecutor = async (characterId) => {
      concurrent += 1;

      maximumConcurrent = Math.max(maximumConcurrent, concurrent);

      await Promise.resolve();

      concurrent -= 1;

      return synchronized(characterId);
    };

    const coordinator = new CharacterReconciliationCoordinator(local, scene, {
      reconciliation: reconciliationOptions(),

      sceneGeneration: 1,

      isSceneGenerationCurrent: () => true,

      executor,
    });

    await coordinator.start();
    await coordinator.whenIdle();

    expect(maximumConcurrent).toBe(1);

    coordinator.stop();
  });

  it("does not automatically spin on a retry result when no new event arrives", async () => {
    const local = new FakeCoordinatorLocalStore(["character-1"]);

    const scene = new FakeCoordinatorSceneStore();

    let calls = 0;

    const executor: CharacterReconciliationExecutor = async (characterId) => {
      calls += 1;

      return {
        status: "retry",

        characterId,

        reason: "scene-write-failed",

        reconciliation: {
          status: "update-scene",

          characterId,

          history: history(characterId),

          writeLocal: false,
          writeScene: true,
        },

        localEntry: localEntry(characterId),

        sceneConfirmed: false,
      };
    };

    const coordinator = new CharacterReconciliationCoordinator(local, scene, {
      reconciliation: reconciliationOptions(),

      sceneGeneration: 1,

      isSceneGenerationCurrent: () => true,

      executor,
    });

    await coordinator.start();
    await coordinator.whenIdle();

    expect(calls).toBe(1);

    coordinator.stop();
  });

  it("runs one settling pass for a notification produced during execution", async () => {
    const local = new FakeCoordinatorLocalStore(["character-1"]);

    const scene = new FakeCoordinatorSceneStore();

    let calls = 0;

    const executor: CharacterReconciliationExecutor = async (characterId) => {
      calls += 1;

      if (calls === 1) {
        local.emit(characterId);

        local.emit(characterId);
      }

      return synchronized(characterId);
    };

    const coordinator = new CharacterReconciliationCoordinator(local, scene, {
      reconciliation: reconciliationOptions(),

      sceneGeneration: 1,

      isSceneGenerationCurrent: () => true,

      executor,
    });

    await coordinator.start();
    await coordinator.whenIdle();

    expect(calls).toBe(2);

    coordinator.stop();
  });

  it("stops queued work after its scene generation becomes stale", async () => {
    const local = new FakeCoordinatorLocalStore(["a", "b"]);

    const scene = new FakeCoordinatorSceneStore();

    let currentGeneration = 1;

    const calls: string[] = [];

    const executor: CharacterReconciliationExecutor = async (characterId) => {
      calls.push(characterId);

      currentGeneration = 2;

      return synchronized(characterId);
    };

    const coordinator = new CharacterReconciliationCoordinator(local, scene, {
      reconciliation: reconciliationOptions(),

      sceneGeneration: 1,

      isSceneGenerationCurrent: (generation) =>
        generation === currentGeneration,

      executor,
    });

    await coordinator.start();
    await coordinator.whenIdle();

    expect(calls).toEqual(["a"]);

    coordinator.stop();
  });

  it("does not publish a result after the executor's scene generation becomes stale", async () => {
    const local = new FakeCoordinatorLocalStore(["character-1"]);

    const scene = new FakeCoordinatorSceneStore();

    let currentGeneration = 1;

    const results: CharacterStorageExecutionResult[] = [];

    const executor: CharacterReconciliationExecutor = async (characterId) => {
      currentGeneration = 2;

      return synchronized(characterId);
    };

    const coordinator = new CharacterReconciliationCoordinator(local, scene, {
      reconciliation: reconciliationOptions(),

      sceneGeneration: 1,

      isSceneGenerationCurrent: (generation) =>
        generation === currentGeneration,

      onResult: (result) => results.push(result),

      executor,
    });

    await coordinator.start();
    await coordinator.whenIdle();

    expect(results).toEqual([]);

    coordinator.stop();
  });

  it("captures notifications that arrive during bootstrap", async () => {
    const local = new FakeCoordinatorLocalStore();

    const scene = new FakeCoordinatorSceneStore();

    const calls: string[] = [];

    const originalScan = scene.scan.bind(scene);

    scene.scan = async () => {
      local.emit("during-bootstrap");

      return originalScan();
    };

    const executor: CharacterReconciliationExecutor = async (characterId) => {
      calls.push(characterId);

      return synchronized(characterId);
    };

    const coordinator = new CharacterReconciliationCoordinator(local, scene, {
      reconciliation: reconciliationOptions(),

      sceneGeneration: 1,

      isSceneGenerationCurrent: () => true,

      executor,
    });

    await coordinator.start();
    await coordinator.whenIdle();

    expect(calls).toEqual(["during-bootstrap"]);

    coordinator.stop();
  });

  it("reports malformed scan issues without scheduling them as valid Characters", async () => {
    const local = new FakeCoordinatorLocalStore();

    local.issues.push({
      key: "local-broken",

      characterId: "broken-local",

      code: "MALFORMED",

      message: "broken local",
    });

    const scene = new FakeCoordinatorSceneStore();

    scene.issues.push({
      key: "scene-broken",

      characterId: "broken-scene",

      code: "MALFORMED",

      message: "broken scene",
    });

    const issues: Array<{
      source: string;
      message: string;
    }> = [];

    const executor = vi.fn<CharacterReconciliationExecutor>();

    const coordinator = new CharacterReconciliationCoordinator(local, scene, {
      reconciliation: reconciliationOptions(),

      sceneGeneration: 1,

      isSceneGenerationCurrent: () => true,

      onIssue: (value) =>
        issues.push({
          source: value.source,

          message: value.issue.message,
        }),

      executor,
    });

    await coordinator.start();
    await coordinator.whenIdle();

    expect(issues).toEqual([
      {
        source: "local",
        message: "broken local",
      },
      {
        source: "scene",
        message: "broken scene",
      },
    ]);

    expect(executor).not.toHaveBeenCalled();

    coordinator.stop();
  });

  it("reports scan failures without poisoning later explicit requests", async () => {
    const local = new FakeCoordinatorLocalStore();

    local.scanError = new Error("scan exploded");

    const scene = new FakeCoordinatorSceneStore();

    const errors: unknown[] = [];

    const calls: string[] = [];

    const executor: CharacterReconciliationExecutor = async (characterId) => {
      calls.push(characterId);

      return synchronized(characterId);
    };

    const coordinator = new CharacterReconciliationCoordinator(local, scene, {
      reconciliation: reconciliationOptions(),

      sceneGeneration: 1,

      isSceneGenerationCurrent: () => true,

      onError: (error) => errors.push(error),

      executor,
    });

    await coordinator.start();
    await coordinator.whenIdle();

    expect(errors).toHaveLength(1);

    coordinator.request("character-1");

    await coordinator.whenIdle();

    expect(calls).toEqual(["character-1"]);

    coordinator.stop();
  });

  it("unsubscribes and ignores new work after stop", async () => {
    const local = new FakeCoordinatorLocalStore();

    const scene = new FakeCoordinatorSceneStore();

    const executor = vi.fn<CharacterReconciliationExecutor>();

    const coordinator = new CharacterReconciliationCoordinator(local, scene, {
      reconciliation: reconciliationOptions(),

      sceneGeneration: 1,

      isSceneGenerationCurrent: () => true,

      executor,
    });

    await coordinator.start();
    await coordinator.whenIdle();

    expect(local.listenerCount()).toBe(1);

    expect(scene.listenerCount()).toBe(1);

    coordinator.stop();

    expect(local.listenerCount()).toBe(0);

    expect(scene.listenerCount()).toBe(0);

    local.emit("after-stop");

    scene.emit([
      {
        characterId: "after-stop",

        kind: "changed",
      },
    ]);

    coordinator.request("after-stop");

    await coordinator.whenIdle();

    expect(executor).not.toHaveBeenCalled();
  });
});
