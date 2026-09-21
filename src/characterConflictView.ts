import type { CharacterHistory } from "./characterRevision";

export interface CharacterConflictHeadView {
  writeId: string;
  revision: number;
  parents: string[];
  deleted: boolean;
  name: string;
  updatedAt?: string;
  updatedBy?: string;
  summary: string;
}

const shown = (value: number | undefined) =>
  value === undefined ? "—" : String(value);

export function characterConflictHeadViews(
  history: CharacterHistory,
): CharacterConflictHeadView[] {
  return [...history.heads].sort().map((writeId) => {
    const record = history.revisions[writeId];
    if (record.deleted === true) {
      return {
        writeId,
        revision: record.revision,
        parents: [...record.parents],
        deleted: true,
        name: record.name ?? "Deleted Character",
        summary: "Deleted Character",
      };
    }
    const fields = record.fields;
    return {
      writeId,
      revision: record.revision,
      parents: [...record.parents],
      deleted: false,
      name: fields.name,
      updatedAt: record.updatedAt,
      updatedBy: record.updatedBy,
      summary: `HP ${shown(fields.hpCurrent)}/${shown(fields.hpMax)} · ARM ${shown(fields.armor)} · XP ${shown(fields.xp)} · ${(record.inventory ?? []).length} inventory rows`,
    };
  });
}
