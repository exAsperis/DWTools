import type { Item } from "@owlbear-rodeo/sdk";
import {
  CHARACTER_KEY_PREFIX,
  CHARACTER_LINK_KEY,
  CREATURE_KEY,
  DEFAULT_OVERLAY_VISIBILITY_KEY,
  LEGACY_CHARACTER_KEY_PREFIX,
  LEGACY_CHARACTER_LINK_KEY,
  LEGACY_CREATURE_KEY,
  LEGACY_DEFAULT_OVERLAY_VISIBILITY_KEY,
} from "./constants";
import type { RoomMetadata } from "./defaultVisibility";

export interface MetadataNamespaceStore {
  getRoomMetadata(): Promise<RoomMetadata>;
  setRoomMetadata(update: RoomMetadata): Promise<void>;
  isSceneReady(): Promise<boolean>;
  getSceneItems(): Promise<Item[]>;
  updateSceneItems(
    items: Item[],
    update: (drafts: Item[]) => void,
  ): Promise<void>;
}

function setMigratedValue(
  metadata: Record<string, unknown>,
  update: RoomMetadata,
  legacyKey: string,
  currentKey: string,
  value: unknown,
): void {
  if (!(currentKey in metadata)) update[currentKey] = value;
  update[legacyKey] = undefined;
}

export function planRoomMetadataNamespaceMigration(
  metadata: RoomMetadata,
): RoomMetadata {
  const update: RoomMetadata = {};
  for (const [key, value] of Object.entries(metadata)) {
    if (key === LEGACY_DEFAULT_OVERLAY_VISIBILITY_KEY) {
      setMigratedValue(
        metadata,
        update,
        key,
        DEFAULT_OVERLAY_VISIBILITY_KEY,
        value,
      );
      continue;
    }
    if (!key.startsWith(LEGACY_CHARACTER_KEY_PREFIX)) continue;
    const suffix = key.slice(LEGACY_CHARACTER_KEY_PREFIX.length);
    if (!suffix) continue;
    setMigratedValue(
      metadata,
      update,
      key,
      `${CHARACTER_KEY_PREFIX}${suffix}`,
      value,
    );
  }
  return update;
}

export function migrateSceneItemMetadataNamespace(item: Item): boolean {
  let changed = false;
  const metadata = item.metadata;
  if (LEGACY_CREATURE_KEY in metadata) {
    if (!(CREATURE_KEY in metadata)) {
      metadata[CREATURE_KEY] = metadata[LEGACY_CREATURE_KEY];
    }
    delete metadata[LEGACY_CREATURE_KEY];
    changed = true;
  }
  if (LEGACY_CHARACTER_LINK_KEY in metadata) {
    if (!(CHARACTER_LINK_KEY in metadata)) {
      metadata[CHARACTER_LINK_KEY] = metadata[LEGACY_CHARACTER_LINK_KEY];
    }
    delete metadata[LEGACY_CHARACTER_LINK_KEY];
    changed = true;
  }
  return changed;
}

export function sceneItemsNeedingNamespaceMigration(items: Item[]): Item[] {
  return items.filter(
    (item) =>
      LEGACY_CREATURE_KEY in item.metadata ||
      LEGACY_CHARACTER_LINK_KEY in item.metadata,
  );
}

export async function migrateRoomMetadataNamespace(
  store: MetadataNamespaceStore,
): Promise<void> {
  const update = planRoomMetadataNamespaceMigration(
    await store.getRoomMetadata(),
  );
  if (Object.keys(update).length) await store.setRoomMetadata(update);
}

export async function migrateCurrentSceneMetadataNamespace(
  store: MetadataNamespaceStore,
): Promise<void> {
  if (!(await store.isSceneReady())) return;
  const candidates = sceneItemsNeedingNamespaceMigration(
    await store.getSceneItems(),
  );
  if (!candidates.length) return;
  await store.updateSceneItems(candidates, (drafts) => {
    for (const draft of drafts) migrateSceneItemMetadataNamespace(draft);
  });
}

export async function migrateMetadataNamespace(
  store: MetadataNamespaceStore,
): Promise<void> {
  await migrateRoomMetadataNamespace(store);
  await migrateCurrentSceneMetadataNamespace(store);
}
