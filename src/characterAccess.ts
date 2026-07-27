import type { Item } from "@owlbear-rodeo/sdk";
import type { CharacterRecord } from "./characterRepository";
import type { SceneItemStore } from "./characterService";
import { getCharacterLink } from "./creatureFields";

export interface CharacterAccessProvider {
  getRole(): Promise<"GM" | "PLAYER">;
  getPlayerId(): Promise<string>;
  hasPermission(
    permission: "CHARACTER_UPDATE" | "CHARACTER_OWNER_ONLY",
  ): Promise<boolean>;
}

export interface CharacterAccessSnapshot {
  role: "GM" | "PLAYER";
  playerId?: string;
  canUpdateCharacters: boolean;
  ownerOnly: boolean;
}

export function playerControlsCharacterToken(
  item: Item,
  snapshot: CharacterAccessSnapshot,
): boolean {
  if (snapshot.role === "GM") return true;
  return (
    item.layer === "CHARACTER" &&
    !item.locked &&
    snapshot.canUpdateCharacters &&
    (!snapshot.ownerOnly || item.createdUserId === snapshot.playerId)
  );
}

export function accessibleCharacterIdsFromTokens(
  items: Item[],
  snapshot: CharacterAccessSnapshot,
): Set<string> {
  const ids = new Set<string>();
  for (const item of items) {
    if (!playerControlsCharacterToken(item, snapshot)) continue;
    const link = getCharacterLink(item);
    if (link) ids.add(link.characterId);
  }
  return ids;
}

export async function getCharacterAccessSnapshot(
  provider: CharacterAccessProvider,
): Promise<CharacterAccessSnapshot> {
  const role = await provider.getRole();
  if (role === "GM") {
    return {
      role,
      canUpdateCharacters: true,
      ownerOnly: false,
    };
  }
  const [playerId, canUpdateCharacters, ownerOnly] = await Promise.all([
    provider.getPlayerId(),
    provider.hasPermission("CHARACTER_UPDATE"),
    provider.hasPermission("CHARACTER_OWNER_ONLY"),
  ]);
  return { role, playerId, canUpdateCharacters, ownerOnly };
}

export async function filterAccessibleCharacters(
  records: CharacterRecord[],
  scene: SceneItemStore,
  provider: CharacterAccessProvider,
): Promise<CharacterRecord[]> {
  const snapshot = await getCharacterAccessSnapshot(provider);
  if (snapshot.role === "GM") return records;
  const ids = accessibleCharacterIdsFromTokens(
    await scene.getItems(),
    snapshot,
  );
  return records.filter((record) => ids.has(record.id));
}

export async function canAccessCharacter(
  characterId: string,
  scene: SceneItemStore,
  provider: CharacterAccessProvider,
): Promise<boolean> {
  const snapshot = await getCharacterAccessSnapshot(provider);
  if (snapshot.role === "GM") return true;
  return accessibleCharacterIdsFromTokens(await scene.getItems(), snapshot).has(
    characterId,
  );
}
