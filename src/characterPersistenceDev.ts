import { EXTENSION_ID } from "./constants";
import {
  scanRoomCharacterHistories,
  type CharacterRoomImportIssue,
} from "./characterRoomImport";
import type { RoomMetadata } from "./defaultVisibility";
import type { CharacterLocalStoreScan } from "./characterLocalStore";
import type { CharacterSceneStoreScan } from "./characterSceneStore";
import type {
  CharacterHistory,
  VersionedCharacterRecord,
} from "./characterRevision";
import { escapeHtml } from "./characterView";
import {
  assessCharacterRoomRetirement,
  characterSceneReplicaFromMetadata,
  characterStorageStateFromMetadata,
} from "./characterMigrationState";

export const DEVELOPER_TOOLS_ENABLED_KEY = `${EXTENSION_ID}/developer-tools-enabled`;

export type CharacterPersistenceDevStatus =
  | "synced"
  | "pending"
  | "branched"
  | "drift"
  | "local-missing"
  | "scene-missing"
  | "scene-unavailable"
  | "issue";

export interface CharacterPersistenceDevSource {
  heads: string[];
  revisionCount: number;
}

export interface CharacterPersistenceDevRow {
  characterId: string;
  name: string;
  status: CharacterPersistenceDevStatus;
  room?: CharacterPersistenceDevSource;
  local?: CharacterPersistenceDevSource & { pendingRevisionIds: string[] };
  scene?: CharacterPersistenceDevSource;
  issues: string[];
}

export interface CharacterPersistenceDevSnapshot {
  rows: CharacterPersistenceDevRow[];
  roomCharacterCount: number;
  localCharacterCount: number;
  sceneCharacterCount: number;
  pendingCharacterCount: number;
  issueCount: number;
  sceneReady: boolean;
  globalIssues: string[];
  roomRecordState: "Legacy" | "Frozen" | "Retired";
  sceneReplicaInitialized: boolean;
  retirementReady: boolean;
  retirementReasons: string[];
}

export function readDeveloperToolsEnabled(
  storage: Pick<Storage, "getItem">,
): boolean {
  try {
    return storage.getItem(DEVELOPER_TOOLS_ENABLED_KEY) === "true";
  } catch {
    return false;
  }
}

export function writeDeveloperToolsEnabled(
  storage: Pick<Storage, "setItem" | "removeItem">,
  enabled: boolean,
): void {
  try {
    if (enabled) storage.setItem(DEVELOPER_TOOLS_ENABLED_KEY, "true");
    else storage.removeItem(DEVELOPER_TOOLS_ENABLED_KEY);
  } catch {
    // A developer preference failure must never interfere with DWTools.
  }
}

function sorted(values: Iterable<string>): string[] {
  return [...values].sort((left, right) => left.localeCompare(right));
}

function sameSet(left: readonly string[], right: readonly string[]): boolean {
  const orderedRight = sorted(right);
  return (
    left.length === right.length &&
    sorted(left).every((value, index) => value === orderedRight[index])
  );
}

function historySource(
  history: CharacterHistory,
): CharacterPersistenceDevSource {
  return {
    heads: sorted(history.heads),
    revisionCount: Object.keys(history.revisions).length,
  };
}

function activeName(history: CharacterHistory | undefined): string | undefined {
  if (!history) return undefined;
  const candidates: VersionedCharacterRecord[] = [
    ...history.heads
      .map((id) => history.revisions[id])
      .filter(
        (record): record is VersionedCharacterRecord => record !== undefined,
      ),
    ...Object.values(history.revisions),
  ];
  for (const record of candidates) {
    if (record.deleted !== true && record.fields.name)
      return record.fields.name;
  }
  return undefined;
}

function issueMessage(issue: CharacterRoomImportIssue): string {
  return `${issue.kind}: ${issue.message}`;
}

export function buildCharacterPersistenceDevSnapshot(
  roomMetadata: RoomMetadata,
  localScan: CharacterLocalStoreScan,
  sceneScan: CharacterSceneStoreScan | undefined,
  sceneReady: boolean,
  sceneMetadata: RoomMetadata = {},
  transferJournalPresent = false,
): CharacterPersistenceDevSnapshot {
  const roomScan = scanRoomCharacterHistories(roomMetadata);
  const roomById = new Map(
    roomScan.histories.map((history) => [history.characterId, history]),
  );
  const localById = new Map(
    localScan.entries.map((entry) => [entry.characterId, entry]),
  );
  const sceneById = new Map(
    (sceneScan?.histories ?? []).map((history) => [
      history.characterId,
      history,
    ]),
  );
  const issuesById = new Map<string, string[]>();
  const globalIssues: string[] = [];
  const addIssue = (characterId: string | undefined, message: string) => {
    if (!characterId) {
      globalIssues.push(message);
      return;
    }
    const values = issuesById.get(characterId) ?? [];
    values.push(message);
    issuesById.set(characterId, values);
  };

  for (const issue of roomScan.issues) {
    addIssue(
      "characterId" in issue ? issue.characterId : undefined,
      `Room: ${issueMessage(issue)}`,
    );
  }
  for (const issue of localScan.issues) {
    addIssue(issue.characterId, `Local: ${issue.code}: ${issue.message}`);
  }
  for (const issue of sceneScan?.issues ?? []) {
    addIssue(issue.characterId, `Scene: ${issue.code}: ${issue.message}`);
  }

  const ids = new Set([
    ...roomById.keys(),
    ...localById.keys(),
    ...sceneById.keys(),
    ...issuesById.keys(),
  ]);
  const rows: CharacterPersistenceDevRow[] = [];
  const roomState = characterStorageStateFromMetadata(roomMetadata);
  const sceneReplica = characterSceneReplicaFromMetadata(sceneMetadata);
  const retirement = assessCharacterRoomRetirement(
    roomState,
    localScan,
    sceneScan,
    sceneReplica,
    transferJournalPresent,
  );

  for (const characterId of sorted(ids)) {
    const room = roomById.get(characterId);
    const local = localById.get(characterId);
    const scene = sceneById.get(characterId);
    const issues = issuesById.get(characterId) ?? [];
    let status: CharacterPersistenceDevStatus;

    if (issues.length > 0) status = "issue";
    else if (!local) status = "local-missing";
    else if (!sceneReady) status = "scene-unavailable";
    else if (!scene) status = "scene-missing";
    else if (local.sync.pendingRevisionIds.length > 0) status = "pending";
    else if (local.history.heads.length > 1 || scene.heads.length > 1)
      status = "branched";
    else if (!sameSet(local.history.heads, scene.heads)) status = "drift";
    else status = "synced";

    rows.push({
      characterId,
      name:
        activeName(local?.history) ??
        activeName(scene) ??
        activeName(room) ??
        characterId,
      status,
      ...(room ? { room: historySource(room) } : {}),
      ...(local
        ? {
            local: {
              ...historySource(local.history),
              pendingRevisionIds: sorted(local.sync.pendingRevisionIds),
            },
          }
        : {}),
      ...(scene ? { scene: historySource(scene) } : {}),
      issues: [...issues],
    });
  }

  return {
    rows,
    roomCharacterCount: roomById.size,
    localCharacterCount: localById.size,
    sceneCharacterCount: sceneById.size,
    pendingCharacterCount: localScan.entries.filter(
      (entry) => entry.sync.pendingRevisionIds.length > 0,
    ).length,
    issueCount:
      roomScan.issues.length +
      localScan.issues.length +
      (sceneScan?.issues.length ?? 0),
    sceneReady,
    globalIssues: globalIssues.sort(),
    roomRecordState: roomState
      ? roomState.roomRecords === "frozen"
        ? "Frozen"
        : "Retired"
      : "Legacy",
    sceneReplicaInitialized: sceneReplica !== undefined,
    retirementReady: retirement.ready,
    retirementReasons: retirement.reasons,
  };
}

function shortRevisionId(value: string): string {
  return value.length <= 12 ? value : `${value.slice(0, 8)}…`;
}

function headsMarkup(values: readonly string[]): string {
  if (values.length === 0) return "—";
  return values
    .map(
      (value) =>
        `<code title="${escapeHtml(value)}">${escapeHtml(shortRevisionId(value))}</code>`,
    )
    .join(", ");
}

function sourceMarkup(
  label: string,
  source: CharacterPersistenceDevSource | undefined,
): string {
  if (!source) {
    return `<div class="persistence-source persistence-source-missing"><strong>${escapeHtml(label)}</strong><span>Missing</span></div>`;
  }
  return `<div class="persistence-source"><strong>${escapeHtml(label)}</strong><span>${source.revisionCount} revision${source.revisionCount === 1 ? "" : "s"}</span><span>Head${source.heads.length === 1 ? "" : "s"}: ${headsMarkup(source.heads)}</span></div>`;
}

function statusLabel(status: CharacterPersistenceDevStatus): string {
  return {
    synced: "Synced",
    pending: "Pending",
    branched: "Branched",
    drift: "Drift",
    "local-missing": "Local missing",
    "scene-missing": "Scene missing",
    "scene-unavailable": "Scene unavailable",
    issue: "Issue",
  }[status];
}

export function buildCharacterPersistenceDevMarkup(
  snapshot: CharacterPersistenceDevSnapshot | undefined,
  loading: boolean,
  error: string | undefined,
): string {
  const summary = snapshot
    ? `<div class="persistence-summary"><span>Authority <strong>Local ↔ Scene</strong></span><span>Room records <strong>${snapshot.roomRecordState}</strong></span><span>Scene replica <strong>${snapshot.sceneReplicaInitialized ? "Initialized" : "Uninitialized"}</strong></span><span>Retirement <strong>${snapshot.retirementReady ? "Ready" : "Not ready"}</strong></span><span>Room <strong>${snapshot.roomCharacterCount}</strong></span><span>Local <strong>${snapshot.localCharacterCount}</strong></span><span>Scene <strong>${snapshot.sceneCharacterCount}</strong></span><span>Pending <strong>${snapshot.pendingCharacterCount}</strong></span><span>Issues <strong>${snapshot.issueCount}</strong></span></div>${snapshot.retirementReasons.length ? `<details><summary>Retirement blockers</summary>${snapshot.retirementReasons.map((reason) => `<div>${escapeHtml(reason)}</div>`).join("")}</details>` : ""}`
    : "";
  const globals = snapshot?.globalIssues.length
    ? `<div class="persistence-global-issues">${snapshot.globalIssues.map((issue) => `<div>${escapeHtml(issue)}</div>`).join("")}</div>`
    : "";
  const rows = snapshot
    ? `<div class="persistence-character-list">${
        snapshot.rows.length
          ? snapshot.rows
              .map(
                (row) =>
                  `<details class="persistence-character"><summary><span><strong>${escapeHtml(row.name)}</strong><small>${escapeHtml(row.characterId)}</small></span><span class="persistence-status persistence-status-${row.status}">${statusLabel(row.status)}</span></summary><div class="persistence-character-body">${sourceMarkup("Room", row.room)}${sourceMarkup("Local", row.local)}${row.local ? `<div class="persistence-pending"><strong>Pending:</strong> ${headsMarkup(row.local.pendingRevisionIds)}</div>` : ""}${snapshot.sceneReady ? sourceMarkup("Scene", row.scene) : `<div class="persistence-source persistence-source-missing"><strong>Scene</strong><span>Not ready</span></div>`}${row.issues.length ? `<div class="persistence-row-issues">${row.issues.map((issue) => `<div>${escapeHtml(issue)}</div>`).join("")}</div>` : ""}</div></details>`,
              )
              .join("")
          : `<p class="manager-status">No Character persistence data found.</p>`
      }</div>`
    : `<p class="manager-status">${loading ? "Loading Character persistence…" : "No diagnostics loaded."}</p>`;

  return `<section class="persistence-dev-panel"><div class="persistence-dev-heading"><div><strong>Character Persistence</strong><span>Migration room → local ↔ scene diagnostics</span></div><button class="secondary persistence-refresh" type="button" id="persistence-dev-refresh" ${loading ? "disabled" : ""}>${loading ? "Refreshing…" : "Refresh"}</button></div>${error ? `<p class="persistence-dev-error">${escapeHtml(error)}</p>` : ""}${summary}${globals}${rows}</section>`;
}
