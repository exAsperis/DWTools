import type { Item } from "@owlbear-rodeo/sdk";
import {
  CHARACTER_LINK_KEY,
  CREATURE_KEY,
  isCreatureData,
  type CreatureData,
  type CreatureFieldPatch,
  type CreatureFields,
} from "./constants";
import { normalizeDamageFormula } from "./damage";

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
  field: "hpCurrent" | "hpMax" | "armor",
): number | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new CreatureFieldValidationError(`${field} must be a number.`, field);
  }
  const normalized = Math.trunc(value);
  if (field === "hpMax" && normalized < 0) {
    throw new CreatureFieldValidationError(
      "Maximum HP cannot be negative.",
      field,
    );
  }
  return normalized;
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
): void {
  const normalized = normalizeCreatureFields(fields);
  draftItem.name = normalized.name;
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
): boolean {
  try {
    return (
      JSON.stringify(extractCreatureFields(item)) ===
      JSON.stringify(normalizeCreatureFields(fields))
    );
  } catch {
    return false;
  }
}
