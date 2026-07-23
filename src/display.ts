import OBR, { buildLabel, isLabel, type Item } from "@owlbear-rodeo/sdk";
import { CREATURE_KEY, DISPLAY_KEY, isCreatureData, type CreatureData } from "./constants";

export function buildDisplayText(data: CreatureData): string {
  const lines: string[] = [];
  if (data.hpCurrent !== undefined || data.hpMax !== undefined) {
    const current = data.hpCurrent ?? 0;
    const max = data.hpMax ?? 0;
    const percent = max > 0 ? Math.max(0, Math.min(1, current / max)) : 0;
    const filled = Math.round(percent * 10);
    lines.push(`HP ${current}/${max}  ${"█".repeat(filled)}${"░".repeat(10 - filled)}`);
  }
  const details: string[] = [];
  if (data.armor !== undefined) details.push(`ARM ${data.armor}`);
  if (data.damage) details.push(`DMG ${data.damage}`);
  if (details.length) lines.push(details.join("   "));
  return lines.join("\n");
}

function isDisplay(item: Item): boolean {
  return item.metadata[DISPLAY_KEY] === true;
}

export async function syncCreatureDisplay(token: Item, allItems?: Item[]): Promise<void> {
  const raw = token.metadata[CREATURE_KEY];
  const data = isCreatureData(raw) ? raw : {};
  const text = buildDisplayText(data);
  const items = allItems ?? await OBR.scene.items.getItems();
  const displays = items.filter((item) => isDisplay(item) && item.attachedTo === token.id);

  if (!text) {
    if (displays.length) await OBR.scene.items.deleteItems(displays.map((item) => item.id));
    return;
  }

  const renderKey = JSON.stringify({ text });
  const primary = displays[0];
  if (primary) {
    if (primary.metadata[`${DISPLAY_KEY}/render`] !== renderKey) {
      await OBR.scene.items.updateItems([primary], (draft) => {
        const label = draft[0];
        if (isLabel(label)) {
          label.text.plainText = text;
          label.metadata[`${DISPLAY_KEY}/render`] = renderKey;
        }
      });
    }
    if (displays.length > 1) {
      await OBR.scene.items.deleteItems(displays.slice(1).map((item) => item.id));
    }
    return;
  }

  const bounds = await OBR.scene.items.getItemBounds([token.id]);
  const label = buildLabel()
    .name("Dungeon World creature stats")
    .plainText(text)
    .position({ x: bounds.center.x, y: bounds.max.y + 12 })
    .attachedTo(token.id)
    .layer("ATTACHMENT")
    .locked(true)
    .disableHit(true)
    .metadata({ [DISPLAY_KEY]: true, [`${DISPLAY_KEY}/render`]: renderKey })
    .backgroundColor("#18181b")
    .backgroundOpacity(0.9)
    .cornerRadius(6)
    .fontSize(15)
    .fontWeight(700)
    .textAlign("CENTER")
    .fillColor("#fafafa")
    .build();
  await OBR.scene.items.addItems([label]);
}

export async function syncAllDisplays(items?: Item[]): Promise<void> {
  const sceneItems = items ?? await OBR.scene.items.getItems();
  const tokens = sceneItems.filter(
    (item) => item.layer === "CHARACTER" && isCreatureData(item.metadata[CREATURE_KEY]),
  );
  for (const token of tokens) await syncCreatureDisplay(token, sceneItems);
}
