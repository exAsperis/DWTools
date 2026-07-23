export const EXTENSION_ID = "com.bryan.dungeon-world-creatures";
export const CREATURE_KEY = `${EXTENSION_ID}/creature`;
export const DISPLAY_KEY = `${EXTENSION_ID}/display`;
export const EDIT_POPOVER_ID = `${EXTENSION_ID}/edit-popover`;

export interface CreatureData {
  hpCurrent?: number;
  hpMax?: number;
  armor?: number;
  damage?: string;
  instinct?: string;
  moves?: string;
  treasure?: string;
}

export function isCreatureData(value: unknown): value is CreatureData {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
