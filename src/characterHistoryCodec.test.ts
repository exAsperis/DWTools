import { describe, expect, it } from "vitest";

import { activeRecord } from "./characterTestHelpers";

import {
  cloneCharacterHistory,
  deserializeCharacterHistory,
  parseCharacterHistory,
  serializeCharacterHistory,
  serializedCharacterHistoryBytes,
  CharacterHistoryCodecError,
} from "./characterHistoryCodec";

import type {
  CharacterHistory,
  VersionedCharacterRecord,
} from "./characterRevision";

function revision(
  characterId: string,
  writeId: string,
  parents: string[] = [],
  revisionNumber = 1,
): VersionedCharacterRecord {
  return {
    ...activeRecord(characterId, {
      revision: revisionNumber,
      writeId,
    }),
    parents,
  };
}

function history(characterId = "character-1"): CharacterHistory {
  const root = revision(characterId, "root");

  const next = revision(characterId, "next", ["root"], 2);

  return {
    formatVersion: 1,
    characterId,
    revisions: {
      root,
      next,
    },
    heads: ["next"],
  };
}

describe("Character history codec", () => {
  it("round-trips a valid history", () => {
    const original = history();

    const serialized = serializeCharacterHistory(original);

    expect(deserializeCharacterHistory(serialized, "character-1")).toEqual(
      original,
    );
  });

  it("returns a detached clone", () => {
    const original = history();

    const copy = cloneCharacterHistory(original);

    copy.heads.push("another");
    copy.revisions.next.parents.push("other");

    expect(original.heads).toEqual(["next"]);

    expect(original.revisions.next.parents).toEqual(["root"]);
  });

  it("preserves incomplete ancestry", () => {
    const incomplete: CharacterHistory = {
      formatVersion: 1,
      characterId: "character-1",
      revisions: {
        next: revision("character-1", "next", ["missing"], 2),
      },
      heads: ["next"],
    };

    expect(parseCharacterHistory(incomplete)).toEqual(incomplete);
  });

  it("rejects a revision key/writeId mismatch", () => {
    const value = history();

    value.revisions.wrong = value.revisions.next;

    delete value.revisions.next;

    expect(() => parseCharacterHistory(value)).toThrow(
      CharacterHistoryCodecError,
    );
  });

  it("rejects a history for another Character", () => {
    expect(() =>
      parseCharacterHistory(history("character-2"), "character-1"),
    ).toThrow("Character history belongs to a different Character.");
  });

  it("rejects cycles", () => {
    const a = revision("character-1", "a", ["b"], 1);

    const b = revision("character-1", "b", ["a"], 2);

    expect(() =>
      parseCharacterHistory({
        formatVersion: 1,
        characterId: "character-1",
        revisions: { a, b },
        heads: ["b"],
      }),
    ).toThrow(CharacterHistoryCodecError);
  });

  it("rejects missing heads", () => {
    const root = revision("character-1", "root");

    expect(() =>
      parseCharacterHistory({
        formatVersion: 1,
        characterId: "character-1",
        revisions: { root },
        heads: ["missing"],
      }),
    ).toThrow(CharacterHistoryCodecError);
  });

  it("rejects malformed Character records", () => {
    expect(() =>
      parseCharacterHistory({
        formatVersion: 1,
        characterId: "character-1",
        revisions: {
          broken: {
            id: "character-1",
            writeId: "broken",
            revision: 1,
            parents: [],
            schemaVersion: 999,
          },
        },
        heads: ["broken"],
      }),
    ).toThrow("Character history contains a malformed Character revision.");
  });

  it("rejects invalid JSON", () => {
    expect(() => deserializeCharacterHistory("{not-json")).toThrow(
      "Stored Character history is not valid JSON.",
    );
  });

  it("measures serialized UTF-8 bytes", () => {
    const value = history();

    const expected = new TextEncoder().encode(
      serializeCharacterHistory(value),
    ).byteLength;

    expect(serializedCharacterHistoryBytes(value)).toBe(expected);
  });
});
