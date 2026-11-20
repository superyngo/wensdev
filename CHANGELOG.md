# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### 2026-09-02

- Initial migration of `wens-dev-principles`, `vscode-dev-experience-pack`,
  `rust-crossplatform-app`, `publishing-platform-stores`, `github-init`, `dev-prompt`,
  `create-release-workflow`, and `git-release` from `wenskills` into this new bundled
  skills repo. Content unchanged in this migration.

### 2026-09-09

- Removed the 326-line `release.yml` embedded in `github-init`, which duplicated
  `create-release-workflow` in a stale form (no `verify-versions` gate, bare `apt-get` steps,
  no `.gitattributes`); it now delegates. Added the missing cross-references between
  `rust-crossplatform-app`, `publishing-platform-stores`, `create-release-workflow`, and
  `vscode-dev-experience-pack`. Gave every skill an `allowed-tools` line and trimmed
  `wens-dev-principles`'s 1053-char description.
- Consolidated 8 skills into 6. Removed `dev-prompt`, whose universal coding
  conduct duplicated `CLAUDE.md` and whose language modules carried near-zero information;
  its two non-obvious rules survive as a new `cli` domain in `wens-dev-principles`
  (argument degradation, XDG file placement — the latter's platform table, empty in the
  original, is now written out). Merged `github-init` and `git-release` into `git-workflow`,
  collapsing their duplicate project-type detection tables and git pre-flight checks into
  one shared section behind `init` / `gist` / `release` entry points.
- Brought the repo into compliance with the documentation layout its own
  `wens-dev-principles docs` domain defines: root `CONTEXT.md`, the seven-folder `docs/` set
  with indexing `README.md`s, `docs/reference/glossary.md`, `docs/reference/skill-anatomy.md`,
  and `docs/adr/README.md`. Recorded the one deliberate deviation — skills keep their own
  `CONTEXT.md` and ADRs so they stay installable standalone — as ADR 0001, and gave
  `publishing-platform-stores`'s own ADR folder the status table it was missing. Landed the
  audit as `docs/audit/2026-09-09-skills-consolidation.md` with a re-runnable
  `check_structure.py` that verifies frontmatter, description budget, link integrity, and
  absence of stale skill references. Updated `README.md` and `.claude-plugin/plugin.json`.
- Added the repo's missing `LICENSE` (MIT), and removed the hardcoded `wen` copyright-holder
  fallback from `git-workflow`'s LICENSE generation — the holder now resolves
  `git config user.name` → `gh api user --jq .login` → ask.
- Adopted `## [Unreleased]` with `### YYYY-MM-DD` groups in this repo's own `CHANGELOG.md`,
  resolving the conflict between the global instruction file's `## Unreleased Update` prose
  form and the Keep a Changelog form that `git-workflow` writes and `create-release-workflow`'s
  `verify-versions` CI gate greps for. Recorded as ADR 0002: this repo could not previously
  have been released by its own skill.
- Harvested a full remediation wave from the `confy` repo (15 findings, F1–F15, plus two
  documentation audits) into the skills. `wens-dev-principles` gains two domains: `debug`
  (10 principles — reproduce on the real artifact, re-measure a filed cause before
  implementing its fix, choose an instrument that can move, fix divergence in the shared layer
  behind a parity test, record-don't-bundle) with a `case-library.md` of ten shipped bug
  classes; and `perf` (11 principles — phase-profile before touching code, name the degrading
  axis, remove the expensive context rather than rewrite, revert what measures flat, report
  the regression) with a `measurement-playbook.md` covering the bench harness, the
  live-handle-index quadratic trap, tree memory multipliers, and a perf-report template.
- Extended three existing domains with the same wave's lessons: `docs` 16–19 (changelog
  archiving to `docs/reference/changelog/`, the one living backlog record as the sole
  exception to freeze-on-landing, symbol-not-`file:line` citations, the two-pass documentation
  audit) with templates and checklists in `layout-and-lifecycle.md`; `cli` 3 (a session-only
  override for ambient config, pinned in every test that asserts user-visible text);
  and `rust-crossplatform-app` (two-orchestrator web hosts, per-host CSS palettes,
  Tauri `dragDropEnabled: false` for HTML5 drag, CSP versus inline boot scripts, the
  construct-boundary module split, and a cross-implementation parity testing gate).
- Integrated the three `wenswiki/almanac` dev-pitfall entries. New `agents` domain in
  `wens-dev-principles` (4 principles): agent file tools resolve a relative path against the
  session's root checkout, not a subagent's shell `cwd`, so any multi-checkout workspace
  requires absolute paths, read-back verification of every write, and controller audits of the
  checkout nobody is working in. The two web-UI entries land as `ui` pointer-gotchas 18–19 (own
  an inline control's commit/abandon race with an intent flag — a self-triggered re-render can
  fire `blur` with `document.contains(el)` still true; and give the editing state its own class
  so the cell's truncation CSS stops clipping the live control) plus debug case classes 11–12
  (ordering assumed instead of observed; the failing layer is the container, not the leaf) and
  debug principle 11.

### 2026-09-16

- Folded confy's v1.3.x experience into the skills. `wens-dev-principles`:
  `ui/scrollable-list-viewport.md` gains a "preserving scroll across view swaps" section (hide
  the scroller, not its content; never `scrollIntoView` per render; scroll the element that is
  actually the scrollport; Gecko-only caret scrolling); `debug` principle **12** requires
  verifying a platform-behavior bug on every engine shipped to, with case-library class **13**
  as its worked example; `perf` principles **12** and **13** require benchmarking the fallback
  branch the headline capability takes and falsifying a time-ceiling test, with the per-item
  whole-document-query trap and its measured table added to `perf/measurement-playbook.md`.
- `publishing-platform-stores`: `desktop-microsoft-store.md` documents shipping a CLI/TUI inside
  the GUI's MSIX as an up-front manifest decision (`AppExecutionAlias` launches its parent
  `<Application>`'s executable; `Application/@Id` is alphanumeric-only; `AppListEntry="none"`
  makes it a Store-rejected headless app) plus the per-release `ReleaseNotes` listing CSV.
  `rust-crossplatform-app` points at it from its desktop packaging section.

### 2026-09-17

- `wens-dev-principles` docs domain: new principle **20** homes assessment and verification
  records in `docs/audit/` (the test is "will anyone cite or re-run this later?" — yes goes to
  `audit/` with a `Status:` line, no stays in `docs/tmp/`), makes a subtype prefix after the date
  optional, and rules that a regression check re-run every release is repo tooling rather than a
  frozen record directory. Principle **12** now carves `docs/tmp/<agent>-scratch/` out as a
  gitignored subpath while the rest of `tmp/` stays committed and tarball-archived, resolving the
  contradiction with the agent instruction file. `layout-and-lifecycle.md` follows in the
  directory tree, the `CONTEXT.md` and folder-README templates, the script-directory checklist,
  and the archiving rule. No folder renames and no MUST semantics changed, so no ADR is required.

### 2026-09-18

- **Corrected a wrong rule that had cost confy four Store-blocking defects.**
  `publishing-platform-stores` → `desktop-microsoft-store.md` said an MSIX
  `AppExecutionAlias` must sit on an `<Application>` node whose `Executable` *is* the console
  binary, making a CLI-in-the-GUI-package cost a second node — which is then a dead end both
  ways (visible: a Start-menu tile a CLI requiring arguments cannot serve; hidden via
  `AppListEntry="none"`: the Store rejects the whole package as a headless app, the check
  being per-`<Application>`, so a visible GUI sibling does not exempt it). The alias target is
  actually settable on the extension: `uap3:Extension` takes optional `Executable` /
  `EntryPoint`, so **one** node suffices — verified on real Windows (confy 2026-09-18:
  `makeappx pack` accepts it, `mytool --help` prints the TUI usage, one Start-menu entry, file
  associations intact). The section now leads with that shape and keeps the four defects as
  the trap list, adds the PATH-shadowing gotcha (a winget/scoop copy of the same binary
  precedes `…\WindowsApps`, which is how a broken alias survives weeks of "works for me"),
  and confines the `HeadlessAppBypass` waiver request procedure (storeops email, then the
  Business-support category that actually exists) to the pure-CLI case that genuinely needs
  it. `rust-crossplatform-app` → `packaging-release.md`'s one-line cross-reference carried the
  same wrong claim and now states the attribute.

### 2026-09-29

- Prompt-audit fixes across the skills:
  - `wens-dev-principles` docs: the status audit used `rg -L`, which is ripgrep's `--follow`,
    not "files without match", and its shell glob errors on the empty folders a fresh repo
    has. Now `rg --files-without-match … --max-depth 1 -g '*.md' -g '!README.md'`; the init
    checklist expects it to print nothing.
  - `Resolved` is allowed on `plan/BACKLOG.md` (principle 8 and the status table now agree
    with the backlog section); the pass-1 checklist names folder `README.md`s as undated too.
  - `rust-crossplatform-app`: the router lists all seven testing gates instead of "five".
  - `git-workflow` Init points at `wens-dev-principles` docs §Repo initialization for the
    `docs/` layout.
  - `vscode-dev-experience-pack`: dropped the generic "Git Safety" commands section.
- Resolved the audit's open decisions:
  - `publishing-platform-stores` VS Marketplace/Open VSX workflow now follows the skill's own
    rule: a `ref` input (defaults to `tag`) for checkout, plus an optional unused `run_id` so
    the gate's single `-f run_id` dispatch line is accepted; checklist step 5 says the same.
  - ADR 0002 (selective publish gate) status: accepted — running in production.
  - `create-release-workflow`: `aarch64-pc-windows-msvc` added as an optional target;
    `packaging-release.md` marks Windows arm64 optional. Release action pinned to
    `softprops/action-gh-release@v3` (Node 24; v1 ran on Node 16).
  - Mac App Store reference uploads with `xcrun iTMSTransporter` and installs the API key as
    `~/.appstoreconnect/private_keys/AuthKey_<KEY_ID>.p8`; the unused `notarytool
    store-credentials` step and the `altool` upload are gone.
  - `git-workflow` R.5.3 moves the existing `[Unreleased]` body verbatim under the new version
    heading, drafting from commits only when it is empty.

### 2026-10-01

- `wens-dev-principles` docs domain: added principle 4 (documents are written in English) and
  renumbered the 21 principles by section (1, 2, 15 unchanged); updated all in-skill references.
  Numbers are no longer frozen, and the skill's own maintenance is exempt from its ADR rules.

### 2026-10-12

- Added the `tui-components` skill: ratatui 0.30 component specs for menu/dropdown/context
  menu, modal/dialog/confirm, toggle tree, and sidebar list navigation, each with state,
  geometry, render, input, edge cases, and acceptance; shared contracts (frame hit map, overlay
  stack, keymap, mouse, geometry safety, display width, theme roles, persistence by id); a
  catalog mapping the web UI vocabulary to terminal equivalents; and an ecosystem catalog of
  crates checked against ratatui 0.30, with herdr as the reference application. Every Rust
  snippet compiles and is unit-tested against ratatui 0.30. Design record:
  `docs/spec/2026-10-12-tui-components-skill.md`; later phases tracked in the new
  `docs/plan/BACKLOG.md`.
- `wens-dev-principles docs 4` now also covers skills: English throughout, except passages in
  guidance whose subject is a specific language (e.g. Chinese typesetting), which may use that
  language where needed.

### 2026-10-13

- skill(tui-components): add `split-panes.md` (split tree, one-cell shared dividers, drag-to-resize,
  preset layouts with identity-preserving re-tiling) and contract C11 "Drag sessions". Fix the
  hit-map push order in `menu-dropdown.md`/`modal-dialog.md`: the body went last, which shadowed
  every row under last-wins hit testing; it now goes first. Add a target → menu example and the
  pty/SGR-mouse real-artifact test row. Worked out on the `wens-tui-lab` demo.
- skill(tui-components): add `floating-windows.md` (z-order as Vec order, move/resize drag
  sessions, hidden snap grid shown during drag, edge snap, maximize/restore, taskbar in creation
  order, per-target right-click menus) and catalog rows for floating windows and the taskbar.
  Note the pyte orphan-cell caveat in contracts C10.

### 2026-10-14

- skill(tui-components): link the worked-demo references to the public
  [wens-tui-lab](https://github.com/superyngo/wens-tui-lab) repo, and list it under SKILL.md References.
- skill(tui-components): touch targets must be at least 2 rows × 5 columns (contracts C12), from
  on-device feedback: cell-exact taps don't make 1-row targets finger-friendly. Mobile shell app
  bar, tab bar (icon over label) and snackbar become 2 rows; bottom sheet grabber, items and
  Cancel become 2 rows, and the half detent grows to 2/3 of the height so an action sheet still
  fits with the keyboard open. Acceptance adds a hit-map size test.
- skill(tui-components): add mobile view specs: `mobile-shell.md` (width breakpoint, app bar,
  stack navigation, bottom tab bar, FAB, snackbar with undo instead of confirm, damped wheel,
  pull-to-refresh, tick loop), `bottom-sheet.md` (scrim, grabber detent, 2-row destructive items)
  and `swipe-actions.md` (tap/key/drag paths to one reveal state). New contract C12 Touch input
  (Termux gesture table, act-on-release, soft-keyboard reflow). Catalog: FAB, swipe actions, pull
  to refresh, bottom sheet, snackbar, bottom navigation and app bar. Contracts C10 now says pyte
  orphan cells are an emulator artifact. Worked out on `wens-tui-lab`.

### 2026-11-03

- skill(ui-design): add a design-first static mock-up skill (TSX + Tailwind v4 → script-free
  HTML, reviewed before app code), adapted from OpenCut's `ui-design`. Adds what that version
  left unenforced: role-named tokens for text sizes, radii and shadows (not just colours) with a
  literal-value audit, a GPUI-mappable CSS subset with margin notes for the rest, TypeScript rules
  (`deno task check` before build, state unions, `ColorToken` props, `on*`/`className` as type
  errors), a fixed-width screenshot task, and a Tailwind → GPUI/web handoff. Ships a runnable
  `scripts/scaffold/`.

### 2026-11-12

- skill(repo-docs): split the `docs` domain out of `wens-dev-principles` into its own skill.
  Both reference files move unchanged to `skills/repo-docs/references/`; no principle is
  renumbered. New citations are written `repo-docs <n>`, and `wens-dev-principles docs <n>` is a
  permanent alias, so no citing document changes. The new router maps tasks to principles and
  lists the procedures (repo init, changelog and tmp archiving, status audit, documentation
  audit). `wens-dev-principles` drops the docs triggers from its description and now has five
  domains; `git-workflow` init points at `repo-docs`. Decision: ADR 0003; design record:
  `docs/spec/2026-11-12-repo-docs-skill.md`. Follow-ups T4-T6 in `docs/plan/BACKLOG.md`.
- skill(repo-docs): replace "archive `tmp/` when stale" with a sweep procedure run at each
  release. Principle 13 keeps its number and grade; §Archiving tmp/ becomes §Sweeping tmp/:
  inventory, classify (Promote / Regenerable / Stale / Live), report and wait for approval every
  time, then archive tracked files and move untracked files and build output to the OS trash,
  never `rm`. `git-workflow` release offers the sweep as its last step. Measured across 19
  repos: 1817 MB of `docs/tmp/`, 93% build output, 5 repos ever archived. Follow-up T7 in
  `docs/plan/BACKLOG.md`.
- skill(repo-docs): add `docs/memo/`, a free space for people, as principle 22 (`CONSIDER`,
  appended; no number moves). Any filename, structure, or language; no `Status:`, no freeze, no
  required index. Not canonical, and agents edit it only on request. Principle 2 becomes "these
  seven, plus `memo/` where used"; principle 4 exempts it from English; the `tmp/` sweep can
  promote into it; new repos get `docs/memo/README.md` at init. This repo adds its own
  `docs/memo/`. Decision: ADR 0004.

### 2026-11-18

- Added the `slow-down` skill: early-stage ideation at the user's thinking pace, one move per
  turn (Lead / Offer / Space), a parking lot for foreseen issues, and a Decided / Still open /
  Parking lot recap on hand-off. Listed in `CONTEXT.md`, `README.md`, and `plugin.json`.

### 2026-11-19

- skill(repo-docs): add profiles, `docs/note/`, finding routing, and an ADR scope test, derived
  from an operations repo built on the skill. New principles 23 (`note/`: living, topic-named
  knowledge, `## Cases` back-links, no lessons-learned catch-all), 24 (route each finding by its
  nature; a lesson edits the procedure step itself), and 25 (`Profile:` line in `CONTEXT.md`).
  Principle 2 admits optional `note/`; 13 sweeps at the profile's cadence when there are no
  releases; 16 limits ADRs to decisions expensive to reverse and meant to stay fixed — never
  procedures, and in development weighed by stage and room to switch. New
  `references/profiles/` (contract, `dev.md`, `ops.md`) and layout sections §Where a finding
  goes and §ADR scope. No existing number moves. See ADR 0005.
- skill(repo-docs): give agent scratch a shape and an exit. Principle 13: one dated directory
  per task under `docs/tmp/<agent>-scratch/`, each script opening with its purpose and how to
  run it; clones, mirrors, downloaded pages, and `__pycache__/` count as regenerable; backups
  (a `.git` copy, `*.orig`, `*-backup*`) are never stale by age. Principle 14: the agent that
  made the scratch triages it at task end, before reporting done. New layout section §Scratch
  shape and task end; §Sweeping tmp/ gains a Backup class. Measured across 18 repos: flat
  numbered files (`q3.py` … `q9.py`) that cannot be triaged, and 12 conclusions left in
  gitignored scratch in 6 repos. Grades and numbers unchanged.
- skill(repo-docs): add the `life` profile and let a profile map the folder set. Principle 25:
  a profile may replace `spec/`, `plan/`, `debug/`, `audit/`, and the backlog's location with a
  subject-organized layout (e.g. `areas/<area>/`) and name extra root files, provided its
  mapping table gives each one exactly one lifecycle class from the closed list in
  `profiles/README.md`. Principles 1, 2, and 19 defer to that mapping. New classes: event log
  (dated, frozen on write, no `Status:`), capture queue, outside git. New `profiles/life.md`,
  built from `~/life`: areas with living README and BACKLOG, event logs, decisions, and
  out-of-git files; root `NOW.md` and `INBOX.md`; a weekly NOW rewrite triggered when
  `Week of` is over 7 days old; cross-cutting checks in an area of their own; other repos'
  systems indexed only. See ADR 0006.
- docs(plan): backlog T8 (ADR index is missing 0005) and T9 (`~/life` adopts the `life` profile).
- docs(adr): index ADR 0005 in `docs/adr/README.md` (backlog T8).
- docs(plan): close backlog T7 (`.gitignore` already ignores scratch) and T9 (`~/life` adopted the `life` profile).

### 2026-11-20

- docs: align with repo-docs rules — `Profile: dev` in `CONTEXT.md`; audit 2026-09-09 line 2
  trimmed to the bare `Status: Resolved (2026-09-09)`, its follow-up note moved to the
  `docs/audit/README.md` row note; `docs/plan/README.md` carries the template's BACKLOG line;
  `publishing-platform-stores` ADR index statuses dated (`Implemented (YYYY-MM-DD)`).
- docs: repo-docs wave B — BACKLOG gains `Pending verification` and `Awaiting external`
  sections, T6 closed (both skills linked since 2026-11-12), T8 cites its hash; the structure
  check is copied to `scripts/check_structure.py` (skips `docs/tmp/`) and `reference/` points
  at it; `CONTEXT.md` sets a monthly tmp-sweep cadence and lists BACKLOG in the reading order;
  CHANGELOG day headings reordered; plugin description names `repo-docs`.
