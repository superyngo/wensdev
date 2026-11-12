# 0003 — The `docs` domain of `wens-dev-principles` becomes the `repo-docs` skill

Date: 2026-11-12

## Context

`wens-dev-principles` held six domains behind one description. The `docs` domain had outgrown
that arrangement on every measure taken on 2026-11-12:

- 666 lines, 28% of the skill, and the most frequently edited domain.
- No reference to any other domain, and one conceptual mention coming in (`debug` names "the
  backlog record").
- 40 of the 49 citations found in other repositories were `wens-dev-principles docs`, spread
  over 14 repos. The domain was already being used on its own.
- Its triggers (`CONTEXT.md`, ADR, changelog, backlog, spec/plan) share nothing with the UI
  triggers that lead the description, which sat at 533 of the 550 characters allowed and had
  the docs triggers in an "Also ..." clause.
- Its content is exact strings, templates, and procedures with checklists, under a router that
  says "principles, not code: apply the spirit", and under `allowed-tools: Read, Grep, Glob`
  although the procedures create files and run commands.

Those citations are the expensive part. They are written into ADRs, which are never edited, and
into frozen working records in repositories this one does not control.

## Decision

1. The two files of the `docs` domain move unchanged to `skills/repo-docs/references/`, behind a
   new model-invoked skill `repo-docs` with its own description and
   `allowed-tools: Read, Grep, Glob, Bash, Write, Edit`.
2. **No principle is renumbered by the move.** Principle 15 (a `MUST` deviation requires an ADR)
   stays at 15 even though it also governs `wens-dev-principles`; only its wording names both
   skills.
3. New citations are written `repo-docs <n>`. `wens-dev-principles docs <n>` is a **permanent
   alias** for the same number. Both skills state the alias. No citing document, here or in any
   other repository, is edited.
4. `repo-docs` carries its own compact grade table so that it reads standalone when installed
   alone (ADR 0001).

## Alternatives rejected

- **Keep one skill and reword its description.** The character limit leaves no room for the
  docs triggers, and the mismatch between a principles router and procedural content remains.
- **Split and rewrite every citation to the new name.** ADRs cannot be edited, and the other
  repositories would each need a change that buys nothing a stated alias does not.
- **Split and keep `wens-dev-principles docs <n>` as the only spelling.** Zero migration, but
  every new citation would name a skill that no longer holds the principle.
- **Move principle 15 into the `wens-dev-principles` grade table.** Correct by ownership, but it
  shifts 16-21 down by one and silently repoints existing external citations.

## Consequence

`wens-dev-principles` has five domains: `ui`, `cli`, `debug`, `perf`, `agents`. Renumbering
`repo-docs` remains permitted by its citation contract, but now has a known cost: every external
citation of a moved number goes stale. Command-shaped entry points and an idempotent skeleton
script for `repo-docs` are tracked in `docs/plan/BACKLOG.md`, not built here.

Design record: [`../spec/2026-11-12-repo-docs-skill.md`](../spec/2026-11-12-repo-docs-skill.md).
