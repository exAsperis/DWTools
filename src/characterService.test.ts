import { describe, expect, it } from "vitest";
import {
  CharacterRepository,
  characterMetadataKey,
} from "./characterRepository";
import {
  CharacterManagerService,
  CreatureService,
  syncAllLinkedCharactersInCurrentScene,
} from "./characterService";
import {
  activeRecord,
  creatureDataFromFields,
  FakeMetadataStore,
  FakeSceneItemStore,
  token,
} from "./characterTestHelpers";
import { CHARACTER_LINK_KEY, CREATURE_KEY } from "./constants";
import { getCharacterLink } from "./creatureFields";

function setup(
  items = [token("one", "Goblin", { hpCurrent: 3, armor: 0 })],
  metadata = {},
  role: "GM" | "PLAYER" = "GM",
) {
  const store = new FakeMetadataStore(metadata);
  const ids = ["character-new", "write-new", "write-2", "write-3", "write-4"];
  const repository = new CharacterRepository(store, {
    getActorId: async () => "user-1",
    now: () => new Date("2026-07-26T16:00:00.000Z"),
    randomUUID: () => ids.shift() ?? `uuid-${ids.length}`,
  });
  const scene = new FakeSceneItemStore(items);
  const creatures = new CreatureService(repository, scene);
  const manager = new CharacterManagerService(repository, creatures, {
    getRole: async () => role,
    getPlayerId: async () => "user-1",
    hasPermission: async (permission) => permission === "CHARACTER_UPDATE",
  });
  return { store, repository, scene, creatures, manager };
}

describe("CreatureService linking and mutation", () => {
  it("creates a record from an existing creature and adds only the link", async () => {
    const existing = token("one", "Goblin", {
      hpCurrent: 3,
      hpMax: 6,
      armor: 1,
      damage: "d6",
    });
    const { creatures, store } = setup([existing]);

    const { record } = await creatures.createAndLinkCharacter(existing.id);

    expect(record.fields).toEqual({
      name: "Goblin",
      hpCurrent: 3,
      hpMax: 6,
      armor: 1,
      damage: "d6",
    });
    expect(store.metadata[characterMetadataKey(record.id)]).toEqual(record);
    expect(getCharacterLink(existing)?.characterId).toBe(record.id);
    expect(existing.metadata[CREATURE_KEY]).toEqual({
      hpCurrent: 3,
      hpMax: 6,
      armor: 1,
      damage: "d6",
    });
  });

  it("directly removes an unused record when linking a newly created record fails", async () => {
    const existing = token("one", "Goblin", { hpCurrent: 3 });
    const { creatures, scene, store } = setup([existing]);
    scene.updateItems = async () => {
      throw new Error("link failed");
    };

    await expect(creatures.createAndLinkCharacter(existing.id)).rejects.toThrow(
      "safely removed",
    );

    expect(store.metadata).not.toHaveProperty(
      characterMetadataKey("character-new"),
    );
  });

  it("links to an existing record and overwrites every creature field", async () => {
    const record = activeRecord("raganah");
    const existing = token("one", "Goblin", {
      hpCurrent: 3,
      armor: 0,
      tags: "Old",
    });
    const { creatures } = setup([existing], {
      [characterMetadataKey(record.id)]: record,
    });

    await creatures.linkToExistingCharacter(existing.id, record.id);

    expect(existing.name).toBe("Raganah");
    expect(
      (existing as unknown as { text: { plainText: string } }).text.plainText,
    ).toBe("Raganah");
    expect(existing.metadata[CREATURE_KEY]).toEqual(
      creatureDataFromFields(record.fields),
    );
    expect(
      (existing.metadata[CREATURE_KEY] as Record<string, unknown>).name,
    ).toBeUndefined();
    expect(getCharacterLink(existing)?.characterId).toBe(record.id);
  });

  it("links to an existing record without overwriting the token label", async () => {
    const record = activeRecord("raganah");
    const existing = token("one", "Custom label", {
      hpCurrent: 3,
      armor: 0,
      tags: "Old",
    });
    const { creatures } = setup([existing], {
      [characterMetadataKey(record.id)]: record,
    });

    await creatures.linkToExistingCharacter(existing.id, record.id, false);

    expect(existing.name).toBe("Custom label");
    expect(
      (existing as unknown as { text: { plainText: string } }).text.plainText,
    ).toBe("Custom label");
    expect(existing.metadata[CREATURE_KEY]).toEqual(
      creatureDataFromFields(record.fields),
    );
    expect(getCharacterLink(existing)?.characterId).toBe(record.id);
  });

  it("unlinks while retaining all current creature values", async () => {
    const linked = token(
      "one",
      "Raganah",
      { hpCurrent: 8, armor: 1 },
      { schemaVersion: 1, characterId: "raganah" },
    );
    const before = JSON.stringify(linked.metadata[CREATURE_KEY]);
    const { creatures } = setup([linked]);

    await creatures.unlinkCharacter(linked.id);

    expect(linked.metadata[CHARACTER_LINK_KEY]).toBeUndefined();
    expect(JSON.stringify(linked.metadata[CREATURE_KEY])).toBe(before);
    expect(linked.name).toBe("Raganah");
  });

  it("updates only the token for an unlinked creature", async () => {
    const existing = token("one", "Goblin", { hpCurrent: 3, armor: 0 });
    const { creatures, store, scene } = setup([existing]);

    await creatures.updateCreatureFields(existing.id, { hpCurrent: 2 });

    expect(existing.metadata[CREATURE_KEY]).toEqual({
      hpCurrent: 2,
      armor: 0,
    });
    expect(store.metadata).toEqual({});
    expect(scene.updateCalls).toBe(1);
  });

  it("exactly replaces only unlinked creature metadata", async () => {
    const existing = token("one", "Custom label", {
      hpCurrent: 3,
      armor: 2,
      tags: "Remove me",
    });
    existing.metadata["com.other/data"] = { retained: true };
    const { creatures } = setup([existing]);

    await creatures.replaceUnlinkedCreatureData(existing.id, {
      hpCurrent: 8,
      moves: "Strike",
    });

    expect(existing.name).toBe("Custom label");
    expect(existing.metadata[CREATURE_KEY]).toEqual({
      hpCurrent: 8,
      moves: "Strike",
    });
    expect(existing.metadata["com.other/data"]).toEqual({ retained: true });
    expect(existing.metadata[CHARACTER_LINK_KEY]).toBeUndefined();
  });

  it("blocks exact replacement when the target is linked", async () => {
    const linked = token(
      "one",
      "Raganah",
      { hpCurrent: 8 },
      { schemaVersion: 1, characterId: "raganah" },
    );
    const before = JSON.stringify(linked.metadata);
    const { creatures } = setup([linked]);

    await expect(
      creatures.replaceUnlinkedCreatureData(linked.id, { hpCurrent: 1 }),
    ).rejects.toMatchObject({ code: "LINKED" });
    expect(JSON.stringify(linked.metadata)).toBe(before);
  });

  it("rechecks the link inside the scene update", async () => {
    const existing = token("one", "Goblin", { hpCurrent: 3 });
    const { creatures, scene } = setup([existing]);
    const updateItems = scene.updateItems.bind(scene);
    scene.updateItems = async (items, update) => {
      existing.metadata[CHARACTER_LINK_KEY] = {
        schemaVersion: 1,
        characterId: "new-link",
      };
      await updateItems(items, update);
    };

    await expect(
      creatures.replaceUnlinkedCreatureData(existing.id, { hpCurrent: 1 }),
    ).rejects.toMatchObject({ code: "LINKED" });
    expect(existing.metadata[CREATURE_KEY]).toEqual({ hpCurrent: 3 });
  });

  it("updates the record first and synchronizes sibling tokens", async () => {
    const record = activeRecord("raganah");
    const link = { schemaVersion: 1 as const, characterId: record.id };
    const first = token("one", "Raganah", record.fields, link);
    const sibling = token("two", "Old copy", { hpCurrent: 1 }, link);
    const { creatures, repository } = setup([first, sibling], {
      [characterMetadataKey(record.id)]: record,
    });

    const result = await creatures.updateCreatureFields(first.id, {
      hpCurrent: 4,
    });
    const saved = await repository.read(record.id);

    expect(result.record?.fields.hpCurrent).toBe(4);
    expect(saved && !saved.deleted && saved.fields.hpCurrent).toBe(4);
    const recordData = creatureDataFromFields(result.record!.fields);
    expect(first.metadata[CREATURE_KEY]).toEqual(recordData);
    expect(sibling.metadata[CREATURE_KEY]).toEqual(recordData);
    expect(first.name).toBe("Raganah");
    expect(sibling.name).toBe("Old copy");
  });

  it("synchronizes Character name changes without changing token labels", async () => {
    const record = activeRecord("raganah");
    const link = { schemaVersion: 1 as const, characterId: record.id };
    const first = token("one", "Hero miniature", record.fields, link);
    const sibling = token("two", "Backup miniature", record.fields, link);
    const { manager } = setup([first, sibling], {
      [characterMetadataKey(record.id)]: record,
    });

    await manager.save(record.id, {
      ...record.fields,
      name: "Raganah the Returned",
      hpCurrent: 6,
    });

    expect(first.name).toBe("Hero miniature");
    expect(sibling.name).toBe("Backup miniature");
    expect(first.metadata[CREATURE_KEY]).toMatchObject({ hpCurrent: 6 });
    expect(sibling.metadata[CREATURE_KEY]).toMatchObject({ hpCurrent: 6 });
  });

  it("retains orphan links and fields for missing records", async () => {
    const orphan = token(
      "one",
      "Orphan",
      { hpCurrent: 5 },
      { schemaVersion: 1, characterId: "missing" },
    );
    const { repository, scene } = setup([orphan]);

    expect(await syncAllLinkedCharactersInCurrentScene(repository, scene)).toBe(
      0,
    );
    expect(getCharacterLink(orphan)?.characterId).toBe("missing");
    expect(orphan.metadata[CREATURE_KEY]).toEqual({ hpCurrent: 5 });
  });

  it("removes tombstoned links while preserving token fields", async () => {
    const record = activeRecord("raganah");
    const tombstone = {
      schemaVersion: 1 as const,
      id: record.id,
      revision: 2,
      writeId: "delete-1",
      deleted: true as const,
      deletedAt: "2026-07-26T17:00:00.000Z",
      deletedBy: "gm-1",
    };
    const linked = token(
      "one",
      "Raganah",
      { hpCurrent: 5 },
      { schemaVersion: 1, characterId: record.id },
    );
    const { repository, scene } = setup([linked], {
      [characterMetadataKey(record.id)]: tombstone,
    });

    expect(await syncAllLinkedCharactersInCurrentScene(repository, scene)).toBe(
      1,
    );
    expect(getCharacterLink(linked)).toBeUndefined();
    expect(linked.metadata[CREATURE_KEY]).toEqual({ hpCurrent: 5 });
  });

  it("rejects an over-capacity linked edit without changing token or record", async () => {
    const record = activeRecord("raganah");
    const linked = token("one", "Raganah", record.fields, {
      schemaVersion: 1,
      characterId: record.id,
    });
    const { creatures, store } = setup([linked], {
      [characterMetadataKey(record.id)]: record,
      "com.other/filler": "x".repeat(15_100),
    });
    const beforeToken = JSON.stringify(linked);
    const beforeRecord = JSON.stringify(
      store.metadata[characterMetadataKey(record.id)],
    );

    await expect(
      creatures.updateCreatureFields(linked.id, { hpCurrent: 1 }),
    ).rejects.toMatchObject({ code: "CAPACITY" });
    expect(JSON.stringify(linked)).toBe(beforeToken);
    expect(
      JSON.stringify(store.metadata[characterMetadataKey(record.id)]),
    ).toBe(beforeRecord);
  });
});

describe("CharacterManagerService", () => {
  it("saves authoritative manager edits and synchronizes linked tokens", async () => {
    const record = activeRecord("raganah");
    const linked = token("one", "Raganah", record.fields, {
      schemaVersion: 1,
      characterId: record.id,
    });
    const { manager, repository } = setup([linked], {
      [characterMetadataKey(record.id)]: record,
    });

    await manager.save(record.id, {
      ...record.fields,
      armor: 4,
      moves: "Strike\nRoar",
    });
    const saved = await repository.read(record.id);

    expect(saved && !saved.deleted && saved.fields.armor).toBe(4);
    expect((linked.metadata[CREATURE_KEY] as { armor: number }).armor).toBe(4);
  });

  it("patches one auto-saved field without replacing other Character stats", async () => {
    const record = activeRecord("raganah");
    const linked = token("one", "Raganah", record.fields, {
      schemaVersion: 1,
      characterId: record.id,
    });
    const { manager, repository } = setup([linked], {
      [characterMetadataKey(record.id)]: record,
    });

    await manager.patch(record.id, { armor: 5 });
    const saved = await repository.read(record.id);

    expect(saved && !saved.deleted && saved.fields).toMatchObject({
      name: record.fields.name,
      armor: 5,
      hpCurrent: record.fields.hpCurrent,
    });
    expect((linked.metadata[CREATURE_KEY] as { armor: number }).armor).toBe(5);
  });

  it("rechecks GM authorization for GM-only manager mutations", async () => {
    const record = activeRecord("raganah");
    const { manager } = setup(
      [],
      { [characterMetadataKey(record.id)]: record },
      "PLAYER",
    );

    await expect(manager.create({ name: "Blocked" })).rejects.toThrow(
      "Only the GM",
    );
    await expect(manager.save(record.id, record.fields)).rejects.toThrow(
      "no longer control",
    );
    await expect(manager.delete(record.id)).rejects.toThrow("Only the GM");
    await expect(manager.cleanupLegacyTombstones()).rejects.toThrow(
      "Only the GM",
    );
  });

  it("directly deletes the record and unlinks current-scene tokens", async () => {
    const record = activeRecord("raganah");
    const linked = token("one", "Raganah", record.fields, {
      schemaVersion: 1,
      characterId: record.id,
    });
    const { manager, store } = setup([linked], {
      [characterMetadataKey(record.id)]: record,
    });

    await manager.delete(record.id);

    expect(getCharacterLink(linked)).toBeUndefined();
    expect(linked.metadata[CREATURE_KEY]).toEqual(record.fields);
    expect(store.metadata).not.toHaveProperty(characterMetadataKey(record.id));
  });

  it("cleans up legacy tombstones with a GM authorization recheck", async () => {
    const record = activeRecord("raganah");
    const tombstone = {
      schemaVersion: 1 as const,
      id: "legacy-deleted",
      name: record.fields.name,
      revision: 2,
      writeId: "deleted-write",
      deleted: true as const,
      deletedAt: "2026-07-26T16:00:00.000Z",
      deletedBy: "user-1",
    };
    const { manager, store } = setup([], {
      [characterMetadataKey(record.id)]: record,
      [characterMetadataKey(tombstone.id)]: tombstone,
      "com.other/data": { preserved: true },
    });

    await expect(manager.cleanupLegacyTombstones()).resolves.toBe(1);

    expect(store.metadata[characterMetadataKey(record.id)]).toEqual(record);
    expect(store.metadata).not.toHaveProperty(
      characterMetadataKey(tombstone.id),
    );
    expect(store.metadata["com.other/data"]).toEqual({ preserved: true });
  });

  it("shows a player only deduplicated Characters linked to controlled tokens", async () => {
    const hero = activeRecord("hero", { fields: { name: "Hero" } });
    const wagon = activeRecord("wagon", {
      fields: { name: "Wagon" },
      writeId: "wagon-write",
    });
    const heroLink = { schemaVersion: 1 as const, characterId: hero.id };
    const items = [
      token("hero-one", "Hero", hero.fields, heroLink),
      token("hero-two", "Hero", hero.fields, heroLink),
    ];
    const { manager } = setup(
      items,
      {
        [characterMetadataKey(hero.id)]: hero,
        [characterMetadataKey(wagon.id)]: wagon,
      },
      "PLAYER",
    );

    await expect(manager.listAccessible()).resolves.toEqual([hero]);
  });

  it("allows a player edit while control exists and blocks it after control is lost", async () => {
    const hero = activeRecord("hero", {
      fields: { name: "Hero" },
      inventory: [["Coin", 0.01, 137]],
    });
    const linked = token("hero-token", "Hero", hero.fields, {
      schemaVersion: 1,
      characterId: hero.id,
    });
    const { manager, scene } = setup(
      [linked],
      { [characterMetadataKey(hero.id)]: hero },
      "PLAYER",
    );

    await expect(
      manager.changeInventoryItemCount(
        hero.id,
        { sourceIndex: 0, expected: ["Coin", 0.01, 137] },
        1,
      ),
    ).resolves.toMatchObject({
      inventory: [["Coin", 0.01, 138]],
    });

    scene.items.length = 0;
    await expect(
      manager.addInventoryItem(hero.id, ["Rope", 1, 1]),
    ).rejects.toThrow("no longer control");
  });

  it("keeps transfers GM-only", async () => {
    const source = activeRecord("source", {
      inventory: [["Rations", 1, 3]],
    });
    const destination = activeRecord("destination", {
      fields: { name: "Pack Mule" },
      writeId: "destination-write",
    });
    const linked = token("source-token", "Hero", source.fields, {
      schemaVersion: 1,
      characterId: source.id,
    });
    const { manager } = setup(
      [linked],
      {
        [characterMetadataKey(source.id)]: source,
        [characterMetadataKey(destination.id)]: destination,
      },
      "PLAYER",
    );

    await expect(
      manager.transferInventoryItem(
        source.id,
        destination.id,
        { sourceIndex: 0, expected: ["Rations", 1, 3] },
        1,
      ),
    ).rejects.toThrow("Only the GM");
  });
});
