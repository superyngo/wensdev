# Architecture Decision Records

One file per decision that was expensive to reach and would be expensive to reverse. An ADR
records *why* and which alternatives were rejected; it is a historical record, never edited.
Current behavior lives in [`../reference/`](../reference/README.md).

These are *repo-level* decisions. A decision about the content a single skill teaches lives in
that skill's own `docs/adr/` — see 0001.

| # | Decision | Status |
|---|---|---|
| [0001](0001-skills-carry-their-own-docs-payload.md) | A skill carries its own `CONTEXT.md` and ADRs rather than hoisting them to the repo root | Implemented (2026-09-09) |

Partial supersessions: none.
