import OBR, { type Item } from "@owlbear-rodeo/sdk";
import "./style.css";
import {
  CREATURE_KEY,
  DEFAULT_OVERLAY_VISIBILITY_KEY,
  EDIT_POPOVER_ID,
  type CreatureData,
} from "./constants";
import { maximumHpAutofill, readCreatureForm } from "./creatureForm";
import { isDamageFormulaInvalid, normalizeDamageFormula } from "./damage";
import {
  getDefaultOverlayVisibility,
  initializeCreatureData,
  persistDefaultOverlayVisibility,
  type RoomMetadata,
} from "./defaultVisibility";
import { buildHomeMarkup, type HomeRole } from "./homeView";

const app = document.querySelector<HTMLElement>("#app")!;
const params = new URLSearchParams(window.location.search);
const itemId = params.get("itemId");
const view = params.get("view") ?? "edit";
const preview = params.get("preview");

function escapeHtml(value: string): string {
  return value.replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;",
  })[character]!);
}

function numberValue(value: unknown): string {
  return typeof value === "number" && Number.isFinite(value) ? String(value) : "";
}

let homeRole: HomeRole = "PLAYER";
let homeMetadata: RoomMetadata = {};
let savingDefaultVisibility = false;

function renderHome() {
  const defaultVisibleToPlayers = getDefaultOverlayVisibility(homeMetadata);
  app.innerHTML = buildHomeMarkup(
    homeRole,
    defaultVisibleToPlayers,
    savingDefaultVisibility,
  );
  document.querySelector("#default-visibility")?.addEventListener(
    "click",
    () => void toggleDefaultVisibility(),
  );
}

async function toggleDefaultVisibility() {
  if (homeRole !== "GM" || savingDefaultVisibility) return;
  const next = !getDefaultOverlayVisibility(homeMetadata);
  savingDefaultVisibility = true;
  renderHome();
  try {
    await persistDefaultOverlayVisibility(
      (update) => OBR.room.setMetadata(update),
      next,
    );
    homeMetadata = {
      ...homeMetadata,
      [DEFAULT_OVERLAY_VISIBILITY_KEY]: next,
    };
  } catch (error) {
    console.error("DWTools could not save the default overlay visibility", error);
    void OBR.notification.show(
      "DWTools could not save the default overlay visibility.",
      "ERROR",
    );
  } finally {
    savingDefaultVisibility = false;
    renderHome();
  }
}

async function startHome() {
  [homeRole, homeMetadata] = await Promise.all([
    OBR.player.getRole(),
    OBR.room.getMetadata(),
  ]);
  renderHome();
  OBR.room.onMetadataChange((metadata) => {
    homeMetadata = metadata;
    renderHome();
  });
  OBR.player.onChange((player) => {
    homeRole = player.role;
    renderHome();
  });
}

function renderEditor(token: Item, data: CreatureData) {
  const hpOnly = view === "hp";
  app.innerHTML = `
    <form id="creature-form" class="editor">
      <header>
        <div><p class="eyebrow">DWTools creature</p><h1>${escapeHtml(token.name || "Unnamed token")}</h1></div>
        <button class="icon-button" type="button" id="close" aria-label="Close">×</button>
      </header>
      ${hpOnly ? `
        <div class="hp-row">
          <label>Current HP<input name="hpCurrent" type="number" step="1" value="${numberValue(data.hpCurrent)}"></label>
          <span class="slash">/</span>
          <label>Maximum HP<input name="hpMax" type="number" min="0" step="1" value="${numberValue(data.hpMax)}"></label>
        </div>
        <div class="quick-hp" aria-label="Quick HP adjustment">
          ${[-5, -1, 1, 5].map((amount) => `<button type="button" data-hp="${amount}">${amount > 0 ? "+" : ""}${amount}</button>`).join("")}
        </div>
      ` : `
        <label>Tags<input name="tags" type="text" maxlength="160" placeholder="Solitary, Small, Intelligent, Stealthy, Devious" value="${escapeHtml(data.tags ?? "")}"></label>
        <div class="vitals-row">
          <label>Armor<input name="armor" type="number" step="1" value="${numberValue(data.armor)}"></label>
          <label>Current HP<input name="hpCurrent" type="number" step="1" value="${numberValue(data.hpCurrent)}"></label>
          <span class="slash">/</span>
          <label>Maximum HP<input name="hpMax" type="number" min="0" step="1" value="${numberValue(data.hpMax)}"></label>
        </div>
        <div class="damage-fields">
          <label>Damage<input name="damage" type="text" maxlength="40" placeholder="b[2d6]+1" value="${escapeHtml(data.damage ?? "")}"></label>
          <label>Description<input name="damageDescription" type="text" maxlength="80" placeholder="Claws" value="${escapeHtml(data.damageDescription ?? "")}"></label>
        </div>
        <label>Damage tags<input name="damageTags" type="text" maxlength="160" placeholder="Close, Reach, Messy, Forceful" value="${escapeHtml(data.damageTags ?? "")}"></label>
        <label>Instinct<textarea name="instinct" rows="2">${escapeHtml(data.instinct ?? "")}</textarea></label>
        <label>Moves<textarea name="moves" rows="4" placeholder="One move per line">${escapeHtml(data.moves ?? "")}</textarea></label>
        <label>Treasure<textarea name="treasure" rows="3">${escapeHtml(data.treasure ?? "")}</textarea></label>
        <label class="visibility">
          <input name="visibleToPlayers" type="checkbox" ${data.visibleToPlayers === false ? "" : "checked"}>
          Show the token overlay to players
        </label>
      `}
      <footer>
        ${hpOnly ? "" : '<button class="danger" type="button" id="remove">Remove data</button>'}
        <button class="primary" type="submit">Save</button>
      </footer>
    </form>`;

  const form = document.querySelector<HTMLFormElement>("#creature-form")!;
  const hpInput = form.elements.namedItem("hpCurrent") as HTMLInputElement;
  const hpMaxInput = form.elements.namedItem("hpMax") as HTMLInputElement;
  hpInput.addEventListener("blur", () => {
    const autofill = maximumHpAutofill(hpInput.value, hpMaxInput.value);
    if (autofill !== null) hpMaxInput.value = autofill;
  });
  const damageInput = form.elements.namedItem("damage");
  if (damageInput instanceof HTMLInputElement) {
    damageInput.addEventListener("blur", () => {
      damageInput.value = normalizeDamageFormula(damageInput.value);
      const invalid = isDamageFormulaInvalid(damageInput.value);
      damageInput.classList.toggle("field-invalid", invalid);
      damageInput.setAttribute("aria-invalid", String(invalid));
    });
  }
  for (const button of form.querySelectorAll<HTMLButtonElement>("[data-hp]")) {
    button.addEventListener("click", () => {
      hpInput.value = String((Number(hpInput.value) || 0) + Number(button.dataset.hp));
    });
  }

  document.querySelector("#close")?.addEventListener("click", () => void OBR.popover.close(EDIT_POPOVER_ID));
  document.querySelector("#remove")?.addEventListener("click", async () => {
    await OBR.scene.items.updateItems([token], (items) => { delete items[0].metadata[CREATURE_KEY]; });
    await OBR.popover.close(EDIT_POPOVER_ID);
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const next = readCreatureForm(new FormData(form), data, hpOnly);
    await OBR.scene.items.updateItems([token], (items) => { items[0].metadata[CREATURE_KEY] = next; });
    await OBR.popover.close(EDIT_POPOVER_ID);
  });
}

if (preview === "home") {
  homeRole = "GM";
  homeMetadata = {
    [DEFAULT_OVERLAY_VISIBILITY_KEY]: params.get("default") !== "hidden",
  };
  renderHome();
} else if (preview === "editor") {
  renderEditor(
    { id: "preview", name: "Frogman", metadata: {} } as Item,
    {
      hpCurrent: 7,
      hpMax: 10,
      tags: "Solitary, Small, Intelligent, Stealthy, Devious",
      armor: 1,
      damage: "b[2d6]+1",
      damageDescription: "Claws",
      damageTags: "Close, Messy",
      instinct: "To defend the drowned temple",
      moves: "Strike from beneath the water\nCall the marsh to its aid",
      treasure: "A waterlogged purse and a silver idol",
    },
  );
} else if (!itemId) {
  renderHome();
  if (OBR.isAvailable) OBR.onReady(() => void startHome());
} else if (!OBR.isAvailable) {
  app.innerHTML = '<p class="error">Open this editor from a token inside Owlbear Rodeo.</p>';
} else {
  OBR.onReady(async () => {
    const [token, roomMetadata] = await Promise.all([
      OBR.scene.items.getItems([itemId]).then((items) => items[0]),
      OBR.room.getMetadata().catch((error) => {
        console.warn("DWTools could not load room visibility settings", error);
        return {};
      }),
    ]);
    if (!token) {
      app.innerHTML = '<p class="error">That token is no longer in the scene.</p>';
      return;
    }
    const raw = token.metadata[CREATURE_KEY];
    renderEditor(
      token,
      initializeCreatureData(raw, getDefaultOverlayVisibility(roomMetadata)),
    );
  });
}
