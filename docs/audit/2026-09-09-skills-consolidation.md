# Skills consolidation audit
Status: Resolved (2026-09-09)

Point-in-time sweep of all 8 skills for duplication, boundary overlap, and self-compliance with
`wens-dev-principles docs`. Scope: 8 skills / 49 files / 1453 lines of `SKILL.md`.

Repro material: [`2026-09-09-skills-consolidation/check_structure.py`](2026-09-09-skills-consolidation/check_structure.py)
re-runs the structural checks that verified the fixes.

## Findings

| # | Sev | Finding |
|---|---|---|
| F1 | Critical | `github-init/SKILL.md:191-517` inlined a 326-line `release.yml` that `create-release-workflow` owns — and the copy was a *stale* one: no `verify-versions` gate, bare `sudo apt-get install` steps (the exact form the owner documents as silently hanging 10+ minutes on `ubuntu-latest`), no `.gitattributes` LF file despite `windows-latest` legs, `action-gh-release@v2` vs `@v1`, `checkout@v4` vs `@v5`. Every repo initialized with it inherited three already-diagnosed production failures. |
| F2 | High | `github-init` at 608 lines was 42% of all `SKILL.md` content, almost entirely that one YAML blob. A router carrying payload. |
| F3 | High | `dev-prompt` restated universal coding conduct that `CLAUDE.md` owns and that `wens-dev-principles/SKILL.md:12-14` explicitly disclaims — a third copy. Its mechanism (compose a prompt, print it, offer to save it) predates skills being the injection mechanism. Its language modules (`rust.md`: "run cargo fmt, avoid unwrap") carried no information the model lacks. Its `base.md` XDG section promised a platform table and contained none. |
| F4 | Medium | `github-init` and `git-release` each maintained an identical project-type detection table (`Cargo.toml`/`package.json`/`go.mod`/`pyproject.toml`) and its own git health check. |
| F5 | Medium | Only 3 cross-references existed repo-wide; 4 of 8 skills had no inbound link. Worst gap: `rust-crossplatform-app/references/packaging-release.md` covers the same store channels as `publishing-platform-stores` (13 store mentions) with neither aware of the other — a second incipient F1. |
| F6 | Medium | The repo violated 5 `MUST` principles of the docs layout its own skill defines: no root `CONTEXT.md` (docs 1), no `docs/` folder set (docs 2), no glossary (docs 5), an `adr/` with no README status table (docs 14), no ADR recording the deviation (docs 15). |
| F7 | Low | `allowed-tools` present on 3 of 8 skills; descriptions ranged 168–1053 characters, the longest being 3× the mean and permanently resident in context. |
| F8 | Low | `github-init` hardcoded `superyngo/`, `wenget`, and a specific installer gist ID into an otherwise generic skill. |

## Resolution

Consolidated 8 skills → 6.

- **F1, F2** — `github-init` now delegates to `create-release-workflow`; 608 → 294 lines, and the workflow has one owner.
- **F3** — `dev-prompt` removed (recoverable from commit `2b09f83`). Its two non-obvious rules survive as the new `cli` domain in `wens-dev-principles`, with the missing XDG platform table written out.
- **F4** — `github-init` + `git-release` merged into `git-workflow`: one shared pre-flight and detection table behind `init` / `gist` / `release` entry points.
- **F5** — cross-links added in both directions between the four isolated skills.
- **F6** — root `CONTEXT.md`, the full `docs/` folder set, `docs/reference/glossary.md`, and `docs/adr/README.md` created. The one intentional deviation (skill-local `CONTEXT.md`/ADRs) is recorded in [ADR 0001](../adr/0001-skills-carry-their-own-docs-payload.md).
- **F7** — every skill has `allowed-tools`; the 1053-char description trimmed to 476.

## Not addressed

- **F8** — the personal identity hardcoded in what is now `git-workflow` is acceptable in a personal repo, but undocumented. Left as-is deliberately.
- No `LICENSE` at the repo root, which `wens-dev-principles docs 1` lists among the permitted root files.
- `CHANGELOG.md` uses `## Unreleased Update` (per `CLAUDE.md`) while the skills generate and parse `## [Unreleased]`. The two conventions disagree; neither was changed, because each is correct for its own authority. Worth reconciling.
