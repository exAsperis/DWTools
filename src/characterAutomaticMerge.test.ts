import { describe, expect, it } from "vitest";
import {
  automaticCharacterMergeWriteId,
  automaticCharacterReconciliationOptions,
  AUTOMATIC_CHARACTER_MERGE_ACTOR_ID,
  createAutomaticCharacterMergeRevisionOptions,
} from "./characterAutomaticMerge";
import {
  reconcileCharacterHistories,
  type CharacterAutomaticMergeContext,
} from "./characterReconciliation";
import { activeRecord } from "./characterTestHelpers";
import type { CharacterHistory } from "./characterRevision";

function context(): CharacterAutomaticMergeContext {
  return {
    characterId: "character-1",
    baseWriteId: "base",
    parentWriteIds: ["left", "right"],
    parentUpdatedAts: ["2026-09-20T12:00:00.000Z", "2026-09-21T10:00:00.000Z"],
  };
}

describe("automatic Character merges", () => {
  it("generates the same automatic merge identity repeatedly", () => {
    const first = createAutomaticCharacterMergeRevisionOptions(context());
    const second = createAutomaticCharacterMergeRevisionOptions(context());

    expect(second).toEqual(first);
    expect(first.actorId).toBe(AUTOMATIC_CHARACTER_MERGE_ACTOR_ID);
    expect(first.updatedAt).toBe("2026-09-21T10:00:00.000Z");
  });

  it("is insensitive to parent input ordering when timestamps remain paired with their parents", () => {
    const forward = context();
    const reversed: CharacterAutomaticMergeContext = {
      ...forward,
      parentWriteIds: ["right", "left"],
      parentUpdatedAts: [
        "2026-09-21T10:00:00.000Z",
        "2026-09-20T12:00:00.000Z",
      ],
    };

    expect(automaticCharacterMergeWriteId(reversed)).toBe(
      automaticCharacterMergeWriteId(forward),
    );
  });

  it("uses a different identity for a different merge base", () => {
    expect(
      automaticCharacterMergeWriteId({
        ...context(),
        baseWriteId: "another-base",
      }),
    ).not.toBe(automaticCharacterMergeWriteId(context()));
  });

  it("lets two independent clients manufacture the same merge revision", () => {
    const base = activeRecord("character-1", {
      writeId: "base",
      revision: 1,
      parents: [],
      fields: { name: "Raganah", hpCurrent: 10, armor: 1 },
    });
    const left = activeRecord("character-1", {
      writeId: "left",
      revision: 2,
      parents: ["base"],
      fields: { name: "Raganah", hpCurrent: 7, armor: 1 },
      updatedAt: "2026-09-20T12:00:00.000Z",
    });
    const right = activeRecord("character-1", {
      writeId: "right",
      revision: 2,
      parents: ["base"],
      fields: { name: "Raganah", hpCurrent: 10, armor: 2 },
      updatedAt: "2026-09-21T10:00:00.000Z",
    });
    const local: CharacterHistory = {
      formatVersion: 1,
      characterId: "character-1",
      revisions: { base, left },
      heads: ["left"],
    };
    const scene: CharacterHistory = {
      formatVersion: 1,
      characterId: "character-1",
      revisions: { base, right },
      heads: ["right"],
    };

    const first = reconcileCharacterHistories(
      local,
      scene,
      automaticCharacterReconciliationOptions,
    );
    const second = reconcileCharacterHistories(
      local,
      scene,
      automaticCharacterReconciliationOptions,
    );

    expect(first.status).toBe("merged");
    expect(second.status).toBe("merged");
    if (first.status !== "merged" || second.status !== "merged") {
      throw new Error("Expected deterministic merges");
    }
    expect(second.mergeRevisionId).toBe(first.mergeRevisionId);
    expect(second.history.revisions[second.mergeRevisionId]).toEqual(
      first.history.revisions[first.mergeRevisionId],
    );
  });
});
