import type { Item } from "@owlbear-rodeo/sdk";
import { describe, expect, it } from "vitest";
import {
  CHARACTER_LINK_KEY,
  CREATURE_KEY,
  DEFAULT_OVERLAY_VISIBILITY_KEY,
  LEGACY_CHARACTER_KEY_PREFIX,
  LEGACY_CHARACTER_LINK_KEY,
  LEGACY_CREATURE_KEY,
  LEGACY_DEFAULT_OVERLAY_VISIBILITY_KEY,
} from "./constants";
import {
  migrateMetadataNamespace,
  migrateSceneItemMetadataNamespace,
  planRoomMetadataNamespaceMigration,
  sceneItemsNeedingNamespaceMigration,
  type MetadataNamespaceStore,
} from "./metadataMigration";
import type { RoomMetadata } from "./defaultVisibility";

function item(id: string, metadata: Record<string, unknown>): Item {
  return { id, metadata } as unknown as Item;
}

class FakeNamespaceStore implements MetadataNamespaceStore {
  roomWrites = 0;
  sceneWrites = 0;
  sceneReads = 0;
  roomWriteError: Error | undefined;

  constructor(
    readonly room: RoomMetadata,
    readonly items: Item[],
    readonly ready = true,
  ) {}

  async getRoomMetadata(): Promise<RoomMetadata> {
    return { ...this.room };
  }

  async setRoomMetadata(update: RoomMetadata): Promise<void> {
    this.roomWrites += 1;
    if (this.roomWriteError) throw this.roomWriteError;
    for (const [key, value] of Object.entries(update)) {
      if (value === undefined) delete this.room[key];
      else this.room[key] = value;
    }
  }

  async isSceneReady(): Promise<boolean> {
    return this.ready;
  }

  async getSceneItems(): Promise<Item[]> {
    this.sceneReads += 1;
    return [...this.items];
  }

  async updateSceneItems(
    items: Item[],
    update: (drafts: Item[]) => void,
  ): Promise<void> {
    this.sceneWrites += 1;
    const ids = new Set(items.map(({ id }) => id));
    update(this.items.filter(({ id }) => ids.has(id)));
  }
}

describe("room metadata namespace migration", () => {
  it("moves room settings while preserving both legacy and current Character records untouched", () => {
    const legacyFirst = { source: "legacy-first" };
    const legacyConflict = { source: "legacy-conflict" };
    const currentConflict = { source: "current-conflict" };
    const metadata = {
      [LEGACY_DEFAULT_OVERLAY_VISIBILITY_KEY]: false,
      [`${LEGACY_CHARACTER_KEY_PREFIX}first`]: legacyFirst,
      [`${LEGACY_CHARACTER_KEY_PREFIX}same`]: legacyConflict,
      "com.ex-asperis.dwtools/character/same": currentConflict,
      "com.other/data": { preserved: true },
    };

    expect(planRoomMetadataNamespaceMigration(metadata)).toEqual({
      [DEFAULT_OVERLAY_VISIBILITY_KEY]: false,
      [LEGACY_DEFAULT_OVERLAY_VISIBILITY_KEY]: undefined,
    });

    expect(planRoomMetadataNamespaceMigration(metadata)).not.toHaveProperty(
      `${LEGACY_CHARACTER_KEY_PREFIX}first`,
    );

    expect(planRoomMetadataNamespaceMigration(metadata)).not.toHaveProperty(
      "com.ex-asperis.dwtools/character/first",
    );
  });

  it("does not choose between conflicting legacy and current Character room values", () => {
    const metadata = {
      "com.ex-asperis.dwtools/character/same": { source: "new" },
      [`${LEGACY_CHARACTER_KEY_PREFIX}same`]: { source: "old" },
    };

    expect(planRoomMetadataNamespaceMigration(metadata)).toEqual({});
  });
});

describe("scene metadata namespace migration", () => {
  it("moves creature and link values together with new values winning", () => {
    const token = item("token", {
      [LEGACY_CREATURE_KEY]: "malformed-but-preserved",
      [CREATURE_KEY]: { hpCurrent: 9 },
      [LEGACY_CHARACTER_LINK_KEY]: { schemaVersion: 1, characterId: "old" },
      [CHARACTER_LINK_KEY]: { schemaVersion: 1, characterId: "new" },
      "com.other/data": true,
    });

    expect(migrateSceneItemMetadataNamespace(token)).toBe(true);
    expect(token.metadata).toEqual({
      [CREATURE_KEY]: { hpCurrent: 9 },
      [CHARACTER_LINK_KEY]: { schemaVersion: 1, characterId: "new" },
      "com.other/data": true,
    });
    expect(migrateSceneItemMetadataNamespace(token)).toBe(false);
  });

  it("selects only items containing legacy creature or link keys", () => {
    const legacy = item("legacy", { [LEGACY_CREATURE_KEY]: {} });
    const current = item("current", { [CREATURE_KEY]: {} });
    const unrelated = item("unrelated", { "com.other/data": true });

    expect(
      sceneItemsNeedingNamespaceMigration([legacy, current, unrelated]),
    ).toEqual([legacy]);
  });
});

describe("metadata namespace startup migration", () => {
  it("is idempotent and performs no writes after legacy keys are gone", async () => {
    const store = new FakeNamespaceStore(
      {
        [LEGACY_DEFAULT_OVERLAY_VISIBILITY_KEY]: false,
        [`${LEGACY_CHARACTER_KEY_PREFIX}first`]: { id: "first" },
      },
      [
        item("legacy", {
          [LEGACY_CREATURE_KEY]: { hpCurrent: 4 },
          [LEGACY_CHARACTER_LINK_KEY]: {
            schemaVersion: 1,
            characterId: "first",
          },
        }),
      ],
    );

    await migrateMetadataNamespace(store);
    await migrateMetadataNamespace(store);

    expect(store.roomWrites).toBe(1);
    expect(store.sceneWrites).toBe(1);
    expect(store.room).toEqual({
      [DEFAULT_OVERLAY_VISIBILITY_KEY]: false,
      [`${LEGACY_CHARACTER_KEY_PREFIX}first`]: { id: "first" },
    });
    expect(store.items[0].metadata).toEqual({
      [CREATURE_KEY]: { hpCurrent: 4 },
      [CHARACTER_LINK_KEY]: {
        schemaVersion: 1,
        characterId: "first",
      },
    });
  });

  it("converges when startup migrations overlap", async () => {
    const store = new FakeNamespaceStore(
      { [LEGACY_DEFAULT_OVERLAY_VISIBILITY_KEY]: false },
      [item("legacy", { [LEGACY_CREATURE_KEY]: { hpCurrent: 4 } })],
    );

    await Promise.all([
      migrateMetadataNamespace(store),
      migrateMetadataNamespace(store),
    ]);

    expect(store.room).toEqual({
      [DEFAULT_OVERLAY_VISIBILITY_KEY]: false,
    });
    expect(store.items[0].metadata).toEqual({
      [CREATURE_KEY]: { hpCurrent: 4 },
    });
  });

  it("rejects and never reads scene data when room migration fails", async () => {
    const store = new FakeNamespaceStore(
      { [LEGACY_DEFAULT_OVERLAY_VISIBILITY_KEY]: false },
      [],
    );
    store.roomWriteError = new Error("room write failed");

    await expect(migrateMetadataNamespace(store)).rejects.toThrow(
      "room write failed",
    );
    expect(store.sceneReads).toBe(0);
  });
});
