export const TAG_TEXT_LIMIT = 160;

export type TagFieldName = "tags" | "armorTags" | "damageTags";
export type TagKeyAction =
  "commit-draft" | "commit-suggestion" | "dismiss-suggestion" | "native";

export function tagKeyAction(
  key: string,
  draft: string,
  suggestion: string | undefined,
): TagKeyAction {
  if (key === ",") return "commit-draft";
  if (key === "Tab" && suggestion) return "commit-suggestion";
  if (key === "Tab" && draft.trim()) return "commit-draft";
  if (key === "Delete" && suggestion) return "dismiss-suggestion";
  return "native";
}

export function formatTags(tags: readonly string[] | undefined): string {
  return tags?.join(", ") ?? "";
}

export function normalizeTags(value: unknown): string[] | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  const values = typeof value === "string" ? [value] : value;
  if (!Array.isArray(values) || values.some((tag) => typeof tag !== "string")) {
    throw new Error("Tags must be text or an array of text values.");
  }
  const seen = new Set<string>();
  const tags: string[] = [];
  for (const value of values) {
    for (const part of value.split(",")) {
      const tag = part.trim();
      if (!tag) continue;
      const key = tag.toLocaleLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      tags.push(tag);
    }
  }
  if (!tags.length) return undefined;
  if (formatTags(tags).length > TAG_TEXT_LIMIT) {
    throw new Error(`Tags must be ${TAG_TEXT_LIMIT} characters or fewer.`);
  }
  return tags;
}

export function suggestTag(
  draft: string,
  selected: readonly string[],
  vocabulary: readonly string[],
): string | undefined {
  const prefix = draft.trim().toLocaleLowerCase();
  if (!prefix) return undefined;
  const excluded = new Set(selected.map((tag) => tag.toLocaleLowerCase()));
  return [...vocabulary]
    .filter((tag) => {
      const key = tag.toLocaleLowerCase();
      return key.startsWith(prefix) && key !== prefix && !excluded.has(key);
    })
    .sort((left, right) =>
      left.localeCompare(right, undefined, { sensitivity: "base" }),
    )[0];
}

export function buildTagVocabularies(
  values: Iterable<
    Partial<Record<TagFieldName, readonly string[] | undefined>>
  >,
): Record<TagFieldName, string[]> {
  const result: Record<TagFieldName, string[]> = {
    tags: [],
    armorTags: [],
    damageTags: [],
  };
  for (const field of Object.keys(result) as TagFieldName[]) {
    const seen = new Set<string>();
    for (const value of values) {
      for (const tag of value[field] ?? []) {
        const key = tag.toLocaleLowerCase();
        if (!seen.has(key)) {
          seen.add(key);
          result[field].push(tag);
        }
      }
    }
  }
  return result;
}
