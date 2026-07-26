import type { Image } from "@owlbear-rodeo/sdk";
import { describe, expect, it } from "vitest";
import { CREATURE_KEY, type CreatureData } from "./constants";
import {
  getImageGeometry,
  getOverlayLayout,
  overlayItemId,
  overlaySourceSignature,
  shouldRenderOverlay,
} from "./overlayModel";

function creatureImage(overrides: Partial<Image> = {}, data: CreatureData = {}): Image {
  return {
    id: "creature-1",
    type: "IMAGE",
    name: "Goblin",
    layer: "CHARACTER",
    position: { x: 10, y: 20 },
    rotation: 0,
    scale: { x: 1, y: 1 },
    visible: true,
    locked: false,
    zIndex: 0,
    metadata: { [CREATURE_KEY]: data },
    image: {
      url: "https://example.invalid/goblin.png",
      mime: "image/png",
      width: 200,
      height: 100,
    },
    grid: {
      dpi: 100,
      offset: { x: 0, y: 0 },
    },
    ...overrides,
  } as Image;
}

describe("getImageGeometry", () => {
  it("derives portrait bounds from image pixels, grid offset, and scene DPI", () => {
    const geometry = getImageGeometry(creatureImage(), 100);

    expect(geometry).toEqual({
      center: { x: 110, y: 70 },
      width: 200,
      height: 100,
      left: 10,
      top: 20,
      right: 210,
      bottom: 120,
    });
  });

  it("honors the image grid offset and token scale", () => {
    const geometry = getImageGeometry(creatureImage({
      grid: { dpi: 100, offset: { x: 100, y: 50 } },
      scale: { x: 1.5, y: 2 },
      position: { x: 300, y: 400 },
    }), 100);

    expect(geometry.center).toEqual({ x: 300, y: 400 });
    expect(geometry.width).toBe(300);
    expect(geometry.height).toBe(200);
    expect(geometry.left).toBe(150);
    expect(geometry.top).toBe(300);
  });

  it("rotates the image center offset around the token position", () => {
    const geometry = getImageGeometry(creatureImage({ rotation: 90 }), 100);

    expect(geometry.center.x).toBeCloseTo(-40);
    expect(geometry.center.y).toBeCloseTo(120);
  });

  it("uses absolute rendered size for negative scale at a different scene DPI", () => {
    const geometry = getImageGeometry(creatureImage({
      scale: { x: -2, y: 0.5 },
    }), 50);

    expect(geometry.center).toEqual({ x: -90, y: 32.5 });
    expect(geometry.width).toBe(200);
    expect(geometry.height).toBe(25);
  });
});

describe("getOverlayLayout", () => {
  it("preserves the HP geometry while compacting the stat-row gap", () => {
    const layout = getOverlayLayout(getImageGeometry(creatureImage(), 100));

    expect(layout.hpLeft).toBe(26);
    expect(layout.hpWidth).toBe(168);
    expect(layout.hpTop).toBeCloseTo(85.896);
    expect(layout.hpHeight).toBeCloseTo(22.344);
    expect(layout.hpText).toEqual({
      left: layout.hpLeft,
      top: layout.hpTop,
      width: layout.hpWidth,
      height: layout.hpHeight,
    });
    expect(layout.rowHeight).toBeCloseTo(24.738);
    expect(layout.rowGap).toBeCloseTo(layout.width * 0.008);
    expect(layout.hpTop - (layout.rowTop + layout.rowHeight))
      .toBeCloseTo(layout.width * 0.008);
    expect(layout.rowHeight + layout.rowGap + layout.hpHeight)
      .toBeLessThan(layout.rowHeight + layout.width * 0.025 + layout.hpHeight);
  });

  it("uses one shared font size at 140% of the original HP type scale", () => {
    const layout = getOverlayLayout(getImageGeometry(creatureImage(), 100));
    const originalHpFontSize = layout.width * 0.095;

    expect(layout.fontSize).toBeCloseTo(originalHpFontSize * 1.4);
    expect(layout.fontSize / originalHpFontSize).toBeCloseTo(1.4);
    expect(layout.fontSize).toBeCloseTo(layout.hpHeight);
  });
});

describe("overlay visibility", () => {
  const hiddenData: CreatureData = {
    hpCurrent: 8,
    hpMax: 12,
    visibleToPlayers: false,
  };
  const sharedData: CreatureData = {
    hpCurrent: 8,
    hpMax: 12,
    visibleToPlayers: true,
  };

  it("keeps a player-hidden overlay fully present for the GM", () => {
    expect(shouldRenderOverlay(creatureImage({}, hiddenData), hiddenData, "GM")).toBe(true);
  });

  it("keeps the overlay present for the GM when the token is hidden", () => {
    const hiddenToken = creatureImage({ visible: false }, sharedData);

    expect(shouldRenderOverlay(hiddenToken, sharedData, "GM")).toBe(true);
  });

  it("omits a player-hidden overlay for players", () => {
    expect(shouldRenderOverlay(creatureImage({}, hiddenData), hiddenData, "PLAYER")).toBe(false);
  });

  it("omits a player-shared overlay when the token itself is hidden", () => {
    const hiddenToken = creatureImage({ visible: false }, sharedData);

    expect(shouldRenderOverlay(hiddenToken, sharedData, "PLAYER")).toBe(false);
  });

  it("shows a player-shared overlay when the token is visible", () => {
    expect(shouldRenderOverlay(creatureImage({}, sharedData), sharedData, "PLAYER")).toBe(true);
  });
});

describe("overlay identity and source signatures", () => {
  it("uses deterministic component IDs", () => {
    expect(overlayItemId("token-42", "hp-text")).toBe("token-42-dwtools-hp-text");
  });

  it("ignores position-only movement but reacts to rendering inputs", () => {
    const data: CreatureData = { hpCurrent: 8, hpMax: 12 };
    const original = creatureImage({}, data);
    const moved = creatureImage({ position: { x: 500, y: 600 } }, data);
    const scaled = creatureImage({ scale: { x: 1.5, y: 1.5 } }, data);
    const damagedData: CreatureData = { hpCurrent: 7, hpMax: 12 };

    expect(overlaySourceSignature(moved, data, "GM", 100))
      .toBe(overlaySourceSignature(original, data, "GM", 100));
    expect(overlaySourceSignature(scaled, data, "GM", 100))
      .not.toBe(overlaySourceSignature(original, data, "GM", 100));
    expect(overlaySourceSignature(original, damagedData, "GM", 100))
      .not.toBe(overlaySourceSignature(original, data, "GM", 100));
  });

  it("ignores token visibility for GM rendering but reacts for player rendering", () => {
    const data: CreatureData = {
      hpCurrent: 8,
      hpMax: 12,
      visibleToPlayers: true,
    };
    const visible = creatureImage({ visible: true }, data);
    const hidden = creatureImage({ visible: false }, data);

    expect(overlaySourceSignature(hidden, data, "GM", 100))
      .toBe(overlaySourceSignature(visible, data, "GM", 100));
    expect(overlaySourceSignature(hidden, data, "PLAYER", 100))
      .not.toBe(overlaySourceSignature(visible, data, "PLAYER", 100));
  });
});
