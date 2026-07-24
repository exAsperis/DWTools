import OBR, { buildShape, buildText, type Item } from "@owlbear-rodeo/sdk";
import { CREATURE_KEY, DISPLAY_KEY, isCreatureData, type CreatureData } from "./constants";

type OverlayRole =
  | "visibility-bg"
  | "visibility"
  | "armor-bg"
  | "armor"
  | "damage-bg"
  | "damage"
  | "hp-bg"
  | "hp-fill"
  | "hp";

const DISPLAY_ROLE_KEY = `${DISPLAY_KEY}/role`;
const DISPLAY_RENDER_KEY = `${DISPLAY_KEY}/render`;

function isDisplay(item: Item): boolean {
  return item.metadata[DISPLAY_KEY] === true;
}

function hpColor(percent: number): string {
  if (percent > 0.5) return "#15803d";
  if (percent > 0.25) return "#b45309";
  return "#b91c1c";
}

function overlayMetadata(role: OverlayRole, renderKey: string) {
  return {
    [DISPLAY_KEY]: true,
    [DISPLAY_ROLE_KEY]: role,
    [DISPLAY_RENDER_KEY]: renderKey,
  };
}

function overlayBase<T extends ReturnType<typeof buildShape> | ReturnType<typeof buildText>>(
  builder: T,
  token: Item,
  visible: boolean,
  layer: "ATTACHMENT" | "TEXT",
): T {
  return builder
    .attachedTo(token.id)
    .layer(layer)
    .locked(true)
    .disableHit(true)
    .disableAttachmentBehavior(["SCALE"])
    .visible(visible) as T;
}

function buildBackground(
  token: Item,
  role: OverlayRole,
  renderKey: string,
  position: { x: number; y: number },
  width: number,
  height: number,
  visible: boolean,
  color = "#18181b",
  opacity = 0.82,
) {
  return overlayBase(buildShape(), token, visible, "ATTACHMENT")
    .name(`DWTools ${role}`)
    .position(position)
    .width(width)
    .height(height)
    .shapeType("RECTANGLE")
    .fillColor(color)
    .fillOpacity(opacity)
    .strokeOpacity(0)
    .metadata(overlayMetadata(role, renderKey))
    .build();
}

function buildOverlayText(
  token: Item,
  role: OverlayRole,
  renderKey: string,
  text: string,
  position: { x: number; y: number },
  width: number,
  height: number,
  fontSize: number,
  visible: boolean,
) {
  return overlayBase(buildText(), token, visible, "TEXT")
    .name(`DWTools ${role}`)
    .position(position)
    .plainText(text)
    .width(width)
    .height(height)
    .padding(0)
    .fontSize(fontSize)
    .fontWeight(700)
    .textAlign("CENTER")
    .textAlignVertical("MIDDLE")
    .fillColor("#ffffff")
    .strokeColor("#000000")
    .strokeOpacity(0.45)
    .strokeWidth(Math.max(0.5, fontSize * 0.055))
    .metadata(overlayMetadata(role, renderKey))
    .build();
}

function buildOverlayItems(
  token: Item,
  data: CreatureData,
  bounds: { min: { x: number; y: number }; max: { x: number; y: number }; center: { x: number; y: number } },
  renderKey: string,
): Item[] {
  const tokenWidth = Math.max(40, bounds.max.x - bounds.min.x);
  const overlayWidth = tokenWidth * 0.86;
  const gap = overlayWidth * 0.018;
  const rowHeight = overlayWidth * 0.15;
  const hpHeight = overlayWidth * 0.13;
  const fontSize = overlayWidth * 0.105;
  const left = bounds.center.x - overlayWidth / 2;
  const bottomInset = overlayWidth * 0.07;
  const hpY = bounds.max.y - bottomInset - hpHeight / 2;
  const rowY = hpY - hpHeight / 2 - gap - rowHeight / 2;
  const visible = data.visibleToPlayers !== false;

  const eyeWidth = overlayWidth * 0.19;
  const armorWidth = overlayWidth * 0.25;
  const damageWidth = overlayWidth - eyeWidth - armorWidth - gap * 2;
  const eyeX = left + eyeWidth / 2;
  const armorX = left + eyeWidth + gap + armorWidth / 2;
  const damageX = left + eyeWidth + gap + armorWidth + gap + damageWidth / 2;
  const hpPercent = data.hpMax && data.hpMax > 0
    ? Math.max(0, Math.min(1, (data.hpCurrent ?? 0) / data.hpMax))
    : 0;
  const fillWidth = overlayWidth * hpPercent;
  const fillX = left + fillWidth / 2;

  const armorText = `◆${data.armor ?? "—"}`;
  const damageText = `⚄${data.damage ?? "—"}`;
  const hpText = `${data.hpCurrent ?? "—"}/${data.hpMax ?? "—"}`;

  return [
    buildBackground(token, "visibility-bg", renderKey, { x: eyeX, y: rowY }, eyeWidth, rowHeight, visible),
    buildOverlayText(token, "visibility", renderKey, visible ? "◉" : "⊘", { x: eyeX, y: rowY }, eyeWidth, rowHeight, fontSize, visible),
    buildBackground(token, "armor-bg", renderKey, { x: armorX, y: rowY }, armorWidth, rowHeight, visible),
    buildOverlayText(token, "armor", renderKey, armorText, { x: armorX, y: rowY }, armorWidth, rowHeight, fontSize, visible),
    buildBackground(token, "damage-bg", renderKey, { x: damageX, y: rowY }, damageWidth, rowHeight, visible),
    buildOverlayText(token, "damage", renderKey, damageText, { x: damageX, y: rowY }, damageWidth, rowHeight, fontSize * 0.9, visible),
    buildBackground(token, "hp-bg", renderKey, { x: bounds.center.x, y: hpY }, overlayWidth, hpHeight, visible, "#27272a", 0.88),
    ...(fillWidth > 0
      ? [buildBackground(token, "hp-fill", renderKey, { x: fillX, y: hpY }, fillWidth, hpHeight, visible, hpColor(hpPercent), 0.96)]
      : []),
    buildOverlayText(token, "hp", renderKey, hpText, { x: bounds.center.x, y: hpY }, overlayWidth, hpHeight, fontSize, visible),
  ];
}

export async function syncCreatureDisplay(token: Item, allItems?: Item[]): Promise<void> {
  const raw = token.metadata[CREATURE_KEY];
  const data = isCreatureData(raw) ? raw : {};
  const hasDisplayData = data.hpCurrent !== undefined
    || data.hpMax !== undefined
    || data.armor !== undefined
    || Boolean(data.damage);
  const items = allItems ?? await OBR.scene.items.getItems();
  const displays = items.filter((item) => isDisplay(item) && item.attachedTo === token.id);

  if (!hasDisplayData) {
    if (displays.length) await OBR.scene.items.deleteItems(displays.map((item) => item.id));
    return;
  }

  const renderKey = JSON.stringify({
    layout: 3,
    hpCurrent: data.hpCurrent,
    hpMax: data.hpMax,
    armor: data.armor,
    damage: data.damage,
    visibleToPlayers: data.visibleToPlayers !== false,
    tokenScale: token.scale,
  });
  const currentRoles = new Set(displays.map((item) => item.metadata[DISPLAY_ROLE_KEY]));
  const expectedRoleCount = (data.hpMax ?? 0) > 0 && (data.hpCurrent ?? 0) > 0 ? 9 : 8;
  const isCurrent = displays.length === expectedRoleCount
    && currentRoles.has("hp")
    && displays.every((item) => item.metadata[DISPLAY_RENDER_KEY] === renderKey);
  if (isCurrent) return;

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
