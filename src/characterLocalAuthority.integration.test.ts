import { describe, expect, it } from "vitest";
import { bootstrapCharacterPersistenceAuthority } from "./characterPersistenceBootstrap";
import { reconcileCharacterAuthorityWithScene } from "./characterAuthorityReadiness";
import { automaticCharacterReconciliationOptions } from "./characterAutomaticMerge";
import { CharacterLocalStore } from "./characterLocalStore";
import {
  CharacterSceneStore,
  type CharacterSceneMetadataApi,
} from "./characterSceneStore";
import { CharacterTransferJournalStore } from "./characterTransferJournal";
import { activeRecord } from "./characterTestHelpers";
import { CHARACTER_KEY_PREFIX } from "./constants";
import type { RoomMetadata } from "./defaultVisibility";
import type { CharacterMutationLock } from "./characterMutationLock";
import { importRoomCharactersToLocal } from "./characterRoomImport";

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
  async getMetadata() {
    return structuredClone(this.metadata);
  }
  async setMetadata(update: RoomMetadata) {
    this.metadata = { ...this.metadata, ...structuredClone(update) };
    for (const listener of this.listeners) listener(this.metadata);
  }
  onMetadataChange(callback: (metadata: RoomMetadata) => void) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }
}

const lock: CharacterMutationLock = {
  runExclusive: (_roomId, operation) => operation(),
};

async function browser(
  storage: MemoryStorage,
  room: RoomMetadata,
  scene: CharacterSceneStore,
  ids: string[],
) {
  const localStore = new CharacterLocalStore(storage, "room-1");
  const authority = await bootstrapCharacterPersistenceAuthority({
    localStore,
    transferJournal: new CharacterTransferJournalStore(storage, "room-1"),
    roomStore: { getMetadata: async () => structuredClone(room) },
    mutationLock: lock,
    getActorId: async () => "gm-1",
    now: () => new Date("2026-09-21T12:00:00.000Z"),
    randomUUID: () => ids.shift()!,
  });
  await reconcileCharacterAuthorityWithScene({
    localStore,
    sceneStore: scene,
    mutationLock: lock,
    reconciliation: automaticCharacterReconciliationOptions,
  });
  return authority;
}

describe("local Character authority integration", () => {
  it("normalizes frozen room data, freezes room during mutation, and hydrates a fresh browser", async () => {
    const legacy = {
      ...activeRecord("character-1", { writeId: "A" }),
      schemaVersion: 3,
    } as Record<string, unknown>;
    delete legacy.parents;
    const room = { [CHARACTER_KEY_PREFIX + "character-1"]: legacy };
    const frozen = JSON.stringify(room);
    const scene = new CharacterSceneStore(new SceneApi());
    const first = await browser(new MemoryStorage(), room, scene, ["B"]);
    expect((await first.repository.inspect("character-1")).status).toBe(
      "active",
    );
    expect(
      first.localStore.get("character-1")?.history.revisions.A.schemaVersion,
    ).toBe(4);
    await first.repository.patch("character-1", { hpCurrent: 4 });
    await reconcileCharacterAuthorityWithScene({
      localStore: first.localStore,
      sceneStore: scene,
      mutationLock: lock,
      reconciliation: automaticCharacterReconciliationOptions,
    });
    expect(JSON.stringify(room)).toBe(frozen);
    expect((await scene.get("character-1"))?.heads).toEqual(["B"]);
    const second = await browser(new MemoryStorage(), room, scene, ["unused"]);
    expect(second.localStore.get("character-1")?.history.heads).toEqual(["B"]);
    expect(await second.repository.inspect("character-1")).toMatchObject({
      status: "active",
      record: { writeId: "B" },
    });
  });

  it("does not resurrect a tombstone from the frozen active room record", async () => {
    const a = activeRecord("character-1", { writeId: "A" });
    const room = { [CHARACTER_KEY_PREFIX + "character-1"]: a };
    const scene = new CharacterSceneStore(new SceneApi());
    const first = await browser(new MemoryStorage(), room, scene, ["T"]);
    await first.repository.delete("character-1");
    await reconcileCharacterAuthorityWithScene({
      localStore: first.localStore,
      sceneStore: scene,
      mutationLock: lock,
      reconciliation: automaticCharacterReconciliationOptions,
    });
    const second = await browser(new MemoryStorage(), room, scene, ["unused"]);
    expect(await second.repository.inspect("character-1")).toMatchObject({
      status: "deleted",
      record: { writeId: "T" },
    });
  });

  it("deterministically merges independent cross-browser field changes", async () => {
    const a = activeRecord("character-1", {
      writeId: "A",
      fields: { name: "Raganah", hpCurrent: 8, armor: 1 },
    });
    const room = { [CHARACTER_KEY_PREFIX + "character-1"]: a };
    const scene = new CharacterSceneStore(new SceneApi());
    const first = await browser(new MemoryStorage(), room, scene, ["B"]);
    const second = await browser(new MemoryStorage(), room, scene, ["C"]);
    await first.repository.patch("character-1", { hpCurrent: 4 });
    await second.repository.patch("character-1", { armor: 2 });
    for (const authority of [first, second, first]) {
      await reconcileCharacterAuthorityWithScene({
        localStore: authority.localStore,
        sceneStore: scene,
        mutationLock: lock,
        reconciliation: automaticCharacterReconciliationOptions,
      });
    }
    const firstLookup = await first.repository.inspect("character-1");
    const secondLookup = await second.repository.inspect("character-1");
    expect(firstLookup).toMatchObject({
      status: "active",
      record: { fields: { hpCurrent: 4, armor: 2 } },
    });
    expect(secondLookup).toMatchObject({
      status: "active",
      record: { fields: { hpCurrent: 4, armor: 2 } },
    });
    if (firstLookup.status === "active" && secondLookup.status === "active")
      expect(firstLookup.record.writeId).toBe(secondLookup.record.writeId);
  });

  it("imports an old-client room descendant as revision knowledge", async () => {
    const a = activeRecord("character-1", { writeId: "A" });
    const room: RoomMetadata = { [CHARACTER_KEY_PREFIX + "character-1"]: a };
    const scene = new CharacterSceneStore(new SceneApi());
    const authority = await browser(new MemoryStorage(), room, scene, [
      "unused",
    ]);
    const b = activeRecord("character-1", {
      writeId: "B",
      revision: 2,
      parents: ["A"],
      fields: { ...a.fields, armor: 3 },
    });
    room[CHARACTER_KEY_PREFIX + "character-1"] = b;
    await importRoomCharactersToLocal(
      { getMetadata: async () => structuredClone(room) },
      authority.localStore,
    );
    await reconcileCharacterAuthorityWithScene({
      localStore: authority.localStore,
      sceneStore: scene,
      mutationLock: lock,
      reconciliation: automaticCharacterReconciliationOptions,
    });
    expect(await authority.repository.inspect("character-1")).toMatchObject({
      status: "active",
      record: { writeId: "B", fields: { armor: 3 } },
    });
  });
});
