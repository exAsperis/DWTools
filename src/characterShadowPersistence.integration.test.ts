import { describe, expect, it } from "vitest";
import { automaticCharacterReconciliationOptions } from "./characterAutomaticMerge";
import { CharacterLocalStore } from "./characterLocalStore";
import {
  CharacterSceneStore,
  type CharacterSceneMetadataApi,
} from "./characterSceneStore";
import { CharacterShadowPersistence } from "./characterShadowPersistence";
import { activeRecord } from "./characterTestHelpers";
import { CHARACTER_KEY_PREFIX, LEGACY_CHARACTER_KEY_PREFIX } from "./constants";
import type { RoomMetadata } from "./defaultVisibility";

class MemoryStorage implements Storage {
  private readonly values = new Map<string, string>();
  get length(): number {
    return this.values.size;
  }
  clear(): void {
    this.values.clear();
  }
  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }
  key(index: number): string | null {
    return [...this.values.keys()][index] ?? null;
  }
  removeItem(key: string): void {
    this.values.delete(key);
  }
  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }
}

class RoomStore {
  private readonly listeners = new Set<(metadata: RoomMetadata) => void>();
  constructor(private metadata: RoomMetadata) {}
  async getMetadata(): Promise<RoomMetadata> {
    return structuredClone(this.metadata);
  }
  subscribe(callback: (metadata: RoomMetadata) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }
  emit(metadata: RoomMetadata): void {
    this.metadata = metadata;
    for (const listener of this.listeners) listener(structuredClone(metadata));
  }
}

class SceneApi implements CharacterSceneMetadataApi {
  metadata: RoomMetadata = {};
  private readonly listeners = new Set<(metadata: RoomMetadata) => void>();
  async getMetadata(): Promise<RoomMetadata> {
    return structuredClone(this.metadata);
  }
  async setMetadata(update: RoomMetadata): Promise<void> {
    this.metadata = { ...this.metadata, ...structuredClone(update) };
    for (const listener of this.listeners)
      listener(structuredClone(this.metadata));
  }
  onMetadataChange(callback: (metadata: RoomMetadata) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }
}

async function start(metadata: RoomMetadata) {
  const room = new RoomStore(metadata);
  const local = new CharacterLocalStore(new MemoryStorage(), "room-1");
  const scene = new CharacterSceneStore(new SceneApi());
  const shadow = new CharacterShadowPersistence(local, room, {
    reconciliation: automaticCharacterReconciliationOptions,
    mutationLock: { runExclusive: (_roomId, operation) => operation() },
  });
  await shadow.start();
  await shadow.startScene(scene, 1, () => true);
  await shadow.whenSceneIdle();
  return { room, local, scene, shadow };
}

describe("Character shadow persistence integration", () => {
  it("normalizes a schema-3 room record and confirms it in local and scene storage", async () => {
    const legacy = {
      ...activeRecord("character-1", { writeId: "legacy" }),
      schemaVersion: 3,
    } as Record<string, unknown>;
    delete legacy.parents;
    const { local, scene } = await start({
      [LEGACY_CHARACTER_KEY_PREFIX + "character-1"]: legacy,
    });
    const entry = local.get("character-1")!;
    expect(entry.history.revisions.legacy.schemaVersion).toBe(4);
    expect(entry.history.revisions.legacy.parents).toEqual([]);
    expect(await scene.get("character-1")).toEqual(entry.history);
    expect(entry.sync.pendingRevisionIds).toEqual([]);
  });

  it("preserves separate legacy and current roots as confirmed heads", async () => {
    const legacy = activeRecord("character-1", { writeId: "legacy" });
    const current = activeRecord("character-1", {
      writeId: "current",
      fields: { ...legacy.fields, armor: 2 },
    });
    const { local, scene } = await start({
      [LEGACY_CHARACTER_KEY_PREFIX + "character-1"]: legacy,
      [CHARACTER_KEY_PREFIX + "character-1"]: current,
    });
    const entry = local.get("character-1")!;
    expect(entry.history.heads).toEqual(["current", "legacy"]);
    expect((await scene.get("character-1"))?.heads).toEqual([
      "current",
      "legacy",
    ]);
    expect(entry.sync.pendingRevisionIds).toEqual([]);
  });

  it("propagates a later authoritative descendant after the initial root settles", async () => {
    const root = activeRecord("character-1", { writeId: "A" });
    const { room, local, scene, shadow } = await start({
      [CHARACTER_KEY_PREFIX + "character-1"]: root,
    });
    const next = activeRecord("character-1", {
      writeId: "B",
      revision: 2,
      parents: ["A"],
      fields: { ...root.fields, hpCurrent: 4 },
    });
    room.emit({ [CHARACTER_KEY_PREFIX + "character-1"]: next });
    await shadow.whenSceneIdle();
    const entry = local.get("character-1")!;
    expect(Object.keys(entry.history.revisions).sort()).toEqual(["A", "B"]);
    expect(entry.history.heads).toEqual(["B"]);
    expect(await scene.get("character-1")).toEqual(entry.history);
    expect(entry.sync.pendingRevisionIds).toEqual([]);
  });
});
