import { isImage, type Item, type Metadata } from "@owlbear-rodeo/sdk";
import {
  CREATURE_KEY,
  ENCOUNTER_STATE_KEY,
  isCreatureData,
  type CreatureData,
} from "./constants";
import { renderContextMarkdown } from "./contextMarkdown";
import { iconMarkup } from "./icons";

export const ENCOUNTER_STATE_SCHEMA_VERSION = 1;

export interface EncounterItem {
  id: string;
  itemText: string;
  itemName: string;
  data: CreatureData;
}

export interface EncounterState {
  schemaVersion: 1;
  inactiveItemIds: string[];
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
  const raw = value as Partial<EncounterState>;
  if (
    raw.schemaVersion !== ENCOUNTER_STATE_SCHEMA_VERSION ||
    !Array.isArray(raw.inactiveItemIds)
  ) {
    return { schemaVersion: 1, inactiveItemIds: [] };
  }
  return {
    schemaVersion: 1,
    inactiveItemIds: [
      ...new Set(
        raw.inactiveItemIds.filter(
          (id): id is string => typeof id === "string" && id.length > 0,
        ),
      ),
    ].sort(),
  };
}

export function encounterStateFromMetadata(metadata: Metadata): EncounterState {
  return parseEncounterState(metadata[ENCOUNTER_STATE_KEY]);
}

export function partitionEncounterItems(
  items: EncounterItem[],
  state: EncounterState,
): { active: EncounterItem[]; inactive: EncounterItem[] } {
  const inactiveIds = new Set(state.inactiveItemIds);
  return {
    active: items.filter((item) => !inactiveIds.has(item.id)),
    inactive: items.filter((item) => inactiveIds.has(item.id)),
  };
}

export async function setEncounterItemActive(
  store: EncounterMetadataStore,
  eligibleItemIds: Iterable<string>,
  itemId: string,
  active: boolean,
  retries = 3,
): Promise<EncounterState> {
  const eligible = new Set(eligibleItemIds);
  for (let attempt = 0; attempt < retries; attempt += 1) {
    const metadata = await store.getMetadata();
    const current = encounterStateFromMetadata(metadata);
    const nextIds = new Set(
      current.inactiveItemIds.filter((id) => eligible.has(id)),
    );
    if (active) nextIds.delete(itemId);
    else if (eligible.has(itemId)) nextIds.add(itemId);
    const next: EncounterState = {
      schemaVersion: 1,
      inactiveItemIds: [...nextIds].sort(),
    };
    await store.setMetadata({ [ENCOUNTER_STATE_KEY]: next });
    const confirmed = encounterStateFromMetadata(await store.getMetadata());
    if (
      confirmed.inactiveItemIds.includes(itemId) === !active &&
      [...nextIds].every((id) => confirmed.inactiveItemIds.includes(id))
    ) {
      return confirmed;
    }
  }
  throw new Error(
    "Encounter activity changed on another GM client. Try again.",
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
  return `<span class="encounter-item-text">${escapeHtml(item.itemText || "Unnamed character")}</span> <span class="encounter-item-name">(${escapeHtml(item.itemName || "Unnamed item")})</span>`;
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
    <div class="encounter-identity">${identityMarkup(item)}<button class="encounter-activity" type="button" data-encounter-active="false" data-item-id="${escapeHtml(item.id)}" aria-label="Move to Inactive" title="Move to Inactive" ${busy ? "disabled" : ""}>${iconMarkup("minus-circle")}</button></div>
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
  return `<div class="encounter-list">${active.length ? active.map((item) => activeCardMarkup(item, busyItemIds)).join("") : '<p class="encounter-empty">No active DWTools creatures in this scene.</p>'}</div>
    <section class="encounter-inactive">
      <button class="section-toggle encounter-inactive-toggle" type="button" data-toggle-section="encounterInactive" aria-expanded="${inactiveExpanded}"><span class="section-arrow" aria-hidden="true">&#9656;</span><span>Inactive (${inactive.length})</span></button>
      ${inactiveExpanded ? `<div class="encounter-inactive-list">${inactive.length ? inactive.map((item) => `<div class="encounter-inactive-row">${identityMarkup(item)}<button class="encounter-activity" type="button" data-encounter-active="true" data-item-id="${escapeHtml(item.id)}" aria-label="Add to Encounter" title="Add to Encounter" ${busyItemIds.has(item.id) ? "disabled" : ""}>${iconMarkup("plus-circle")}</button></div>`).join("") : '<p class="encounter-empty">No inactive creatures.</p>'}</div>` : ""}
    </section>`;
}
