import { describe, expect, it } from "vitest";
import { characterConflictHeadViews } from "./characterConflictView";
import { activeRecord } from "./characterTestHelpers";
import type { CharacterHistory } from "./characterRevision";

describe("characterConflictHeadViews", () => {
  it("summarizes active and deleted heads without exposing raw JSON", () => {
    const active = activeRecord("character-1", {
      writeId: "active",
      fields: { name: "Raganah", hpCurrent: 7, hpMax: 10, armor: 2, xp: 3 },
      inventory: [["Rope", 1, 1]],
    });
    const deleted = {
      schemaVersion: 4 as const,
      id: "character-1",
      revision: 2,
      writeId: "deleted",
      parents: ["active"],
      deleted: true as const,
      name: "Raganah",
      deletedAt: "2026-09-21T12:00:00.000Z",
      deletedBy: "gm-1",
    };
    const history: CharacterHistory = {
      formatVersion: 1,
      characterId: "character-1",
      revisions: { active, deleted },
      heads: ["deleted", "active"],
    };
    const views = characterConflictHeadViews(history);
    expect(views.map((view) => view.writeId)).toEqual(["active", "deleted"]);
    expect(views[0].summary).toBe("HP 7/10 · ARM 2 · XP 3 · 1 inventory rows");
    expect(views[1].summary).toBe("Deleted Character");
  });
});
