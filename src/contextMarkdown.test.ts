import { describe, expect, it } from "vitest";
import { renderContextMarkdown } from "./contextMarkdown";

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
