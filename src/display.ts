import OBR, { buildImage, type Item } from "@owlbear-rodeo/sdk";
import { CREATURE_KEY, DISPLAY_KEY, isCreatureData, type CreatureData } from "./constants";

const DISPLAY_RENDER_KEY = `${DISPLAY_KEY}/render`;
const SVG_WIDTH = 860;
const SVG_HEIGHT = 245;

function isDisplay(item: Item): boolean {
  return item.metadata[DISPLAY_KEY] === true;
}

function hpColor(percent: number): string {
  if (percent > 0.5) return "#15803d";
  if (percent > 0.25) return "#b45309";
  return "#b91c1c";
}

function escapeXml(value: string | number | undefined): string {
  if (value === undefined || value === "") return "—";
  return String(value).replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&apos;",
    '"': "&quot;",
  })[character]!);
}

function buildOverlaySvg(data: CreatureData): string {
  const hpPercent = data.hpMax && data.hpMax > 0
    ? Math.max(0, Math.min(1, (data.hpCurrent ?? 0) / data.hpMax))
    : 0;
  const fillWidth = Math.round(SVG_WIDTH * hpPercent);
  const visible = data.visibleToPlayers !== false;
  const armor = escapeXml(data.armor);
  const damage = escapeXml(data.damage);
  const hp = `${escapeXml(data.hpCurrent)}/${escapeXml(data.hpMax)}`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${SVG_WIDTH}" height="${SVG_HEIGHT}" viewBox="0 0 ${SVG_WIDTH} ${SVG_HEIGHT}">
  <g font-family="Arial,Helvetica,sans-serif" font-weight="700" fill="#fff">
    <rect x="0" y="0" width="150" height="120" rx="28" fill="#18181b" fill-opacity=".82"/>
    <rect x="165" y="0" width="200" height="120" rx="28" fill="#18181b" fill-opacity=".82"/>
    <rect x="380" y="0" width="480" height="120" rx="28" fill="#18181b" fill-opacity=".82"/>
    ${visible
      ? '<path d="M30 60c25-34 65-34 90 0-25 34-65 34-90 0Z" fill="none" stroke="#fff" stroke-width="10"/><circle cx="75" cy="60" r="17"/>'
      : '<path d="M30 60c25-34 65-34 90 0-25 34-65 34-90 0Z" fill="none" stroke="#fff" stroke-width="10"/><path d="M24 18l102 84" stroke="#fff" stroke-width="12" stroke-linecap="round"/>'}
    <path d="M207 25h116v45c0 28-22 45-58 58-36-13-58-30-58-58Z" fill="none" stroke="#fff" stroke-width="9"/>
    <text x="265" y="72" text-anchor="middle" dominant-baseline="middle" font-size="50">${armor}</text>
    <rect x="415" y="25" width="72" height="72" rx="14" fill="none" stroke="#fff" stroke-width="8"/>
    <circle cx="437" cy="47" r="6"/><circle cx="465" cy="47" r="6"/><circle cx="451" cy="61" r="6"/><circle cx="437" cy="77" r="6"/><circle cx="465" cy="77" r="6"/>
    <text x="505" y="64" dominant-baseline="middle" font-size="48">${damage}</text>
    <rect x="0" y="135" width="${SVG_WIDTH}" height="110" rx="30" fill="#27272a" fill-opacity=".88"/>
    ${fillWidth > 0 ? `<rect x="0" y="135" width="${fillWidth}" height="110" rx="30" fill="${hpColor(hpPercent)}" fill-opacity=".96"/>` : ""}
    <text x="430" y="194" text-anchor="middle" dominant-baseline="middle" font-size="58" stroke="#000" stroke-opacity=".5" stroke-width="5" paint-order="stroke">${hp}</text>
  </g>
</svg>`;
}

function buildOverlayItem(
  token: Item,
  data: CreatureData,
  bounds: { min: { x: number; y: number }; max: { x: number; y: number }; center: { x: number; y: number } },
  renderKey: string,
) {
  const tokenWidth = Math.max(40, bounds.max.x - bounds.min.x);
  const overlayWidth = tokenWidth * 0.86;
  const overlayScale = overlayWidth / SVG_WIDTH;
  const overlayHeight = SVG_HEIGHT * overlayScale;
  const bottomInset = overlayWidth * 0.07;
  const svg = buildOverlaySvg(data);
  const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

  return buildImage(
    { width: SVG_WIDTH, height: SVG_HEIGHT, mime: "image/svg+xml", url },
    { dpi: SVG_WIDTH, offset: { x: 0, y: 0 } },
  )
    .name("DWTools graphical stats")
    .position({
      x: bounds.center.x,
      y: bounds.max.y - bottomInset - overlayHeight / 2,
    })
    .scale({ x: overlayScale, y: overlayScale })
    .attachedTo(token.id)
    .layer("ATTACHMENT")
    .locked(true)
    .disableHit(true)
    .disableAttachmentBehavior(["SCALE"])
    .visible(data.visibleToPlayers !== false)
    .metadata({
      [DISPLAY_KEY]: true,
      [DISPLAY_RENDER_KEY]: renderKey,
    })
    .build();
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
    layout: 4,
    hpCurrent: data.hpCurrent,
    hpMax: data.hpMax,
    armor: data.armor,
    damage: data.damage,
    visibleToPlayers: data.visibleToPlayers !== false,
    tokenScale: token.scale,
  });
  const isCurrent = displays.length === 1
    && displays[0].metadata[DISPLAY_RENDER_KEY] === renderKey;
  if (isCurrent) return;

  if (displays.length) await OBR.scene.items.deleteItems(displays.map((item) => item.id));
  const bounds = await OBR.scene.items.getItemBounds([token.id]);
  await OBR.scene.items.addItems([buildOverlayItem(token, data, bounds, renderKey)]);
}

export async function syncAllDisplays(items?: Item[]): Promise<void> {
  const sceneItems = items ?? await OBR.scene.items.getItems();
  const tokens = sceneItems.filter(
    (item) => item.layer === "CHARACTER" && isCreatureData(item.metadata[CREATURE_KEY]),
  );
  for (const token of tokens) await syncCreatureDisplay(token, sceneItems);
}
