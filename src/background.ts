import OBR from "@owlbear-rodeo/sdk";
import { EXTENSION_ID } from "./constants";
import { clearLocalDisplays, syncAllDisplays, syncCreatureDisplay } from "./display";

const characterFilter = {
  min: 1,
  max: 1,
  roles: ["GM" as const],
  permissions: ["UPDATE" as const],
  every: [{ key: "layer" as const, value: "CHARACTER" }],
};

const extensionUrl = new URL("./", window.location.href);
const assetUrl = (path: string) => new URL(path, extensionUrl).toString();

function setupContextMenus() {
  OBR.contextMenu.create({
    id: `${EXTENSION_ID}/menu`,
    icons: [{
      icon: assetUrl("icon.svg"),
      label: "DWTools",
      filter: characterFilter,
    }],
    embed: {
      url: assetUrl("context-menu.html?v=0.1.10"),
      height: 360,
    },
  });
}

let unsubscribeItems: (() => void) | undefined;
let syncing = false;
let queued = false;
let activeRole: "GM" | "PLAYER" | undefined;

async function startSceneSync() {
  unsubscribeItems?.();
  unsubscribeItems = undefined;
  if (!await OBR.scene.isReady()) return;
  activeRole = await OBR.player.getRole();
  if (activeRole !== "GM") {
    await clearLocalDisplays();
    return;
  }
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
  OBR.player.onChange((player) => {
    if (player.role !== activeRole) void startSceneSync();
  });
  window.addEventListener("message", (event) => {
    if (activeRole !== "GM") return;
    if (event.data?.type !== `${EXTENSION_ID}/sync` || typeof event.data.itemId !== "string") return;
    void OBR.scene.items.getItems([event.data.itemId]).then(([item]) => {
      if (item) return syncCreatureDisplay(item);
    });
  });
});
