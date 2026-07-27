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

    expect(markup).toContain("Character Records");
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
});
