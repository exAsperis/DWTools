import type { AbilityScores, ConditionName, Conditions } from "./constants";

export const ABILITY_NAMES = [
  "Strength",
  "Dexterity",
  "Constitution",
  "Intelligence",
  "Wisdom",
  "Charisma",
] as const;

export const ABILITY_ABBREVIATIONS = [
  "STR",
  "DEX",
  "CON",
  "INT",
  "WIS",
  "CHA",
] as const;

export const CONDITION_NAMES: readonly ConditionName[] = [
  "weak",
  "shaky",
  "sick",
  "stunned",
  "confused",
  "scarred",
];

export const CONDITION_LABELS = [
  "Weak",
  "Shaky",
  "Sick",
  "Stunned",
  "Confused",
  "Scarred",
] as const;

export function abilityModifier(
  score: number | null | undefined,
): number | undefined {
  if (score === null || score === undefined) return undefined;
  if (score <= 3) return -3;
  if (score <= 5) return -2;
  if (score <= 8) return -1;
  if (score <= 12) return 0;
  if (score <= 15) return 1;
  if (score <= 17) return 2;
  return 3;
}

export function effectiveAbilityModifier(
  score: number | null | undefined,
  condition: -1 | undefined,
): number | undefined {
  const modifier = abilityModifier(score);
  return modifier === undefined ? undefined : modifier + (condition ?? 0);
}

export function formatModifier(modifier: number | undefined): string {
  if (modifier === undefined) return "—";
  return modifier >= 0 ? `+${modifier}` : String(modifier);
}

export function calculatedMaxHp(
  hpBase: number | undefined,
  constitution: number | null | undefined,
): number | undefined {
  return hpBase === undefined ||
    constitution === null ||
    constitution === undefined
    ? undefined
    : hpBase + constitution;
}

export function calculatedMaxLoad(
  loadBase: number | undefined,
  strength: number | null | undefined,
): number | undefined {
  const modifier = abilityModifier(strength);
  return loadBase === undefined || modifier === undefined
    ? undefined
    : loadBase + modifier;
}

export function isMaximumMismatch(
  entered: number | undefined,
  calculated: number | undefined,
): boolean {
  return calculated !== undefined && entered !== calculated;
}

export function shouldPromptForRecalculation(
  previousScoreValue: string,
  currentScoreValue: string,
  enteredMaximum: number | undefined,
  calculatedMaximum: number | undefined,
): boolean {
  return (
    previousScoreValue !== currentScoreValue &&
    isMaximumMismatch(enteredMaximum, calculatedMaximum)
  );
}

export function emptyScores(): AbilityScores {
  return [null, null, null, null, null, null];
}

export function compactScores(
  scores: AbilityScores,
): AbilityScores | undefined {
  return scores.every((score) => score === null) ? undefined : scores;
}

export function compactConditions(
  conditions: Conditions,
): Conditions | undefined {
  return Object.keys(conditions).length ? conditions : undefined;
}
