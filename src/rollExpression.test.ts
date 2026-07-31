import { describe, expect, it } from "vitest";
import {
  evaluateRollExpression,
  findRollExpressions,
  isRollExpression,
} from "./rollExpression";

describe("roll expressions", () => {
  it("evaluates arithmetic with standard precedence and parentheses", () => {
    expect(evaluateRollExpression("d6 + 2 * 3", () => 0)).toMatchObject({
      ok: true,
      kind: "number",
      value: 7,
    });
    expect(evaluateRollExpression("(d6 + 2) * 3", () => 0)).toMatchObject({
      ok: true,
      kind: "number",
      value: 9,
    });
    expect(evaluateRollExpression("-d6 + +2", () => 0)).toMatchObject({
      ok: true,
      kind: "number",
      value: 1,
    });
  });

  it("supports legacy sum, best, and worst dice", () => {
    const values = [0, 0.99, 0.25, 0.75];
    const random = () => values.shift() ?? 0;
    expect(evaluateRollExpression("2d6", random)).toMatchObject({
      ok: true,
      value: 7,
    });
    expect(evaluateRollExpression("b[2d8]", random)).toMatchObject({
      ok: true,
      value: 7,
    });
  });

  it("selects ordered numeric and textual choices uniformly", () => {
    expect(evaluateRollExpression("d{1, 2.5, 4}+1", () => 0.5)).toMatchObject({
      ok: true,
      kind: "number",
      value: 3.5,
    });
    expect(
      evaluateRollExpression("d{fail, partial, success}", () => 0.99),
    ).toMatchObject({
      ok: true,
      kind: "text",
      value: "success",
    });
  });

  it("rolls counted numeric choices and sums every selected result", () => {
    const values = [0, 0.5, 0.99];
    expect(
      evaluateRollExpression("3d{1,2,4}", () => values.shift() ?? 0),
    ).toMatchObject({
      ok: true,
      kind: "number",
      value: 7,
    });
  });

  it("returns every counted text or mixed choice in roll order", () => {
    const textValues = [0, 0.5, 0.99];
    expect(
      evaluateRollExpression(
        "3d{fail,partial,success}",
        () => textValues.shift() ?? 0,
      ),
    ).toMatchObject({
      ok: true,
      kind: "list",
      value: ["fail", "partial", "success"],
    });

    const mixedValues = [0, 0.99];
    expect(
      evaluateRollExpression("2d{1,fail}", () => mixedValues.shift() ?? 0),
    ).toMatchObject({
      ok: true,
      kind: "list",
      value: [1, "fail"],
    });
  });

  it("ranks numeric choices by value and text choices by list position", () => {
    const numericValues = [0, 0.5, 0.99];
    expect(
      evaluateRollExpression(
        "Highest[3d{10,1,5}]",
        () => numericValues.shift() ?? 0,
      ),
    ).toMatchObject({
      ok: true,
      kind: "number",
      value: 10,
    });

    const textValues = [0, 0.5, 0.99];
    expect(
      evaluateRollExpression(
        "Lowest[3d{partial,success,fail}]",
        () => textValues.shift() ?? 0,
      ),
    ).toMatchObject({
      ok: true,
      kind: "text",
      value: "partial",
    });
  });

  it.each([
    ["b[2d6]", 6],
    ["H[2d6]", 6],
    ["highest[2d6]", 6],
    ["B[2d6]", 6],
    ["w[2d6]", 1],
    ["L[2d6]", 1],
    ["LOWEST[2d6]", 1],
    ["W[2d6]", 1],
  ] as const)("treats %s as an equivalent selection alias", (source, total) => {
    const values = [0, 0.99];
    expect(
      evaluateRollExpression(source, () => values.shift() ?? 0),
    ).toMatchObject({
      ok: true,
      value: total,
    });
  });

  it("allows arithmetic on a numeric retained choice", () => {
    const values = [0, 0.99];
    expect(
      evaluateRollExpression("H[2d{fail,4}]+1", () => values.shift() ?? 0),
    ).toMatchObject({
      ok: true,
      kind: "number",
      value: 5,
    });
  });

  it("rejects arithmetic on a counted nonnumeric result list", () => {
    const values = [0, 0.99];
    expect(
      evaluateRollExpression("2d{fail,success}+1", () => values.shift() ?? 0),
    ).toEqual({
      ok: false,
      message: "Cannot apply arithmetic to a non-numerical roll result.",
    });
  });

  it("handles duplicate choices without changing authored ranking", () => {
    const values = [0, 0.5, 0.99];
    expect(
      evaluateRollExpression(
        "Highest[3d{fail,success,success}]",
        () => values.shift() ?? 0,
      ),
    ).toMatchObject({
      ok: true,
      kind: "text",
      value: "success",
    });
  });

  it("returns typed errors for invalid numeric operations", () => {
    expect(
      evaluateRollExpression("d{fail,partial,success}+1", () => 0),
    ).toEqual({
      ok: false,
      message: "Cannot apply arithmetic to a non-numerical roll result.",
    });
    expect(evaluateRollExpression("d6 / 0", () => 0)).toEqual({
      ok: false,
      message: "Cannot divide a roll result by zero.",
    });
  });

  it("rejects malformed choices and expressions without rolls", () => {
    expect(isRollExpression("d{one,,three}")).toBe(false);
    expect(isRollExpression("d{}")).toBe(false);
    expect(isRollExpression("1 + 2")).toBe(false);
    expect(isRollExpression("0d6")).toBe(false);
    expect(isRollExpression("0d{one,two}")).toBe(false);
    expect(isRollExpression("101d{one,two}")).toBe(false);
    expect(isRollExpression("Highest[2d{one,two}")).toBe(false);
    expect(isRollExpression("Best[2d6]")).toBe(false);
  });

  it("finds multiple embedded expressions without consuming punctuation", () => {
    expect(
      findRollExpressions(
        "Deal d6+1 damage, then choose Highest[2d{left,right}].",
      ),
    ).toEqual([
      { start: 5, end: 9, source: "d6+1" },
      {
        start: 30,
        end: 53,
        source: "Highest[2d{left,right}]",
      },
    ]);
  });

  it("does not detect operator-like text inside ordinary words", () => {
    expect(findRollExpressions("The highest ridge has lowlands.")).toEqual([]);
  });
});
