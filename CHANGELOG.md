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
