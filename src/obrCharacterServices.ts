import OBR, { type Item } from "@owlbear-rodeo/sdk";
import {
  CharacterRepository,
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

export function createObrCharacterRepository(): CharacterRepository {
  return new CharacterRepository(obrRoomMetadataStore, {
    getActorId: () => OBR.player.getId(),
  });
}

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

export async function createObrCharacterPersistenceAuthority(): Promise<CharacterPersistenceAuthority> {
  const localStore = createBrowserCharacterLocalStore(OBR.room.id);
  try {
    return await bootstrapCharacterPersistenceAuthority({
      localStore,
      transferJournal: createBrowserCharacterTransferJournalStore(OBR.room.id),
      roomStore: obrRoomMetadataStore,
      mutationLock: createBrowserCharacterMutationLock(),
      getActorId: () => OBR.player.getId(),
    });
  } catch (error) {
    localStore.close();
    throw error;
  }
}
