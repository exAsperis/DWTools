import type { Item } from "@owlbear-rodeo/sdk";
import {
  type CharacterRecord,
  type CharacterRepository,
  CharacterRepositoryError,
} from "./characterRepository";
import {
  CREATURE_KEY,
  type CreatureData,
  type CreatureFieldPatch,
  type CreatureFields,
} from "./constants";
import {
  applyCreatureFieldsToItem,
  creatureFieldsEqual,
  extractCreatureFields,
  getCharacterLink,
  mergeCreatureFieldPatch,
  normalizeCreatureData,
  removeCharacterLink,
  setCharacterLink,
} from "./creatureFields";
import {
  canAccessCharacter,
  filterAccessibleCharacters,
  type CharacterAccessProvider,
} from "./characterAccess";
import type { InventoryItem, InventorySelection } from "./inventory";

export interface SceneItemStore {
  getItems(ids?: string[]): Promise<Item[]>;
  updateItems(items: Item[], update: (drafts: Item[]) => void): Promise<void>;
}

export type CreatureUpdateErrorCode =
  "API" | "LINKED" | "ORPHANED" | "RECORD_SAVED_TOKEN_SYNC_FAILED";

export class CreatureUpdateError extends Error {
  constructor(
    readonly code: CreatureUpdateErrorCode,
    message: string,
    readonly details?: Record<string, unknown>,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = "CreatureUpdateError";
  }
}

function apiError(error: unknown, message: string): CreatureUpdateError {
  return error instanceof CreatureUpdateError
    ? error
    : new CreatureUpdateError("API", message, undefined, { cause: error });
}

function fieldsNeedUpdate(item: Item, fields: CreatureFields): boolean {
  return !creatureFieldsEqual(item, fields, false);
}

export async function currentSceneLinkedTokenCounts(
  scene: SceneItemStore,
): Promise<Map<string, number>> {
  const counts = new Map<string, number>();
  for (const item of await scene.getItems()) {
    const link = getCharacterLink(item);
    if (!link) continue;
    counts.set(link.characterId, (counts.get(link.characterId) ?? 0) + 1);
  }
  return counts;
}

export async function syncCharacterToCurrentScene(
  repository: CharacterRepository,
  scene: SceneItemStore,
  characterId: string,
): Promise<number> {
  const [lookup, items] = await Promise.all([
    repository.inspect(characterId),
    scene.getItems(),
  ]);
  const linked = items.filter(
    (item) => getCharacterLink(item)?.characterId === characterId,
  );
  if (
    !linked.length ||
    lookup.status === "missing" ||
    lookup.status === "malformed"
  ) {
    return 0;
  }

  const targets =
    lookup.status === "deleted"
      ? linked
      : linked.filter((item) => fieldsNeedUpdate(item, lookup.record.fields));
  if (!targets.length) return 0;

  await scene.updateItems(targets, (drafts) => {
    for (const draft of drafts) {
      if (lookup.status === "deleted") {
        removeCharacterLink(draft);
      } else {
        applyCreatureFieldsToItem(draft, lookup.record.fields, false);
      }
    }
  });
  return targets.length;
}

export async function syncAllLinkedCharactersInCurrentScene(
  repository: CharacterRepository,
  scene: SceneItemStore,
): Promise<number> {
  const items = await scene.getItems();
  const characterIds = new Set(
    items.flatMap((item) => {
      const link = getCharacterLink(item);
      return link ? [link.characterId] : [];
    }),
  );
  const lookups = new Map(
    await Promise.all(
      [...characterIds].map(
        async (id) => [id, await repository.inspect(id)] as const,
      ),
    ),
  );
  const targets = items.filter((item) => {
    const link = getCharacterLink(item);
    if (!link) return false;
    const lookup = lookups.get(link.characterId);
    if (
      !lookup ||
      lookup.status === "missing" ||
      lookup.status === "malformed"
    ) {
      return false;
    }
    return (
      lookup.status === "deleted" ||
      fieldsNeedUpdate(item, lookup.record.fields)
    );
  });
  if (!targets.length) return 0;

  await scene.updateItems(targets, (drafts) => {
    for (const draft of drafts) {
      const link = getCharacterLink(draft);
      if (!link) continue;
      const lookup = lookups.get(link.characterId);
      if (!lookup) continue;
      if (lookup.status === "deleted") {
        removeCharacterLink(draft);
      } else if (lookup.status === "active") {
        applyCreatureFieldsToItem(draft, lookup.record.fields, false);
      }
    }
  });
  return targets.length;
}

export class CreatureService {
  constructor(
    readonly repository: CharacterRepository,
    readonly scene: SceneItemStore,
    private readonly accessProvider?: CharacterAccessProvider,
  ) {}

  async updateCreatureFields(
    itemId: string,
    patch: CreatureFieldPatch,
  ): Promise<{ fields: CreatureFields; record?: CharacterRecord }> {
    const item = await this.requireItem(itemId);
    const link = getCharacterLink(item);
    if (!link) {
      const fields = mergeCreatureFieldPatch(
        extractCreatureFields(item),
        patch,
      );
      try {
        await this.scene.updateItems([item], (drafts) => {
          applyCreatureFieldsToItem(drafts[0], fields);
        });
      } catch (error) {
        throw apiError(error, "Owlbear could not update this creature.");
      }
      return { fields };
    }

    const lookup = await this.repository.inspect(link.characterId);
    if (lookup.status !== "active") {
      throw new CreatureUpdateError(
        "ORPHANED",
        lookup.status === "deleted"
          ? "This creature's character record was deleted."
          : lookup.status === "malformed"
            ? "This creature's character record is malformed."
            : "This creature's character record is missing.",
        { characterId: link.characterId, status: lookup.status },
      );
    }

    await this.requireLinkedCharacterAccess(link.characterId);
    const record = await this.repository.patch(link.characterId, patch);
    try {
      await syncCharacterToCurrentScene(
        this.repository,
        this.scene,
        link.characterId,
      );
    } catch (error) {
      throw new CreatureUpdateError(
        "RECORD_SAVED_TOKEN_SYNC_FAILED",
        "The character record was saved, but Owlbear could not synchronize its current-scene tokens.",
        { characterId: link.characterId, record },
        { cause: error },
      );
    }
    return { fields: record.fields, record };
  }

  async replaceCreatureFields(
    itemId: string,
    fields: CreatureFields,
  ): Promise<{ fields: CreatureFields; record?: CharacterRecord }> {
    const item = await this.requireItem(itemId);
    const link = getCharacterLink(item);
    if (!link) {
      return this.updateCreatureFields(itemId, fields);
    }
    await this.requireLinkedCharacterAccess(link.characterId);
    const record = await this.repository.replace(link.characterId, fields);
    try {
      await syncCharacterToCurrentScene(
        this.repository,
        this.scene,
        link.characterId,
      );
    } catch (error) {
      throw new CreatureUpdateError(
        "RECORD_SAVED_TOKEN_SYNC_FAILED",
        "The character record was saved, but Owlbear could not synchronize its current-scene tokens.",
        { characterId: link.characterId, record },
        { cause: error },
      );
    }
    return { fields: record.fields, record };
  }

  async replaceUnlinkedCreatureData(
    itemId: string,
    data: CreatureData,
  ): Promise<CreatureData> {
    const normalized = normalizeCreatureData(data);
    const item = await this.requireItem(itemId);
    if (getCharacterLink(item)) {
      throw new CreatureUpdateError(
        "LINKED",
        "Unlink this token from its Character record before pasting DWTools data.",
      );
    }
    try {
      await this.scene.updateItems([item], (drafts) => {
        const draft = drafts[0];
        if (!draft || getCharacterLink(draft)) {
          throw new CreatureUpdateError(
            "LINKED",
            "This token became linked before the copied DWTools data could be saved. Unlink it and try again.",
          );
        }
        draft.metadata[CREATURE_KEY] = normalized;
      });
    } catch (error) {
      throw apiError(error, "Owlbear could not paste the creature data.");
    }
    return normalized;
  }

  async linkToExistingCharacter(
    itemId: string,
    characterId: string,
    overwriteLabel = true,
  ): Promise<CharacterRecord> {
    const [item, lookup] = await Promise.all([
      this.requireItem(itemId),
      this.repository.inspect(characterId),
    ]);
    if (lookup.status !== "active") {
      throw new CharacterRepositoryError(
        lookup.status === "deleted" ? "TOMBSTONED" : "NOT_FOUND",
        "That character record is no longer available.",
        { characterId, status: lookup.status },
      );
    }
    try {
      await this.scene.updateItems([item], (drafts) => {
        applyCreatureFieldsToItem(
          drafts[0],
          lookup.record.fields,
          overwriteLabel,
        );
        setCharacterLink(drafts[0], characterId);
      });
    } catch (error) {
      throw apiError(error, "Owlbear could not link this token.");
    }
    return lookup.record;
  }

  async createAndLinkCharacter(
    itemId: string,
  ): Promise<{ record: CharacterRecord; rollbackFailed: boolean }> {
    const item = await this.requireItem(itemId);
    const record = await this.repository.create(extractCreatureFields(item));
    try {
      await this.scene.updateItems([item], (drafts) => {
        setCharacterLink(drafts[0], record.id);
      });
      return { record, rollbackFailed: false };
    } catch (error) {
      let rollbackFailed = false;
      try {
        await this.repository.delete(record.id);
      } catch {
        rollbackFailed = true;
      }
      throw new CreatureUpdateError(
        "API",
        rollbackFailed
          ? `The token could not be linked. An unused character record named "${record.fields.name}" was created and must be removed in Character Records.`
          : "The token could not be linked. The unused character record was safely removed.",
        { characterId: record.id, rollbackFailed },
        { cause: error },
      );
    }
  }

  async unlinkCharacter(itemId: string): Promise<void> {
    const item = await this.requireItem(itemId);
    try {
      await this.scene.updateItems([item], (drafts) => {
        removeCharacterLink(drafts[0]);
      });
    } catch (error) {
      throw apiError(error, "Owlbear could not unlink this token.");
    }
  }

  async removeCreatureData(itemId: string): Promise<void> {
    const item = await this.requireItem(itemId);
    try {
      await this.scene.updateItems([item], (drafts) => {
        removeCharacterLink(drafts[0]);
        delete drafts[0].metadata[CREATURE_KEY];
      });
    } catch (error) {
      throw apiError(error, "Owlbear could not remove this creature's data.");
    }
  }

  async getItem(itemId: string): Promise<Item | undefined> {
    return (await this.scene.getItems([itemId]))[0];
  }

  private async requireItem(itemId: string): Promise<Item> {
    let item: Item | undefined;
    try {
      item = await this.getItem(itemId);
    } catch (error) {
      throw apiError(error, "Owlbear could not load this creature.");
    }
    if (!item) {
      throw new CreatureUpdateError(
        "API",
        "That token is no longer in the scene.",
        { itemId },
      );
    }
    return item;
  }

  private async requireLinkedCharacterAccess(
    characterId: string,
  ): Promise<void> {
    if (
      this.accessProvider &&
      !(await canAccessCharacter(characterId, this.scene, this.accessProvider))
    ) {
      throw new CreatureUpdateError(
        "API",
        "You no longer control a token linked to this character.",
        { characterId },
      );
    }
  }
}

export class CharacterManagerService {
  constructor(
    private readonly repository: CharacterRepository,
    private readonly creatures: CreatureService,
    private readonly accessProvider: CharacterAccessProvider,
  ) {}

  async listAccessible(): Promise<CharacterRecord[]> {
    return filterAccessibleCharacters(
      await this.repository.list(),
      this.creatures.scene,
      this.accessProvider,
    );
  }

  async create(fields: CreatureFields): Promise<CharacterRecord> {
    await this.requireGm();
    return this.repository.create(fields);
  }

  async save(
    characterId: string,
    fields: CreatureFields,
  ): Promise<CharacterRecord> {
    await this.requireCharacterAccess(characterId);
    const record = await this.repository.replace(characterId, fields);
    await syncCharacterToCurrentScene(
      this.repository,
      this.creatures.scene,
      characterId,
    );
    return record;
  }

  async patch(
    characterId: string,
    patch: CreatureFieldPatch,
  ): Promise<CharacterRecord> {
    await this.requireCharacterAccess(characterId);
    const record = await this.repository.patch(characterId, patch);
    await syncCharacterToCurrentScene(
      this.repository,
      this.creatures.scene,
      characterId,
    );
    return record;
  }

  async addInventoryItem(
    characterId: string,
    item: InventoryItem,
  ): Promise<CharacterRecord> {
    await this.requireCharacterAccess(characterId);
    return this.repository.addInventoryItem(characterId, item);
  }

  async updateInventoryItem(
    characterId: string,
    selection: InventorySelection,
    replacement: InventoryItem,
  ): Promise<CharacterRecord> {
    await this.requireCharacterAccess(characterId);
    return this.repository.updateInventoryItem(
      characterId,
      selection,
      replacement,
    );
  }

  async changeInventoryItemCount(
    characterId: string,
    selection: InventorySelection,
    change: number,
  ): Promise<CharacterRecord> {
    await this.requireCharacterAccess(characterId);
    return this.repository.changeInventoryItemCount(
      characterId,
      selection,
      change,
    );
  }

  async removeInventoryItem(
    characterId: string,
    selection: InventorySelection,
  ): Promise<CharacterRecord> {
    await this.requireCharacterAccess(characterId);
    return this.repository.removeInventoryItem(characterId, selection);
  }

  async transferInventoryItem(
    sourceCharacterId: string,
    destinationCharacterId: string,
    selection: InventorySelection,
    count: number,
  ): Promise<{ source: CharacterRecord; destination: CharacterRecord }> {
    await this.requireGm();
    return this.repository.transferInventoryItem(
      sourceCharacterId,
      destinationCharacterId,
      selection,
      count,
    );
  }

  async delete(characterId: string): Promise<void> {
    await this.requireGm();
    const lookup = await this.repository.inspect(characterId);
    if (lookup.status !== "active") {
      throw new CharacterRepositoryError(
        "NOT_FOUND",
        "That character record is no longer available.",
        { characterId, status: lookup.status },
      );
    }
    const items = await this.creatures.scene.getItems();
    const linked = items.filter(
      (item) => getCharacterLink(item)?.characterId === characterId,
    );
    if (linked.length) {
      await this.creatures.scene.updateItems(linked, (drafts) => {
        for (const draft of drafts) removeCharacterLink(draft);
      });
    }
    try {
      await this.repository.delete(characterId);
    } catch (error) {
      if (linked.length) {
        try {
          await this.creatures.scene.updateItems(linked, (drafts) => {
            for (const draft of drafts) setCharacterLink(draft, characterId);
          });
        } catch {
          throw new CreatureUpdateError(
            "API",
            "The record could not be deleted, and DWTools could not restore every current-scene link. Creature fields were preserved.",
            { characterId },
            { cause: error },
          );
        }
      }
      throw error;
    }
  }

  async cleanupLegacyTombstones(): Promise<number> {
    await this.requireGm();
    return this.repository.cleanupLegacyTombstones();
  }

  private async requireGm(): Promise<void> {
    if ((await this.accessProvider.getRole()) !== "GM") {
      throw new CharacterRepositoryError(
        "API",
        "Only the GM can manage room character records.",
      );
    }
  }

  private async requireCharacterAccess(characterId: string): Promise<void> {
    if (
      !(await canAccessCharacter(
        characterId,
        this.creatures.scene,
        this.accessProvider,
      ))
    ) {
      throw new CharacterRepositoryError(
        "API",
        "You no longer control a token linked to this character.",
        { characterId },
      );
    }
  }
}
