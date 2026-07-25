import OBR, { buildLabel, buildShape, type Item } from "@owlbear-rodeo/sdk";
import { CREATURE_KEY, DISPLAY_KEY, isCreatureData, type CreatureData } from "./constants";

const DISPLAY_RENDER_KEY = `${DISPLAY_KEY}/render`;

function isDisplay(item: Item): boolean {
  return item.metadata[DISPLAY_KEY] === true;
}

function hpColor(percent: number): string {
  if (percent > 0.5) return "#15803d";
  if (percent > 0.25) return "#b45309";
  return "#b91c1c";
}

function metadata(role: string, renderKey: string) {
  return { [DISPLAY_KEY]: true, [`${DISPLAY_KEY}/role`]: role, [DISPLAY_RENDER_KEY]: renderKey };
}

function common<T extends ReturnType<typeof buildLabel> | ReturnType<typeof buildShape>>(
  builder: T,
  token: Item,
  visible: boolean,
): T {
  return builder
    .attachedTo(token.id)
    .layer("ATTACHMENT")
    .locked(true)
    .disableHit(true)
    .disableAttachmentBehavior(["SCALE"])
    .visible(visible) as T;
}

function label(
  token: Item,
  role: string,
  renderKey: string,
  text: string,
  x: number,
  y: number,
  fontSize: number,
  visible: boolean,
  backgroundOpacity = 0.82,
) {
  // Owlbear labels are positioned by the tip of their bottom pointer rather
  // than by their visual center. With a zero-height pointer, offset the anchor
  // by half the label body so the requested y coordinate remains its center.
  const labelBodyHeight = fontSize * 1.64;

  return common(buildLabel(), token, visible)
    .name(`DWTools ${role}`)
    .position({ x, y: y + labelBodyHeight / 2 })
    .plainText(text)
    .padding(fontSize * 0.22)
    .fontSize(fontSize)
    .fontWeight(700)
    .textAlign("CENTER")
    .textAlignVertical("MIDDLE")
    .fillColor("#ffffff")
    .strokeColor("#000000")
    .strokeOpacity(0.45)
    .strokeWidth(Math.max(0.5, fontSize * 0.055))
    .backgroundColor("#18181b")
    .backgroundOpacity(backgroundOpacity)
    .cornerRadius(fontSize * 0.35)
    .pointerWidth(0)
    .pointerHeight(0)
    .minViewScale(1)
    .maxViewScale(1)
    .metadata(metadata(role, renderKey))
    .build();
}

function shape(
  token: Item,
  role: string,
  renderKey: string,
  x: number,
  y: number,
  width: number,
  height: number,
  color: string,
  visible: boolean,
) {
  return common(buildShape(), token, visible)
    .name(`DWTools ${role}`)
    .position({ x, y })
    .width(width)
    .height(height)
    .shapeType("RECTANGLE")
    .fillColor(color)
    .fillOpacity(0.92)
    .strokeOpacity(0)
    .metadata(metadata(role, renderKey))
    .build();
}

function buildOverlayItems(
  token: Item,
  data: CreatureData,
  bounds: { min: { x: number; y: number }; max: { x: number; y: number }; center: { x: number; y: number } },
  renderKey: string,
): Item[] {
  const tokenWidth = Math.max(40, bounds.max.x - bounds.min.x);
  const width = tokenWidth * 0.84;
  const fontSize = width * 0.095;
  const rowHeight = fontSize * 1.55;
  const hpHeight = fontSize * 1.4;
  const gap = width * 0.025;
  const bottomInset = width * 0.07;
  const hpY = bounds.max.y - bottomInset - hpHeight / 2;
  const hpTop = hpY - hpHeight / 2;
  const rowY = hpY - hpHeight / 2 - gap - rowHeight / 2;
  const visible = data.visibleToPlayers !== false;
  const hpPercent = data.hpMax && data.hpMax > 0
    ? Math.max(0, Math.min(1, (data.hpCurrent ?? 0) / data.hpMax))
    : 0;
  const fillWidth = width * hpPercent;
  const left = bounds.center.x - width / 2;

  return [
    label(token, "visibility", renderKey, visible ? "◉" : "⊘", left + width * 0.09, rowY, fontSize, visible),
    label(token, "armor", renderKey, `◆${data.armor ?? "—"}`, left + width * 0.31, rowY, fontSize, visible),
    label(token, "damage", renderKey, `⚄${data.damage ?? "—"}`, left + width * 0.67, rowY, fontSize * 0.9, visible),
    shape(token, "hp-bg", renderKey, left, hpTop, width, hpHeight, "#27272a", visible),
    ...(fillWidth > 0
      ? [shape(token, "hp-fill", renderKey, left, hpTop, fillWidth, hpHeight, hpColor(hpPercent), visible)]
      : []),
    label(
      token,
      "hp",
      renderKey,
      `${data.hpCurrent ?? "—"}/${data.hpMax ?? "—"}`,
      bounds.center.x,
      hpY,
      fontSize,
      visible,
      0,
    ),
  ];
}

export async function syncCreatureDisplay(token: Item, allItems?: Item[]): Promise<void> {
  const raw = token.metadata[CREATURE_KEY];
  const data = isCreatureData(raw) ? raw : {};
  const hasData = data.hpCurrent !== undefined || data.hpMax !== undefined
    || data.armor !== undefined || Boolean(data.damage);
  const items = allItems ?? await OBR.scene.items.getItems();
  const displays = items.filter((item) => isDisplay(item) && item.attachedTo === token.id);

  if (!hasData) {
    if (displays.length) await OBR.scene.items.deleteItems(displays.map((item) => item.id));
    return;
  }

  const renderKey = JSON.stringify({
    layout: 6,
    hpCurrent: data.hpCurrent,
    hpMax: data.hpMax,
    armor: data.armor,
    damage: data.damage,
    visibleToPlayers: data.visibleToPlayers !== false,
    tokenScale: token.scale,
  });
  const expected = (data.hpMax ?? 0) > 0 && (data.hpCurrent ?? 0) > 0 ? 6 : 5;
  if (displays.length === expected && displays.every((item) => item.metadata[DISPLAY_RENDER_KEY] === renderKey)) return;

  if (displays.length) await OBR.scene.items.deleteItems(displays.map((item) => item.id));
  const bounds = await OBR.scene.items.getItemBounds([token.id]);
  await OBR.scene.items.addItems(buildOverlayItems(token, data, bounds, renderKey));
}

export async function syncAllDisplays(items?: Item[]): Promise<void> {
  const sceneItems = items ?? await OBR.scene.items.getItems();
  const tokens = sceneItems.filter(
    (item) => item.layer === "CHARACTER" && isCreatureData(item.metadata[CREATURE_KEY]),
  );
  for (const token of tokens) await syncCreatureDisplay(token, sceneItems);
}
