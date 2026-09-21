import { describe, expect, it, vi } from "vitest";
import { automaticCharacterReconciliationOptions } from "./characterAutomaticMerge";
import { CharacterLocalStore } from "./characterLocalStore";
import {
  CharacterSceneStore,
  type CharacterSceneMetadataApi,
} from "./characterSceneStore";
import { CharacterShadowPersistence } from "./characterShadowPersistence";
import { activeRecord } from "./characterTestHelpers";
import { CHARACTER_KEY_PREFIX } from "./constants";
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

class FakeRoomStore {
  metadata: RoomMetadata;
  readError: unknown;
  private readonly listeners = new Set<(metadata: RoomMetadata) => void>();

  constructor(metadata: RoomMetadata = {}) {
    this.metadata = metadata;
  }
  async getMetadata(): Promise<RoomMetadata> {
    if (this.readError) throw this.readError;
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
  listenerCount(): number {
    return this.listeners.size;
  }
}

class FakeSceneApi implements CharacterSceneMetadataApi {
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
  listenerCount(): number {
    return this.listeners.size;
  }
}

function record(writeId = "root", revision = 1, parents: string[] = []) {
  return activeRecord("character-1", { writeId, revision, parents });
}

function metadata(value = record()): RoomMetadata {
  return { [CHARACTER_KEY_PREFIX + value.id]: value };
}

function setup(room = new FakeRoomStore(metadata())) {
  const local = new CharacterLocalStore(new MemoryStorage(), "room-1");
  const errors: unknown[] = [];
  const shadow = new CharacterShadowPersistence(local, room, {
    reconciliation: automaticCharacterReconciliationOptions,
    mutationLock: { runExclusive: (_roomId, operation) => operation() },
    onError: (error) => errors.push(error),
  });
  return { room, local, shadow, errors };
}

describe("CharacterShadowPersistence", () => {
  it("imports the initial room snapshot", async () => {
    const { shadow, local } = setup();
    await shadow.start();
    expect(local.get("character-1")?.history.heads).toEqual(["root"]);
  });

  it("continues importing room subscription updates", async () => {
    const { shadow, local, room } = setup();
    await shadow.start();
    room.emit(metadata(record("next", 2, ["root"])));
    await shadow.whenSceneIdle();
    expect(
      Object.keys(local.get("character-1")!.history.revisions).sort(),
    ).toEqual(["next", "root"]);
  });

  it("starts scene reconciliation for imported Characters", async () => {
    const { shadow } = setup();
    const api = new FakeSceneApi();
    const scene = new CharacterSceneStore(api);
    await shadow.start();
    await shadow.startScene(scene, 1, () => true);
    await shadow.whenSceneIdle();
    expect((await scene.get("character-1"))?.heads).toEqual(["root"]);
  });

  it("stops scene reconciliation while room import remains active", async () => {
    const { shadow, local, room } = setup();
    const api = new FakeSceneApi();
    const scene = new CharacterSceneStore(api);
    await shadow.start();
    await shadow.startScene(scene, 1, () => true);
    await shadow.whenSceneIdle();
    shadow.stopScene();
    room.emit(metadata(record("next", 2, ["root"])));
    await shadow.whenSceneIdle();
    expect(local.get("character-1")?.history.heads).toEqual(["next"]);
    expect((await scene.get("character-1"))?.heads).toEqual(["root"]);
  });

  it("stops room subscriptions and scene work", async () => {
    const { shadow, room } = setup();
    const api = new FakeSceneApi();
    await shadow.start();
    await shadow.startScene(new CharacterSceneStore(api), 1, () => true);
    expect(room.listenerCount()).toBe(1);
    expect(api.listenerCount()).toBe(1);
    shadow.stop();
    expect(room.listenerCount()).toBe(0);
    expect(api.listenerCount()).toBe(0);
  });

  it("does not start a stale scene generation", async () => {
    const { shadow } = setup();
    const api = new FakeSceneApi();
    await shadow.start();
    await shadow.startScene(new CharacterSceneStore(api), 1, () => false);
    expect(api.listenerCount()).toBe(0);
    expect(api.metadata).toEqual({});
  });

  it("reports a room read failure without rejecting start", async () => {
    const room = new FakeRoomStore();
    room.readError = new Error("room failed");
    const { shadow, errors } = setup(room);
    await expect(shadow.start()).resolves.toBeUndefined();
    expect(errors).toEqual([room.readError]);
  });

  it("does not rewrite identical room snapshots", async () => {
    const { shadow, local, room } = setup();
    const put = vi.spyOn(local, "put");
    await shadow.start();
    expect(put).toHaveBeenCalledTimes(1);
    room.emit(metadata());
    expect(put).toHaveBeenCalledTimes(1);
  });
});
