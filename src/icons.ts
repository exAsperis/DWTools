export type DwIconName = "eye" | "eye-off" | "shield";

const ICON_GLYPHS: Record<DwIconName, string> = {
  eye: "👁️",
  "eye-off": "🚫",
  shield: "🛡️",
};

export function iconGlyph(icon: DwIconName): string {
  return ICON_GLYPHS[icon];
}
