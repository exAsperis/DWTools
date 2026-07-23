import { describe, expect, it } from "vitest";
import { parseDamage, rollDamage } from "./damage";

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
});
