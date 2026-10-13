---
name: tui-components
description: Use when building, reviewing, or choosing Rust ratatui TUI components — menu, dropdown, context menu, modal/dialog/confirm, collapsible toggle tree, sidebar list navigation, split panes / tiling workspace with draggable dividers, toast, tabs, key-hint bar — or when mapping web UI vocabulary (navbar, accordion, tooltip, chip) to terminal equivalents. Covers state/geometry/render/hit-test contracts, keyboard and mouse behavior (right-click menus, drag sessions), CJK width, theming roles, and whether to adopt an ecosystem crate or self-write.
allowed-tools: Read, Grep, Glob
---

# TUI Components (ratatui)

## Overview

Specifications for standard terminal UI components on ratatui 0.30 + crossterm, distilled from
herdr (a mouse-first ratatui app) and the maintained ratatui ecosystem. Each spec fixes the
*behavior* — state, geometry, keys, mouse, edge cases, acceptance — so every project's menu or
tree behaves the same; the code is yours or a crate's.

This file is a **router**. Read [references/contracts.md](references/contracts.md) once per
project, then the spec of the component you are building.

## The doctrine

**A component is four separable parts: State, Geometry, Render, Input.**

- **State** is plain data owned by the app (`highlighted`, `scroll`, `collapsed: HashSet<Id>`).
  No terminal handles, no widgets stored in state.
- **Geometry** is a pure function `(area, state, content) -> rects`, saturating and clamped,
  returning `None` when the area is too small. It runs once per frame.
- **Render** draws from state + geometry and emits a **frame hit map** (rect → target). It
  never mutates app state.
- **Input** maps keys and mouse events to state transitions; mouse hits resolve against the
  hit map of the frame the user actually saw.

## Component index

| Component | Spec | Status |
|---|---|---|
| Menu / dropdown / context menu | [references/components/menu-dropdown.md](references/components/menu-dropdown.md) | Specified |
| Modal / dialog / confirm | [references/components/modal-dialog.md](references/components/modal-dialog.md) | Specified |
| Toggle tree (accordion, collapsible groups) | [references/components/toggle-tree.md](references/components/toggle-tree.md) | Specified |
| Sidebar list navigation | [references/components/sidebar-nav.md](references/components/sidebar-nav.md) | Specified |
| Split panes / tiling workspace (drag dividers, preset layouts) | [references/components/split-panes.md](references/components/split-panes.md) | Specified |
| Everything else in the web UI vocabulary | [references/catalog.md](references/catalog.md) | Mapped, not yet specified |

## References

- **[references/contracts.md](references/contracts.md)** — rules every component obeys:
  anatomy, frame hit map, overlay stack and focus, baseline keymap, mouse, geometry safety,
  CJK width, theme roles, persisting UI state by identity, testing, drag sessions.
- **[references/catalog.md](references/catalog.md)** — web UI term →
  terminal equivalent → disposition (direct / adapt / skip) → spec or crate; plus
  terminal-only components the web list lacks.
- **[references/ecosystem.md](references/ecosystem.md)** — maintained crates checked against
  ratatui 0.30, and the adopt-or-self-write rule.

## Companion skills

- `wens-dev-principles` (`ui` domain) owns the surface-independent rules these specs cite by
  number: focus visibility (`ui 5`), sticky-cursor scrolling (`ui 7`, deep reference
  `scrollable-list-viewport.md`), confirm + preserve state (`ui 8`), text-field contract
  (`ui 10`), Esc peels one layer (`ui 14`), second-click toggle (`ui 15`), pure render (`ui 16`),
  resize-aware (`ui 19`), `NO_COLOR` (`ui 20`). This skill does not restate them.
- `rust-crossplatform-app` owns where the TUI host sits in the workspace (thin host over a
  headless core); components here live in that host crate.

## Common Mistakes

- Storing a `ratatui` widget or a `ListState` copy in app state and letting the two drift
  (violates the State part; keep one source).
- Recomputing geometry in the mouse handler with different inputs than render used — clicks
  land on the wrong row after a resize (use the frame hit map).
- `area.width - 2` on a zero-width area: panic in debug, wrap in release (use `saturating_sub`).
- Measuring labels with `str::len()` or `chars().count()` — CJK and emoji overflow the popup
  (use display width).
- Collapsing a tree group that contains the focused row and losing the cursor (`ui 5`).
- Keying collapsed/expanded state by row index — a reload expands the wrong group (`ui 8`).
- A modal that lets keys fall through to the pane underneath.
- Pushing a container's hit rect after its rows: the hit map is last-wins, so the body swallows
  every row click (push body first, C2).
- Re-running layout in the mouse handler during a drag; capture the target geometry at press and
  let the session own the pointer until release (C11).
