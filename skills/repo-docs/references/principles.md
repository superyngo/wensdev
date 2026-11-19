# Documentation Layout Principles

High-level conventions for where a repository's documents live, which of them are the source
of truth, and when a document freezes. Applies to any repo that has more than a README. These
are *principles*, not templates — the templates (directory tree, `CONTEXT.md`, folder
`README.md`s, status line, glossary entry) live in [layout-and-lifecycle.md](layout-and-lifecycle.md).

The principles are domain-neutral. What a folder holds in a given kind of repo — software
development, operations, and others added later — is set by the repo's **profile**
(principle 25), in [profiles/](profiles/README.md).

## Index

| # | Grade | Principle |
|---|---|---|
| 1 | MUST | Root `CONTEXT.md` is the single documentation entry point (an index, not a glossary) |
| 2 | MUST | `docs/` has a fixed folder set (plus optional `memo/`, `note/`), each with an indexing `README.md`; a profile may map the working-record folders (25) |
| 3 | SHOULD | Agent instruction file points at `CONTEXT.md`, never restates reference |
| 4 | SHOULD | Documents are written in English, whatever language the conversation uses |
| 5 | MUST | `docs/reference/` describes current behavior only |
| 6 | MUST | `docs/reference/glossary.md` is the first document, in a fixed entry format |
| 7 | SHOULD | Reference is one file per subsystem, cross-linked, machine-checks named |
| 8 | MUST | Working records freeze on landing; afterwards only `Status:` and mechanical path repair |
| 9 | MUST | Every working record opens with a `Status:` line from a fixed value set |
| 10 | MUST | Frozen working records are dated `YYYY-MM-DD-kebab-title.md`; living records are named by role, undated |
| 11 | SHOULD | A working record may own a same-basename directory for scripts and fixtures |
| 12 | SHOULD | Folder `README.md` lists in-progress work in a section at the top |
| 13 | CONSIDER | `docs/tmp/` is scratch, one dated directory per task; sweep it at each release (or at the profile's cadence) — triage first, then archive or trash, with approval |
| 14 | SHOULD | `audit/` holds sweeps and verification runs; one-off measurement in the record, regression checks in repo tooling; the agent that made the scratch triages it at task end |
| 15 | MUST | Deviating from any MUST principle in this skill or `wens-dev-principles` requires an ADR |
| 16 | MUST | One ADR per decision that is expensive to reverse and meant to stay fixed — never for procedures; never edited, only superseded |
| 17 | MUST | `adr/README.md` is a status table; filenames are `NNNN-kebab-title.md` |
| 18 | SHOULD | `CHANGELOG.md` carries `[Unreleased]` plus the current series; older series archive verbatim |
| 19 | SHOULD | Exactly one living backlog record, `plan/BACKLOG.md` (or as a profile maps it) — the only exception to freeze-on-landing |
| 20 | SHOULD | Docs cite code by symbol, never by `file:line`; counted claims are machine-checked or dropped |
| 21 | CONSIDER | Audit living docs against the code periodically, for accuracy as well as structure |
| 22 | CONSIDER | `docs/memo/` is the human's free space: any form, any language, not canonical, agent-edited only on request |
| 23 | SHOULD | `docs/note/` holds living, topic-named knowledge that holds beyond this repo's own systems; no catch-all lessons file |
| 24 | SHOULD | Route each finding by its nature; a lesson that changes how work is done edits the procedure step itself; records and notes link both ways |
| 25 | SHOULD | `CONTEXT.md` declares the repo's profile; a profile sets what folders hold and the cadences, may map the folder set through lifecycle classes, never changes the lifecycle rules |

## A. Entry point, indexes, and language

1. **[MUST]** Repo root `CONTEXT.md` is the single documentation entry point. It is an *index*:
   one table of the `docs/` folders (what each holds, whether it is canonical, its lifecycle)
   plus a reading order for a newcomer. It holds no glossary terms itself — it links to
   `docs/reference/glossary.md` as the first thing to read. The repo root keeps only
   `README.md`, `CHANGELOG.md`, `CONTEXT.md`, `LICENSE`, platform-mandated files, and the root
   files a declared profile maps (principle 25); every other document lives under `docs/` or in
   the profile's mapped layout. **Template:** [layout-and-lifecycle.md](layout-and-lifecycle.md) §Root CONTEXT.md template.

2. **[MUST]** `docs/` contains exactly these folders, singular names: `reference/`, `adr/`,
   `spec/`, `plan/`, `debug/`, `audit/`, `tmp/` — plus `memo/` (principle 22) and `note/`
   (principle 23) where the repo uses them; a declared profile may replace `spec/`, `plan/`,
   `debug/`, and `audit/` with the layout it maps (principle 25). Each except `tmp/` has a `README.md`; outside `memo/`, that `README.md` lists
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

4. **[SHOULD]** Write every document under `docs/` — and root `README.md`, `CONTEXT.md`, and
    `CHANGELOG.md` — in English, even when the conversation with the user is in another
    language. Docs outlive the session and are read by other contributors and agents; one
    language keeps glossary terms (principle 6) greppable. Reply to the user in their language;
    write the file in English. A repo that has chosen another doc language records it in an ADR.
    Skills (`SKILL.md` and their references) follow the same rule; the one exception is guidance
    whose subject is a specific language (e.g. Chinese typesetting or IME behavior), which may use
    that language for the examples and passages that need it — only there.
    `docs/memo/` is exempt: it is written for and by the human, in whatever language they think in.

## B. `reference/` — single source of truth

5. **[MUST]** `docs/reference/` describes current behavior only. A superseded design, a shipped
   plan, or a resolved investigation is moved to its lifecycle folder (`spec/`, `plan/`,
   `debug/`, `audit/`), never left in reference with a "historical" note or a "History" section.

6. **[MUST]** `docs/reference/glossary.md` is the first reference document created in any repo,
   before any other `docs/` file. Entry format is fixed: a `**Term**:` line, a definition
   paragraph, and an `_Avoid_:` line listing rejected synonyms. Code identifiers, UI strings,
   commit messages, and every other document use glossary terms; introducing a new term means
   adding its entry in the same commit. **Format:** same reference, §Glossary entry.

7. **[SHOULD]** Reference is split one file per subsystem or surface (e.g. `KEYMAP.md`, `TUI.md`,
   `MESSAGES.md`), each cross-linking the others. `reference/README.md` flags which files are
   machine-checked by a test and names the test, so a reader knows which claims cannot drift.

## C. Working records — `spec/`, `plan/`, `debug/`, `audit/`

8. **[MUST]** A document in `spec/`, `plan/`, `debug/`, or `audit/` is frozen once it lands —
   spec approved, plan shipped, debug resolved, audit findings addressed. After that the only
   permitted edits are its `Status:` line and **mechanical path repair**: when a file it cites is
   renamed or moved, rewrite the path string in the same commit as the move and change nothing
   else. That is not a revision — findings, evidence, and conclusions are untouched — and the
   alternative is a permanently dead link in every frozen record that cited the old path, which
   makes the archive unnavigable exactly when someone is trying to trace a decision. Corrections,
   follow-ups, and changed designs are new documents that the old one's `Status:` points to. A
   false start stays in the record; it often explains a later design better than the design
   document does.

9. **[MUST]** Every working-record document opens with a status line as the second line of the
   file, immediately after the H1: `Status: <value>`. Values are exactly `Draft`, `Approved`,
   `In progress`, `Shipped (YYYY-MM-DD)`, `Resolved (YYYY-MM-DD)`, `Superseded by <relative path>`,
   `Abandoned`. `Shipped` is for spec/plan; `Resolved` is for debug/audit and the living backlog (principle 19). A document with no
   `Status:` line is treated as `In progress`. **Value table + audit grep:** same reference, §Status line.

10. **[MUST]** A **frozen-lifecycle** working record is named `YYYY-MM-DD-kebab-title.md`, dated
   when the document was written, not when the work landed. A spec and its plan share the kebab
   title (`spec/2026-09-02-foo.md` ↔ `plan/2026-09-02-foo.md`) so they pair by name.

   The date earns its place only there: it marks when that judgement was formed, it gives a
   stable sort, and it pairs the spec with the plan. A **living** record has none of those
   properties — its content is always *now*, nothing pairs with it, and its creation date is in
   git history — so it is named by **role**, in caps, undated: `plan/BACKLOG.md`, alongside
   `CHANGELOG.md` and `CONTEXT.md`. Read the filename as the lifecycle: **dated ⇔ frozen
   snapshot, undated ⇔ living**, so a reader knows which to trust without opening the file, the
   same way principles 5 and 8 make the *folder* carry that meaning. A date on a living file
   actively misleads: it reads as a snapshot, so readers ask whether a newer one exists, and the
   pressure eventually produces a second dated file beside it
   (`audit/2026-09-15-open-follow-ups-evaluation.md`) instead of a row in the one tracker.

11. **[SHOULD]** A working-record document may own a sibling directory with the same basename
    (`debug/2026-09-02-foo/`) for scripts, fixtures, captured output, and other non-Markdown
    material. The directory exists only if the `.md` exists; the `.md` links to every file in
    it; the directory freezes with the document; the folder `README.md` indexes the `.md` only.
    Scripts are self-contained (standard library, no repo build step) so they still run after
    the code moves on. **Checklist:** same reference, §Script directories.

12. **[SHOULD]** Each folder `README.md` opens with an `## In progress` section listing every
    document whose status is `Draft`, `Approved`, `In progress`, or missing, so live work is
    visible in one place; landed documents follow in a table.

13. **[CONSIDER]** `docs/tmp/` is a committed scratch area with no naming or index rules;
    subdirectories per topic are allowed. `docs/tmp/<agent>-scratch/` is a gitignored subpath
    for probes that need not land. Inside it, **each task gets its own directory**,
    `YYYY-MM-DD-<slug>/`, holding its scripts, fixtures, and output, and each script opens with
    a comment saying what it is for and how to run it: a month later, `q5.py` beside `dt4.toml`
    cannot be triaged, while a dated task directory is one line in the sweep.
    **Sweep `tmp/` at each release** — "when it grows stale"
    names no moment, so it never happens. A repo with no releases sweeps at the cadence its
    profile names (principle 25; operations: the first session of each week). The sweep **triages before it removes**: anything
    worth citing later is promoted to its real home first (principle 14). What is left and stale
    leaves in a recoverable way — tracked files into `docs/tmp/archive/YYYY-MM.tar.gz`,
    untracked files into the OS trash, never `rm`. Build output (`target/`, `node_modules/`,
    `.venv/`, `dist/`, `build/`, `__pycache__/`) and anything that can be fetched again from a
    named source (git clones and mirrors, downloaded pages) are regenerable, not scratch: they
    are most of the bytes and are never archived. A **backup** (a copy of `.git`, `*.orig`,
    `*-backup*`) is never stale by age: it waits for an explicit decision and is never tarred
    into git, where it may carry history or secrets. The sweep reports its classification and
    waits for approval every time; it moves nothing on its own. **Procedure:** same reference,
    §Scratch shape and task end, §Sweeping tmp/.

14. **[SHOULD]** `docs/audit/` covers **any point-in-time judgement** of the tree: sweeps (bugs,
    dead code, inconsistency) and equally assessment and verification runs. The homing test is one
    question — **will anyone want to cite or re-run this later?** Yes → an `audit/` record with a
    `Status:` line; no → `docs/tmp/`. A subtype prefix after the date is optional
    (`2026-09-17-verify-keymap-parity.md`, `2026-09-17-sweep-dead-code.md`) and not required when
    the folder already names the kind. A **regression** check — one re-run every release — does not
    belong in a record directory: principle 11 freezes those and requires them to be self-contained.
    It is repo tooling, named in `reference/README.md` per principles 7 and 20. The agent that
    made the scratch applies the homing test **at task end**, before it reports done, while it
    still knows what each file was for: a conclusion becomes an `audit/` record and the scripts
    that back it move into that record's directory (principle 11); a recurring check becomes
    repo tooling; knowledge goes to `note/` and follow-ups to `BACKLOG.md` (principle 24);
    whatever is left stays in scratch and its path is stated. The sweep (principle 13) catches
    what this step missed; it is not the first time anyone looks.

## D. `adr/`

15. **[MUST]** Deviating from any `MUST` principle — in this skill or in any domain of
    `wens-dev-principles` — requires an ADR in `docs/adr/` citing the principle by skill and
    number (`repo-docs 8`, `wens-dev-principles ui 7`).

16. **[MUST]** One ADR per decision that would be expensive to reverse **and** is meant to stay
    fixed. It records why, the alternatives rejected, and the date; it is a historical record,
    never edited afterward. Revisiting a decision means a new ADR whose text marks the old one
    (or the exact section) superseded. Current behavior lives in `reference/`, not in the ADR.

    **Scope.** A procedure that must stay adjustable — a command, a tool choice, a step order, a
    schedule — never gets an ADR, however much effort it took to find: it is a step in a
    `reference/` procedure, edited in place, with a `note/` (principle 23) explaining why when
    the why is not obvious. An ADR for a procedure makes every later improvement a
    supersession, and the chain grows faster than anyone reads it. ADR-worthy: authority and
    safety gates, the documentation system itself, architecture direction, persisted or public
    contracts. In development, weigh the project's **stage** and the **room left to switch**: in
    exploration, a choice expected to change is a `reference/` line or a `BACKLOG.md` Watching
    row, not an ADR; once a choice is locked in by persisted data, a public interface, or a
    dependency other code builds on, it is an ADR. **When in doubt, write it in `reference/`
    first**; promote it to an ADR when reversing it has become costly. The profile names its
    domain's ADR scope (principle 25). **Stage table:** same reference, §ADR scope.

17. **[MUST]** `adr/README.md` is a table `# | Decision | Status` with status values `Proposed`,
    `Implemented (YYYY-MM-DD)`, `Superseded by NNNN`, plus a note under the table for partial
    supersessions (`NNNN §k superseded by MMMM`). Filenames are `NNNN-kebab-title.md`,
    zero-padded to four digits. **Template:** same reference, §Folder README.md templates.

## E. Changelog, backlog, and citations

18. **[SHOULD]** Root `CHANGELOG.md` carries `[Unreleased]` plus the **current version series
    only**. Completed series move verbatim — same format, same ordering, nothing edited in
    transit — into `docs/reference/changelog/vN.x.md`, with an index `README.md` stating the
    rule and what each archive covers. The trigger is the growth trend, not a size threshold
    (341 KB → 482 KB → 534 KB across three months is the signal; the split cut the root file
    78%). Archive on the first release of a **new** series, and never archive the series the
    next tag belongs to — release CI typically greps the root file for `## [vX.Y.Z]` and will
    hard-fail a tagged build after the tag is already pushed. **Template:**
    [layout-and-lifecycle.md](layout-and-lifecycle.md) §Changelog archiving.

19. **[SHOULD]** Open follow-ups live in exactly one **living backlog record**,
    `docs/plan/BACKLOG.md` (or one per domain folder plus a root roll-up, where a profile maps
    the folder set, principle 25) — named by role and undated per principle 10 — and that record is the
    single permitted exception to principle 8's freeze-on-landing: rows move to a `Done` log with
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

20. **[SHOULD]** Documentation cites code by **symbol** (`array_insert`, `Session::dispatch`),
    never by `file.rs:123` — line citations rot silently and in bulk (41 of them in one sweep).
    The same applies to counted claims ("48 call sites", "18 test suites"): either a test
    machine-checks the count or the count is dropped in favour of the name. Note in
    `reference/README.md` which documents are machine-checked and by which test.

21. **[CONSIDER]** Periodically audit the living documents against the code — not just links and
    indexes, which tooling can check, but **accuracy**: counts, defaults, behavior claims,
    features shipped but never documented, and sections that contradict another document. Two
    findings recur and are invisible to link checkers: dead paths written as inline code spans
    rather than links, and a reference file that has quietly grown a resolved-bug backlog inside
    the folder whose README says "current behavior only". **Checklist:** same reference,
    §Documentation audit.

## F. `memo/`

22. **[CONSIDER]** `docs/memo/` is the human's free space in the repo: ideas still forming,
    loose thinking, background, anything a person wants to be able to find again. Every other
    folder is shaped for agents to operate on; after long agent-driven development the reasoning
    lives only in prompts that turned straight into code, and nothing is left that a person can
    browse. So `memo/` has **no rules of form**: any filename, any structure, any language
    (exempt from principle 4), no `Status:` line, no freeze, and no per-file index — its
    `README.md` states the purpose and may list files but need not. It is committed. Two rules
    keep it from becoming a second `tmp/` or a second `reference/`: it is **not canonical** —
    nothing in it is evidence of how the repo behaves, and an agent does not act on it as
    instruction; and it is **human-owned** — an agent reads or tidies it when asked in that
    turn, and does not write session output there on its own. When an idea matures, it becomes
    a spec or a `BACKLOG.md` row as a new document; the memo stays as written.
    **Template:** same reference, §Folder README.md templates.

## G. Knowledge, findings, and profiles

23. **[SHOULD]** `docs/note/` holds **living, topic-named knowledge that holds beyond this
    repo's own systems**: how a tool, platform, or library actually behaves, a gotcha that
    would bite on another host or in another project. Test: *would this still be true on
    another system?* Yes → `note/`. Each file is one topic, named by the topic and undated per
    principle 10 (`rhel-local-rpm-install.md`, never `2026-11-18-kernel-patch-lessons.md`); a
    new finding on an existing topic is added to that file rather than a new one. A note
    explains **why**; it is not a procedure — the steps live in `reference/` and the note links
    to them. It ends with a `## Cases` section linking the dated records where the knowledge
    was learned. There is **no catch-all** `lessons-learned.md`: a lessons file mixes topics,
    is read by no one before the next attempt, and lets the procedure stay wrong. `note/` is
    canonical for what it states and is kept current like `reference/` (principle 5 applies:
    a note proven wrong is corrected, not annotated). When a second repo needs the same note,
    move it to a shared home (a knowledge repo or a skill) and leave a link.
    **Template:** same reference, §Folder README.md templates.

24. **[SHOULD]** Route each finding by its **nature**, not by the event that produced it — one
    incident usually yields several pieces with different homes: knowledge that holds elsewhere
    → `note/`; a command the next person following the procedure will need → edit that step in
    `reference/` and link the note that explains it; a fact true only of specific systems →
    `reference/`; what happened on that day → the dated `plan/`, `debug/`, or `audit/` record;
    a reversal of an ADR-scope decision (principle 16) → a new ADR; a new term → the glossary;
    a follow-up → `BACKLOG.md`. **A lesson that changes how the work is done must change the
    procedure step itself** — a note without the procedure edit means the old way is repeated.
    Records and notes **link both ways**: the record links the note (what was learned), the
    note's `## Cases` links the record (where it was learned). **Routing table:** same
    reference, §Where a finding goes.

25. **[SHOULD]** Root `CONTEXT.md` declares the repo's **profile** — its primary kind of work —
    on a `Profile:` line (`dev`, `ops`, `life`, …; several may be listed, primary first). A profile file
    in [profiles/](profiles/README.md) maps the domain onto this skill: what each folder holds,
    which optional folders are expected, the sweep cadence, the ADR scope, and changelog and
    commit conventions. A profile may change what a folder **holds** and **when** things
    happen. Where the domain's work is organized by subject rather than by document lifecycle,
    a profile may also **map the folder set**: replace `spec/`, `plan/`, `debug/`, `audit/`, and
    the backlog's location with a domain layout (e.g. `areas/<area>/`), and name extra living
    files at the root. Its mapping table then assigns every replacement folder and file exactly
    one **lifecycle class** from the closed list in the profiles README, and that class's rules
    apply unchanged; `reference/`, `adr/`, `tmp/`, `memo/`, and `note/` are never mapped away.
    A profile never changes the lifecycle rules — dated ⇔ frozen, `Status:` values, indexes. A
    repo with no `Profile:` line is `dev`.

## Common Mistakes

- An agent instruction file that grows into a second, drifting copy of reference (violates 3).
- Writing the glossary after the code, so identifiers and docs disagree on names (violates 6).
- A reference doc keeping a "History" or "Previously" section of superseded designs (violates 5).
- Editing a shipped plan to "keep it current" instead of writing a new one (violates 8).
- Emoji-only status banners that cannot be grepped or compared (violates 9).
- Dating a plan by its ship date so the spec/plan slugs no longer pair (violates 10).
- Dating the living backlog (`plan/2026-09-09-open-follow-ups.md`), so it reads as a snapshot of
  that day, and the next sweep files its findings in a new dated record beside it instead of as
  rows in it (violates 10 and 19).
- A folder of debug scripts with no `.md` explaining what they reproduce (violates 11).
- Rewriting an ADR to match the new behavior instead of superseding it (violates 16).
- A new document committed without its folder `README.md` row, so the index lies (violates 2).
- Creating `docs/` folders only when the first document needs one, so the layout is retrofitted
  months in and every already-landed citation points at the old path (violates 2).
- A `CHANGELOG.md` that grows to thousands of lines because "there was no threshold to hit",
  or archiving the series the next tag belongs to and breaking the release gate (violates 18).
- Tracking open work across three frozen records and a footnote, so nothing can be ticked off
  (violates 19).
- `see foo.rs:412` in a reference document, pointing at an unrelated line a month later
  (violates 20).
- An audit that verifies every link and never checks whether a single claim is still true
  (violates 21).
- Deviating from a MUST principle with a commit-message note instead of an ADR (violates 15).
- A verification script and its conclusion left in `tmp/` so they never land, or a check that must
  be re-run every release parked in a frozen record directory (violates 14).
- Archiving or trashing `tmp/` without triage, so the one evaluation worth keeping goes into a
  tarball with the probes; or tarring a 600 MB `target/` directory into git history (violates 13).
- Flat, numbered scratch files (`q3.py` … `q9.py`, `dt.toml` … `dt5.toml`) with no task
  directory and no header comment, so the sweep cannot tell what any of them was for (violates 13).
- Trashing a `.git` copy or another backup in a sweep because it was 30 days old (violates 13).
- A conclusion written in gitignored scratch and reported as done, so it is lost at the next
  sweep (violates 14).
- An agent parking its session notes or run output in `memo/`, or citing a memo as proof of
  what the code does (violates 22).
- Writing a record in the conversation's language (e.g. Chinese) so glossary terms and greps no
  longer match the English docs around it (violates 4).
- An ADR per change of install command or tool, so three ADRs supersede each other within two
  weeks while the procedure itself is still being learned (violates 16).
- A `lessons-learned.md` that collects every incident's takeaways while the procedure that
  caused them stays unchanged (violates 23 and 24).
- A note dated by the event (`note/2026-11-18-patch-lessons.md`), or a note that is really a
  host-specific procedure (violates 23).
- A note with no `## Cases`, or a record that learned something and links no note, so neither
  can be traced from the other (violates 24).
- An operations repo forced into release-shaped rules — a tmp sweep "at each release" that never
  comes — because no profile was declared (violates 25).
- A subject-organized layout invented in one repo with a deviation ADR per principle, or a
  profile's mapped folder with no lifecycle class, so nobody knows which rules it follows
  (violates 25).
