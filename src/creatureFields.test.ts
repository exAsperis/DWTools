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
  removeCharacterLink,
  setCharacterLink,
} from "./creatureFields";
import { token } from "./characterTestHelpers";

describe("canonical creature field mapping", () => {
  it("maps every persistent field between a token and character fields", () => {
    const item = token("one", "Goblin", {
      tags: "Small",
      hpCurrent: 3,
      hpMax: 6,
      armor: 1,
      damage: "d6",
      damageDescription: "Knife",
      damageTags: "Close",
      instinct: "To steal",
      moves: "Hide",
      treasure: "Coins",
      visibleToPlayers: false,
    });
    const fields = extractCreatureFields(item);
    expect(fields).toEqual({
      name: "Goblin",
      tags: "Small",
      hpCurrent: 3,
      hpMax: 6,
      armor: 1,
      damage: "d6",
      damageDescription: "Knife",
      damageTags: "Close",
      instinct: "To steal",
      moves: "Hide",
      treasure: "Coins",
      visibleToPlayers: false,
    });

    const replacement: CreatureFields = {
      ...fields,
      name: "Goblin Chief",
      hpCurrent: 9,
    };
    applyCreatureFieldsToItem(item, replacement);
    expect(item.name).toBe("Goblin Chief");
    expect(item.metadata[CREATURE_KEY]).toEqual({
      tags: "Small",
      hpCurrent: 9,
      hpMax: 6,
      armor: 1,
      damage: "d6",
      damageDescription: "Knife",
      damageTags: "Close",
      instinct: "To steal",
      moves: "Hide",
      treasure: "Coins",
      visibleToPlayers: false,
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
});
