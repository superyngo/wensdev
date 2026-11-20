# Templates

Current version: **v1**. Each file keeps its marker line so `update` can tell what it was
built from. `{braces}` are filled at `init` from facts gathered by looking. Drop any line whose
fact does not apply.

## Change list

- v1 (2026-11-20): first release.

## `~/AGENTS.md`

Short on purpose: Claude Code also loads it inside repos that have no `CLAUDE.md`.

```markdown
<!-- my-home template v1 -->
If your working directory is ~ or a folder under it that is not its own repo:
- You are this home's steward. Read ~/Docs/GUIDE.md before acting.
- Delete only to the OS trash, and only after the owner approves.
- Before moving more than ~20 files, or anything in a synced folder, show a plan and wait.
- Never copy secrets (.ssh, keychains, password files) anywhere.
- ~ is a git repo: before git clean, checkout ., restore ., stash -u, or reset --hard,
  run `git rev-parse --show-toplevel`; if it prints $HOME and cwd is not under ~/Docs, stop.
- Leave {app stores: ~/Library | AppData}, photo libraries, and other repos untouched.
Inside a repo, ignore this file.
```

Never name it `~/CLAUDE.md`: in Claude Code, a `CLAUDE.md` in cwd or any parent stops every
`AGENTS.md` from loading, which breaks repos that have only `AGENTS.md`.

## `~/.gitignore`

```gitignore
# my-home template v1
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

## `~/.ignore`

```gitignore
# my-home template v1
# Undo the home .gitignore whitelist for rg/fd/agent search tools. Git does not read this file.
!/*
```

## `~/Docs/GUIDE.md`

```markdown
<!-- my-home template v1 -->
# Home guide

You are the steward of this home: you know where everything is, you log every change with its
revert, and the owner decides. The notebook is ~/Docs. Use absolute paths, since your session may
have started in a subfolder (omp moves a session started at ~ to ~/tmp).

## Session start

1. Read README.md, TODO.md (`Now`, `Waiting on`), and the tail of journal/{YYYY-MM}.md.
2. If `last round` in README.md is more than 7 days old, offer the weekly round.

## Filing

- A new fact, date, contact, or decision goes to its file in the same turn it appears:
  - tasks → TODO.md
  - where things live → MAP.md
  - lasting knowledge → topics/<topic>.md, with a decision as a dated line
  - things done → journal/YYYY-MM.md
- INBOX.md is for capture in any form. File each line, then delete it.
- ~/Docs holds text only. Attachments stay in owner folders; link them by path.
- Never write secrets here. Record where a secret is kept, not the secret.
- Read a file before writing to it.

## Safety

| Action | Rule |
|---|---|
| Read anything in ~ | Free. In secret stores (.ssh, keychains, password files), look only; never copy content |
| Write inside ~/Docs | Free |
| Move or rename one owner file the owner asked about | Do it; journal `old → new` and the reverse command |
| Bulk change (more than about 20 files, or anything in a synced folder) | Plan in scratch/ with the file list and a reverse script; show a summary; wait for approval; execute; journal |
| Delete | OS trash only, after approval; journal what went where |
| Overwrite an owner file | Rename the old one to `name.bak-YYYYMMDD` first |
| App-owned stores ({~/Library \| %APPDATA% \| ~/.local/share}), photo libraries, other repos | Hands off; point to the owning app or repo |
| Large reorganization while the backup is missing or stale | Say so; stop until the owner chooses |

## Git

~ is a git repo that tracks only .gitignore, .ignore, AGENTS.md, and Docs/.

- Stage explicit paths only (`git add Docs/TODO.md`). Never `git add -A` or `git add .` from ~.
- Commit once per session, or when the round ends. Plain summary subjects.
- Before git clean, checkout ., restore ., stash -u, or reset --hard: run
  `git rev-parse --show-toplevel`. If it prints $HOME and cwd is not under ~/Docs, stop.
- No remote.

## Weekly round

Offer it; run it only when the owner agrees.

1. Empty INBOX.md.
2. Chase `Waiting on` rows.
3. Move `Done` rows to the journal.
4. Downloads older than 14 days: propose a home for each file; act on approval.
5. Disk free space; large growths since last round.
6. Backup age.
7. scratch/ entries older than 30 days: offer them for trash.
8. Set `last round` in README.md; commit.

## Boundaries

Inside ~/life or any repo, that base's own agent file and docs govern. MAP.md only points there.

## This machine

{Local rules the owner adds.}
```

## `~/Docs/README.md`

```markdown
<!-- my-home template v1 -->
# {hostname} home

- Owner: {name}
- Machine: {model}, {OS and version}
- Backup: {tool and destination | none configured} — last checked {YYYY-MM-DD}, last backup {date | never}
- Last round: {YYYY-MM-DD | never}
- Start a session: {alias | cd ~ && agent}

Guide: [GUIDE.md](GUIDE.md) · Map: [MAP.md](MAP.md) · Tasks: [TODO.md](TODO.md) ·
Inbox: [INBOX.md](INBOX.md) · Journal: [journal/](journal/) · Topics: [topics/](topics/)
```

## `~/Docs/MAP.md`

```markdown
<!-- my-home template v1 -->
# Map

## Home folders

| Folder | What goes here | Naming | Synced | Backed up |
|---|---|---|---|---|
| {Documents} | {…} | {…} | {no \| iCloud \| OneDrive} | {yes \| no} |

## Drives

| Mount | What | Backed up |
|---|---|---|

## Config

| What | Where | Managed by |
|---|---|---|
| {shell rc} | {~/.zshrc} | {hand \| dotfile repo \| tool} |

## Other bases

| Base | Path | Owns |
|---|---|---|
| {life} | {~/life} | {personal records; has its own agent file} |
```

## `~/Docs/TODO.md`

```markdown
<!-- my-home template v1 -->
# TODO

## Now

## Waiting on

<!-- - {what} — {who}, since {YYYY-MM-DD} -->

## Someday

## Done

<!-- - {YYYY-MM-DD} {what}. Moved to the journal at each round. -->
```

## `~/Docs/INBOX.md`

```markdown
<!-- my-home template v1 -->
# Inbox

Anything, any form. The steward files each line and deletes it.
```

## `~/Docs/journal/YYYY-MM.md`

```markdown
<!-- my-home template v1 -->
# Journal {YYYY-MM}

## {YYYY-MM-DD}

- {what was done}
- Moved `{old}` → `{new}`. Revert: `{mv '{new}' '{old}'}`
- Trashed `{path}` (in {Trash}). Revert: restore from {Trash}
```

## `~/Docs/topics/<topic>.md`

```markdown
<!-- my-home template v1 -->
# {Topic}

{What is known: facts, contacts, where related files live.}

## Decisions

- {YYYY-MM-DD}: {decision} — {why}
```

Create `topics/` empty at `init` (git needs a file to keep it: add the first topic, or a
`.gitkeep`). `scratch/` is created but never committed.
