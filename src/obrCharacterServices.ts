import OBR, { type Item } from "@owlbear-rodeo/sdk";
import {
  CharacterRepositoryError,
  type CharacterMetadataStore,
} from "./characterRepository";
import {
  CharacterManagerService,
  CreatureService,
  type SceneItemStore,
} from "./characterService";
import type { RoomMetadata } from "./defaultVisibility";
import type { CharacterAccessProvider } from "./characterAccess";
import type { CharacterRepositoryContract } from "./characterRepositoryContract";
import {
  bootstrapCharacterPersistenceAuthority,
  type CharacterPersistenceAuthority,
} from "./characterPersistenceBootstrap";
import { createBrowserCharacterLocalStore } from "./characterLocalStore";
import { createBrowserCharacterMutationLock } from "./characterMutationLock";
import { createBrowserCharacterTransferJournalStore } from "./characterTransferJournal";
import { createObrCharacterSceneStore } from "./characterSceneStore";
import { automaticCharacterReconciliationOptions } from "./characterAutomaticMerge";
import { reconcileCharacterAuthorityWithScene } from "./characterAuthorityReadiness";
import {
  CHARACTER_STORAGE_STATE_FORMAT_VERSION,
  characterSceneReplicaFromMetadata,
  characterStorageStateFromMetadata,
  ensureCharacterSceneReplicaState,
  type CharacterStorageState,
} from "./characterMigrationState";
import { CHARACTER_STORAGE_STATE_KEY } from "./constants";
import { deepEqual } from "./characterRevision";

export const obrRoomMetadataStore: CharacterMetadataStore = {
  getMetadata: () => OBR.room.getMetadata(),
  setMetadata: (update: RoomMetadata) => OBR.room.setMetadata(update),
  onMetadataChange: (callback) => OBR.room.onMetadataChange(callback),
};

export const obrSceneItemStore: SceneItemStore = {
  getItems: (ids?: string[]) =>
    ids ? OBR.scene.items.getItems(ids) : OBR.scene.items.getItems(),
  updateItems: (items: Item[], update: (drafts: Item[]) => void) =>
    OBR.scene.items.updateItems(items, (drafts) => {
      update(drafts as Item[]);
    }),
};

export const obrCharacterAccessProvider: CharacterAccessProvider = {
  getRole: () => OBR.player.getRole(),
  getPlayerId: () => OBR.player.getId(),
  hasPermission: (permission) => OBR.player.hasPermission(permission),
};

export function createObrCreatureService(
  repository: CharacterRepositoryContract,
): CreatureService {
  return new CreatureService(
    repository,
    obrSceneItemStore,
    obrCharacterAccessProvider,
  );
}

export function createObrCharacterManagerService(
  repository: CharacterRepositoryContract,
  creatures = new CreatureService(repository, obrSceneItemStore),
): CharacterManagerService {
  return new CharacterManagerService(
    repository,
    creatures,
    obrCharacterAccessProvider,
  );
}

export async function markObrCurrentSceneCharacterReplica(): Promise<void> {
  await ensureCharacterSceneReplicaState({
    getMetadata: () => OBR.scene.getMetadata(),
    setMetadata: (update) => OBR.scene.setMetadata(update),
  });
}

export async function ensureCharacterStorageState(
  authority: CharacterPersistenceAuthority,
): Promise<CharacterStorageState> {
  const metadata = await OBR.room.getMetadata();
  const existing = characterStorageStateFromMetadata(metadata);
  const hasLocal = authority.localStore.scan().entries.length > 0;
  const desired: CharacterStorageState = existing
    ? {
        ...existing,
        hasCharacterHistory: existing.hasCharacterHistory || hasLocal,
      }
    : {
        formatVersion: CHARACTER_STORAGE_STATE_FORMAT_VERSION,
        authority: "local-scene-v1",
        roomRecords: "frozen",
        hasCharacterHistory: hasLocal,
      };
  if (!deepEqual(existing, desired))
    await OBR.room.setMetadata({ [CHARACTER_STORAGE_STATE_KEY]: desired });
  return desired;
}

export async function createObrCharacterPersistenceAuthority(): Promise<CharacterPersistenceAuthority> {
  const localStore = createBrowserCharacterLocalStore(OBR.room.id);
  const mutationLock = createBrowserCharacterMutationLock();
  try {
    const authority = await bootstrapCharacterPersistenceAuthority({
      localStore,
      transferJournal: createBrowserCharacterTransferJournalStore(OBR.room.id),
      roomStore: obrRoomMetadataStore,
      mutationLock,
      getActorId: () => OBR.player.getId(),
    });
    const sceneReady = await OBR.scene.isReady();
    if (sceneReady) {
      const [roomMetadata, sceneMetadata] = await Promise.all([
        OBR.room.getMetadata(),
        OBR.scene.getMetadata(),
      ]);
      const roomState = characterStorageStateFromMetadata(roomMetadata);
      const replica = characterSceneReplicaFromMetadata(sceneMetadata);
      if (
        roomState?.roomRecords === "retired" &&
        roomState.hasCharacterHistory &&
        localStore.scan().entries.length === 0 &&
        !replica
      ) {
        throw new CharacterRepositoryError(
          "CONFLICT",
          "This browser has no Character history and this scene has not yet been initialized with DWTools Character data. Open a scene that has previously been used with the migrated DWTools Character system.",
        );
      }
      await reconcileCharacterAuthorityWithScene({
        localStore,
        sceneStore: createObrCharacterSceneStore(),
        mutationLock,
        reconciliation: automaticCharacterReconciliationOptions,
      });
      await markObrCurrentSceneCharacterReplica();
    }
    let state = await ensureCharacterStorageState(authority);
    let stateUpdatePending = false;
    const unsubscribe = localStore.subscribe(() => {
      if (state.hasCharacterHistory || stateUpdatePending) return;
      try {
        if (localStore.scan().entries.length === 0) return;
      } catch (error) {
        console.error(error);
        return;
      }
      stateUpdatePending = true;
      void ensureCharacterStorageState(authority)
        .then((next) => {
          state = next;
        })
        .catch(console.error)
        .finally(() => {
          stateUpdatePending = false;
        });
    });
    return {
      ...authority,
      close: () => {
        unsubscribe();
        authority.close();
      },
    };
  } catch (error) {
    localStore.close();
    throw error;
  }
}
