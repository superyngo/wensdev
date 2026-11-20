---
name: my-home
description: Home-directory setup — lays down or updates the agent notebook in ~/Docs, the ~/AGENTS.md guide, and the whitelisted home git repo on macOS, Windows, or Linux. Use when making ~ agent-managed, on a new machine, or to upgrade an existing home guide to the current template.
argument-hint: [init|update]
allowed-tools: Read, Grep, Glob, Bash, Write, Edit
---

# My Home

Makes the OS home directory agent-managed. This skill **installs and upgrades** the home's
files. It does not hold the day-to-day conduct: that lives in the files it installs
(`~/AGENTS.md` and `~/Docs/GUIDE.md`), so any agent working from `~` follows it, whether or not it
loads skills. After `init`, daily work needs only those files.

It is standalone: `repo-docs` rules (Status lines, ADRs, CHANGELOG, folder indexes) do not apply to
`~/Docs`. Inside `~/life` or any repo, that base's own agent file governs.

## What gets installed

```
~/AGENTS.md        short guide: when it applies, safety floor, pointer to GUIDE.md
~/.gitignore       whitelist: the home repo tracks only the files below
~/.ignore          !/*  — makes rg, fd, and agent grep/glob search home folders again
~/Docs/
  GUIDE.md         full standing guidance (the steward's conduct)
  README.md        this machine's state: owner, OS, backup, last round
  MAP.md           where things live; other bases
  TODO.md  INBOX.md  journal/YYYY-MM.md  topics/  scratch/ (gitignored)
```

Templates, each with a `<!-- my-home template vN -->` marker:
[references/templates.md](references/templates.md). OS-specific commands (known folders,
trash, backup status, config locations, launch alias):
[references/platforms.md](references/platforms.md).

## `init`

Read both references first. Write nothing until the owner has seen the files. Done when every
box is ticked:

- [ ] `git -C ~ rev-parse --show-toplevel` fails, so `~` is not a repo yet. If it succeeds,
  stop and ask.
- [ ] `git config --global core.excludesfile` does not name `~/.gitignore`. If it does, the
  whitelist would become every repo's global ignore: stop and ask.
- [ ] `~/.gitignore`, `~/.ignore`, `~/AGENTS.md`, `~/Docs` are absent. Any that exist are merged
  with the owner's approval, never replaced.
- [ ] Facts gathered by looking, not asking: OS, hostname, home folders and their sync state,
  external drives, backup status and age, config managers (dotfile repos, package managers),
  other bases (`~/life`, `~/repos/*` and which have their own agent files).
- [ ] Every file is drafted from the templates with those facts filled in, and shown to the
  owner. The owner approved it.
- [ ] Files written; `git -C ~ init -b main`. `git -C ~ status --short --untracked-files=all`
  lists only `.gitignore`, `.ignore`, `AGENTS.md`, and files under `Docs/`. Nothing under
  `Docs/scratch/`.
- [ ] `rg --files ~ --max-depth 2 | head` lists files from home folders, so `.ignore` works.
- [ ] Launch alias proposed (platforms reference). A shell rc file is changed only on approval.
- [ ] `git -C ~ add .gitignore .ignore AGENTS.md Docs && git -C ~ commit -m "home: init"`.
- [ ] Owner told: backup status as found, and how to start a session (alias, or `cd ~`).

## `update`

Upgrades installed files to the current templates. Owner edits always survive. Done when every
box is ticked:

- [ ] For each templated file, its marker is read. A missing marker counts as `v0`.
- [ ] Files older than the template: show the template change from their version to now, as
  hunks applied to the owner's file. Each hunk is accepted or skipped by the owner.
- [ ] A new template file that the home lacks is drafted and offered.
- [ ] Markers bumped in the files that were updated; one commit with explicit paths
  (`home: update templates to vN`).

## Template changes

Bump `vN` in [references/templates.md](references/templates.md) whenever a template's
meaning changes. Add one line to its change list there: what `update` must carry over.
