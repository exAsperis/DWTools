import OBR, { type Item } from "@owlbear-rodeo/sdk";
import "./style.css";
import {
  type CharacterLookup,
  type CharacterRecord,
  type CharacterRepository,
  type CharacterStorageUsage,
  type CharacterTombstone,
} from "./characterRepository";
import {
  CharacterManagerService,
  CreatureService,
  currentSceneLinkedTokenCounts,
} from "./characterService";
import {
  buildCharacterManagerMarkup,
  buildCharacterSummary,
  buildCreatureFieldsMarkup,
  escapeHtml,
  numberValue,
  type CharacterManagerViewState,
} from "./characterView";
import {
  type CreatureFieldPatch,
  type CreatureFields,
  CREATURE_KEY,
  DEFAULT_OVERLAY_VISIBILITY_KEY,
  EDIT_POPOVER_ID,
} from "./constants";
import {
  extractCreatureFields,
  getCharacterLink,
  normalizeCreatureFields,
} from "./creatureFields";
import { maximumHpAutofill, readCreatureFieldsForm } from "./creatureForm";
import { isDamageFormulaInvalid, normalizeDamageFormula } from "./damage";
import {
  getDefaultOverlayVisibility,
  initializeCreatureData,
  persistDefaultOverlayVisibility,
  type RoomMetadata,
} from "./defaultVisibility";
import { buildHomeMarkup, type HomeRole } from "./homeView";
import {
  createObrCharacterManagerService,
  createObrCharacterRepository,
  createObrCreatureService,
} from "./obrCharacterServices";

const app = document.querySelector<HTMLElement>("#app")!;
const params = new URLSearchParams(window.location.search);
const itemId = params.get("itemId");
const view = params.get("view") ?? "edit";
const preview = params.get("preview");

function messageFrom(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

function notify(message: string, type: "SUCCESS" | "WARNING" | "ERROR"): void {
  if (OBR.isAvailable) void OBR.notification.show(message, type);
}

function validateDamageInput(form: HTMLFormElement): boolean {
  const input = form.elements.namedItem("damage");
  if (!(input instanceof HTMLInputElement)) return true;
  input.value = normalizeDamageFormula(input.value);
  const invalid = isDamageFormulaInvalid(input.value);
  input.classList.toggle("field-invalid", invalid);
  input.setAttribute("aria-invalid", String(invalid));
  return !invalid;
}

function attachDamageFeedback(form: HTMLFormElement): void {
  const input = form.elements.namedItem("damage");
  if (input instanceof HTMLInputElement) {
    input.addEventListener("blur", () => validateDamageInput(form));
  }
}

function fieldPatch(
  current: CreatureFields,
  next: CreatureFields,
  hpOnly: boolean,
): CreatureFieldPatch {
  const keys: Array<keyof CreatureFields> = hpOnly
    ? ["hpCurrent", "hpMax"]
    : [
        "name",
        "tags",
        "hpCurrent",
        "hpMax",
        "armor",
        "damage",
        "damageDescription",
        "damageTags",
        "instinct",
        "moves",
        "treasure",
        "visibleToPlayers",
      ];
  const patch: CreatureFieldPatch = {};
  for (const key of keys) {
    if (current[key] !== next[key]) {
      (patch as Record<keyof CreatureFields, unknown>)[key] = next[key];
    }
  }
  return patch;
}

// Main action panel ----------------------------------------------------------

let homeRole: HomeRole = "PLAYER";
let homeMetadata: RoomMetadata = {};
let savingDefaultVisibility = false;
let homeRepository: CharacterRepository | undefined;
let homeCreatureService: CreatureService | undefined;
let homeManagerService: CharacterManagerService | undefined;
let managerRecords: CharacterRecord[] = [];
let managerTombstones: CharacterTombstone[] = [];
let managerCounts = new Map<string, number>();
let managerUsage: CharacterStorageUsage | undefined;
let managerLoading = false;
let managerSaving = false;
let managerError: string | undefined;
let managerSearch = "";
let managerShowTombstones = false;
let managerEditing: CharacterManagerViewState["editing"];

function managerState(): CharacterManagerViewState {
  return {
    records: managerRecords,
    tombstones: managerTombstones,
    showTombstones: managerShowTombstones,
    counts: managerCounts,
    usage: managerUsage,
    loading: managerLoading,
    saving: managerSaving,
    error: managerError,
    search: managerSearch,
    editing: managerEditing,
  };
}

function renderHome(): void {
  const defaultVisibleToPlayers = getDefaultOverlayVisibility(homeMetadata);
  const managerMarkup =
    homeRole === "GM" ? buildCharacterManagerMarkup(managerState()) : "";
  app.innerHTML = buildHomeMarkup(
    homeRole,
    defaultVisibleToPlayers,
    savingDefaultVisibility,
    managerMarkup,
  );
  document
    .querySelector("#default-visibility")
    ?.addEventListener("click", () => void toggleDefaultVisibility());
  bindManagerControls();
}

function bindManagerControls(): void {
  document.querySelector("#manager-create")?.addEventListener("click", () => {
    managerError = undefined;
    managerEditing = {
      kind: "create",
      fields: { name: "Untitled character", visibleToPlayers: true },
    };
    renderHome();
  });
  document.querySelector("#manager-cancel")?.addEventListener("click", () => {
    managerEditing = undefined;
    managerError = undefined;
    renderHome();
  });
  document
    .querySelector<HTMLInputElement>("#show-tombstones")
    ?.addEventListener("change", (event) => {
      managerShowTombstones = (event.currentTarget as HTMLInputElement).checked;
      renderHome();
    });
  document
    .querySelector<HTMLInputElement>("#manager-search")
    ?.addEventListener("input", (event) => {
      managerSearch = (event.currentTarget as HTMLInputElement).value;
      const query = managerSearch.trim().toLocaleLowerCase();
      for (const card of document.querySelectorAll<HTMLElement>(
        "[data-character-search]",
      )) {
        card.hidden = !String(card.dataset.characterSearch).includes(query);
      }
    });
  for (const button of document.querySelectorAll<HTMLButtonElement>(
    "[data-edit-character]",
  )) {
    button.addEventListener("click", () => {
      const record = managerRecords.find(
        (entry) => entry.id === button.dataset.editCharacter,
      );
      if (!record) return;
      managerError = undefined;
      managerEditing = {
        kind: "edit",
        id: record.id,
        fields: record.fields,
      };
      renderHome();
    });
  }
  for (const button of document.querySelectorAll<HTMLButtonElement>(
    "[data-delete-character]",
  )) {
    button.addEventListener(
      "click",
      () => void deleteManagedCharacter(button.dataset.deleteCharacter),
    );
  }
  for (const button of document.querySelectorAll<HTMLButtonElement>(
    "[data-delete-permanently]",
  )) {
    button.addEventListener(
      "click",
      () =>
        void deleteManagedCharacterPermanently(
          button.dataset.deletePermanently,
        ),
    );
  }
  const form = document.querySelector<HTMLFormElement>(
    "#character-manager-form",
  );
  if (form) {
    attachDamageFeedback(form);
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      void saveManagedCharacter(form);
    });
  }
}

async function refreshManager(render = true): Promise<void> {
  if (homeRole !== "GM" || !homeRepository || !homeCreatureService) {
    return;
  }
  managerLoading = true;
  managerError = undefined;
  if (render && !managerEditing) renderHome();
  try {
    const [storedRecords, counts, usage] = await Promise.all([
      homeRepository.listStored(),
      currentSceneLinkedTokenCounts(homeCreatureService.scene),
      homeRepository.estimateUsage(),
    ]);
    managerRecords = storedRecords.flatMap((record) =>
      record.deleted ? [] : [record],
    );
    managerTombstones = storedRecords.flatMap((record) =>
      record.deleted ? [record] : [],
    );
    managerCounts = counts;
    managerUsage = usage;
  } catch (error) {
    managerError = messageFrom(
      error,
      "DWTools could not load character records.",
    );
  } finally {
    managerLoading = false;
    if (render && !managerEditing) renderHome();
  }
}

async function saveManagedCharacter(form: HTMLFormElement): Promise<void> {
  if (!managerEditing || !homeManagerService || managerSaving) return;
  if (!validateDamageInput(form) || !form.reportValidity()) {
    managerError = "Correct the highlighted character fields before saving.";
    renderHome();
    return;
  }
  managerSaving = true;
  managerError = undefined;
  renderHome();
  try {
    const fields = normalizeCreatureFields(
      readCreatureFieldsForm(new FormData(form), managerEditing.fields, false),
    );
    if (managerEditing.kind === "create") {
      await homeManagerService.create(fields);
      notify("Character record created.", "SUCCESS");
    } else {
      await homeManagerService.save(managerEditing.id!, fields);
      notify("Character record saved.", "SUCCESS");
    }
    managerEditing = undefined;
    await refreshManager(false);
    if (managerUsage?.nearLimit) {
      notify("Room metadata is approaching Owlbear's size limit.", "WARNING");
    }
  } catch (error) {
    managerError = messageFrom(error, "DWTools could not save the record.");
  } finally {
    managerSaving = false;
    renderHome();
  }
}

async function deleteManagedCharacter(
  characterId: string | undefined,
): Promise<void> {
  if (!characterId || !homeManagerService || managerSaving) return;
  const record = managerRecords.find((entry) => entry.id === characterId);
  if (!record) return;
  if (
    !window.confirm(
      `Delete the room character record "${record.fields.name}"? Current-scene tokens will be unlinked but keep their creature fields.`,
    )
  ) {
    return;
  }
  managerSaving = true;
  managerError = undefined;
  renderHome();
  try {
    await homeManagerService.delete(characterId);
    notify("Character record deleted.", "SUCCESS");
    await refreshManager(false);
  } catch (error) {
    managerError = messageFrom(error, "DWTools could not delete the record.");
  } finally {
    managerSaving = false;
    renderHome();
  }
}

async function deleteManagedCharacterPermanently(
  characterId: string | undefined,
): Promise<void> {
  if (!characterId || !homeManagerService || managerSaving) return;
  const tombstone = managerTombstones.find((entry) => entry.id === characterId);
  if (!tombstone) return;
  const displayName =
    tombstone.name ?? `deleted character ${tombstone.id.slice(0, 8)}`;
  if (
    !window.confirm(
      `Permanently delete "${displayName}"? This cannot be undone and will orphan linked creature tokens in other scenes.`,
    )
  ) {
    return;
  }
  managerSaving = true;
  managerError = undefined;
  renderHome();
  try {
    await homeManagerService.deletePermanently(characterId);
    notify("Character record permanently deleted.", "SUCCESS");
    await refreshManager(false);
  } catch (error) {
    managerError = messageFrom(
      error,
      "DWTools could not permanently delete the record.",
    );
  } finally {
    managerSaving = false;
    renderHome();
  }
}

async function toggleDefaultVisibility(): Promise<void> {
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
    console.error(
      "DWTools could not save the default overlay visibility",
      error,
    );
    notify("DWTools could not save the default overlay visibility.", "ERROR");
  } finally {
    savingDefaultVisibility = false;
    renderHome();
  }
}

async function startHome(): Promise<void> {
  homeRepository = createObrCharacterRepository();
  homeCreatureService = createObrCreatureService(homeRepository);
  homeManagerService = createObrCharacterManagerService(
    homeRepository,
    homeCreatureService,
  );
  [homeRole, homeMetadata] = await Promise.all([
    OBR.player.getRole(),
    OBR.room.getMetadata(),
  ]);
  if (homeRole === "GM") await refreshManager(false);
  renderHome();

  const unsubscribers = [
    OBR.room.onMetadataChange((metadata) => {
      homeMetadata = metadata;
      renderHome();
    }),
    homeRepository.subscribe(() => {
      if (homeRole === "GM") void refreshManager(!managerEditing);
    }),
    OBR.player.onChange((player) => {
      homeRole = player.role;
      managerEditing = undefined;
      if (homeRole === "GM") void refreshManager();
      else renderHome();
    }),
    OBR.scene.items.onChange(() => {
      if (homeRole === "GM" && !managerEditing) void refreshManager();
    }),
  ];
  window.addEventListener(
    "unload",
    () => {
      for (const unsubscribe of unsubscribers) unsubscribe();
    },
    { once: true },
  );
}

// Creature editor -----------------------------------------------------------

let editorRepository: CharacterRepository | undefined;
let editorService: CreatureService | undefined;
let editorToken: Item | undefined;
let editorFields: CreatureFields | undefined;
let editorLookup: CharacterLookup = { status: "missing" };
let editorLinkRecords: CharacterRecord[] = [];
let editorLinking = false;
let editorLinkSearch = "";
let editorBusy = false;
let editorError: string | undefined;
let editorHadCreatureData = false;

function buildCharacterRecordSection(token: Item): string {
  const link = getCharacterLink(token);
  let status: string;
  let controls: string;
  if (!link) {
    status = "Character record: <strong>Not linked</strong>";
    controls =
      '<button type="button" class="secondary" id="link-character">Link to character</button>';
  } else if (editorLookup.status === "active") {
    status = `Character record: <strong>${escapeHtml(editorLookup.record.fields.name)}</strong>`;
    controls = `
      <button type="button" class="secondary" id="link-character">Change link</button>
      <button type="button" class="secondary" id="unlink-character">Unlink</button>`;
  } else {
    const reason =
      editorLookup.status === "malformed"
        ? "malformed"
        : editorLookup.status === "deleted"
          ? "deleted"
          : "missing";
    status = `Character record: <strong class="orphaned">Orphaned link (${reason})</strong>`;
    controls = `
      <button type="button" class="secondary" id="link-character">Relink to existing</button>
      <button type="button" class="secondary" id="create-character">Create new from creature</button>
      <button type="button" class="secondary" id="unlink-character">Unlink and retain fields</button>`;
  }

  const query = editorLinkSearch.trim().toLocaleLowerCase();
  const records = query
    ? editorLinkRecords.filter(
        (record) =>
          record.fields.name.toLocaleLowerCase().includes(query) ||
          record.fields.tags?.toLocaleLowerCase().includes(query),
      )
    : editorLinkRecords;
  const picker = editorLinking
    ? `
      <div class="link-picker">
        <p>Selecting an existing record replaces every persistent DWTools field on this token.</p>
        <label>Search characters<input id="link-search" type="search" value="${escapeHtml(editorLinkSearch)}"></label>
        <div class="link-results">
          ${
            records.length
              ? records
                  .map(
                    (record) => `
                <button type="button" data-link-record="${escapeHtml(record.id)}" data-link-search="${escapeHtml(`${record.fields.name} ${record.fields.tags ?? ""}`.toLocaleLowerCase())}">
                  ${buildCharacterSummary(record)}
                </button>`,
                  )
                  .join("")
              : '<span class="manager-status">No matching character records.</span>'
          }
        </div>
        <div class="manager-actions">
          <button type="button" class="secondary" id="create-character">Create new from this creature</button>
          <button type="button" class="secondary" id="cancel-link">Cancel</button>
        </div>
      </div>`
    : "";
  return `
    <section class="character-link-section">
      <span>${status}</span>
      <div class="link-actions">${controls}</div>
      ${picker}
    </section>`;
}

function renderEditor(): void {
  if (!editorToken || !editorFields) return;
  const hpOnly = view === "hp";
  app.innerHTML = `
    <form id="creature-form" class="editor">
      <header>
        <div><p class="eyebrow">DWTools creature</p><h1>${escapeHtml(editorFields.name)}</h1></div>
        <button class="icon-button" type="button" id="close" aria-label="Close">×</button>
      </header>
      ${buildCharacterRecordSection(editorToken)}
      ${editorError ? `<p class="inline-error">${escapeHtml(editorError)}</p>` : ""}
      ${
        hpOnly
          ? `
          <div class="hp-row">
            <label>Current HP<input name="hpCurrent" type="number" step="1" value="${numberValue(editorFields.hpCurrent)}"></label>
            <span class="slash">/</span>
            <label>Maximum HP<input name="hpMax" type="number" min="0" step="1" value="${numberValue(editorFields.hpMax)}"></label>
          </div>
          <div class="quick-hp" aria-label="Quick HP adjustment">
            ${[-5, -1, 1, 5].map((amount) => `<button type="button" data-hp="${amount}">${amount > 0 ? "+" : ""}${amount}</button>`).join("")}
          </div>`
          : buildCreatureFieldsMarkup(editorFields)
      }
      <footer>
        ${hpOnly ? "" : '<button class="danger" type="button" id="remove">Remove data</button>'}
        <button class="primary" type="submit" ${editorBusy ? "disabled" : ""}>${editorBusy ? "Saving…" : "Save"}</button>
      </footer>
    </form>`;

  const form = document.querySelector<HTMLFormElement>("#creature-form")!;
  const hpInput = form.elements.namedItem("hpCurrent") as HTMLInputElement;
  const hpMaxInput = form.elements.namedItem("hpMax") as HTMLInputElement;
  hpInput.addEventListener("blur", () => {
    const autofill = maximumHpAutofill(hpInput.value, hpMaxInput.value);
    if (autofill !== null) hpMaxInput.value = autofill;
  });
  attachDamageFeedback(form);
  for (const button of form.querySelectorAll<HTMLButtonElement>("[data-hp]")) {
    button.addEventListener("click", () => {
      hpInput.value = String(
        (Number(hpInput.value) || 0) + Number(button.dataset.hp),
      );
    });
  }

  document
    .querySelector("#close")
    ?.addEventListener("click", () => void OBR.popover.close(EDIT_POPOVER_ID));
  document
    .querySelector("#remove")
    ?.addEventListener("click", () => void removeCreatureData());
  document
    .querySelector("#link-character")
    ?.addEventListener("click", () => void openLinkPicker());
  for (const button of document.querySelectorAll("#create-character")) {
    button.addEventListener("click", () => void createAndLinkCharacter());
  }
  document
    .querySelector("#unlink-character")
    ?.addEventListener("click", () => void unlinkCharacter());
  document.querySelector("#cancel-link")?.addEventListener("click", () => {
    editorLinking = false;
    editorLinkSearch = "";
    renderEditor();
  });
  document
    .querySelector<HTMLInputElement>("#link-search")
    ?.addEventListener("input", (event) => {
      editorLinkSearch = (event.currentTarget as HTMLInputElement).value;
      const query = editorLinkSearch.trim().toLocaleLowerCase();
      for (const button of document.querySelectorAll<HTMLElement>(
        "[data-link-search]",
      )) {
        button.hidden = !String(button.dataset.linkSearch).includes(query);
      }
    });
  for (const button of document.querySelectorAll<HTMLButtonElement>(
    "[data-link-record]",
  )) {
    button.addEventListener(
      "click",
      () => void linkExistingCharacter(button.dataset.linkRecord),
    );
  }
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    void saveCreature(form);
  });
}

async function reloadEditor(): Promise<void> {
  if (!itemId || !editorService || !editorRepository) return;
  const token = await editorService.getItem(itemId);
  if (!token) {
    app.innerHTML =
      '<p class="error">That token is no longer in the scene.</p>';
    return;
  }
  editorHadCreatureData = CREATURE_KEY in token.metadata;
  editorToken = token;
  editorFields = extractCreatureFields(token);
  const link = getCharacterLink(token);
  editorLookup = link
    ? await editorRepository.inspect(link.characterId)
    : { status: "missing" };
  if (editorLookup.status === "active") {
    editorFields = editorLookup.record.fields;
  }
  renderEditor();
}

async function openLinkPicker(): Promise<void> {
  if (!editorRepository || editorBusy) return;
  editorBusy = true;
  editorError = undefined;
  renderEditor();
  try {
    editorLinkRecords = await editorRepository.list();
    editorLinking = true;
  } catch (error) {
    editorError = messageFrom(
      error,
      "DWTools could not load character records.",
    );
  } finally {
    editorBusy = false;
    renderEditor();
  }
}

async function linkExistingCharacter(
  characterId: string | undefined,
): Promise<void> {
  if (!characterId || !editorService || !editorToken || editorBusy) return;
  const selected = editorLinkRecords.find(
    (record) => record.id === characterId,
  );
  if (!selected) return;
  if (
    !window.confirm(
      `Link to "${selected.fields.name}"? This token's current DWTools fields will be replaced by the latest character record.`,
    )
  ) {
    return;
  }
  editorBusy = true;
  editorError = undefined;
  renderEditor();
  try {
    await editorService.linkToExistingCharacter(editorToken.id, characterId);
    notify(`Linked to ${selected.fields.name}.`, "SUCCESS");
    editorLinking = false;
    await reloadEditor();
  } catch (error) {
    editorError = messageFrom(error, "DWTools could not link the character.");
  } finally {
    editorBusy = false;
    renderEditor();
  }
}

async function createAndLinkCharacter(): Promise<void> {
  if (!editorService || !editorToken || editorBusy) return;
  editorBusy = true;
  editorError = undefined;
  renderEditor();
  try {
    const { record } = await editorService.createAndLinkCharacter(
      editorToken.id,
    );
    notify(`Created and linked ${record.fields.name}.`, "SUCCESS");
    editorLinking = false;
    await reloadEditor();
  } catch (error) {
    editorError = messageFrom(
      error,
      "DWTools could not create and link the character.",
    );
  } finally {
    editorBusy = false;
    renderEditor();
  }
}

async function unlinkCharacter(): Promise<void> {
  if (!editorService || !editorToken || editorBusy) return;
  editorBusy = true;
  editorError = undefined;
  renderEditor();
  try {
    await editorService.unlinkCharacter(editorToken.id);
    notify("Character unlinked; creature fields were retained.", "SUCCESS");
    await reloadEditor();
  } catch (error) {
    editorError = messageFrom(error, "DWTools could not unlink the character.");
  } finally {
    editorBusy = false;
    renderEditor();
  }
}

async function removeCreatureData(): Promise<void> {
  if (!editorService || !editorToken || editorBusy) return;
  const linked = Boolean(getCharacterLink(editorToken));
  if (
    linked &&
    !window.confirm(
      "Remove this token's DWTools data? The token will be unlinked, but the room character record will be preserved.",
    )
  ) {
    return;
  }
  editorBusy = true;
  renderEditor();
  try {
    await editorService.removeCreatureData(editorToken.id);
    await OBR.popover.close(EDIT_POPOVER_ID);
  } catch (error) {
    editorError = messageFrom(
      error,
      "DWTools could not remove the creature data.",
    );
    editorBusy = false;
    renderEditor();
  }
}

async function saveCreature(form: HTMLFormElement): Promise<void> {
  if (!editorService || !editorToken || !editorFields || editorBusy) return;
  if (!validateDamageInput(form) || !form.reportValidity()) {
    editorError = "Correct the highlighted creature fields before saving.";
    renderEditor();
    return;
  }
  editorBusy = true;
  editorError = undefined;
  renderEditor();
  try {
    const hpOnly = view === "hp";
    const next = normalizeCreatureFields(
      readCreatureFieldsForm(new FormData(form), editorFields, hpOnly),
    );
    let patch = fieldPatch(editorFields, next, hpOnly);
    if (!editorHadCreatureData && !getCharacterLink(editorToken)) {
      patch = next;
    }
    if (Object.keys(patch).length) {
      await editorService.updateCreatureFields(editorToken.id, patch);
    }
    notify(
      getCharacterLink(editorToken)
        ? "Character record saved."
        : "Creature saved.",
      "SUCCESS",
    );
    await OBR.popover.close(EDIT_POPOVER_ID);
  } catch (error) {
    editorError = messageFrom(error, "DWTools could not save the creature.");
    editorBusy = false;
    renderEditor();
  }
}

async function startEditor(): Promise<void> {
  if (!itemId) return;
  editorRepository = createObrCharacterRepository();
  editorService = createObrCreatureService(editorRepository);
  const [token, roomMetadata] = await Promise.all([
    editorService.getItem(itemId),
    OBR.room.getMetadata().catch((error) => {
      console.warn("DWTools could not load room visibility settings", error);
      return {};
    }),
  ]);
  if (!token) {
    app.innerHTML =
      '<p class="error">That token is no longer in the scene.</p>';
    return;
  }
  editorHadCreatureData = CREATURE_KEY in token.metadata;
  const initializedData = initializeCreatureData(
    token.metadata[CREATURE_KEY],
    getDefaultOverlayVisibility(roomMetadata),
  );
  editorToken = {
    ...token,
    metadata: {
      ...token.metadata,
      [CREATURE_KEY]: initializedData,
    },
  };
  editorFields = extractCreatureFields(editorToken);
  const link = getCharacterLink(editorToken);
  editorLookup = link
    ? await editorRepository.inspect(link.characterId)
    : { status: "missing" };
  if (editorLookup.status === "active") {
    editorFields = editorLookup.record.fields;
  }
  renderEditor();

  const unsubscribers = [
    editorRepository.subscribe((changes) => {
      const currentLink = editorToken && getCharacterLink(editorToken);
      if (
        currentLink &&
        changes.some(
          (change) => change.characterId === currentLink.characterId,
        ) &&
        !editorBusy
      ) {
        void reloadEditor();
      }
    }),
    OBR.scene.items.onChange((items) => {
      const updated = items.find((item) => item.id === itemId);
      if (updated && !editorBusy) void reloadEditor();
    }),
  ];
  window.addEventListener(
    "unload",
    () => {
      for (const unsubscribe of unsubscribers) unsubscribe();
    },
    { once: true },
  );
}

// Entry points --------------------------------------------------------------

if (preview === "home") {
  homeRole = "GM";
  homeMetadata = {
    [DEFAULT_OVERLAY_VISIBILITY_KEY]: params.get("default") !== "hidden",
  };
  managerRecords = [
    {
      schemaVersion: 1,
      id: "preview-active",
      fields: {
        name: "Raganah",
        hpCurrent: 8,
        hpMax: 10,
        armor: 1,
        damage: "d8+2",
        tags: "Cautious, Loyal",
      },
      revision: 3,
      createdAt: "2026-07-25T15:00:00.000Z",
      createdBy: "preview-gm",
      updatedAt: "2026-07-26T15:00:00.000Z",
      updatedBy: "preview-gm",
      writeId: "preview-active-write",
    },
  ];
  managerTombstones = [
    {
      schemaVersion: 1,
      id: "preview-deleted",
      name: "The Ashen Seer",
      revision: 4,
      writeId: "preview-deleted-write",
      deleted: true,
      deletedAt: "2026-07-26T16:30:00.000Z",
      deletedBy: "preview-gm",
    },
  ];
  managerCounts = new Map([["preview-active", 2]]);
  managerUsage = {
    bytes: 7_168,
    limitBytes: 16_384,
    safeMaximumBytes: 15_360,
    warningBytes: 13_107,
    nearLimit: false,
    percentOfLimit: 43.75,
  };
  renderHome();
} else if (preview === "editor") {
  editorToken = {
    id: "preview",
    name: "Frogman",
    metadata: {},
  } as Item;
  editorFields = {
    name: "Frogman",
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
  };
  renderEditor();
} else if (!itemId) {
  renderHome();
  if (OBR.isAvailable) OBR.onReady(() => void startHome());
} else if (!OBR.isAvailable) {
  app.innerHTML =
    '<p class="error">Open this editor from a token inside Owlbear Rodeo.</p>';
} else {
  OBR.onReady(() => void startEditor());
}
