export type DwIconName = "eye" | "eye-off" | "shield";

const ICON_CONTENT: Record<DwIconName, string> = {
  eye: [
    '<path d="M2.2 12s3.4-6 9.8-6 9.8 6 9.8 6-3.4 6-9.8 6-9.8-6-9.8-6Z"/>',
    '<circle cx="12" cy="12" r="3"/>',
  ].join(""),
  "eye-off": [
    '<circle cx="12" cy="12" r="10"/>',
    '<path d="M4.9 12s2.5-4.2 7.1-4.2 7.1 4.2 7.1 4.2-2.5 4.2-7.1 4.2S4.9 12 4.9 12Z"/>',
    '<circle cx="12" cy="12" r="2.4"/>',
    '<path d="m4.9 4.9 14.2 14.2"/>',
  ].join(""),
  shield: '<path d="M12 2.5 20 5v6.6c0 5.1-3.2 8.2-8 9.9-4.8-1.7-8-4.8-8-9.9V5l8-2.5Z"/>',
};

function svg(icon: DwIconName, color: string, className?: string): string {
  const classAttribute = className ? ` class="${className}"` : "";
  return `<svg${classAttribute} viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON_CONTENT[icon]}</svg>`;
}

export function iconMarkup(icon: DwIconName, className = "dw-icon"): string {
  return svg(icon, "currentColor", className);
}

export function iconDataUrl(icon: DwIconName, color = "#ffffff"): string {
  return `data:image/svg+xml,${encodeURIComponent(svg(icon, color))}`;
}
