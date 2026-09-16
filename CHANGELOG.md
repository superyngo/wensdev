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
