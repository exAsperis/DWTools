import type { Metadata } from "@owlbear-rodeo/sdk";

import { describe, expect, it } from "vitest";

import { activeRecord } from "./characterTestHelpers";

import { characterMetadataKey } from "./characterRepository";

import type {
  CharacterHistory,
  VersionedCharacterRecord,
} from "./characterRevision";

import {
  CharacterSceneStore,
  CharacterSceneStoreError,
  scanSceneCharacterHistories,
  type CharacterSceneMetadataApi,
} from "./characterSceneStore";

class FakeSceneMetadataApi implements CharacterSceneMetadataApi {
  metadata: Metadata;

  readonly updates: Metadata[] = [];

  readonly listeners = new Set<(metadata: Metadata) => void>();

  failReads = false;
  failWrites = false;

  constructor(metadata: Metadata = {}) {
    this.metadata = {
      ...metadata,
    };
  }

  async getMetadata(): Promise<Metadata> {
    if (this.failReads) {
      throw new Error("read failed");
    }

    return {
      ...this.metadata,
    };
  }

  async setMetadata(update: Metadata): Promise<void> {
    if (this.failWrites) {
      throw new Error("write failed");
    }

    this.updates.push({
      ...update,
    });

    this.metadata = {
      ...this.metadata,
      ...update,
    };

    this.emit();
  }

  onMetadataChange(callback: (metadata: Metadata) => void): () => void {
    this.listeners.add(callback);

    return () => this.listeners.delete(callback);
  }

  externalSet(update: Metadata): void {
    this.metadata = {
      ...this.metadata,
      ...update,
    };

    this.emit();
  }

  externalDelete(key: string): void {
    delete this.metadata[key];
    this.emit();
  }

  private emit(): void {
    const snapshot = {
      ...this.metadata,
    };

    for (const listener of this.listeners) {
      listener(snapshot);
    }
  }
}

function revision(
  characterId: string,
  writeId: string,
  parents: string[] = [],
  revisionNumber = 1,
): VersionedCharacterRecord {
  return {
    ...activeRecord(characterId, {
      writeId,
      revision: revisionNumber,
    }),
    parents,
  };
}

function history(characterId: string, writeId = "root"): CharacterHistory {
  const root = revision(characterId, writeId);

  return {
    formatVersion: 1,
    characterId,
    revisions: {
      [writeId]: root,
    },
    heads: [writeId],
  };
}

describe("scene Character history scanning", () => {
  it("reads Character histories and ignores unrelated metadata", () => {
    const first = history("first");

    const second = history("second");

    const result = scanSceneCharacterHistories({
      [characterMetadataKey("first")]: first,

      [characterMetadataKey("second")]: second,

      "com.other-extension/data": {
        preserved: true,
      },
    });

    expect(result.histories.map((value) => value.characterId)).toEqual([
      "first",
      "second",
    ]);

    expect(result.issues).toEqual([]);
  });

  it("surfaces malformed Character histories without altering the metadata", () => {
    const key = characterMetadataKey("broken");

    const metadata: Metadata = {
      [key]: {
        bad: true,
      },
    };

    const before = JSON.stringify(metadata);

    const result = scanSceneCharacterHistories(metadata);

    expect(result.histories).toEqual([]);

    expect(result.issues).toEqual([
      expect.objectContaining({
        key,
        characterId: "broken",
        code: "MALFORMED",
      }),
    ]);

    expect(JSON.stringify(metadata)).toBe(before);
  });
});

describe("CharacterSceneStore", () => {
  it("gets one Character history", async () => {
    const expected = history("character-1");

    const api = new FakeSceneMetadataApi({
      [characterMetadataKey("character-1")]: expected,
    });

    const store = new CharacterSceneStore(api);

    expect(await store.get("character-1")).toEqual(expected);
  });

  it("returns undefined when a Character is absent", async () => {
    const store = new CharacterSceneStore(new FakeSceneMetadataApi());

    expect(await store.get("missing")).toBeUndefined();
  });

  it("writes exactly one independent Character metadata key", async () => {
    const api = new FakeSceneMetadataApi({
      "com.other-extension/data": {
        preserved: true,
      },
    });

    const store = new CharacterSceneStore(api);

    const value = history("character-1");

    await store.put(value);

    expect(api.updates).toEqual([
      {
        [characterMetadataKey("character-1")]: value,
      },
    ]);

    expect(api.metadata["com.other-extension/data"]).toEqual({
      preserved: true,
    });
  });

  it("does not mutate the history supplied to put", async () => {
    const api = new FakeSceneMetadataApi();

    const store = new CharacterSceneStore(api);

    const value = history("character-1");

    const before = JSON.stringify(value);

    await store.put(value);

    expect(JSON.stringify(value)).toBe(before);
  });

  it("surfaces malformed stored history", async () => {
    const api = new FakeSceneMetadataApi({
      [characterMetadataKey("broken")]: {
        bad: true,
      },
    });

    const store = new CharacterSceneStore(api);

    await expect(store.get("broken")).rejects.toBeInstanceOf(
      CharacterSceneStoreError,
    );
  });

  it("reports scene API read failures", async () => {
    const api = new FakeSceneMetadataApi();

    api.failReads = true;

    const store = new CharacterSceneStore(api);

    await expect(store.scan()).rejects.toMatchObject({
      code: "READ",
    });
  });

  it("reports scene API write failures", async () => {
    const api = new FakeSceneMetadataApi();

    api.failWrites = true;

    const store = new CharacterSceneStore(api);

    await expect(store.put(history("character-1"))).rejects.toMatchObject({
      code: "WRITE",
    });

    expect(api.metadata[characterMetadataKey("character-1")]).toBeUndefined();
  });

  it("reports only Character metadata changes after an initial scan", async () => {
    const original = history("character-1");

    const api = new FakeSceneMetadataApi({
      [characterMetadataKey("character-1")]: original,

      "com.other-extension/data": {
        count: 1,
      },
    });

    const store = new CharacterSceneStore(api);

    await store.scan();

    const changes: Array<{
      characterId: string;
      kind: string;
    }> = [];

    store.subscribe((value) => changes.push(...value));

    api.externalSet({
      "com.other-extension/data": {
        count: 2,
      },
    });

    expect(changes).toEqual([]);

    const changed = history("character-1", "replacement");

    api.externalSet({
      [characterMetadataKey("character-1")]: changed,
    });

    expect(changes).toEqual([
      {
        characterId: "character-1",
        kind: "changed",
      },
    ]);
  });

  it("reports removal of a previously known Character key", async () => {
    const api = new FakeSceneMetadataApi({
      [characterMetadataKey("character-1")]: history("character-1"),
    });

    const store = new CharacterSceneStore(api);

    await store.scan();

    const changes: Array<{
      characterId: string;
      kind: string;
    }> = [];

    store.subscribe((value) => changes.push(...value));

    api.externalDelete(characterMetadataKey("character-1"));

    expect(changes).toEqual([
      {
        characterId: "character-1",
        kind: "removed",
      },
    ]);
  });
});
