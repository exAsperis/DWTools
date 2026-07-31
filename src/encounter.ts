import { isImage, type Item, type Metadata } from "@owlbear-rodeo/sdk";
import {
  CREATURE_KEY,
  ENCOUNTER_STATE_KEY,
  isCreatureData,
  type CreatureData,
} from "./constants";
import { renderContextMarkdown } from "./contextMarkdown";
import { iconMarkup } from "./icons";

export const ENCOUNTER_STATE_SCHEMA_VERSION = 2;

export interface EncounterItem {
  id: string;
  itemText: string;
  itemName: string;
  imageUrl: string;
  lastModified: string;
  data: CreatureData;
}

export type EncounterState =
  | {
      schemaVersion: 1;
      inactiveItemIds: string[];
    }
  | {
      schemaVersion: 2;
      inactiveItemIds: string[];
      activeItemIds: string[];
    };

export interface CurrentEncounterState {
  schemaVersion: 2;
  inactiveItemIds: string[];
  activeItemIds: string[];
}

export interface EncounterMetadataStore {
  getMetadata(): Promise<Metadata>;
  setMetadata(update: Metadata): Promise<void>;
}

export function encounterItems(items: Item[]): EncounterItem[] {
  return items
    .filter(
      (item) =>
        item.layer === "CHARACTER" &&
        isImage(item) &&
        isCreatureData(item.metadata[CREATURE_KEY]),
    )
    .map((item) => ({
      id: item.id,
      itemText: isImage(item) ? item.text.plainText.trim() : "",
      itemName: item.name.trim(),
      imageUrl: isImage(item) ? item.image.url : "",
      lastModified: item.lastModified ?? "",
      data: item.metadata[CREATURE_KEY] as CreatureData,
    }))
    .sort(
      (left, right) =>
        left.itemText.localeCompare(right.itemText, undefined, {
          sensitivity: "base",
        }) ||
        left.itemName.localeCompare(right.itemName, undefined, {
          sensitivity: "base",
        }) ||
        left.id.localeCompare(right.id),
    );
}

export function parseEncounterState(value: unknown): EncounterState {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return { schemaVersion: 1, inactiveItemIds: [] };
  }
  const raw = value as {
    schemaVersion?: unknown;
    inactiveItemIds?: unknown;
    activeItemIds?: unknown;
  };
  if (!Array.isArray(raw.inactiveItemIds)) {
    return { schemaVersion: 1, inactiveItemIds: [] };
  }
  const inactiveItemIds = uniqueIds(raw.inactiveItemIds).sort();
  if (raw.schemaVersion === 1) return { schemaVersion: 1, inactiveItemIds };
  if (raw.schemaVersion !== 2 || !Array.isArray(raw.activeItemIds)) {
    return { schemaVersion: 1, inactiveItemIds: [] };
  }
  return {
    schemaVersion: 2,
    inactiveItemIds,
    activeItemIds: uniqueIds(raw.activeItemIds).filter(
      (id) => !inactiveItemIds.includes(id),
    ),
  };
}

function uniqueIds(value: unknown[]): string[] {
  return [
    ...new Set(
      value.filter(
        (id): id is string => typeof id === "string" && id.length > 0,
      ),
    ),
  ];
}

export function encounterStateFromMetadata(metadata: Metadata): EncounterState {
  return parseEncounterState(metadata[ENCOUNTER_STATE_KEY]);
}

export function partitionEncounterItems(
  items: EncounterItem[],
  state: EncounterState,
): { active: EncounterItem[]; inactive: EncounterItem[] } {
  const inactiveIds = new Set(state.inactiveItemIds);
  const eligible = new Map(items.map((item) => [item.id, item]));
  const inactive = items.filter((item) => inactiveIds.has(item.id));
  if (state.schemaVersion === 1) {
    return {
      active: items.filter((item) => !inactiveIds.has(item.id)),
      inactive,
    };
  }
  const stored = state.activeItemIds
    .map((id) => eligible.get(id))
    .filter(
      (item): item is EncounterItem =>
        item !== undefined && !inactiveIds.has(item.id),
    );
  const storedIds = new Set(stored.map((item) => item.id));
  const newlyEligible = items
    .filter((item) => !inactiveIds.has(item.id) && !storedIds.has(item.id))
    .sort(
      (left, right) =>
        right.lastModified.localeCompare(left.lastModified) ||
        encounterItemComparison(left, right),
    );
  return { active: [...newlyEligible, ...stored], inactive };
}

function encounterItemComparison(
  left: EncounterItem,
  right: EncounterItem,
): number {
  return (
    left.itemText.localeCompare(right.itemText, undefined, {
      sensitivity: "base",
    }) ||
    left.itemName.localeCompare(right.itemName, undefined, {
      sensitivity: "base",
    }) ||
    left.id.localeCompare(right.id)
  );
}

export function currentEncounterState(
  items: EncounterItem[],
  state: EncounterState,
): CurrentEncounterState {
  const eligibleIds = new Set(items.map((item) => item.id));
  const { active } = partitionEncounterItems(items, state);
  return {
    schemaVersion: 2,
    inactiveItemIds: state.inactiveItemIds
      .filter((id) => eligibleIds.has(id))
      .sort(),
    activeItemIds: active.map((item) => item.id),
  };
}

function statesEqual(
  left: CurrentEncounterState,
  right: EncounterState,
): boolean {
  return (
    right.schemaVersion === 2 &&
    left.inactiveItemIds.join("\0") === right.inactiveItemIds.join("\0") &&
    left.activeItemIds.join("\0") === right.activeItemIds.join("\0")
  );
}

async function writeEncounterState(
  store: EncounterMetadataStore,
  update: (items: CurrentEncounterState) => CurrentEncounterState,
  eligibleItems: EncounterItem[],
  retries: number,
): Promise<CurrentEncounterState> {
  for (let attempt = 0; attempt < retries; attempt += 1) {
    const metadata = await store.getMetadata();
    const current = currentEncounterState(
      eligibleItems,
      encounterStateFromMetadata(metadata),
    );
    const next = update(current);
    await store.setMetadata({ [ENCOUNTER_STATE_KEY]: next });
    const confirmed = encounterStateFromMetadata(await store.getMetadata());
    if (statesEqual(next, confirmed)) return next;
  }
  throw new Error("Encounter layout changed on another GM client. Try again.");
}

export async function reconcileEncounterState(
  store: EncounterMetadataStore,
  eligibleItems: EncounterItem[],
  retries = 3,
): Promise<CurrentEncounterState> {
  const metadata = await store.getMetadata();
  const state = encounterStateFromMetadata(metadata);
  const next = currentEncounterState(eligibleItems, state);
  if (statesEqual(next, state)) return next;
  return writeEncounterState(
    store,
    (current) => current,
    eligibleItems,
    retries,
  );
}

export async function setEncounterItemActive(
  store: EncounterMetadataStore,
  eligibleItems: EncounterItem[],
  itemId: string,
  active: boolean,
  retries = 3,
): Promise<CurrentEncounterState> {
  const eligibleIds = new Set(eligibleItems.map((item) => item.id));
  return writeEncounterState(
    store,
    (current) => {
      const inactive = new Set(current.inactiveItemIds);
      const order = current.activeItemIds.filter((id) => id !== itemId);
      if (active) {
        inactive.delete(itemId);
        if (eligibleIds.has(itemId)) order.unshift(itemId);
      } else if (eligibleIds.has(itemId)) {
        inactive.add(itemId);
      }
      return {
        schemaVersion: 2,
        inactiveItemIds: [...inactive].sort(),
        activeItemIds: order,
      };
    },
    eligibleItems,
    retries,
  );
}

export async function setEncounterActiveOrder(
  store: EncounterMetadataStore,
  eligibleItems: EncounterItem[],
  activeItemIds: string[],
  retries = 3,
): Promise<CurrentEncounterState> {
  return writeEncounterState(
    store,
    (current) => {
      const active = new Set(current.activeItemIds);
      const requested = uniqueIds(activeItemIds).filter((id) => active.has(id));
      for (const id of current.activeItemIds) {
        if (!requested.includes(id)) requested.push(id);
      }
      return { ...current, activeItemIds: requested };
    },
    eligibleItems,
    retries,
  );
}

function escapeHtml(value: string): string {
  return value.replace(
    /[&<>'"]/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        '"': "&quot;",
      })[character]!,
  );
}

export function hpPresentation(data: CreatureData): {
  text: string;
  percent: number;
  color: "green" | "amber" | "red" | "purple" | "empty";
  adjustable: boolean;
} {
  const current = data.hpCurrent;
  const maximum = data.hpMax;
  if (current === undefined && maximum === undefined) {
    return { text: "—", percent: 0, color: "empty", adjustable: false };
  }
  const text = `${current ?? "—"}/${maximum ?? "—"}`;
  if (current !== undefined && maximum !== undefined && current > maximum) {
    return { text, percent: 100, color: "purple", adjustable: true };
  }
  const percent =
    maximum && maximum > 0 && current !== undefined
      ? Math.max(0, Math.min(100, (current / maximum) * 100))
      : 0;
  return {
    text,
    percent,
    color: percent > 50 ? "green" : percent > 25 ? "amber" : "red",
    adjustable: current !== undefined,
  };
}

function identityMarkup(item: EncounterItem): string {
  return `<span class="encounter-item-text">${escapeHtml(item.itemText || "Unnamed character")}</span><span class="encounter-item-name">(${escapeHtml(item.itemName || "Unnamed item")})</span>`;
}

function thumbnailMarkup(item: EncounterItem): string {
  return item.imageUrl
    ? `<img class="encounter-thumbnail" src="${escapeHtml(item.imageUrl)}" alt="">`
    : '<span class="encounter-thumbnail encounter-thumbnail-empty" aria-hidden="true"></span>';
}

function actionMarkup(
  item: EncounterItem,
  active: boolean,
  busy: boolean,
): string {
  const activityLabel = active ? "Move to Inactive" : "Add to Encounter";
  return `<span class="encounter-actions"><button class="encounter-locate" type="button" data-encounter-locate="${escapeHtml(item.id)}" aria-label="Locate on scene" title="Locate on scene">${iconMarkup("map-pin")}</button><button class="encounter-activity" type="button" data-encounter-active="${active ? "false" : "true"}" data-item-id="${escapeHtml(item.id)}" aria-label="${activityLabel}" title="${activityLabel}" ${busy ? "disabled" : ""}>${iconMarkup(active ? "minus-circle" : "plus-circle")}</button></span>`;
}

function activeCardMarkup(
  item: EncounterItem,
  busyItemIds: ReadonlySet<string>,
): string {
  const data = item.data;
  const hp = hpPresentation(data);
  const damage = data.damage?.trim();
  const description = data.damageDescription?.trim();
  const damageTags = data.damageTags?.trim();
  const instinct = data.instinct?.trim();
  const moves = data.moves?.trim();
  const busy = busyItemIds.has(item.id);
  return `<article class="encounter-card" data-encounter-item="${escapeHtml(item.id)}">
    <div class="encounter-identity encounter-drag-handle" draggable="${busy ? "false" : "true"}" data-encounter-drag="${escapeHtml(item.id)}">${thumbnailMarkup(item)}<span class="encounter-identity-copy">${identityMarkup(item)}</span>${actionMarkup(item, true, busy)}</div>
    <div class="encounter-combat">
      <span class="encounter-armor" title="Armor">${iconMarkup("shield")}<strong>${data.armor ?? "—"}</strong></span>
      <span class="encounter-damage">${iconMarkup("sword")}<span class="encounter-damage-copy">${damage ? `<button type="button" data-encounter-damage="${escapeHtml(damage)}">🎲 ${escapeHtml(damage)}</button>` : "—"}${description ? `<span> (${escapeHtml(description)})</span>` : ""}${damageTags ? `<em>${escapeHtml(damageTags)}</em>` : ""}</span></span>
      <span class="encounter-hp"><button type="button" data-encounter-hp="-1" data-item-id="${escapeHtml(item.id)}" aria-label="Decrease HP" ${!hp.adjustable || busy ? "disabled" : ""}>−</button><span class="encounter-hp-bar hp-${hp.color}"><span class="encounter-hp-fill" style="width:${hp.percent}%"></span><strong>${hp.text}</strong></span><button type="button" data-encounter-hp="1" data-item-id="${escapeHtml(item.id)}" aria-label="Increase HP" ${!hp.adjustable || busy ? "disabled" : ""}>+</button></span>
    </div>
    ${instinct ? `<div class="encounter-instinct"><strong>Instinct:</strong> ${escapeHtml(instinct)}</div>` : ""}
    ${moves ? `<div class="encounter-moves"><strong>Moves:</strong><div class="markdown-content">${renderContextMarkdown(moves)}</div></div>` : ""}
  </article>`;
}

export function buildEncounterMarkup(
  items: EncounterItem[],
  state: EncounterState,
  inactiveExpanded: boolean,
  busyItemIds: ReadonlySet<string> = new Set(),
): string {
  const { active, inactive } = partitionEncounterItems(items, state);
  return `<div class="encounter-list" data-encounter-active-list>${active.length ? active.map((item) => activeCardMarkup(item, busyItemIds)).join("") : '<p class="encounter-empty">No active DWTools creatures in this scene.</p>'}</div>
    <section class="encounter-inactive">
      <button class="section-toggle encounter-inactive-toggle" type="button" data-toggle-section="encounterInactive" aria-expanded="${inactiveExpanded}"><span class="section-arrow" aria-hidden="true">&#9656;</span><span>Inactive (${inactive.length})</span></button>
      ${inactiveExpanded ? `<div class="encounter-inactive-list">${inactive.length ? inactive.map((item) => `<div class="encounter-inactive-row">${thumbnailMarkup(item)}<span class="encounter-identity-copy">${identityMarkup(item)}</span>${actionMarkup(item, false, busyItemIds.has(item.id))}</div>`).join("") : '<p class="encounter-empty">No inactive creatures.</p>'}</div>` : ""}
    </section>`;
}
