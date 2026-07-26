import { describe, expect, it } from "vitest";
import { readCreatureForm } from "./creatureForm";

describe("readCreatureForm", () => {
  it("trims and saves all full-editor creature fields", () => {
    const form = new FormData();
    form.set("tags", "  Solitary, Intelligent  ");
    form.set("armor", " 2 ");
    form.set("hpCurrent", " 7 ");
    form.set("hpMax", " 10 ");
    form.set("damage", " d8+1 ");
    form.set("damageDescription", " Claws ");
    form.set("damageTags", " Close, Messy ");
    form.set("instinct", " To defend ");
    form.set("moves", " Strike\nHide ");
    form.set("treasure", " Silver idol ");
    form.set("visibleToPlayers", "on");

    expect(readCreatureForm(form, {}, false)).toEqual({
      tags: "Solitary, Intelligent",
      armor: 2,
      hpCurrent: 7,
      hpMax: 10,
      damage: "d8+1",
      damageDescription: "Claws",
      damageTags: "Close, Messy",
      instinct: "To defend",
      moves: "Strike\nHide",
      treasure: "Silver idol",
      visibleToPlayers: true,
    });
  });

  it("omits blank optional values", () => {
    const form = new FormData();
    form.set("tags", "   ");
    form.set("damageDescription", "");
    form.set("damageTags", "\t");

    expect(readCreatureForm(form, {}, false)).toEqual({
      tags: undefined,
      armor: undefined,
      hpCurrent: undefined,
      hpMax: undefined,
      damage: undefined,
      damageDescription: undefined,
      damageTags: undefined,
      instinct: undefined,
      moves: undefined,
      treasure: undefined,
      visibleToPlayers: false,
    });
  });

  it("preserves full creature data in the HP-only editor", () => {
    const current = {
      tags: "Solitary",
      damageDescription: "Claws",
      damageTags: "Close",
      hpCurrent: 4,
      hpMax: 8,
    };
    const form = new FormData();
    form.set("hpCurrent", "5");
    form.set("hpMax", "8");

    expect(readCreatureForm(form, current, true)).toEqual({
      ...current,
      hpCurrent: 5,
      hpMax: 8,
    });
  });
});
