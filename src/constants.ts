export const EXTENSION_ID = "com.ex-asperis.dwtools";
export const EXTENSION_VERSION = "1.3.3";
export const LEGACY_EXTENSION_ID = "com.bryan.dungeon-world-creatures";

export const CREATURE_KEY = `${EXTENSION_ID}/creature`;
export const DISPLAY_KEY = `${EXTENSION_ID}/display`;
export const EDIT_POPOVER_ID = `${EXTENSION_ID}/edit-popover`;
export const DEFAULT_OVERLAY_VISIBILITY_KEY = `${EXTENSION_ID}/default-overlay-visible`;
export const OVERWRITE_LABEL_ON_LINK_KEY = `${EXTENSION_ID}/overwrite-label-on-link`;
export const CHARACTER_KEY_PREFIX = `${EXTENSION_ID}/character/`;
export const CHARACTER_LINK_KEY = `${EXTENSION_ID}/character-link`;
export const CONTEXT_MENU_ID = `${EXTENSION_ID}/menu`;

export const LEGACY_CREATURE_KEY = `${LEGACY_EXTENSION_ID}/creature`;
export const LEGACY_DISPLAY_KEY = `${LEGACY_EXTENSION_ID}/display`;
export const LEGACY_DEFAULT_OVERLAY_VISIBILITY_KEY = `${LEGACY_EXTENSION_ID}/default-overlay-visible`;
export const LEGACY_CHARACTER_KEY_PREFIX = `${LEGACY_EXTENSION_ID}/character/`;
export const LEGACY_CHARACTER_LINK_KEY = `${LEGACY_EXTENSION_ID}/character-link`;
export const LEGACY_CONTEXT_MENU_ID = `${LEGACY_EXTENSION_ID}/menu`;

export type AbilityScores = [
  number | null,
  number | null,
  number | null,
  number | null,
  number | null,
  number | null,
];

export type ConditionName =
  "weak" | "shaky" | "sick" | "stunned" | "confused" | "scarred";

export type Conditions = Partial<Record<ConditionName, -1>>;

export interface CreatureData {
  tags?: string;
  hpCurrent?: number;
  hpMax?: number;
  hpBase?: number;
  maxLoad?: number;
  loadBase?: number;
  armor?: number;
  damage?: string;
  damageDescription?: string;
  damageTags?: string;
  instinct?: string;
  moves?: string;
  treasure?: string;
  level?: number;
  xp?: number;
  scores?: AbilityScores;
  conditions?: Conditions;
  alignment?: string;
  visibleToPlayers?: boolean;
}

export interface CreatureFields extends CreatureData {
  name: string;
}

export type CreatureFieldPatch = Partial<CreatureFields>;

export function isCreatureData(value: unknown): value is CreatureData {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
