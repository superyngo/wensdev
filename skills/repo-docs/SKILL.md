---
name: repo-docs
description: Repository documentation layout and lifecycle, for dev, ops (maintenance), and life (personal base) repos. Use when creating, moving, indexing, or auditing a repo's documents — CONTEXT.md, the docs/ folder set, glossary, ADRs and when not to write one, specs, plans, debug and audit records, Status lines, BACKLOG.md, CHANGELOG, docs/tmp, docs/memo, docs/note topic knowledge — when initializing a repo's docs skeleton, and when deciding where a finding, lesson, decision, or follow-up goes.
allowed-tools: Read, Grep, Glob, Bash, Write, Edit
---

# Repository Documentation

Where a repository's documents live, which of them is the source of truth, and when a document
freezes. The rules are **exact**: folder names, filenames, `Status:` values, and entry formats
are fixed strings that tooling and other documents grep for, so copy them rather than adapting
them.

This file is a router. The 25 principles are in
[references/principles.md](references/principles.md); templates, commands, and checklists are in
[references/layout-and-lifecycle.md](references/layout-and-lifecycle.md); what each folder holds
in a given kind of repo is in [references/profiles/](references/profiles/README.md).

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
| Decide where a document, finding, lesson, or follow-up goes | 1, 2, 5, 14, 19, 23, 24 | §Directory tree, §Where a finding goes |
| Write or edit `CONTEXT.md`, a folder `README.md`, or the agent instruction file | 1, 2, 3, 12 | §Root CONTEXT.md template, §Folder README.md templates |
| Add a term or a reference document | 5, 6, 7, 20 | §Glossary entry |
| Write a spec, plan, debug note, or audit record | 8, 9, 10, 11, 14 | §Status line, §Script directories |
| Record or revisit a decision, or decide whether it needs an ADR at all | 15, 16, 17 | §ADR scope, §Folder README.md templates (`docs/adr/README.md`) |
| Track open work | 19 | §Living backlog record |
| Choose the language of a document | 4 | — |
| Write scratch, finish a task that wrote scratch, or clean `docs/tmp/` | 13, 14 | §Scratch shape and task end, §Sweeping tmp/ |
| Read, write, or tidy `docs/memo/` (the human's notes) | 22 | §Folder README.md templates (`docs/memo/README.md`) |
| Write general knowledge (tool or platform behavior, gotchas) in `docs/note/` | 23, 24 | §Folder README.md templates (`docs/note/README.md`) |
| Set up docs for a non-software repo (operations, a personal life base, others), or adapt a rule to the repo's domain | 25 | `profiles/` |

## Profiles

The principles are domain-neutral; a profile says what each folder holds, the cadences, and the
ADR scope for one kind of repo, and may map the folder set through lifecycle classes
(principle 25). A repo declares it on a `Profile:` line in
`CONTEXT.md`; none means `dev`. To add one, follow the contract in
[references/profiles/README.md](references/profiles/README.md) and add a row here.

| Profile | Applies when | File |
|---|---|---|
| `dev` | Ships software: code, releases, versions | [references/profiles/dev.md](references/profiles/dev.md) |
| `ops` | Runs existing systems: hosts, patches, compliance; no releases | [references/profiles/ops.md](references/profiles/ops.md) |
| `life` | A person's base organized by subject (`areas/`), agent as assistant; maps the folder set | [references/profiles/life.md](references/profiles/life.md) |

## Procedures

Each is a sequence with its own checklist; the procedure is done when every box in that
checklist is ticked.

| Procedure | Reference section |
|---|---|
| Initialize a new repo's documentation skeleton | §Repo initialization |
| Archive a completed changelog series | §Changelog archiving |
| Triage a task's own scratch before reporting done | §Scratch shape and task end |
| Sweep `docs/tmp/` at a release (or the profile's cadence): triage, then archive or trash with approval | §Sweeping tmp/ |
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
