import { EXTENSION_ID } from "./constants";
import { CharacterRepositoryError } from "./characterRepository";

export interface CharacterMutationLock {
  runExclusive<T>(roomId: string, operation: () => Promise<T>): Promise<T>;
}

/** Narrow adapter around LockManager for unit testing. */
export interface CharacterLockManager {
  request<T>(name: string, callback: () => Promise<T>): Promise<T>;
}

export function characterMutationLockName(roomId: string): string {
  if (!roomId.trim()) {
    throw new CharacterRepositoryError(
      "VALIDATION",
      "A room ID is required for Character mutation locking.",
    );
  }
  return `${EXTENSION_ID}/character-mutation/v1/` + encodeURIComponent(roomId);
}

export class BrowserCharacterMutationLock implements CharacterMutationLock {
  constructor(private readonly manager: CharacterLockManager) {}

  runExclusive<T>(roomId: string, operation: () => Promise<T>): Promise<T> {
    return this.manager.request(characterMutationLockName(roomId), operation);
  }
}

export function createBrowserCharacterMutationLock(): CharacterMutationLock {
  if (typeof navigator === "undefined" || !navigator.locks) {
    throw new CharacterRepositoryError(
      "API",
      "This browser does not provide the Web Locks API required for safe local Character mutations.",
    );
  }
  return new BrowserCharacterMutationLock({
    request: <T>(name: string, callback: () => Promise<T>) =>
      navigator.locks
        .request(name, { mode: "exclusive" }, () => callback())
        .then((result) => result),
  });
}
