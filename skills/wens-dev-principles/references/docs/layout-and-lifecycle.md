# Documentation — Layout, Templates, and Lifecycle

The recurring failure in long-lived repos is not missing documentation but *ambiguous*
documentation: a plan that half-describes the shipped code, a "context" file that is both
glossary and changelog, an ADR quietly edited to match a later decision. Nobody can tell which
file to trust. The fix is structural — a fixed folder set, one canonical folder, a status line on
every historical document, and an index at every level — so trust is decided by *where* a file
sits, not by reading it. Everything below is the concrete form of
[principles.md](principles.md); copy the templates verbatim and fill in the blanks.

## Directory tree

```
README.md
CHANGELOG.md
CONTEXT.md                          # entry index (principle 1)
LICENSE
docs/
  reference/                        # current behavior only — the source of truth
    README.md
    glossary.md                     # first file created (principle 5)
    KEYMAP.md
    changelog/                      # archived changelog series (principle 16)
      README.md
      v0.x.md
  adr/
    README.md
    0001-jsonschema-crate-for-validation.md
  spec/
    README.md
    2026-09-02-action-menu.md
  plan/
    README.md
    BACKLOG.md                      # the one living backlog, undated (principles 9, 17)
    2026-09-02-action-menu.md       # pairs with the spec by kebab title
  debug/
    README.md
    2026-08-29-drop-index-off-by-one.md
    2026-08-29-drop-index-off-by-one/   # same-basename script directory (principle 10)
      repro.py
      capture.log
  audit/
    README.md
    2026-08-29-dead-code-sweep.md
  tmp/                              # scratch, no rules
    <agent>-scratch/                # gitignored probes
    archive/
      2026-05.tar.gz
```

Filenames carry the lifecycle: **dated ⇔ frozen snapshot, undated ⇔ living** (principle 9). Every
undated name above — `CONTEXT.md`, `CHANGELOG.md`, the `reference/` files, `BACKLOG.md` — is a
document whose content is always current; every dated one is a judgement formed on that day and
frozen. `adr/NNNN-*.md` is the third case: frozen, but sequence-numbered because ADRs are cited
by number.

## Repo initialization

Lay the tree down in the **first commits of the repo**, before the first feature lands
(principle 2). The cost is one commit; the cost of retrofitting is a path migration plus every
citation already written into landed changelog entries and frozen records, which by then cannot
be rewritten except as mechanical path repair (principle 7).

Order matters — each step is depended on by the next:

1. `docs/reference/glossary.md` — **before any code** (principle 5). Written later, the
   identifiers and the docs have already diverged and one of them has to be renamed.
2. The seven folders with their `README.md` index stubs, each carrying its `## In progress`
   section empty (principle 11), plus root `CONTEXT.md` from the template above.
3. `CHANGELOG.md` containing only `## [Unreleased]`. Spell that heading exactly — release
   tooling rewrites it and version gates grep for the result (principle 16).
4. **`docs/plan/BACKLOG.md`, created empty on day one** (principle 17). This is the step most
   often skipped and the most expensive to skip: with no backlog, the first follow-up is written
   into `tmp/` or the tail of a debug note, and that path — findings scattered across frozen
   records — persists for as long as the repo does.
5. `docs/adr/0001-*.md` for the first expensive decision, usually the stack or a core dependency
   choice, on the day it is made (principle 13). The ADR habit is set by whether the first one
   exists.
6. `.gitignore` with `docs/tmp/*-scratch/` (principle 12).
7. The agent instruction file, pointing at `CONTEXT.md` and holding conduct only — commands,
   commit rules, release mechanics (principle 3).

Checklist before the first feature commit:

- [ ] `rg -L '^Status: ' docs/{spec,plan,debug,audit}/*.md` names only `BACKLOG.md`, if anything.
- [ ] Every folder `README.md` exists and every row in it resolves.
- [ ] `CONTEXT.md`'s folder table lists all seven folders and names `BACKLOG.md` as the one live
      tracker.
- [ ] No document outside `docs/` except the root four.

The whole skeleton is worth scripting once, idempotently (create-if-absent, never overwrite), so
that the layout is not a judgement call at hour zero of a new repo.

## Root CONTEXT.md template

```markdown
# CONTEXT

Entry point for all documentation. Root-level files (`README.md`, `CHANGELOG.md`, `LICENSE`)
stay here; everything else lives under `docs/`.

| Folder | Holds | Canonical? | Lifecycle |
|---|---|---|---|
| [`docs/reference/`](docs/reference/README.md) | Current behavior: glossary, per-subsystem contracts | Yes — the only source of truth | Kept in sync with the code |
| [`docs/adr/`](docs/adr/README.md) | Decisions that were expensive to reach and would be expensive to reverse | No — historical | Never edited; superseded by a new ADR |
| [`docs/spec/`](docs/spec/README.md) | Design records written before implementation | No — historical | Frozen once approved; only `Status:` changes |
| [`docs/plan/`](docs/plan/README.md) | Task-by-task implementation plans derived from a spec | No — historical | Frozen once shipped; only `Status:` changes |
| [`docs/plan/BACKLOG.md`](docs/plan/BACKLOG.md) | The one living tracker of open work, pending verification, external blockers, and watched items | No — live state | Never frozen while anything is open |
| [`docs/debug/`](docs/debug/README.md) | Handoff notes from investigations, with repro scripts | No — historical | Frozen once resolved; only `Status:` changes |
| [`docs/audit/`](docs/audit/README.md) | Point-in-time sweeps for bugs, dead code, inconsistency, plus assessment / verification runs | No — historical | Frozen once findings are addressed; only `Status:` changes |
| `docs/tmp/` | Scratch; `<agent>-scratch/` is gitignored | No | Archived to `tmp/archive/YYYY-MM.tar.gz` when stale |

## Reading order

1. [`docs/reference/glossary.md`](docs/reference/glossary.md) — the vocabulary every other file uses.
2. [`docs/reference/README.md`](docs/reference/README.md) — the subsystem map.
3. [`docs/adr/README.md`](docs/adr/README.md) — why the shape is what it is.
4. `CHANGELOG.md` — what changed recently.
5. [`docs/plan/BACKLOG.md`](docs/plan/BACKLOG.md) — what is still open.
```

## Folder README.md templates

### `docs/reference/README.md`

```markdown
# Reference

Current behavior only. Anything historical — a superseded design, a shipped plan, a resolved
investigation — lives in `../spec/`, `../plan/`, `../debug/`, or `../audit/`, not here.

- **[glossary.md](glossary.md)** — canonical vocabulary; read first.
- **[KEYMAP.md](KEYMAP.md)** — keyboard-binding table across surfaces.

Machine-checked: `KEYMAP.md` by `web/keymap-parity.spec.mjs`.

See also [`../adr/`](../adr/README.md) for decision records.
```

### `docs/adr/README.md`

```markdown
# Architecture Decision Records

One file per decision that was expensive to reach and would be expensive to reverse. An ADR
records *why* and which alternatives were rejected; it is a historical record, never edited.
Current behavior lives in [`../reference/`](../reference/README.md).

| # | Decision | Status |
|---|---|---|
| [0001](0001-jsonschema-crate-for-validation.md) | Validation uses the `jsonschema` crate, not a hand-rolled validator | Implemented (2026-08-06) |
| [0002](0002-unified-move-targeting.md) | One move-targeting rule across keyboard, pointer, and touch | Implemented (2026-08-19); §1 superseded by 0003 |
| [0003](0003-drops-resolve-through-slot.md) | Pointer drops resolve through the same slot rule as keyboard paste | Proposed |

Partial supersessions: 0002 §1 superseded by 0003.
```

### `docs/spec/README.md`, `docs/plan/README.md`, `docs/debug/README.md`, `docs/audit/README.md`

One template for all four; replace the H1 and the one-line description.

```markdown
# Specs

Design records written before implementation. Every file here is a historical record: frozen
once approved, dated by when it was written, never rewritten. Current behavior lives in
[`../reference/`](../reference/README.md).

## In progress

- [2026-09-02-action-menu.md](2026-09-02-action-menu.md) — `Draft`

## Landed

| Date | Document | Status |
|---|---|---|
| 2026-08-18 | [2026-08-18-row-state-model.md](2026-08-18-row-state-model.md) | Shipped (2026-08-20) |
| 2026-08-10 | [2026-08-10-inline-menu.md](2026-08-10-inline-menu.md) | Superseded by 2026-09-02-action-menu.md |
```

H1 / description per folder:

| Folder | H1 | Description |
|---|---|---|
| `spec/` | `# Specs` | Design records written before implementation. |
| `plan/` | `# Plans` | Task-by-task implementation plans derived from a spec. |
| `debug/` | `# Debug notes` | Handoff notes from investigations, with repro material. |
| `audit/` | `# Audits` | Point-in-time sweeps for bugs, dead code, and inconsistency. Also assessment and verification runs. |

`plan/README.md` carries one extra line above `## In progress`, because the folder holds the one
file the template's "frozen once approved" sentence does not describe:

```markdown
The living backlog is [BACKLOG.md](BACKLOG.md) — undated, never frozen while work is open.
```

## Status line

The second line of every file in `spec/`, `plan/`, `debug/`, `audit/`, immediately after the
H1, is `Status: <value>`. Values are exact strings so they can be grepped:

| Value | Used by | Meaning |
|---|---|---|
| `Draft` | all four | Being written; not yet agreed. |
| `Approved` | spec, plan | Agreed; implementation not started. |
| `In progress` | all four | Work under way. Also the implied status of a file with no `Status:` line. |
| `Shipped (YYYY-MM-DD)` | spec, plan | Landed on the given date. Frozen. |
| `Resolved (YYYY-MM-DD)` | debug, audit | Bug fixed / findings addressed on the given date. Frozen. |
| `Superseded by <relative path>` | all four | Replaced; the path names the replacement. Frozen. |
| `Abandoned` | all four | Dropped without replacement. Frozen. |

Example file head:

```markdown
# Centralized action menu
Status: Shipped (2026-08-30)
```

Audit for files missing a status line (each is by definition in progress):

```sh
rg -L '^Status: ' docs/{spec,plan,debug,audit}/*.md
```

List everything frozen:

```sh
rg -n '^Status: (Shipped|Resolved|Superseded|Abandoned)' docs/{spec,plan,debug,audit}/*.md
```

## Glossary entry

Every entry in `docs/reference/glossary.md` uses this shape — bold term with a trailing colon on
its own line, the definition as the next paragraph, and an `_Avoid_:` line. `_Avoid_` is
mandatory even when empty (`_Avoid_: —`) so a reader never wonders whether synonyms were
considered.

```markdown
**Node**:
Any single element in the config tree. The umbrella term for everything the user navigates and
operates on.
_Avoid_: Entry, item.

**Root**:
The single top-of-tree **Node** whose key is the filename. Exactly one Root per open file.
_Avoid_: File header, top node.

**Mutation**:
Any operation that changes the document and is recorded in undo history.
_Avoid_: —
```

Other glossary terms referenced inside a definition are bolded (`**Node**`) so the vocabulary
graph is visible at a glance.

## Script directories

A working-record document may own a directory with the same basename for non-Markdown material:

```
docs/debug/2026-09-02-foo.md
docs/debug/2026-09-02-foo/
  repro.py
  input.toml
  capture.log
```

Checklist:

- [ ] The directory exists only because `2026-09-02-foo.md` exists; no orphan directories.
- [ ] The `.md` links to every file in the directory and says what each is for.
- [ ] Scripts run standalone: standard library only, no repo build step, no import from the
      codebase under test (it will move on; the script must not).
- [ ] The directory freezes when the `.md` does — same `Status:` rule, no later edits.
- [ ] `docs/debug/README.md` lists the `.md` only, never the directory contents.
- [ ] This script is a one-off measurement, not a regression check re-run every release — the
      latter is repo tooling and is not bound by the freeze rule here.

## Archiving tmp/

`docs/tmp/` is committed and unindexed. When it is stale, archive in one commit:

```sh
mkdir -p docs/tmp/archive
tar -czf docs/tmp/archive/$(date +%Y-%m).tar.gz -C docs/tmp <files and dirs to archive>
git rm -r docs/tmp/<those same files and dirs>
git add docs/tmp/archive
git commit -m "docs: archive tmp/ scratch to tmp/archive/$(date +%Y-%m).tar.gz"
```

Never archive `archive/` itself, nor `<agent>-scratch/` (untracked); never archive files that are
still referenced from a non-frozen document.

## Changelog archiving

Root `CHANGELOG.md` = `[Unreleased]` + the current series. Everything older lives under
`docs/reference/changelog/`, moved **verbatim**: same headings, same ordering, no rewrites, no
summarizing. The move is a documentation change, never a content change.

`docs/reference/changelog/README.md`:

```markdown
# Changelog archives

The root [`CHANGELOG.md`](../../../CHANGELOG.md) carries **`[Unreleased]` plus the current
version series only**. Completed series are moved here verbatim — same format, same ordering,
no edits.

| Archive | Covers |
|---|---|
| [`v0.x.md`](v0.x.md) | v0.2.0 (2026-06-06) … v0.32.0 (2026-09-01) |

**When to archive.** On the first release of a new major series (v2.0.0), move the whole
preceding series into `v1.x.md` here and add a row above. Never archive the series the next tag
belongs to: the release workflow's version-verification job greps the **root** `CHANGELOG.md`
for `## [vX.Y.Z]` and hard-fails the tagged build if it is missing.
```

Checklist for the split commit:

- [ ] Every section of the archived series appears in the archive, byte-identical.
- [ ] Every section of the *current* series is still in the root file — list them before
      committing (`rg -n '^## \[v1\.' CHANGELOG.md`).
- [ ] `CONTEXT.md`'s reading order and `docs/reference/README.md` mention the archive.
- [ ] The rule ("never archive the current series") is written in **both** the archive index and
      the agent instruction file's release section.

## Living backlog record

One file, `docs/plan/BACKLOG.md` — **undated**, because it is a living record and the filename is
what tells a reader so (principle 9) — explicitly exempt from freeze-on-landing. Its `Status:` is
`In progress` until the Open section empties, then `Resolved (YYYY-MM-DD)`.

```markdown
# Backlog
Status: In progress

The one living record of open work. Rows move to Done with the commit that closed them and are
never deleted. Evidence is file + symbol, never a line number. `Verified` is the date the row was
last checked against the tree — not when it was opened.

## Open

| ID | Opened | Verified | Pri | Finding | Evidence | Effort | Acceptance |
|---|---|---|---|---|---|---|---|
| F7 | 2026-09-02 | 2026-09-09 | P2 | Diagnostic ring records only host notices | `session/dispatch.rs` `apply()` vs `dispatch()` | S | 16 keystrokes produce ≥16 events |

## Pending verification

Landed, but the check needs a platform or pipeline not available locally.

| Item | Closed by | Verifies when | Fallback |
|---|---|---|---|
| Store manifest accepts the single-`<Application>` shape | `5b4bf5f` | next `publish-msstore` run | revert `5b4bf5f` |

## Awaiting external

Blocked on a person or third party. **Not counted as open** — no amount of local work closes it.

| Item | Blocked on | Ready when |
|---|---|---|
| Play Store channel | account + testers | `publish-play.yml` can run |

## Watching

Known, deliberately not scheduled — each with the reason it is not a defect *yet*, the **trigger**
that would promote it to Open, and the date it was last re-read.

| Item | Why not now | Trigger | Re-read |
|---|---|---|---|
| `taplo` unmaintained upstream | no usable replacement; `rowan` exact-pinned to match | `cargo audit` flags `rowan`/`taplo` | 2026-09-18 |

## Done

| ID | Finding | Closed by |
|---|---|---|
| F12 | `CHANGELOG.md` growth | `9f7c58e` |
```

Rules that make it work:

- **One record, repo-wide.** Frozen audits keep their evidence and point here; a reference doc
  never becomes a de-facto tracker.
- **Re-verify before scheduling.** A row's `Verified` date is when someone last checked it
  against the tree — an older date means re-measure before acting (debug principle 2). Without
  that column a stale row is indistinguishable from a fresh one, and the next sweep re-files work
  that already shipped.
- **An acceptance criterion per row**, so "done" is observable rather than argued.
- **Four states, not two.** Open, Pending verification, Awaiting external, Watching. Collapsing
  them inflates the open count with work nobody can act on, and — worse — a
  landed-but-unverified caveat written as a sentence in a `Done` row is invisible: nothing will
  ever prompt anyone to go back and check it.
- **Watching is a real state**, and every row needs a trigger. Something reproducible but
  deliberately unfixed (a lenient parser both sides agree on, a token gap in one palette) belongs
  there with its reasoning, not in Open where it will be "fixed" into an inconsistency. A row with
  no trigger is not being watched — it is being forgotten in a nicer font.
- **Watching is also the SSOT for deferred dependency decisions.** A pinned or unmaintained
  dependency's *decision* ("do not migrate now, because…") lives in one row here; the agent
  instruction file keeps only the risk and links to it. Copied into two or three files, the copies
  drift and each one looks authoritative.

## Documentation audit

A periodic sweep of the living documents against the code (principle 19). Structure is the easy
half; accuracy is where the defects are. Run in two passes:

**Pass 1 — structure (mechanical).**

- [ ] Every `.md` under `docs/` appears in its folder `README.md`; every index row resolves.
- [ ] Filenames match `YYYY-MM-DD-kebab.md` / `NNNN-kebab.md`, the sole undated exception being
      the living `plan/BACKLOG.md`; every working record has a `Status:` line on line 2 from the
      fixed value set. A second undated file in a working-record folder, or a dated file that is
      still being edited, means the lifecycle and the filename disagree (principle 9).
- [ ] Links resolve — **and** grep for paths written as inline code spans, which no link
      checker sees:

      ```sh
      rg -n '`docs/[a-z][^`]*`' docs *.md
      ```

- [ ] No file in `reference/` contains a backlog, a "History" section, or a TODO list.

**Pass 2 — accuracy (read the code).**

- [ ] Every count in prose is re-counted (call sites, test suites, catalog keys, table rows), or
      replaced by a symbol name.
- [ ] Every behavior claim is checked against the implementation *and* against the other
      documents that mention it — contradictions between two reference files are the most common
      finding.
- [ ] Features shipped without documentation: diff the changelog's feature entries for the period
      against the reference table of contents.
- [ ] Invariant tests that assert a documented number are re-read; a drifted test asserts the
      drifted doc and hides the same defect twice.
- [ ] The agent instruction file restates nothing from reference (principle 3).

Land the sweep as `docs/audit/YYYY-MM-DD-documentation-audit.md` with the defect list, and fix
the defects in the same commit or the next one — an audit whose findings are not scheduled
becomes another frozen record nobody acts on.
