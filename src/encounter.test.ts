import type { Item, Metadata } from "@owlbear-rodeo/sdk";
import { describe, expect, it } from "vitest";
import { CREATURE_KEY, ENCOUNTER_STATE_KEY } from "./constants";
import {
  buildEncounterMarkup,
  currentEncounterState,
  encounterItems,
  hpPresentation,
  parseEncounterState,
  partitionEncounterItems,
  setEncounterActiveOrder,
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
    image: {
      url: `https://images.example/${id}.png`,
      width: 100,
      height: 100,
      mime: "image/png",
    },
    lastModified: `2026-07-${id === "new" ? "31" : "01"}T00:00:00.000Z`,
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
    expect(
      parseEncounterState({
        schemaVersion: 2,
        inactiveItemIds: ["b"],
        activeItemIds: ["a", "a", "b", "c"],
      }),
    ).toEqual({
      schemaVersion: 2,
      inactiveItemIds: ["b"],
      activeItemIds: ["a", "c"],
    });
  });

  it("migrates schema 1 in alphabetical order and prepends newly eligible items", () => {
    const existing = encounterItems([
      item("b", "Bugbear", "B", {}),
      item("a", "Ankheg", "A", {}),
    ]);
    expect(
      currentEncounterState(existing, { schemaVersion: 1, inactiveItemIds: [] })
        .activeItemIds,
    ).toEqual(["a", "b"]);
    const withNew = encounterItems([
      ...existing.map((entry) =>
        item(entry.id, entry.itemText, entry.itemName),
      ),
      item("new", "New", "N"),
    ]);
    expect(
      partitionEncounterItems(withNew, {
        schemaVersion: 2,
        inactiveItemIds: [],
        activeItemIds: ["a", "b"],
      }).active.map((entry) => entry.id),
    ).toEqual(["new", "a", "b"]);
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
      encounterItems([item("one", "One", "One"), item("two", "Two", "Two")]),
      "two",
      false,
    );
    expect(result.inactiveItemIds).toEqual(["one", "two"]);
    expect(result.activeItemIds).toEqual([]);
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
            schemaVersion: 2,
            inactiveItemIds: ["other"],
            activeItemIds: ["one"],
          };
        }
      },
    };
    const result = await setEncounterItemActive(
      store,
      encounterItems([
        item("one", "One", "One"),
        item("other", "Other", "Other"),
      ]),
      "one",
      false,
    );
    expect(writes).toBe(2);
    expect(result.inactiveItemIds).toEqual(["one", "other"]);
  });

  it("saves active order and puts restored creatures at the top", async () => {
    let metadata: Metadata = {
      [ENCOUNTER_STATE_KEY]: {
        schemaVersion: 2,
        inactiveItemIds: ["b"],
        activeItemIds: ["a", "c"],
      },
    };
    const store: EncounterMetadataStore = {
      getMetadata: async () => ({ ...metadata }),
      setMetadata: async (update) => {
        metadata = { ...metadata, ...update };
      },
    };
    const items = encounterItems([
      item("a", "A", "A"),
      item("b", "B", "B"),
      item("c", "C", "C"),
    ]);
    expect(
      (await setEncounterActiveOrder(store, items, ["c", "a"])).activeItemIds,
    ).toEqual(["c", "a"]);
    expect(
      (await setEncounterItemActive(store, items, "b", true)).activeItemIds,
    ).toEqual(["b", "c", "a"]);
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
      {
        schemaVersion: 2,
        inactiveItemIds: [],
        activeItemIds: ["goblin", "orc"],
      },
      false,
    );
    expect(markup).toContain("Goblin Scout");
    expect(markup).toContain("(Goblin)");
    expect(markup).toContain('aria-label="Move to Inactive"');
    expect(markup).toContain('aria-label="Locate on scene"');
    expect(markup).toContain('class="encounter-thumbnail"');
    expect(markup).toContain('data-encounter-drag="goblin"');
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
      { schemaVersion: 2, inactiveItemIds: ["goblin"], activeItemIds: ["orc"] },
      true,
    );
    expect(markup).toContain("Inactive (1)");
    expect(markup).toContain('aria-label="Add to Encounter"');
    expect(markup).not.toContain("No inactive creatures");
  });
});
