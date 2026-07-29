import type {
  AbilityScores,
  Conditions,
  CreatureData,
  CreatureFields,
} from "./constants";
import {
  compactConditions,
  compactScores,
  CONDITION_NAMES,
  emptyScores,
} from "./playerStats";

export function maximumHpAutofill(
  currentValue: string,
  maximumValue: string,
): string | null {
  if (maximumValue.trim() !== "" || currentValue.trim() === "") return null;
  const current = Number(currentValue);
  return Number.isFinite(current) && current >= 0 ? currentValue.trim() : null;
}

function optionalNumber(form: FormData, key: string): number | undefined {
  const raw = String(form.get(key) ?? "").trim();
  if (!raw) return undefined;
  const value = Number(raw);
  return Number.isFinite(value) ? Math.trunc(value) : undefined;
}

function optionalFiniteNumber(form: FormData, key: string): number | undefined {
  const raw = String(form.get(key) ?? "").trim();
  if (!raw) return undefined;
  const value = Number(raw);
  return Number.isFinite(value) ? value : undefined;
}

function optionalText(form: FormData, key: string): string | undefined {
  const value = String(form.get(key) ?? "").trim();
  return value || undefined;
}

export function readCreatureForm(
  form: FormData,
  current: CreatureData,
  hpOnly: boolean,
): CreatureData {
  const next: CreatureData = hpOnly ? { ...current } : {};
  next.hpCurrent = optionalNumber(form, "hpCurrent");
  next.hpMax = optionalNumber(form, "hpMax");
  if (hpOnly) return next;

  next.tags = optionalText(form, "tags");
  next.hpBase = optionalNumber(form, "hpBase");
  next.maxLoad = optionalFiniteNumber(form, "maxLoad");
  next.loadBase = optionalNumber(form, "loadBase");
  next.armor = optionalNumber(form, "armor");
  next.damage = optionalText(form, "damage");
  next.damageDescription = optionalText(form, "damageDescription");
  next.damageTags = optionalText(form, "damageTags");
  next.instinct = optionalText(form, "instinct");
  next.moves = optionalText(form, "moves");
  next.treasure = optionalText(form, "treasure");
  next.level = optionalNumber(form, "level");
  next.xp = optionalNumber(form, "xp");
  const scores: AbilityScores = emptyScores();
  for (let index = 0; index < scores.length; index += 1) {
    scores[index] = optionalFiniteNumber(form, `score-${index}`) ?? null;
  }
  next.scores = compactScores(scores);
  const conditions: Conditions = {};
  for (const condition of CONDITION_NAMES) {
    if (form.get(`condition-${condition}`) === "on") {
      conditions[condition] = -1;
    }
  }
  next.conditions = compactConditions(conditions);
  next.alignment = optionalText(form, "alignment");
  next.visibleToPlayers = form.get("visibleToPlayers") === "on";
  return next;
}

export function readCreatureFieldsForm(
  form: FormData,
  current: CreatureFields,
  hpOnly: boolean,
): CreatureFields {
  return {
    name: hpOnly ? current.name : String(form.get("name") ?? "").trim(),
    ...readCreatureForm(form, current, hpOnly),
  };
}
