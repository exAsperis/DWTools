import type { CreatureData } from "./constants";
import { iconMarkup } from "./icons";

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

export function displayValue(value: string | number | undefined): string {
  return value === undefined || value === "" ? "—" : escapeHtml(String(value));
}

export function buildContextSummary(data: CreatureData): string {
  const description = data.damageDescription?.trim();
  const damageTags = data.damageTags?.trim();
  return `
    <div class="summary-row tags-row">
      <button class="visibility-button" type="button" id="visibility" aria-label="${data.visibleToPlayers === false ? "Hidden from players" : "Visible to players"}" title="${data.visibleToPlayers === false ? "Hidden from players" : "Visible to players"}">
        ${iconMarkup(data.visibleToPlayers === false ? "eye-off" : "eye")}
      </button>
      <span class="descriptors">${displayValue(data.tags)}</span>
    </div>
    <div class="summary-row combat-row">
      <span class="stat-group armor-stat">${iconMarkup("shield")}<span>${displayValue(data.armor)}</span></span>
      <button class="hp-button" type="button" data-hp="-1" aria-label="Decrease HP">−</button>
      <span class="hp-value">HP ${displayValue(data.hpCurrent)}/${displayValue(data.hpMax)}</span>
      <button class="hp-button" type="button" data-hp="1" aria-label="Increase HP">+</button>
    </div>
    <div class="summary-row damage-row">
      ${iconMarkup("sword")}
      <button class="damage" type="button" id="damage" title="Roll damage">${displayValue(data.damage)}</button>
      ${description ? `<span class="damage-description">(${escapeHtml(description)})</span>` : ""}
      ${damageTags ? `<span class="descriptors">${escapeHtml(damageTags)}</span>` : ""}
    </div>`;
}
