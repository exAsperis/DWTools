import OBR, { type Item, type Theme } from "@owlbear-rodeo/sdk";
import "./style.css";
import {
  type CharacterLookup,
  type CharacterRecord,
  type CharacterRepository,
  type CharacterStorageUsage,
} from "./characterRepository";
import {
  CharacterManagerService,
  CreatureService,
  currentSceneLinkedTokenCounts,
} from "./characterService";
import {
  buildCharacterDeleteConfirmation,
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
import {
  BASIC_MOVES,
  buildHomeMarkup,
  DEFAULT_HOME_SECTIONS,
  SPECIAL_MOVES,
  type HomeRole,
  type HomeSection,
  type HomeSectionState,
} from "./homeView";
import {
  createObrCharacterManagerService,
  createObrCharacterRepository,
  createObrCreatureService,
} from "./obrCharacterServices";
import { ensureMetadataNamespaceMigrated } from "./obrMetadataMigration";
import type { InventoryItem, InventorySelection } from "./inventory";

const app = document.querySelector<HTMLElement>("#app")!;
const params = new URLSearchParams(window.location.search);
const itemId = params.get("itemId");
const view = params.get("view") ?? "edit";
const preview = params.get("preview");

function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  root.dataset.obrTheme = theme.mode.toLowerCase();
  root.style.setProperty("--dw-background", theme.background.paper);
  root.style.setProperty("--dw-surface", theme.background.default);
  root.style.setProperty("--dw-text", theme.text.primary);
  root.style.setProperty("--dw-text-secondary", theme.text.secondary);
  root.style.setProperty("--dw-text-disabled", theme.text.disabled);
  root.style.setProperty("--dw-primary", theme.primary.main);
}

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
let managerCounts = new Map<string, number>();
let managerUsage: CharacterStorageUsage | undefined;
let managerLoading = false;
let managerSaving = false;
let managerError: string | undefined;
let managerLegacyCleanupComplete = false;
let managerEditing: CharacterManagerViewState["editing"];
let managerDraftCharacterId: string | undefined;
let managerTransfer: CharacterManagerViewState["transfer"];
const managerExpandedCharacters = new Set<string>();
const managerExpandedInventories = new Set<string>();
const HOME_SECTIONS_KEY = "dwtools/home-sections";

function loadHomeSections(): HomeSectionState {
  try {
    const stored = JSON.parse(localStorage.getItem(HOME_SECTIONS_KEY) ?? "{}");
    return {
      agenda:
        typeof stored.agenda === "boolean"
          ? stored.agenda
          : DEFAULT_HOME_SECTIONS.agenda,
      moves:
        typeof stored.moves === "boolean"
          ? stored.moves
          : DEFAULT_HOME_SECTIONS.moves,
      basicMoves:
        typeof stored.basicMoves === "boolean"
          ? stored.basicMoves
          : DEFAULT_HOME_SECTIONS.basicMoves,
      specialMoves:
        typeof stored.specialMoves === "boolean"
          ? stored.specialMoves
          : DEFAULT_HOME_SECTIONS.specialMoves,
      settings:
        typeof stored.settings === "boolean"
          ? stored.settings
          : DEFAULT_HOME_SECTIONS.settings,
      characters:
        typeof stored.characters === "boolean"
          ? stored.characters
          : DEFAULT_HOME_SECTIONS.characters,
    };
  } catch {
    return { ...DEFAULT_HOME_SECTIONS };
  }
}

let homeSections = loadHomeSections();

function managerState(): CharacterManagerViewState {
  return {
    records: managerRecords,
    counts: managerCounts,
    role: homeRole,
    usage: managerUsage,
    loading: managerLoading,
    saving: managerSaving,
    error: managerError,
    editing: managerEditing,
    expandedCharacters: managerExpandedCharacters,
    expandedInventories: managerExpandedInventories,
    draftCharacterId: managerDraftCharacterId,
    transfer: managerTransfer,
  };
}

function renderHome(): void {
  const defaultVisibleToPlayers = getDefaultOverlayVisibility(homeMetadata);
  const managerMarkup = buildCharacterManagerMarkup(
    managerState(),
    homeSections.characters || Boolean(managerEditing),
  );
  app.innerHTML = buildHomeMarkup(
    homeRole,
    defaultVisibleToPlayers,
    savingDefaultVisibility,
    homeSections,
    managerMarkup,
  );
  document
    .querySelector("#default-visibility")
    ?.addEventListener("click", () => void toggleDefaultVisibility());
  for (const button of document.querySelectorAll<HTMLButtonElement>(
    "[data-toggle-section]",
  )) {
    button.addEventListener("click", () => {
      const section = button.dataset.toggleSection as HomeSection;
      homeSections = { ...homeSections, [section]: !homeSections[section] };
      localStorage.setItem(HOME_SECTIONS_KEY, JSON.stringify(homeSections));
      renderHome();
    });
  }
  for (const button of document.querySelectorAll<HTMLButtonElement>(
    "[data-move]",
  )) {
    button.addEventListener("click", () => {
      const move = [...BASIC_MOVES, ...SPECIAL_MOVES].find(
        (entry) => entry.id === button.dataset.move,
      );
      const dialog = document.querySelector<HTMLDialogElement>("#move-dialog");
      const title = document.querySelector<HTMLElement>("#move-dialog-title");
      const text = document.querySelector<HTMLElement>("#move-dialog-text");
      if (!move || !dialog || !title || !text) return;
      title.textContent = move.name;
      text.textContent = move.text;
      dialog.showModal();
    });
  }
  document
    .querySelector("#move-dialog-close")
    ?.addEventListener("click", () =>
      document.querySelector<HTMLDialogElement>("#move-dialog")?.close(),
    );
  bindManagerControls();
}

function bindManagerControls(): void {
  document.querySelector("#manager-create")?.addEventListener("click", () => {
    managerError = undefined;
    managerEditing = {
      kind: "create",
      fields: { name: "Untitled character", visibleToPlayers: true },
    };
    homeSections.characters = true;
    localStorage.setItem(HOME_SECTIONS_KEY, JSON.stringify(homeSections));
    renderHome();
  });
  document.querySelector("#manager-cancel")?.addEventListener("click", () => {
    managerEditing = undefined;
    managerError = undefined;
    renderHome();
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

  for (const details of document.querySelectorAll<HTMLDetailsElement>(
    "[data-character-details]",
  )) {
    details.addEventListener("toggle", () => {
      const id = details.dataset.characterDetails;
      if (!id) return;
      if (details.open) managerExpandedCharacters.add(id);
      else managerExpandedCharacters.delete(id);
    });
  }
  for (const details of document.querySelectorAll<HTMLDetailsElement>(
    "[data-inventory-details]",
  )) {
    details.addEventListener("toggle", () => {
      const id = details.dataset.inventoryDetails;
      if (!id) return;
      if (details.open) managerExpandedInventories.add(id);
      else managerExpandedInventories.delete(id);
    });
  }
  bindInventoryControls();
}

function recordForControl(element: Element): CharacterRecord | undefined {
  const characterId = element.closest<HTMLElement>("[data-character-details]")
    ?.dataset.characterDetails;
  return managerRecords.find((record) => record.id === characterId);
}

function selectionFor(
  record: CharacterRecord,
  sourceIndex: number,
): InventorySelection | undefined {
  const item = record.inventory?.[sourceIndex];
  return item
    ? { sourceIndex, expected: [...item] as InventoryItem }
    : undefined;
}

async function runInventoryMutation(
  mutation: () => Promise<unknown>,
  successMessage?: string,
  anchorCharacterId?: string,
): Promise<void> {
  if (managerSaving) return;
  managerSaving = true;
  managerError = undefined;
  if (anchorCharacterId) renderHomeAtInventoryBottom(anchorCharacterId);
  else renderHome();
  try {
    await mutation();
    managerDraftCharacterId = undefined;
    managerTransfer = undefined;
    await refreshManager(false);
    if (successMessage) notify(successMessage, "SUCCESS");
    if (managerUsage?.nearLimit) {
      notify("Room metadata is approaching Owlbear's size limit.", "WARNING");
    }
  } catch (error) {
    const errorMessage = messageFrom(
      error,
      "DWTools could not update this inventory.",
    );
    await refreshManager(false);
    managerError = errorMessage;
  } finally {
    managerSaving = false;
    if (anchorCharacterId) renderHomeAtInventoryBottom(anchorCharacterId);
    else renderHome();
  }
}

function renderHomeAtInventoryBottom(
  characterId: string,
  focusDraft = false,
): void {
  renderHome();
  window.requestAnimationFrame(() => {
    const card = [
      ...document.querySelectorAll<HTMLElement>("[data-character-details]"),
    ].find((element) => element.dataset.characterDetails === characterId);
    const target =
      card?.querySelector<HTMLElement>("[data-inventory-draft]") ??
      card?.querySelector<HTMLElement>("[data-inventory-add]") ??
      card?.querySelector<HTMLElement>("[data-inventory-details]");
    target?.scrollIntoView({ block: "nearest" });
    if (focusDraft) {
      card
        ?.querySelector<HTMLInputElement>("[data-inventory-draft] [name=name]")
        ?.focus();
    }
  });
}

function bindInlineCommit(
  input: HTMLInputElement,
  originalValue: string,
  commit: () => void,
): void {
  input.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      input.value = originalValue;
      input.blur();
    } else if (event.key === "Enter") {
      event.preventDefault();
      input.blur();
    }
  });
  input.addEventListener("blur", commit);
}

function bindInventoryControls(): void {
  if (!homeManagerService) return;
  for (const input of document.querySelectorAll<HTMLInputElement>(
    "[data-max-load]",
  )) {
    const record = recordForControl(input);
    if (!record) continue;
    const original = numberValue(record.maxLoad);
    bindInlineCommit(input, original, () => {
      if (input.value === original) return;
      const next = input.value.trim() === "" ? undefined : Number(input.value);
      void runInventoryMutation(
        () => homeManagerService!.setMaxLoad(record.id, next),
        "Maximum Load saved.",
      );
    });
  }

  for (const input of document.querySelectorAll<HTMLInputElement>(
    "[data-inventory-name]",
  )) {
    const record = recordForControl(input);
    const index = Number(input.dataset.inventoryName);
    const selection = record && selectionFor(record, index);
    if (!record || !selection) continue;
    bindInlineCommit(input, selection.expected[0], () => {
      if (input.value === selection.expected[0]) return;
      const replacement: InventoryItem = [
        input.value,
        selection.expected[1],
        selection.expected[2],
      ];
      void runInventoryMutation(() =>
        homeManagerService!.updateInventoryItem(
          record.id,
          selection,
          replacement,
        ),
      );
    });
  }

  for (const input of document.querySelectorAll<HTMLInputElement>(
    "[data-inventory-weight]",
  )) {
    const record = recordForControl(input);
    const index = Number(input.dataset.inventoryWeight);
    const selection = record && selectionFor(record, index);
    if (!record || !selection) continue;
    const original = String(selection.expected[1]);
    bindInlineCommit(input, original, () => {
      if (input.value === original) return;
      const replacement: InventoryItem = [
        selection.expected[0],
        input.value.trim() === "" ? Number.NaN : Number(input.value),
        selection.expected[2],
      ];
      void runInventoryMutation(() =>
        homeManagerService!.updateInventoryItem(
          record.id,
          selection,
          replacement,
        ),
      );
    });
  }

  for (const input of document.querySelectorAll<HTMLInputElement>(
    "[data-inventory-count]",
  )) {
    const record = recordForControl(input);
    const index = Number(input.dataset.inventoryCount);
    const selection = record && selectionFor(record, index);
    if (!record || !selection) continue;
    const original = String(selection.expected[2]);
    bindInlineCommit(input, original, () => {
      if (input.value === original) return;
      const next = input.value.trim() === "" ? Number.NaN : Number(input.value);
      void runInventoryMutation(() =>
        homeManagerService!.changeInventoryItemCount(
          record.id,
          selection,
          next - selection.expected[2],
        ),
      );
    });
  }

  for (const button of document.querySelectorAll<HTMLButtonElement>(
    "[data-inventory-adjust]",
  )) {
    button.addEventListener("click", () => {
      const record = recordForControl(button);
      const index = Number(button.dataset.inventoryAdjust);
      const selection = record && selectionFor(record, index);
      const change = Number(button.dataset.change);
      if (!record || !selection) return;
      void runInventoryMutation(() =>
        homeManagerService!.changeInventoryItemCount(
          record.id,
          selection,
          change,
        ),
      );
    });
  }

  for (const button of document.querySelectorAll<HTMLButtonElement>(
    "[data-inventory-remove]",
  )) {
    button.addEventListener("click", () => {
      const record = recordForControl(button);
      const index = Number(button.dataset.inventoryRemove);
      const selection = record && selectionFor(record, index);
      if (!record || !selection) return;
      void runInventoryMutation(() =>
        homeManagerService!.removeInventoryItem(record.id, selection),
      );
    });
  }

  for (const button of document.querySelectorAll<HTMLButtonElement>(
    "[data-inventory-add]",
  )) {
    button.addEventListener("click", () => {
      const record = recordForControl(button);
      if (!record) return;
      managerDraftCharacterId = record.id;
      managerExpandedCharacters.add(record.id);
      managerExpandedInventories.add(record.id);
      renderHomeAtInventoryBottom(record.id, true);
    });
  }
  document
    .querySelector("[data-inventory-draft-cancel]")
    ?.addEventListener("click", () => {
      const characterId = managerDraftCharacterId;
      managerDraftCharacterId = undefined;
      if (characterId) renderHomeAtInventoryBottom(characterId);
      else renderHome();
    });
  const draftForm = document.querySelector<HTMLFormElement>(
    "[data-inventory-draft]",
  );
  if (draftForm) {
    draftForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const record = recordForControl(draftForm);
      if (!record || !draftForm.reportValidity()) return;
      const data = new FormData(draftForm);
      const item: InventoryItem = [
        String(data.get("name") ?? ""),
        Number(data.get("weight")),
        Number(data.get("count")),
      ];
      void runInventoryMutation(
        () => homeManagerService!.addInventoryItem(record.id, item),
        undefined,
        record.id,
      );
    });
  }

  for (const button of document.querySelectorAll<HTMLButtonElement>(
    "[data-inventory-transfer]",
  )) {
    button.addEventListener("click", () => {
      const record = recordForControl(button);
      const sourceIndex = Number(button.dataset.inventoryTransfer);
      const selection = record && selectionFor(record, sourceIndex);
      if (!record || !selection) return;
      managerTransfer = {
        sourceCharacterId: record.id,
        sourceIndex,
        expected: selection.expected,
      };
      renderHome();
    });
  }
  document
    .querySelector("[data-transfer-cancel]")
    ?.addEventListener("click", () => {
      managerTransfer = undefined;
      renderHome();
    });
  const transferForm = document.querySelector<HTMLFormElement>(
    "[data-transfer-form]",
  );
  if (transferForm && managerTransfer) {
    transferForm.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!managerTransfer || !transferForm.reportValidity()) return;
      const data = new FormData(transferForm);
      const destination = String(data.get("destination") ?? "");
      const count = Number(data.get("count"));
      const source = managerTransfer;
      void runInventoryMutation(
        () =>
          homeManagerService!.transferInventoryItem(
            source.sourceCharacterId,
            destination,
            {
              sourceIndex: source.sourceIndex,
              expected: source.expected,
            },
            count,
          ),
        "Item transferred.",
      );
    });
  }
}

async function refreshManager(render = true): Promise<void> {
  if (!homeRepository || !homeCreatureService || !homeManagerService) {
    return;
  }
  managerLoading = true;
  managerError = undefined;
  if (render && !managerEditing) renderHome();
  try {
    if (homeRole === "GM" && !managerLegacyCleanupComplete) {
      const cleaned = await homeManagerService.cleanupLegacyTombstones();
      managerLegacyCleanupComplete = true;
      if (cleaned) {
        notify(
          `Cleaned up ${cleaned} legacy deleted character record${cleaned === 1 ? "" : "s"}.`,
          "SUCCESS",
        );
      }
    }
    [managerRecords, managerCounts, managerUsage] = await Promise.all([
      homeManagerService.listAccessible(),
      currentSceneLinkedTokenCounts(homeCreatureService.scene),
      homeRole === "GM"
        ? homeRepository.estimateUsage()
        : Promise.resolve(undefined),
    ]);
    if (
      homeRole === "PLAYER" &&
      managerEditing?.kind === "edit" &&
      !managerRecords.some((record) => record.id === managerEditing?.id)
    ) {
      managerEditing = undefined;
      managerError =
        "You no longer control a token linked to the Character being edited.";
    }
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
  if (!window.confirm(buildCharacterDeleteConfirmation(record.fields.name))) {
    return;
  }
  managerSaving = true;
  managerError = undefined;
  renderHome();
  try {
    await homeManagerService.delete(characterId);
    notify(
      "Character record deleted. Other-scene copies are now orphaned.",
      "SUCCESS",
    );
    await refreshManager(false);
  } catch (error) {
    managerError = messageFrom(error, "DWTools could not delete the record.");
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
  try {
    await ensureMetadataNamespaceMigrated();
  } catch (error) {
    console.error("DWTools metadata namespace migration failed", error);
    app.innerHTML =
      '<p class="error">DWTools could not migrate its saved data. Reload Owlbear and try again.</p>';
    notify("DWTools could not migrate its saved data.", "ERROR");
    return;
  }
  homeRepository = createObrCharacterRepository();
  homeCreatureService = createObrCreatureService(homeRepository);
  homeManagerService = createObrCharacterManagerService(
    homeRepository,
    homeCreatureService,
  );
  [homeRole, homeMetadata] = await Promise.all([
    OBR.player.getRole(),
    OBR.room.getMetadata(),
    OBR.theme.getTheme().then(applyTheme),
  ]);
  await refreshManager(false);
  renderHome();

  const unsubscribers = [
    OBR.room.onMetadataChange((metadata) => {
      homeMetadata = metadata;
      renderHome();
    }),
    homeRepository.subscribe((changes) => {
      if (changes.some((change) => change.lookup.status === "deleted")) {
        managerLegacyCleanupComplete = false;
      }
      void refreshManager(homeRole === "PLAYER" || !managerEditing);
    }),
    OBR.player.onChange((player) => {
      homeRole = player.role;
      managerEditing = undefined;
      managerDraftCharacterId = undefined;
      managerTransfer = undefined;
      void refreshManager();
    }),
    OBR.scene.items.onChange(() => {
      void refreshManager(homeRole === "PLAYER" || !managerEditing);
    }),
    OBR.room.onPermissionsChange(
      () => void refreshManager(homeRole === "PLAYER" || !managerEditing),
    ),
    OBR.theme.onChange(applyTheme),
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
  try {
    await ensureMetadataNamespaceMigrated();
  } catch (error) {
    console.error("DWTools metadata namespace migration failed", error);
    app.innerHTML =
      '<p class="error">DWTools could not migrate its saved data. Reload Owlbear and try again.</p>';
    notify("DWTools could not migrate its saved data.", "ERROR");
    return;
  }
  editorRepository = createObrCharacterRepository();
  editorService = createObrCreatureService(editorRepository);
  const [token, roomMetadata] = await Promise.all([
    editorService.getItem(itemId),
    OBR.room.getMetadata().catch((error) => {
      console.warn("DWTools could not load room visibility settings", error);
      return {};
    }),
    OBR.theme.getTheme().then(applyTheme),
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
    OBR.theme.onChange(applyTheme),
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
      schemaVersion: 2,
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
