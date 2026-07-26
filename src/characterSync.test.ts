import { describe, expect, it } from "vitest";
import {
  CharacterRepository,
  characterMetadataKey,
} from "./characterRepository";
import { CharacterSyncCoordinator } from "./characterSync";
import {
  activeRecord,
  creatureDataFromFields,
  FakeMetadataStore,
  FakeSceneItemStore,
  token,
} from "./characterTestHelpers";
import { CREATURE_KEY } from "./constants";

function syncSetup(ready: boolean) {
  const record = activeRecord("raganah");
  const linked = token(
    "one",
    "Stale",
    { hpCurrent: 1 },
    { schemaVersion: 1, characterId: record.id },
  );
  const store = new FakeMetadataStore({
    [characterMetadataKey(record.id)]: record,
  });
  const repository = new CharacterRepository(store, {
    getActorId: async () => "gm-1",
    randomUUID: () => "write",
  });
  const scene = new FakeSceneItemStore([linked]);
  let isReady = ready;
  const listeners = new Set<(value: boolean) => void>();
  const coordinator = new CharacterSyncCoordinator(repository, scene, {
    isReady: async () => isReady,
    onReadyChange: (callback) => {
      listeners.add(callback);
      return () => listeners.delete(callback);
    },
  });
  return {
    record,
    linked,
    store,
    scene,
    coordinator,
    ready: (value: boolean) => {
      isReady = value;
      for (const listener of listeners) listener(value);
    },
  };
}

describe("CharacterSyncCoordinator", () => {
  it("synchronizes all linked tokens when a scene becomes ready", async () => {
    const state = syncSetup(false);
    state.coordinator.start();
    await state.coordinator.whenIdle();
    expect(state.linked.name).toBe("Stale");

    state.ready(true);
    await state.coordinator.whenIdle();

    expect(state.linked.name).toBe("Raganah");
    expect(state.linked.metadata[CREATURE_KEY]).toEqual(
      creatureDataFromFields(state.record.fields),
    );
    state.coordinator.stop();
  });

  it("synchronizes a changed room record without scene-item feedback writes", async () => {
    const state = syncSetup(true);
    state.coordinator.start();
    await state.coordinator.whenIdle();
    const callsAfterReady = state.scene.updateCalls;
    const changed = {
      ...state.record,
      fields: { ...state.record.fields, hpCurrent: 2 },
      revision: 2,
      writeId: "external-write",
    };

    state.store.metadata[characterMetadataKey(state.record.id)] = changed;
    state.store.emit();
    await state.coordinator.whenIdle();

    expect(
      (state.linked.metadata[CREATURE_KEY] as { hpCurrent: number }).hpCurrent,
    ).toBe(2);
    expect(state.scene.updateCalls).toBe(callsAfterReady + 1);
    state.store.emit();
    await state.coordinator.whenIdle();
    expect(state.scene.updateCalls).toBe(callsAfterReady + 1);
    state.coordinator.stop();
  });
});
