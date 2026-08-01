import { iconMarkup } from "./icons";

export type HomeRole = "GM" | "PLAYER";
export type HomeSection =
  | "agenda"
  | "principles"
  | "moves"
  | "basicMoves"
  | "specialMoves"
  | "encounter"
  | "encounterInactive"
  | "settings"
  | "characters";
export type HomeMajorSection =
  | "agenda"
  | "principles"
  | "moves"
  | "encounter"
  | "settings"
  | "characters";

export interface HomeSectionState {
  agenda: boolean;
  principles: boolean;
  moves: boolean;
  basicMoves: boolean;
  specialMoves: boolean;
  encounter: boolean;
  encounterInactive: boolean;
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
  principles: true,
  moves: true,
  basicMoves: true,
  specialMoves: false,
  encounter: false,
  encounterInactive: false,
  settings: false,
  characters: false,
};

export const DEFAULT_HOME_SECTION_ORDER: HomeMajorSection[] = [
  "agenda",
  "principles",
  "moves",
  "encounter",
  "settings",
  "characters",
];

export function normalizeHomeSectionOrder(value: unknown): HomeMajorSection[] {
  const valid = new Set<HomeMajorSection>(DEFAULT_HOME_SECTION_ORDER);
  const stored = Array.isArray(value)
    ? value.filter(
        (entry): entry is HomeMajorSection =>
          typeof entry === "string" && valid.has(entry as HomeMajorSection),
      )
    : [];
  const normalized = [...new Set(stored)];
  for (const section of DEFAULT_HOME_SECTION_ORDER) {
    if (
      section !== "encounter" &&
      section !== "principles" &&
      !normalized.includes(section)
    ) {
      normalized.push(section);
    }
  }
  if (!normalized.includes("principles")) {
    const agendaIndex = normalized.indexOf("agenda");
    normalized.splice(
      agendaIndex >= 0 ? agendaIndex + 1 : 0,
      0,
      "principles",
    );
  }
  if (!normalized.includes("encounter")) {
    const movesIndex = normalized.indexOf("moves");
    normalized.splice(
      movesIndex >= 0 ? movesIndex + 1 : normalized.length,
      0,
      "encounter",
    );
  }
  return normalized;
}

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

export const SPECIAL_MOVES: MoveDefinition[] = [
  {
    id: "last-breath",
    name: "Last Breath",
    text: "When you’re dying you catch a glimpse of what lies beyond the Black Gates of Death’s Kingdom (the GM will describe it). Then roll (just roll, +nothing—yeah, Death doesn’t care how tough or cool you are). On a 10+ you’ve cheated death—you’re in a bad spot but you’re still alive. On a 7–9 Death will offer you a bargain. Take it and stabilize or refuse and pass beyond the Black Gates into whatever fate awaits you. On a miss, your fate is sealed. You’re marked as Death’s own and you’ll cross the threshold soon. The GM will tell you when.",
  },
  {
    id: "encumbrance",
    name: "Encumbrance",
    text: "When you make a move while carrying weight up to or equal to load, you’re fine. When you make a move while carrying weight equal to load+1 or load+2, you take -1. When you make a move while carrying weight greater than load+2, you have a choice: drop at least 1 weight and roll at -1, or automatically fail.",
  },
  {
    id: "make-camp",
    name: "Make Camp",
    text: "When you settle in to rest consume a ration. If you’re somewhere dangerous decide the watch order as well. If you have enough XP you may Level Up. When you wake from at least a few uninterrupted hours of sleep heal damage equal to half your max HP.",
  },
  {
    id: "take-watch",
    name: "Take Watch",
    text: "When you’re on watch and something approaches the camp roll+Wis. On a 10+ you’re able to wake the camp and prepare a response, the camp takes +1 forward. On a 7–9 you react just a moment too late; the camp is awake but hasn’t had time to prepare. You have weapons and armor but little else. On a miss whatever lurks outside the campfire’s light has the drop on you.",
  },
  {
    id: "undertake-a-perilous-journey",
    name: "Undertake a Perilous Journey",
    text: "When you travel through hostile territory, choose one member of the party to act as trailblazer, one to scout ahead, and one to be quartermaster (the same character cannot have two jobs). If you don’t have enough party members or choose not to assign a job, treat that job as if it had rolled a 6. Each character with a job to do rolls+Wis. On a 10+ the quartermaster reduces the number of rations required by one.\n\nOn a 10+ the trailblazer reduces the amount of time it takes to reach your destination (the GM will say by how much). On a 10+ the scout will spot any trouble quick enough to let you get the drop on it. On a 7–9 each role performs their job as expected: the normal number of rations are consumed, the journey takes about as long as expected, no one gets the drop on you but you don’t get the drop on them either.",
  },
  {
    id: "level-up",
    name: "Level Up",
    text: "When you have downtime (hours or days) and XP equal to (or greater than) your current level + 7, subtract your current level + 7 from your XP, increase your level by 1, and choose a new advanced move from your class. If you are the wizard, you also get to add a new spell to your spellbook.\n\nChoose one of your stats and increase it by 1 (this may change your modifier). Changing your Constitution increases your maximum and current HP. Ability scores can’t go higher than 18.",
  },
  {
    id: "end-of-session",
    name: "End of Session",
    text: "When you reach the end of a session, choose one of your bonds that you feel is resolved (completely explored, no longer relevant, or otherwise). Ask the player of the character you have the bond with if they agree. If they do, mark XP and write a new bond with whomever you wish.\n\nOnce bonds have been updated look at your alignment. If you fulfilled that alignment at least once this session, mark XP. Then answer these three questions as a group:\n\n• Did we learn something new and important about the world?\n• Did we overcome a notable monster or enemy?\n• Did we loot a memorable treasure?\n\nFor each “yes” answer everyone marks XP.",
  },
  {
    id: "carouse",
    name: "Carouse",
    text: "When you return triumphant and throw a big party, spend 100 coin and roll + extra 100s of coin spent. On a 10+ choose 3. On a 7–9 choose 1. On a miss, you still choose one, but things get really out of hand.\n\n• You befriend a useful NPC.\n• You hear rumors of an opportunity.\n• You gain useful information.\n• You are not entangled, ensorcelled, or tricked.",
  },
  {
    id: "supply",
    name: "Supply",
    text: "When you go to buy something with gold on hand, if it’s something readily available in the settlement you’re in, you can buy it at market price. If it’s something special, beyond what’s usually available here, or non-mundane, roll+Cha. On a 10+ you find what you’re looking for at a fair price. On a 7–9 you’ll have to pay more or settle for something similar.",
  },
  {
    id: "recover",
    name: "Recover",
    text: "When you do nothing but rest in comfort and safety after a day of rest you recover all your HP. After three days of rest you remove one debility of your choice. If you’re under the care of a healer (magical or otherwise) you heal a debility for every two days of rest instead.",
  },
  {
    id: "recruit",
    name: "Recruit",
    text: "When you put out word that you’re looking to hire help, roll. If you make it known…\n\n• …that your pay is generous, take +1.\n• …what you’re setting out to do, take +1.\n• …that they’ll get a share of whatever you find, take +1.\n\nIf you have a useful reputation around these parts take an additional +1. On a 10+ you’ve got your pick of a number of skilled applicants, your choice who you hire, no penalty for not taking them along. On a 7–9 you’ll have to settle for someone close or turn them away. On a miss someone influential and ill-suited declares they’d like to come along (a foolhardy youth, a loose cannon, or a veiled enemy, for example); bring them and take the consequences or turn them away.\n\nIf you turn away applicants you take -1 forward to Recruit.",
  },
  {
    id: "outstanding-warrants",
    name: "Outstanding Warrants",
    text: "When you return to a civilized place in which you’ve caused trouble before, roll+Cha. On a hit, word has spread of your deeds and everyone recognizes you. On a 7–9, that, and the GM chooses a complication:\n\n• The local constabulary has a warrant out for your arrest.\n• Someone has put a price on your head.\n• Someone important to you has been put in a bad spot as a result of your actions.",
  },
  {
    id: "bolster",
    name: "Bolster",
    text: "When you spend your leisure time in study, meditation, or hard practice, you gain preparation. If you prepare for a week or two, 1 preparation. If you prepare for a month or longer, 3 preparation. When your preparation pays off spend 1 preparation for +1 to any roll. You can only spend one preparation per roll.",
  },
];

function sectionHeading(
  title: string,
  section: HomeSection,
  expanded: boolean,
): string {
  return `
    <div class="section-heading major-section-heading" draggable="true" data-drag-section="${section}">
      <button class="section-toggle" type="button" data-toggle-section="${section}" aria-expanded="${expanded}">
        <span class="section-arrow" aria-hidden="true">&#9656;</span><span>${title}</span>
      </button>
    </div>`;
}

function moveSubsection(
  title: string,
  section: "basicMoves" | "specialMoves",
  expanded: boolean,
  moves: MoveDefinition[],
): string {
  return `
    <section class="move-subsection">
      <div class="move-subheading">
        <button class="section-toggle" type="button" data-toggle-section="${section}" aria-expanded="${expanded}">
          <span class="section-arrow" aria-hidden="true">&#9656;</span><span>${title}</span>
        </button>
      </div>
      ${
        expanded
          ? `<div class="move-list">${moves
              .map(
                (move) =>
                  `<button type="button" class="move-link" data-move="${move.id}">${move.name}</button>`,
              )
              .join("")}</div>`
          : ""
      }
    </section>`;
}

export function buildHomeMarkup(
  role: HomeRole,
  defaultVisibleToPlayers: boolean,
  saving: boolean,
  sections: HomeSectionState = DEFAULT_HOME_SECTIONS,
  characterManagerMarkup = "",
  encounterMarkup = "",
  version = "",
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
          ? `<section class="home-section" data-home-section="agenda">
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
      ${
        role === "GM"
          ? `<section class="home-section" data-home-section="principles">
        ${sectionHeading("Principles", "principles", sections.principles)}
        ${
          sections.principles
            ? `<ul class="principles-list">
          <li>Draw maps, leave blanks</li>
          <li>Address the characters, not the players</li>
          <li>Embrace the fantastic</li>
          <li>Make a move that follows</li>
          <li>Never speak the name of your move</li>
          <li>Give every monster life</li>
          <li>Name every person</li>
          <li>Ask questions and use the answers</li>
          <li>Be a fan of the characters</li>
          <li>Think dangerous</li>
          <li>Begin and end with the fiction</li>
          <li>Think offscreen, too</li>
        </ul>`
            : ""
        }
      </section>`
          : ""
      }
      <section class="home-section" data-home-section="moves">
        ${sectionHeading("Moves", "moves", sections.moves)}
        ${
          sections.moves
            ? `${moveSubsection("Basic Moves", "basicMoves", sections.basicMoves, BASIC_MOVES)}
        ${moveSubsection("Special Moves", "specialMoves", sections.specialMoves, SPECIAL_MOVES)}`
            : ""
        }
      </section>
      ${
        role === "GM"
          ? `<section class="home-section encounter-section" data-home-section="encounter">
        ${sectionHeading("Encounter (Scene)", "encounter", sections.encounter)}
        ${sections.encounter ? encounterMarkup : ""}
      </section>`
          : ""
      }
      ${
        role === "GM"
          ? `<section class="home-section" data-home-section="settings">
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
      </section>`
          : ""
      }
      ${characterManagerMarkup}
      ${version ? `<p class="extension-version">version ${version}</p>` : ""}
      <dialog id="move-dialog" class="move-dialog">
        <div class="move-dialog-heading">
          <h2 id="move-dialog-title"></h2>
          <button type="button" class="icon-button" id="move-dialog-close" aria-label="Close">×</button>
        </div>
        <div id="move-dialog-text" class="move-dialog-text"></div>
      </dialog>
    </section>`;
}
