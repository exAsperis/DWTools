# DWTools agent notes

Before changing DWTools behavior or presentation, read both of these in full:

- [`docs/product-and-ux-decisions.md`](docs/product-and-ux-decisions.md) records
  the project's goals and explicit product/design choices.
- [`docs/overlay-engineering-notes.md`](docs/overlay-engineering-notes.md)
  records known failure modes, prior implementations, Owlbear-specific
  geometry rules, and the renderer architecture.

Do not reinterpret an intentional choice as an accidental implementation
detail. If a future request changes a documented choice, update the decision
record in the same change.

## Overlay guardrails

- Do not render DWTools overlays into `OBR.scene.items`. Visual overlays must be
  client-local (`OBR.scene.local`) and derived from token metadata.
- Do not let editors, context menus, and the background each render overlays.
  UI surfaces update token metadata only; one background coordinator owns all
  overlay writes.
- Do not use `buildLabel` for bar text. Labels are screen-space, include label
  layout/pointer semantics, and have caused repeated alignment problems. Use
  `buildText` with explicit width and height.
- Give every overlay component a deterministic ID derived from the token ID and
  component role.
- Prefer in-place reconciliation over delete-then-add. A token move must not
  recreate its overlay; keep attachment `POSITION` behavior enabled and let
  Owlbear move the local attachments.
- Calculate image geometry from `Image.image`, `Image.grid`, `Image.scale`,
  `Image.rotation`, and scene grid DPI. Do not infer rendered image width from
  an unrelated overlay constant.
- Shapes belong on `ATTACHMENT`; text belongs on `TEXT`, with explicit bounds.
- Any asynchronous render pass must be serialized and latest-wins. Stale passes
  must not be allowed to write after a newer token state has arrived.
- Preserve `problem example/` unless the user explicitly asks to remove it.

## Required verification for overlay changes

- Unit-test geometry, role visibility, reconciliation, and stale-pass handling.
- Confirm that a position-only token change performs zero overlay writes.
- Test page refresh, continuous dragging, HP changes during dragging, visibility
  toggling, scaling, and multiple GM clients.
- Verify no DWTools display items remain in `OBR.scene.items` after migration.
- Watch the scene for at least two minutes after movement; there must be no
  duplicates, flashing, or old-position ghosts.

## Workspace quirks

- This is a Windows/PowerShell workspace under OneDrive.
- `node_modules` has intermittently lost generated type-package contents. If
  TypeScript suddenly cannot find `chai`, `deep-eql`, or `estree`, verify the
  exact `node_modules` path, remove only that generated directory, and run
  `pnpm install --frozen-lockfile`.
- `dist/` is tracked. A release requires source changes, a version/cache-buster
  update, tests, a production build, and review of generated output.
- Owlbear reloads can reset the viewport. When preserving a test view, record
  Position X, Position Y, and Zoom; restore Zoom first, then Y, then X.
