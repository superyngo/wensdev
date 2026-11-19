# Profile: dev

## Applies when

The repo ships software: there is code, a build, and releases or versions. This is the default
profile and the one the core principles' examples are written for.

## What each folder holds

| Folder | Holds |
|---|---|
| `reference/` | Current behavior: the glossary and one contract per subsystem or surface |
| `spec/` | Design written before implementation |
| `plan/` | Task-by-task implementation plans derived from a spec, plus `BACKLOG.md` |
| `debug/` | Investigation handoffs with repro scripts |
| `audit/` | Sweeps (bugs, dead code, inconsistency) and verification runs |

## Optional folders

- `note/`: when toolchain, platform, or library behavior keeps being rediscovered, e.g. a
  cross-compile gotcha or an OS-specific API quirk.
- `memo/`: when a person wants it (principle 22).

## Cadences

- tmp sweep: at each release, after the release is cut (principle 13).
- Changelog archiving: on the first release of a new major series (principle 18).

## ADR scope

Weigh the stage and the room left to switch, using the stage table in
[../layout-and-lifecycle.md](../layout-and-lifecycle.md) §ADR scope.

- **Procedure, never an ADR:** build commands, CI step order, lint and formatter settings,
  dev-tool choice, a workaround for a dependency bug.
- **ADR-worthy:** stack and core dependencies once other code builds on them, persisted data
  formats, public APIs and CLI contracts, security boundaries, and the doc system.

## Changelog and commits

Core rules apply: `[Unreleased]` plus the current series, released under
`## [vX.Y.Z] - YYYY-MM-DD`. Commit prefixes follow Conventional Commits (`feat:`, `fix:`,
`docs:`).

## Common mistakes

- An ADR for a library picked during a prototype week, superseded the next week (violates 16).
- Toolchain gotchas written into the tail of a debug record, so the next contributor finds them
  only by hitting the same bug (violates 23).
