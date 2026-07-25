# DWTools overlay engineering notes

Last updated: 2026-07-25

This document is the durable record for DWTools token-overlay work. It explains
the current defects, the evidence behind the diagnosis, prior approaches, the
parts of Owl Trackers worth adopting, and the architecture to use before adding
more Dungeon World features.

## Executive diagnosis

The current overlay has two independent problems.

1. **Alignment and stacking are built on the wrong primitives.** The renderer
   mixes `Shape` and screen-space `Label` items on the same layer. It estimates
   a label's body position from its pointer anchor, relies on automatic
   z-indexing, and uses inconsistent shape/text anchors. The current HP label is
   also explicitly positioned at `hpTop` rather than the bar center `hpY`, which
   directly explains why the text is too high.
2. **Overlay synchronization has multiple competing writers.** The background
   change listener, initial scene synchronization, editor code, and
   `postMessage` handler can all delete and recreate the same shared scene
   attachments. Multiple GM clients or overlapping old/new extension instances
   amplify the race. The result is duplicate overlay populations at old and new
   token positions, repeated delete/add feedback, and long-lived oscillation.

This is not an unavoidable Owlbear limitation. DWTools currently uses a brittle
rendering and ownership model. The correct fix is a renderer redesign, not more
coordinate nudges.

## Evidence

### Example video

The preserved example is:

`problem example/7_25_2026, 12_54_04 PM - Screen - Video Project.webm`

Observed behavior:

- One overlay is attached to the token while a second complete overlay remains
  at the old location.
- The ghost overlay independently changes HP text and fill color (`1/4` red,
  then `2/4` orange).
- At times both old and new overlays are visible; at other times one disappears.
- The recording shows three GM clients in the room, increasing the opportunity
  for separate extension background instances to write the same shared scene
  items.

This rules out a single item's smooth interpolation or a cosmetic repaint bug.
There are multiple overlay item populations receiving competing updates.

### Current synchronization paths

`src/background.ts` contains:

- an initial `syncAllDisplays()` call;
- a `scene.items.onChange` callback with a local `syncing`/`queued` guard;
- a scene-ready restart path;
- a role-change restart path; and
- a window-message handler that calls `syncCreatureDisplay()` directly.

`src/main.ts` additionally:

- updates token metadata;
- calls `syncCreatureDisplay()` directly;
- posts a second sync message to the background; and
- also triggers `scene.items.onChange` as a consequence of the metadata update.

Therefore a single Save action can start at least three render paths. The
`syncing` flag protects only the `onChange` callback. It does not serialize the
initial sync, direct editor sync, message sync, scene-ready restart, or another
GM client's background.

### Delete/add feedback

`syncCreatureDisplay()` deletes all matching display items and then adds a new
set. Those writes are made to `OBR.scene.items`, so they trigger the same
`scene.items.onChange` subscription that drives rendering. Consequences:

- visible gaps between delete and add;
- a race window in which two writers both see no overlay and both add one;
- stale snapshots being used after a newer update;
- duplicate sets when writers overlap; and
- feedback events caused by the renderer's own output.

The render key is useful for avoiding some work, but it cannot provide mutual
exclusion across asynchronous callers, browser instances, or cached versions.

### Alignment and depth

The current HP implementation has several conflicting coordinate systems:

- `Shape.position` is being treated as a top-left coordinate.
- `Label.position` is treated as a pointer/label anchor and then adjusted using
  an estimated `fontSize * 1.64` body height.
- Labels are screen-space objects that remain the same size across scene zoom.
- Shapes and labels are all placed on `ATTACHMENT`, leaving their relative
  z-order to Owlbear's automatic ordering.
- The HP text asks for `backgroundOpacity(0)` but remains a Label object, not a
  plain text box.
- The latest change places the label at `hpTop`, not at the bar's vertical
  center.

The result is expected: the text can be vertically displaced and can render
below a semi-transparent shape. Array order is not a reliable cross-item
stacking contract.

Official Owlbear documentation describes Labels as screen-space text with a
colored background and pointer-specific styles:
[Label reference](https://docs.owlbear.rodeo/extensions/reference/items/label/).
By contrast, Text items have explicit width/height content and no background:
[Text reference](https://docs.owlbear.rodeo/extensions/reference/items/text/),
[Text builder](https://docs.owlbear.rodeo/extensions/reference/builders/text/).

## What Owl Trackers does

Comparison revision:
[`SeamusFinlayson/owl-trackers@5151849`](https://github.com/SeamusFinlayson/owl-trackers/tree/5151849c42e60a5f100cdb9d50b5fb5d6bba67c3)
(2026-03-10).

Relevant files:

- [local renderer and change detection](https://github.com/SeamusFinlayson/owl-trackers/blob/5151849c42e60a5f100cdb9d50b5fb5d6bba67c3/src/background/onMapTrackers.ts)
- [compound bar, bubble, and text builders](https://github.com/SeamusFinlayson/owl-trackers/blob/5151849c42e60a5f100cdb9d50b5fb5d6bba67c3/src/background/compoundItemHelpers.ts)
- [image-center and bar-shape math](https://github.com/SeamusFinlayson/owl-trackers/blob/5151849c42e60a5f100cdb9d50b5fb5d6bba67c3/src/background/mathHelpers.ts)
- [bubble positioning](https://github.com/SeamusFinlayson/owl-trackers/blob/5151849c42e60a5f100cdb9d50b5fb5d6bba67c3/src/background/trackerPositionHelper.ts)

### Practices to adopt

1. **Visuals are client-local.** Owl Trackers reads shared token metadata but
   writes the rendered bars and bubbles to `OBR.scene.local`. Owlbear documents
   local items as temporary items visible only to the current user:
   [Local API](https://docs.owlbear.rodeo/extensions/apis/scene/local/).
2. **Every component has a deterministic ID.** IDs are derived from the token
   ID, tracker index, and component role (`bar-bg`, `bar-fill`, `bar-text`,
   etc.). This prevents anonymous overlay populations from accumulating.
3. **Text uses `buildText`, not `buildLabel`.** Bar text receives an explicit
   position, width, height, horizontal alignment, and vertical alignment.
4. **Text and shapes use intentional layers.** Bar shapes use `ATTACHMENT`;
   bar text uses `TEXT`, ensuring text is drawn above the shapes.
5. **Image geometry is computed from the Image item.** Rendered width and height
   come from image pixel size, image grid DPI, scene DPI, and token scale.
   Center calculation also includes grid offset and rotation.
6. **Position-only token changes are ignored by the renderer.** Attachments
   retain Owlbear's `POSITION` behavior and follow the token without being
   recreated during a drag.
7. **Visibility is role-local.** Each client decides which local trackers to
   show from shared metadata and the current player's role.

### Practices not to copy blindly

Owl Trackers still uses bulk delete/add for many local updates, global mutable
add/delete arrays, and a delayed extra refresh. DWTools can retain the useful
local/deterministic geometry model while improving reconciliation:

- update existing local items in place when possible;
- serialize all rendering through one coordinator;
- use latest-wins generation numbers for asynchronous work;
- avoid shared mutable batch arrays across callbacks; and
- add tests around rapid event sequences.

## Proposed DWTools overlay architecture

### 1. Shared data, local presentation

Keep Dungeon World data in token metadata:

`com.bryan.dungeon-world-creatures/creature`

Render every overlay into `OBR.scene.local` on each client.

- GM: always render the full-bright overlay; use the visibility glyph to show
  whether players can see it.
- Player: render only when `visibleToPlayers !== false`.
- All clients: respect the token's own `visible` state.

No new DWTools display items should be added to `OBR.scene.items`.

### 2. One writer

Only the background owns overlay rendering.

- Editors and context menus update token metadata and stop.
- Remove direct calls to `syncCreatureDisplay()` from UI code.
- Remove the `postMessage` sync path.
- Let the single `scene.items.onChange` subscription observe metadata changes.

This eliminates in-process duplicate writers. Local rendering eliminates
cross-client write contention because each client owns only its own visuals.

### 3. Stable component IDs

Use deterministic IDs such as:

- `${token.id}-dwtools-visibility-bg`
- `${token.id}-dwtools-visibility-text`
- `${token.id}-dwtools-armor-bg`
- `${token.id}-dwtools-armor-text`
- `${token.id}-dwtools-damage-bg`
- `${token.id}-dwtools-damage-text`
- `${token.id}-dwtools-hp-bg`
- `${token.id}-dwtools-hp-fill`
- `${token.id}-dwtools-hp-text`

The exact prefix may be shortened, but the mapping must be stable and tested.

### 4. Explicit geometry

Restrict overlay targets to Owlbear `Image` items.

Compute rendered image dimensions using the same inputs as Owl Trackers:

```text
dpiScale = sceneGridDpi / token.grid.dpi
renderedWidth  = token.image.width  * dpiScale * abs(token.scale.x)
renderedHeight = token.image.height * dpiScale * abs(token.scale.y)
```

Compute the rendered image center from:

- token position;
- image pixel dimensions;
- grid offset;
- DPI scale;
- item scale; and
- item rotation.

Do not use an arbitrary `0.84` constant as a substitute for image width. A
deliberate visual inset can be introduced later as a named design token after
the geometry is correct.

### 5. Bar and text construction

Use a single top-left bar origin:

```text
barLeft
barTop
barWidth
barHeight
```

Build:

- background and fill as `Curve` or `Shape` items on `ATTACHMENT`;
- HP text as `Text` on `TEXT`;
- text position based on the same `barLeft`/`barTop`;
- text width equal to `barWidth`;
- text height equal to a tested text box height;
- horizontal and vertical alignment both `CENTER`/`MIDDLE`; and
- fill opacity `1`.

The text should never need a transparent Label background or pointer-anchor
compensation.

### 6. Attachment behavior

Keep `POSITION` and `DELETE` attachment behavior enabled so overlays follow the
token immediately and disappear with it.

Disable behaviors that would distort or duplicate the overlay:

- `ROTATION`
- `VISIBLE` (visibility is recalculated locally)
- `COPY`
- `SCALE`

When scale, grid, image, or rotation changes, the coordinator recalculates
geometry once. During a normal position-only drag, it performs no overlay
writes.

### 7. Serialized latest-wins coordinator

Maintain:

- one scene lifecycle generation;
- one active subscription set;
- a cached relevant signature per token;
- a pending set of token IDs; and
- a monotonically increasing revision per token.

Each callback records the latest desired state and schedules one flush. The
flush:

1. captures the current revision;
2. computes desired local items;
3. aborts before writing if a newer revision exists;
4. reconciles current deterministic IDs with desired items; and
5. records the applied signature.

Scene-ready changes invalidate the generation, unsubscribe old listeners, and
clear local DWTools visuals before initializing the new scene.

### 8. Reconcile instead of replace

For each deterministic component:

- add it if missing;
- update mutable fields in place if present;
- delete it only when the component is no longer desired.

For a normal HP value change, update only fill geometry/color and HP text. Do
not delete the entire overlay. For a token move, do nothing—the attachment
handles it.

### 9. Legacy migration

On the first release of the new renderer:

- delete old DWTools display items from the current client's local scene;
- allow a GM to delete legacy DWTools display items from shared
  `OBR.scene.items`;
- make cleanup idempotent; and
- never recreate shared display items.

This is required because the example video proves old populations can survive
long enough to compete with new ones.

## Test plan and acceptance criteria

### Unit tests

- image center with zero/non-zero grid offset;
- rendered width/height at multiple DPIs and positive/negative scale;
- rotated image center;
- bar origin and HP text box alignment;
- GM/player visibility matrix;
- stable deterministic IDs;
- relevant-signature comparison;
- position-only changes produce zero render operations;
- rapid revisions apply only the newest state;
- add/update/delete reconciliation;
- scene-generation invalidation.

### Manual integration matrix

1. Refresh the Owlbear page.
2. Drag a token continuously for at least ten seconds.
3. Change HP while dragging.
4. Scale and rotate the token.
5. Toggle player visibility repeatedly.
6. Test as GM and Player.
7. Test with at least two GM clients connected.
8. Switch scenes away and back.
9. Leave the scene untouched for at least two minutes.

Acceptance criteria:

- exactly one overlay per token per client;
- no shared DWTools visual items in `scene.items`;
- no flash, old-position ghost, or duplicate during/after movement;
- position-only movement causes zero local renderer writes;
- HP text is centered in front of the bar at every zoom;
- hidden-from-player overlay remains full brightness for GM;
- player never receives a hidden local overlay;
- refresh reaches stable state in one bounded pass.

## Prior DWTools attempts

| Commit | Approach | Result / lesson |
|---|---|---|
| `1f170c4` | Initial token-relative graphical stat overlays | Established shared attachment model; later depth/position issues exposed its fragility. |
| `951490c` | Adjust graphical positioning and depth | Coordinate/z-order symptoms persisted. |
| `e7804da` | Move overlay text to a different Owlbear layer | Confirmed layer choice matters, but did not fix ownership/sync. |
| `972b89b` | One SVG image attachment for the whole overlay | Gave one deterministic internal coordinate system, but remained a shared delete/add attachment and was replaced after rendering/scaling problems. |
| `d2d598e` | Native Labels and Shapes | Reintroduced mixed anchor systems and automatic cross-item stacking. |
| `b5f5f53` | Estimate Label body offset | A manual font-height approximation; not a stable layout contract. |
| `6981174` | Treat Shape position as top-left | Corrected one shape-anchor misunderstanding. |
| `eb9e67e` | GM-local items only when hidden from players | Fixed dimming, but split rendering between shared and local stores and increased lifecycle complexity. |
| `b1c1647` | Expand HP bar to reported token bounds | Improved the visible inset but exposed disagreement between reported bounds and rendered image geometry. |
| `cdc33a8` | Multiply bar by token scale | Double-applied scale in the test scene and caused an oversized bar/duplicates. |
| `65b402f` | Revert `cdc33a8` | Restored the less-bad geometry; confirms image math must be derived explicitly, not guessed. |

## Environment and workflow notes

### Windows and OneDrive

The workspace is:

`C:\Users\bryan\OneDrive\Documents\DWTools`

PowerShell is the shell. OneDrive has intermittently left `node_modules` with
missing generated type-package contents. Symptoms include:

- `Cannot find type definition file for 'chai'`
- `Cannot find type definition file for 'deep-eql'`
- `Cannot find type definition file for 'estree'`

Recovery:

1. resolve and verify that the target is exactly the workspace's
   `node_modules`;
2. remove only that generated directory;
3. run `pnpm install --frozen-lockfile`;
4. rerun tests and build.

Never delete a computed or unverified broad path.

### Build and release

- `dist/` is tracked.
- Run `pnpm test` and `pnpm run build`.
- Review source and generated diffs.
- Keep manifest, popover/background cache-busters, context-menu URL, and Vite
  asset version in sync.
- GitHub Pages has occasionally returned `startup_failure` before any job
  starts. A rerun may fix it, but rerunning a workflow is an external action and
  requires the user's permission unless already granted for that exact run.
- Verify the deployed public manifest with a cache-busting query.

### Browser testing

- Refreshing Owlbear may reset the viewport.
- Record Position X, Position Y, and Zoom before reload.
- Restore in this order: **Zoom, then Position Y, then Position X**. Setting zoom
  last changes the effective position; setting Y can also alter X, so X must be
  last.
- Close open Players/Scene panels before visual comparison.
- A single screenshot is insufficient for synchronization testing. Sample
  movement over time or record video.
- Multiple GM clients are not harmless test noise when shared scene items are
  used; each client runs its own background extension instance.

## Decision log

- **Decision:** stop incremental Label/Shape coordinate tweaks.
- **Decision:** use client-local deterministic visuals derived from shared token
  metadata.
- **Decision:** use `buildText` with explicit boxes and layers for overlay text.
- **Decision:** one background coordinator owns all overlay writes.
- **Decision:** token movement is handled by attachment behavior, not rerendering.
- **Decision:** implement tests before changing the live renderer again.

## Implementation status

### Version 0.2.0 — implemented 2026-07-25

The coherent renderer replacement described above is now implemented:

- `overlayModel.ts` owns image geometry, layout, visibility policy, stable IDs,
  and render signatures.
- `display.ts` builds deterministic local Curves and Text items and reconciles
  them in place.
- `background.ts` is the sole writer, uses a serialized latest-wins queue,
  ignores position-only changes, and removes legacy shared displays when a GM
  encounters them.
- editor surfaces only change creature metadata.
- all visual overlay items are written through `OBR.scene.local`.
- HP text and its bar share the exact same explicit box; text is opaque and on
  the `TEXT` layer.
- GM overlays remain full brightness when hidden from players; player clients
  omit them.
- the initial regression suite covers image geometry, layout alignment,
  visibility roles, deterministic IDs, relevant signatures, zero-write
  movement reconciliation, in-place updates, stale cleanup, and latest-wins
  queuing.

Historical approaches and diagnoses above remain useful: do not restore shared
rendering, Labels, delete/add synchronization, or multiple writers to simplify
a future feature.
