import { isPath, isText, type Image, type Item } from "@owlbear-rodeo/sdk";
import { describe, expect, it } from "vitest";
import { CREATURE_KEY, DISPLAY_KEY, type CreatureData } from "./constants";
import {
  DISPLAY_RENDER_KEY,
  applyDesiredItem,
  buildDesiredDisplays,
  planDisplayReconciliation,
} from "./display";

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
  it("builds opaque text in front of attachment-layer HP shapes", () => {
    const desired = buildDesiredDisplays([
      creatureImage({ x: 300, y: 400 }, {
        hpCurrent: 8,
        hpMax: 12,
        armor: 1,
        damage: "d6",
        visibleToPlayers: false,
      }),
    ], "GM", 100);

    expect(desired).toHaveLength(10);
    expect(new Set(desired.map((item) => item.id)).size).toBe(desired.length);
    expect(desired.every((item) => item.metadata[DISPLAY_KEY] === true)).toBe(true);

    const hpText = desired.find((item) => item.id.endsWith("-hp-text"));
    const hpBackground = desired.find((item) => item.id.endsWith("-hp-bg"));
    const hpFill = desired.find((item) => item.id.endsWith("-hp-fill-bg"));
    const visibilityIcon = desired.find((item) => item.id.endsWith("-visibility-icon"));
    const armorIcon = desired.find((item) => item.id.endsWith("-armor-icon"));
    const armorText = desired.find((item) => item.id.endsWith("-armor-text"));

    expect(hpText?.type).toBe("TEXT");
    expect(hpText?.layer).toBe("TEXT");
    expect(hpText?.visible).toBe(true);
    expect(hpBackground?.type).toBe("CURVE");
    expect(hpBackground?.layer).toBe("ATTACHMENT");
    expect(hpFill?.layer).toBe("ATTACHMENT");
    expect(visibilityIcon?.type).toBe("PATH");
    expect(visibilityIcon?.layer).toBe("TEXT");
    expect(armorIcon?.type).toBe("PATH");
    expect(armorIcon?.layer).toBe("TEXT");
    expect(visibilityIcon && isPath(visibilityIcon)).toBe(true);
    expect(armorIcon && isPath(armorIcon)).toBe(true);
    expect(armorText && isText(armorText)).toBe(true);
    if (armorText && isText(armorText)) expect(armorText.text.plainText).toBe("1");
  });

  it("keeps hidden-token displays local and visible for the GM", () => {
    const desired = buildDesiredDisplays([
      creatureImage({ x: 300, y: 400 }, {
        hpCurrent: 8,
        hpMax: 12,
        armor: 1,
        damage: "d6",
        visibleToPlayers: true,
      }),
    ], "GM", 100);
    const hiddenToken = creatureImage({ x: 300, y: 400 }, {
      hpCurrent: 8,
      hpMax: 12,
      armor: 1,
      damage: "d6",
      visibleToPlayers: true,
    });
    hiddenToken.visible = false;
    const hiddenDesired = buildDesiredDisplays([hiddenToken], "GM", 100);

    expect(hiddenDesired).toHaveLength(desired.length);
    expect(hiddenDesired.every((item) => item.visible)).toBe(true);
    expect(hiddenDesired.every((item) =>
      item.disableAttachmentBehavior?.includes("VISIBLE"),
    )).toBe(true);
  });

  it("removes player displays when a shared token becomes hidden", () => {
    const hiddenToken = creatureImage({ x: 300, y: 400 }, {
      hpCurrent: 8,
      hpMax: 12,
      visibleToPlayers: true,
    });
    hiddenToken.visible = false;

    expect(buildDesiredDisplays([hiddenToken], "PLAYER", 100)).toEqual([]);
  });

  it("lets visible player displays inherit token visibility", () => {
    const desired = buildDesiredDisplays([
      creatureImage({ x: 300, y: 400 }, {
        hpCurrent: 8,
        hpMax: 12,
        visibleToPlayers: true,
      }),
    ], "PLAYER", 100);

    expect(desired.length).toBeGreaterThan(0);
    expect(desired.every((item) =>
      !item.disableAttachmentBehavior?.includes("VISIBLE"),
    )).toBe(true);
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
    const current = buildDesiredDisplays([
      creatureImage({ x: 300, y: 400 }, data),
    ], "GM", 100);
    const moved = buildDesiredDisplays([
      creatureImage({ x: 900, y: 1000 }, data),
    ], "GM", 100);

    expect(planDisplayReconciliation(current, moved)).toEqual({
      add: [],
      update: [],
      deleteIds: [],
    });
  });

  it("updates components in place when HP changes", () => {
    const current = buildDesiredDisplays([
      creatureImage({ x: 300, y: 400 }, data),
    ], "GM", 100);
    const changed = buildDesiredDisplays([
      creatureImage({ x: 300, y: 400 }, { ...data, hpCurrent: 7 }),
    ], "GM", 100);
    const plan = planDisplayReconciliation(current, changed);

    expect(plan.add).toEqual([]);
    expect(plan.deleteIds).toEqual([]);
    expect(plan.update).toHaveLength(current.length);
    expect(plan.update.every(({ current: item, desired }) => item.id === desired.id)).toBe(true);
    expect(plan.update.every(({ current: item, desired }) =>
      item.metadata[DISPLAY_RENDER_KEY] !== desired.metadata[DISPLAY_RENDER_KEY],
    )).toBe(true);
  });

  it("updates the visibility path in place when its state changes", () => {
    const visible = buildDesiredDisplays([
      creatureImage({ x: 300, y: 400 }, data),
    ], "GM", 100);
    const hidden = buildDesiredDisplays([
      creatureImage({ x: 300, y: 400 }, { ...data, visibleToPlayers: false }),
    ], "GM", 100);
    const currentIcon = visible.find((item) => item.id.endsWith("-visibility-icon"));
    const desiredIcon = hidden.find((item) => item.id.endsWith("-visibility-icon"));

    expect(currentIcon && isPath(currentIcon)).toBe(true);
    expect(desiredIcon && isPath(desiredIcon)).toBe(true);
    if (!currentIcon || !desiredIcon || !isPath(currentIcon) || !isPath(desiredIcon)) return;

    const visibleCommands = currentIcon.commands.map((command) => [...command]);
    applyDesiredItem(currentIcon, desiredIcon);

    expect(currentIcon.id).toBe(desiredIcon.id);
    expect(currentIcon.commands).not.toEqual(visibleCommands);
    expect(currentIcon.commands).toEqual(desiredIcon.commands);
  });

  it("adds missing deterministic components and removes stale displays", () => {
    const desired = buildDesiredDisplays([
      creatureImage({ x: 300, y: 400 }, data),
    ], "GM", 100);
    const stale = {
      ...desired[0],
      id: "obsolete-display",
    } as Item;
    const plan = planDisplayReconciliation([stale], desired);

    expect(plan.add).toHaveLength(desired.length);
    expect(plan.deleteIds).toEqual(["obsolete-display"]);
  });
});
