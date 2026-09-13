import { describe, expect, it } from "vitest";
import {
  countTopLevelListItems,
  renderContextMarkdown,
  rollListChoice,
  topLevelListItems,
} from "./contextMarkdown";

describe("context Markdown", () => {
  it("renders paragraphs, preserved line breaks, emphasis, and strong text", () => {
    const markup = renderContextMarkdown(
      "First **bold and _italic_** line\nSecond line\n\nThird paragraph",
    );
    expect(markup).toContain(
      "<p>First <strong>bold and <em>italic</em></strong> line<br>Second line</p>",
    );
    expect(markup).toContain("<p>Third paragraph</p>");
  });

  it("renders unordered and numbered lists", () => {
    expect(renderContextMarkdown("- One\n* Two")).toBe(
      "<ul><li>One</li><li>Two</li></ul>",
    );
    expect(renderContextMarkdown("1. One\n2. Two")).toBe(
      "<ol><li>One</li><li>Two</li></ol>",
    );
  });

  it("counts ordered and unordered level-one list items only", () => {
    expect(
      countTopLevelListItems(
        "- One\n  - Nested\n* Two\n1. Three\n  1. Nested\n2) Four\nParagraph",
      ),
    ).toBe(4);
    expect(countTopLevelListItems("Plain treasure text")).toBe(0);
    expect(
      topLevelListItems("- Coins, gems, and a map\n  - Nested\n2) Ring"),
    ).toEqual(["Coins, gems, and a map", "Ring"]);
  });

  it("selects one authored list item uniformly", () => {
    const choices = ["Coins", "Ring", "Map"];
    expect(rollListChoice(choices, () => 0)).toBe("Coins");
    expect(rollListChoice(choices, () => 0.5)).toBe("Ring");
    expect(rollListChoice(choices, () => 0.999)).toBe("Map");
    expect(rollListChoice([], () => 0)).toBeUndefined();
  });

  it("escapes raw HTML instead of executing it", () => {
    const markup = renderContextMarkdown('<img src=x onerror="alert(1)">');
    expect(markup).not.toContain("<img");
    expect(markup).toContain("&lt;img");
  });

  it("turns dice expressions inside formatting into accessible roll buttons", () => {
    const markup = renderContextMarkdown(
      "**Damage d8+1**, then d{fail,partial,success}.",
    );
    expect(markup).toContain("<strong>Damage ");
    expect(markup).toContain('data-roll-expression="d8+1"');
    expect(markup).toContain("🎲 d8+1");
    expect(markup).toContain('data-roll-expression="d{fail,partial,success}"');
  });

  it("links counted choices and long selection aliases as complete expressions", () => {
    const markup = renderContextMarkdown(
      "Try 3d{fail,partial,success}, then **Highest[2d{1,4,10}]**.",
    );
    expect(markup).toContain('data-roll-expression="3d{fail,partial,success}"');
    expect(markup).toContain('data-roll-expression="Highest[2d{1,4,10}]"');
    expect(markup.match(/data-roll-expression=/g)).toHaveLength(2);
  });
});
