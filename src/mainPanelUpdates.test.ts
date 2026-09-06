import { describe, expect, it } from "vitest";
import type { Item } from "@owlbear-rodeo/sdk";
import {
  CHARACTER_LINK_KEY,
  CREATURE_KEY,
  type CreatureData,
} from "./constants";
import {
  scenePanelSignatures,
  updateDisclosureState,
  visibleRefreshLoadingState,
} from "./mainPanelUpdates";

function token(
  overrides: Partial<Item> = {},
  data: CreatureData = { hpCurrent: 8, hpMax: 10 },
): Item {
  return {
    id: "token-1",
    name: "Hero token",
    layer: "CHARACTER",
    type: "IMAGE",
    image: { url: "https://example.com/hero.png", mime: "image/png" },
    text: { plainText: "Hero", richText: [] },
    metadata: {
      [CREATURE_KEY]: data,
      [CHARACTER_LINK_KEY]: { schemaVersion: 1, characterId: "hero" },
    },
    position: { x: 0, y: 0 },
    rotation: 0,
    scale: { x: 1, y: 1 },
    visible: true,
    locked: false,
    lastModified: "one",
    ...overrides,
  } as Item;
}

describe("main-panel scene update signatures", () => {
  it("ignores position-only movement and modification timestamps", () => {
    const before = scenePanelSignatures([token()]);
    const after = scenePanelSignatures([
      token({ position: { x: 400, y: 250 }, lastModified: "two" }),
    ]);

    expect(after).toEqual(before);
  });

  it("detects encounter data changes without refreshing linked summaries", () => {
    const before = scenePanelSignatures([token()]);
    const after = scenePanelSignatures([
      token({}, { hpCurrent: 7, hpMax: 10 }),
    ]);

    expect(after.encounter).not.toBe(before.encounter);
    expect(after.linkedTokens).toBe(before.linkedTokens);
  });

  it("detects linking, identity, thumbnail, and membership changes", () => {
    const before = scenePanelSignatures([token()]);
    const renamed = scenePanelSignatures([token({ name: "Renamed token" })]);
    const removed = scenePanelSignatures([]);

    expect(renamed.linkedTokens).not.toBe(before.linkedTokens);
    expect(removed.encounter).not.toBe(before.encounter);
    expect(removed.linkedTokens).not.toBe(before.linkedTokens);
  });
});

describe("main-panel disclosure state", () => {
  it("ignores delayed toggle events from replaced elements", () => {
    const expanded = new Set(["hero"]);

    updateDisclosureState(expanded, "hero", false, false);

    expect(expanded).toEqual(new Set(["hero"]));
  });

  it("applies toggle events from connected elements", () => {
    const expanded = new Set<string>();

    updateDisclosureState(expanded, "hero", true, true);
    expect(expanded).toEqual(new Set(["hero"]));

    updateDisclosureState(expanded, "hero", false, true);
    expect(expanded).toEqual(new Set());
  });
});

describe("main-panel Character refresh state", () => {
  it("does not expose a silent refresh as a loading state", () => {
    expect(visibleRefreshLoadingState(false, false, true)).toBe(false);
    expect(visibleRefreshLoadingState(true, false, false)).toBe(true);
    expect(visibleRefreshLoadingState(false, true, true)).toBe(true);
    expect(visibleRefreshLoadingState(true, true, false)).toBe(false);
  });
});
