import { describe, expect, it } from "vitest";
import { iconCommands, iconMarkup } from "./icons";

describe("DWTools icons", () => {
  it("uses the same 24-unit geometry for the panel and overlay", () => {
    expect(iconMarkup("eye")).toContain('viewBox="0 0 24 24"');
    expect(iconCommands("eye")[0]).toEqual(["M", 2.2, 12]);
  });

  it("draws an eye inside a prohibition circle for hidden visibility", () => {
    const commands = iconCommands("eye-off");

    expect(commands[0]).toEqual(["M", 22, 12]);
    expect(commands).toContainEqual(["L", 19.1, 19.1]);
  });

  it("draws a shield outline for armor", () => {
    const commands = iconCommands("shield");

    expect(commands[0]).toEqual(["M", 12, 2.5]);
    expect(commands).toContainEqual(["L", 20, 5]);
  });

  it("draws a sword for damage in shared panel geometry", () => {
    const commands = iconCommands("sword");

    expect(commands[0]).toEqual(["M", 14.5, 3]);
    expect(commands).toContainEqual(["L", 9.2, 21.3]);
    expect(iconMarkup("sword")).toContain('viewBox="0 0 24 24"');
  });
});
