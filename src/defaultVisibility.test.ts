import { describe, expect, it, vi } from "vitest";
import { DEFAULT_OVERLAY_VISIBILITY_KEY } from "./constants";
import {
  getDefaultOverlayVisibility,
  initializeCreatureData,
  persistDefaultOverlayVisibility,
} from "./defaultVisibility";

describe("default overlay visibility", () => {
  it.each([
    [{}, true],
    [{ [DEFAULT_OVERLAY_VISIBILITY_KEY]: true }, true],
    [{ [DEFAULT_OVERLAY_VISIBILITY_KEY]: false }, false],
    [{ [DEFAULT_OVERLAY_VISIBILITY_KEY]: "hidden" }, true],
    [{ [DEFAULT_OVERLAY_VISIBILITY_KEY]: null }, true],
  ])("reads room metadata %#", (metadata, expected) => {
    expect(getDefaultOverlayVisibility(metadata)).toBe(expected);
  });

  it("initializes only missing or invalid creature data from the room default", () => {
    expect(initializeCreatureData(undefined, false)).toEqual({
      visibleToPlayers: false,
    });
    expect(initializeCreatureData("invalid", true)).toEqual({
      visibleToPlayers: true,
    });
  });

  it("preserves existing and legacy creature metadata exactly", () => {
    const existing = { hpCurrent: 4, visibleToPlayers: false };
    const legacy = { hpCurrent: 4 };

    expect(initializeCreatureData(existing, true)).toBe(existing);
    expect(initializeCreatureData(legacy, false)).toBe(legacy);
  });

  it("persists only the room default metadata key", async () => {
    const setMetadata = vi.fn(async () => undefined);

    await persistDefaultOverlayVisibility(setMetadata, false);

    expect(setMetadata).toHaveBeenCalledOnce();
    expect(setMetadata).toHaveBeenCalledWith({
      [DEFAULT_OVERLAY_VISIBILITY_KEY]: false,
    });
  });
});
