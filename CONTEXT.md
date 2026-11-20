# CONTEXT

Entry point for all documentation in `wensdev`, a bundled set of Claude/agent skills for
cross-project software development. Root-level files (`README.md`, `CHANGELOG.md`, `LICENSE`) stay here;
everything else lives under `docs/` or inside a skill.

Profile: dev

| Folder | Holds | Canonical? | Lifecycle |
|---|---|---|---|
| [`docs/reference/`](docs/reference/README.md) | Current behavior: glossary, repo conventions | Yes — the only source of truth | Kept in sync with `skills/` |
| [`docs/adr/`](docs/adr/README.md) | Repo-level decisions that were expensive to reach and would be expensive to reverse | No — historical | Never edited; superseded by a new ADR |
| [`docs/spec/`](docs/spec/README.md) | Design records written before implementation | No — historical | Frozen once approved; only `Status:` changes |
| [`docs/plan/`](docs/plan/README.md) | Task-by-task implementation plans derived from a spec | No — historical | Frozen once shipped; only `Status:` changes |
| [`docs/plan/BACKLOG.md`](docs/plan/BACKLOG.md) | The one living tracker of open work | No — live state | Never frozen while anything is open |
| [`docs/debug/`](docs/debug/README.md) | Handoff notes from investigations, with repro scripts | No — historical | Frozen once resolved; only `Status:` changes |
| [`docs/audit/`](docs/audit/README.md) | Point-in-time sweeps for bugs, dead code, inconsistency | No — historical | Frozen once findings are addressed; only `Status:` changes |
| [`docs/memo/`](docs/memo/README.md) | The human's notes: ideas still forming, loose thinking, background | No — not evidence of behavior | Free-form; edited by people, by agents only on request |
| `docs/tmp/` | Scratch; `<agent>-scratch/` is gitignored | No | wensdev cuts no releases, so swept monthly (first session of the month): promoted, archived to `tmp/archive/YYYY-MM.tar.gz`, or trashed |

## The skills themselves

`skills/<name>/` is the shipped payload, not documentation about it. Each skill owns its
`SKILL.md` router plus whatever `references/` — and, where a decision needed recording, its own
`CONTEXT.md` and `docs/adr/` — it needs to travel as a self-contained unit. See
[ADR 0001](docs/adr/0001-skills-carry-their-own-docs-payload.md) for why those live inside the
skill rather than here.

| Skill | Scope |
|---|---|
| `wens-dev-principles` | UI, CLI, debugging, performance, and multi-agent principles |
| `repo-docs` | Repository documentation layout and lifecycle: `CONTEXT.md`, `docs/` folder set, ADRs and their scope, working records, `docs/note/` knowledge, backlog, changelog archiving; dev, ops, and life profiles |
| `rust-crossplatform-app` | One Rust core shipping to CLI/TUI/web/desktop/mobile/extension |
| `tui-components` | ratatui component specs: menu, modal, toggle tree, sidebar, split panes, floating windows, mobile view; web-UI vocabulary mapped to TUI |
| `ui-design` | Design-first static mock-ups: tokens, page layout, TypeScript states, review, handoff to GPUI/web |
| `vscode-dev-experience-pack` | VS Code extension debugging and evidence collection |
| `create-release-workflow` | Tag-triggered multi-platform Rust release workflow |
| `publishing-platform-stores` | Store submission workflows hanging off that release |
| `git-workflow` | Repo init / Gist / commit-push-tag-release |
| `slow-down` | Early-stage ideation at the user's pace: lead / offer / space moves, parking lot, hand-off recap |

## Reading order

1. [`docs/reference/glossary.md`](docs/reference/glossary.md) — the vocabulary every other file uses.
2. [`docs/reference/README.md`](docs/reference/README.md) — the repo map.
3. [`docs/adr/README.md`](docs/adr/README.md) — why the shape is what it is.
4. `CHANGELOG.md` — what changed recently.
5. [`docs/plan/BACKLOG.md`](docs/plan/BACKLOG.md) — open work.
