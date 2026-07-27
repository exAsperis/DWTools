import { iconMarkup } from "./icons";

export type HomeRole = "GM" | "PLAYER";
export type HomeSection = "agenda" | "moves" | "settings" | "characters";

export interface HomeSectionState {
  agenda: boolean;
  moves: boolean;
  settings: boolean;
  characters: boolean;
}

export interface MoveDefinition {
  id: string;
  name: string;
  text: string;
}

export const DEFAULT_HOME_SECTIONS: HomeSectionState = {
  agenda: true,
  moves: true,
  settings: false,
  characters: false,
};

export const BASIC_MOVES: MoveDefinition[] = [
  {
    id: "hack-and-slash",
    name: "Hack and Slash",
    text: "When you attack an enemy in melee, roll+Str. On a 10+ you deal your damage to the enemy and avoid their attack. At your option, you may choose to do +1d6 damage but expose yourself to the enemy’s attack. On a 7–9, you deal your damage to the enemy and the enemy makes an attack against you.",
  },
  {
    id: "volley",
    name: "Volley",
    text: "When you take aim and shoot at an enemy at range, roll+Dex. On a 10+ you have a clear shot—deal your damage. On a 7–9, choose one (whichever you choose you deal your damage):\n\n• You have to move to get the shot, placing you in danger of the GM’s choice.\n• You have to take what you can get: -1d6 damage.\n• You have to take several shots, reducing your ammo by one.",
  },
  {
    id: "defy-danger",
    name: "Defy Danger",
    text: "When you act despite an imminent threat or suffer a calamity, say how you deal with it and roll. If you do it…\n\n• …by powering through, +Str\n• …by getting out of the way or acting fast, +Dex\n• …by enduring, +Con\n• …with quick thinking, +Int\n• …through mental fortitude, +Wis\n• …using charm and social grace, +Cha\n\nOn a 10+, you do what you set out to, the threat doesn’t come to bear. On a 7–9, you stumble, hesitate, or flinch: the GM will offer you a worse outcome, hard bargain, or ugly choice.",
  },
  {
    id: "defend",
    name: "Defend",
    text: "When you stand in defense of a person, item, or location under attack, roll+Con. On a 10+, hold 3. On a 7–9, hold 1. So long as you stand in defense, when you or the thing you defend is attacked you may spend hold, 1 for 1, to choose an option:\n\n• Redirect an attack from the thing you defend to yourself.\n• Halve the attack’s effect or damage.\n• Open up the attacker to an ally, giving that ally +1 forward against the attacker.\n• Deal damage to the attacker equal to your level.",
  },
  {
    id: "spout-lore",
    name: "Spout Lore",
    text: "When you consult your accumulated knowledge about something, roll+Int. On a 10+ the GM will tell you something interesting and useful about the subject relevant to your situation. On a 7–9 the GM will only tell you something interesting—it’s on you to make it useful. The GM might ask you “How do you know this?” Tell them the truth, now.",
  },
  {
    id: "discern-realities",
    name: "Discern Realities",
    text: "When you closely study a situation or person, roll+Wis. On a 10+ ask the GM 3 questions from the list below. On a 7–9 ask 1. Take +1 forward when acting on the answers.\n\n• What happened here recently?\n• What is about to happen?\n• What should I be on the lookout for?\n• What here is useful or valuable to me?\n• Who’s really in control here?\n• What here is not what it appears to be?",
  },
  {
    id: "parley",
    name: "Parley",
    text: "When you have leverage on a GM character and manipulate them, roll+Cha. Leverage is something they need or want. On a hit they ask you for something and do it if you make them a promise first. On a 7–9, they need some concrete assurance of your promise, right now.",
  },
  {
    id: "aid-or-interfere",
    name: "Aid or Interfere",
    text: "When you help or hinder someone you have a bond with, roll+Bond with them. On a 10+ they take +1 or -2, your choice. On a 7–9 you also expose yourself to danger, retribution, or cost.",
  },
];

function sectionHeading(
  title: string,
  section: HomeSection,
  expanded: boolean,
): string {
  return `
    <div class="section-heading">
      <h2>${title}</h2>
      <button class="section-toggle" type="button" data-toggle-section="${section}" aria-expanded="${expanded}">
        (${expanded ? "collapse" : "expand"})
      </button>
    </div>`;
}

export function buildHomeMarkup(
  role: HomeRole,
  defaultVisibleToPlayers: boolean,
  saving: boolean,
  sections: HomeSectionState = DEFAULT_HOME_SECTIONS,
  characterManagerMarkup = "",
): string {
  const stateLabel = defaultVisibleToPlayers
    ? "Default: visible to players"
    : "Default: hidden from players";
  return `
    <section class="home">
      <div class="home-brand">
        <img class="extension-logo" src="./icon.svg" alt="DWTools logo">
        <h1>DWTools</h1>
      </div>
      ${
        role === "GM"
          ? `<section class="home-section">
        ${sectionHeading("Agenda", "agenda", sections.agenda)}
        ${
          sections.agenda
            ? `<ul class="agenda-list">
          <li>Portray a fantastic world</li>
          <li>Fill the characters’ lives with adventure</li>
          <li>Play to find out what happens</li>
        </ul>`
            : ""
        }
      </section>`
          : ""
      }
      <section class="home-section">
        ${sectionHeading("Moves", "moves", sections.moves)}
        ${
          sections.moves
            ? `<div class="move-list">${BASIC_MOVES.map(
                (move) =>
                  `<button type="button" class="move-link" data-move="${move.id}">${move.name}</button>`,
              ).join("")}</div>`
            : ""
        }
      </section>
      ${
        role === "GM"
          ? `<section class="home-section">
        ${sectionHeading("Settings", "settings", sections.settings)}
        ${
          sections.settings
            ? `<div class="default-visibility">
          <span>Default character overlay:</span>
          <button class="default-visibility-toggle" type="button" id="default-visibility" aria-label="${stateLabel}" title="${stateLabel}" ${saving ? "disabled" : ""}>
            ${iconMarkup(defaultVisibleToPlayers ? "eye" : "eye-off", "default-visibility-icon")}
          </button>
        </div>`
            : ""
        }
      </section>
      ${characterManagerMarkup}`
          : ""
      }
      <dialog id="move-dialog" class="move-dialog">
        <div class="move-dialog-heading">
          <h2 id="move-dialog-title"></h2>
          <button type="button" class="icon-button" id="move-dialog-close" aria-label="Close">×</button>
        </div>
        <div id="move-dialog-text" class="move-dialog-text"></div>
      </dialog>
    </section>`;
}
