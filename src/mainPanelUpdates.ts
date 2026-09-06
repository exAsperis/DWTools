import { isImage, type Item } from "@owlbear-rodeo/sdk";
import type { LinkedTokenPreview } from "./characterService";
import { getCharacterLink } from "./creatureFields";
import { encounterItems, type EncounterItem } from "./encounter";

export function updateDisclosureState(
  expanded: Set<string>,
  id: string | undefined,
  open: boolean,
  connected: boolean,
): void {
  if (!connected || !id) return;
  if (open) expanded.add(id);
  else expanded.delete(id);
}

export function visibleRefreshLoadingState(
  current: boolean,
  render: boolean,
  loading: boolean,
): boolean {
  return render ? loading : current;
}

function stableSerialize(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map(stableSerialize).join(",")}]`;
  }
  if (typeof value === "object" && value !== null) {
    return `{${Object.entries(value)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, entry]) => `${JSON.stringify(key)}:${stableSerialize(entry)}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

export function encounterPanelSignature(items: EncounterItem[]): string {
  return stableSerialize(
    items.map(({ id, itemText, itemName, imageUrl, data }) => ({
      id,
      itemText,
      itemName,
      imageUrl,
      data,
    })),
  );
}

export function linkedTokenPanelSignature(
  previews: ReadonlyMap<string, LinkedTokenPreview[]>,
): string {
  return stableSerialize(
    [...previews.entries()].sort(([left], [right]) =>
      left.localeCompare(right),
    ),
  );
}

export function scenePanelSignatures(items: Item[]): {
  encounter: string;
  linkedTokens: string;
} {
  const linkedTokens = new Map<string, LinkedTokenPreview[]>();
  for (const item of items) {
    const link = getCharacterLink(item);
    if (!link) continue;
    const previews = linkedTokens.get(link.characterId) ?? [];
    previews.push({
      id: item.id,
      name: item.name.trim() || "Linked token",
      imageUrl: isImage(item) ? item.image.url : "",
    });
    linkedTokens.set(link.characterId, previews);
  }
  return {
    encounter: encounterPanelSignature(encounterItems(items)),
    linkedTokens: linkedTokenPanelSignature(linkedTokens),
  };
}
