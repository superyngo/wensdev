# tui-components skill
Status: Shipped (2026-10-12)

## Goal

Give every Rust TUI project one place that says how standard components — menu, modal, toggle
tree, sidebar navigation, and later the rest of a full UI vocabulary — are built, behave, and
are verified on ratatui, using herdr and the ratatui ecosystem as the reference
implementations.

## Decisions

| # | Question | Decision | Rejected alternative and why |
|---|---|---|---|
| 1 | Deliverable | Guidance only (a skill): specs, contracts, crate catalog | A component crate now — ratatui is pre-1.0 and churns; a crate without settled specs freezes the wrong API |
| 2 | Location | New skill `tui-components` | A folder under `wens-dev-principles/references/ui/` — that skill is implementation-agnostic principles for every surface; ratatui-specific component specs have a different trigger and would bloat its router |
| 3 | Build vs buy | Wrap or adopt an ecosystem crate when one is maintained on ratatui 0.30; self-write only the gap | Self-write everything — duplicates maintained crates and their bug history |
| 4 | Code location | Any future crate or example gallery lives in its own repository, never in `wensdev` | Inside `wensdev` — breaks the skills-payload shape (ADR 0001) |
| 5 | Vocabulary source | The HyC Wiki "UIUX – UI樣式專有名詞" list, mapped to terminal equivalents; English terms only | Web terms used verbatim — a third have no terminal meaning |
| 6 | Language | English body (`wens-dev-principles docs 4`) | Chinese body |

## Scope (this change)

- `skills/tui-components/`: router, vocabulary catalog, shared contracts, ecosystem catalog,
  and four component specs (menu/dropdown, modal/dialog, toggle tree, sidebar navigation).
- Every Rust snippet in the component specs compiles and its stated behavior is unit-tested
  against ratatui 0.30 before landing (scratch verification crate, not shipped).

## Later phases (tracked in `docs/plan/BACKLOG.md`)

- **P1** — separate repository with one runnable example per specified component plus a gallery
  binary; each spec's Acceptance list links to its example.
- **P2** — extract a crate from the examples: theme roles, focus/overlay stack, frame hit map,
  popup geometry.
- **P3** — specify the remaining catalog rows (toast, tabs, breadcrumb, tooltip, command palette,
  key-hint bar, table, checkbox/radio/toggle, progress/spinner).

## References

- herdr (Apache-2.0), upstream `herdrdev/herdr`: `src/ui/widgets.rs`, `src/client/shell/overlays.rs`,
  `src/client/shell/sidebar.rs`, `src/client/shell/state.rs`.
- HyC Wiki, "UIUX – UI樣式專有名詞",
  <https://hyc.eshachem.com/program/uiux-ui%E6%A8%A3%E5%BC%8F%E5%B0%88%E6%9C%89%E5%90%8D%E8%A9%9E/>.
