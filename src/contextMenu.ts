import OBR, { type Item, type Theme } from "@owlbear-rodeo/sdk";
import "./contextMenu.css";
import { CREATURE_KEY, EDIT_POPOVER_ID, isCreatureData, type CreatureData } from "./constants";
import { formatDamageResult, parseDamage, rollDamage } from "./damage";
import { adjustedHp } from "./hp";
import { buildContextSummary, displayValue, escapeHtml } from "./contextMenuView";

const app = document.querySelector<HTMLElement>("#context-menu")!;
const extensionUrl = new URL("./", window.location.href);
const params = new URLSearchParams(window.location.search);
const preview = params.get("preview");
let token: Item | undefined;
let updatingHp = false;

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
  const moves = (data.moves ?? "").split(/\r?\n/).map((move) => move.trim()).filter(Boolean);
  app.innerHTML = `
    <section class="panel">
      <div class="summary" aria-label="Creature summary">${buildContextSummary(data)}</div>
      <div class="details">
        <div class="line"><span class="label">Instinct:</span> ${displayValue(data.instinct)}</div>
        <div class="line">
          <span class="label">Moves:</span>
          ${moves.length
            ? `<ul class="moves">${moves.map((move) => `<li>${escapeHtml(move)}</li>`).join("")}</ul>`
            : '<span class="empty">—</span>'}
        </div>
        <div class="line"><span class="label">Treasure:</span> ${displayValue(data.treasure)}</div>
      </div>
      <button class="edit" type="button" id="edit">Edit creature</button>
    </section>`;

  for (const button of app.querySelectorAll<HTMLButtonElement>("[data-hp]")) {
    button.addEventListener("click", () => void adjustHp(Number(button.dataset.hp)));
  }
  app.querySelector("#damage")?.addEventListener("click", rollTokenDamage);
  app.querySelector("#visibility")?.addEventListener("click", () => void toggleVisibility());
  app.querySelector("#edit")?.addEventListener("click", () => void openEditor());
}

async function adjustHp(amount: number) {
  if (!token || updatingHp) return;
  updatingHp = true;
  for (const button of app.querySelectorAll<HTMLButtonElement>("[data-hp]")) button.disabled = true;
  try {
    const latest = (await OBR.scene.items.getItems([token.id]))[0];
    if (!latest) return;
    const data = getData(latest);
    const current = data.hpCurrent ?? 0;
    const next = adjustedHp(current, amount);
    await OBR.scene.items.updateItems([latest], (items) => {
      items[0].metadata[CREATURE_KEY] = { ...data, hpCurrent: next };
    });
  } finally {
    updatingHp = false;
  }
}

async function toggleVisibility() {
  if (!token) return;
  const latest = (await OBR.scene.items.getItems([token.id]))[0];
  if (!latest) return;
  const data = getData(latest);
  await OBR.scene.items.updateItems([latest], (items) => {
    items[0].metadata[CREATURE_KEY] = {
      ...data,
      visibleToPlayers: data.visibleToPlayers === false,
    };
  });
}

function rollTokenDamage() {
  if (!token) return;
  const damage = getData(token).damage?.trim();
  if (!damage) {
    void OBR.notification.show("This creature has no damage expression.", "WARNING");
    return;
  }
  const parsed = parseDamage(damage);
  if (!parsed) {
    void OBR.notification.show(`Unsupported damage expression: ${damage}`, "ERROR");
    return;
  }
  void OBR.notification.show(formatDamageResult(damage, rollDamage(parsed)), "SUCCESS");
}

async function openEditor() {
  if (!token) return;
  const url = new URL(extensionUrl);
  url.searchParams.set("itemId", token.id);
  await OBR.popover.open({
    id: EDIT_POPOVER_ID,
    url: url.toString(),
    height: 620,
    width: 390,
  });
}

async function loadSelectedToken() {
  const selection = await OBR.player.getSelection();
  token = selection?.length === 1
    ? (await OBR.scene.items.getItems([selection[0]]))[0]
    : undefined;
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
        instinct: "To defend the drowned temple",
        moves: "Strike from beneath the water\nCall the marsh to its aid",
        treasure: "A waterlogged purse and a silver idol",
        visibleToPlayers: true,
      } satisfies CreatureData,
    },
  } as unknown as Item;
  const previewIsLight = params.get("theme") === "light";
  document.documentElement.dataset.obrTheme = previewIsLight ? "light" : "dark";
  document.documentElement.style.setProperty("--dw-text", previewIsLight ? "#27272a" : "#f4f4f5");
  document.documentElement.style.setProperty("--dw-text-secondary", previewIsLight ? "#52525b" : "#d4d4d8");
  document.documentElement.style.setProperty("--dw-primary", "#7c3aed");
  render();
} else if (!OBR.isAvailable) {
  app.innerHTML = '<p class="error">Open this menu inside Owlbear Rodeo.</p>';
} else {
  OBR.onReady(async () => {
    applyTheme(await OBR.theme.getTheme());
    OBR.theme.onChange(applyTheme);
    await loadSelectedToken();
    OBR.player.onChange(() => void loadSelectedToken());
    OBR.scene.items.onChange((items) => {
      if (!token) return;
      const updated = items.find((item) => item.id === token!.id);
      if (updated) {
        token = updated;
        render();
      }
    });
  });
}
