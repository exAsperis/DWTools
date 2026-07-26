import OBR, { type Item } from "@owlbear-rodeo/sdk";
import "./style.css";
import { CREATURE_KEY, EDIT_POPOVER_ID, isCreatureData, type CreatureData } from "./constants";
import { readCreatureForm } from "./creatureForm";

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

function renderHome() {
  app.innerHTML = `
    <section class="home">
      <div class="crest">DW</div>
      <h1>DWTools</h1>
      <p>Right-click a character token to add or edit its creature stats.</p>
      <div class="sample"><strong>HP 7/10</strong> &nbsp;███████░░░<br><strong>ARM 1</strong> &nbsp; DMG d8+2</div>
      <p class="muted">The editor and quick HP controls are available to the GM.</p>
    </section>`;
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

if (preview === "editor") {
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
} else if (!OBR.isAvailable) {
  app.innerHTML = '<p class="error">Open this editor from a token inside Owlbear Rodeo.</p>';
} else {
  OBR.onReady(async () => {
    const token = (await OBR.scene.items.getItems([itemId]))[0];
    if (!token) {
      app.innerHTML = '<p class="error">That token is no longer in the scene.</p>';
      return;
    }
    const raw = token.metadata[CREATURE_KEY];
    renderEditor(token, isCreatureData(raw) ? raw : {});
  });
}
