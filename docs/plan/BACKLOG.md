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
| T4 | 2026-11-12 | 2026-11-12 | P3 | `repo-docs` has no command-shaped entry points or skeleton script | `docs/spec/2026-11-12-repo-docs-skill.md` §Later phases; `skills/repo-docs/references/layout-and-lifecycle.md` §Repo initialization | M | `init`, `audit`, `archive` entry points exist; an idempotent script (create-if-absent) lays down the skeleton and the init checklist passes on an empty repo |
| T5 | 2026-11-12 | 2026-11-20 | P2 | `tui-components` description is 703 characters, over the 550 limit | `skills/tui-components/SKILL.md` frontmatter; `scripts/check_structure.py` `DESC_LIMIT` | S | `scripts/check_structure.py` reports no description failure |

## Pending verification

| ID | Landed | Commit | Verify how | Acceptance |
|---|---|---|---|---|

## Awaiting external

| ID | Waiting on | Since | Next check | Acceptance |
|---|---|---|---|---|

## Watching

| Item | Why not now | Trigger | Re-read |
|---|---|---|---|
| `tui-components/references/ecosystem.md` versions | Checked 2026-10-12 against ratatui 0.30 | ratatui 0.31 or 1.0 release | 2026-10-12 |

## Done

| ID | Finding | Closed by |
|---|---|---|
| T6 | `ui-design` and `repo-docs` were not linked into `~/.omp/agent/skills/` | Linked outside git by agm on 2026-11-12 (symlinks to `skills/ui-design`, `skills/repo-docs`); row closed in the repo-docs wave B commit; verified 2026-11-20 with `ls -l ~/.omp/agent/skills` |
| T8 | `docs/adr/README.md` had no row for ADR 0005 | `a7ae438` (`docs(adr): index ADR 0005`) |
| T7 | No `.gitignore`, so `docs/tmp/claude-scratch/` was untracked rather than ignored | `d784aea` added `.gitignore` (`docs/tmp/*-scratch/`); verified 2026-11-19 with `git check-ignore` |
| T9 | `~/life` had not adopted the `life` profile | `~/life` `1f94d62` (Profile line, ADR 0002, NOW rewrite, `areas/digital-security/`, tmp sweep); `~/repos/macmini-ops` `59b4ee5` (ezpad XML) |
