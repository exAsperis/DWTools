import type {
  CharacterRecord,
  CharacterStorageUsage,
  CharacterTombstone,
  StoredCharacterRecord,
} from "./characterRepository";
import type { CreatureFields } from "./constants";

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
): string {
  const id = (name: string) => `${idPrefix}${name}`;
  return `
    <label>Name<input id="${id("name")}" name="name" type="text" maxlength="120" required value="${escapeHtml(fields.name)}"></label>
    <label>Tags<input id="${id("tags")}" name="tags" type="text" maxlength="160" placeholder="Solitary, Small, Intelligent, Stealthy, Devious" value="${escapeHtml(fields.tags ?? "")}"></label>
    <div class="vitals-row">
      <label>Armor<input id="${id("armor")}" name="armor" type="number" step="1" value="${numberValue(fields.armor)}"></label>
      <label>Current HP<input id="${id("hpCurrent")}" name="hpCurrent" type="number" step="1" value="${numberValue(fields.hpCurrent)}"></label>
      <span class="slash">/</span>
      <label>Maximum HP<input id="${id("hpMax")}" name="hpMax" type="number" min="0" step="1" value="${numberValue(fields.hpMax)}"></label>
    </div>
    <div class="damage-fields">
      <label>Damage<input id="${id("damage")}" name="damage" type="text" maxlength="40" placeholder="b[2d6]+1" value="${escapeHtml(fields.damage ?? "")}"></label>
      <label>Description<input id="${id("damageDescription")}" name="damageDescription" type="text" maxlength="80" placeholder="Claws" value="${escapeHtml(fields.damageDescription ?? "")}"></label>
    </div>
    <label>Damage tags<input id="${id("damageTags")}" name="damageTags" type="text" maxlength="160" placeholder="Close, Reach, Messy, Forceful" value="${escapeHtml(fields.damageTags ?? "")}"></label>
    <label>Instinct<textarea id="${id("instinct")}" name="instinct" rows="2">${escapeHtml(fields.instinct ?? "")}</textarea></label>
    <label>Moves<textarea id="${id("moves")}" name="moves" rows="4" placeholder="One move per line">${escapeHtml(fields.moves ?? "")}</textarea></label>
    <label>Treasure<textarea id="${id("treasure")}" name="treasure" rows="3">${escapeHtml(fields.treasure ?? "")}</textarea></label>
    <label class="visibility">
      <input id="${id("visibleToPlayers")}" name="visibleToPlayers" type="checkbox" ${fields.visibleToPlayers === false ? "" : "checked"}>
      Show the token overlay to players
    </label>`;
}

export function buildCharacterSummary(record: CharacterRecord): string {
  const fields = record.fields;
  return `${escapeHtml(fields.name)} · HP ${numberValue(fields.hpCurrent) || "—"}/${numberValue(fields.hpMax) || "—"} · ARM ${numberValue(fields.armor) || "—"} · DMG ${escapeHtml(fields.damage ?? "—")}`;
}

export interface CharacterManagerViewState {
  records: CharacterRecord[];
  tombstones: CharacterTombstone[];
  showTombstones: boolean;
  counts: Map<string, number>;
  usage?: CharacterStorageUsage;
  loading: boolean;
  saving: boolean;
  error?: string;
  search: string;
  editing?: { kind: "create" | "edit"; fields: CreatureFields; id?: string };
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

export function buildCharacterManagerMarkup(
  state: CharacterManagerViewState,
): string {
  if (state.editing) {
    return `
      <section class="character-manager">
        <div class="manager-heading">
          <div><p class="eyebrow">Room persistence</p><h2>${state.editing.kind === "create" ? "New character record" : `Edit ${escapeHtml(state.editing.fields.name)}`}</h2></div>
        </div>
        ${state.error ? `<p class="inline-error">${escapeHtml(state.error)}</p>` : ""}
        <form id="character-manager-form" class="manager-form">
          ${buildCreatureFieldsMarkup(state.editing.fields, "manager-")}
          <div class="manager-actions">
            <button type="button" class="secondary" id="manager-cancel">Cancel</button>
            <button type="submit" class="primary" ${state.saving ? "disabled" : ""}>${state.saving ? "Saving…" : "Save record"}</button>
          </div>
        </form>
      </section>`;
  }

  const query = state.search.trim().toLocaleLowerCase();
  const displayedRecords: StoredCharacterRecord[] = state.showTombstones
    ? [...state.records, ...state.tombstones]
    : state.records;
  const records = query
    ? displayedRecords.filter((record) => {
        const searchText = record.deleted
          ? `${record.name ?? ""} ${record.id}`
          : `${record.fields.name} ${record.fields.tags ?? ""}`;
        return searchText.toLocaleLowerCase().includes(query);
      })
    : displayedRecords;
  return `
    <section class="character-manager">
      <div class="manager-heading">
        <div><p class="eyebrow">Room persistence</p><h2>Character Records</h2></div>
        <button type="button" class="primary compact" id="manager-create">New</button>
      </div>
      ${usageMarkup(state.usage)}
      <label class="tombstone-toggle">
        <input id="show-tombstones" type="checkbox" ${state.showTombstones ? "checked" : ""}>
        <span>Show tombstoned characters</span>
      </label>
      <label class="manager-search">Search<input id="manager-search" type="search" value="${escapeHtml(state.search)}" placeholder="Name or tags"></label>
      ${state.error ? `<p class="inline-error">${escapeHtml(state.error)}</p>` : ""}
      ${
        state.loading
          ? '<p class="manager-status">Loading character records…</p>'
          : records.length
            ? `<div class="character-list">${records
                .map((record) =>
                  record.deleted
                    ? `
              <article class="character-card tombstoned" data-character-search="${escapeHtml(`${record.name ?? ""} ${record.id}`.toLocaleLowerCase())}">
                <div>
                  <div class="character-card-title">
                    <strong>${escapeHtml(record.name ?? `Deleted character ${record.id.slice(0, 8)}`)}</strong>
                    <span class="tombstone-badge">Tombstoned</span>
                  </div>
                  <span>Deleted ${escapeHtml(new Date(record.deletedAt).toLocaleString())}</span>
                </div>
                <div class="card-actions">
                  <button type="button" class="danger compact" data-delete-permanently="${escapeHtml(record.id)}" ${state.saving ? "disabled" : ""}>Delete permanently</button>
                </div>
                <span class="permanent-delete-warning">This action will orphan linked creature tokens in other scenes.</span>
              </article>`
                    : `
              <article class="character-card" data-character-search="${escapeHtml(`${record.fields.name} ${record.fields.tags ?? ""}`.toLocaleLowerCase())}">
                <div>
                  <strong>${escapeHtml(record.fields.name)}</strong>
                  <span>HP ${numberValue(record.fields.hpCurrent) || "—"}/${numberValue(record.fields.hpMax) || "—"} · ARM ${numberValue(record.fields.armor) || "—"} · DMG ${escapeHtml(record.fields.damage ?? "—")}</span>
                  <span>${state.counts.get(record.id) ?? 0} linked token${state.counts.get(record.id) === 1 ? "" : "s"} in current scene · Updated ${escapeHtml(new Date(record.updatedAt).toLocaleString())}</span>
                </div>
                <div class="card-actions">
                  <button type="button" class="secondary compact" data-edit-character="${escapeHtml(record.id)}">Edit</button>
                  <button type="button" class="danger compact" data-delete-character="${escapeHtml(record.id)}">Delete</button>
                </div>
              </article>`,
                )
                .join("")}</div>`
            : '<p class="manager-status">No character records found.</p>'
      }
    </section>`;
}
