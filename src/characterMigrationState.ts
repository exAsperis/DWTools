import {
  CHARACTER_SCENE_REPLICA_KEY,
  CHARACTER_STORAGE_STATE_KEY,
} from "./constants";
import type { RoomMetadata } from "./defaultVisibility";
import { CharacterRepositoryError } from "./characterRepository";
import type { CharacterLocalStoreScan } from "./characterLocalStore";
import type { CharacterSceneStoreScan } from "./characterSceneStore";
import { cloneCharacterHistory } from "./characterHistoryCodec";
import { deepEqual } from "./characterRevision";

export const CHARACTER_STORAGE_STATE_FORMAT_VERSION = 1;
export const CHARACTER_SCENE_REPLICA_FORMAT_VERSION = 1;
export type CharacterRoomRecordState = "frozen" | "retired";
export interface CharacterStorageState {
  formatVersion: typeof CHARACTER_STORAGE_STATE_FORMAT_VERSION;
  authority: "local-scene-v1";
  roomRecords: CharacterRoomRecordState;
  hasCharacterHistory: boolean;
}
export interface CharacterSceneReplicaState {
  formatVersion: typeof CHARACTER_SCENE_REPLICA_FORMAT_VERSION;
  initialized: true;
}

function object(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function parseCharacterStorageState(
  value: unknown,
): CharacterStorageState | undefined {
  if (value === undefined) return undefined;
  const keys = object(value) ? Object.keys(value).sort() : [];
  if (
    !object(value) ||
    !deepEqual(keys, [
      "authority",
      "formatVersion",
      "hasCharacterHistory",
      "roomRecords",
    ]) ||
    value.formatVersion !== 1 ||
    value.authority !== "local-scene-v1" ||
    (value.roomRecords !== "frozen" && value.roomRecords !== "retired") ||
    typeof value.hasCharacterHistory !== "boolean"
  ) {
    throw new CharacterRepositoryError(
      "MALFORMED",
      "Character storage migration state is malformed or unsupported.",
    );
  }
  return value as unknown as CharacterStorageState;
}

export function parseCharacterSceneReplicaState(
  value: unknown,
): CharacterSceneReplicaState | undefined {
  if (value === undefined) return undefined;
  const keys = object(value) ? Object.keys(value).sort() : [];
  if (
    !object(value) ||
    !deepEqual(keys, ["formatVersion", "initialized"]) ||
    value.formatVersion !== 1 ||
    value.initialized !== true
  ) {
    throw new CharacterRepositoryError(
      "MALFORMED",
      "Character scene replica state is malformed or unsupported.",
    );
  }
  return value as unknown as CharacterSceneReplicaState;
}

export const characterStorageStateFromMetadata = (metadata: RoomMetadata) =>
  parseCharacterStorageState(metadata[CHARACTER_STORAGE_STATE_KEY]);
export const characterSceneReplicaFromMetadata = (metadata: RoomMetadata) =>
  parseCharacterSceneReplicaState(metadata[CHARACTER_SCENE_REPLICA_KEY]);

export interface CharacterSceneReplicaMetadataStore {
  getMetadata(): Promise<RoomMetadata>;
  setMetadata(update: RoomMetadata): Promise<void>;
}

export async function ensureCharacterSceneReplicaState(
  store: CharacterSceneReplicaMetadataStore,
): Promise<void> {
  const metadata = await store.getMetadata();
  if (characterSceneReplicaFromMetadata(metadata)) return;
  await store.setMetadata({
    [CHARACTER_SCENE_REPLICA_KEY]: {
      formatVersion: CHARACTER_SCENE_REPLICA_FORMAT_VERSION,
      initialized: true,
    },
  });
}

export interface CharacterRetirementAssessment {
  ready: boolean;
  reasons: string[];
}

export function assessCharacterRoomRetirement(
  roomState: CharacterStorageState | undefined,
  localScan: CharacterLocalStoreScan,
  sceneScan: CharacterSceneStoreScan | undefined,
  sceneReplica: CharacterSceneReplicaState | undefined,
  transferJournalPresent: boolean,
): CharacterRetirementAssessment {
  const reasons: string[] = [];
  if (!roomState) reasons.push("Character storage migration state is missing.");
  else if (
    roomState.authority !== "local-scene-v1" ||
    roomState.roomRecords !== "frozen"
  )
    reasons.push("Room records are not in the frozen migration state.");
  if (localScan.issues.length)
    reasons.push("Local Character storage has issues.");
  if (transferJournalPresent)
    reasons.push("A Character transfer journal is pending.");
  if (!sceneReplica)
    reasons.push("The current scene is not an initialized Character replica.");
  if (!sceneScan) reasons.push("The current scene could not be scanned.");
  else if (sceneScan.issues.length)
    reasons.push("Scene Character storage has issues.");
  const sceneById = new Map(
    (sceneScan?.histories ?? []).map((history) => [
      history.characterId,
      history,
    ]),
  );
  const localIds = new Set(localScan.entries.map((entry) => entry.characterId));
  for (const characterId of sceneById.keys()) {
    if (!localIds.has(characterId))
      reasons.push(`Character ${characterId} is missing from local storage.`);
  }
  for (const entry of localScan.entries) {
    if (entry.sync.pendingRevisionIds.length)
      reasons.push(`Character ${entry.characterId} has pending revisions.`);
    if (entry.history.heads.length > 1)
      reasons.push(`Character ${entry.characterId} has unresolved branches.`);
    const scene = sceneById.get(entry.characterId);
    if (!scene)
      reasons.push(`Character ${entry.characterId} is missing from the scene.`);
    else {
      const left = cloneCharacterHistory(entry.history);
      left.heads.sort();
      const right = cloneCharacterHistory(scene);
      right.heads.sort();
      if (!deepEqual(left, right))
        reasons.push(
          `Character ${entry.characterId} differs between local and scene storage.`,
        );
    }
  }
  return { ready: reasons.length === 0, reasons };
}
