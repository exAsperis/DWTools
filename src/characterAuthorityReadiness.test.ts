import { describe, expect, it } from "vitest";
import { reconcileCharacterAuthorityWithScene } from "./characterAuthorityReadiness";
import { automaticCharacterReconciliationOptions } from "./characterAutomaticMerge";
import {
  CharacterLocalStore,
  LOCAL_CHARACTER_ENTRY_FORMAT_VERSION,
} from "./characterLocalStore";
import {
  CharacterSceneStore,
  type CharacterSceneMetadataApi,
} from "./characterSceneStore";
import { activeRecord } from "./characterTestHelpers";
import type { CharacterHistory } from "./characterRevision";
import type { RoomMetadata } from "./defaultVisibility";

class MemoryStorage implements Storage {
  private values = new Map<string, string>();
  get length() {
    return this.values.size;
  }
  clear() {
    this.values.clear();
  }
  getItem(key: string) {
    return this.values.get(key) ?? null;
  }
  key(index: number) {
    return [...this.values.keys()][index] ?? null;
  }
  removeItem(key: string) {
    this.values.delete(key);
  }
  setItem(key: string, value: string) {
    this.values.set(key, value);
  }
}

class SceneApi implements CharacterSceneMetadataApi {
  metadata: RoomMetadata = {};
  listeners = new Set<(metadata: RoomMetadata) => void>();
  failWrites = false;
  beforeGet?: Promise<void>;
  async getMetadata() {
    await this.beforeGet;
    return structuredClone(this.metadata);
  }
  async setMetadata(update: RoomMetadata) {
    if (this.failWrites) throw new Error("write failed");
    this.metadata = { ...this.metadata, ...structuredClone(update) };
    for (const listener of this.listeners) listener(this.metadata);
  }
  onMetadataChange(callback: (metadata: RoomMetadata) => void) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }
}

function history(
  head: string,
  ...records: ReturnType<typeof activeRecord>[]
): CharacterHistory {
  return {
    formatVersion: 1,
    characterId: "character-1",
    revisions: Object.fromEntries(
      records.map((record) => [record.writeId, record]),
    ),
    heads: [head],
  };
}

function putLocal(store: CharacterLocalStore, value: CharacterHistory) {
  store.put({
    formatVersion: LOCAL_CHARACTER_ENTRY_FORMAT_VERSION,
    roomId: store.roomId,
    characterId: value.characterId,
    history: value,
    sync: { pendingRevisionIds: [] },
  });
}

async function ready(
  local: CharacterLocalStore,
  scene: CharacterSceneStore,
  calls: string[] = [],
) {
  await reconcileCharacterAuthorityWithScene({
    localStore: local,
    sceneStore: scene,
    mutationLock: {
      runExclusive: async (_roomId, operation) => {
        calls.push("lock");
        return operation();
      },
    },
    reconciliation: automaticCharacterReconciliationOptions,
  });
}

describe("reconcileCharacterAuthorityWithScene", () => {
  it("hydrates a scene-only Character and stops temporary subscriptions", async () => {
    const local = new CharacterLocalStore(new MemoryStorage(), "room-1");
    const api = new SceneApi();
    const scene = new CharacterSceneStore(api);
    const root = activeRecord("character-1", { writeId: "A" });
    await scene.put(history("A", root));
    await ready(local, scene);
    expect(local.get("character-1")?.history.heads).toEqual(["A"]);
    expect(api.listeners.size).toBe(0);
  });

  it("hydrates a newer scene descendant before returning", async () => {
    const local = new CharacterLocalStore(new MemoryStorage(), "room-1");
    const api = new SceneApi();
    const scene = new CharacterSceneStore(api);
    const a = activeRecord("character-1", { writeId: "A" });
    const b = activeRecord("character-1", {
      writeId: "B",
      revision: 2,
      parents: ["A"],
      fields: { ...a.fields, hpCurrent: 4 },
    });
    putLocal(local, history("A", a));
    await scene.put(history("B", a, b));
    const locks: string[] = [];
    await ready(local, scene, locks);
    expect(local.get("character-1")?.history.heads).toEqual(["B"]);
    expect(locks.length).toBeGreaterThan(0);
  });

  it("does not finish readiness before the current scene hydrates local state", async () => {
    const local = new CharacterLocalStore(new MemoryStorage(), "room-1");
    const api = new SceneApi();
    const scene = new CharacterSceneStore(api);
    const a = activeRecord("character-1", { writeId: "A" });
    const b = activeRecord("character-1", {
      writeId: "B",
      revision: 2,
      parents: ["A"],
    });
    putLocal(local, history("A", a));
    await scene.put(history("B", a, b));
    let release!: () => void;
    api.beforeGet = new Promise<void>((resolve) => {
      release = resolve;
    });
    let exposed = false;
    const readiness = ready(local, scene).then(() => {
      exposed = true;
    });
    await Promise.resolve();
    expect(exposed).toBe(false);
    expect(local.get("character-1")?.history.heads).toEqual(["A"]);
    release();
    await readiness;
    expect(local.get("character-1")?.history.heads).toEqual(["B"]);
  });

  it("writes a newer local descendant to the scene", async () => {
    const local = new CharacterLocalStore(new MemoryStorage(), "room-1");
    const scene = new CharacterSceneStore(new SceneApi());
    const a = activeRecord("character-1", { writeId: "A" });
    const b = activeRecord("character-1", {
      writeId: "B",
      revision: 2,
      parents: ["A"],
    });
    putLocal(local, history("B", a, b));
    await scene.put(history("A", a));
    await ready(local, scene);
    expect((await scene.get("character-1"))?.heads).toEqual(["B"]);
  });

  it("blocks readiness when a required scene write fails", async () => {
    const local = new CharacterLocalStore(new MemoryStorage(), "room-1");
    const api = new SceneApi();
    const scene = new CharacterSceneStore(api);
    const a = activeRecord("character-1", { writeId: "A" });
    putLocal(local, history("A", a));
    api.failWrites = true;
    await expect(ready(local, scene)).rejects.toMatchObject({
      code: "CONFLICT",
    });
    expect(api.listeners.size).toBe(0);
  });
});
