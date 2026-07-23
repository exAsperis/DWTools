import OBR, { type Item } from "@owlbear-rodeo/sdk";
import "./style.css";
import { CREATURE_KEY, EDIT_POPOVER_ID, EXTENSION_ID, isCreatureData, type CreatureData } from "./constants";
import { formatDamageResult, parseDamage, rollDamage } from "./damage";
import { syncCreatureDisplay } from "./display";

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

function optionalNumber(form: FormData, key: string): number | undefined {
  const raw = String(form.get(key) ?? "").trim();
  if (!raw) return undefined;
  const value = Number(raw);
  return Number.isFinite(value) ? Math.trunc(value) : undefined;
}

function optionalText(form: FormData, key: string): string | undefined {
  const value = String(form.get(key) ?? "").trim();
  return value || undefined;
}

function renderHome() {
  app.innerHTML = `
    <section class="home">
      <div class="crest">DW</div>
      <h1>Dungeon World Creatures</h1>
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
        <div><p class="eyebrow">Dungeon World creature</p><h1>${escapeHtml(token.name || "Unnamed token")}</h1></div>
        <button class="icon-button" type="button" id="close" aria-label="Close">×</button>
      </header>
      <div class="hp-row">
        <label>Current HP<input name="hpCurrent" type="number" step="1" value="${numberValue(data.hpCurrent)}"></label>
        <span class="slash">/</span>
        <label>Maximum HP<input name="hpMax" type="number" min="0" step="1" value="${numberValue(data.hpMax)}"></label>
      </div>
      <div class="quick-hp" aria-label="Quick HP adjustment">
        ${[-5, -1, 1, 5].map((amount) => `<button type="button" data-hp="${amount}">${amount > 0 ? "+" : ""}${amount}</button>`).join("")}
      </div>
      ${hpOnly ? "" : `
        <div class="two-column">
          <label>Armor<input name="armor" type="number" step="1" value="${numberValue(data.armor)}"></label>
          <label>Damage<input name="damage" type="text" maxlength="40" placeholder="b[2d6]+1" value="${escapeHtml(data.damage ?? "")}"></label>
        </div>
        <button class="secondary roll" type="button" id="roll">Roll damage</button>
        <label>Instinct<textarea name="instinct" rows="2">${escapeHtml(data.instinct ?? "")}</textarea></label>
        <label>Moves<textarea name="moves" rows="4" placeholder="One move per line">${escapeHtml(data.moves ?? "")}</textarea></label>
        <label>Treasure<textarea name="treasure" rows="3">${escapeHtml(data.treasure ?? "")}</textarea></label>
      `}
      <p id="message" class="message" role="status"></p>
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
  document.querySelector("#roll")?.addEventListener("click", () => {
    const damage = (form.elements.namedItem("damage") as HTMLInputElement).value.trim();
    const parsed = parseDamage(damage);
    const message = document.querySelector<HTMLElement>("#message")!;
    message.textContent = parsed ? formatDamageResult(damage, rollDamage(parsed)) : "Use d6, 2d6+1, b[2d6], or w[2d8]-1.";
  });

  document.querySelector("#remove")?.addEventListener("click", async () => {
    await OBR.scene.items.updateItems([token], (items) => { delete items[0].metadata[CREATURE_KEY]; });
    const updated = (await OBR.scene.items.getItems([token.id]))[0];
    if (updated) await syncCreatureDisplay(updated);
    await OBR.popover.close(EDIT_POPOVER_ID);
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const values = new FormData(form);
    const next: CreatureData = hpOnly ? { ...data } : {};
    next.hpCurrent = optionalNumber(values, "hpCurrent");
    next.hpMax = optionalNumber(values, "hpMax");
    if (!hpOnly) {
      next.armor = optionalNumber(values, "armor");
      next.damage = optionalText(values, "damage");
      next.instinct = optionalText(values, "instinct");
      next.moves = optionalText(values, "moves");
      next.treasure = optionalText(values, "treasure");
    }
    await OBR.scene.items.updateItems([token], (items) => { items[0].metadata[CREATURE_KEY] = next; });
    const updated = (await OBR.scene.items.getItems([token.id]))[0];
    if (updated) await syncCreatureDisplay(updated);
    window.parent.postMessage({ type: `${EXTENSION_ID}/sync`, itemId: token.id }, "*");
    await OBR.popover.close(EDIT_POPOVER_ID);
  });
}

if (preview === "editor") {
  renderEditor(
    { id: "preview", name: "Frogman", metadata: {} } as Item,
    {
      hpCurrent: 7,
      hpMax: 10,
      armor: 1,
      damage: "b[2d6]+1",
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
