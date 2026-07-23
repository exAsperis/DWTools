import OBR from "@owlbear-rodeo/sdk";
import { CREATURE_KEY, EDIT_POPOVER_ID, EXTENSION_ID, isCreatureData } from "./constants";
import { formatDamageResult, parseDamage, rollDamage } from "./damage";
import { syncAllDisplays, syncCreatureDisplay } from "./display";

const characterFilter = {
  min: 1,
  max: 1,
  roles: ["GM" as const],
  permissions: ["UPDATE" as const],
  every: [{ key: "layer" as const, value: "CHARACTER" }],
};

async function openEditor(itemId: string, elementId: string, view = "edit") {
  const url = new URL("/", window.location.origin);
  url.searchParams.set("itemId", itemId);
  url.searchParams.set("view", view);
  await OBR.popover.open({
    id: EDIT_POPOVER_ID,
    url: url.toString(),
    height: view === "hp" ? 300 : 620,
    width: 390,
    anchorElementId: elementId,
  });
}

function setupContextMenus() {
  OBR.contextMenu.create({
    id: `${EXTENSION_ID}/edit`,
    icons: [{ icon: "/edit.svg", label: "Edit Dungeon World creature", filter: characterFilter }],
    onClick(context, elementId) {
      void openEditor(context.items[0].id, elementId);
    },
  });

  OBR.contextMenu.create({
    id: `${EXTENSION_ID}/hp`,
    icons: [{
      icon: "/heart.svg",
      label: "Adjust HP",
      filter: {
        ...characterFilter,
        every: [{ key: "layer", value: "CHARACTER" }],
      },
    }],
    onClick(context, elementId) {
      void openEditor(context.items[0].id, elementId, "hp");
    },
  });

  OBR.contextMenu.create({
    id: `${EXTENSION_ID}/roll`,
    icons: [{
      icon: "/dice.svg",
      label: "Roll damage",
      filter: characterFilter,
    }],
    onClick(context) {
      const data = context.items[0].metadata[CREATURE_KEY];
      const damage = isCreatureData(data) ? data.damage?.trim() : undefined;
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
    },
  });
}

let unsubscribeItems: (() => void) | undefined;
let syncing = false;
let queued = false;

async function startSceneSync() {
  unsubscribeItems?.();
  unsubscribeItems = undefined;
  if (!await OBR.scene.isReady()) return;
  await syncAllDisplays();
  unsubscribeItems = OBR.scene.items.onChange((items) => {
    if (syncing) {
      queued = true;
      return;
    }
    syncing = true;
    void syncAllDisplays(items).finally(async () => {
      syncing = false;
      if (queued) {
        queued = false;
        await syncAllDisplays();
      }
    });
  });
}

OBR.onReady(() => {
  setupContextMenus();
  void startSceneSync();
  OBR.scene.onReadyChange(() => void startSceneSync());
  window.addEventListener("message", (event) => {
    if (event.data?.type !== `${EXTENSION_ID}/sync` || typeof event.data.itemId !== "string") return;
    void OBR.scene.items.getItems([event.data.itemId]).then(([item]) => {
      if (item) return syncCreatureDisplay(item);
    });
  });
});
