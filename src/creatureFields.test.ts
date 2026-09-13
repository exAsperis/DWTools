import { describe, expect, it } from "vitest";
import {
  CHARACTER_LINK_KEY,
  CREATURE_KEY,
  type CreatureFields,
} from "./constants";
import {
  applyCreatureFieldsToItem,
  extractCreatureFields,
  getCharacterLink,
  normalizeCreatureData,
  removeCharacterLink,
  setCharacterLink,
} from "./creatureFields";
import { token } from "./characterTestHelpers";

describe("canonical creature field mapping", () => {
  it("maps every persistent field between a token and character fields", () => {
    const item = token("one", "Goblin", {
      tags: ["Small"],
      specialQualities: "Sees in darkness",
      hpCurrent: 3,
      hpMax: 6,
      hpBase: 8,
      maxLoad: 12,
      loadBase: 11,
      armor: 1,
      armorTags: ["Natural"],
      damage: "d6",
      damageDescription: "Knife",
      damageTags: ["Close"],
      instinct: "To steal",
      moves: "Hide",
      treasure: "Coins",
      level: 4,
      xp: 3,
      scores: [16, null, 15, 12, 13, 8],
      conditions: { weak: -1, confused: -1 },
      alignment: "Good",
      visibleToPlayers: false,
    });
    const fields = extractCreatureFields(item);
    expect(fields).toEqual({
      name: "Goblin",
      tags: ["Small"],
      specialQualities: "Sees in darkness",
      hpCurrent: 3,
      hpMax: 6,
      hpBase: 8,
      maxLoad: 12,
      loadBase: 11,
      armor: 1,
      armorTags: ["Natural"],
      damage: "d6",
      damageDescription: "Knife",
      damageTags: ["Close"],
      instinct: "To steal",
      moves: "Hide",
      treasure: "Coins",
      level: 4,
      xp: 3,
      scores: [16, null, 15, 12, 13, 8],
      conditions: { weak: -1, confused: -1 },
      alignment: "Good",
      visibleToPlayers: false,
    });

    const replacement: CreatureFields = {
      ...fields,
      name: "Goblin Chief",
      hpCurrent: 9,
    };
    applyCreatureFieldsToItem(item, replacement);
    expect(item.name).toBe("Goblin Chief");
    expect(
      (item as unknown as { text: { plainText: string } }).text.plainText,
    ).toBe("Goblin");
    expect(
      (item as unknown as { text: { richText: unknown } }).text.richText,
    ).toEqual([{ type: "paragraph", children: [{ text: "Goblin" }] }]);
    expect(item.metadata[CREATURE_KEY]).toEqual({
      tags: ["Small"],
      specialQualities: "Sees in darkness",
      hpCurrent: 9,
      hpMax: 6,
      hpBase: 8,
      maxLoad: 12,
      loadBase: 11,
      armor: 1,
      armorTags: ["Natural"],
      damage: "d6",
      damageDescription: "Knife",
      damageTags: ["Close"],
      instinct: "To steal",
      moves: "Hide",
      treasure: "Coins",
      level: 4,
      xp: 3,
      scores: [16, null, 15, 12, 13, 8],
      conditions: { weak: -1, confused: -1 },
      alignment: "Good",
      visibleToPlayers: false,
    });

    item.name = "Custom token label";
    applyCreatureFieldsToItem(item, { ...replacement, hpCurrent: 7 }, {});
    expect(item.name).toBe("Custom token label");
    expect(
      (item as unknown as { text: { plainText: string } }).text.plainText,
    ).toBe("Goblin");
    expect(item.metadata[CREATURE_KEY]).toMatchObject({ hpCurrent: 7 });
  });

  it("changes the visible label only when explicitly requested", () => {
    const item = token("one", "Goblin", { hpCurrent: 3 });
    applyCreatureFieldsToItem(
      item,
      { name: "Goblin Chief", hpCurrent: 3 },
      { overwriteItemName: true, overwriteTextLabel: true },
    );
    expect(item.name).toBe("Goblin Chief");
    expect(
      (item as unknown as { text: { plainText: string } }).text.plainText,
    ).toBe("Goblin Chief");
  });

  it("converts legacy comma-separated tag strings to arrays", () => {
    expect(
      normalizeCreatureData({
        tags: " Small, Intelligent, small ",
        armorTags: "Natural",
        damageTags: "Close, Messy",
      }),
    ).toEqual({
      tags: ["Small", "Intelligent"],
      armorTags: ["Natural"],
      damageTags: ["Close", "Messy"],
    });
  });

  it("sets and removes only versioned link metadata", () => {
    const item = token("one", "Goblin", { hpCurrent: 3 });
    setCharacterLink(item, "character-1");

    expect(getCharacterLink(item)).toEqual({
      schemaVersion: 1,
      characterId: "character-1",
    });
    removeCharacterLink(item);
    expect(item.metadata[CHARACTER_LINK_KEY]).toBeUndefined();
    expect(item.metadata[CREATURE_KEY]).toEqual({ hpCurrent: 3 });
  });

  it("compacts blank player fields and rejects invalid ranges or conditions", () => {
    expect(
      normalizeCreatureData({
        scores: [null, null, null, null, null, null],
        conditions: {},
        alignment: "   ",
      }),
    ).toEqual({});
    expect(() =>
      normalizeCreatureData({ scores: [2, null, null, null, null, null] }),
    ).toThrow("between 3 and 18");
    expect(() => normalizeCreatureData({ level: 11 })).toThrow(
      "between 1 and 10",
    );
    expect(() => normalizeCreatureData({ xp: 1.5 })).toThrow("whole number");
    expect(() => normalizeCreatureData({ conditions: { weak: 0 } })).toThrow(
      "must be -1",
    );
    expect(() =>
      normalizeCreatureData({ conditions: { frightened: -1 } }),
    ).toThrow("unknown key");
  });
});
