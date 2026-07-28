import {
  Command,
  isCurve,
  isPath,
  isText,
  type Image,
  type Item,
} from "@owlbear-rodeo/sdk";
import { describe, expect, it } from "vitest";
import {
  CREATURE_KEY,
  DISPLAY_KEY,
  LEGACY_DISPLAY_KEY,
  type CreatureData,
} from "./constants";
import {
  DISPLAY_RENDER_KEY,
  buildDesiredDisplays,
  isDisplay,
  planDisplayReconciliation,
} from "./display";
import { iconCommands } from "./icons";
import { getImageGeometry, getOverlayLayout } from "./overlayModel";

function creatureImage(
  position: { x: number; y: number },
  data: CreatureData,
): Image {
  return {
    id: "creature-1",
    type: "IMAGE",
    name: "Goblin",
    layer: "CHARACTER",
    position,
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
      height: 200,
    },
    grid: {
      dpi: 100,
      offset: { x: 100, y: 100 },
    },
  } as unknown as Image;
}

describe("buildDesiredDisplays", () => {
  it("recognizes legacy displays and reconciles their metadata in place", () => {
    const desired = buildDesiredDisplays(
      [creatureImage({ x: 300, y: 400 }, { hpCurrent: 4, hpMax: 6 })],
      "GM",
      100,
    );
    const legacy = desired.map(
      (display) =>
        ({
          ...display,
          metadata: {
            [LEGACY_DISPLAY_KEY]: true,
            [`${LEGACY_DISPLAY_KEY}/render`]:
              display.metadata[DISPLAY_RENDER_KEY],
          },
        }) as Item,
    );

    expect(legacy.every(isDisplay)).toBe(true);
    const plan = planDisplayReconciliation(legacy, desired);
    expect(plan.add).toEqual([]);
    expect(plan.deleteIds).toEqual([]);
    expect(plan.update).toHaveLength(legacy.length);
  });

  it("builds opaque text in front of attachment-layer HP shapes", () => {
    const desired = buildDesiredDisplays(
      [
        creatureImage(
          { x: 300, y: 400 },
          {
            hpCurrent: 8,
            hpMax: 12,
            armor: 1,
            damage: "d6",
            visibleToPlayers: false,
          },
        ),
      ],
      "GM",
      100,
    );

    expect(desired).toHaveLength(10);
    expect(new Set(desired.map((item) => item.id)).size).toBe(desired.length);
    expect(desired.every((item) => item.metadata[DISPLAY_KEY] === true)).toBe(
      true,
    );

    const hpText = desired.find((item) => item.id.endsWith("-hp-text"));
    const hpBackground = desired.find((item) => item.id.endsWith("-hp-bg"));
    const hpFill = desired.find((item) => item.id.endsWith("-hp-fill-bg"));
    const visibilityIcon = desired.find((item) =>
      item.id.endsWith("-visibility-icon"),
    );
    const visibilityBackground = desired.find((item) =>
      item.id.endsWith("-visibility-bg"),
    );
    const armorIcon = desired.find((item) => item.id.endsWith("-armor-icon"));
    const armorText = desired.find((item) => item.id.endsWith("-armor-text"));
    const damageBackground = desired.find((item) =>
      item.id.endsWith("-damage-bg"),
    );
    const damageIcon = desired.find((item) => item.id.endsWith("-damage-icon"));
    const damageText = desired.find((item) => item.id.endsWith("-damage-text"));

    expect(hpText?.type).toBe("TEXT");
    expect(hpText?.layer).toBe("TEXT");
    expect(hpText?.visible).toBe(true);
    expect(hpBackground?.type).toBe("CURVE");
    expect(hpBackground?.layer).toBe("ATTACHMENT");
    expect(hpFill?.layer).toBe("ATTACHMENT");
    expect(visibilityIcon?.type).toBe("PATH");
    expect(visibilityIcon?.layer).toBe("TEXT");
    expect(visibilityBackground).toBeUndefined();
    expect(armorIcon?.type).toBe("PATH");
    expect(armorIcon?.layer).toBe("TEXT");
    expect(damageBackground?.layer).toBe("ATTACHMENT");
    expect(damageIcon?.type).toBe("PATH");
    expect(damageIcon?.layer).toBe("TEXT");
    expect(damageText?.type).toBe("TEXT");
    expect(damageText?.layer).toBe("TEXT");
    expect(visibilityIcon && isPath(visibilityIcon)).toBe(true);
    expect(armorIcon && isPath(armorIcon)).toBe(true);
    expect(damageIcon && isPath(damageIcon)).toBe(true);
    expect(armorText && isText(armorText)).toBe(true);
    expect(damageText && isText(damageText)).toBe(true);
    if (armorText && isText(armorText))
      expect(armorText.text.plainText).toBe("1");
    if (damageText && isText(damageText))
      expect(damageText.text.plainText).toBe("d6");
    if (visibilityIcon && isPath(visibilityIcon)) {
      const layout = getOverlayLayout(
        getImageGeometry(creatureImage({ x: 300, y: 400 }, {}), 100),
      );
      const markerWidth = 24 * visibilityIcon.scale.x;
      const markerHeight = 24 * visibilityIcon.scale.y;

      expect(visibilityIcon.style.strokeColor).toBe("#ffffff");
      expect(visibilityIcon.position.x).toBeGreaterThanOrEqual(layout.hpLeft);
      expect(visibilityIcon.position.y).toBeGreaterThanOrEqual(layout.hpTop);
      expect(visibilityIcon.position.x + markerWidth).toBeLessThanOrEqual(
        layout.hpLeft + layout.hpHeight,
      );
      expect(visibilityIcon.position.y + markerHeight).toBeLessThanOrEqual(
        layout.hpTop + layout.hpHeight,
      );
    }
    if (
      hpText &&
      isText(hpText) &&
      armorText &&
      isText(armorText) &&
      damageText &&
      isText(damageText)
    ) {
      expect(armorText.text.style.fontSize).toBe(hpText.text.style.fontSize);
      expect(damageText.text.style.fontSize).toBe(hpText.text.style.fontSize);
    }
    if (damageIcon && isPath(damageIcon)) {
      const expectedCommands = iconCommands("sword").map(
        ([kind, ...coordinates]) => [
          kind === "M"
            ? Command.MOVE
            : kind === "L"
              ? Command.LINE
              : kind === "C"
                ? Command.CUBIC
                : Command.CLOSE,
          ...coordinates,
        ],
      );
      expect(damageIcon.commands).toEqual(expectedCommands);
    }
  });

  it.each([
    ["green", { hpCurrent: 8, hpMax: 10 }],
    ["amber", { hpCurrent: 4, hpMax: 10 }],
    ["red", { hpCurrent: 2, hpMax: 10 }],
    ["purple", { hpCurrent: 11, hpMax: 10 }],
    ["empty", { hpCurrent: 0, hpMax: 10 }],
  ] as const)(
    "keeps the hidden marker white over a %s HP bar",
    (_state, hp) => {
      const desired = buildDesiredDisplays(
        [
          creatureImage(
            { x: 300, y: 400 },
            {
              ...hp,
              visibleToPlayers: false,
            },
          ),
        ],
        "GM",
        100,
      );
      const marker = desired.find((item) =>
        item.id.endsWith("-visibility-icon"),
      );

      expect(marker && isPath(marker)).toBe(true);
      if (marker && isPath(marker)) {
        expect(marker.style.strokeColor).toBe("#ffffff");
        expect(marker.layer).toBe("TEXT");
      }
    },
  );

  it("renders no visibility component when shared with players", () => {
    const desired = buildDesiredDisplays(
      [
        creatureImage(
          { x: 300, y: 400 },
          {
            hpCurrent: 8,
            hpMax: 10,
            visibleToPlayers: true,
          },
        ),
      ],
      "GM",
      100,
    );

    expect(desired.some((item) => item.id.includes("-visibility-"))).toBe(
      false,
    );
  });

  it.each(["w[2d10]+2", "b[2d10]+10", "2d100+25"])(
    "keeps long damage formula %s on one expanded text item",
    (formula) => {
      const token = creatureImage(
        { x: 300, y: 400 },
        {
          hpCurrent: 8,
          hpMax: 10,
          damage: formula,
        },
      );
      const desired = buildDesiredDisplays([token], "GM", 100);
      const damageText = desired.find((item) =>
        item.id.endsWith("-damage-text"),
      );
      const layout = getOverlayLayout(getImageGeometry(token, 100));
      const previousDamageTextWidth = layout.width * 0.56 * 0.82;

      expect(damageText && isText(damageText)).toBe(true);
      if (damageText && isText(damageText)) {
        expect(damageText.text.plainText).toBe(formula);
        expect(damageText.text.width).toBeCloseTo(layout.width * 0.66);
        expect(
          Number(damageText.text.width) / previousDamageTextWidth,
        ).toBeCloseTo(1.437, 2);
      }
    },
  );

  it("keeps hidden-token displays local and visible for the GM", () => {
    const desired = buildDesiredDisplays(
      [
        creatureImage(
          { x: 300, y: 400 },
          {
            hpCurrent: 8,
            hpMax: 12,
            armor: 1,
            damage: "d6",
            visibleToPlayers: true,
          },
        ),
      ],
      "GM",
      100,
    );
    const hiddenToken = creatureImage(
      { x: 300, y: 400 },
      {
        hpCurrent: 8,
        hpMax: 12,
        armor: 1,
        damage: "d6",
        visibleToPlayers: true,
      },
    );
    hiddenToken.visible = false;
    const hiddenDesired = buildDesiredDisplays([hiddenToken], "GM", 100);

    expect(hiddenDesired).toHaveLength(desired.length);
    expect(hiddenDesired.every((item) => item.visible)).toBe(true);
    expect(
      hiddenDesired.every((item) =>
        item.disableAttachmentBehavior?.includes("VISIBLE"),
      ),
    ).toBe(true);
  });

  it("renders an over-maximum HP fill in purple", () => {
    const desired = buildDesiredDisplays(
      [
        creatureImage(
          { x: 300, y: 400 },
          {
            hpCurrent: 9,
            hpMax: 8,
          },
        ),
      ],
      "GM",
      100,
    );
    const hpFill = desired.find((item) => item.id.endsWith("-hp-fill-bg"));

    expect(hpFill && isCurve(hpFill)).toBe(true);
    if (hpFill && isCurve(hpFill)) {
      expect(hpFill.style.fillColor).toBe("#7e22ce");
    }
  });

  it("removes player displays when a shared token becomes hidden", () => {
    const hiddenToken = creatureImage(
      { x: 300, y: 400 },
      {
        hpCurrent: 8,
        hpMax: 12,
        visibleToPlayers: true,
      },
    );
    hiddenToken.visible = false;

    expect(buildDesiredDisplays([hiddenToken], "PLAYER", 100)).toEqual([]);
  });

  it("lets visible player displays inherit token visibility", () => {
    const desired = buildDesiredDisplays(
      [
        creatureImage(
          { x: 300, y: 400 },
          {
            hpCurrent: 8,
            hpMax: 12,
            visibleToPlayers: true,
          },
        ),
      ],
      "PLAYER",
      100,
    );

    expect(desired.length).toBeGreaterThan(0);
    expect(
      desired.every(
        (item) => !item.disableAttachmentBehavior?.includes("VISIBLE"),
      ),
    ).toBe(true);
  });
});

describe("planDisplayReconciliation", () => {
  const data: CreatureData = {
    hpCurrent: 8,
    hpMax: 12,
    armor: 1,
    damage: "d6",
  };

  it("performs zero writes for a position-only token change", () => {
    const current = buildDesiredDisplays(
      [creatureImage({ x: 300, y: 400 }, data)],
      "GM",
      100,
    );
    const moved = buildDesiredDisplays(
      [creatureImage({ x: 900, y: 1000 }, data)],
      "GM",
      100,
    );

    expect(planDisplayReconciliation(current, moved)).toEqual({
      add: [],
      update: [],
      deleteIds: [],
    });
  });

  it("updates components in place when HP changes", () => {
    const current = buildDesiredDisplays(
      [creatureImage({ x: 300, y: 400 }, data)],
      "GM",
      100,
    );
    const changed = buildDesiredDisplays(
      [creatureImage({ x: 300, y: 400 }, { ...data, hpCurrent: 7 })],
      "GM",
      100,
    );
    const plan = planDisplayReconciliation(current, changed);

    expect(plan.add).toEqual([]);
    expect(plan.deleteIds).toEqual([]);
    expect(plan.update).toHaveLength(current.length);
    expect(
      plan.update.every(({ current: item, desired }) => item.id === desired.id),
    ).toBe(true);
    expect(
      plan.update.every(
        ({ current: item, desired }) =>
          item.metadata[DISPLAY_RENDER_KEY] !==
          desired.metadata[DISPLAY_RENDER_KEY],
      ),
    ).toBe(true);
  });

  it("adds the new sword while updating existing layout components in place", () => {
    const desired = buildDesiredDisplays(
      [creatureImage({ x: 300, y: 400 }, data)],
      "GM",
      100,
    );
    const current = desired
      .filter((item) => !item.id.endsWith("-damage-icon"))
      .map(
        (item) =>
          ({
            ...item,
            metadata: {
              ...item.metadata,
              [DISPLAY_RENDER_KEY]: "layout-13",
            },
          }) as Item,
      );
    const plan = planDisplayReconciliation(current, desired);

    expect(plan.add.map((item) => item.id)).toEqual([
      "creature-1-dwtools-damage-icon",
    ]);
    expect(plan.update).toHaveLength(current.length);
    expect(
      plan.update.every(
        ({ current: item, desired: replacement }) => item.id === replacement.id,
      ),
    ).toBe(true);
    expect(plan.deleteIds).toEqual([]);
  });

  it("adds the hidden marker and removes it again without replacing other components", () => {
    const visible = buildDesiredDisplays(
      [creatureImage({ x: 300, y: 400 }, data)],
      "GM",
      100,
    );
    const hidden = buildDesiredDisplays(
      [creatureImage({ x: 300, y: 400 }, { ...data, visibleToPlayers: false })],
      "GM",
      100,
    );
    const hidePlan = planDisplayReconciliation(visible, hidden);
    const showPlan = planDisplayReconciliation(hidden, visible);

    expect(hidePlan.add.map((item) => item.id)).toEqual([
      "creature-1-dwtools-visibility-icon",
    ]);
    expect(hidePlan.deleteIds).toEqual([]);
    expect(showPlan.add).toEqual([]);
    expect(showPlan.deleteIds).toEqual(["creature-1-dwtools-visibility-icon"]);
    expect(
      hidePlan.update.every(
        ({ current, desired }) => current.id === desired.id,
      ),
    ).toBe(true);
    expect(
      showPlan.update.every(
        ({ current, desired }) => current.id === desired.id,
      ),
    ).toBe(true);
  });

  it("upgrades a hidden pre-0.5.1 overlay by deleting only its visibility background", () => {
    const desired = buildDesiredDisplays(
      [
        creatureImage(
          { x: 300, y: 400 },
          {
            ...data,
            visibleToPlayers: false,
          },
        ),
      ],
      "GM",
      100,
    );
    const current = desired.map(
      (item) =>
        ({
          ...item,
          position: item.id.endsWith("-visibility-icon")
            ? { x: 0, y: 0 }
            : item.position,
          metadata: {
            ...item.metadata,
            [DISPLAY_RENDER_KEY]: "layout-16",
          },
        }) as Item,
    );
    current.push({
      ...current[0],
      id: "creature-1-dwtools-visibility-bg",
    } as Item);
    const plan = planDisplayReconciliation(current, desired);
    const markerUpdate = plan.update.find(({ current: item }) =>
      item.id.endsWith("-visibility-icon"),
    );

    expect(plan.add).toEqual([]);
    expect(plan.update).toHaveLength(desired.length);
    expect(plan.deleteIds).toEqual(["creature-1-dwtools-visibility-bg"]);
    expect(markerUpdate?.current.position).toEqual({ x: 0, y: 0 });
    expect(markerUpdate?.desired.position).not.toEqual({ x: 0, y: 0 });
  });

  it("upgrades a visible pre-0.5.1 overlay by deleting both visibility components", () => {
    const desired = buildDesiredDisplays(
      [
        creatureImage(
          { x: 300, y: 400 },
          {
            ...data,
            visibleToPlayers: true,
          },
        ),
      ],
      "GM",
      100,
    );
    const current = desired.map(
      (item) =>
        ({
          ...item,
          metadata: {
            ...item.metadata,
            [DISPLAY_RENDER_KEY]: "layout-16",
          },
        }) as Item,
    );
    current.push(
      { ...current[0], id: "creature-1-dwtools-visibility-bg" } as Item,
      { ...current[0], id: "creature-1-dwtools-visibility-icon" } as Item,
    );
    const plan = planDisplayReconciliation(current, desired);

    expect(plan.add).toEqual([]);
    expect(plan.update).toHaveLength(desired.length);
    expect(plan.deleteIds).toEqual([
      "creature-1-dwtools-visibility-bg",
      "creature-1-dwtools-visibility-icon",
    ]);
  });

  it("adds missing deterministic components and removes stale displays", () => {
    const desired = buildDesiredDisplays(
      [creatureImage({ x: 300, y: 400 }, data)],
      "GM",
      100,
    );
    const stale = {
      ...desired[0],
      id: "obsolete-display",
    } as Item;
    const plan = planDisplayReconciliation([stale], desired);

    expect(plan.add).toHaveLength(desired.length);
    expect(plan.deleteIds).toEqual(["obsolete-display"]);
  });
});
