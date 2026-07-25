import { isImage, type Image, type Item } from "@owlbear-rodeo/sdk";
import { CREATURE_KEY, isCreatureData, type CreatureData } from "./constants";

export type PlayerRole = "GM" | "PLAYER";

export const OVERLAY_LAYOUT_VERSION = 11;
export const OVERLAY_HORIZONTAL_INSET_RATIO = 0.08;

export interface ImageGeometry {
  center: { x: number; y: number };
  width: number;
  height: number;
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export interface OverlayLayout {
  width: number;
  fontSize: number;
  rowTop: number;
  rowHeight: number;
  hpLeft: number;
  hpTop: number;
  hpWidth: number;
  hpHeight: number;
  hpText: {
    left: number;
    top: number;
    width: number;
    height: number;
  };
  visibility: OverlayBox;
  armor: OverlayBox;
  damage: OverlayBox;
}

export interface OverlayBox {
  left: number;
  top: number;
  width: number;
  height: number;
}

function rotate(vector: { x: number; y: number }, degrees: number) {
  const radians = degrees * Math.PI / 180;
  const cosine = Math.cos(radians);
  const sine = Math.sin(radians);
  return {
    x: vector.x * cosine - vector.y * sine,
    y: vector.x * sine + vector.y * cosine,
  };
}

export function getImageGeometry(token: Image, sceneDpi: number): ImageGeometry {
  const dpiScale = sceneDpi / token.grid.dpi;
  const centerFromPosition = rotate({
    x: (token.image.width / 2 - token.grid.offset.x) * dpiScale * token.scale.x,
    y: (token.image.height / 2 - token.grid.offset.y) * dpiScale * token.scale.y,
  }, token.rotation);
  const center = {
    x: token.position.x + centerFromPosition.x,
    y: token.position.y + centerFromPosition.y,
  };
  const width = Math.abs(token.image.width * dpiScale * token.scale.x);
  const height = Math.abs(token.image.height * dpiScale * token.scale.y);

  return {
    center,
    width,
    height,
    left: center.x - width / 2,
    top: center.y - height / 2,
    right: center.x + width / 2,
    bottom: center.y + height / 2,
  };
}

export function getOverlayLayout(geometry: ImageGeometry): OverlayLayout {
  const width = Math.max(24, geometry.width * (1 - OVERLAY_HORIZONTAL_INSET_RATIO * 2));
  const fontSize = Math.max(8, width * 0.095);
  const rowHeight = fontSize * 1.55;
  const hpHeight = fontSize * 1.4;
  const gap = width * 0.025;
  const bottomInset = width * 0.07;
  const hpLeft = geometry.left + geometry.width * OVERLAY_HORIZONTAL_INSET_RATIO;
  const hpTop = geometry.bottom - bottomInset - hpHeight;
  const rowTop = hpTop - gap - rowHeight;
  const boxGap = width * 0.02;
  const visibilityWidth = width * 0.18;
  const armorWidth = width * 0.22;
  const damageWidth = width - visibilityWidth - armorWidth - boxGap * 2;

  return {
    width,
    fontSize,
    rowTop,
    rowHeight,
    hpLeft,
    hpTop,
    hpWidth: width,
    hpHeight,
    hpText: {
      left: hpLeft,
      top: hpTop,
      width,
      height: hpHeight,
    },
    visibility: {
      left: hpLeft,
      top: rowTop,
      width: visibilityWidth,
      height: rowHeight,
    },
    armor: {
      left: hpLeft + visibilityWidth + boxGap,
      top: rowTop,
      width: armorWidth,
      height: rowHeight,
    },
    damage: {
      left: hpLeft + visibilityWidth + armorWidth + boxGap * 2,
      top: rowTop,
      width: damageWidth,
      height: rowHeight,
    },
  };
}

export function hpColor(percent: number): string {
  if (percent > 0.5) return "#15803d";
  if (percent > 0.25) return "#b45309";
  return "#b91c1c";
}

export function hpPercent(data: CreatureData): number {
  return data.hpMax && data.hpMax > 0
    ? Math.max(0, Math.min(1, (data.hpCurrent ?? 0) / data.hpMax))
    : 0;
}

export function hasOverlayData(data: CreatureData): boolean {
  return data.hpCurrent !== undefined || data.hpMax !== undefined
    || data.armor !== undefined || Boolean(data.damage);
}

export function getCreatureData(token: Item): CreatureData {
  const raw = token.metadata[CREATURE_KEY];
  return isCreatureData(raw) ? raw : {};
}

export function shouldRenderOverlay(
  token: Item,
  data: CreatureData,
  role: PlayerRole,
): boolean {
  return token.visible
    && hasOverlayData(data)
    && (role === "GM" || data.visibleToPlayers !== false);
}

export function overlayItemId(tokenId: string, role: string): string {
  return `${tokenId}-dwtools-${role}`;
}

export function overlaySourceSignature(
  token: Image,
  data: CreatureData,
  role: PlayerRole,
  sceneDpi: number,
): string {
  return JSON.stringify({
    layout: OVERLAY_LAYOUT_VERSION,
    role,
    sceneDpi,
    visible: token.visible,
    image: {
      width: token.image.width,
      height: token.image.height,
    },
    grid: token.grid,
    scale: token.scale,
    rotation: token.rotation,
    hpCurrent: data.hpCurrent,
    hpMax: data.hpMax,
    armor: data.armor,
    damage: data.damage,
    visibleToPlayers: data.visibleToPlayers !== false,
  });
}

export function getOverlaySourceSignatures(
  items: Item[],
  role: PlayerRole,
  sceneDpi: number,
): Map<string, string> {
  const signatures = new Map<string, string>();
  for (const item of items) {
    if (item.layer !== "CHARACTER" || !isImage(item)) continue;
    const data = getCreatureData(item);
    if (!hasOverlayData(data)) continue;
    signatures.set(item.id, overlaySourceSignature(item, data, role, sceneDpi));
  }
  return signatures;
}

export function signatureMapsEqual(
  left: Map<string, string>,
  right: Map<string, string>,
): boolean {
  if (left.size !== right.size) return false;
  for (const [key, value] of left) {
    if (right.get(key) !== value) return false;
  }
  return true;
}

export function roundedRectanglePoints(
  width: number,
  height: number,
  requestedRadius: number,
  cornerSegments = 4,
): Array<{ x: number; y: number }> {
  const radius = Math.max(0, Math.min(requestedRadius, width / 2, height / 2));
  const points: Array<{ x: number; y: number }> = [];
  const corners = [
    { x: width - radius, y: radius, start: -Math.PI / 2 },
    { x: width - radius, y: height - radius, start: 0 },
    { x: radius, y: height - radius, start: Math.PI / 2 },
    { x: radius, y: radius, start: Math.PI },
  ];
  for (const corner of corners) {
    for (let index = 0; index <= cornerSegments; index++) {
      const angle = corner.start + index * Math.PI / 2 / cornerSegments;
      points.push({
        x: corner.x + Math.cos(angle) * radius,
        y: corner.y + Math.sin(angle) * radius,
      });
    }
  }
  return points;
}
