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
    expect(existing.metadata[CREATURE_KEY]).toEqual(
      creatureDataFromFields(record.fields),
    );
    expect(
      (existing.metadata[CREATURE_KEY] as Record<string, unknown>).name,
    ).toBeUndefined();
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
    expect(sibling.name).toBe("Raganah");
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

  it("rechecks GM authorization inside manager mutations", async () => {
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
      "Only the GM",
    );
    await expect(manager.delete(record.id)).rejects.toThrow("Only the GM");
    await expect(manager.deletePermanently(record.id)).rejects.toThrow(
      "Only the GM",
    );
  });

  it("deletes to a compact tombstone and unlinks current-scene tokens", async () => {
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
    expect(store.metadata[characterMetadataKey(record.id)]).toEqual(
      expect.objectContaining({
        schemaVersion: 1,
        id: record.id,
        deleted: true,
        deletedBy: "user-1",
      }),
    );
    expect(store.metadata[characterMetadataKey(record.id)]).not.toHaveProperty(
      "fields",
    );
  });

  it("permanently deletes a tombstone and unlinks stale current-scene tokens", async () => {
    const record = activeRecord("raganah");
    const linked = token("one", "Raganah", record.fields, {
      schemaVersion: 1,
      characterId: record.id,
    });
    const tombstone = {
      schemaVersion: 1 as const,
      id: record.id,
      name: record.fields.name,
      revision: 2,
      writeId: "deleted-write",
      deleted: true as const,
      deletedAt: "2026-07-26T16:00:00.000Z",
      deletedBy: "user-1",
    };
    const { manager, store } = setup([linked], {
      [characterMetadataKey(record.id)]: tombstone,
      "com.other/data": { preserved: true },
    });

    await manager.deletePermanently(record.id);

    expect(getCharacterLink(linked)).toBeUndefined();
    expect(linked.metadata[CREATURE_KEY]).toEqual(record.fields);
    expect(store.metadata).not.toHaveProperty(characterMetadataKey(record.id));
    expect(store.metadata["com.other/data"]).toEqual({ preserved: true });
  });
});
