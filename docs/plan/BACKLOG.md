# Backlog
Status: In progress

The one living record of open work. Rows move to Done with the commit that closed them and are
never deleted. Evidence is file + symbol, never a line number. `Verified` is the date the row was
last checked against the tree — not when it was opened.

## Open

| ID | Opened | Verified | Pri | Finding | Evidence | Effort | Acceptance |
|---|---|---|---|---|---|---|---|
| T1 | 2026-10-12 | 2026-10-12 | P3 | `tui-components` specs have no runnable examples (phase P1) | `docs/spec/2026-10-12-tui-components-skill.md` §Later phases | M | A separate repo runs one example per Specified component plus a gallery; each spec's Acceptance links to its example |
| T2 | 2026-10-12 | 2026-10-12 | P3 | No reusable crate extracted from the examples (phase P2) | same spec | L | Crate publishes theme roles, overlay stack, frame hit map, popup geometry; examples depend on it |
| T3 | 2026-10-12 | 2026-10-12 | P3 | Catalog rows still `Mapped`, not `Specified` (phase P3) | `skills/tui-components/references/catalog.md` | L | Toast, tabs, breadcrumb, tooltip, command palette, key-hint bar, table, checkbox/radio/toggle, progress/spinner each have a spec |

## Watching

| Item | Why not now | Trigger | Re-read |
|---|---|---|---|
| `tui-components/references/ecosystem.md` versions | Checked 2026-10-12 against ratatui 0.30 | ratatui 0.31 or 1.0 release | 2026-10-12 |

## Done

| ID | Finding | Closed by |
|---|---|---|
