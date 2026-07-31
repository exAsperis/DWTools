import { describe, expect, it } from "vitest";
import {
  isDamageFormulaInvalid,
  normalizeDamageFormula,
  parseDamage,
  rollDamage,
  rollDamageFormula,
} from "./damage";

describe("damage input feedback", () => {
  it("normalizes a positive integer to one-die notation", () => {
    expect(normalizeDamageFormula("8")).toBe("d8");
    expect(normalizeDamageFormula(" 008 ")).toBe("d8");
  });

  it("preserves non-integer formulas for validation", () => {
    expect(normalizeDamageFormula("2d8+3")).toBe("2d8+3");
    expect(normalizeDamageFormula("fire breath")).toBe("fire breath");
    expect(normalizeDamageFormula("0")).toBe("0");
    expect(normalizeDamageFormula("-8")).toBe("-8");
    expect(normalizeDamageFormula("8.5")).toBe("8.5");
  });

  it("flags only nonblank unsupported formulas", () => {
    expect(isDamageFormulaInvalid("")).toBe(false);
    expect(isDamageFormulaInvalid("   ")).toBe(false);
    expect(isDamageFormulaInvalid("d8")).toBe(false);
    expect(isDamageFormulaInvalid("b[2d10]+1")).toBe(false);
    expect(isDamageFormulaInvalid("(d8 + d{1,2,4}) * 2")).toBe(false);
    expect(isDamageFormulaInvalid("d{fail,partial,success}")).toBe(false);
    expect(isDamageFormulaInvalid("3d{fail,partial,success}")).toBe(false);
    expect(isDamageFormulaInvalid("H[3d{1,2,4}]+1")).toBe(false);
    expect(isDamageFormulaInvalid("Lowest[2d{fail,partial,success}]")).toBe(
      false,
    );
    expect(isDamageFormulaInvalid("fire breath")).toBe(true);
    expect(isDamageFormulaInvalid("0")).toBe(true);
    expect(isDamageFormulaInvalid("-8")).toBe(true);
    expect(isDamageFormulaInvalid("8.5")).toBe(true);
    expect(isDamageFormulaInvalid("d1")).toBe(true);
    expect(isDamageFormulaInvalid("Highest[2d{one,two}")).toBe(true);
    expect(isDamageFormulaInvalid(normalizeDamageFormula("1001"))).toBe(true);
  });
});

describe("parseDamage", () => {
  it.each([
    ["d6", { mode: "sum", count: 1, sides: 6, modifier: 0 }],
    ["2d8+3", { mode: "sum", count: 2, sides: 8, modifier: 3 }],
    ["b[2d6]+1", { mode: "best", count: 2, sides: 6, modifier: 1 }],
    ["w[2d8]-2", { mode: "worst", count: 2, sides: 8, modifier: -2 }],
  ] as const)("parses %s", (source, expected) => {
    expect(parseDamage(source)).toEqual(expected);
  });

  it("rejects invalid expressions", () => {
    expect(parseDamage("fire breath")).toBeNull();
    expect(parseDamage("0d6")).toBeNull();
  });
});

describe("rollDamage", () => {
  it("takes the best roll and adds the modifier", () => {
    const values = [0, 0.99];
    const result = rollDamage(
      { mode: "best", count: 2, sides: 6, modifier: 1 },
      () => values.shift() ?? 0,
    );
    expect(result.rolls).toEqual([1, 6]);
    expect(result.total).toBe(7);
  });

  it("parses, rolls, and formats one shared result string", () => {
    const values = [0, 0.99];

    expect(rollDamageFormula("2d6+1", () => values.shift() ?? 0)).toBe(
      "2d6+1: [1, 6] sum + 1 = 8",
    );
    expect(rollDamageFormula("not dice")).toBeNull();
  });
});
