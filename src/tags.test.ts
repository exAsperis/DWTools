import { describe, expect, it } from "vitest";
import {
  buildTagVocabularies,
  formatTags,
  normalizeTags,
  suggestTag,
  tagKeyAction,
} from "./tags";

describe("tag normalization", () => {
  it("converts strings and arrays into trimmed case-insensitive unique tags", () => {
    expect(normalizeTags(" Small, Intelligent, small,  ")).toEqual([
      "Small",
      "Intelligent",
    ]);
    expect(normalizeTags(["Close, Reach", "close", "Messy"])).toEqual([
      "Close",
      "Reach",
      "Messy",
    ]);
    expect(normalizeTags(" , ")).toBeUndefined();
  });

  it("formats tags and enforces the serialized length limit", () => {
    expect(formatTags(["Close", "Reach"])).toBe("Close, Reach");
    expect(() => normalizeTags("x".repeat(161))).toThrow("160");
    expect(() => normalizeTags([1])).toThrow("array of text");
  });
});

describe("tag suggestions", () => {
  it("uses a case-insensitive prefix and deterministic alphabetical match", () => {
    expect(suggestTag("s", [], ["Stealthy", "Small", "Solitary"])).toBe(
      "Small",
    );
    expect(suggestTag("small", [], ["Small"])).toBeUndefined();
    expect(suggestTag("s", ["Small"], ["Small", "Solitary"])).toBe("Solitary");
  });

  it("keeps vocabularies isolated by field and preserves first capitalization", () => {
    expect(
      buildTagVocabularies([
        { tags: ["Small"], armorTags: ["Natural"] },
        { tags: ["small", "Solitary"], damageTags: ["Close"] },
      ]),
    ).toEqual({
      tags: ["Small", "Solitary"],
      armorTags: ["Natural"],
      damageTags: ["Close"],
    });
  });
});

describe("tag keyboard behavior", () => {
  it("maps comma, Tab, and Delete to the requested editor actions", () => {
    expect(tagKeyAction(",", "Close", undefined)).toBe("commit-draft");
    expect(tagKeyAction("Tab", "Cl", "Close")).toBe("commit-suggestion");
    expect(tagKeyAction("Tab", "Novel", undefined)).toBe("commit-draft");
    expect(tagKeyAction("Tab", "", undefined)).toBe("native");
    expect(tagKeyAction("Delete", "Cl", "Close")).toBe("dismiss-suggestion");
    expect(tagKeyAction("Delete", "Cl", undefined)).toBe("native");
  });
});
