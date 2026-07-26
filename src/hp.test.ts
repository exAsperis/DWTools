import { describe, expect, it } from "vitest";
import { adjustedHp } from "./hp";

describe("adjustedHp", () => {
  it("allows increases beyond an independently stored maximum", () => {
    expect(adjustedHp(8, 1)).toBe(9);
    expect(adjustedHp(8, 5)).toBe(13);
  });

  it("retains the existing zero floor for damage adjustments", () => {
    expect(adjustedHp(2, -5)).toBe(0);
  });
});
