import { describe, expect, it } from "vitest";
import { iconGlyph } from "./icons";

describe("DWTools icons", () => {
  it("uses the selected visible-state eye emoji", () => {
    expect(iconGlyph("eye")).toBe("👁️");
  });

  it("uses the selected not-visible emoji", () => {
    expect(iconGlyph("eye-off")).toBe("🚫");
  });

  it("uses the selected armor shield emoji", () => {
    expect(iconGlyph("shield")).toBe("🛡️");
  });
});
