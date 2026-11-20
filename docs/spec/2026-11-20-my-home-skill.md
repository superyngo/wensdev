# my-home skill
Status: Draft

## Goal

An init-type skill that makes the OS home directory (macOS, Windows, Linux) agent-managed. It
lays down the notebook structure in `~/Docs`, the standing agent guidance (`~/AGENTS.md`,
`~/Docs/GUIDE.md`), and a whitelisted git repo at `~`. Later it updates those files to newer
templates. Day-to-day conduct lives in those home files, not in the skill, so any agent working
from `~` follows it, whether or not it loads skills.

It is standalone, not a `repo-docs` profile, and takes none of the `repo-docs` rules: no `Status:`
lines, freeze rules, ADRs, CHANGELOG, or folder indexes.

Evaluation and test evidence:
`docs/tmp/claude-scratch/2026-11-19-my-home-skill-evaluation.md` (gitignored scratch; the
facts this spec relies on are restated below).

## Decisions

| # | Question | Decision | Rejected alternative and why |
|---|---|---|---|
| 1 | Name | `my-home` | `home-steward`, `homebase`: owner's choice |
| 2 | Relation to `repo-docs` | Separate skill, no shared rules | A `home` profile: the profile contract, Status lines, and ADR rules are the constraints the owner wants gone |
| 3 | Skill type | Init type, `argument-hint: [init\|update]`. The skill holds procedure and templates; it is not loaded for daily work | A resident conduct skill: it fails silently when a skill is not loaded (an agent without skills, a broken link), and the owner cannot tune it per machine |
| 4 | Where conduct lives | Home files: `~/AGENTS.md` (short floor) and `~/Docs/GUIDE.md` (full). Both are tracked and owner-editable | Conduct in `SKILL.md`: the same reasons as #3 |
| 5 | Leading word in the guide | **steward**: knows where everything is, logs every change with its revert, and the owner decides | "assistant": recruits no safety priors |
| 6 | Notebook | `~/Docs/` | `~/docs`, `~/Home`: owner's choice |
| 7 | Git | `~` is the repo; `.gitignore` whitelist; `.ignore` with `!/*` | `~/Docs`-only repo: owner chose `~`. A bare repo (`--git-dir=~/.home.git`): every git call needs an alias |
| 8 | Root instruction file | `~/AGENTS.md`, short: when it applies, the safety floor, and a pointer to `GUIDE.md` | `~/CLAUDE.md`: in Claude Code, any `CLAUDE.md` in cwd or above stops `AGENTS.md` loading (code.claude.com/docs/en/memory). Everything in `~/AGENTS.md`: Claude Code also loads it in repos without `CLAUDE.md` (`sshdr`, `sshi`), so its length is noise there |
| 9 | Template upgrades | Each template carries `<!-- my-home template vN -->`. `update` diffs the home file against the new template and proposes hunks; it never overwrites owner edits | Overwrite on upgrade: loses per-machine tuning |
| 10 | Machines | One `~` repo per machine, no remote | One synced `~/Docs`: sync conflicts, plus per-host journals |
| 11 | Autonomy | Safety table in the guide template (below) | Filing Downloads without asking |
| 12 | `~/life` | Stays a separate base; `MAP.md` routes to it. Revisit after the pilot | Folding it into `~/Docs` now: decided before any evidence from the pilot |
| 13 | History | Git covers `~/Docs`; `journal/` covers changes to owner files outside git, each with its revert | Journal only: the owner chose git |

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

### What `init` lays down

```
~/AGENTS.md          short guide: scope, safety floor, pointer to GUIDE.md
~/.gitignore         whitelist
~/.ignore            !/*   (search tools only: undo the whitelist for rg, fd, agent grep/glob)
~/Docs/
  GUIDE.md           full standing guidance
  README.md          machine state
  MAP.md
  TODO.md
  INBOX.md
  journal/YYYY-MM.md
  topics/
  scratch/           gitignored
```

`~/AGENTS.md` template:

```
<!-- my-home template v1 -->
If your working directory is ~ or a folder under it that is not its own repo:
- You are this home's steward. Read ~/Docs/GUIDE.md before acting.
- Delete only to the OS trash, and only after the owner approves.
- Before moving more than ~20 files, or anything in a synced folder, show a plan and wait.
- Never copy secrets (.ssh, keychains, password files) anywhere.
- ~ is a git repo: before git clean, checkout ., restore ., stash -u, or reset --hard,
  run `git rev-parse --show-toplevel`; if it prints $HOME and cwd is not under ~/Docs, stop.
- Leave ~/Library, AppData, photo libraries, and other repos untouched.
Inside a repo, ignore this file.
```

`~/.gitignore` template:

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

### `~/Docs/GUIDE.md` template (the standing guidance)

- **Role:** steward of this home.
- **Session start:**
  1. Read `README.md`, `TODO.md` (`Now` and `Waiting on`), and the tail of this month's journal.
  2. If `last round` is more than 7 days old, offer the round.
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
  - The destructive-command check from `~/AGENTS.md`.
  - No remote.
- **Weekly round** (offered, never run unasked):
  1. Empty `INBOX.md`.
  2. Chase `Waiting on` rows.
  3. Move `Done` rows to the journal.
  4. Downloads older than 14 days: propose a home for each; act on approval.
  5. Disk free space and large growths.
  6. Backup age.
  7. `scratch/` entries older than 30 days.
  8. Set `last round`; commit.
- **Boundaries:** inside `~/life` or any repo, that base's own agent file and docs govern;
  `MAP.md` only points there.
- **This machine:** a section the owner and steward extend with local rules.

### Notebook files

| Path | Holds |
|---|---|
| `README.md` | Entry, one screen: owner, machine, OS, backup status, `last round` date, launch alias, links |
| `MAP.md` | Each home folder: what goes there, naming habit, synced?, backed up?. Also external drives; dotfile and config locations and what manages each; other bases (`~/life`, `~/repos/*`) with path and one line on what each owns |
| `TODO.md` | The one task list: `Now`, `Waiting on` (who), `Someday`, `Done` (date) |
| `INBOX.md` | Capture in any form; the steward files each line and deletes it |
| `journal/YYYY-MM.md` | Append-only. What was done; for every change to owner files, `old → new` or the trash location, and the revert command |
| `topics/<topic>.md` | Lasting knowledge, one topic per file. A decision is a dated line in its topic |
| `scratch/` | The steward's working files; gitignored; offered for trash after 30 days |

`~/Docs` holds text only. Attachments live in owner folders, and the notebook links them by
path. Secrets never enter it; write down where they are kept instead.

### Skill package

```
skills/my-home/
  SKILL.md                    when it applies; init and update procedures with checklists
  references/templates.md     every template above, each with its version marker
  references/platforms.md     macOS / Windows / Linux: known folders (OneDrive redirect,
                              xdg-user-dir), trash, backup status, config locations, disk
                              usage, launch alias
```

- `allowed-tools: Read, Grep, Glob, Bash, Write, Edit`.
- Draft description (under 550 characters):

  > Home-directory setup: lays down or updates the agent notebook in ~/Docs, the ~/AGENTS.md
  > guide, and the whitelisted home git repo on macOS, Windows, or Linux. Use when making ~
  > agent-managed, on a new machine, or to upgrade an existing home guide to the current
  > template.

**`init`.** Done when every box is ticked:

- [ ] `git -C ~ rev-parse` fails (no repo yet).
- [ ] `core.excludesfile` does not point at `~/.gitignore`.
- [ ] `~/.gitignore`, `~/.ignore`, and `~/AGENTS.md` are absent, or merged with the owner's
  approval.
- [ ] Every file to be written is shown to the owner first, and the owner approves.
- [ ] Backup status checked and recorded in `README.md`.
- [ ] Files written; `git init -b main`; `git status --short` lists only `.gitignore`,
  `.ignore`, `AGENTS.md`, `Docs/`.
- [ ] `rg --files ~ | head` lists files from home folders.
- [ ] `MAP.md` filled from what the home actually contains; the owner is asked only what cannot
  be looked up.
- [ ] Launch alias proposed (e.g. `home='cd ~ && omp --allow-home'`); a shell rc file is
  changed only on approval.
- [ ] First commit.

**`update`.** Done when every box is ticked:

- [ ] For each templated file, the version marker is read and compared with the skill's.
- [ ] Older files: the diff against the new template is shown hunk by hunk; owner edits are kept
  unless the owner drops them.
- [ ] Markers bumped; one commit.

## Scope (this change)

| # | Step | Verify |
|---|---|---|
| 1 | Write `skills/my-home/` (three files) | `uv run --python 3.14 python3 scripts/check_structure.py` shows no `my-home` failure (`tui-components` T5 fails already) |
| 2 | `README.md` skills list, `CONTEXT.md` skill table, `.claude-plugin/plugin.json` description, CHANGELOG `### 2026-11-20`; this spec → `Shipped`, moved to `Landed` in `docs/spec/README.md` | `rg -n my-home README.md CONTEXT.md .claude-plugin/plugin.json CHANGELOG.md` |
| 3 | Commit and push wensdev | `git status -sb` in sync |
| 4 | Link the skill through agm, as for T6 | `ls -l ~/.omp/agent/skills/my-home ~/.claude/skills/my-home` |
| 5 | Pilot on macmini: `/my-home init` in a fresh omp session at `~` | The init checklist is all ticked |
| 6 | Check the guide works without the skill | A new omp session in `~/Downloads`, skill not loaded, reads `GUIDE.md` and follows its session start. A new session in `~/repos/sshi` does not show `~/AGENTS.md` |

Out of scope: Windows and Linux pilots (`platforms.md` is written from documentation, not
tested); folding `~/life` in; a remote for the home repo; a Time Machine destination (`init`
records its absence and the owner decides); agent permission deny rules (e.g. Claude Code
`settings.json` blocking `git clean`).
