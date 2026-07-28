import OBR, { type Item } from "@owlbear-rodeo/sdk";
import {
  migrateMetadataNamespace,
  type MetadataNamespaceStore,
} from "./metadataMigration";
import type { RoomMetadata } from "./defaultVisibility";

const obrMetadataNamespaceStore: MetadataNamespaceStore = {
  getRoomMetadata: () => OBR.room.getMetadata(),
  setRoomMetadata: (update: RoomMetadata) => OBR.room.setMetadata(update),
  isSceneReady: () => OBR.scene.isReady(),
  getSceneItems: () => OBR.scene.items.getItems(),
  updateSceneItems: (items: Item[], update: (drafts: Item[]) => void) =>
    OBR.scene.items.updateItems(items, (drafts) => update(drafts as Item[])),
};

let pendingMigration: Promise<void> | undefined;

export function ensureMetadataNamespaceMigrated(): Promise<void> {
  if (!pendingMigration) {
    pendingMigration = migrateMetadataNamespace(
      obrMetadataNamespaceStore,
    ).finally(() => {
      pendingMigration = undefined;
    });
  }
  return pendingMigration;
}
