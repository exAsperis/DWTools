import type { Image } from "@owlbear-rodeo/sdk";
import { describe, expect, it } from "vitest";
import { CREATURE_KEY, type CreatureData } from "./constants";
import {
  getImageGeometry,
  getOverlayLayout,
  encumbranceText,
  hpColor,
  hpPercent,
  isHpOverMaximum,
  overlayItemId,
  overlaySourceSignature,
  shouldRenderOverlay,
} from "./overlayModel";

function creatureImage(
  overrides: Partial<Image> = {},
  data: CreatureData = {},
): Image {
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
    const geometry = getImageGeometry(
      creatureImage({
        grid: { dpi: 100, offset: { x: 100, y: 50 } },
        scale: { x: 1.5, y: 2 },
        position: { x: 300, y: 400 },
      }),
      100,
    );

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
    const geometry = getImageGeometry(
      creatureImage({
        scale: { x: -2, y: 0.5 },
      }),
      50,
    );

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
    expect(layout.hpTop - (layout.rowTop + layout.rowHeight)).toBeCloseTo(
      layout.width * 0.008,
    );
    expect(layout.rowHeight + layout.rowGap + layout.hpHeight).toBeLessThan(
      layout.rowHeight + layout.width * 0.025 + layout.hpHeight,
    );
  });

  it("uses one shared font size at 140% of the original HP type scale", () => {
    const layout = getOverlayLayout(getImageGeometry(creatureImage(), 100));
    const originalHpFontSize = layout.width * 0.095;

    expect(layout.fontSize).toBeCloseTo(originalHpFontSize * 1.4);
    expect(layout.fontSize / originalHpFontSize).toBeCloseTo(1.4);
    expect(layout.fontSize).toBeCloseTo(layout.hpHeight);
  });

  it("moves armor left and expands damage without changing the outer footprint", () => {
    const layout = getOverlayLayout(getImageGeometry(creatureImage(), 100));
    const previousDamageTextWidth = layout.width * 0.56 * 0.82;
    const damageTextWidth = layout.damage.width - layout.width * 0.1;

    expect(layout.armor.left).toBe(layout.hpLeft);
    expect(layout.armor.width).toBeCloseTo(layout.width * 0.22);
    expect(layout.damage.left).toBeCloseTo(
      layout.hpLeft + layout.width * 0.22 + layout.width * 0.02,
    );
    expect(layout.damage.width).toBeCloseTo(layout.width * 0.76);
    expect(damageTextWidth / previousDamageTextWidth).toBeCloseTo(1.437, 2);
    expect(layout.damage.left + layout.damage.width).toBeCloseTo(
      layout.hpLeft + layout.hpWidth,
    );
  });

  it("places the hidden marker inside a square at the unchanged HP origin", () => {
    const layout = getOverlayLayout(getImageGeometry(creatureImage(), 100));

    expect(layout.visibilityIndicator).toEqual({
      left: layout.hpLeft,
      top: layout.hpTop,
      width: layout.hpHeight,
      height: layout.hpHeight,
    });
  });

  it("matches the top encumbrance bar to the HP bar at the portrait top", () => {
    const geometry = getImageGeometry(creatureImage(), 100);
    const layout = getOverlayLayout(geometry);

    expect(layout.encumbrance).toEqual({
      left: layout.hpLeft,
      top: geometry.top,
      width: layout.hpWidth,
      height: layout.hpHeight,
    });
  });
});

describe("encumbrance status", () => {
  it("is absent at or below Maximum Load", () => {
    expect(encumbranceText({ currentLoad: 10, maxLoad: 10 })).toBeUndefined();
    expect(encumbranceText({ currentLoad: 9, maxLoad: 10 })).toBeUndefined();
    expect(
      encumbranceText({ currentLoad: 12, maxLoad: undefined }),
    ).toBeUndefined();
  });

  it("shows -1 through two Load over maximum and X beyond that", () => {
    expect(encumbranceText({ currentLoad: 11, maxLoad: 10 })).toBe(
      "Encumbered (-1)",
    );
    expect(encumbranceText({ currentLoad: 12, maxLoad: 10 })).toBe(
      "Encumbered (-1)",
    );
    expect(encumbranceText({ currentLoad: 12.01, maxLoad: 10 })).toBe(
      "Encumbered (X)",
    );
  });
});

describe("HP status", () => {
  it("uses a full purple bar whenever current HP exceeds maximum HP", () => {
    const overMaximum = { hpCurrent: 9, hpMax: 8 };

    expect(isHpOverMaximum(overMaximum)).toBe(true);
    expect(hpPercent(overMaximum)).toBe(1);
    expect(hpColor(hpPercent(overMaximum), isHpOverMaximum(overMaximum))).toBe(
      "#7e22ce",
    );
  });

  it("also renders over-zero HP as full and purple when maximum HP is zero", () => {
    const overZero = { hpCurrent: 1, hpMax: 0 };

    expect(hpPercent(overZero)).toBe(1);
    expect(hpColor(hpPercent(overZero), isHpOverMaximum(overZero))).toBe(
      "#7e22ce",
    );
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
    expect(
      shouldRenderOverlay(creatureImage({}, hiddenData), hiddenData, "GM"),
    ).toBe(true);
  });

  it("keeps the overlay present for the GM when the token is hidden", () => {
    const hiddenToken = creatureImage({ visible: false }, sharedData);

    expect(shouldRenderOverlay(hiddenToken, sharedData, "GM")).toBe(true);
  });

  it("omits a player-hidden overlay for players", () => {
    expect(
      shouldRenderOverlay(creatureImage({}, hiddenData), hiddenData, "PLAYER"),
    ).toBe(false);
  });

  it("omits a player-shared overlay when the token itself is hidden", () => {
    const hiddenToken = creatureImage({ visible: false }, sharedData);

    expect(shouldRenderOverlay(hiddenToken, sharedData, "PLAYER")).toBe(false);
  });

  it("shows a player-shared overlay when the token is visible", () => {
    expect(
      shouldRenderOverlay(creatureImage({}, sharedData), sharedData, "PLAYER"),
    ).toBe(true);
  });

  it("renders an encumbrance-only overlay using the same role visibility", () => {
    const load = { currentLoad: 11, maxLoad: 10 };

    expect(shouldRenderOverlay(creatureImage(), {}, "GM", load)).toBe(true);
    expect(
      shouldRenderOverlay(
        creatureImage({}, { visibleToPlayers: false }),
        { visibleToPlayers: false },
        "PLAYER",
        load,
      ),
    ).toBe(false);
  });
});

describe("overlay identity and source signatures", () => {
  it("uses deterministic component IDs", () => {
    expect(overlayItemId("token-42", "hp-text")).toBe(
      "token-42-dwtools-hp-text",
    );
  });

  it("ignores position-only movement but reacts to rendering inputs", () => {
    const data: CreatureData = { hpCurrent: 8, hpMax: 12 };
    const original = creatureImage({}, data);
    const moved = creatureImage({ position: { x: 500, y: 600 } }, data);
    const scaled = creatureImage({ scale: { x: 1.5, y: 1.5 } }, data);
    const damagedData: CreatureData = { hpCurrent: 7, hpMax: 12 };

    expect(overlaySourceSignature(moved, data, "GM", 100)).toBe(
      overlaySourceSignature(original, data, "GM", 100),
    );
    expect(overlaySourceSignature(scaled, data, "GM", 100)).not.toBe(
      overlaySourceSignature(original, data, "GM", 100),
    );
    expect(overlaySourceSignature(original, damagedData, "GM", 100)).not.toBe(
      overlaySourceSignature(original, data, "GM", 100),
    );
  });

  it("ignores player-character-only metadata", () => {
    const data: CreatureData = { hpCurrent: 8, hpMax: 12 };
    const playerData: CreatureData = {
      ...data,
      level: 3,
      xp: 6,
      hpBase: 8,
      loadBase: 12,
      maxLoad: 14,
      scores: [16, 12, 14, 9, 13, 8],
      conditions: { weak: -1 },
      alignment: "Good",
    };
    const image = creatureImage({}, data);

    expect(overlaySourceSignature(image, playerData, "GM", 100)).toBe(
      overlaySourceSignature(image, data, "GM", 100),
    );
  });

  it("reacts only when derived Load changes the displayed warning", () => {
    const data: CreatureData = { hpCurrent: 8, hpMax: 12 };
    const image = creatureImage({}, data);

    expect(
      overlaySourceSignature(image, data, "GM", 100, {
        currentLoad: 10,
        maxLoad: 10,
      }),
    ).toBe(overlaySourceSignature(image, data, "GM", 100));
    expect(
      overlaySourceSignature(image, data, "GM", 100, {
        currentLoad: 11,
        maxLoad: 10,
      }),
    ).not.toBe(overlaySourceSignature(image, data, "GM", 100));
  });

  it("ignores token visibility for GM rendering but reacts for player rendering", () => {
    const data: CreatureData = {
      hpCurrent: 8,
      hpMax: 12,
      visibleToPlayers: true,
    };
    const visible = creatureImage({ visible: true }, data);
    const hidden = creatureImage({ visible: false }, data);

    expect(overlaySourceSignature(hidden, data, "GM", 100)).toBe(
      overlaySourceSignature(visible, data, "GM", 100),
    );
    expect(overlaySourceSignature(hidden, data, "PLAYER", 100)).not.toBe(
      overlaySourceSignature(visible, data, "PLAYER", 100),
    );
  });
});
