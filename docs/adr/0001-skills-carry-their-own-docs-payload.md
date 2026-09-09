# 0001 — Skills carry their own `CONTEXT.md` and ADRs

Date: 2026-09-09

## Context

`wens-dev-principles docs 1` and `docs 2` require a repo to keep a root `CONTEXT.md` and a
single `docs/` folder set, with all documentation under it. This repo now has both.

That created a question for `publishing-platform-stores`, which already carried its own
`CONTEXT.md` (a glossary of Store / Channel / Publish / Submit / Release / Extension) and its
own `docs/adr/0001`, `docs/adr/0002` (why the publish gate is shared, and when to split it per
store). Read literally, `docs 1` says those should move to the repo root.

## Decision

They stay inside the skill. A skill is a unit of installation: it can be installed alone,
without this repo. Its glossary defines the vocabulary its own `SKILL.md` and references use,
and its ADRs explain the architecture it *teaches a consumer to build* — both are payload, and
payload that does not travel with the skill is payload that breaks. `SKILL.md` also links those
ADRs by relative path; hoisting them would leave dangling links in every standalone install.

Repo-root `docs/` is therefore scoped to decisions about *this repo* — how skills are shaped,
consolidated, and released — and `CONTEXT.md` points at the skill-local documents rather than
absorbing them.

## Alternatives rejected

- **Hoist everything to root `docs/`.** Literal compliance with `docs 1`, but breaks standalone
  installation and the existing relative links, and mixes "why this repo is organized this way"
  with "why the pattern this skill teaches has this shape" — two different audiences.
- **Duplicate: keep a copy in both places.** Guarantees drift, which is the exact failure this
  consolidation was undertaken to remove.
- **Forbid skill-local docs; inline the glossary into `SKILL.md`.** Inflates the router with
  payload, violating the same principle that motivated stripping `github-init`.

## Consequence

This is a deliberate deviation from `wens-dev-principles docs 1`, recorded here as `docs 15`
requires. The rule as applied: **repo-level documentation lives in root `docs/`; a skill's own
payload lives in the skill.** `docs/reference/skill-anatomy.md` states the resulting file
layout.
