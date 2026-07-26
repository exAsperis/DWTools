import type { CreatureData } from "./constants";

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
  next.armor = optionalNumber(form, "armor");
  next.damage = optionalText(form, "damage");
  next.damageDescription = optionalText(form, "damageDescription");
  next.damageTags = optionalText(form, "damageTags");
  next.instinct = optionalText(form, "instinct");
  next.moves = optionalText(form, "moves");
  next.treasure = optionalText(form, "treasure");
  next.visibleToPlayers = form.get("visibleToPlayers") === "on";
  return next;
}
