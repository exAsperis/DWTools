import type { Item, Metadata } from "@owlbear-rodeo/sdk";
import { describe, expect, it } from "vitest";
import { CREATURE_KEY, ENCOUNTER_STATE_KEY } from "./constants";
import {
  buildEncounterMarkup,
  encounterItems,
  hpPresentation,
  parseEncounterState,
  setEncounterItemActive,
  type EncounterMetadataStore,
} from "./encounter";

function item(
  id: string,
  text: string,
  name: string,
  data: Record<string, unknown> = {},
  layer = "CHARACTER",
  type = "IMAGE",
): Item {
  return {
    id,
    type,
    layer,
    name,
    text: { plainText: text, richText: [], style: {} },
    metadata: { [CREATURE_KEY]: data },
  } as unknown as Item;
}

describe("encounter model", () => {
  it("includes visible and hidden DWTools Character images and sorts deterministically", () => {
    const hidden = item("2", "goblin", "B", { armor: 1 });
    hidden.visible = false;
    const result = encounterItems([
      item("3", "Goblin", "A", { armor: 1 }),
      hidden,
      item("1", "", "Blank", { armor: 1 }),
      item("prop", "Prop", "Prop", {}, "PROP"),
      item("shape", "Shape", "Shape", {}, "CHARACTER", "SHAPE"),
      { ...item("none", "None", "None"), metadata: {} },
    ]);
    expect(result.map((entry) => entry.id)).toEqual(["1", "3", "2"]);
  });

  it("normalizes malformed and duplicate inactive IDs", () => {
    expect(parseEncounterState(null).inactiveItemIds).toEqual([]);
    expect(
      parseEncounterState({
        schemaVersion: 1,
        inactiveItemIds: ["b", "a", "b", 3, ""],
      }).inactiveItemIds,
    ).toEqual(["a", "b"]);
  });

  it("prunes stale IDs and preserves unrelated scene metadata", async () => {
    let metadata: Metadata = {
      other: { preserved: true },
      [ENCOUNTER_STATE_KEY]: {
        schemaVersion: 1,
        inactiveItemIds: ["stale", "one"],
      },
    };
    const store: EncounterMetadataStore = {
      getMetadata: async () => ({ ...metadata }),
      setMetadata: async (update) => {
        metadata = { ...metadata, ...update };
      },
    };
    const result = await setEncounterItemActive(
      store,
      ["one", "two"],
      "two",
      false,
    );
    expect(result.inactiveItemIds).toEqual(["one", "two"]);
    expect(metadata.other).toEqual({ preserved: true });
  });

  it("retries when another GM changes encounter state during confirmation", async () => {
    let metadata: Metadata = {};
    let writes = 0;
    const store: EncounterMetadataStore = {
      getMetadata: async () => ({ ...metadata }),
      setMetadata: async (update) => {
        writes += 1;
        metadata = { ...metadata, ...update };
        if (writes === 1) {
          metadata[ENCOUNTER_STATE_KEY] = {
            schemaVersion: 1,
            inactiveItemIds: ["other"],
          };
        }
      },
    };
    const result = await setEncounterItemActive(
      store,
      ["one", "other"],
      "one",
      false,
    );
    expect(writes).toBe(2);
    expect(result.inactiveItemIds).toEqual(["one", "other"]);
  });

  it("computes HP text, percentage, and over-maximum state", () => {
    expect(hpPresentation({ hpCurrent: 3, hpMax: 10 })).toMatchObject({
      text: "3/10",
      percent: 30,
      color: "amber",
      adjustable: true,
    });
    expect(hpPresentation({ hpCurrent: 12, hpMax: 10 }).color).toBe("purple");
    expect(hpPresentation({}).text).toBe("—");
  });
});

describe("encounter view", () => {
  const entries = encounterItems([
    item("goblin", "Goblin Scout", "Goblin", {
      armor: 1,
      damage: "d6+1",
      damageDescription: "Spear",
      damageTags: "Close, Reach",
      hpCurrent: 4,
      hpMax: 6,
      instinct: "To multiply & consume",
      moves: "- **Swarm** the target\n- Deal d4 damage",
    }),
    item("orc", "<Orc>", "Orc & Axe", {}),
  ]);

  it("renders active combat controls, escaped details, Markdown, and roll hooks", () => {
    const markup = buildEncounterMarkup(
      entries,
      { schemaVersion: 1, inactiveItemIds: [] },
      false,
    );
    expect(markup).toContain("Goblin Scout");
    expect(markup).toContain("(Goblin)");
    expect(markup).toContain('aria-label="Move to Inactive"');
    expect(markup).toContain('data-encounter-damage="d6+1"');
    expect(markup).toContain("(Spear)");
    expect(markup).toContain("Close, Reach");
    expect(markup).toContain("4/6");
    expect(markup).toContain("To multiply &amp; consume");
    expect(markup).toContain("<strong>Swarm</strong>");
    expect(markup).toContain('data-roll-expression="d4"');
    expect(markup).toContain("&lt;Orc&gt;");
    expect(markup).toContain("Orc &amp; Axe");
    expect(markup).toContain("Inactive (0)");
  });

  it("renders compact inactive rows with restore controls", () => {
    const markup = buildEncounterMarkup(
      entries,
      { schemaVersion: 1, inactiveItemIds: ["goblin"] },
      true,
    );
    expect(markup).toContain("Inactive (1)");
    expect(markup).toContain('aria-label="Add to Encounter"');
    expect(markup).not.toContain("No inactive creatures");
  });
});
