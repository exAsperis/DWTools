import { OVERWRITE_LABEL_ON_LINK_KEY } from "./constants";
import type { RoomMetadata } from "./defaultVisibility";

export function getOverwriteLabelOnLink(metadata: RoomMetadata): boolean {
  const value = metadata[OVERWRITE_LABEL_ON_LINK_KEY];
  return typeof value === "boolean" ? value : true;
}

export async function persistOverwriteLabelOnLink(
  setMetadata: (update: RoomMetadata) => Promise<void>,
  overwriteLabel: boolean,
): Promise<void> {
  await setMetadata({
    [OVERWRITE_LABEL_ON_LINK_KEY]: overwriteLabel,
  });
}
