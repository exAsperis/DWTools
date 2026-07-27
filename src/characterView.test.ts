import { describe, expect, it } from "vitest";
import { activeRecord } from "./characterTestHelpers";
import {
  buildCharacterDeleteConfirmation,
  buildCharacterManagerMarkup,
} from "./characterView";

describe("character manager view", () => {
  it("shows record details, current-scene link count, timestamp, and usage", () => {
    const record = activeRecord("raganah");
    const markup = buildCharacterManagerMarkup(
      {
        records: [record],
        counts: new Map([[record.id, 2]]),
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

    expect(markup).toContain("Characters");
    expect(markup).toContain("Raganah");
    expect(markup).toContain("HP 8/10");
    expect(markup).toContain("2 linked tokens in current scene");
    expect(markup).toContain("Updated");
    expect(markup).toContain("Room metadata: approximately 4.0 KiB");
    expect(markup).toContain('id="manager-create"');
    expect(markup).not.toContain("manager-search");
    expect(markup).not.toContain("Room persistence");
    expect(markup).not.toContain("show-tombstones");
    expect(markup).not.toContain("Delete permanently");
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
      inventory: [
        ["Coin", 0.01, 137],
        ["Bag of Books", 0.4, 5],
      ],
      maxLoad: 11,
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
    expect(markup).toContain("Add Item");
    expect(markup).toContain("Transfer");
  });

  it("always shows collapsed Inventory and highlights overload", () => {
    const record = activeRecord("raganah", {
      inventory: [["Sword", 2, 2]],
      maxLoad: 3,
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
