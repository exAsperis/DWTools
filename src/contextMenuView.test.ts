import { describe, expect, it } from "vitest";
import { buildContextSummary } from "./contextMenuView";

describe("buildContextSummary", () => {
  it("renders the three-line summary with optional damage details", () => {
    const markup = buildContextSummary({
      tags: "Solitary, Small",
      armor: 1,
      hpCurrent: 6,
      hpMax: 6,
      damage: "b[2d10]+1",
      damageDescription: "Claws",
      damageTags: "Close, Messy",
    });

    expect(markup).toContain("Solitary, Small");
    expect(markup).toContain('class="stat-group armor-stat"');
    expect(markup).toContain("HP 6/6");
    expect(markup).toContain("b[2d10]+1");
    expect(markup).toContain("(Claws)");
    expect(markup).toContain("Close, Messy");
    expect(markup).toContain('data-hp="-1"');
    expect(markup).toContain('data-hp="1"');
  });

  it("omits empty damage punctuation and shows primary placeholders", () => {
    const markup = buildContextSummary({});

    expect(markup).not.toContain('class="damage-description"');
    expect(markup.match(/—/g)).toHaveLength(5);
    expect(markup).not.toContain("()");
  });

  it("escapes field content while preserving long wrapping text", () => {
    const markup = buildContextSummary({
      tags: '<script>alert("tag")</script>',
      damage: "d8",
      damageDescription: "<Claws>",
      damageTags: "Close & Messy",
    });

    expect(markup).not.toContain("<script>");
    expect(markup).toContain(
      "&lt;script&gt;alert(&quot;tag&quot;)&lt;/script&gt;",
    );
    expect(markup).toContain("(&lt;Claws&gt;)");
    expect(markup).toContain("Close &amp; Messy");
  });
});
