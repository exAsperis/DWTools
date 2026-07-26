import { describe, expect, it } from "vitest";
import { buildHomeMarkup } from "./homeView";

describe("buildHomeMarkup", () => {
  it("shows the visible default toggle to GMs", () => {
    const markup = buildHomeMarkup("GM", true, false);

    expect(markup).toContain('src="./icon.svg"');
    expect(markup).toContain('alt="DWTools logo"');
    expect(markup).toContain("Default character overlay visibility:");
    expect(markup).toContain('aria-label="Default: visible to players"');
    expect(markup).toContain('id="default-visibility"');
    expect(markup).not.toContain("disabled");
  });

  it("shows the hidden icon state and saving state", () => {
    const markup = buildHomeMarkup("GM", false, true);

    expect(markup).toContain('aria-label="Default: hidden from players"');
    expect(markup).toContain("disabled");
    expect(markup).toContain("19.1 19.1");
  });

  it("hides the room setting from players", () => {
    const markup = buildHomeMarkup(
      "PLAYER",
      false,
      false,
      '<section id="character-manager">Character Records</section>',
    );

    expect(markup).not.toContain("Default character overlay visibility:");
    expect(markup).not.toContain('id="default-visibility"');
    expect(markup).not.toContain("Character Records");
  });
});
