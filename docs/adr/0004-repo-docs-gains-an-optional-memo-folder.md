# 0004 — `repo-docs` gains an optional `docs/memo/` folder for people

Date: 2026-11-12

## Context

`repo-docs` principle 2 (`MUST`) fixed the `docs/` folder set at seven. Each folder pairs an
authority with a lifecycle: `reference/` is living and authoritative, the working records are
frozen history, `tmp/` is disposable. Nothing was living and non-authoritative.

The user's reason for wanting that slot: after long agent-driven development every document is
shaped for agents to operate on, and the thinking behind the work exists only in prompts that
turn straight into code. A person has nowhere to write freely and nothing loose to browse later.

Evidence against a need was also on record: none of 24 repos with a `docs/` folder had grown a
`memo`, `wiki`, or `notes` folder by itself. The folder is adopted on the stated purpose, not
on observed demand.

## Decision

1. `docs/memo/` is added as principle 22, `CONSIDER`, appended so that no existing number moves.
   Principle 2 now reads "these seven, plus `memo/` where the repo uses one".
2. No rules of form: any filename, structure, or language; no `Status:`; no freeze; no required
   per-file index (not forbidden). It is exempt from principle 4 (English).
3. Two rules bound it: **not canonical** (never evidence of behavior, never instruction), and
   **human-owned** (an agent reads or tidies it only when asked in that turn).
4. New repos get `docs/memo/README.md` at initialization; existing repos add it when wanted.

## Alternatives rejected

- **Name it `wiki`.** A wiki reads as an interlinked, maintained body of truth, which is what
  `reference/` is.
- **Name it `notes` or `note`.** Plural breaks principle 2's singular names, and the glossary
  lists "Note" under `_Avoid_` for Working record.
- **Use `tmp/`.** It is swept at each release (principle 13); a forming idea would be archived
  or trashed for being 30 days old.
- **Require the per-file index every other folder has.** The folder exists to be low-friction
  for a person; an index that must be kept in the same commit is the friction.
- **Make it a mandatory eighth folder.** Every existing repo would become non-conforming with a
  `MUST` for a folder whose value depends on a person choosing to use it.

## Consequence

The sweep in §Sweeping tmp/ gains `memo/` as a Promote target. The risk accepted is a junk
drawer: a rule-free folder is the easy answer to "where does this go". The two bounding rules
and the homing tests of principles 5, 14, and 19 are what hold it; if agent output starts
landing in `memo/`, this decision should be revisited.
