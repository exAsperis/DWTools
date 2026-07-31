import { evaluateRollExpression, isRollExpression } from "./rollExpression";

export type DamageMode = "sum" | "best" | "worst";

export interface DamageExpression {
  mode: DamageMode;
  count: number;
  sides: number;
  modifier: number;
}

export interface DamageResult extends DamageExpression {
  rolls: number[];
  subtotal: number;
  total: number;
}

const STANDARD = /^(?:(\d+))?d(\d+)([+-]\d+)?$/i;
const BEST_WORST = /^([bw])\[(\d+)d(\d+)\]([+-]\d+)?$/i;

export function normalizeDamageFormula(input: string): string {
  const trimmed = input.trim();
  if (!/^\d+$/.test(trimmed)) return input;
  const sides = Number(trimmed);
  return Number.isSafeInteger(sides) && sides > 0 ? `d${sides}` : input;
}

export function isDamageFormulaInvalid(input: string): boolean {
  return input.trim() !== "" && !isRollExpression(input);
}

export function parseDamage(input: string): DamageExpression | null {
  const compact = input.replace(/\s+/g, "");
  let match = compact.match(BEST_WORST);
  if (match) {
    const count = Number(match[2]);
    const sides = Number(match[3]);
    if (!isValidDice(count, sides)) return null;
    return {
      mode: match[1].toLowerCase() === "b" ? "best" : "worst",
      count,
      sides,
      modifier: Number(match[4] ?? 0),
    };
  }

  match = compact.match(STANDARD);
  if (!match) return null;
  const count = Number(match[1] ?? 1);
  const sides = Number(match[2]);
  if (!isValidDice(count, sides)) return null;
  return { mode: "sum", count, sides, modifier: Number(match[3] ?? 0) };
}

function isValidDice(count: number, sides: number): boolean {
  return (
    Number.isInteger(count) &&
    count >= 1 &&
    count <= 100 &&
    Number.isInteger(sides) &&
    sides >= 2 &&
    sides <= 1000
  );
}

export function rollDamage(
  expression: DamageExpression,
  random: () => number = Math.random,
): DamageResult {
  const rolls = Array.from(
    { length: expression.count },
    () => Math.floor(random() * expression.sides) + 1,
  );
  const subtotal =
    expression.mode === "best"
      ? Math.max(...rolls)
      : expression.mode === "worst"
        ? Math.min(...rolls)
        : rolls.reduce((sum, roll) => sum + roll, 0);
  return {
    ...expression,
    rolls,
    subtotal,
    total: subtotal + expression.modifier,
  };
}

export function formatDamageResult(
  source: string,
  result: DamageResult,
): string {
  const choice = result.mode === "sum" ? "sum" : result.mode;
  const modifier =
    result.modifier === 0
      ? ""
      : ` ${result.modifier > 0 ? "+" : "−"} ${Math.abs(result.modifier)}`;
  return `${source}: [${result.rolls.join(", ")}] ${choice}${modifier} = ${result.total}`;
}

export function rollDamageFormula(
  source: string,
  random: () => number = Math.random,
): string | null {
  const expression = parseDamage(source);
  if (expression)
    return formatDamageResult(source, rollDamage(expression, random));
  const result = evaluateRollExpression(source, random);
  return result.ok ? result.message : null;
}
