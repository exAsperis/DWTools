export type DwIconName = "eye" | "eye-off" | "shield";

export type IconCommand =
  | ["M" | "L", number, number]
  | ["C", number, number, number, number, number, number]
  | ["Z"];

const CIRCLE: IconCommand[] = [
  ["M", 22, 12],
  ["C", 22, 17.523, 17.523, 22, 12, 22],
  ["C", 6.477, 22, 2, 17.523, 2, 12],
  ["C", 2, 6.477, 6.477, 2, 12, 2],
  ["C", 17.523, 2, 22, 6.477, 22, 12],
  ["Z"],
];

const EYE: IconCommand[] = [
  ["M", 2.2, 12],
  ["C", 4.8, 7.8, 8, 5.8, 12, 5.8],
  ["C", 16, 5.8, 19.2, 7.8, 21.8, 12],
  ["C", 19.2, 16.2, 16, 18.2, 12, 18.2],
  ["C", 8, 18.2, 4.8, 16.2, 2.2, 12],
  ["Z"],
  ["M", 15, 12],
  ["C", 15, 13.657, 13.657, 15, 12, 15],
  ["C", 10.343, 15, 9, 13.657, 9, 12],
  ["C", 9, 10.343, 10.343, 9, 12, 9],
  ["C", 13.657, 9, 15, 10.343, 15, 12],
  ["Z"],
];

const ICON_COMMANDS: Record<DwIconName, IconCommand[]> = {
  eye: EYE,
  "eye-off": [
    ...CIRCLE,
    ["M", 5, 12],
    ["C", 6.9, 9.2, 9.2, 8, 12, 8],
    ["C", 14.8, 8, 17.1, 9.2, 19, 12],
    ["C", 17.1, 14.8, 14.8, 16, 12, 16],
    ["C", 9.2, 16, 6.9, 14.8, 5, 12],
    ["Z"],
    ["M", 14, 12],
    ["C", 14, 13.105, 13.105, 14, 12, 14],
    ["C", 10.895, 14, 10, 13.105, 10, 12],
    ["C", 10, 10.895, 10.895, 10, 12, 10],
    ["C", 13.105, 10, 14, 10.895, 14, 12],
    ["Z"],
    ["M", 4.9, 4.9],
    ["L", 19.1, 19.1],
  ],
  shield: [
    ["M", 12, 2.5],
    ["L", 20, 5],
    ["L", 20, 11.6],
    ["C", 20, 16.7, 16.8, 19.8, 12, 21.5],
    ["C", 7.2, 19.8, 4, 16.7, 4, 11.6],
    ["L", 4, 5],
    ["L", 12, 2.5],
    ["Z"],
  ],
};

export function iconCommands(icon: DwIconName): IconCommand[] {
  return ICON_COMMANDS[icon].map((command) => [...command] as IconCommand);
}

function svgPathData(icon: DwIconName): string {
  return ICON_COMMANDS[icon].map((command) => command.join(" ")).join(" ");
}

export function iconMarkup(icon: DwIconName, className = "dw-icon"): string {
  return `<svg class="${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${svgPathData(icon)}"/></svg>`;
}
