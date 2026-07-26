import {
  CHARACTER_KEY_PREFIX,
  type CreatureFieldPatch,
  type CreatureFields,
} from "./constants";
import {
  mergeCreatureFieldPatch,
  normalizeCreatureFields,
} from "./creatureFields";
import type { RoomMetadata } from "./defaultVisibility";

export const CHARACTER_RECORD_SCHEMA_VERSION = 1;
export const OWLBEAR_ROOM_METADATA_LIMIT_BYTES = 16 * 1024;
export const CHARACTER_METADATA_SAFE_MAX_BYTES = 15 * 1024;
export const CHARACTER_METADATA_WARNING_BYTES = Math.floor(
  OWLBEAR_ROOM_METADATA_LIMIT_BYTES * 0.8,
);

interface CharacterAuditFields {
  schemaVersion: typeof CHARACTER_RECORD_SCHEMA_VERSION;
  id: string;
  revision: number;
  writeId: string;
}

export interface CharacterRecord extends CharacterAuditFields {
  fields: CreatureFields;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
  deleted?: false;
}

export interface CharacterTombstone extends CharacterAuditFields {
  name?: string;
  deleted: true;
  deletedAt: string;
  deletedBy: string;
}

export type StoredCharacterRecord = CharacterRecord | CharacterTombstone;

export type CharacterLookup =
  | { status: "active"; record: CharacterRecord }
  | { status: "deleted"; record: CharacterTombstone }
  | { status: "missing" }
  | { status: "malformed"; value: unknown };

export interface CharacterStorageUsage {
  bytes: number;
  limitBytes: number;
  safeMaximumBytes: number;
  warningBytes: number;
  nearLimit: boolean;
  percentOfLimit: number;
}

export type CharacterRepositoryErrorCode =
  | "API"
  | "CAPACITY"
  | "CONFLICT"
  | "MALFORMED"
  | "NOT_FOUND"
  | "TOMBSTONED"
  | "VALIDATION";

export class CharacterRepositoryError extends Error {
  constructor(
    readonly code: CharacterRepositoryErrorCode,
    message: string,
    readonly details?: Record<string, unknown>,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = "CharacterRepositoryError";
  }
}

export interface CharacterMetadataStore {
  getMetadata(): Promise<RoomMetadata>;
  setMetadata(update: RoomMetadata): Promise<void>;
  onMetadataChange?(callback: (metadata: RoomMetadata) => void): () => void;
}

export interface CharacterRepositoryOptions {
  getActorId: () => Promise<string>;
  now?: () => Date;
  randomUUID?: () => string;
  patchRetries?: number;
}

export interface CharacterChange {
  characterId: string;
  lookup: CharacterLookup;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isAuditFields(
  value: Record<string, unknown>,
  expectedId: string,
): boolean {
  return (
    value.schemaVersion === CHARACTER_RECORD_SCHEMA_VERSION &&
    value.id === expectedId &&
    Number.isInteger(value.revision) &&
    Number(value.revision) >= 1 &&
    typeof value.writeId === "string" &&
    value.writeId.length > 0
  );
}

export function characterMetadataKey(characterId: string): string {
  return `${CHARACTER_KEY_PREFIX}${characterId}`;
}

export function characterIdFromMetadataKey(key: string): string | undefined {
  if (!key.startsWith(CHARACTER_KEY_PREFIX)) return undefined;
  const id = key.slice(CHARACTER_KEY_PREFIX.length);
  return id || undefined;
}

function parseVersionOneCharacterRecord(
  value: unknown,
  expectedId: string,
): StoredCharacterRecord | undefined {
  if (!isObject(value) || !isAuditFields(value, expectedId)) return undefined;

  if (value.deleted === true) {
    if (
      typeof value.deletedAt !== "string" ||
      typeof value.deletedBy !== "string"
    ) {
      return undefined;
    }
    return {
      schemaVersion: CHARACTER_RECORD_SCHEMA_VERSION,
      id: expectedId,
      revision: Number(value.revision),
      writeId: String(value.writeId),
      ...(typeof value.name === "string" && value.name
        ? { name: value.name }
        : {}),
      deleted: true,
      deletedAt: value.deletedAt,
      deletedBy: value.deletedBy,
    };
  }

  if (
    typeof value.createdAt !== "string" ||
    typeof value.createdBy !== "string" ||
    typeof value.updatedAt !== "string" ||
    typeof value.updatedBy !== "string"
  ) {
    return undefined;
  }

  try {
    return {
      schemaVersion: CHARACTER_RECORD_SCHEMA_VERSION,
      id: expectedId,
      fields: normalizeCreatureFields(value.fields),
      revision: Number(value.revision),
      createdAt: value.createdAt,
      createdBy: value.createdBy,
      updatedAt: value.updatedAt,
      updatedBy: value.updatedBy,
      writeId: String(value.writeId),
    };
  } catch {
    return undefined;
  }
}

export function migrateCharacterRecord(
  value: unknown,
  expectedId: string,
): StoredCharacterRecord | undefined {
  if (!isObject(value)) return undefined;
  switch (value.schemaVersion) {
    case CHARACTER_RECORD_SCHEMA_VERSION:
      return parseVersionOneCharacterRecord(value, expectedId);
    default:
      return undefined;
  }
}

export function parseCharacterRecord(
  value: unknown,
  expectedId: string,
): StoredCharacterRecord | undefined {
  return migrateCharacterRecord(value, expectedId);
}

export function parseCharacterManifest(
  metadata: RoomMetadata,
): Map<string, CharacterLookup> {
  const manifest = new Map<string, CharacterLookup>();
  for (const [key, value] of Object.entries(metadata)) {
    const characterId = characterIdFromMetadataKey(key);
    if (!characterId) continue;
    const record = parseCharacterRecord(value, characterId);
    manifest.set(
      characterId,
      record
        ? record.deleted
          ? { status: "deleted", record }
          : { status: "active", record }
        : { status: "malformed", value },
    );
  }
  return manifest;
}

export function serializedMetadataBytes(metadata: RoomMetadata): number {
  return new TextEncoder().encode(JSON.stringify(metadata)).byteLength;
}

export function storageUsage(metadata: RoomMetadata): CharacterStorageUsage {
  const bytes = serializedMetadataBytes(metadata);
  return {
    bytes,
    limitBytes: OWLBEAR_ROOM_METADATA_LIMIT_BYTES,
    safeMaximumBytes: CHARACTER_METADATA_SAFE_MAX_BYTES,
    warningBytes: CHARACTER_METADATA_WARNING_BYTES,
    nearLimit: bytes >= CHARACTER_METADATA_WARNING_BYTES,
    percentOfLimit: (bytes / OWLBEAR_ROOM_METADATA_LIMIT_BYTES) * 100,
  };
}

function lookupFromMetadata(
  metadata: RoomMetadata,
  characterId: string,
): CharacterLookup {
  const key = characterMetadataKey(characterId);
  if (!(key in metadata)) return { status: "missing" };
  const record = parseCharacterRecord(metadata[key], characterId);
  if (!record) return { status: "malformed", value: metadata[key] };
  return record.deleted
    ? { status: "deleted", record }
    : { status: "active", record };
}

function repositoryError(
  error: unknown,
  fallback: string,
): CharacterRepositoryError {
  return error instanceof CharacterRepositoryError
    ? error
    : new CharacterRepositoryError("API", fallback, undefined, {
        cause: error,
      });
}

export class CharacterRepository {
  private readonly now: () => Date;
  private readonly randomUUID: () => string;
  private readonly patchRetries: number;
  private cachedSignatures = new Map<string, string>();
  private cachedLookups = new Map<string, CharacterLookup>();

  constructor(
    private readonly store: CharacterMetadataStore,
    private readonly options: CharacterRepositoryOptions,
  ) {
    this.now = options.now ?? (() => new Date());
    this.randomUUID = options.randomUUID ?? (() => crypto.randomUUID());
    this.patchRetries = Math.max(1, options.patchRetries ?? 3);
  }

  async list(): Promise<CharacterRecord[]> {
    const metadata = await this.readMetadata();
    this.cachedLookups = parseCharacterManifest(metadata);
    return [...this.cachedLookups.values()]
      .flatMap((lookup) => (lookup.status === "active" ? [lookup.record] : []))
      .sort((left, right) =>
        left.fields.name.localeCompare(right.fields.name, undefined, {
          sensitivity: "base",
        }),
      );
  }

  async read(characterId: string): Promise<StoredCharacterRecord | undefined> {
    const lookup = await this.inspect(characterId);
    return lookup.status === "active" || lookup.status === "deleted"
      ? lookup.record
      : undefined;
  }

  async inspect(characterId: string): Promise<CharacterLookup> {
    const lookup = lookupFromMetadata(await this.readMetadata(), characterId);
    this.cachedLookups.set(characterId, lookup);
    return lookup;
  }

  getCached(characterId: string): CharacterLookup | undefined {
    return this.cachedLookups.get(characterId);
  }

  async create(fields: CreatureFields): Promise<CharacterRecord> {
    const normalized = normalizeCreatureFields(fields);
    const actorId = await this.getActorId();
    const timestamp = this.now().toISOString();
    const record: CharacterRecord = {
      schemaVersion: CHARACTER_RECORD_SCHEMA_VERSION,
      id: this.randomUUID(),
      fields: normalized,
      revision: 1,
      createdAt: timestamp,
      createdBy: actorId,
      updatedAt: timestamp,
      updatedBy: actorId,
      writeId: this.randomUUID(),
    };
    await this.writeAndConfirm(record);
    return record;
  }

  async patch(
    characterId: string,
    patch: CreatureFieldPatch,
  ): Promise<CharacterRecord> {
    for (let attempt = 1; attempt <= this.patchRetries; attempt += 1) {
      const metadata = await this.readMetadata();
      const current = this.requireActive(
        lookupFromMetadata(metadata, characterId),
        characterId,
      );
      const actorId = await this.getActorId();
      const candidate: CharacterRecord = {
        ...current,
        fields: mergeCreatureFieldPatch(current.fields, patch),
        revision: current.revision + 1,
        updatedAt: this.now().toISOString(),
        updatedBy: actorId,
        writeId: this.randomUUID(),
      };
      if (!(await this.writeCandidate(candidate, current.writeId))) continue;
      const readBack = await this.inspect(characterId);
      if (
        readBack.status === "active" &&
        readBack.record.writeId === candidate.writeId
      ) {
        return readBack.record;
      }
    }
    throw new CharacterRepositoryError(
      "CONFLICT",
      "Another client kept changing this character. Reload it and try again.",
      { characterId, attempts: this.patchRetries },
    );
  }

  async replace(
    characterId: string,
    fields: CreatureFields,
  ): Promise<CharacterRecord> {
    const normalized = normalizeCreatureFields(fields);
    for (let attempt = 1; attempt <= this.patchRetries; attempt += 1) {
      const metadata = await this.readMetadata();
      const current = this.requireActive(
        lookupFromMetadata(metadata, characterId),
        characterId,
      );
      const actorId = await this.getActorId();
      const candidate: CharacterRecord = {
        ...current,
        fields: normalized,
        revision: current.revision + 1,
        updatedAt: this.now().toISOString(),
        updatedBy: actorId,
        writeId: this.randomUUID(),
      };
      if (!(await this.writeCandidate(candidate, current.writeId))) continue;
      const readBack = await this.inspect(characterId);
      if (
        readBack.status === "active" &&
        readBack.record.writeId === candidate.writeId
      ) {
        return readBack.record;
      }
    }
    throw new CharacterRepositoryError(
      "CONFLICT",
      "Another client kept changing this character. Reload it and try again.",
      { characterId, attempts: this.patchRetries },
    );
  }

  async delete(characterId: string): Promise<void> {
    const metadata = await this.readMetadata();
    const lookup = lookupFromMetadata(metadata, characterId);
    if (lookup.status !== "active") {
      throw new CharacterRepositoryError(
        "NOT_FOUND",
        "That character record is no longer available.",
        { characterId, status: lookup.status },
      );
    }

    const key = characterMetadataKey(characterId);
    try {
      await this.store.setMetadata({ [key]: undefined });
    } catch (error) {
      throw repositoryError(
        error,
        "Owlbear could not delete the character record.",
      );
    }

    const readBack = await this.inspect(characterId);
    if (readBack.status !== "missing") {
      throw new CharacterRepositoryError(
        "CONFLICT",
        "The character record changed while it was being deleted. Reload and try again.",
        { characterId, status: readBack.status },
      );
    }
    this.cachedLookups.set(characterId, { status: "missing" });
  }

  async cleanupLegacyTombstones(): Promise<number> {
    const metadata = await this.readMetadata();
    const tombstoneIds = [...parseCharacterManifest(metadata).entries()]
      .filter(([, lookup]) => lookup.status === "deleted")
      .map(([characterId]) => characterId);
    if (!tombstoneIds.length) return 0;

    const update: RoomMetadata = {};
    for (const characterId of tombstoneIds) {
      update[characterMetadataKey(characterId)] = undefined;
    }
    try {
      await this.store.setMetadata(update);
    } catch (error) {
      throw repositoryError(
        error,
        "Owlbear could not clean up legacy deleted character records.",
      );
    }

    const readBack = await this.readMetadata();
    const remaining = tombstoneIds.filter(
      (characterId) =>
        lookupFromMetadata(readBack, characterId).status !== "missing",
    );
    if (remaining.length) {
      throw new CharacterRepositoryError(
        "CONFLICT",
        "Some legacy deleted character records changed during cleanup. Reload and try again.",
        { characterIds: remaining },
      );
    }
    for (const characterId of tombstoneIds) {
      this.cachedLookups.set(characterId, { status: "missing" });
    }
    return tombstoneIds.length;
  }

  async estimateUsage(): Promise<CharacterStorageUsage> {
    return storageUsage(await this.readMetadata());
  }

  subscribe(
    callback: (
      changes: CharacterChange[],
      usage: CharacterStorageUsage,
    ) => void,
  ): () => void {
    if (!this.store.onMetadataChange) return () => undefined;
    return this.store.onMetadataChange((metadata) => {
      const nextSignatures = new Map<string, string>();
      const changes: CharacterChange[] = [];
      for (const [key, value] of Object.entries(metadata)) {
        const characterId = characterIdFromMetadataKey(key);
        if (!characterId) continue;
        const signature = JSON.stringify(value);
        nextSignatures.set(characterId, signature);
        if (this.cachedSignatures.get(characterId) !== signature) {
          changes.push({
            characterId,
            lookup: lookupFromMetadata(metadata, characterId),
          });
        }
      }
      for (const characterId of this.cachedSignatures.keys()) {
        if (!nextSignatures.has(characterId)) {
          changes.push({ characterId, lookup: { status: "missing" } });
        }
      }
      this.cachedSignatures = nextSignatures;
      this.cachedLookups = parseCharacterManifest(metadata);
      callback(changes, storageUsage(metadata));
    });
  }

  private async readMetadata(): Promise<RoomMetadata> {
    try {
      return await this.store.getMetadata();
    } catch (error) {
      throw repositoryError(
        error,
        "DWTools could not read the room's character records.",
      );
    }
  }

  private async getActorId(): Promise<string> {
    try {
      return await this.options.getActorId();
    } catch (error) {
      throw repositoryError(
        error,
        "DWTools could not identify the character-record editor.",
      );
    }
  }

  private requireActive(
    lookup: CharacterLookup,
    characterId: string,
  ): CharacterRecord {
    if (lookup.status === "active") return lookup.record;
    if (lookup.status === "deleted") {
      throw new CharacterRepositoryError(
        "TOMBSTONED",
        "This character record has been deleted.",
        { characterId },
      );
    }
    if (lookup.status === "malformed") {
      throw new CharacterRepositoryError(
        "MALFORMED",
        "This character record is malformed and cannot be edited.",
        { characterId },
      );
    }
    throw new CharacterRepositoryError(
      "NOT_FOUND",
      "This character record no longer exists.",
      { characterId },
    );
  }

  private async writeAndConfirm(record: StoredCharacterRecord): Promise<void> {
    if (!(await this.writeCandidate(record, null))) {
      throw new CharacterRepositoryError(
        "CONFLICT",
        "Another character already uses the generated character ID. Try creating it again.",
        { characterId: record.id },
      );
    }
    const lookup = await this.inspect(record.id);
    const readBack =
      lookup.status === "active" || lookup.status === "deleted"
        ? lookup.record
        : undefined;
    if (readBack?.writeId !== record.writeId) {
      throw new CharacterRepositoryError(
        "CONFLICT",
        "Another client replaced the new character record. Try creating it again.",
        { characterId: record.id },
      );
    }
  }

  private async writeCandidate(
    record: StoredCharacterRecord,
    expectedWriteId: string | null,
  ): Promise<boolean> {
    const currentMetadata = await this.readMetadata();
    const key = characterMetadataKey(record.id);
    const current = lookupFromMetadata(currentMetadata, record.id);
    if (expectedWriteId === null && current.status !== "missing") return false;
    if (
      expectedWriteId !== null &&
      ((current.status !== "active" && current.status !== "deleted") ||
        current.record.writeId !== expectedWriteId)
    ) {
      return false;
    }
    const proposedMetadata = { ...currentMetadata, [key]: record };
    const usage = storageUsage(proposedMetadata);
    if (usage.bytes > CHARACTER_METADATA_SAFE_MAX_BYTES) {
      throw new CharacterRepositoryError(
        "CAPACITY",
        "The room is too close to Owlbear's metadata limit to save this character.",
        {
          characterId: record.id,
          proposedBytes: usage.bytes,
          safeMaximumBytes: usage.safeMaximumBytes,
          limitBytes: usage.limitBytes,
        },
      );
    }
    try {
      await this.store.setMetadata({ [key]: record });
      return true;
    } catch (error) {
      throw repositoryError(
        error,
        "Owlbear could not save the character record.",
      );
    }
  }
}
