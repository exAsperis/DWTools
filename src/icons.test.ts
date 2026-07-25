import { describe, expect, it } from "vitest";
import { iconDataUrl, iconMarkup } from "./icons";

describe("DWTools icons", () => {
  it("uses the same view box for inline and overlay eye icons", () => {
    expect(iconMarkup("eye")).toContain('viewBox="0 0 24 24"');
    expect(decodeURIComponent(iconDataUrl("eye"))).toContain('viewBox="0 0 24 24"');
  });

  it("draws a circled eye with a slash for hidden visibility", () => {
    const hidden = decodeURIComponent(iconDataUrl("eye-off"));

    expect(hidden).toContain('<circle cx="12" cy="12" r="10"/>');
    expect(hidden).toContain("m4.9 4.9 14.2 14.2");
  });

  it("provides a shield rather than a geometric text glyph for armor", () => {
    const shield = decodeURIComponent(iconDataUrl("shield"));

    expect(shield).toContain("M12 2.5 20 5");
    expect(shield).not.toContain("◆");
  });
});
