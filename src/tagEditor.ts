import {
  formatTags,
  normalizeTags,
  suggestTag,
  tagKeyAction,
  type TagFieldName,
} from "./tags";

export type TagVocabularies = Record<TagFieldName, string[]>;

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

export function tagEditorMarkup(
  label: string,
  name: TagFieldName,
  tags: readonly string[] | undefined,
  id: string,
): string {
  return `<label class="tag-field"><span>${escapeHtml(label)}</span>
    <div class="tag-editor" data-tag-editor="${name}">
      <input type="hidden" name="${name}" value="${escapeHtml(formatTags(tags))}">
      <span class="tag-values"></span>
      <span class="tag-entry"><input id="${escapeHtml(id)}" class="tag-input" type="text" maxlength="160" autocomplete="off"><span class="tag-suggestion" aria-hidden="true"></span></span>
    </div>
  </label>`;
}

export function attachTagEditors(
  root: ParentNode,
  vocabularies: TagVocabularies,
): void {
  for (const editor of root.querySelectorAll<HTMLElement>(
    "[data-tag-editor]",
  )) {
    const field = editor.dataset.tagEditor as TagFieldName;
    const hidden = editor.querySelector<HTMLInputElement>(
      'input[type="hidden"]',
    )!;
    const input = editor.querySelector<HTMLInputElement>(".tag-input")!;
    const values = editor.querySelector<HTMLElement>(".tag-values")!;
    const suggestion = editor.querySelector<HTMLElement>(".tag-suggestion")!;
    let tags = normalizeTags(hidden.value) ?? [];
    let dismissedDraft = "";

    const activeSuggestion = () =>
      input.value === dismissedDraft
        ? undefined
        : suggestTag(input.value, tags, vocabularies[field] ?? []);

    const updateSuggestion = () => {
      const match = activeSuggestion();
      suggestion.textContent = match
        ? `${input.value}${match.slice(input.value.trim().length)}`
        : "";
    };
    const render = () => {
      hidden.value = formatTags(tags);
      values.innerHTML = tags
        .map(
          (tag, index) =>
            `<span class="tag-value"><span>${escapeHtml(tag)}</span><button type="button" data-remove-tag="${index}" aria-label="Remove ${escapeHtml(tag)}" title="Remove ${escapeHtml(tag)}">×</button></span>${index < tags.length - 1 ? '<span class="tag-separator" aria-hidden="true">, </span>' : ""}`,
        )
        .join("");
      for (const button of values.querySelectorAll<HTMLButtonElement>(
        "[data-remove-tag]",
      )) {
        button.addEventListener("click", () => {
          tags.splice(Number(button.dataset.removeTag), 1);
          render();
          hidden.dispatchEvent(new Event("change", { bubbles: true }));
          input.focus();
        });
      }
      updateSuggestion();
    };
    const commit = (replacement?: string): boolean => {
      let next: string[];
      try {
        next = normalizeTags([...tags, replacement ?? input.value]) ?? [];
      } catch (error) {
        input.setCustomValidity(
          error instanceof Error ? error.message : "Tags are invalid.",
        );
        return false;
      }
      input.setCustomValidity("");
      const changed = formatTags(next) !== formatTags(tags);
      tags = next;
      input.value = "";
      dismissedDraft = "";
      render();
      if (changed) hidden.dispatchEvent(new Event("change", { bubbles: true }));
      return true;
    };

    input.addEventListener("input", () => {
      dismissedDraft = "";
      input.setCustomValidity("");
      updateSuggestion();
    });
    input.addEventListener("keydown", (event) => {
      const match = activeSuggestion();
      const action = tagKeyAction(event.key, input.value, match);
      if (action === "commit-draft") {
        const committed = commit();
        if (event.key === "," || !committed) event.preventDefault();
      } else if (action === "commit-suggestion") {
        event.preventDefault();
        commit(match);
      } else if (action === "dismiss-suggestion") {
        event.preventDefault();
        dismissedDraft = input.value;
        updateSuggestion();
      }
    });
    editor.addEventListener("focusout", () => {
      window.setTimeout(() => {
        if (!editor.contains(document.activeElement) && input.value.trim())
          commit();
      });
    });
    editor.closest("form")?.addEventListener(
      "submit",
      (event) => {
        if (!commit()) event.preventDefault();
      },
      { capture: true },
    );
    editor.addEventListener("click", (event) => {
      if (event.target === editor || event.target === values) input.focus();
    });
    render();
  }
}
