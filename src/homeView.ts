import { iconMarkup } from "./icons";

export type HomeRole = "GM" | "PLAYER";

export function buildHomeMarkup(
  role: HomeRole,
  defaultVisibleToPlayers: boolean,
  saving: boolean,
): string {
  const stateLabel = defaultVisibleToPlayers
    ? "Default: visible to players"
    : "Default: hidden from players";
  return `
    <section class="home">
      <img class="extension-logo" src="./icon.svg" alt="DWTools logo">
      <h1>DWTools</h1>
      <p>Right-click a character token to add or edit its creature stats.</p>
      <div class="sample"><strong>HP 7/10</strong> &nbsp;███████░░░<br><strong>ARM 1</strong> &nbsp; DMG d8+2</div>
      ${role === "GM" ? `
        <div class="default-visibility">
          <span>Default character overlay visibility:</span>
          <button class="default-visibility-toggle" type="button" id="default-visibility" aria-label="${stateLabel}" title="${stateLabel}" ${saving ? "disabled" : ""}>
            ${iconMarkup(defaultVisibleToPlayers ? "eye" : "eye-off", "default-visibility-icon")}
          </button>
        </div>
      ` : ""}
      <p class="muted">The editor and quick HP controls are available to the GM.</p>
    </section>`;
}
