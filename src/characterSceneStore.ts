import OBR, { type Metadata } from "@owlbear-rodeo/sdk";

import { CHARACTER_KEY_PREFIX } from "./constants";

import {
  characterIdFromMetadataKey,
  characterMetadataKey,
} from "./characterRepository";

import {
  cloneCharacterHistory,
  parseCharacterHistory,
} from "./characterHistoryCodec";

import type { CharacterHistory } from "./characterRevision";

export interface CharacterSceneMetadataApi {
  getMetadata(): Promise<Metadata>;

  setMetadata(update: Metadata): Promise<void>;

  onMetadataChange(callback: (metadata: Metadata) => void): () => void;
}

export type CharacterSceneStoreErrorCode = "READ" | "WRITE" | "MALFORMED";

export class CharacterSceneStoreError extends Error {
  constructor(
    readonly code: CharacterSceneStoreErrorCode,
    message: string,
    readonly details?: Record<string, unknown>,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = "CharacterSceneStoreError";
  }
}

export interface CharacterSceneStoreIssue {
  key: string;
  characterId?: string;
  code: "MALFORMED";
  message: string;
}

export interface CharacterSceneStoreScan {
  histories: CharacterHistory[];
  issues: CharacterSceneStoreIssue[];
}

export interface CharacterSceneChange {
  characterId: string;
  kind: "changed" | "removed";
}

function rawSignature(value: unknown): string {
  try {
    return JSON.stringify(value) ?? "undefined";
  } catch {
    /*
     * Owlbear metadata is JSON-like, so this
     * should not occur for valid API data.
     * Treat an unserializable value as changed.
     */
    return `unserializable:${String(value)}`;
  }
}

export function scanSceneCharacterHistories(
  metadata: Metadata,
): CharacterSceneStoreScan {
  const histories: CharacterHistory[] = [];

  const issues: CharacterSceneStoreIssue[] = [];

  for (const [key, value] of Object.entries(metadata)) {
    if (!key.startsWith(CHARACTER_KEY_PREFIX)) {
      continue;
    }

    const characterId = characterIdFromMetadataKey(key);

    if (!characterId) {
      issues.push({
        key,
        code: "MALFORMED",
        message: "Scene Character metadata key is malformed.",
      });

      continue;
    }

    try {
      histories.push(parseCharacterHistory(value, characterId));
    } catch (error) {
      issues.push({
        key,
        characterId,
        code: "MALFORMED",
        message:
          error instanceof Error
            ? error.message
            : "Scene Character history is malformed.",
      });
    }
  }

  histories.sort((left, right) =>
    left.characterId.localeCompare(right.characterId),
  );

  return {
    histories,
    issues,
  };
}

export class CharacterSceneStore {
  private signatures = new Map<string, string>();

  constructor(private readonly api: CharacterSceneMetadataApi) {}

  async get(characterId: string): Promise<CharacterHistory | undefined> {
    let metadata: Metadata;

    try {
      metadata = await this.api.getMetadata();
    } catch (error) {
      throw new CharacterSceneStoreError(
        "READ",
        "DWTools could not read scene Character storage.",
        { characterId },
        { cause: error },
      );
    }

    const key = characterMetadataKey(characterId);

    if (!(key in metadata)) {
      return undefined;
    }

    try {
      return parseCharacterHistory(metadata[key], characterId);
    } catch (error) {
      throw new CharacterSceneStoreError(
        "MALFORMED",
        "Scene Character history is malformed.",
        {
          characterId,
          key,
        },
        { cause: error },
      );
    }
  }

  async scan(): Promise<CharacterSceneStoreScan> {
    let metadata: Metadata;

    try {
      metadata = await this.api.getMetadata();
    } catch (error) {
      throw new CharacterSceneStoreError(
        "READ",
        "DWTools could not enumerate scene Character storage.",
        undefined,
        { cause: error },
      );
    }

    this.rememberMetadata(metadata);

    return scanSceneCharacterHistories(metadata);
  }

  async put(history: CharacterHistory): Promise<CharacterHistory> {
    let normalized: CharacterHistory;

    try {
      normalized = cloneCharacterHistory(history);
    } catch (error) {
      throw new CharacterSceneStoreError(
        "MALFORMED",
        "Character history cannot be written to the scene because it is invalid.",
        {
          characterId: history.characterId,
        },
        { cause: error },
      );
    }

    const key = characterMetadataKey(normalized.characterId);

    try {
      await this.api.setMetadata({
        [key]: normalized,
      });
    } catch (error) {
      throw new CharacterSceneStoreError(
        "WRITE",
        "DWTools could not save Character history to the current scene.",
        {
          characterId: normalized.characterId,
          key,
        },
        { cause: error },
      );
    }

    return normalized;
  }

  subscribe(callback: (changes: CharacterSceneChange[]) => void): () => void {
    return this.api.onMetadataChange((metadata) => {
      const next = this.metadataSignatures(metadata);

      const changes: CharacterSceneChange[] = [];

      for (const [characterId, signature] of next) {
        if (this.signatures.get(characterId) !== signature) {
          changes.push({
            characterId,
            kind: "changed",
          });
        }
      }

      for (const characterId of this.signatures.keys()) {
        if (!next.has(characterId)) {
          changes.push({
            characterId,
            kind: "removed",
          });
        }
      }

      this.signatures = next;

      if (changes.length > 0) {
        changes.sort((left, right) =>
          left.characterId.localeCompare(right.characterId),
        );

        callback(changes);
      }
    });
  }

  private rememberMetadata(metadata: Metadata): void {
    this.signatures = this.metadataSignatures(metadata);
  }

  private metadataSignatures(metadata: Metadata): Map<string, string> {
    const signatures = new Map<string, string>();

    for (const [key, value] of Object.entries(metadata)) {
      const characterId = characterIdFromMetadataKey(key);

      if (!characterId) continue;

      signatures.set(characterId, rawSignature(value));
    }

    return signatures;
  }
}

export function createObrCharacterSceneStore(): CharacterSceneStore {
  return new CharacterSceneStore({
    getMetadata: () => OBR.scene.getMetadata(),

    setMetadata: (update: Metadata) => OBR.scene.setMetadata(update),

    onMetadataChange: (callback: (metadata: Metadata) => void) =>
      OBR.scene.onMetadataChange(callback),
  });
}
