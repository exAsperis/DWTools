import {
  DEFAULT_OVERLAY_VISIBILITY_KEY,
  isCreatureData,
  type CreatureData,
} from "./constants";

export type RoomMetadata = Record<string, unknown>;

export function getDefaultOverlayVisibility(metadata: RoomMetadata): boolean {
  const value = metadata[DEFAULT_OVERLAY_VISIBILITY_KEY];
  return typeof value === "boolean" ? value : true;
}

export function initializeCreatureData(
  raw: unknown,
  defaultVisibleToPlayers: boolean,
): CreatureData {
  return isCreatureData(raw)
    ? raw
    : { visibleToPlayers: defaultVisibleToPlayers };
}

export async function persistDefaultOverlayVisibility(
  setMetadata: (update: RoomMetadata) => Promise<void>,
  visibleToPlayers: boolean,
): Promise<void> {
  await setMetadata({
    [DEFAULT_OVERLAY_VISIBILITY_KEY]: visibleToPlayers,
  });
}
