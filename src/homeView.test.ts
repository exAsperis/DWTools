import { describe, expect, it } from "vitest";
import {
  buildHomeMarkup,
  DEFAULT_HOME_SECTIONS,
  type HomeSectionState,
} from "./homeView";

describe("buildHomeMarkup", () => {
  it("shows the visible default toggle to GMs", () => {
    const markup = buildHomeMarkup("GM", true, false);

    expect(markup).toContain('src="./icon.svg"');
    expect(markup).toContain('alt="DWTools logo"');
    expect(markup).toContain("Agenda");
    expect(markup).toContain("Portray a fantastic world");
    expect(markup).toContain("Moves");
    expect(markup).toContain("Basic Moves");
    expect(markup).toContain("Hack and Slash");
    expect(markup).toContain("Special Moves");
    expect(markup).not.toContain("Last Breath");
    expect(markup).toContain("Settings");
    expect(markup).not.toContain('id="default-visibility"');
    expect(markup).not.toContain("Right-click a character");
    expect(markup).not.toContain("quick HP controls");
    expect(markup).not.toContain("Room persistence");
    expect(markup).not.toContain("HP 7/10");
    expect(markup).not.toContain('class="sample"');
  });

  it("shows the hidden icon state and saving state", () => {
    const sections: HomeSectionState = {
      ...DEFAULT_HOME_SECTIONS,
      settings: true,
    };
    const markup = buildHomeMarkup("GM", false, true, sections);

    expect(markup).toContain('aria-label="Default: hidden from players"');
    expect(markup).toContain("disabled");
    expect(markup).toContain("19.1 19.1");
  });

  it("hides the room setting from players", () => {
    const markup = buildHomeMarkup(
      "PLAYER",
      false,
      false,
      DEFAULT_HOME_SECTIONS,
      '<section id="character-manager">Character Records</section>',
    );

    expect(markup).not.toContain("Default character overlay:");
    expect(markup).not.toContain('id="default-visibility"');
    expect(markup).not.toContain("Agenda");
    expect(markup).toContain("Character Records");
    expect(markup).toContain("Moves");
  });

  it("renders persistent section controls with the requested defaults", () => {
    const markup = buildHomeMarkup("GM", true, false);

    expect(markup).toContain(
      'data-toggle-section="agenda" aria-expanded="true"',
    );
    expect(markup).toContain(
      'data-toggle-section="moves" aria-expanded="true"',
    );
    expect(markup).toContain(
      'data-toggle-section="basicMoves" aria-expanded="true"',
    );
    expect(markup).toContain(
      'data-toggle-section="specialMoves" aria-expanded="false"',
    );
    expect(markup).toContain(
      'data-toggle-section="settings" aria-expanded="false"',
    );
  });

  it("renders all Special Moves when their subsection is expanded", () => {
    const markup = buildHomeMarkup("PLAYER", true, false, {
      ...DEFAULT_HOME_SECTIONS,
      specialMoves: true,
    });

    expect(markup).toContain("Last Breath");
    expect(markup).toContain("Undertake a Perilous Journey");
    expect(markup).toContain("Outstanding Warrants");
    expect(markup).toContain("Bolster");
  });

  it("shows the extension version at the bottom when provided", () => {
    const markup = buildHomeMarkup(
      "PLAYER",
      true,
      false,
      DEFAULT_HOME_SECTIONS,
      "",
      "1.3.7",
    );

    expect(markup).toContain('<p class="extension-version">version 1.3.7</p>');
    expect(markup.indexOf("version 1.3.7")).toBeLessThan(
      markup.indexOf('<dialog id="move-dialog"'),
    );
  });
});
