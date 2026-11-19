# Profile: ops

## Applies when

The repo exists to run existing systems: hosts, services, accounts, patches, compliance. It
holds what the systems are, how they are operated, and what was done to them. It has no build
and no releases, and work happens in maintenance windows and on other people's schedules.
Compared with `dev`: there are no versions, the procedures change as the systems teach you, and
much of the work waits on other owners.

## What each folder holds

| Folder | Holds |
|---|---|
| `reference/` | The inventory (hosts, addresses, roles), the responsibility matrix (who owns what, what you may touch), one runbook per system with numbered procedure sections, and host-specific facts |
| `spec/` | Design for a major change: a migration, a platform or middleware upgrade |
| `plan/` | The method of procedure (MOP) for one operation: scope and host table, open decisions, steps, rollback, report form, and an execution log appended during the window. Plus `BACKLOG.md` |
| `debug/` | Incidents and root-cause analysis, with captured evidence |
| `audit/` | CVE responses, compliance scans and self-checks, account reviews, point-in-time inventories |

A plan's `Status:` moves to `In progress` when its first step runs in production, not when
it is finished. While it is `In progress`, the execution log is appended; at `Shipped` it
freezes. Anything learned during the window is routed out of the plan per principle 24 before
it freezes.

Conduct gates belong in the agent instruction file, which links the responsibility matrix in
`reference/` (principle 3). Examples: approval before SSH, endpoint-security guardrails,
change-window rules. Secrets never enter `docs/`; reference where they are kept.

## Optional folders

- `note/`: **expected.** Tool and platform behavior that holds on any host goes in a note.
  Runbooks hold only the steps (principle 23).
- `memo/`: when a person wants it (principle 22).

## Cadences

- tmp sweep: the first session of each week (principle 13). There is no release to trigger it.
- BACKLOG review: in the same session. `Pending verification` rows that wait on a reboot or a
  maintenance window are re-checked against the window calendar.

## ADR scope

- **Procedure, never an ADR:** commands, package and install methods, tool choice, step order,
  window timing, thresholds. Write each in the runbook step and explain it in a note. Three
  ADRs about how to install a package within two weeks is the failure this rule prevents.
- **ADR-worthy:** authority and safety gates (approval rules, what an agent may run), the
  responsibility split with other teams, the doc system and its language, and architecture
  direction for a system (e.g. what to collect from where).

## Changelog and commits

- No versions. `CHANGELOG.md` is `## [Unreleased]` with one `### YYYY-MM-DD` heading per day,
  and it records actions executed on systems as well as doc changes. With no series to
  archive, archive by year once the file's growth shows the need (principle 18).
- Commit prefixes separate acting from writing: `ops(<system>):` for an executed change and its
  record, `docs(<folder>):` for documentation only.

## Common mistakes

- A plan executed while it still reads `Status: Draft` (violates 9).
- A lesson from a window written only into the plan's lessons section, while the runbook step
  that caused it is left unchanged (violates 24).
- Blocked-on-another-team items kept as `Open` rows, so the open list never shrinks. They
  belong under `Awaiting external` with the owner named (violates 19).
- Collected evidence archives committed beside the record when they hold credentials or are
  large. A principle 11 directory is for shareable material; keep these out of git and link their location.
