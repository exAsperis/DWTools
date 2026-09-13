import { findRollExpressions } from "./rollExpression";

function escapeHtml(value: string): string {
  return value.replace(
    /[&<>'"]/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        '"': "&quot;",
      })[character]!,
  );
}
export function renderRollButton(source: string): string {
  const escaped = escapeHtml(source);
  return `<button class="inline-roll" type="button" data-roll-expression="${escaped}" aria-label="Roll ${escaped}">🎲 ${escaped}</button>`;
}

export function countTopLevelListItems(source: string): number {
  return topLevelListItems(source).length;
}

export function topLevelListItems(source: string): string[] {
  return source
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .flatMap((line) => {
      const match = line.match(/^(?:[-*+]\s+|\d+[.)]\s+)(\S.*)$/);
      return match ? [match[1].trim()] : [];
    });
}

export function rollListChoice(
  choices: readonly string[],
  random: () => number = Math.random,
): string | undefined {
  if (!choices.length) return undefined;
  const index = Math.min(
    Math.floor(random() * choices.length),
    choices.length - 1,
  );
  return choices[index];
}

function linkify(text: string): string {
  const matches = findRollExpressions(text);
  if (!matches.length) return escapeHtml(text);
  let output = "";
  let offset = 0;
  for (const match of matches) {
    output += escapeHtml(text.slice(offset, match.start));
    output += renderRollButton(match.source);
    offset = match.end;
  }
  return output + escapeHtml(text.slice(offset));
}

function inlineMarkdown(source: string): string {
  const placeholders: string[] = [];
  const protectedText = source.replace(
    /(\*\*|__)(.+?)\1|(\*|_)(.+?)\3/g,
    (_match, strongMarker, strongText, _emphasisMarker, emphasisText) => {
      const markup = strongMarker
        ? `<strong>${inlineMarkdown(strongText)}</strong>`
        : `<em>${inlineMarkdown(emphasisText)}</em>`;
      const placeholder = `\u0000${placeholders.length}\u0000`;
      placeholders.push(markup);
      return placeholder;
    },
  );
  return linkify(protectedText).replace(
    /\u0000(\d+)\u0000/g,
    (_, index: string) => placeholders[Number(index)] ?? "",
  );
}

function paragraph(lines: string[]): string {
  return `<p>${lines.map(inlineMarkdown).join("<br>")}</p>`;
}

export function renderContextMarkdown(source: string): string {
  const lines = source.replace(/\r\n?/g, "\n").split("\n");
  const blocks: string[] = [];
  let paragraphLines: string[] = [];
  let listType: "ul" | "ol" | undefined;
  let listItems: string[] = [];

  const flushParagraph = () => {
    if (paragraphLines.length) blocks.push(paragraph(paragraphLines));
    paragraphLines = [];
  };
  const flushList = () => {
    if (listType && listItems.length)
      blocks.push(
        `<${listType}>${listItems.map((item) => `<li>${inlineMarkdown(item)}</li>`).join("")}</${listType}>`,
      );
    listType = undefined;
    listItems = [];
  };

  for (const line of lines) {
    const unordered = line.match(/^\s*[-*+]\s+(.+)$/);
    const ordered = line.match(/^\s*\d+[.)]\s+(.+)$/);
    if (unordered || ordered) {
      flushParagraph();
      const nextType = unordered ? "ul" : "ol";
      if (listType && listType !== nextType) flushList();
      listType = nextType;
      listItems.push((unordered ?? ordered)![1]);
    } else if (line.trim() === "") {
      flushParagraph();
      flushList();
    } else {
      flushList();
      paragraphLines.push(line);
    }
  }
  flushParagraph();
  flushList();
  return blocks.join("");
}
