import { describe, expect, it } from "vitest";
import { activeRecord } from "./characterTestHelpers";
import type { CreatureFields } from "./constants";
import {
  buildCharacterDeleteConfirmation,
  buildCharacterManagerMarkup,
  buildCreatureFieldsMarkup,
} from "./characterView";

describe("character manager view", () => {
  it("renders context-specific sections, modifiers, conditions, and calculations", () => {
    const fields: CreatureFields = {
      name: "Raganah",
      hpMax: 22,
      hpBase: 8,
      maxLoad: 13,
      loadBase: 12,
      scores: [16, null, 14, null, null, null],
      conditions: { weak: -1 as const },
    };
    const creatureMarkup = buildCreatureFieldsMarkup(fields);
    const characterMarkup = buildCreatureFieldsMarkup(
      fields,
      "manager-",
      "character",
    );

    expect(creatureMarkup).toMatch(
      /<details class="editor-section expandable-fields" open>/,
    );
    expect(creatureMarkup).toMatch(
      /<details class="editor-section expandable-fields player-fields" >/,
    );
    expect(characterMarkup).toMatch(
      /<details class="editor-section expandable-fields" >/,
    );
    expect(characterMarkup).toMatch(
      /<details class="editor-section expandable-fields player-fields" open>/,
    );
    expect(characterMarkup).toContain('data-score-modifier="0"');
    expect(characterMarkup).toContain('<label class="ability-score">Strength');
    expect(characterMarkup).toContain(
      '<span class="ability-modifier-label">STR</span>',
    );
    expect(characterMarkup).toContain(">+2</span>");
    expect(characterMarkup).toContain("Weak <span>−1 STR</span>");
    expect(characterMarkup).toContain("Calculated: 22");
    expect(characterMarkup).toContain("Calculated: 14");
    expect(characterMarkup).toContain("calculation-mismatch");
    expect(characterMarkup).toMatch(
      /<div class="progression-row">[\s\S]*Level[\s\S]*XP[\s\S]*Alignment[\s\S]*<\/div>/,
    );
    expect(characterMarkup).toMatch(
      /<div class="base-row">[\s\S]*HP base[\s\S]*Load base[\s\S]*Maximum Load[\s\S]*<\/div>/,
    );
  });

  it("shows record details, current-scene link count, timestamp, and usage", () => {
    const record = activeRecord("raganah");
    const markup = buildCharacterManagerMarkup(
      {
        records: [record],
        counts: new Map([[record.id, 2]]),
        linkedTokens: new Map([
          [
            record.id,
            [
              {
                id: "one",
                name: "Raganah one",
                imageUrl: "https://example.com/one.png",
              },
              {
                id: "two",
                name: "Raganah two",
                imageUrl: "https://example.com/two.png",
              },
            ],
          ],
        ]),
        role: "GM",
        usage: {
          bytes: 4_096,
          limitBytes: 16_384,
          safeMaximumBytes: 15_360,
          warningBytes: 13_107,
          nearLimit: false,
          percentOfLimit: 25,
        },
        loading: false,
        saving: false,
      },
      true,
    );

    expect(markup).toContain("Character maintenance");
    expect(markup).toContain("Raganah");
    expect(markup).toContain("HP 8/10");
    expect(markup).toContain("2 linked tokens in current scene");
    expect(markup).toContain('class="linked-token-thumbnails"');
    expect(markup).toContain('src="https://example.com/one.png"');
    expect(markup).toMatch(/linked-token-thumbnails[\s\S]*2 linked tokens/);
    expect(markup).toContain("Updated");
    expect(markup).toMatch(
      /HP 8\/10[\s\S]*linked tokens[\s\S]*<strong>Stats<\/strong>[\s\S]*<strong>Inventory<\/strong>/,
    );
    expect(markup).toContain("Room metadata: approximately 4.0 KiB");
    expect(markup).toContain('id="manager-create"');
    expect(markup).not.toContain("manager-search");
    expect(markup).not.toContain("Room persistence");
    expect(markup).not.toContain("show-tombstones");
    expect(markup).not.toContain("Delete permanently");
  });

  it("renders automatically editable fields inside the expanded Stats subsection", () => {
    const record = activeRecord("raganah");
    const markup = buildCharacterManagerMarkup(
      {
        records: [record],
        counts: new Map([[record.id, 1]]),
        role: "GM",
        loading: false,
        saving: false,
        expandedCharacters: new Set([record.id]),
        expandedStats: new Set([record.id]),
      },
      true,
    );

    expect(markup).toContain('data-character-details="raganah" open');
    expect(markup).toContain('data-stats-details="raganah" open');
    expect(markup).toContain('data-character-stats="raganah"');
    expect(markup).toContain('data-inventory-details="raganah"');
    expect(markup).not.toContain("Edit Character");
    expect(markup).not.toContain("Save record");
    expect(markup).not.toContain(">Cancel</button>");
  });

  it("labels Character maintenance and omits duplicate card-summary Load", () => {
    const markup = buildCharacterManagerMarkup(
      {
        records: [activeRecord("raganah")],
        counts: new Map([["raganah", 1]]),
        role: "GM",
        loading: false,
        saving: false,
      },
      true,
    );
    expect(markup).toContain("Character maintenance");
    expect(markup).toMatch(
      /<summary class="character-card-summary">\s*<strong>Raganah<\/strong>\s*<\/summary>/,
    );
  });

  it("shows a near-capacity warning", () => {
    const markup = buildCharacterManagerMarkup(
      {
        records: [],
        counts: new Map(),
        role: "GM",
        usage: {
          bytes: 14_000,
          limitBytes: 16_384,
          safeMaximumBytes: 15_360,
          warningBytes: 13_107,
          nearLimit: true,
          percentOfLimit: 85.4,
        },
        loading: false,
        saving: false,
      },
      true,
    );

    expect(markup).toContain("approaching Owlbear's limit");
  });

  it("is collapsed by default", () => {
    const markup = buildCharacterManagerMarkup({
      records: [activeRecord("raganah")],
      counts: new Map(),
      role: "GM",
      loading: false,
      saving: false,
    });

    expect(markup).toContain('aria-expanded="false"');
    expect(markup).toContain('draggable="true" data-drag-section="characters"');
    expect(markup).not.toContain("(expand)");
    expect(markup).not.toContain("Raganah");
    expect(markup).not.toContain('id="manager-create"');
  });

  it("warns that deletion orphans linked copies in other scenes", () => {
    const confirmation = buildCharacterDeleteConfirmation("Raganah");

    expect(confirmation).toContain('record "Raganah"');
    expect(confirmation).toContain(
      "Linked copies in other scenes will become orphaned",
    );
    expect(confirmation).toContain("need to be manually resolved");
  });

  it("renders compact two-line inventory rows and controls", () => {
    const record = activeRecord("raganah", {
      fields: { ...activeRecord("raganah").fields, maxLoad: 11 },
      inventory: [
        ["Coin", 0.01, 137],
        ["Bag of Books", 0.4, 5],
      ],
    });
    const markup = buildCharacterManagerMarkup(
      {
        records: [record],
        counts: new Map(),
        role: "GM",
        loading: false,
        saving: false,
        expandedCharacters: new Set([record.id]),
        expandedInventories: new Set([record.id]),
      },
      true,
    );

    expect(markup).toContain("Bag of Books");
    expect(markup).toContain("wt/ea:");
    expect(markup).toContain("ct:");
    expect(markup).toContain("load:");
    expect(markup).not.toContain("inventory-header");
    expect(markup).toContain('data-inventory-adjust="0"');
    expect(markup).toContain(">−</button>");
    expect(markup).toContain(">+</button>");
    expect(markup).toContain('value="137"');
    expect(markup).toContain("inventory-inline-input inventory-name");
    expect(markup).toContain("inventory-inline-input inventory-weight");
    expect(markup).toContain("Load: 3.37 / 11.00");
    expect(markup).not.toContain("data-max-load");
    expect(markup).toContain("Add Item");
    expect(markup).toContain("Transfer");
  });

  it("always shows collapsed Inventory and highlights overload", () => {
    const record = activeRecord("raganah", {
      fields: { ...activeRecord("raganah").fields, maxLoad: 3 },
      inventory: [["Sword", 2, 2]],
    });
    const markup = buildCharacterManagerMarkup(
      {
        records: [record],
        counts: new Map(),
        role: "PLAYER",
        loading: false,
        saving: false,
        expandedCharacters: new Set([record.id]),
      },
      true,
    );

    expect(markup).toContain('class="inventory-section overloaded"');
    expect(markup).toContain("Load: 4.00 / 3.00");
    expect(markup).not.toContain('data-inventory-details="raganah" open');
    expect(markup).not.toContain("Transfer");
    expect(markup).not.toContain('id="manager-create"');
    expect(markup).not.toContain("data-delete-character");
  });

  it("gives players a controlled-token empty state", () => {
    const markup = buildCharacterManagerMarkup(
      {
        records: [],
        counts: new Map(),
        role: "PLAYER",
        loading: false,
        saving: false,
      },
      true,
    );

    expect(markup).toContain("do not currently control");
  });
});
