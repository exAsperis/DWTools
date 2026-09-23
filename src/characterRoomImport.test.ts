import { describe, expect, it } from "vitest";

import { CHARACTER_KEY_PREFIX, LEGACY_CHARACTER_KEY_PREFIX } from "./constants";

import { activeRecord } from "./characterTestHelpers";

import {
  CHARACTER_RECORD_SCHEMA_VERSION,
  type CharacterRecord,
} from "./characterRepository";

import {
  LOCAL_CHARACTER_ENTRY_FORMAT_VERSION,
  type CharacterLocalEntry,
} from "./characterLocalStore";

import {
  importRoomCharacterMetadataToLocal,
  importRoomCharactersToLocal,
  scanRoomCharacterHistories,
  CharacterRoomImportError,
  type CharacterRoomImportLocalStore,
} from "./characterRoomImport";

import type { CharacterHistory } from "./characterRevision";

import type { RoomMetadata } from "./defaultVisibility";

function currentKey(characterId: string): string {
  return CHARACTER_KEY_PREFIX + characterId;
}

function legacyKey(characterId: string): string {
  return LEGACY_CHARACTER_KEY_PREFIX + characterId;
}

function history(record: CharacterRecord): CharacterHistory {
  return {
    formatVersion: 1,

    characterId: record.id,

    revisions: {
      [record.writeId]: record,
    },

    heads: [record.writeId],
  };
}

function localEntry(
  record: CharacterRecord,
  pendingRevisionIds: string[] = [],
): CharacterLocalEntry {
  return {
    formatVersion: LOCAL_CHARACTER_ENTRY_FORMAT_VERSION,

    roomId: "room-1",

    characterId: record.id,

    history: history(record),

    sync: {
      pendingRevisionIds,
    },
  };
}

class FakeImportLocalStore implements CharacterRoomImportLocalStore {
  readonly roomId = "room-1";

  entries = new Map<string, CharacterLocalEntry>();

  readonly puts: CharacterLocalEntry[] = [];

  failGetFor = new Set<string>();

  failPutFor = new Set<string>();

  get(characterId: string): CharacterLocalEntry | undefined {
    if (this.failGetFor.has(characterId)) {
      throw new Error("local read failed");
    }

    return this.entries.get(characterId);
  }

  put(entry: CharacterLocalEntry): CharacterLocalEntry {
    if (this.failPutFor.has(entry.characterId)) {
      throw new Error("local write failed");
    }

    const saved = structuredClone(entry);

    this.entries.set(entry.characterId, saved);

    this.puts.push(saved);

    return saved;
  }
}

describe("room Character history scan", () => {
  it("reads current room Character records", () => {
    const record = activeRecord("character-1");

    const result = scanRoomCharacterHistories({
      [currentKey(record.id)]: record,

      "com.other/data": true,
    });

    expect(result.issues).toEqual([]);

    expect(result.blockedCharacterIds).toEqual([]);

    expect(result.histories).toEqual([history(record)]);
  });

  it("normalizes a legacy schema-3 room record into a schema-4 root", () => {
    const modern = activeRecord("legacy", {
      revision: 7,

      writeId: "legacy-write",
    });

    const legacy: Record<string, unknown> = {
      ...modern,

      schemaVersion: 3,
    };

    delete legacy.parents;

    const result = scanRoomCharacterHistories({
      [legacyKey("legacy")]: legacy,
    });

    expect(result.issues).toEqual([]);

    const imported = result.histories[0].revisions["legacy-write"];

    expect(imported.schemaVersion).toBe(CHARACTER_RECORD_SCHEMA_VERSION);

    expect(imported.revision).toBe(7);

    expect(imported.writeId).toBe("legacy-write");

    expect(imported.parents).toEqual([]);
  });

  it("deduplicates identical current and legacy revisions", () => {
    const record = activeRecord("same", {
      writeId: "same-write",
    });

    const result = scanRoomCharacterHistories({
      [currentKey("same")]: record,

      [legacyKey("same")]: record,
    });

    expect(result.issues).toEqual([]);

    expect(result.histories).toHaveLength(1);

    expect(Object.keys(result.histories[0].revisions)).toEqual(["same-write"]);

    expect(result.histories[0].heads).toEqual(["same-write"]);
  });

  it("preserves divergent current and legacy revisions as separate heads", () => {
    const legacy = activeRecord("character-1", {
      writeId: "legacy",

      revision: 2,

      fields: {
        name: "Raganah",

        hpCurrent: 4,
      },
    });

    const current = activeRecord("character-1", {
      writeId: "current",

      revision: 9,

      fields: {
        name: "Raganah",

        hpCurrent: 12,
      },
    });

    const result = scanRoomCharacterHistories({
      [legacyKey("character-1")]: legacy,

      [currentKey("character-1")]: current,
    });

    expect(result.issues).toEqual([]);

    expect(result.histories[0].heads).toEqual(["current", "legacy"]);

    expect(result.histories[0].revisions.current).toBeDefined();

    expect(result.histories[0].revisions.legacy).toBeDefined();
  });

  it("recognizes current history as a descendant when its parent is the preserved legacy writeId", () => {
    const legacy = activeRecord("character-1", {
      writeId: "legacy",

      revision: 1,

      parents: [],
    });

    const current = activeRecord("character-1", {
      writeId: "current",

      revision: 2,

      parents: ["legacy"],
    });

    const result = scanRoomCharacterHistories({
      [legacyKey("character-1")]: legacy,

      [currentKey("character-1")]: current,
    });

    expect(result.histories[0].heads).toEqual(["current"]);

    expect(Object.keys(result.histories[0].revisions).sort()).toEqual([
      "current",
      "legacy",
    ]);
  });

  it("blocks same-writeId collisions instead of choosing a room namespace", () => {
    const legacy = activeRecord("character-1", {
      writeId: "collision",

      fields: {
        name: "Raganah",

        hpCurrent: 4,
      },
    });

    const current = activeRecord("character-1", {
      writeId: "collision",

      fields: {
        name: "Raganah",

        hpCurrent: 12,
      },
    });

    const result = scanRoomCharacterHistories({
      [legacyKey("character-1")]: legacy,

      [currentKey("character-1")]: current,
    });

    expect(result.histories).toEqual([]);

    expect(result.blockedCharacterIds).toEqual(["character-1"]);

    expect(result.issues).toEqual([
      expect.objectContaining({
        kind: "room-history-conflict",

        characterId: "character-1",
      }),
    ]);
  });

  it("reports a malformed variant but can still import another valid variant", () => {
    const valid = activeRecord("character-1");

    const result = scanRoomCharacterHistories({
      [legacyKey("character-1")]: {
        broken: true,
      },

      [currentKey("character-1")]: valid,
    });

    expect(result.histories).toEqual([history(valid)]);

    expect(result.issues).toEqual([
      expect.objectContaining({
        kind: "malformed-room-record",

        source: "legacy",

        characterId: "character-1",
      }),
    ]);
  });
});

describe("room Character import into local history", () => {
  it("imports a room-only Character and marks its head pending", () => {
    const record = activeRecord("character-1");

    const local = new FakeImportLocalStore();

    const result = importRoomCharacterMetadataToLocal(
      {
        [currentKey(record.id)]: record,
      },

      local,
    );

    expect(result.importedCharacterIds).toEqual(["character-1"]);

    expect(local.entries.get("character-1")?.sync.pendingRevisionIds).toEqual([
      record.writeId,
    ]);
  });

  it("does not rewrite identical local history or clear existing pending state", () => {
    const record = activeRecord("character-1");

    const local = new FakeImportLocalStore();

    local.entries.set(record.id, localEntry(record, [record.writeId]));

    const result = importRoomCharacterMetadataToLocal(
      {
        [currentKey(record.id)]: record,
      },

      local,
    );

    expect(result.unchangedCharacterIds).toEqual(["character-1"]);

    expect(local.puts).toHaveLength(0);

    expect(local.entries.get(record.id)?.sync.pendingRevisionIds).toEqual([
      record.writeId,
    ]);
  });

  it("adds a room descendant to older local history", () => {
    const root = activeRecord("character-1", {
      writeId: "root",

      revision: 1,

      parents: [],
    });

    const next = activeRecord("character-1", {
      writeId: "next",

      revision: 2,

      parents: ["root"],
    });

    const local = new FakeImportLocalStore();

    local.entries.set(root.id, localEntry(root));

    const result = importRoomCharacterMetadataToLocal(
      {
        [currentKey(next.id)]: next,
      },

      local,
    );

    expect(result.importedCharacterIds).toEqual(["character-1"]);

    const imported = local.entries.get("character-1")!;

    expect(imported.history.heads).toEqual(["next"]);

    expect(Object.keys(imported.history.revisions).sort()).toEqual([
      "next",
      "root",
    ]);

    expect(imported.sync.pendingRevisionIds).toEqual(["next"]);
  });

  it("preserves divergent local and room branches", () => {
    const localRecord = activeRecord("character-1", {
      writeId: "local",

      revision: 10,

      fields: {
        name: "Raganah",

        hpCurrent: 3,
      },
    });

    const roomRecord = activeRecord("character-1", {
      writeId: "room",

      revision: 2,

      fields: {
        name: "Raganah",

        armor: 4,
      },
    });

    const local = new FakeImportLocalStore();

    local.entries.set(localRecord.id, localEntry(localRecord));

    importRoomCharacterMetadataToLocal(
      {
        [currentKey(roomRecord.id)]: roomRecord,
      },

      local,
    );

    const imported = local.entries.get("character-1")!;

    expect(imported.history.heads).toEqual(["local", "room"]);

    expect(imported.sync.pendingRevisionIds).toEqual(["local", "room"]);
  });

  it("does not overwrite local history on an unsafe revision-ID collision", () => {
    const localRecord = activeRecord("character-1", {
      writeId: "same",

      fields: {
        name: "Raganah",

        hpCurrent: 1,
      },
    });

    const roomRecord = activeRecord("character-1", {
      writeId: "same",

      fields: {
        name: "Raganah",

        hpCurrent: 9,
      },
    });

    const local = new FakeImportLocalStore();

    local.entries.set(localRecord.id, localEntry(localRecord));

    const before = structuredClone(local.entries.get("character-1"));

    const result = importRoomCharacterMetadataToLocal(
      {
        [currentKey(roomRecord.id)]: roomRecord,
      },

      local,
    );

    expect(result.blockedCharacterIds).toEqual(["character-1"]);

    expect(result.issues).toEqual([
      expect.objectContaining({
        kind: "local-history-conflict",
      }),
    ]);

    expect(local.entries.get("character-1")).toEqual(before);

    expect(local.puts).toHaveLength(0);
  });

  it("preserves malformed local storage instead of overwriting it", () => {
    const roomRecord = activeRecord("character-1");

    const local = new FakeImportLocalStore();

    local.failGetFor.add("character-1");

    const result = importRoomCharacterMetadataToLocal(
      {
        [currentKey(roomRecord.id)]: roomRecord,
      },

      local,
    );

    expect(result.blockedCharacterIds).toEqual(["character-1"]);

    expect(result.issues).toEqual([
      expect.objectContaining({
        kind: "local-read-failed",
      }),
    ]);

    expect(local.puts).toHaveLength(0);
  });

  it("reports a local write failure without altering room input", () => {
    const record = activeRecord("character-1");

    const metadata: RoomMetadata = {
      [currentKey(record.id)]: record,
    };

    const before = structuredClone(metadata);

    const local = new FakeImportLocalStore();

    local.failPutFor.add(record.id);

    const result = importRoomCharacterMetadataToLocal(metadata, local);

    expect(result.issues).toEqual([
      expect.objectContaining({
        kind: "local-write-failed",
      }),
    ]);

    expect(metadata).toEqual(before);

    expect(local.entries.size).toBe(0);
  });

  it("is idempotent when run repeatedly against the same room snapshot", () => {
    const record = activeRecord("character-1");

    const metadata = {
      [currentKey(record.id)]: record,
    };

    const local = new FakeImportLocalStore();

    const first = importRoomCharacterMetadataToLocal(metadata, local);

    const second = importRoomCharacterMetadataToLocal(metadata, local);

    expect(first.importedCharacterIds).toEqual(["character-1"]);

    expect(second.unchangedCharacterIds).toEqual(["character-1"]);

    expect(local.puts).toHaveLength(1);
  });

  it("wraps room metadata read failure without making local changes", async () => {
    const local = new FakeImportLocalStore();

    await expect(
      importRoomCharactersToLocal(
        {
          getMetadata: async () => {
            throw new Error("room unavailable");
          },
        },

        local,
      ),
    ).rejects.toBeInstanceOf(CharacterRoomImportError);

    expect(local.puts).toHaveLength(0);
  });
});
