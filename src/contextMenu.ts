import OBR, { type Item, type Theme } from "@owlbear-rodeo/sdk";
import "./contextMenu.css";
import {
  CREATURE_KEY,
  EDIT_POPOVER_ID,
  isCreatureData,
  type CreatureData,
} from "./constants";
import type { CreatureService } from "./characterService";
import { rollDamageFormula } from "./damage";
import { adjustedHp } from "./hp";
import { buildContextSummary } from "./contextMenuView";
import { createObrCreatureService } from "./obrCharacterServices";
import { createObrCharacterRepository } from "./obrCharacterServices";
import { ensureMetadataNamespaceMigrated } from "./obrMetadataMigration";
import type {
  CharacterRecord,
  CharacterRepository,
} from "./characterRepository";
import { getCharacterLink } from "./creatureFields";

const app = document.querySelector<HTMLElement>("#context-menu")!;
const extensionUrl = new URL("./", window.location.href);
const params = new URLSearchParams(window.location.search);
const preview = params.get("preview");
let token: Item | undefined;
let updatingHp = false;
let creatureService: CreatureService | undefined;
let characterRepository: CharacterRepository | undefined;
let characterRecord: CharacterRecord | undefined;

function getData(item: Item): CreatureData {
  const raw = item.metadata[CREATURE_KEY];
  return isCreatureData(raw) ? raw : {};
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.dataset.obrTheme = theme.mode.toLowerCase();
  root.style.setProperty("--dw-text", theme.text.primary);
  root.style.setProperty("--dw-text-secondary", theme.text.secondary);
  root.style.setProperty("--dw-primary", theme.primary.main);
}

function render() {
  if (!token) {
    app.innerHTML = '<p class="loading">Select one character token.</p>';
    return;
  }

  const data = getData(token);
  app.innerHTML = `
    <section class="panel">
      <div class="summary" aria-label="Creature summary">${buildContextSummary(data, characterRecord)}</div>
      <button class="edit" type="button" id="edit">Edit creature</button>
    </section>`;

  for (const button of app.querySelectorAll<HTMLButtonElement>("[data-hp]")) {
    button.addEventListener(
      "click",
      () => void adjustHp(Number(button.dataset.hp)),
    );
  }
  for (const button of app.querySelectorAll<HTMLButtonElement>("[data-xp]")) {
    button.addEventListener(
      "click",
      () => void adjustXp(Number(button.dataset.xp)),
    );
  }
  for (const button of app.querySelectorAll<HTMLButtonElement>(
    "[data-modifier]",
  )) {
    button.addEventListener("click", () => showModifierRoll(button));
  }
  app.querySelector("#damage")?.addEventListener("click", rollTokenDamage);
  app
    .querySelector("#edit")
    ?.addEventListener("click", () => void openEditor());
}

async function adjustHp(amount: number) {
  if (!token || !creatureService || updatingHp) return;
  updatingHp = true;
  for (const button of app.querySelectorAll<HTMLButtonElement>("[data-hp]"))
    button.disabled = true;
  try {
    const latest = (await OBR.scene.items.getItems([token.id]))[0];
    if (!latest) return;
    const data = getData(latest);
    const current = data.hpCurrent ?? 0;
    const next = adjustedHp(current, amount);
    await creatureService.updateCreatureFields(latest.id, { hpCurrent: next });
  } catch (error) {
    console.error("DWTools could not update creature HP", error);
    void OBR.notification.show(
      error instanceof Error
        ? error.message
        : "DWTools could not update creature HP.",
      "ERROR",
    );
  } finally {
    updatingHp = false;
    render();
  }
}

async function adjustXp(amount: number) {
  if (!token || !creatureService) return;
  const latest = (await OBR.scene.items.getItems([token.id]))[0];
  if (!latest) return;
  const data = getData(latest);
  try {
    await creatureService.updateCreatureFields(latest.id, {
      xp: Math.max(0, (data.xp ?? 0) + amount),
    });
  } catch (error) {
    console.error("DWTools could not update XP", error);
    void OBR.notification.show(
      error instanceof Error ? error.message : "DWTools could not update XP.",
      "ERROR",
    );
  }
}

function showModifierRoll(button: HTMLButtonElement) {
  const modifier = Number(button.dataset.modifier);
  if (!Number.isFinite(modifier)) return;
  const sign = modifier >= 0 ? "+" : "";
  const result = rollDamageFormula(`2d6${sign}${modifier}`);
  if (result) void OBR.notification.show(result, "SUCCESS");
}

function rollTokenDamage() {
  if (!token) return;
  const damage = getData(token).damage?.trim();
  if (!damage) {
    void OBR.notification.show(
      "This creature has no damage expression.",
      "WARNING",
    );
    return;
  }
  const result = rollDamageFormula(damage);
  if (!result) {
    void OBR.notification.show(
      `Unsupported damage expression: ${damage}`,
      "ERROR",
    );
    return;
  }
  void OBR.notification.show(result, "SUCCESS");
}

async function openEditor() {
  if (!token) return;
  const url = new URL(extensionUrl);
  url.searchParams.set("itemId", token.id);
  await OBR.popover.open({
    id: EDIT_POPOVER_ID,
    url: url.toString(),
    height: 760,
    width: 390,
  });
}

async function loadSelectedToken() {
  const selection = await OBR.player.getSelection();
  token =
    selection?.length === 1
      ? (await OBR.scene.items.getItems([selection[0]]))[0]
      : undefined;
  characterRecord = undefined;
  const link = token && getCharacterLink(token);
  if (link && characterRepository) {
    const lookup = await characterRepository.inspect(link.characterId);
    characterRecord = lookup.status === "active" ? lookup.record : undefined;
  }
  render();
}

if (preview === "context") {
  token = {
    id: "preview",
    name: "Frogman",
    metadata: {
      [CREATURE_KEY]: {
        tags: "Solitary, Small, Intelligent, Stealthy, Devious",
        armor: 1,
        hpCurrent: 7,
        hpMax: 10,
        damage: "b[2d6]+1",
        damageDescription: "Claws",
        damageTags: "Close, Messy",
        level: 3,
        xp: 10,
        scores: [16, 13, 10, 8, 11, 7],
        conditions: { weak: -1 },
        instinct: "To defend the drowned temple",
        moves: "Strike from beneath the water\nCall the marsh to its aid",
        treasure: "A waterlogged purse and a silver idol",
        visibleToPlayers: true,
      } satisfies CreatureData,
    },
  } as unknown as Item;
  characterRecord = {
    schemaVersion: 3,
    id: "preview-character",
    fields: { name: "Frogman", maxLoad: 11 },
    inventory: [
      ["Coin", 0.01, 137],
      ["Bag of Books", 0.4, 3],
    ],
    revision: 1,
    createdAt: "2026-07-27T12:00:00.000Z",
    createdBy: "preview",
    updatedAt: "2026-07-27T12:00:00.000Z",
    updatedBy: "preview",
    writeId: "preview-write",
  };
  const previewIsLight = params.get("theme") === "light";
  document.documentElement.dataset.obrTheme = previewIsLight ? "light" : "dark";
  document.documentElement.style.setProperty(
    "--dw-text",
    previewIsLight ? "#27272a" : "#f4f4f5",
  );
  document.documentElement.style.setProperty(
    "--dw-text-secondary",
    previewIsLight ? "#52525b" : "#d4d4d8",
  );
  document.documentElement.style.setProperty("--dw-primary", "#7c3aed");
  render();
} else if (!OBR.isAvailable) {
  app.innerHTML = '<p class="error">Open this menu inside Owlbear Rodeo.</p>';
} else {
  OBR.onReady(async () => {
    try {
      await ensureMetadataNamespaceMigrated();
    } catch (error) {
      console.error("DWTools metadata namespace migration failed", error);
      app.innerHTML =
        '<p class="error">DWTools could not migrate its saved data. Reload Owlbear and try again.</p>';
      await OBR.notification.show(
        "DWTools could not migrate its saved data.",
        "ERROR",
      );
      return;
    }
    characterRepository = createObrCharacterRepository();
    creatureService = createObrCreatureService(characterRepository);
    applyTheme(await OBR.theme.getTheme());
    OBR.theme.onChange(applyTheme);
    await loadSelectedToken();
    OBR.player.onChange(() => void loadSelectedToken());
    OBR.scene.items.onChange((items) => {
      if (!token) return;
      const updated = items.find((item) => item.id === token!.id);
      if (updated) {
        token = updated;
        void loadSelectedToken();
      }
    });
    characterRepository.subscribe((changes) => {
      const link = token && getCharacterLink(token);
      if (
        link &&
        changes.some((change) => change.characterId === link.characterId)
      ) {
        void loadSelectedToken();
      }
    });
  });
}
