# Playwright Failure Analysis (2026-02-09)

## Failing cases
- **TC-020: Empty state placeholder height** — Computed `min-height` was `0px` (expected `96px`). Placeholder used `h-24`, which sets fixed height but leaves `min-height` at `0`, so after drag the drop target collapsed.
- **TC-001 / TC-002 (webkit-mobile only): Drag/drop** — Items never left `todo` when dragged on WebKit. iOS Safari ignores HTML5 drag without `dataTransfer` payload; our drag logic also relied on manual mouse events that are brittle on touch profiles.
- **TC-013: Export keeps checkbox/link formatting** — Exported markdown lines looked like `- [ ] [ ] [Foo](...)` instead of `- [ ] [Foo](...)`. During import we parsed the whole line with the checkbox still present, so the captured link text became `"] [Foo"`, which re‑rendered with a duplicated checkbox on export. Language tags also fell back to `#lang/na` because we didn’t read the `#lang/` token.

## Code fixes
- `KanbanBoard.jsx`
  - Added a reusable `moveItemToColumn` helper and expanded `handleDrop` to fall back to serialized payloads; `handleDragStart` now seeds `dataTransfer` to satisfy Safari/WebKit drag initiation.
  - Import parser now strips the leading `- [ ]` token, extracts `#lang/` and `#priority/high`, and cleans description text — eliminating the duplicated checkbox and preserving language tags.
  - Empty-column placeholder now uses `min-h-[96px]` (6rem) so computed `min-height` matches the 96px expectation even after drops.
- `tests/e2e/pages/KanbanPage.ts`
  - `dragAndDrop` now prefers Playwright’s `locator.dragTo` (with a manual mouse fallback) to produce consistent drag events across WebKit mobile.

## Next steps
- Run `npm install && npx playwright test` to confirm TC-020, TC-001/002 (webkit), and TC-013 now pass across all projects.
