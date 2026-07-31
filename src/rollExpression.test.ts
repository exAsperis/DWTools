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
  });

  it("finds multiple embedded expressions without consuming punctuation", () => {
    expect(
      findRollExpressions("Deal d6+1 damage, then choose d{left,right}."),
    ).toEqual([
      { start: 5, end: 9, source: "d6+1" },
      { start: 30, end: 43, source: "d{left,right}" },
    ]);
  });
});
