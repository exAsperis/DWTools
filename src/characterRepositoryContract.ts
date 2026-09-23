import type { CreatureFieldPatch, CreatureFields } from "./constants";
import type {
  CharacterLookup,
  CharacterRecord,
  CharacterTombstone,
} from "./characterRepository";
import type { CharacterHistory } from "./characterRevision";
import type { InventoryItem, InventorySelection } from "./inventory";

export type CharacterRepositoryLookup =
  CharacterLookup | { status: "conflict"; history: CharacterHistory };

export interface CharacterRepositoryConflict {
  characterId: string;
  history: CharacterHistory;
}

export interface CharacterRepositoryChange {
  characterId: string;
  lookup: CharacterRepositoryLookup;
}

export interface CharacterRepositoryContract {
  list(): Promise<CharacterRecord[]>;
  listConflicts(): Promise<CharacterRepositoryConflict[]>;
  inspect(characterId: string): Promise<CharacterRepositoryLookup>;
  create(fields: CreatureFields): Promise<CharacterRecord>;
  patch(
    characterId: string,
    patch: CreatureFieldPatch,
  ): Promise<CharacterRecord>;
  replace(
    characterId: string,
    fields: CreatureFields,
  ): Promise<CharacterRecord>;
  adjustHp(characterId: string, amount: number): Promise<CharacterRecord>;
  adjustXp(characterId: string, amount: number): Promise<CharacterRecord>;
  addInventoryItem(
    characterId: string,
    item: InventoryItem,
  ): Promise<CharacterRecord>;
  updateInventoryItem(
    characterId: string,
    selection: InventorySelection,
    replacement: InventoryItem,
  ): Promise<CharacterRecord>;
  changeInventoryItemCount(
    characterId: string,
    selection: InventorySelection,
    change: number,
  ): Promise<CharacterRecord>;
  removeInventoryItem(
    characterId: string,
    selection: InventorySelection,
  ): Promise<CharacterRecord>;
  transferInventoryItem(
    sourceCharacterId: string,
    destinationCharacterId: string,
    selection: InventorySelection,
    count: number,
  ): Promise<{ source: CharacterRecord; destination: CharacterRecord }>;
  delete(characterId: string): Promise<unknown>;
  resolveConflict(
    characterId: string,
    selectedHeadWriteId: string,
  ): Promise<CharacterRecord | CharacterTombstone>;
  subscribe(
    callback: (changes: CharacterRepositoryChange[]) => void,
  ): () => void;
}
