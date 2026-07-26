export const EXTENSION_ID = "com.bryan.dungeon-world-creatures";
export const CREATURE_KEY = `${EXTENSION_ID}/creature`;
export const DISPLAY_KEY = `${EXTENSION_ID}/display`;
export const EDIT_POPOVER_ID = `${EXTENSION_ID}/edit-popover`;
export const DEFAULT_OVERLAY_VISIBILITY_KEY = `${EXTENSION_ID}/default-overlay-visible`;

export interface CreatureData {
  tags?: string;
  hpCurrent?: number;
  hpMax?: number;
  armor?: number;
  damage?: string;
  damageDescription?: string;
  damageTags?: string;
  instinct?: string;
  moves?: string;
  treasure?: string;
  visibleToPlayers?: boolean;
}

export function isCreatureData(value: unknown): value is CreatureData {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
