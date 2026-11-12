---
name: repo-docs
description: Repository documentation layout and lifecycle. Use when creating, moving, renaming, indexing, or auditing a repo's documents — CONTEXT.md, the docs/ folder set, glossary, ADRs, specs and plans, debug and audit records, Status lines, BACKLOG.md, CHANGELOG archiving, docs/tmp scratch — when initializing a new repo's docs skeleton, and when deciding where a finding, decision, or follow-up should be written down.
allowed-tools: Read, Grep, Glob, Bash, Write, Edit
---

# Repository Documentation

Where a repository's documents live, which of them is the source of truth, and when a document
freezes. The rules are **exact**: folder names, filenames, `Status:` values, and entry formats
are fixed strings that tooling and other documents grep for, so copy them rather than adapting
them.

This file is a router. The 21 principles are in
[references/principles.md](references/principles.md); templates, commands, and checklists are in
[references/layout-and-lifecycle.md](references/layout-and-lifecycle.md).

## Grades

Each principle is tagged `**[MUST]**`, `**[SHOULD]**`, or `**[CONSIDER]**` after its number.

| Grade | Meaning | Deviating |
|---|---|---|
| `MUST` | Violating it is a bug. | Record an ADR (principle 15). |
| `SHOULD` | Default behavior. | One-line reason in the commit body. |
| `CONSIDER` | Adopt where it fits. | No justification needed. |

The grades govern the repos that use this skill, not the maintenance of the skill itself.

## Find the rule

| You are about to | Principles | Template or checklist in `layout-and-lifecycle.md` |
|---|---|---|
| Decide where a document, finding, or follow-up goes | 1, 2, 5, 14, 19 | §Directory tree |
| Write or edit `CONTEXT.md`, a folder `README.md`, or the agent instruction file | 1, 2, 3, 12 | §Root CONTEXT.md template, §Folder README.md templates |
| Add a term or a reference document | 5, 6, 7, 20 | §Glossary entry |
| Write a spec, plan, debug note, or audit record | 8, 9, 10, 11, 14 | §Status line, §Script directories |
| Record or revisit a decision | 15, 16, 17 | §Folder README.md templates (`docs/adr/README.md`) |
| Track open work | 19 | §Living backlog record |
| Choose the language of a document | 4 | — |
| Use or clean `docs/tmp/` | 13 | §Archiving tmp/ |

## Procedures

Each is a sequence with its own checklist; the procedure is done when every box in that
checklist is ticked.

| Procedure | Reference section |
|---|---|
| Initialize a new repo's documentation skeleton | §Repo initialization |
| Archive a completed changelog series | §Changelog archiving |
| Archive stale scratch | §Archiving tmp/ |
| Find working records with a missing `Status:` line | §Status line |
| Audit living documents against the code (structure pass, then accuracy pass) | §Documentation audit |

## Citation Contract

Cite a principle as `repo-docs <n>` (e.g. `repo-docs 8`) in ADRs, specs, and code comments.
`wens-dev-principles docs <n>` is the former spelling, from when these principles were the
`docs` domain of that skill; it is a permanent alias for the same number, so documents that
already carry it are left as they are. Numbers are ordered by section and may be renumbered to
keep the list organized; when you do, update every reference inside this skill (index,
`(violates N)`, the tables above) in the same change.

## Related skills

- `wens-dev-principles` owns the UI, CLI, debug, perf, and multi-agent principles. A `MUST`
  deviation there is recorded as an ADR under this skill's principles 15–17.
- `git-workflow` generates the root skeleton files (`README.md`, `CHANGELOG.md`, `LICENSE`) at
  repo init; this skill owns the `docs/` layout laid down in the same init.
