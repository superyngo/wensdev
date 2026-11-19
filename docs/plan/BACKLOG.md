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
| T5 | 2026-11-12 | 2026-11-12 | P2 | `tui-components` description is 703 characters, over the 550 limit | `skills/tui-components/SKILL.md` frontmatter; `check_structure.py` `DESC_LIMIT` | S | `check_structure.py` reports no description failure |
| T6 | 2026-11-12 | 2026-11-12 | P2 | `ui-design` and `repo-docs` are not linked into `~/.omp/agent/skills/`, so neither is loadable | `skills/ui-design/SKILL.md`, `skills/repo-docs/SKILL.md` | S | Both names appear in the agent's skill list |
| T7 | 2026-11-12 | 2026-11-12 | P3 | This repo has no `.gitignore`, so `docs/tmp/claude-scratch/` (272 MB, mostly one `target/`) is untracked rather than ignored | `git check-ignore docs/tmp/claude-scratch` exits 1; `skills/repo-docs/references/layout-and-lifecycle.md` §Repo initialization step 6 | S | `git check-ignore docs/tmp/claude-scratch` exits 0 |
| T9 | 2026-11-19 | 2026-11-19 | P3 | `~/life` has not adopted the `life` profile (separate repo; needs owner approval there) | `~/life/CONTEXT.md` has no `Profile:` line; `skills/repo-docs/references/profiles/life.md`; evaluation `docs/tmp/claude-scratch/2026-11-19-repo-docs-life-profile-and-scratch-evaluation.md` §Out of scope | M | `~/life` declares `Profile: life`, a new ADR there supersedes ADR 0001 §2–4, the stale NOW.md is rewritten, the two security checks leave scratch, the ezpad XML moves to `~/repos/macmini-ops` |

## Watching

| Item | Why not now | Trigger | Re-read |
|---|---|---|---|
| `tui-components/references/ecosystem.md` versions | Checked 2026-10-12 against ratatui 0.30 | ratatui 0.31 or 1.0 release | 2026-10-12 |

## Done

| ID | Finding | Closed by |
|---|---|---|
| T8 | `docs/adr/README.md` had no row for ADR 0005 | `docs(adr): index ADR 0005` |
