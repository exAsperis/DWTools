import OBR, {
  buildCurve,
  buildText,
  isCurve,
  isImage,
  isText,
  type AttachmentBehavior,
  type Item,
} from "@owlbear-rodeo/sdk";
import { DISPLAY_KEY, type CreatureData } from "./constants";
import {
  getCreatureData,
  getImageGeometry,
  getOverlayLayout,
  hpColor,
  hpPercent,
  overlayItemId,
  overlaySourceSignature,
  roundedRectanglePoints,
  shouldRenderOverlay,
  type OverlayBox,
  type PlayerRole,
} from "./overlayModel";

export const DISPLAY_RENDER_KEY = `${DISPLAY_KEY}/render`;
const DISPLAY_ROLE_KEY = `${DISPLAY_KEY}/role`;
const DISABLED_ATTACHMENT_BEHAVIORS: AttachmentBehavior[] = [
  "ROTATION",
  "VISIBLE",
  "COPY",
  "SCALE",
];

export interface ReconciliationPlan {
  add: Item[];
  update: Array<{ current: Item; desired: Item }>;
  deleteIds: string[];
}

export function isDisplay(item: Item): boolean {
  return item.metadata[DISPLAY_KEY] === true;
}

function displayMetadata(role: string, renderKey: string) {
  return {
    [DISPLAY_KEY]: true,
    [DISPLAY_ROLE_KEY]: role,
    [DISPLAY_RENDER_KEY]: renderKey,
  };
}

function buildBackground(
  token: Item,
  role: string,
  renderKey: string,
  box: OverlayBox,
  color = "#18181b",
  opacity = 0.82,
  zIndex = 10,
) {
  return buildCurve()
    .id(overlayItemId(token.id, `${role}-bg`))
    .name(`DWTools ${role} background`)
    .position({ x: box.left, y: box.top })
    .points(roundedRectanglePoints(box.width, box.height, box.height * 0.25))
    .fillColor(color)
    .fillOpacity(opacity)
    .strokeOpacity(0)
    .strokeWidth(0)
    .tension(0)
    .closed(true)
    .attachedTo(token.id)
    .layer("ATTACHMENT")
    .zIndex(zIndex)
    .disableAutoZIndex(true)
    .locked(true)
    .disableHit(true)
    .disableAttachmentBehavior(DISABLED_ATTACHMENT_BEHAVIORS)
    .visible(true)
    .metadata(displayMetadata(`${role}-bg`, renderKey))
    .build();
}

function buildOverlayText(
  token: Item,
  role: string,
  renderKey: string,
  text: string,
  box: OverlayBox,
  fontSize: number,
) {
  return buildText()
    .id(overlayItemId(token.id, `${role}-text`))
    .name(`DWTools ${role} text`)
    .position({ x: box.left, y: box.top })
    .width(box.width)
    .height(box.height)
    .plainText(text)
    .textType("PLAIN")
    .padding(0)
    .fontFamily("Arial, Helvetica, sans-serif")
    .fontSize(fontSize)
    .fontWeight(700)
    .lineHeight(1)
    .textAlign("CENTER")
    .textAlignVertical("MIDDLE")
    .fillColor("#ffffff")
    .fillOpacity(1)
    .strokeColor("#000000")
    .strokeOpacity(0.55)
    .strokeWidth(Math.max(0.5, fontSize * 0.055))
    .attachedTo(token.id)
    .layer("TEXT")
    .zIndex(10)
    .disableAutoZIndex(true)
    .locked(true)
    .disableHit(true)
    .disableAttachmentBehavior(DISABLED_ATTACHMENT_BEHAVIORS)
    .visible(true)
    .metadata(displayMetadata(`${role}-text`, renderKey))
    .build();
}

function buildTokenOverlay(
  token: Item,
  data: CreatureData,
  role: PlayerRole,
  sceneDpi: number,
): Item[] {
  if (!isImage(token) || !shouldRenderOverlay(token, data, role)) return [];

  const geometry = getImageGeometry(token, sceneDpi);
  const layout = getOverlayLayout(geometry);
  const renderKey = overlaySourceSignature(token, data, role, sceneDpi);
  const percent = hpPercent(data);
  const hpBox = {
    left: layout.hpLeft,
    top: layout.hpTop,
    width: layout.hpWidth,
    height: layout.hpHeight,
  };
  const fillBox = { ...hpBox, width: hpBox.width * percent };

  return [
    buildBackground(token, "visibility", renderKey, layout.visibility),
    buildOverlayText(
      token,
      "visibility",
      renderKey,
      data.visibleToPlayers === false ? "⊘" : "◉",
      layout.visibility,
      layout.fontSize,
    ),
    buildBackground(token, "armor", renderKey, layout.armor),
    buildOverlayText(
      token,
      "armor",
      renderKey,
      `◆${data.armor ?? "—"}`,
      layout.armor,
      layout.fontSize,
    ),
    buildBackground(token, "damage", renderKey, layout.damage),
    buildOverlayText(
      token,
      "damage",
      renderKey,
      `⚄${data.damage ?? "—"}`,
      layout.damage,
      layout.fontSize * 0.9,
    ),
    buildBackground(token, "hp", renderKey, hpBox, "#27272a", 0.88, 20),
    ...(fillBox.width > 0
      ? [buildBackground(token, "hp-fill", renderKey, fillBox, hpColor(percent), 0.96, 21)]
      : []),
    buildOverlayText(
      token,
      "hp",
      renderKey,
      `${data.hpCurrent ?? "—"}/${data.hpMax ?? "—"}`,
      layout.hpText,
      layout.fontSize,
    ),
  ];
}

export function buildDesiredDisplays(
  sceneItems: Item[],
  role: PlayerRole,
  sceneDpi: number,
): Item[] {
  const desired: Item[] = [];
  for (const item of sceneItems) {
    if (item.layer !== "CHARACTER" || !isImage(item)) continue;
    desired.push(...buildTokenOverlay(item, getCreatureData(item), role, sceneDpi));
  }
  return desired;
}

export function planDisplayReconciliation(
  currentDisplays: Item[],
  desiredDisplays: Item[],
): ReconciliationPlan {
  const currentById = new Map(currentDisplays.map((item) => [item.id, item]));
  const desiredById = new Map(desiredDisplays.map((item) => [item.id, item]));
  const plan: ReconciliationPlan = { add: [], update: [], deleteIds: [] };

  for (const current of currentDisplays) {
    const desired = desiredById.get(current.id);
    if (!desired) {
      plan.deleteIds.push(current.id);
    } else if (current.type !== desired.type) {
      plan.deleteIds.push(current.id);
      plan.add.push(desired);
    } else if (
      current.metadata[DISPLAY_RENDER_KEY] !== desired.metadata[DISPLAY_RENDER_KEY]
      || current.attachedTo !== desired.attachedTo
      || current.layer !== desired.layer
    ) {
      plan.update.push({ current, desired });
    }
  }

  for (const desired of desiredDisplays) {
    if (!currentById.has(desired.id)) plan.add.push(desired);
  }

  return plan;
}

export function applyDesiredItem(target: Item, desired: Item): void {
  target.name = desired.name;
  target.visible = desired.visible;
  target.locked = desired.locked;
  target.zIndex = desired.zIndex;
  target.position = { ...desired.position };
  target.rotation = desired.rotation;
  target.scale = { ...desired.scale };
  target.metadata = { ...desired.metadata };
  target.layer = desired.layer;
  target.attachedTo = desired.attachedTo;
  target.disableHit = desired.disableHit;
  target.disableAutoZIndex = desired.disableAutoZIndex;
  target.disableAttachmentBehavior = desired.disableAttachmentBehavior
    ? [...desired.disableAttachmentBehavior]
    : undefined;
  target.description = desired.description;

  if (isCurve(target) && isCurve(desired)) {
    target.points = desired.points.map((point) => ({ ...point }));
    target.style = {
      ...desired.style,
      strokeDash: [...desired.style.strokeDash],
    };
  } else if (isText(target) && isText(desired)) {
    target.text = {
      ...desired.text,
      richText: desired.text.richText.map((entry) => ({ ...entry })),
      style: { ...desired.text.style },
    };
  }
}

export async function applyLocalDisplayPlan(plan: ReconciliationPlan): Promise<void> {
  if (plan.update.length) {
    const desiredById = new Map(plan.update.map(({ desired }) => [desired.id, desired]));
    await OBR.scene.local.updateItems(
      plan.update.map(({ current }) => current),
      (drafts) => {
        for (const draft of drafts) {
          const desired = desiredById.get(draft.id);
          if (desired) applyDesiredItem(draft as Item, desired);
        }
      },
    );
  }
  if (plan.add.length) await OBR.scene.local.addItems(plan.add);
  if (plan.deleteIds.length) await OBR.scene.local.deleteItems(plan.deleteIds);
}

export async function prepareLocalDisplayPlan(
  sceneItems: Item[],
  role: PlayerRole,
  sceneDpi: number,
): Promise<ReconciliationPlan> {
  const currentDisplays = await OBR.scene.local.getItems(isDisplay);
  const desiredDisplays = buildDesiredDisplays(sceneItems, role, sceneDpi);
  return planDisplayReconciliation(currentDisplays, desiredDisplays);
}

export async function clearLocalDisplays(): Promise<void> {
  const displays = await OBR.scene.local.getItems(isDisplay);
  if (displays.length) await OBR.scene.local.deleteItems(displays.map((item) => item.id));
}
