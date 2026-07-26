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

export function createObrCharacterRepository(): CharacterRepository {
  return new CharacterRepository(obrRoomMetadataStore, {
    getActorId: () => OBR.player.getId(),
  });
}

export function createObrCreatureService(
  repository = createObrCharacterRepository(),
): CreatureService {
  return new CreatureService(repository, obrSceneItemStore);
}

export function createObrCharacterManagerService(
  repository = createObrCharacterRepository(),
  creatures = new CreatureService(repository, obrSceneItemStore),
): CharacterManagerService {
  return new CharacterManagerService(repository, creatures, {
    getRole: () => OBR.player.getRole(),
  });
}
