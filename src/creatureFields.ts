import { isImage, type Item } from "@owlbear-rodeo/sdk";
import {
  CHARACTER_LINK_KEY,
  CREATURE_KEY,
  isCreatureData,
  type CreatureData,
  type CreatureFieldPatch,
  type CreatureFields,
  type AbilityScores,
  type Conditions,
} from "./constants";
import { normalizeDamageFormula } from "./damage";
import {
  compactConditions,
  compactScores,
  CONDITION_NAMES,
} from "./playerStats";

export const CHARACTER_LINK_SCHEMA_VERSION = 1;

export interface CharacterLink {
  schemaVersion: typeof CHARACTER_LINK_SCHEMA_VERSION;
  characterId: string;
}

export class CreatureFieldValidationError extends Error {
  readonly code = "VALIDATION";

  constructor(
    message: string,
    readonly field?: keyof CreatureFields,
  ) {
    super(message);
    this.name = "CreatureFieldValidationError";
  }
}

const TEXT_LIMITS = {
  name: 120,
  tags: 160,
  damage: 40,
  damageDescription: 80,
  damageTags: 160,
  instinct: 2_000,
  moves: 6_000,
  treasure: 2_000,
  alignment: 120,
} satisfies Partial<Record<keyof CreatureFields, number>>;

function normalizeOptionalText(
  value: unknown,
  field: keyof typeof TEXT_LIMITS,
): string | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== "string") {
    throw new CreatureFieldValidationError(`${field} must be text.`, field);
  }
  const normalized = value.trim();
  if (!normalized) return undefined;
  const limit = TEXT_LIMITS[field];
  if (normalized.length > limit) {
    throw new CreatureFieldValidationError(
      `${field} must be ${limit} characters or fewer.`,
      field,
    );
  }
  return normalized;
}

function normalizeOptionalInteger(
  value: unknown,
  field:
    "hpCurrent" | "hpMax" | "hpBase" | "loadBase" | "armor" | "level" | "xp",
): number | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new CreatureFieldValidationError(`${field} must be a number.`, field);
  }
  if (
    ["hpBase", "loadBase", "level", "xp"].includes(field) &&
    !Number.isInteger(value)
  ) {
    throw new CreatureFieldValidationError(
      `${field} must be a whole number.`,
      field,
    );
  }
  const normalized = Math.trunc(value);
  if (["hpMax", "hpBase", "loadBase", "xp"].includes(field) && normalized < 0) {
    throw new CreatureFieldValidationError(
      `${field} cannot be negative.`,
      field,
    );
  }
  if (field === "level" && (normalized < 1 || normalized > 10)) {
    throw new CreatureFieldValidationError(
      "Level must be between 1 and 10.",
      field,
    );
  }
  return normalized;
}

function normalizeOptionalMaxLoad(value: unknown): number | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    throw new CreatureFieldValidationError(
      "Maximum Load must be a nonnegative number.",
      "maxLoad",
    );
  }
  return value;
}

function normalizeScores(value: unknown): AbilityScores | undefined {
  if (value === undefined || value === null) return undefined;
  if (!Array.isArray(value) || value.length !== 6) {
    throw new CreatureFieldValidationError(
      "Scores must contain STR, DEX, CON, INT, WIS, and CHA.",
      "scores",
    );
  }
  const scores = value.map((score) => {
    if (score === null) return null;
    if (
      typeof score !== "number" ||
      !Number.isInteger(score) ||
      score < 3 ||
      score > 18
    ) {
      throw new CreatureFieldValidationError(
        "Each ability score must be a whole number between 3 and 18.",
        "scores",
      );
    }
    return score;
  }) as AbilityScores;
  return compactScores(scores);
}

function normalizeConditions(value: unknown): Conditions | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== "object" || Array.isArray(value)) {
    throw new CreatureFieldValidationError(
      "Conditions must be key/value pairs.",
      "conditions",
    );
  }
  const source = value as Record<string, unknown>;
  if (
    Object.keys(source).some((key) => !CONDITION_NAMES.includes(key as never))
  ) {
    throw new CreatureFieldValidationError(
      "Conditions contain an unknown key.",
      "conditions",
    );
  }
  const conditions: Conditions = {};
  for (const condition of CONDITION_NAMES) {
    const conditionValue = source[condition];
    if (conditionValue === undefined) continue;
    if (conditionValue !== -1) {
      throw new CreatureFieldValidationError(
        `${condition} must be -1 when active.`,
        "conditions",
      );
    }
    conditions[condition] = -1;
  }
  return compactConditions(conditions);
}

export function normalizeCreatureData(value: unknown): CreatureData {
  const source = isCreatureData(value) ? value : {};
  const damage = normalizeOptionalText(source.damage, "damage");
  const normalizedDamage =
    damage === undefined ? undefined : normalizeDamageFormula(damage);
  if (
    source.visibleToPlayers !== undefined &&
    typeof source.visibleToPlayers !== "boolean"
  ) {
    throw new CreatureFieldValidationError(
      "Overlay visibility must be true or false.",
      "visibleToPlayers",
    );
  }

  return compactCreatureData({
    tags: normalizeOptionalText(source.tags, "tags"),
    hpCurrent: normalizeOptionalInteger(source.hpCurrent, "hpCurrent"),
    hpMax: normalizeOptionalInteger(source.hpMax, "hpMax"),
    hpBase: normalizeOptionalInteger(source.hpBase, "hpBase"),
    maxLoad: normalizeOptionalMaxLoad(source.maxLoad),
    loadBase: normalizeOptionalInteger(source.loadBase, "loadBase"),
    armor: normalizeOptionalInteger(source.armor, "armor"),
    damage: normalizedDamage,
    damageDescription: normalizeOptionalText(
      source.damageDescription,
      "damageDescription",
    ),
    damageTags: normalizeOptionalText(source.damageTags, "damageTags"),
    instinct: normalizeOptionalText(source.instinct, "instinct"),
    moves: normalizeOptionalText(source.moves, "moves"),
    treasure: normalizeOptionalText(source.treasure, "treasure"),
    level: normalizeOptionalInteger(source.level, "level"),
    xp: normalizeOptionalInteger(source.xp, "xp"),
    scores: normalizeScores(source.scores),
    conditions: normalizeConditions(source.conditions),
    alignment: normalizeOptionalText(source.alignment, "alignment"),
    visibleToPlayers: source.visibleToPlayers,
  });
}

function compactCreatureData(data: CreatureData): CreatureData {
  return Object.fromEntries(
    Object.entries(data).filter(([, value]) => value !== undefined),
  ) as CreatureData;
}

export function normalizeCreatureFields(value: unknown): CreatureFields {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new CreatureFieldValidationError(
      "Character fields must be an object.",
    );
  }
  const source = value as Partial<CreatureFields>;
  if (typeof source.name !== "string") {
    throw new CreatureFieldValidationError(
      "Character name must be text.",
      "name",
    );
  }
  const name = source.name.trim();
  if (!name) {
    throw new CreatureFieldValidationError(
      "Character name is required.",
      "name",
    );
  }
  if (name.length > TEXT_LIMITS.name) {
    throw new CreatureFieldValidationError(
      `Character name must be ${TEXT_LIMITS.name} characters or fewer.`,
      "name",
    );
  }
  return {
    name,
    ...normalizeCreatureData(source),
  };
}

export function mergeCreatureFieldPatch(
  current: CreatureFields,
  patch: CreatureFieldPatch,
): CreatureFields {
  return normalizeCreatureFields({ ...current, ...patch });
}

export function extractCreatureFields(item: Item): CreatureFields {
  return normalizeCreatureFields({
    name: item.name.trim() || "Unnamed character",
    ...normalizeCreatureData(item.metadata[CREATURE_KEY]),
  });
}

export function applyCreatureFieldsToItem(
  draftItem: Item,
  fields: CreatureFields,
  overwriteName = true,
): void {
  const normalized = normalizeCreatureFields(fields);
  if (overwriteName) {
    draftItem.name = normalized.name;
    if (isImage(draftItem)) {
      draftItem.text.plainText = normalized.name;
      draftItem.text.richText = [
        {
          type: "paragraph",
          children: [{ text: normalized.name }],
        },
      ];
    }
  }
  draftItem.metadata[CREATURE_KEY] = normalizeCreatureData(normalized);
}

export function getCharacterLink(item: Item): CharacterLink | undefined {
  const value = item.metadata[CHARACTER_LINK_KEY];
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return undefined;
  }
  const link = value as Partial<CharacterLink>;
  return link.schemaVersion === CHARACTER_LINK_SCHEMA_VERSION &&
    typeof link.characterId === "string" &&
    link.characterId.trim() !== ""
    ? {
        schemaVersion: CHARACTER_LINK_SCHEMA_VERSION,
        characterId: link.characterId,
      }
    : undefined;
}

export function setCharacterLink(draftItem: Item, characterId: string): void {
  if (!characterId.trim()) {
    throw new CreatureFieldValidationError("Character ID is required.");
  }
  draftItem.metadata[CHARACTER_LINK_KEY] = {
    schemaVersion: CHARACTER_LINK_SCHEMA_VERSION,
    characterId,
  } satisfies CharacterLink;
}

export function removeCharacterLink(draftItem: Item): void {
  delete draftItem.metadata[CHARACTER_LINK_KEY];
}

export function creatureFieldsEqual(
  item: Item,
  fields: CreatureFields,
  includeName = true,
): boolean {
  try {
    const itemFields = extractCreatureFields(item);
    const normalizedFields = normalizeCreatureFields(fields);
    if (!includeName) {
      itemFields.name = normalizedFields.name;
    }
    return JSON.stringify(itemFields) === JSON.stringify(normalizedFields);
  } catch {
    return false;
  }
}
