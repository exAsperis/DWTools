import type {
  CharacterRecord,
  CharacterStorageUsage,
} from "./characterRepository";
import type { CreatureFields } from "./constants";
import {
  formatLoad,
  formatLoadValue,
  isOverloaded,
  rowLoad,
  totalLoad,
  type InventoryItem,
} from "./inventory";
import {
  ABILITY_ABBREVIATIONS,
  ABILITY_NAMES,
  abilityModifier,
  calculatedMaxHp,
  calculatedMaxLoad,
  CONDITION_LABELS,
  CONDITION_NAMES,
  emptyScores,
  formatModifier,
} from "./playerStats";

export function escapeHtml(value: string): string {
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

export function numberValue(value: unknown): string {
  return typeof value === "number" && Number.isFinite(value)
    ? String(value)
    : "";
}

export function buildCreatureFieldsMarkup(
  fields: CreatureFields,
  idPrefix = "",
  editorKind: "creature" | "character" = "creature",
): string {
  const id = (name: string) => `${idPrefix}${name}`;
  const scores = fields.scores ?? emptyScores();
  const suggestedHp = calculatedMaxHp(fields.hpBase, scores[2]);
  const suggestedLoad = calculatedMaxLoad(fields.loadBase, scores[0]);
  const hpMismatch = suggestedHp !== undefined && fields.hpMax !== suggestedHp;
  const loadMismatch =
    suggestedLoad !== undefined && fields.maxLoad !== suggestedLoad;
  const scoreRows = scores
    .map(
      (score, index) => `
        <div class="ability-row">
          <label class="ability-score">${ABILITY_NAMES[index]}
            <input id="${id(`score-${index}`)}" name="score-${index}" type="number" min="3" max="18" step="1" value="${numberValue(score)}">
          </label>
          <span class="ability-modifier" aria-label="${ABILITY_NAMES[index]} modifier">
            <span class="ability-modifier-label">${ABILITY_ABBREVIATIONS[index]}</span>
            <span class="ability-modifier-value" data-score-modifier="${index}">${formatModifier(abilityModifier(score))}</span>
          </span>
          <label class="condition-toggle">
            <input id="${id(`condition-${CONDITION_NAMES[index]}`)}" name="condition-${CONDITION_NAMES[index]}" type="checkbox" ${fields.conditions?.[CONDITION_NAMES[index]] === -1 ? "checked" : ""}>
            ${CONDITION_LABELS[index]} <span>−1 ${ABILITY_ABBREVIATIONS[index]}</span>
          </label>
        </div>`,
    )
    .join("");
  return `
    <section class="editor-section common-fields">
      <h2>Common</h2>
      <label>Name<input id="${id("name")}" name="name" type="text" maxlength="120" required value="${escapeHtml(fields.name)}"></label>
      <div class="vitals-row">
        <label>Armor<input id="${id("armor")}" name="armor" type="number" step="1" value="${numberValue(fields.armor)}"></label>
        <label>Current HP<input id="${id("hpCurrent")}" name="hpCurrent" type="number" step="1" value="${numberValue(fields.hpCurrent)}"></label>
        <span class="slash">/</span>
        <label class="calculated-field">Maximum HP
          <input id="${id("hpMax")}" name="hpMax" class="${hpMismatch ? "calculation-mismatch" : ""}" type="number" min="0" step="1" value="${numberValue(fields.hpMax)}">
          <span class="calculated-hint" data-calculated-hp>Calculated: ${suggestedHp ?? "—"}</span>
        </label>
      </div>
      <div class="damage-fields">
        <label>Damage die<input id="${id("damage")}" name="damage" type="text" maxlength="40" placeholder="b[2d6]+1" value="${escapeHtml(fields.damage ?? "")}"></label>
        <label>Damage description<input id="${id("damageDescription")}" name="damageDescription" type="text" maxlength="80" placeholder="Claws" value="${escapeHtml(fields.damageDescription ?? "")}"></label>
      </div>
      <label>Damage tags<input id="${id("damageTags")}" name="damageTags" type="text" maxlength="160" placeholder="Close, Reach, Messy, Forceful" value="${escapeHtml(fields.damageTags ?? "")}"></label>
      <label class="visibility">
        <input id="${id("visibleToPlayers")}" name="visibleToPlayers" type="checkbox" ${fields.visibleToPlayers === false ? "" : "checked"}>
        Show the token overlay to players
      </label>
    </section>
    <details class="editor-section expandable-fields" ${editorKind === "creature" ? "open" : ""}>
      <summary><strong>GM Character</strong></summary>
      <div class="editor-section-body">
        <label>Tags<input id="${id("tags")}" name="tags" type="text" maxlength="160" placeholder="Solitary, Small, Intelligent, Stealthy, Devious" value="${escapeHtml(fields.tags ?? "")}"></label>
        <label>Instinct<textarea id="${id("instinct")}" name="instinct" rows="2">${escapeHtml(fields.instinct ?? "")}</textarea></label>
        <label>Moves<textarea id="${id("moves")}" name="moves" rows="4" placeholder="One move per line">${escapeHtml(fields.moves ?? "")}</textarea></label>
        <label>Treasure<textarea id="${id("treasure")}" name="treasure" rows="3">${escapeHtml(fields.treasure ?? "")}</textarea></label>
      </div>
    </details>
    <details class="editor-section expandable-fields player-fields" ${editorKind === "character" ? "open" : ""}>
      <summary><strong>Player Character</strong></summary>
      <div class="editor-section-body">
        <div class="progression-row">
          <label>Level<input id="${id("level")}" name="level" type="number" min="1" max="10" step="1" value="${numberValue(fields.level)}"></label>
          <label>XP<input id="${id("xp")}" name="xp" type="number" min="0" step="1" value="${numberValue(fields.xp)}"></label>
          <label>Alignment<input id="${id("alignment")}" name="alignment" type="text" maxlength="120" value="${escapeHtml(fields.alignment ?? "")}"></label>
        </div>
        <div class="base-row">
          <label>HP base<input id="${id("hpBase")}" name="hpBase" type="number" min="0" step="1" value="${numberValue(fields.hpBase)}"></label>
          <label>Load base<input id="${id("loadBase")}" name="loadBase" type="number" min="0" step="1" value="${numberValue(fields.loadBase)}"></label>
          <label class="calculated-field">Maximum Load
            <input id="${id("maxLoad")}" name="maxLoad" class="${loadMismatch ? "calculation-mismatch" : ""}" type="number" min="0" step="any" value="${numberValue(fields.maxLoad)}">
            <span class="calculated-hint" data-calculated-load>Calculated: ${suggestedLoad ?? "—"}</span>
          </label>
        </div>
        <div class="ability-list" aria-label="Ability scores and conditions">${scoreRows}</div>
      </div>
    </details>`;
}

export function buildCharacterSummary(record: CharacterRecord): string {
  const fields = record.fields;
  return `${escapeHtml(fields.name)} · HP ${numberValue(fields.hpCurrent) || "—"}/${numberValue(fields.hpMax) || "—"} · ARM ${numberValue(fields.armor) || "—"} · DMG ${escapeHtml(fields.damage ?? "—")}`;
}

export function buildCharacterDeleteConfirmation(name: string): string {
  return `Delete the room character record "${name}"? Current-scene tokens will be unlinked and keep their creature fields. Linked copies in other scenes will become orphaned and need to be manually resolved.`;
}

export interface CharacterManagerViewState {
  records: CharacterRecord[];
  counts: Map<string, number>;
  role: "GM" | "PLAYER";
  usage?: CharacterStorageUsage;
  loading: boolean;
  saving: boolean;
  error?: string;
  editing?: { kind: "create" | "edit"; fields: CreatureFields; id?: string };
  expandedCharacters?: Set<string>;
  expandedStats?: Set<string>;
  expandedInventories?: Set<string>;
  draftCharacterId?: string;
  transfer?: {
    sourceCharacterId: string;
    sourceIndex: number;
    expected: InventoryItem;
  };
}

function usageMarkup(usage: CharacterStorageUsage | undefined): string {
  if (!usage)
    return '<p class="manager-status">Metadata usage unavailable.</p>';
  const kib = (usage.bytes / 1024).toFixed(1);
  const safeKib = (usage.safeMaximumBytes / 1024).toFixed(0);
  return `
    <div class="metadata-usage ${usage.nearLimit ? "near-limit" : ""}">
      <span>Room metadata: approximately ${kib} KiB of ${safeKib} KiB safe maximum</span>
      <progress max="${usage.limitBytes}" value="${usage.bytes}"></progress>
      ${usage.nearLimit ? "<strong>Room metadata is approaching Owlbear's limit.</strong>" : ""}
    </div>`;
}

function inventoryRowMarkup(
  record: CharacterRecord,
  item: InventoryItem,
  sourceIndex: number,
  state: CharacterManagerViewState,
): string {
  const transferOpen =
    state.role === "GM" &&
    state.transfer?.sourceCharacterId === record.id &&
    state.transfer.sourceIndex === sourceIndex;
  return `
    <div class="inventory-row" data-inventory-row="${sourceIndex}">
      <div class="inventory-primary">
        <input class="inventory-inline-input inventory-name" data-inventory-name="${sourceIndex}" type="text" maxlength="120" value="${escapeHtml(item[0])}" aria-label="Item name">
        <div class="inventory-actions">
          <button type="button" class="danger compact" data-inventory-remove="${sourceIndex}" aria-label="Remove ${escapeHtml(item[0])}">Remove</button>
          ${state.role === "GM" ? `<button type="button" class="secondary compact" data-inventory-transfer="${sourceIndex}">Transfer</button>` : ""}
        </div>
      </div>
      <div class="inventory-metrics">
        <label class="inventory-metric">wt/ea:
          <input class="inventory-inline-input inventory-weight" data-inventory-weight="${sourceIndex}" type="number" min="0" step="any" value="${numberValue(item[1])}" aria-label="Weight each">
        </label>
        <span class="inventory-metric inventory-count-label">ct:
          <span class="inventory-count">
            <button type="button" data-inventory-adjust="${sourceIndex}" data-change="-1" aria-label="Decrease ${escapeHtml(item[0])} count">−</button>
            <input class="inventory-inline-input" data-inventory-count="${sourceIndex}" type="number" min="0" step="1" value="${item[2]}" aria-label="${escapeHtml(item[0])} quantity or uses">
            <button type="button" data-inventory-adjust="${sourceIndex}" data-change="1" aria-label="Increase ${escapeHtml(item[0])} count">+</button>
          </span>
        </span>
        <span class="inventory-metric inventory-load">load: <strong>${formatLoadValue(rowLoad(item))}</strong></span>
      </div>
    </div>
    ${
      transferOpen
        ? `<form class="transfer-form" data-transfer-form="${sourceIndex}">
          <label>Destination
            <select name="destination" required>
              <option value="">Choose a Character</option>
              ${state.records
                .filter((candidate) => candidate.id !== record.id)
                .map(
                  (candidate) =>
                    `<option value="${escapeHtml(candidate.id)}">${escapeHtml(candidate.fields.name)}</option>`,
                )
                .join("")}
            </select>
          </label>
          <label>Count
            <input name="count" type="number" min="1" max="${item[2]}" step="1" value="1" required>
          </label>
          <div class="manager-actions">
            <button type="button" class="secondary compact" data-transfer-cancel>Cancel</button>
            <button type="submit" class="primary compact">Transfer</button>
          </div>
        </form>`
        : ""
    }`;
}

function inventoryMarkup(
  record: CharacterRecord,
  state: CharacterManagerViewState,
): string {
  const inventory = record.inventory ?? [];
  const overloaded = isOverloaded(totalLoad(inventory), record.fields.maxLoad);
  const expanded = state.expandedInventories?.has(record.id) ?? false;
  const summary =
    !inventory.length && record.fields.maxLoad === undefined
      ? "Empty"
      : formatLoad(inventory, record.fields.maxLoad);
  return `
    <details class="inventory-section ${overloaded ? "overloaded" : ""}" data-inventory-details="${escapeHtml(record.id)}" ${expanded ? "open" : ""}>
      <summary>
        <strong>Inventory</strong>
        <span class="inventory-summary ${overloaded ? "load-warning" : ""}">${summary}</span>
      </summary>
      <div class="inventory-editor">
        <div class="inventory-list" aria-label="${escapeHtml(record.fields.name)} inventory">
          ${inventory.length ? inventory.map((item, index) => inventoryRowMarkup(record, item, index, state)).join("") : '<p class="manager-status inventory-empty">No items.</p>'}
          ${
            state.draftCharacterId === record.id
              ? `<form class="inventory-row inventory-draft" data-inventory-draft>
                <div class="inventory-primary">
                  <input class="inventory-inline-input inventory-name" name="name" type="text" maxlength="120" placeholder="Item name" aria-label="New item name" required>
                  <div class="inventory-actions">
                    <button type="button" class="secondary compact" data-inventory-draft-cancel>Cancel</button>
                    <button type="submit" class="primary compact">Save</button>
                  </div>
                </div>
                <div class="inventory-metrics">
                  <label class="inventory-metric">wt/ea:
                    <input class="inventory-inline-input inventory-weight" name="weight" type="number" min="0" step="any" value="0" aria-label="New item weight each" required>
                  </label>
                  <label class="inventory-metric">ct:
                    <input class="inventory-inline-input inventory-draft-count" name="count" type="number" min="1" step="1" value="1" aria-label="New item quantity or uses" required>
                  </label>
                  <span class="inventory-metric inventory-load">load: <strong>—</strong></span>
                </div>
              </form>`
              : ""
          }
        </div>
        ${state.draftCharacterId === record.id ? "" : '<button type="button" class="secondary compact add-item" data-inventory-add>Add Item</button>'}
      </div>
    </details>`;
}

function statsMarkup(
  record: CharacterRecord,
  state: CharacterManagerViewState,
): string {
  const editing =
    state.editing?.kind === "edit" && state.editing.id === record.id;
  const expanded = editing || (state.expandedStats?.has(record.id) ?? false);
  return `
    <details class="stats-section" data-stats-details="${escapeHtml(record.id)}" ${expanded ? "open" : ""}>
      <summary><strong>Stats</strong></summary>
      <div class="stats-editor">
        ${
          editing
            ? `${state.error ? `<p class="inline-error">${escapeHtml(state.error)}</p>` : ""}
              <form id="character-manager-form" class="manager-form">
                ${buildCreatureFieldsMarkup(state.editing!.fields, "manager-", "character")}
                <div class="manager-actions">
                  <button type="button" class="secondary" id="manager-cancel">Cancel</button>
                  <button type="submit" class="primary" ${state.saving ? "disabled" : ""}>${state.saving ? "Saving…" : "Save record"}</button>
                </div>
              </form>`
            : `<div class="card-actions">
                <button type="button" class="secondary compact" data-edit-character="${escapeHtml(record.id)}">Edit Character</button>
                ${state.role === "GM" ? `<button type="button" class="danger compact" data-delete-character="${escapeHtml(record.id)}">Delete</button>` : ""}
              </div>`
        }
      </div>
    </details>`;
}

function characterCardMarkup(
  record: CharacterRecord,
  state: CharacterManagerViewState,
): string {
  const expanded = state.expandedCharacters?.has(record.id) ?? false;
  const count = state.counts.get(record.id) ?? 0;
  return `
    <details class="character-card" data-character-details="${escapeHtml(record.id)}" ${expanded ? "open" : ""}>
      <summary class="character-card-summary">
        <strong>${escapeHtml(record.fields.name)}</strong>
      </summary>
      <div class="character-card-body">
        <span>HP ${numberValue(record.fields.hpCurrent) || "—"}/${numberValue(record.fields.hpMax) || "—"} · ARM ${numberValue(record.fields.armor) || "—"} · DMG ${escapeHtml(record.fields.damage ?? "—")}</span>
        <span>${count} linked token${count === 1 ? "" : "s"} in current scene · Updated ${escapeHtml(new Date(record.updatedAt).toLocaleString())}</span>
        ${statsMarkup(record, state)}
        ${inventoryMarkup(record, state)}
      </div>
    </details>`;
}

export function buildCharacterManagerMarkup(
  state: CharacterManagerViewState,
  expanded = false,
): string {
  if (state.editing?.kind === "create") {
    return `
      <section class="character-manager">
        <div class="manager-heading"><h2>${state.editing.kind === "create" ? "New character record" : `Edit ${escapeHtml(state.editing.fields.name)}`}</h2></div>
        ${state.error ? `<p class="inline-error">${escapeHtml(state.error)}</p>` : ""}
        <form id="character-manager-form" class="manager-form">
          ${buildCreatureFieldsMarkup(state.editing.fields, "manager-", "character")}
          <div class="manager-actions">
            <button type="button" class="secondary" id="manager-cancel">Cancel</button>
            <button type="submit" class="primary" ${state.saving ? "disabled" : ""}>${state.saving ? "Saving…" : "Save record"}</button>
          </div>
        </form>
      </section>`;
  }

  return `
    <section class="character-manager" data-home-section="characters">
      <div class="section-heading major-section-heading" draggable="true" data-drag-section="characters">
        <button class="section-toggle" type="button" data-toggle-section="characters" aria-expanded="${expanded}">
          <span class="section-arrow" aria-hidden="true">&#9656;</span><span>Character maintenance</span>
        </button>
      </div>
      ${
        expanded
          ? `${state.role === "GM" ? usageMarkup(state.usage) : ""}
      ${state.role === "GM" ? '<button type="button" class="primary compact manager-create" id="manager-create">New</button>' : ""}
      ${state.error ? `<p class="inline-error">${escapeHtml(state.error)}</p>` : ""}
      ${
        state.loading
          ? '<p class="manager-status">Loading Characters…</p>'
          : state.records.length
            ? `<div class="character-list">${state.records.map((record) => characterCardMarkup(record, state)).join("")}</div>`
            : `<p class="manager-status">${state.role === "GM" ? "No Character records found." : "You do not currently control any linked Character tokens in this scene."}</p>`
      }`
          : ""
      }
    </section>`;
}
