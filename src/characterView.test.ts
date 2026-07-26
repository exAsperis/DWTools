import { describe, expect, it } from "vitest";
import { activeRecord } from "./characterTestHelpers";
import { buildCharacterManagerMarkup } from "./characterView";

describe("character manager view", () => {
  it("shows record details, current-scene link count, timestamp, and usage", () => {
    const record = activeRecord("raganah");
    const markup = buildCharacterManagerMarkup({
      records: [record],
      tombstones: [],
      showTombstones: false,
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
      search: "",
    });

    expect(markup).toContain("Character Records");
    expect(markup).toContain("Raganah");
    expect(markup).toContain("HP 8/10");
    expect(markup).toContain("2 linked tokens in current scene");
    expect(markup).toContain("Updated");
    expect(markup).toContain("Room metadata: approximately 4.0 KiB");
    expect(markup.indexOf("show-tombstones")).toBeLessThan(
      markup.indexOf("manager-search"),
    );
  });

  it("shows a near-capacity warning", () => {
    const markup = buildCharacterManagerMarkup({
      records: [],
      tombstones: [],
      showTombstones: false,
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
      search: "",
    });

    expect(markup).toContain("approaching Owlbear's limit");
  });

  it("shows dimmed tombstones and permanent deletion warnings on request", () => {
    const record = activeRecord("raganah");
    const tombstone = {
      schemaVersion: 1 as const,
      id: record.id,
      name: record.fields.name,
      revision: 2,
      writeId: "deleted-write",
      deleted: true as const,
      deletedAt: "2026-07-26T16:00:00.000Z",
      deletedBy: "gm-1",
    };
    const markup = buildCharacterManagerMarkup({
      records: [],
      tombstones: [tombstone],
      showTombstones: true,
      counts: new Map(),
      loading: false,
      saving: false,
      search: "",
    });

    expect(markup).toContain('id="show-tombstones"');
    expect(markup).toContain("checked");
    expect(markup).toContain("Raganah");
    expect(markup).toContain("Tombstoned");
    expect(markup).toContain("Delete permanently");
    expect(markup).toContain(
      "This action will orphan linked creature tokens in other scenes.",
    );
  });

  it("keeps tombstones out of the ordinary list", () => {
    const markup = buildCharacterManagerMarkup({
      records: [],
      tombstones: [
        {
          schemaVersion: 1,
          id: "deleted",
          name: "Hidden tombstone",
          revision: 2,
          writeId: "deleted-write",
          deleted: true,
          deletedAt: "2026-07-26T16:00:00.000Z",
          deletedBy: "gm-1",
        },
      ],
      showTombstones: false,
      counts: new Map(),
      loading: false,
      saving: false,
      search: "",
    });

    expect(markup).not.toContain("Hidden tombstone");
    expect(markup).not.toContain("Delete permanently");
  });
});
