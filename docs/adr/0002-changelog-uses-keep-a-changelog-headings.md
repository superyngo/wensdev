# 0002 — `CHANGELOG.md` uses `## [Unreleased]`, not `## Unreleased Update`

Date: 2026-09-09

## Context

Two conventions for the same heading were in force at once.

- The global agent instruction file (`~/.claude/CLAUDE.md`) says: *append an `Unreleased Update`
  entry to `CHANGELOG.md`*. This repo's own `CHANGELOG.md` followed it.
- Two skills in this repo depend on the Keep a Changelog form. `git-workflow` generates
  `## [Unreleased]` in every new project's skeleton and, in Release mode, converts it into
  `## [vX.Y.Z] - YYYY-MM-DD`. `create-release-workflow`'s `verify-versions` CI gate then greps
  for that `## [vX.Y.Z]` heading and **fails the release build** when it is absent.

So this repo shipped skills that write one format while its own changelog used another. A
release cut by its own `git-workflow` skill would not have found a heading to convert.

## Decision

`## [Unreleased]` — the Keep a Changelog form — everywhere, including this repo's own
`CHANGELOG.md`. Dated entries under it use `### YYYY-MM-DD` sub-headings so the prose
convention (one dated bullet group per landed task) survives the format change.

The deciding factor is that only one of the two conventions is machine-read. `## [Unreleased]`
participates in a pipeline: skeleton generation → release-time conversion → CI gate → GitHub
Release notes. `## Unreleased Update` is prose that nothing parses. When a human convention and
a tooling contract collide, the tooling contract wins, because breaking it fails a build at the
least recoverable moment — mid-release, after the tag is already pushed.

`~/.claude/CLAUDE.md` is a user-global file outside this repository and was not modified; it
governs repos that have no changelog tooling, where its form is perfectly adequate. Inside a
repo whose release path greps the heading, this ADR is the local override.

## Alternatives rejected

- **Keep `## Unreleased Update` here and leave the skills alone.** Preserves the observed
  inconsistency, and specifically leaves this repo unable to be released by its own skill.
- **Change the skills to emit `## Unreleased Update`.** Would require rewriting the
  `verify-versions` gate, abandoning a de-facto ecosystem standard that changelog parsers and
  release-note generators already understand, and would break every project already
  initialized by `github-init`/`git-workflow`.
- **Accept both forms in the tooling.** Two accepted spellings is how a format drifts into
  having no format; the gate's value is that it is exact.

## Consequence

`CHANGELOG.md` was converted in the same commit as this ADR. New entries go under
`## [Unreleased]` as `### YYYY-MM-DD` groups. `docs/reference/skill-anatomy.md` is unaffected;
the convention is recorded in the glossary entry for **Working record**'s sibling term
**Changelog entry**.
