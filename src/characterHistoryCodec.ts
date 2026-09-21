import {
  CHARACTER_RECORD_SCHEMA_VERSION,
  parseCharacterRecord,
  type StoredCharacterRecord,
} from "./characterRepository";

import {
  validateHistory,
  type CharacterHistory,
  type RevisionIssueCode,
  type VersionedCharacterRecord,
} from "./characterRevision";

export class CharacterHistoryCodecError extends Error {
  constructor(
    message: string,
    readonly details?: Record<string, unknown>,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = "CharacterHistoryCodecError";
  }
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

const fatalHistoryIssues = new Set<RevisionIssueCode>([
  "invalid-identity",
  "invalid-parent",
  "duplicate-parent",
  "missing-head",
  "duplicate-head",
  "cycle",
]);

/**
 * Parse, validate, normalize, and clone a CharacterHistory.
 *
 * Missing parent revisions are deliberately permitted.
 * They represent incomplete ancestry rather than corrupt
 * data and are handled conservatively by the revision
 * engine as unknown ancestry.
 *
 * All other structural history errors are rejected.
 */
export function parseCharacterHistory(
  value: unknown,
  expectedCharacterId?: string,
): CharacterHistory {
  if (!isObject(value)) {
    throw new CharacterHistoryCodecError(
      "Character history must be an object.",
    );
  }

  if (value.formatVersion !== 1) {
    throw new CharacterHistoryCodecError(
      "Unsupported Character history format.",
      {
        formatVersion: value.formatVersion,
      },
    );
  }

  if (typeof value.characterId !== "string" || value.characterId.length === 0) {
    throw new CharacterHistoryCodecError(
      "Character history requires a Character ID.",
    );
  }

  const characterId = value.characterId;

  if (
    expectedCharacterId !== undefined &&
    characterId !== expectedCharacterId
  ) {
    throw new CharacterHistoryCodecError(
      "Character history belongs to a different Character.",
      {
        expectedCharacterId,
        actualCharacterId: characterId,
      },
    );
  }

  if (!isObject(value.revisions) || Object.keys(value.revisions).length === 0) {
    throw new CharacterHistoryCodecError(
      "Character history requires at least one revision.",
      { characterId },
    );
  }

  if (
    !Array.isArray(value.heads) ||
    value.heads.length === 0 ||
    value.heads.some((head) => typeof head !== "string" || head.length === 0)
  ) {
    throw new CharacterHistoryCodecError(
      "Character history requires at least one valid head.",
      { characterId },
    );
  }

  const revisions: Record<string, VersionedCharacterRecord> = {};

  for (const [revisionId, rawRevision] of Object.entries(value.revisions)) {
    if (revisionId.length === 0 || !isObject(rawRevision)) {
      throw new CharacterHistoryCodecError(
        "Character history contains an invalid revision.",
        {
          characterId,
          revisionId,
        },
      );
    }

    if (rawRevision.schemaVersion !== CHARACTER_RECORD_SCHEMA_VERSION) {
      throw new CharacterHistoryCodecError(
        "Character history revisions must use the current Character schema.",
        {
          characterId,
          revisionId,
          schemaVersion: rawRevision.schemaVersion,
          expectedSchemaVersion: CHARACTER_RECORD_SCHEMA_VERSION,
        },
      );
    }

    const rawParents = rawRevision.parents;

    if (
      !Array.isArray(rawParents) ||
      rawParents.some(
        (parent) => typeof parent !== "string" || parent.length === 0,
      )
    ) {
      throw new CharacterHistoryCodecError(
        "Character revision contains invalid parent IDs.",
        {
          characterId,
          revisionId,
        },
      );
    }

    const parsed: StoredCharacterRecord | undefined = parseCharacterRecord(
      rawRevision,
      characterId,
    );

    if (!parsed) {
      throw new CharacterHistoryCodecError(
        "Character history contains a malformed Character revision.",
        {
          characterId,
          revisionId,
        },
      );
    }

    if (parsed.writeId !== revisionId) {
      throw new CharacterHistoryCodecError(
        "Character revision key does not match its write ID.",
        {
          characterId,
          revisionId,
          writeId: parsed.writeId,
        },
      );
    }

    revisions[revisionId] = {
      ...parsed,
      parents: [...rawParents],
    };
  }

  const history: CharacterHistory = {
    formatVersion: 1,
    characterId,
    revisions,
    heads: [...value.heads],
  };

  const fatalIssue = validateHistory(history).find((issue) =>
    fatalHistoryIssues.has(issue.code),
  );

  if (fatalIssue) {
    throw new CharacterHistoryCodecError(
      `Invalid Character revision history: ${fatalIssue.code}.`,
      {
        characterId,
        revisionId: fatalIssue.revisionId,
        relatedId: fatalIssue.relatedId,
      },
    );
  }

  return history;
}

/**
 * Return a detached, validated copy of a history.
 */
export function cloneCharacterHistory(
  history: CharacterHistory,
): CharacterHistory {
  return parseCharacterHistory(history, history.characterId);
}

/**
 * Serialize only after validation.
 */
export function serializeCharacterHistory(history: CharacterHistory): string {
  return JSON.stringify(cloneCharacterHistory(history));
}

/**
 * Parse a serialized CharacterHistory.
 */
export function deserializeCharacterHistory(
  serialized: string,
  expectedCharacterId?: string,
): CharacterHistory {
  let value: unknown;

  try {
    value = JSON.parse(serialized);
  } catch (error) {
    throw new CharacterHistoryCodecError(
      "Stored Character history is not valid JSON.",
      undefined,
      { cause: error },
    );
  }

  return parseCharacterHistory(value, expectedCharacterId);
}

/**
 * Useful for diagnostics and future storage-status UI.
 *
 * This is a measurement only. It does not impose a
 * storage-size limit.
 */
export function serializedCharacterHistoryBytes(
  history: CharacterHistory,
): number {
  return new TextEncoder().encode(serializeCharacterHistory(history))
    .byteLength;
}
