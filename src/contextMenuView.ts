import type { CharacterRecord } from "./characterRepository";
import type { CreatureData } from "./constants";
import { renderContextMarkdown } from "./contextMarkdown";
import { iconMarkup } from "./icons";
import { encumbranceText, formatLoad, totalLoad } from "./inventory";
import {
  ABILITY_ABBREVIATIONS,
  CONDITION_NAMES,
  effectiveAbilityModifier,
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

function abilityRow(data: CreatureData, start: number, end: number): string {
  const abilities = [];
  for (let index = start; index < end; index += 1) {
    const isConditionAffected =
      data.conditions?.[CONDITION_NAMES[index]] === -1;
    const modifier = effectiveAbilityModifier(
      data.scores?.[index],
      data.conditions?.[CONDITION_NAMES[index]],
    );
    if (modifier === undefined) continue;
    const formatted = formatModifier(modifier);
    abilities.push(`
      <button class="modifier-roll${isConditionAffected ? " condition-affected" : ""}" type="button" data-ability="${index}" data-modifier="${modifier}" title="Roll 2d6${formatted}">
        <span>${ABILITY_ABBREVIATIONS[index]}</span> <strong>${formatted}</strong>
      </button>`);
  }
  return abilities.length
    ? `<div class="summary-row ability-summary-row">${abilities.join("")}</div>`
    : "";
}

function detailRow(label: string, value: string | undefined): string {
  const text = value?.trim();
  return text
    ? `<div class="summary-row detail-row"><span class="label">${label}:</span> ${escapeHtml(text)}</div>`
    : "";
}

export function buildContextSummary(
  data: CreatureData,
  record?: CharacterRecord,
): string {
  const description = data.damageDescription?.trim();
  const damageTags = data.damageTags?.trim();
  const hasDamage = Boolean(data.damage?.trim() || description || damageTags);
  const hasHp = data.hpCurrent !== undefined || data.hpMax !== undefined;
  const hpText =
    data.hpCurrent !== undefined
      ? `HP ${data.hpCurrent}${data.hpMax !== undefined ? `/${data.hpMax}` : ""}`
      : `Maximum HP ${data.hpMax}`;
  const combatFields = [
    data.armor !== undefined
      ? `<span class="stat-group armor-stat">${iconMarkup("shield")}<span>${data.armor}</span></span>`
      : "",
    hasHp
      ? `<span class="hp-group">
          ${data.hpCurrent !== undefined ? '<button class="hp-button" type="button" data-hp="-1" aria-label="Decrease HP">−</button>' : ""}
          <span class="hp-value">${hpText}</span>
          ${data.hpCurrent !== undefined ? '<button class="hp-button" type="button" data-hp="1" aria-label="Increase HP">+</button>' : ""}
        </span>`
      : "",
  ].filter(Boolean);
  const levelReady =
    data.level !== undefined &&
    data.xp !== undefined &&
    data.xp >= data.level + 7;
  const progressionFields = [
    data.level !== undefined
      ? `<span class="level-value ${levelReady ? "level-ready" : ""}">Lv ${data.level}</span>`
      : "",
    data.xp !== undefined
      ? `<span class="xp-group">
          <button class="xp-button" type="button" data-xp="-1" aria-label="Decrease XP">−</button>
          <span>XP ${data.xp}</span>
          <button class="xp-button" type="button" data-xp="1" aria-label="Increase XP">+</button>
        </span>`
      : "",
  ].filter(Boolean);
  const moves = data.moves?.trim();
  const treasure = data.treasure?.trim();
  const currentLoad = record ? totalLoad(record.inventory) : undefined;
  const encumbrance =
    record && currentLoad !== undefined
      ? encumbranceText(currentLoad, record.fields.maxLoad)
      : undefined;
  const encumbranceClass =
    encumbrance === "Encumbered (-1)"
      ? "encumbered-minus-one"
      : encumbrance === "Encumbered (X)"
        ? "encumbered-x"
        : "";
  return `
    ${combatFields.length ? `<div class="summary-row combat-row">${combatFields.join("")}</div>` : ""}
    ${
      hasDamage
        ? `<div class="summary-row damage-row">
          ${iconMarkup("sword")}
          ${data.damage?.trim() ? `<button class="damage" type="button" id="damage" title="Roll damage">🎲 ${escapeHtml(data.damage.trim())}</button>` : ""}
          ${description ? `<span class="damage-description">(${escapeHtml(description)})</span>` : ""}
          ${damageTags ? `<span class="descriptors">${escapeHtml(damageTags)}</span>` : ""}
        </div>`
        : ""
    }
    ${abilityRow(data, 0, 3)}
    ${abilityRow(data, 3, 6)}
    ${
      record
        ? `<div class="summary-row load-row ${encumbranceClass}">
          ${formatLoad(record.inventory, record.fields.maxLoad)}
          ${encumbrance ? `<strong>${encumbrance}</strong>` : ""}
        </div>`
        : ""
    }
    ${progressionFields.length ? `<div class="summary-row progression-summary-row">${progressionFields.join("")}</div>` : ""}
    ${detailRow("Tags", data.tags)}
    ${detailRow("Instinct", data.instinct)}
    ${
      moves
        ? `<div class="summary-row detail-row">
          <span class="label">Moves:</span>
          <div class="markdown-content">${renderContextMarkdown(moves)}</div>
        </div>`
        : ""
    }
    ${
      treasure
        ? `<div class="summary-row detail-row">
          <span class="label">Treasure:</span>
          <div class="markdown-content">${renderContextMarkdown(treasure)}</div>
        </div>`
        : ""
    }`;
}
