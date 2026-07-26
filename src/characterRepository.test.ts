import { describe, expect, it } from "vitest";
import {
  CHARACTER_METADATA_SAFE_MAX_BYTES,
  CharacterRepository,
  CharacterRepositoryError,
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
      schemaVersion: 1,
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
});
