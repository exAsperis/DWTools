import { describe, expect, it, vi } from "vitest";
import { OVERWRITE_LABEL_ON_LINK_KEY } from "./constants";
import {
  getOverwriteLabelOnLink,
  persistOverwriteLabelOnLink,
} from "./overwriteLabel";

describe("overwrite label on link", () => {
  it.each([
    [{}, true],
    [{ [OVERWRITE_LABEL_ON_LINK_KEY]: true }, true],
    [{ [OVERWRITE_LABEL_ON_LINK_KEY]: false }, false],
    [{ [OVERWRITE_LABEL_ON_LINK_KEY]: "false" }, true],
    [{ [OVERWRITE_LABEL_ON_LINK_KEY]: null }, true],
  ])("reads room metadata %#", (metadata, expected) => {
    expect(getOverwriteLabelOnLink(metadata)).toBe(expected);
  });

  it("persists only the room preference metadata key", async () => {
    const setMetadata = vi.fn(async () => undefined);

    await persistOverwriteLabelOnLink(setMetadata, false);

    expect(setMetadata).toHaveBeenCalledOnce();
    expect(setMetadata).toHaveBeenCalledWith({
      [OVERWRITE_LABEL_ON_LINK_KEY]: false,
    });
  });
});
