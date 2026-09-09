# Architecture Decision Records

Decisions about the publishing architecture this skill teaches — not about the repo that hosts
it (those live in the repo-root `docs/adr/`; see its ADR 0001 for why these stay here). An ADR
records *why* and which alternatives were rejected; it is a historical record, never edited.
Current behavior lives in [`../../SKILL.md`](../../SKILL.md).

| # | Decision | Status |
|---|---|---|
| [0001](0001-shared-publish-gate.md) | One shared `publish-gate` environment fans out to every store, instead of one approval per store | Implemented |
| [0002](0002-selective-publish-gate.md) | Splitting the gate into one job per store when a release must reach only some stores | Implemented |

Partial supersessions: none.
