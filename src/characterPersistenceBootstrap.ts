import { CharacterLocalRepository } from "./characterLocalRepository";
import type { CharacterLocalStore } from "./characterLocalStore";
import type { CharacterMutationLock } from "./characterMutationLock";
import {
  importRoomCharacterMetadataToLocal,
  type CharacterRoomImportSourceStore,
} from "./characterRoomImport";
import { characterStorageStateFromMetadata } from "./characterMigrationState";
import {
  recoverCharacterTransferJournal,
  type CharacterTransferJournalStorage,
} from "./characterTransferJournal";
import { CharacterRepositoryError } from "./characterRepository";

export interface CharacterPersistenceBootstrapDependencies {
  localStore: CharacterLocalStore;
  transferJournal: CharacterTransferJournalStorage;
  roomStore: CharacterRoomImportSourceStore;
  mutationLock: CharacterMutationLock;
  getActorId(): Promise<string>;
  now?: () => Date;
  randomUUID?: () => string;
}

export interface CharacterPersistenceAuthority {
  repository: CharacterLocalRepository;
  localStore: CharacterLocalStore;
  mutationLock: CharacterMutationLock;
  transferJournal: CharacterTransferJournalStorage;
  close(): void;
}

export async function bootstrapCharacterPersistenceAuthority(
  dependencies: CharacterPersistenceBootstrapDependencies,
): Promise<CharacterPersistenceAuthority> {
  const { localStore, transferJournal, roomStore, mutationLock } = dependencies;
  await mutationLock.runExclusive(localStore.roomId, async () => {
    recoverCharacterTransferJournal(localStore, transferJournal);
    let metadata;
    try {
      metadata = await roomStore.getMetadata();
    } catch (error) {
      throw new CharacterRepositoryError(
        "API",
        "DWTools could not read room Character migration state.",
        undefined,
        { cause: error },
      );
    }
    const roomState = characterStorageStateFromMetadata(metadata);
    if (roomState?.roomRecords !== "retired") {
      const imported = importRoomCharacterMetadataToLocal(metadata, localStore);
      if (imported.blockedCharacterIds.length || imported.issues.length) {
        throw new CharacterRepositoryError(
          "MALFORMED",
          "Character migration could not safely import every room record.",
          { imported },
        );
      }
    }
    const scan = localStore.scan();
    if (scan.issues.length) {
      throw new CharacterRepositoryError(
        "MALFORMED",
        "Local Character storage contains malformed entries.",
        { issues: scan.issues },
      );
    }
  });

  const repository = new CharacterLocalRepository(localStore, {
    getActorId: dependencies.getActorId,
    mutationLock,
    transferJournal,
    ...(dependencies.now ? { now: dependencies.now } : {}),
    ...(dependencies.randomUUID ? { randomUUID: dependencies.randomUUID } : {}),
  });
  return {
    repository,
    localStore,
    mutationLock,
    transferJournal,
    close: () => localStore.close(),
  };
}
