# my-home skill
Status: Draft

## Goal

An agent resident in the OS home directory (macOS, Windows, Linux) that keeps the owner's
notebook in `~/Docs` and helps with files, folders, the machine, and everyday matters that no repo
owns. It is a standalone skill, a competitor to `repo-docs` rather than a profile of it. It takes
none of the `repo-docs` rules: no `Status:` lines, freeze rules, ADRs, CHANGELOG, or folder indexes.

Evaluation and test evidence:
`docs/tmp/claude-scratch/2026-11-19-my-home-skill-evaluation.md` (gitignored scratch; the
facts this spec relies on are restated below).

## Decisions

| # | Question | Decision | Rejected alternative and why |
|---|---|---|---|
| 1 | Name | `my-home` | `home-steward`, `homebase`: owner's choice |
| 2 | Relation to `repo-docs` | Separate skill, no shared rules | A `home` profile: the profile contract, Status lines, and ADR rules are the constraints the owner wants gone |
| 3 | Leading word | **steward**: knows where everything is, logs every change with its revert, and the owner decides | "assistant": recruits no safety priors |
| 4 | Notebook | `~/Docs/` | `~/docs`, `~/Home`: owner's choice |
| 5 | Git | `~` is the repo; `.gitignore` whitelist; `.ignore` with `!/*` | `~/Docs`-only repo: owner chose `~`. A bare repo (`--git-dir=~/.home.git`): every git call needs an alias |
| 6 | Root instruction file | `~/AGENTS.md`, one conditional pointer line | `~/CLAUDE.md`: in Claude Code, any `CLAUDE.md` in cwd or above stops `AGENTS.md` loading (code.claude.com/docs/en/memory). `sshdr` and `sshi` have only `AGENTS.md` |
| 7 | Where conduct lives | The skill; `~/Docs/README.md` holds machine state only | A per-home `HOME_AGENTS.md`: a second copy of the conduct, which drifts from the skill |
| 8 | Machines | One `~` repo per machine, no remote | One synced `~/Docs`: sync conflicts, plus per-host journals |
| 9 | Autonomy | Safety table below | Filing Downloads without asking |
| 10 | `~/life` | Stays a separate base; `MAP.md` routes to it. Revisit after the pilot | Folding it into `~/Docs` now: decided before any evidence from the pilot |
| 11 | History | Git covers `~/Docs`; `journal/` covers changes to owner files outside git, each with its revert | Journal only: the owner chose git |

## Facts the design rests on (verified 2026-11-20)

| Agent | Home-level `AGENTS.md` in a git repo under `~` | In `~`, or a non-repo folder under it |
|---|---|---|
| omp 19.0.1 (run in a sandbox + read from the binary) | Not loaded | Loaded. Started at exactly `~`, omp moves to `~/tmp` unless `--allow-home` is given, and still loads it |
| Claude Code 2.1.300 (docs) | Loaded only in repos with no `CLAUDE.md` | Loaded |
| Codex (docs) | Not loaded (walks from the git root) | Loaded; with `~/.git`, `~` is the project root |

| Git-at-`~` check (sandbox) | Result |
|---|---|
| Whitelist `.gitignore` alone; rg, fd, omp grep/glob started at `~` | Home folders hidden |
| Plus `~/.ignore` containing `!/*` | All four tools see them again; git does not read `.ignore` |
| `git add -A` at `~` | Adds whitelisted paths only |
| `cargo new` under an ignored path | Still creates its own `.git` |
| `git clean -ndx` in `~/Downloads` | Would remove its contents. A residual hazard, guarded by a rule |

On macmini (2026-11-20) the following are true:

- `~` is not a repo.
- None of `~/.gitignore`, `~/.ignore`, `~/AGENTS.md`, or `~/Docs` exists.
- `core.excludesfile` is unset, so `~/.gitignore` stays local to the home repo; the global
  ignore is `~/.config/git/ignore`.
- **Time Machine has no destination configured.**

## Design

### Files at `~`

```
~/AGENTS.md     If your working directory is ~ or a folder under it that is not its own repo,
                you are the home steward: load the my-home skill and start from ~/Docs/README.md.
                Inside a repo, ignore this file.
~/.gitignore    whitelist (below)
~/.ignore       !/*      (search tools only: undo the whitelist for rg, fd, and agent grep/glob)
```

`~/.gitignore`:

```
# Home repo: whitelist. Everything is ignored unless re-included below.
/*
!/.gitignore
!/.ignore
!/AGENTS.md
!/Docs/
/Docs/scratch/
**/.DS_Store
Thumbs.db
desktop.ini
```

### Notebook `~/Docs/`

| Path | Holds |
|---|---|
| `README.md` | Entry, one screen: owner, machine, OS, backup status, `last round` date, launch alias, links to the files below |
| `MAP.md` | Each home folder: what goes there, naming habit, synced?, backed up?. Also external drives; dotfile and config locations and what manages each; other bases (`~/life`, `~/repos/*`) with their path and one line on what each owns |
| `TODO.md` | The one task list: `Now`, `Waiting on` (who), `Someday`, `Done` (date). Done rows move to the journal at each round |
| `INBOX.md` | Capture in any form; the steward files each line and deletes it |
| `journal/YYYY-MM.md` | Append-only. What was done; for every change to owner files, `old → new` or the trash location, and the revert command |
| `topics/<topic>.md` | Lasting knowledge, one topic per file (printer, taxes, this machine's quirks, people and vendors). A decision is a dated line in its topic |
| `scratch/` | The steward's working files; gitignored; offered for trash after 30 days |

`~/Docs` holds text only. Attachments live in owner folders, and the notebook links them by path.
Secrets never enter it; write down where they are kept instead.

### Conduct (in `SKILL.md`)

- **Session start:**
  1. Read `README.md`, `TODO.md` (`Now` and `Waiting on`), and the tail of this month's journal.
  2. If `last round` is more than 7 days old, offer the round.
  3. If `~/Docs` is absent, run setup instead.
- **Same-turn filing:** every new fact, date, contact, or decision goes to its file in the turn
  it appears.
- **Safety table:**

| Action | Rule |
|---|---|
| Read anything in `~` | Free; in secret stores (`.ssh`, keychains, password files), look only and never copy content |
| Write inside `~/Docs` | Free |
| Move or rename one owner file the owner asked about | Do it; journal `old → new` and the reverse command |
| Bulk change (more than about 20 files, or anything in a cloud-synced folder) | Write a plan in `scratch/` with the file list and a reverse script; show a summary; wait for approval; execute; journal |
| Delete | OS trash only, after approval; journal what went where |
| Overwrite an owner file | Rename the old one to `name.bak-YYYYMMDD` first |
| App-owned stores (`~/Library`, `%APPDATA%`, photo libraries), inside other repos | Hands off; point to the owning app or repo |
| Large reorganization while the backup is missing or stale | Say so and stop until the owner chooses |

- **Git:**
  - Commit with explicit paths only (`git add Docs/...`), once per session or when the round
    ends; commit subjects are plain summaries.
  - Before a destructive git command (`clean`, `checkout .`, `restore .`, `stash -u`,
    `reset --hard`), run `git rev-parse --show-toplevel`. If it prints `$HOME` and cwd is not
    under `~/Docs`, stop.
  - No remote.
- **Boundaries:** inside `~/life` or any repo, that base's own agent file and docs govern
  (often `repo-docs`); `MAP.md` only points there.

### Skill package

```
skills/my-home/
  SKILL.md                 steward, when it applies, session start, safety table, git rules, boundaries
  references/setup.md      first-run procedure; templates for ~/AGENTS.md, .gitignore, .ignore,
                           README, MAP, TODO, INBOX, journal entry, topic
  references/round.md      the weekly round checklist
  references/platforms.md  macOS / Windows / Linux: known folders (OneDrive redirect, xdg-user-dir),
                           trash, backup status, config locations, disk usage, launch alias
```

- `allowed-tools: Read, Grep, Glob, Bash, Write, Edit`.
- Draft description (under 550 characters):

  > Home-directory steward: an agent based in ~ that keeps the owner's notebook in ~/Docs and
  > helps with files, folders, Downloads, disk and backup, dotfiles and apps, and everyday
  > matters no repo owns. Use when working from ~ or a non-repo folder under it, when
  > ~/AGENTS.md points here, when setting up ~/Docs on a new machine, or for the weekly home
  > round.

**Setup** (`references/setup.md`). Done when every box is ticked:

- [ ] `git -C ~ rev-parse` fails (no repo yet).
- [ ] `core.excludesfile` does not point at `~/.gitignore`.
- [ ] `~/.gitignore`, `~/.ignore`, and `~/AGENTS.md` are absent, or merged with the owner's
  approval.
- [ ] Backup status checked and recorded in `README.md`.
- [ ] Files written; `git init -b main`; `git status --short` lists only `.gitignore`,
  `.ignore`, `AGENTS.md`, `Docs/`.
- [ ] `rg --files ~ | head` lists files from home folders.
- [ ] `MAP.md` filled from what the home actually contains; the owner is asked only what cannot
  be looked up.
- [ ] Launch alias proposed (e.g. `home='cd ~ && omp --allow-home'`); a shell rc file is
  changed only on approval.
- [ ] First commit.

**Round** (`references/round.md`), offered and never run unasked:

1. Empty `INBOX.md`.
2. Chase `Waiting on` rows.
3. Move `Done` rows to the journal.
4. Downloads older than 14 days: propose a home for each; act on approval.
5. Disk free space and large growths.
6. Backup age.
7. `scratch/` entries older than 30 days.
8. Set `last round`; commit.

## Scope (this change)

| # | Step | Verify |
|---|---|---|
| 1 | Write `skills/my-home/` (four files) | `uv run --python 3.14 python3 scripts/check_structure.py` shows no `my-home` failure (`tui-components` T5 fails already) |
| 2 | `README.md` skills list, `CONTEXT.md` skill table, `.claude-plugin/plugin.json` description, CHANGELOG `### 2026-11-20`; this spec → `Shipped`, moved to `Landed` in `docs/spec/README.md` | `rg -n my-home README.md CONTEXT.md .claude-plugin/plugin.json CHANGELOG.md` |
| 3 | Commit and push wensdev | `git status -sb` in sync |
| 4 | Link the skill through agm, as for T6 | `ls -l ~/.omp/agent/skills/my-home ~/.claude/skills/my-home` |
| 5 | Pilot on macmini: run setup through the skill in a fresh omp session at `~` | Setup checklist all ticked; then a new omp session in `~/repos/sshi` does not show `~/AGENTS.md`, and a session in `~/Downloads` does |

Out of scope: Windows and Linux pilots (`platforms.md` is written from documentation, not
tested); folding `~/life` in; a remote for the home repo; a Time Machine destination (setup
records its absence and the owner decides).
