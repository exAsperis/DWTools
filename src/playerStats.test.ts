import { describe, expect, it } from "vitest";
import {
  abilityModifier,
  calculatedMaxHp,
  calculatedMaxLoad,
  compactConditions,
  compactScores,
  effectiveAbilityModifier,
  formatModifier,
  isMaximumMismatch,
  shouldPromptForRecalculation,
} from "./playerStats";

describe("Dungeon World player stat calculations", () => {
  it.each([
    [3, -3],
    [4, -2],
    [5, -2],
    [6, -1],
    [8, -1],
    [9, 0],
    [12, 0],
    [13, 1],
    [15, 1],
    [16, 2],
    [17, 2],
    [18, 3],
  ])("maps score %i to modifier %i", (score, modifier) => {
    expect(abilityModifier(score)).toBe(modifier);
  });

  it("formats signed modifiers and leaves blank scores blank", () => {
    expect(formatModifier(abilityModifier(null))).toBe("—");
    expect(formatModifier(0)).toBe("+0");
    expect(formatModifier(2)).toBe("+2");
    expect(formatModifier(-1)).toBe("-1");
  });

  it("applies condition penalties to effective displayed modifiers", () => {
    expect(effectiveAbilityModifier(16, undefined)).toBe(2);
    expect(effectiveAbilityModifier(16, -1)).toBe(1);
    expect(effectiveAbilityModifier(null, -1)).toBeUndefined();
  });

  it("uses Constitution score for HP and Strength modifier for Load", () => {
    expect(calculatedMaxHp(8, 15)).toBe(23);
    expect(calculatedMaxLoad(12, 16)).toBe(14);
    expect(calculatedMaxHp(undefined, 15)).toBeUndefined();
    expect(calculatedMaxLoad(12, null)).toBeUndefined();
  });

  it("detects overrides and prompts only after a relevant score change", () => {
    expect(isMaximumMismatch(20, 21)).toBe(true);
    expect(isMaximumMismatch(21, 21)).toBe(false);
    expect(isMaximumMismatch(undefined, undefined)).toBe(false);
    expect(shouldPromptForRecalculation("14", "15", 20, 21)).toBe(true);
    expect(shouldPromptForRecalculation("15", "15", 20, 21)).toBe(false);
    expect(shouldPromptForRecalculation("14", "15", 21, 21)).toBe(false);
  });

  it("omits completely blank scores and inactive conditions", () => {
    expect(compactScores([null, null, null, null, null, null])).toBeUndefined();
    expect(compactScores([16, null, null, null, null, null])).toEqual([
      16,
      null,
      null,
      null,
      null,
      null,
    ]);
    expect(compactConditions({})).toBeUndefined();
    expect(compactConditions({ weak: -1 })).toEqual({ weak: -1 });
  });
});
