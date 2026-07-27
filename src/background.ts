import OBR, { type Item } from "@owlbear-rodeo/sdk";
import { CharacterSyncCoordinator } from "./characterSync";
import { EXTENSION_ID } from "./constants";
import {
  applyLocalDisplayPlan,
  clearLocalDisplays,
  isDisplay,
  prepareLocalDisplayPlan,
  type ReconciliationPlan,
} from "./display";
import { LatestTaskQueue } from "./latestTaskQueue";
import {
  createObrCharacterRepository,
  obrSceneItemStore,
} from "./obrCharacterServices";
import {
  getOverlaySourceSignatures,
  signatureMapsEqual,
  type PlayerRole,
} from "./overlayModel";

const characterFilter = {
  min: 1,
  max: 1,
  roles: ["GM" as const, "PLAYER" as const],
  permissions: ["UPDATE" as const],
  every: [{ key: "layer" as const, value: "CHARACTER" }],
};

const extensionUrl = new URL("./", window.location.href);
const assetUrl = (path: string) => new URL(path, extensionUrl).toString();

function setupContextMenus() {
  OBR.contextMenu.create({
    id: `${EXTENSION_ID}/menu`,
    icons: [
      {
        icon: assetUrl("icon.svg"),
        label: "DWTools",
        filter: characterFilter,
      },
    ],
    embed: {
      url: assetUrl("context-menu.html?v=1.2.1"),
      height: 360,
    },
  });
}

interface RenderRequest {
  generation: number;
  items: Item[];
  role: PlayerRole;
  sceneDpi: number;
}

interface PreparedRender {
  generation: number;
  plan: ReconciliationPlan;
}

let sceneGeneration = 0;
let lifecycleChain = Promise.resolve();
let latestSceneItems: Item[] = [];
let activeRole: PlayerRole | undefined;
let activeSceneDpi: number | undefined;
let lastSourceSignatures = new Map<string, string>();
let unsubscribeItems: (() => void) | undefined;
let unsubscribeGrid: (() => void) | undefined;
const pendingLegacyIds = new Set<string>();
let legacyCleanupRunning = false;

const renderQueue = new LatestTaskQueue<RenderRequest, PreparedRender>(
  async (request) => ({
    generation: request.generation,
    plan: await prepareLocalDisplayPlan(
      request.items,
      request.role,
      request.sceneDpi,
    ),
  }),
  async ({ generation, plan }) => {
    if (generation !== sceneGeneration) return;
    await applyLocalDisplayPlan(plan);
  },
  (error) => console.error("DWTools overlay render failed", error),
);

function scheduleLegacyCleanup(items: Item[]) {
  if (activeRole !== "GM") return;
  for (const item of items) {
    if (isDisplay(item)) pendingLegacyIds.add(item.id);
  }
  if (!legacyCleanupRunning && pendingLegacyIds.size) void drainLegacyCleanup();
}

async function drainLegacyCleanup() {
  legacyCleanupRunning = true;
  try {
    while (pendingLegacyIds.size) {
      const ids = [...pendingLegacyIds];
      pendingLegacyIds.clear();
      try {
        await OBR.scene.items.deleteItems(ids);
      } catch (error) {
        console.warn("DWTools could not remove legacy shared overlays", error);
      }
    }
  } finally {
    legacyCleanupRunning = false;
  }
}

function scheduleRender(force = false) {
  if (activeRole === undefined || activeSceneDpi === undefined) return;
  const signatures = getOverlaySourceSignatures(
    latestSceneItems,
    activeRole,
    activeSceneDpi,
  );
  if (!force && signatureMapsEqual(signatures, lastSourceSignatures)) return;
  lastSourceSignatures = signatures;
  renderQueue.schedule({
    generation: sceneGeneration,
    items: latestSceneItems,
    role: activeRole,
    sceneDpi: activeSceneDpi,
  });
}

function handleSceneItems(items: Item[], force = false) {
  latestSceneItems = items;
  scheduleLegacyCleanup(items);
  scheduleRender(force);
}

function restartSceneSync() {
  const requestedGeneration = ++sceneGeneration;
  lifecycleChain = lifecycleChain
    .then(() => startSceneSync(requestedGeneration))
    .catch((error) =>
      console.error("DWTools scene initialization failed", error),
    );
}

async function startSceneSync(requestedGeneration: number) {
  if (requestedGeneration !== sceneGeneration) return;

  unsubscribeItems?.();
  unsubscribeItems = undefined;
  unsubscribeGrid?.();
  unsubscribeGrid = undefined;
  activeRole = undefined;
  activeSceneDpi = undefined;
  latestSceneItems = [];
  lastSourceSignatures = new Map();

  await renderQueue.whenIdle();
  if (requestedGeneration !== sceneGeneration) return;
  await clearLocalDisplays();
  if (requestedGeneration !== sceneGeneration || !(await OBR.scene.isReady()))
    return;

  const [role, sceneDpi] = await Promise.all([
    OBR.player.getRole(),
    OBR.scene.grid.getDpi(),
  ]);
  if (requestedGeneration !== sceneGeneration) return;

  activeRole = role;
  activeSceneDpi = sceneDpi;
  unsubscribeItems = OBR.scene.items.onChange((items) =>
    handleSceneItems(items),
  );
  unsubscribeGrid = OBR.scene.grid.onChange((grid) => {
    if (grid.dpi === activeSceneDpi) return;
    activeSceneDpi = grid.dpi;
    lastSourceSignatures = new Map();
    scheduleRender(true);
  });

  const items = await OBR.scene.items.getItems();
  if (requestedGeneration !== sceneGeneration) return;
  handleSceneItems(items, true);
}

OBR.onReady(() => {
  setupContextMenus();
  const characterSync = new CharacterSyncCoordinator(
    createObrCharacterRepository(),
    obrSceneItemStore,
    {
      isReady: () => OBR.scene.isReady(),
      onReadyChange: (callback) => OBR.scene.onReadyChange(callback),
    },
    (error) => console.error("DWTools character synchronization failed", error),
  );
  characterSync.start();
  restartSceneSync();
  OBR.scene.onReadyChange(() => restartSceneSync());
  OBR.player.onChange((player) => {
    if (player.role === activeRole) return;
    activeRole = player.role;
    lastSourceSignatures = new Map();
    scheduleLegacyCleanup(latestSceneItems);
    scheduleRender(true);
  });
  window.addEventListener("unload", () => characterSync.stop(), { once: true });
});
