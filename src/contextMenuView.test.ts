import { describe, expect, it } from "vitest";
import { activeRecord } from "./characterTestHelpers";
import { buildContextSummary } from "./contextMenuView";

describe("buildContextSummary", () => {
  it("renders requested rows, effective modifiers, progression, and details in order", () => {
    const markup = buildContextSummary({
      tags: "Solitary, Small",
      armor: 1,
      hpCurrent: 6,
      hpMax: 6,
      damage: "b[2d10]+1",
      damageDescription: "Claws",
      damageTags: "Close, Messy",
      scores: [16, 13, 10, 8, 11, 7],
      conditions: { weak: -1 },
      level: 3,
      xp: 10,
      instinct: "Defend the nest",
      moves: "Claw\nLeap",
      treasure: "A bright stone",
    });

    expect(markup).toContain("Solitary, Small");
    expect(markup).toContain('class="stat-group armor-stat"');
    expect(markup).toContain("HP 6/6");
    expect(markup).toContain("b[2d10]+1");
    expect(markup).toContain("(Claws)");
    expect(markup).toContain("Close, Messy");
    expect(markup).toContain('data-hp="-1"');
    expect(markup).toContain('data-hp="1"');
    expect(markup).toContain('data-ability="0" data-modifier="1"');
    expect(markup).toContain(
      'class="modifier-roll condition-affected" type="button" data-ability="0"',
    );
    expect(markup).toContain(
      'class="modifier-roll" type="button" data-ability="1"',
    );
    expect(markup).toContain("<span>STR</span> <strong>+1</strong>");
    expect(markup).toContain('class="level-value level-ready">Lv 3');
    expect(markup).toContain('data-xp="-1"');
    expect(markup).toContain("XP 10");
    expect(markup).toContain("Instinct:");
    expect(markup).toContain("<p>Claw<br>Leap</p>");
    expect(markup).not.toContain("visibility-button");
    expect(markup.indexOf("armor-stat")).toBeLessThan(
      markup.indexOf("damage-row"),
    );
    expect(markup.indexOf("damage-row")).toBeLessThan(
      markup.indexOf("ability-summary-row"),
    );
    expect(markup.indexOf("progression-summary-row")).toBeLessThan(
      markup.indexOf("Tags:"),
    );
  });

  it("renders safe Markdown and dice links only in Moves and Treasure", () => {
    const markup = buildContextSummary({
      tags: "A d6 tag",
      instinct: "Roll d8",
      moves: "- **Strike** for d6+1\n- _Retreat_",
      treasure: "Coins\n\n1. d{1,2,4}\n2. d{fail,success}",
      damage: "d10",
    });

    expect(markup).toContain("<strong>Strike</strong>");
    expect(markup).toContain("<em>Retreat</em>");
    expect(markup).toContain("<ol>");
    expect(markup).toContain("Coins</p><ol>");
    expect(markup).toContain('data-roll-expression="d6+1"');
    expect(markup).toContain('data-roll-expression="d{fail,success}"');
    expect(markup).toContain('id="damage" title="Roll damage">🎲 d10');
    expect(markup).toContain("A d6 tag");
    expect(markup).toContain("Roll d8");
    expect(markup.match(/data-roll-expression=/g)).toHaveLength(3);
  });

  it("omits missing fields instead of rendering placeholders", () => {
    const markup = buildContextSummary({});

    expect(markup).not.toContain('class="damage-description"');
    expect(markup).not.toContain("—");
    expect(markup).not.toContain("combat-row");
    expect(markup).not.toContain("damage-row");
    expect(markup).not.toContain("detail-row");
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

  it("shows a purple -1 encumbrance warning through two Load over maximum", () => {
    const record = activeRecord("hero", {
      fields: { ...activeRecord("hero").fields, maxLoad: 1 },
      inventory: [["Bag of Books", 0.4, 5]],
    });
    const markup = buildContextSummary({}, record);

    expect(markup).toContain("Load: 2.00 / 1.00");
    expect(markup).toContain("Encumbered (-1)");
    expect(markup).toContain("encumbered-minus-one");
    expect(markup).not.toContain("Overloaded");
  });

  it("shows a red X encumbrance warning beyond two Load over maximum", () => {
    const record = activeRecord("hero", {
      fields: { ...activeRecord("hero").fields, maxLoad: 1 },
      inventory: [["Anvil", 1, 4]],
    });
    const markup = buildContextSummary({}, record);

    expect(markup).toContain("Load: 4.00 / 1.00");
    expect(markup).toContain("Encumbered (X)");
    expect(markup).toContain("encumbered-x");
  });

  it("does not highlight level below the level-up threshold", () => {
    const markup = buildContextSummary({ level: 3, xp: 9 });

    expect(markup).toContain('class="level-value ">Lv 3');
    expect(markup).not.toContain("level-ready");
  });
});
