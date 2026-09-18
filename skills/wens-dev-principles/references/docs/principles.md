# Documentation Layout Principles

High-level conventions for where a repository's documents live, which of them are the source
of truth, and when a document freezes. Applies to any repo that has more than a README. These
are *principles*, not templates — the templates (directory tree, `CONTEXT.md`, folder
`README.md`s, status line, glossary entry) live in [layout-and-lifecycle.md](layout-and-lifecycle.md).

## Index

| # | Grade | Principle |
|---|---|---|
| 1 | MUST | Root `CONTEXT.md` is the single documentation entry point (an index, not a glossary) |
| 2 | MUST | `docs/` has a fixed folder set, each with an indexing `README.md` |
| 3 | SHOULD | Agent instruction file points at `CONTEXT.md`, never restates reference |
| 4 | MUST | `docs/reference/` describes current behavior only |
| 5 | MUST | `docs/reference/glossary.md` is the first document, in a fixed entry format |
| 6 | SHOULD | Reference is one file per subsystem, cross-linked, machine-checks named |
| 7 | MUST | Working records freeze on landing; afterwards only `Status:` and mechanical path repair |
| 8 | MUST | Every working record opens with a `Status:` line from a fixed value set |
| 9 | MUST | Frozen working records are dated `YYYY-MM-DD-kebab-title.md`; living records are named by role, undated |
| 10 | SHOULD | A working record may own a same-basename directory for scripts and fixtures |
| 11 | SHOULD | Folder `README.md` lists in-progress work in a section at the top |
| 12 | CONSIDER | `docs/tmp/` is committed scratch, archived as a tarball when stale |
| 13 | MUST | One ADR per expensive decision; never edited, only superseded |
| 14 | MUST | `adr/README.md` is a status table; filenames are `NNNN-kebab-title.md` |
| 15 | MUST | Deviating from any MUST principle in this skill requires an ADR |
| 16 | SHOULD | `CHANGELOG.md` carries `[Unreleased]` plus the current series; older series archive verbatim |
| 17 | SHOULD | Exactly one living backlog record, `plan/BACKLOG.md` — the only exception to freeze-on-landing |
| 18 | SHOULD | Docs cite code by symbol, never by `file:line`; counted claims are machine-checked or dropped |
| 19 | CONSIDER | Audit living docs against the code periodically, for accuracy as well as structure |
| 20 | SHOULD | `audit/` holds sweeps and verification runs; one-off measurement in the record, regression checks in repo tooling |

## A. Entry point and indexes

1. **[MUST]** Repo root `CONTEXT.md` is the single documentation entry point. It is an *index*:
   one table of the `docs/` folders (what each holds, whether it is canonical, its lifecycle)
   plus a reading order for a newcomer. It holds no glossary terms itself — it links to
   `docs/reference/glossary.md` as the first thing to read. The repo root keeps only
   `README.md`, `CHANGELOG.md`, `CONTEXT.md`, `LICENSE`, and platform-mandated files; every
   other document lives under `docs/`. **Template:** [layout-and-lifecycle.md](layout-and-lifecycle.md) §Root CONTEXT.md template.

2. **[MUST]** `docs/` contains exactly these folders, singular names: `reference/`, `adr/`,
   `spec/`, `plan/`, `debug/`, `audit/`, `tmp/`. Each except `tmp/` has a `README.md` that lists
   every `.md` file in that folder with a one-line summary and its status. Adding or
   re-statusing a document and updating its folder `README.md` happen in the same commit; a
   document absent from its index is a bug. Lay the whole set down at **repo initialization**,
   with index stubs and an empty living backlog, before the first feature commit: retrofitting it
   later is a path migration that breaks every citation already written into landed changelog
   entries and frozen records. **Templates:** same reference, §Folder README.md templates;
   **init order:** same reference, §Repo initialization.

3. **[SHOULD]** The agent instruction file (`CLAUDE.md`, `AGENTS.md`, or equivalent) points at
   `CONTEXT.md` and states repo-specific *conduct* — tooling, commit rules, review gates. It does
   not restate reference content. If a fact is needed by both, it lives in `docs/reference/` and
   the instruction file links to it.

## B. `reference/` — single source of truth

4. **[MUST]** `docs/reference/` describes current behavior only. A superseded design, a shipped
   plan, or a resolved investigation is moved to its lifecycle folder (`spec/`, `plan/`,
   `debug/`, `audit/`), never left in reference with a "historical" note or a "History" section.

5. **[MUST]** `docs/reference/glossary.md` is the first reference document created in any repo,
   before any other `docs/` file. Entry format is fixed: a `**Term**:` line, a definition
   paragraph, and an `_Avoid_:` line listing rejected synonyms. Code identifiers, UI strings,
   commit messages, and every other document use glossary terms; introducing a new term means
   adding its entry in the same commit. **Format:** same reference, §Glossary entry.

6. **[SHOULD]** Reference is split one file per subsystem or surface (e.g. `KEYMAP.md`, `TUI.md`,
   `MESSAGES.md`), each cross-linking the others. `reference/README.md` flags which files are
   machine-checked by a test and names the test, so a reader knows which claims cannot drift.

## C. Working records — `spec/`, `plan/`, `debug/`, `audit/`

7. **[MUST]** A document in `spec/`, `plan/`, `debug/`, or `audit/` is frozen once it lands —
   spec approved, plan shipped, debug resolved, audit findings addressed. After that the only
   permitted edits are its `Status:` line and **mechanical path repair**: when a file it cites is
   renamed or moved, rewrite the path string in the same commit as the move and change nothing
   else. That is not a revision — findings, evidence, and conclusions are untouched — and the
   alternative is a permanently dead link in every frozen record that cited the old path, which
   makes the archive unnavigable exactly when someone is trying to trace a decision. Corrections,
   follow-ups, and changed designs are new documents that the old one's `Status:` points to. A
   false start stays in the record; it often explains a later design better than the design
   document does.

8. **[MUST]** Every working-record document opens with a status line as the second line of the
   file, immediately after the H1: `Status: <value>`. Values are exactly `Draft`, `Approved`,
   `In progress`, `Shipped (YYYY-MM-DD)`, `Resolved (YYYY-MM-DD)`, `Superseded by <relative path>`,
   `Abandoned`. `Shipped` is for spec/plan; `Resolved` is for debug/audit. A document with no
   `Status:` line is treated as `In progress`. **Value table + audit grep:** same reference, §Status line.

9. **[MUST]** A **frozen-lifecycle** working record is named `YYYY-MM-DD-kebab-title.md`, dated
   when the document was written, not when the work landed. A spec and its plan share the kebab
   title (`spec/2026-09-02-foo.md` ↔ `plan/2026-09-02-foo.md`) so they pair by name.

   The date earns its place only there: it marks when that judgement was formed, it gives a
   stable sort, and it pairs the spec with the plan. A **living** record has none of those
   properties — its content is always *now*, nothing pairs with it, and its creation date is in
   git history — so it is named by **role**, in caps, undated: `plan/BACKLOG.md`, alongside
   `CHANGELOG.md` and `CONTEXT.md`. Read the filename as the lifecycle: **dated ⇔ frozen
   snapshot, undated ⇔ living**, so a reader knows which to trust without opening the file, the
   same way principles 4 and 7 make the *folder* carry that meaning. A date on a living file
   actively misleads: it reads as a snapshot, so readers ask whether a newer one exists, and the
   pressure eventually produces a second dated file beside it
   (`audit/2026-09-15-open-follow-ups-evaluation.md`) instead of a row in the one tracker.

10. **[SHOULD]** A working-record document may own a sibling directory with the same basename
    (`debug/2026-09-02-foo/`) for scripts, fixtures, captured output, and other non-Markdown
    material. The directory exists only if the `.md` exists; the `.md` links to every file in
    it; the directory freezes with the document; the folder `README.md` indexes the `.md` only.
    Scripts are self-contained (standard library, no repo build step) so they still run after
    the code moves on. **Checklist:** same reference, §Script directories.

11. **[SHOULD]** Each folder `README.md` opens with an `## In progress` section listing every
    document whose status is `Draft`, `Approved`, `In progress`, or missing, so live work is
    visible in one place; landed documents follow in a table.

12. **[CONSIDER]** `docs/tmp/` is a committed scratch area with no naming or index rules;
    subdirectories per topic are allowed. When it grows stale, tar the loose files into
    `docs/tmp/archive/YYYY-MM.tar.gz` and remove them in the same commit. `docs/tmp/<agent>-scratch/`
    is a gitignored subpath for probes that need not land; the rest of `tmp/` stays committed and
    archived. **Commands:** same reference, §Archiving tmp/.

20. **[SHOULD]** `docs/audit/` covers **any point-in-time judgement** of the tree: sweeps (bugs,
    dead code, inconsistency) and equally assessment and verification runs. The homing test is one
    question — **will anyone want to cite or re-run this later?** Yes → an `audit/` record with a
    `Status:` line; no → `docs/tmp/`. A subtype prefix after the date is optional
    (`2026-09-17-verify-keymap-parity.md`, `2026-09-17-sweep-dead-code.md`) and not required when
    the folder already names the kind. A **regression** check — one re-run every release — does not
    belong in a record directory: principle 10 freezes those and requires them to be self-contained.
    It is repo tooling, named in `reference/README.md` per principles 6 and 18.

## D. `adr/`

13. **[MUST]** One ADR per decision that was expensive to reach and would be expensive to
    reverse. It records why, the alternatives rejected, and the date; it is a historical record,
    never edited afterward. Revisiting a decision means a new ADR whose text marks the old one
    (or the exact section) superseded. Current behavior lives in `reference/`, not in the ADR.

14. **[MUST]** `adr/README.md` is a table `# | Decision | Status` with status values `Proposed`,
    `Implemented (YYYY-MM-DD)`, `Superseded by NNNN`, plus a note under the table for partial
    supersessions (`NNNN §k superseded by MMMM`). Filenames are `NNNN-kebab-title.md`,
    zero-padded to four digits. **Template:** same reference, §Folder README.md templates.

15. **[MUST]** Deviating from any `MUST` principle in this skill — any domain — requires an ADR
    in `docs/adr/` citing the principle by domain and number (`wens-dev-principles docs 7`).

## E. Changelog, backlog, and citations

16. **[SHOULD]** Root `CHANGELOG.md` carries `[Unreleased]` plus the **current version series
    only**. Completed series move verbatim — same format, same ordering, nothing edited in
    transit — into `docs/reference/changelog/vN.x.md`, with an index `README.md` stating the
    rule and what each archive covers. The trigger is the growth trend, not a size threshold
    (341 KB → 482 KB → 534 KB across three months is the signal; the split cut the root file
    78%). Archive on the first release of a **new** series, and never archive the series the
    next tag belongs to — release CI typically greps the root file for `## [vX.Y.Z]` and will
    hard-fail a tagged build after the tag is already pushed. **Template:**
    [layout-and-lifecycle.md](layout-and-lifecycle.md) §Changelog archiving.

17. **[SHOULD]** Open follow-ups live in exactly one **living backlog record**,
    `docs/plan/BACKLOG.md` — named by role and undated per principle 9 — and that record is the
    single permitted exception to principle 7's freeze-on-landing: rows move to a `Done` log with
    the commit that closed them and are never deleted. Frozen audits and debug notes are right
    for evidence and wrong for a backlog — nothing can be ticked off in them, so an item's real
    status is only knowable by re-reading the code. Every row carries its evidence (file +
    symbol), the date it was last verified against the tree, priority, effort, and an acceptance
    criterion, so picking one up does not start with re-deriving what it means. Work that is
    neither open nor done gets its own section rather than a footnote: landed-but-unverifiable
    here, blocked on a third party, and deliberately-not-scheduled are three different states and
    only the first counts against the open list. The entry index names it as the one live tracker;
    other records — and the agent instruction file, for deferred dependency decisions — point at
    it instead of growing their own copy. **Row format and sections:** same reference,
    §Living backlog record.

18. **[SHOULD]** Documentation cites code by **symbol** (`array_insert`, `Session::dispatch`),
    never by `file.rs:123` — line citations rot silently and in bulk (41 of them in one sweep).
    The same applies to counted claims ("48 call sites", "18 test suites"): either a test
    machine-checks the count or the count is dropped in favour of the name. Note in
    `reference/README.md` which documents are machine-checked and by which test.

19. **[CONSIDER]** Periodically audit the living documents against the code — not just links and
    indexes, which tooling can check, but **accuracy**: counts, defaults, behavior claims,
    features shipped but never documented, and sections that contradict another document. Two
    findings recur and are invisible to link checkers: dead paths written as inline code spans
    rather than links, and a reference file that has quietly grown a resolved-bug backlog inside
    the folder whose README says "current behavior only". **Checklist:** same reference,
    §Documentation audit.

## Common Mistakes

- An agent instruction file that grows into a second, drifting copy of reference (violates 3).
- Writing the glossary after the code, so identifiers and docs disagree on names (violates 5).
- A reference doc keeping a "History" or "Previously" section of superseded designs (violates 4).
- Editing a shipped plan to "keep it current" instead of writing a new one (violates 7).
- Emoji-only status banners that cannot be grepped or compared (violates 8).
- Dating a plan by its ship date so the spec/plan slugs no longer pair (violates 9).
- Dating the living backlog (`plan/2026-09-09-open-follow-ups.md`), so it reads as a snapshot of
  that day, and the next sweep files its findings in a new dated record beside it instead of as
  rows in it (violates 9 and 17).
- A folder of debug scripts with no `.md` explaining what they reproduce (violates 10).
- Rewriting an ADR to match the new behavior instead of superseding it (violates 13).
- A new document committed without its folder `README.md` row, so the index lies (violates 2).
- Creating `docs/` folders only when the first document needs one, so the layout is retrofitted
  months in and every already-landed citation points at the old path (violates 2).
- A `CHANGELOG.md` that grows to thousands of lines because "there was no threshold to hit",
  or archiving the series the next tag belongs to and breaking the release gate (violates 16).
- Tracking open work across three frozen records and a footnote, so nothing can be ticked off
  (violates 17).
- `see foo.rs:412` in a reference document, pointing at an unrelated line a month later
  (violates 18).
- An audit that verifies every link and never checks whether a single claim is still true
  (violates 19).
- Deviating from a MUST principle with a commit-message note instead of an ADR (violates 15).
- A verification script and its conclusion left in `tmp/` so they never land, or a check that must
  be re-run every release parked in a frozen record directory (violates 20).
