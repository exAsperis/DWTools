import { EXTENSION_ID } from "./constants";
import type {
  CharacterAutomaticMergeContext,
  CharacterReconciliationOptions,
} from "./characterReconciliation";
import type { MergeRevisionOptions } from "./characterRevision";

export const AUTOMATIC_CHARACTER_MERGE_ACTOR_ID = `${EXTENSION_ID}/automatic-merge`;

const FNV_128_OFFSET = 0x6c62272e07bb014262b821756295c58dn;
const FNV_128_PRIME = 0x0000000001000000000000000000013bn;
const FNV_128_MASK = (1n << 128n) - 1n;

function fnv1a128(value: string): string {
  let hash = FNV_128_OFFSET;
  const bytes = new TextEncoder().encode(value);

  for (const byte of bytes) {
    hash ^= BigInt(byte);
    hash = (hash * FNV_128_PRIME) & FNV_128_MASK;
  }

  return hash.toString(16).padStart(32, "0");
}

function orderedParentPairs(context: CharacterAutomaticMergeContext): Array<{
  writeId: string;
  updatedAt: string;
}> {
  return [
    {
      writeId: context.parentWriteIds[0],
      updatedAt: context.parentUpdatedAts[0],
    },
    {
      writeId: context.parentWriteIds[1],
      updatedAt: context.parentUpdatedAts[1],
    },
  ].sort((left, right) => left.writeId.localeCompare(right.writeId));
}

/** Generate an automatic merge revision ID that is stable across browsers. */
export function automaticCharacterMergeWriteId(
  context: CharacterAutomaticMergeContext,
): string {
  const parents = orderedParentPairs(context);
  const identity = JSON.stringify([
    context.characterId,
    context.baseWriteId,
    parents[0].writeId,
    parents[1].writeId,
  ]);

  return `${EXTENSION_ID}/automatic-merge/` + fnv1a128(identity);
}

/** Create deterministic audit metadata for an automatic merge revision. */
export function createAutomaticCharacterMergeRevisionOptions(
  context: CharacterAutomaticMergeContext,
): MergeRevisionOptions {
  const parents = orderedParentPairs(context);
  const updatedAt = [parents[0].updatedAt, parents[1].updatedAt].sort()[1];

  return {
    writeId: automaticCharacterMergeWriteId(context),
    actorId: AUTOMATIC_CHARACTER_MERGE_ACTOR_ID,
    updatedAt,
  };
}

export const automaticCharacterReconciliationOptions: CharacterReconciliationOptions =
  {
    createMergeRevisionOptions: createAutomaticCharacterMergeRevisionOptions,
  };
