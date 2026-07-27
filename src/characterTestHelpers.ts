import type { Item } from "@owlbear-rodeo/sdk";
import type {
  CharacterMetadataStore,
  CharacterRecord,
} from "./characterRepository";
import type { SceneItemStore } from "./characterService";
import {
  CHARACTER_LINK_KEY,
  CREATURE_KEY,
  type CreatureData,
  type CreatureFields,
} from "./constants";
import type { CharacterLink } from "./creatureFields";
import type { RoomMetadata } from "./defaultVisibility";

export class FakeMetadataStore implements CharacterMetadataStore {
  metadata: RoomMetadata;
  readonly listeners = new Set<(metadata: RoomMetadata) => void>();
  afterSet?: (update: RoomMetadata, store: FakeMetadataStore) => void;

  constructor(metadata: RoomMetadata = {}) {
    this.metadata = { ...metadata };
  }

  async getMetadata(): Promise<RoomMetadata> {
    return { ...this.metadata };
  }

  async setMetadata(update: RoomMetadata): Promise<void> {
    for (const [key, value] of Object.entries(update)) {
      if (value === undefined) delete this.metadata[key];
      else this.metadata[key] = value;
    }
    this.afterSet?.(update, this);
    this.emit();
  }

  onMetadataChange(callback: (metadata: RoomMetadata) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  emit(): void {
    for (const listener of this.listeners) listener({ ...this.metadata });
  }
}

export class FakeSceneItemStore implements SceneItemStore {
  updateCalls = 0;

  constructor(readonly items: Item[]) {}

  async getItems(ids?: string[]): Promise<Item[]> {
    return ids
      ? this.items.filter((item) => ids.includes(item.id))
      : [...this.items];
  }

  async updateItems(
    items: Item[],
    update: (drafts: Item[]) => void,
  ): Promise<void> {
    this.updateCalls += 1;
    const ids = new Set(items.map((item) => item.id));
    update(this.items.filter((item) => ids.has(item.id)));
  }
}

export function token(
  id: string,
  name: string,
  data: CreatureData,
  link?: CharacterLink,
): Item {
  return {
    id,
    name,
    metadata: {
      [CREATURE_KEY]: { ...data },
      ...(link ? { [CHARACTER_LINK_KEY]: { ...link } } : {}),
    },
    layer: "CHARACTER",
    visible: true,
  } as unknown as Item;
}

export function activeRecord(
  id: string,
  overrides: Partial<CharacterRecord> = {},
): CharacterRecord {
  return {
    schemaVersion: 2,
    id,
    fields: {
      name: "Raganah",
      hpCurrent: 8,
      hpMax: 10,
      armor: 1,
      damage: "d8",
      instinct: "To protect the shrine",
      moves: "Strike",
      treasure: "Silver",
    },
    revision: 1,
    createdAt: "2026-07-26T12:00:00.000Z",
    createdBy: "gm-1",
    updatedAt: "2026-07-26T12:00:00.000Z",
    updatedBy: "gm-1",
    writeId: "write-1",
    ...overrides,
  };
}

export function creatureDataFromFields(fields: CreatureFields): CreatureData {
  const copy: Partial<CreatureFields> = { ...fields };
  delete copy.name;
  return copy;
}
