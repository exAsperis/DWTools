import { describe, expect, it } from "vitest";
import {
  selectedDiceExtension,
  symbolicChoiceExpression,
  symbolicChoiceIndex,
  toNoDiceExpression,
} from "./diceExtension";

describe("dice extension selection", () => {
  it("preserves the built-in roller in existing rooms", () => {
    expect(selectedDiceExtension({})).toBe("dwtools");
    expect(
      selectedDiceExtension({
        "com.ex-asperis.dwtools/dice-extension": "no-dice",
      }),
    ).toBe("no-dice");
  });

  it("translates DWTools selection aliases for No Dice", () => {
    expect(toNoDiceExpression("b[2d6]+w[2d4]")).toBe("H[2d6]+L[2d4]");
    expect(toNoDiceExpression("Highest[2d{miss,hit}]")).toBe("H[2d{miss,hit}]");
  });

  it("uses symbolic faces for treasure choices sent to No Dice", () => {
    expect(symbolicChoiceExpression(3)).toBe("d{OptionA,OptionB,OptionC}");
    expect(symbolicChoiceIndex("OptionB", 3)).toBe(1);
    expect(symbolicChoiceIndex("OptionZ", 3)).toBe(-1);
    expect(symbolicChoiceExpression(27)).toContain("OptionAA");
  });
});
