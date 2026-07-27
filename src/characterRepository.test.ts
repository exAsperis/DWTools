import { describe, expect, it } from "vitest";
import {
  CHARACTER_METADATA_SAFE_MAX_BYTES,
  CharacterRepository,
  CharacterRepositoryError,
  type CharacterRecord,
  CHARACTER_RECORD_SCHEMA_VERSION,
  characterMetadataKey,
  parseCharacterManifest,
  serializedMetadataBytes,
} from "./characterRepository";
import { activeRecord, FakeMetadataStore } from "./characterTestHelpers";
import { EXTENSION_ID } from "./constants";

function repository(
  store: FakeMetadataStore,
  uuids = ["character-1", "write-1", "write-2", "write-3", "write-4"],
  retries = 3,
): CharacterRepository {
  return new CharacterRepository(store, {
    getActorId: async () => "user-1",
    now: () => new Date("2026-07-26T15:00:00.000Z"),
    randomUUID: () => uuids.shift() ?? `uuid-${Math.random()}`,
    patchRetries: retries,
  });
}

describe("character manifest parsing", () => {
  it("parses namespaced records and ignores unrelated extension metadata", () => {
    const record = activeRecord("raganah");
    const manifest = parseCharacterManifest({
      [characterMetadataKey(record.id)]: record,
      "com.some-other-extension/data": { character: "not ours" },
      [`${EXTENSION_ID}/not-a-character`]: record,
    });

    expect([...manifest.keys()]).toEqual(["raganah"]);
    expect(manifest.get("raganah")).toEqual({ status: "active", record });
  });

  it("surfaces malformed records without throwing", () => {
    const manifest = parseCharacterManifest({
      [characterMetadataKey("broken")]: { schemaVersion: 99 },
    });

    expect(manifest.get("broken")?.status).toBe("malformed");
  });

  it("migrates schema-1 records without serializing empty inventory fields", () => {
    const legacy = {
      ...activeRecord("legacy"),
      schemaVersion: 1,
    };
    const manifest = parseCharacterManifest({
      [characterMetadataKey("legacy")]: legacy,
    });
    const lookup = manifest.get("legacy");

    expect(lookup?.status).toBe("active");
    if (lookup?.status !== "active") throw new Error("Expected active record");
    expect(lookup.record.schemaVersion).toBe(CHARACTER_RECORD_SCHEMA_VERSION);
    expect(lookup.record.inventory).toBeUndefined();
    expect(lookup.record.maxLoad).toBeUndefined();
  });
});

describe("CharacterRepository writes", () => {
  it("creates one independently keyed versioned record", async () => {
    const store = new FakeMetadataStore({
      "com.other/data": { preserved: true },
    });
    const result = await repository(store).create({
      name: " Raganah ",
      hpCurrent: 6,
      hpMax: 8,
    });

    expect(result).toMatchObject({
      schemaVersion: 2,
      id: "character-1",
      revision: 1,
      fields: { name: "Raganah", hpCurrent: 6, hpMax: 8 },
      createdBy: "user-1",
      updatedBy: "user-1",
      writeId: "write-1",
    });
    expect(store.metadata["com.other/data"]).toEqual({ preserved: true });
    expect(store.metadata[characterMetadataKey("character-1")]).toEqual(result);
  });

  it("rejects a write beyond the conservative safe maximum", async () => {
    const record = activeRecord("raganah");
    const store = new FakeMetadataStore({
      [characterMetadataKey(record.id)]: record,
      "com.other/filler": "x".repeat(CHARACTER_METADATA_SAFE_MAX_BYTES),
    });

    await expect(
      repository(store).patch(record.id, { hpCurrent: 7 }),
    ).rejects.toMatchObject({ code: "CAPACITY" });
    expect(store.metadata[characterMetadataKey(record.id)]).toEqual(record);
    expect(serializedMetadataBytes(store.metadata)).toBeGreaterThan(
      CHARACTER_METADATA_SAFE_MAX_BYTES,
    );
  });

  it("retries against the latest record and preserves a different-field patch", async () => {
    const first = activeRecord("raganah");
    const store = new FakeMetadataStore({
      [characterMetadataKey(first.id)]: first,
    });
    let intercepted = false;
    store.afterSet = (update, target) => {
      if (intercepted || !(characterMetadataKey(first.id) in update)) return;
      intercepted = true;
      target.metadata[characterMetadataKey(first.id)] = {
        ...first,
        fields: { ...first.fields, armor: 3 },
        revision: 2,
        writeId: "competing-write",
      };
    };

    const result = await repository(store, [
      "our-first-write",
      "our-retry-write",
    ]).patch(first.id, { hpCurrent: 4 });

    expect(result.fields.hpCurrent).toBe(4);
    expect(result.fields.armor).toBe(3);
    expect(result.revision).toBe(3);
    expect(result.writeId).toBe("our-retry-write");
  });

  it("returns an actionable conflict after bounded retry exhaustion", async () => {
    const first = activeRecord("raganah");
    const store = new FakeMetadataStore({
      [characterMetadataKey(first.id)]: first,
    });
    let revision = 1;
    store.afterSet = (_update, target) => {
      revision += 1;
      target.metadata[characterMetadataKey(first.id)] = {
        ...first,
        revision,
        writeId: `competing-${revision}`,
      };
    };

    await expect(
      repository(store, ["ours-1", "ours-2"], 2).patch(first.id, {
        hpCurrent: 2,
      }),
    ).rejects.toEqual(
      expect.objectContaining({
        code: "CONFLICT",
        message: expect.stringContaining("Another client"),
      }) as CharacterRepositoryError,
    );
  });

  it("lists only active records without exposing legacy tombstones or unrelated metadata", async () => {
    const record = activeRecord("raganah");
    const tombstone = {
      schemaVersion: 1 as const,
      id: "old-hero",
      name: "Old Hero",
      revision: 2,
      writeId: "deleted-write",
      deleted: true as const,
      deletedAt: "2026-07-26T15:00:00.000Z",
      deletedBy: "user-1",
    };
    const store = new FakeMetadataStore({
      [characterMetadataKey(record.id)]: record,
      [characterMetadataKey(tombstone.id)]: tombstone,
      "com.other/data": { preserved: true },
    });

    await expect(repository(store).list()).resolves.toEqual([record]);
  });

  it("directly deletes only the selected active record key", async () => {
    const record = activeRecord("raganah");
    const store = new FakeMetadataStore({
      [characterMetadataKey(record.id)]: record,
      "com.other/data": { preserved: true },
    });

    await repository(store).delete(record.id);

    expect(store.metadata).not.toHaveProperty(characterMetadataKey(record.id));
    expect(store.metadata["com.other/data"]).toEqual({ preserved: true });
  });

  it("removes legacy tombstones without changing active or unrelated metadata", async () => {
    const record = activeRecord("raganah");
    const tombstone = {
      schemaVersion: 1 as const,
      id: "old-hero",
      revision: 2,
      writeId: "deleted-write",
      deleted: true as const,
      deletedAt: "2026-07-26T15:00:00.000Z",
      deletedBy: "user-1",
    };
    const store = new FakeMetadataStore({
      [characterMetadataKey(record.id)]: record,
      [characterMetadataKey(tombstone.id)]: tombstone,
      "com.other/data": { preserved: true },
    });

    await expect(repository(store).cleanupLegacyTombstones()).resolves.toBe(1);

    expect(store.metadata[characterMetadataKey(record.id)]).toEqual(record);
    expect(store.metadata).not.toHaveProperty(
      characterMetadataKey(tombstone.id),
    );
    expect(store.metadata["com.other/data"]).toEqual({ preserved: true });
  });

  it("removes exactly the selected Bag of Books row and omits empty inventory", async () => {
    const record = activeRecord("raganah", {
      inventory: [
        ["Bag of Books", 0.4, 1],
        ["Bag of Books", 0.4, 3],
      ],
    });
    const store = new FakeMetadataStore({
      [characterMetadataKey(record.id)]: record,
    });
    const repo = repository(store, ["remove-write", "last-write"]);

    const first = await repo.removeInventoryItem(record.id, {
      sourceIndex: 1,
      expected: ["Bag of Books", 0.4, 3],
    });
    expect(first.inventory).toEqual([["Bag of Books", 0.4, 1]]);

    const empty = await repo.changeInventoryItemCount(
      record.id,
      {
        sourceIndex: 0,
        expected: ["Bag of Books", 0.4, 1],
      },
      -1,
    );
    expect(empty.inventory).toBeUndefined();
    expect(
      JSON.stringify(store.metadata[characterMetadataKey(record.id)]),
    ).not.toContain('"inventory"');
  });

  it("increments counts and safely rejects a stale selected tuple", async () => {
    const record = activeRecord("raganah", {
      inventory: [["Coin", 0.01, 137]],
    });
    const store = new FakeMetadataStore({
      [characterMetadataKey(record.id)]: record,
    });
    const repo = repository(store, ["increment-write"]);

    const incremented = await repo.changeInventoryItemCount(
      record.id,
      { sourceIndex: 0, expected: ["Coin", 0.01, 137] },
      1,
    );
    expect(incremented.inventory).toEqual([["Coin", 0.01, 138]]);
    await expect(
      repo.removeInventoryItem(record.id, {
        sourceIndex: 0,
        expected: ["Coin", 0.01, 137],
      }),
    ).rejects.toThrow("Inventory changed");
  });

  it("stores and removes Maximum Load without adding an empty inventory", async () => {
    const record = activeRecord("raganah");
    const store = new FakeMetadataStore({
      [characterMetadataKey(record.id)]: record,
    });
    const repo = repository(store, ["max-write", "remove-max-write"]);

    const withMaximum = await repo.setMaxLoad(record.id, 11);
    expect(withMaximum.maxLoad).toBe(11);
    expect(withMaximum.inventory).toBeUndefined();

    const withoutMaximum = await repo.setMaxLoad(record.id, undefined);
    expect(withoutMaximum.maxLoad).toBeUndefined();
    expect(
      JSON.stringify(store.metadata[characterMetadataKey(record.id)]),
    ).not.toContain('"maxLoad"');
  });

  it("fails safely when a concurrent client changes the selected row", async () => {
    const record = activeRecord("raganah", {
      inventory: [["Healing Potion", 1, 1]],
    });
    const store = new FakeMetadataStore({
      [characterMetadataKey(record.id)]: record,
    });
    let intercepted = false;
    store.afterSet = (update, target) => {
      if (intercepted || !(characterMetadataKey(record.id) in update)) return;
      intercepted = true;
      target.metadata[characterMetadataKey(record.id)] = {
        ...record,
        inventory: [["Healing Potion", 1, 2]],
        revision: 2,
        writeId: "competing-inventory-write",
      };
    };

    await expect(
      repository(store, ["our-write", "our-retry"]).removeInventoryItem(
        record.id,
        {
          sourceIndex: 0,
          expected: ["Healing Potion", 1, 1],
        },
      ),
    ).rejects.toThrow("Inventory changed");
    expect(
      (store.metadata[characterMetadataKey(record.id)] as CharacterRecord)
        .inventory,
    ).toEqual([["Healing Potion", 1, 2]]);
  });

  it("transfers partial and entire counts without merging destination duplicates", async () => {
    const source = activeRecord("source", {
      fields: { name: "Hero" },
      inventory: [
        ["Healing Potion", 1, 2],
        ["Bundle of Arrows", 0.33, 2],
      ],
    });
    const destination = activeRecord("destination", {
      fields: { name: "Wagon" },
      inventory: [["Healing Potion", 1, 1]],
      writeId: "destination-write",
    });
    const store = new FakeMetadataStore({
      [characterMetadataKey(source.id)]: source,
      [characterMetadataKey(destination.id)]: destination,
    });
    const repo = repository(store, [
      "source-transfer-1",
      "destination-transfer-1",
      "source-transfer-2",
      "destination-transfer-2",
    ]);

    const partial = await repo.transferInventoryItem(
      source.id,
      destination.id,
      { sourceIndex: 0, expected: ["Healing Potion", 1, 2] },
      1,
    );
    expect(partial.source.inventory?.[0]).toEqual(["Healing Potion", 1, 1]);
    expect(partial.destination.inventory).toEqual([
      ["Healing Potion", 1, 1],
      ["Healing Potion", 1, 1],
    ]);

    const entire = await repo.transferInventoryItem(
      source.id,
      destination.id,
      { sourceIndex: 1, expected: ["Bundle of Arrows", 0.33, 2] },
      2,
    );
    expect(entire.source.inventory).toEqual([["Healing Potion", 1, 1]]);
    expect(entire.destination.inventory?.at(-1)).toEqual([
      "Bundle of Arrows",
      0.33,
      2,
    ]);
  });
});
