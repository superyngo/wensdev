# repo-docs skill
Status: Shipped (2026-11-12)

## Goal

Give repository documentation layout its own skill, so it triggers on documentation work in any
repo instead of riding on a description led by UI triggers, and so its procedures sit under a
router and tool set that match them.

## Decisions

| # | Question | Decision | Rejected alternative and why |
|---|---|---|---|
| 1 | Split or keep | New skill | Reword the shared description: at 533 of 550 characters there is no room for the docs triggers |
| 2 | Name | `repo-docs` | `docs-layout`: narrower than the content, which also covers lifecycle, backlog, and audits |
| 3 | Content | Pure move of both files; only principle 15's wording changes | Rewriting during the move: mixes a relocation with a revision and makes the diff unreviewable |
| 4 | Numbering | Unchanged | Dropping or moving principle 15: shifts 16-21 and repoints external citations |
| 5 | Citations | New: `repo-docs <n>`; `wens-dev-principles docs <n>` is a permanent alias | Rewriting citations: ADRs are never edited, and 14 other repos carry them |
| 6 | Grades | Compact table restated in `repo-docs` | Pointer to `wens-dev-principles`: the skill must read standalone (ADR 0001) |
| 7 | `allowed-tools` | `Read, Grep, Glob, Bash, Write, Edit` | `Read, Grep, Glob`: the procedures create files and run `rg` and `tar` |
| 8 | Router shape | A task-to-principle table and a procedures table | A bare link to the principle list: the reader would load 21 principles to find one |

## Scope (this change)

- `skills/repo-docs/`: `SKILL.md` router plus `references/principles.md` and
  `references/layout-and-lifecycle.md`, moved from `skills/wens-dev-principles/references/docs/`.
- `skills/wens-dev-principles/SKILL.md`: description, Overview, grade table, Domains, and Citation
  Contract updated; Docs Deep References removed.
- `skills/git-workflow/SKILL.md`: the init pointer names `repo-docs`.
- `CONTEXT.md`, `README.md`, glossary `Domain` entry, ADR 0003.

## Later phases (tracked in `docs/plan/BACKLOG.md`)

- Command-shaped entry points (`init`, `audit`, `archive`) and the idempotent skeleton script
  that §Repo initialization asks for.

## References

- [ADR 0003](../adr/0003-docs-domain-becomes-the-repo-docs-skill.md), with the measurements
  behind the decision.
