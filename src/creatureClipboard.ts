import {
  EXTENSION_ID,
  type CreatureData,
  type CreatureFields,
} from "./constants";
import {
  normalizeCreatureData,
  normalizeCreatureFields,
} from "./creatureFields";

export const CREATURE_CLIPBOARD_STORAGE_KEY = `${EXTENSION_ID}/creature-clipboard`;
const CREATURE_CLIPBOARD_SCHEMA_VERSION = 1;

export interface CreatureClipboardPayload {
  schemaVersion: typeof CREATURE_CLIPBOARD_SCHEMA_VERSION;
  sourceName: string;
  copiedAt: string;
  data: CreatureData;
}

export interface ClipboardStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export function createCreatureClipboardPayload(
  data: unknown,
  sourceName: string,
  copiedAt = new Date().toISOString(),
): CreatureClipboardPayload {
  const normalizedName = sourceName.trim();
  if (!normalizedName) throw new Error("The copied token must have a name.");
  if (!Number.isFinite(Date.parse(copiedAt))) {
    throw new Error("The copied-data timestamp is invalid.");
  }
  return {
    schemaVersion: CREATURE_CLIPBOARD_SCHEMA_VERSION,
    sourceName: normalizedName,
    copiedAt,
    data: normalizeCreatureData(data),
  };
}

export function writeCreatureClipboard(
  storage: ClipboardStorage,
  payload: CreatureClipboardPayload,
): void {
  storage.setItem(CREATURE_CLIPBOARD_STORAGE_KEY, JSON.stringify(payload));
}

export function readCreatureClipboard(
  storage: ClipboardStorage,
): CreatureClipboardPayload | undefined {
  try {
    const stored = storage.getItem(CREATURE_CLIPBOARD_STORAGE_KEY);
    if (stored === null) return undefined;
    const value = JSON.parse(stored) as Partial<CreatureClipboardPayload>;
    if (
      value.schemaVersion !== CREATURE_CLIPBOARD_SCHEMA_VERSION ||
      typeof value.sourceName !== "string" ||
      typeof value.copiedAt !== "string"
    ) {
      throw new Error("Unsupported creature clipboard.");
    }
    return createCreatureClipboardPayload(
      value.data,
      value.sourceName,
      value.copiedAt,
    );
  } catch {
    try {
      storage.removeItem(CREATURE_CLIPBOARD_STORAGE_KEY);
    } catch {
      // Storage can be unavailable in privacy-restricted browser contexts.
    }
    return undefined;
  }
}

export function creatureFieldsFromClipboard(
  targetName: string,
  payload: CreatureClipboardPayload,
): CreatureFields {
  return normalizeCreatureFields({
    name: targetName,
    ...payload.data,
  });
}

export function clearCreatureClipboard(storage: ClipboardStorage): void {
  storage.removeItem(CREATURE_CLIPBOARD_STORAGE_KEY);
}
