# Ecosystem Catalog

Crates checked against crates.io on 2026-10-12 for their ratatui dependency. "0.30-ready" means
the latest release depends on `ratatui ^0.30` or on `ratatui-core ^0.1` / `ratatui-widgets ^0.3`
(the crates ratatui 0.30 is built from). Re-check before adopting: versions move.

## Adopt-or-self-write rule

1. Built-in ratatui widget covers it → use it (`List`, `Table`, `Tabs`, `Scrollbar`, `Gauge`,
   `LineGauge`, `Block`, `Clear`, `Paragraph`).
2. A 0.30-ready crate covers it **and** lets the app own the state the contracts require
   (contracts C1, C9) → adopt it, wrapped behind your own small API so swapping is local.
3. Otherwise self-write to the spec. Most overlays are under 150 lines; the spec is the hard
   part, not the drawing.

Reject a crate that is pinned to an older ratatui, stores app identity by index, or cannot
report the rects it drew (no way to build the frame hit map, C2).

## Crates

| Need | Crate | Version | ratatui | Notes |
|---|---|---|---|---|
| Toggle tree | `tui-tree-widget` | 0.24.1 | 0.30-ready | Open/selected state keyed by identifier paths (`TreeState<Identifier>`, opened = `HashSet<Vec<Identifier>>`), satisfies C9. Default choice for [toggle-tree](components/toggle-tree.md) |
| Popup | `tui-popup` | 0.7.7 | 0.30-ready | Centered/draggable popup from the official `tui-widgets` family |
| Scroll view | `tui-scrollview` | 0.6.8 | 0.30-ready | Scrollable region larger than the viewport |
| Scrollbar | `tui-scrollbar` | 0.2.8 | 0.30-ready | `tui-widgets` family |
| Prompts | `tui-prompts` | 0.6.8 | 0.30-ready | Text/password prompts |
| Single-line input | `tui-input` | 0.15.5 | 0.30-ready | Backend-agnostic input state; check against `wens-dev-principles ui 10` |
| Multi-line editor | `ratatui-textarea` | 0.9.3 | 0.30-ready | Official successor to `tui-textarea` |
| Multi-line editor | `tui-textarea` | 0.7.0 | **0.29 only** | Do not adopt; use `ratatui-textarea` |
| Vim-style editor | `edtui` | 0.11.7 | 0.30-ready | Modal editing |
| Spinner / throbber | `throbber-widgets-tui` | 0.11.1 | 0.30-ready | Loading indicator, skeleton substitute |
| Menu bar | `tui-menu` | 0.3.1 | 0.30-ready | Low adoption; prefer self-writing [menu-dropdown](components/menu-dropdown.md) |
| Toast | `ratatui-toaster` | 0.1.4 | 0.30-ready | Young; evaluate before adopting |
| Checkbox | `tui-checkbox` | 0.5.0 | 0.30-ready | Young |
| Confirm dialog | `tui-confirm-dialog` | 0.4.1 | 0.30-ready | Low adoption; self-write per [modal-dialog](components/modal-dialog.md) |
| Focus + widget set | `rat-focus`, `rat-widget` | 2.1.1, 3.2.1 | 0.30-ready | Full framework with its own event model; adopt wholesale or not at all |
| File explorer | `ratatui-explorer` | 0.3.0 | 0.30-ready | File picker |
| Log view | `tui-logger` | 0.18.3 | 0.30-ready | In-app log pane (`wens-dev-principles ui 21`) |
| Big text | `tui-big-text` | 0.8.10 | 0.30-ready | Headers, splash |

## Reference application

herdr (`herdrdev/herdr`, Apache-2.0) self-writes all its chrome on plain ratatui + crossterm.
Read it for patterns; it is crate-private code coupled to its own state, so adapt rather than
copy, and keep attribution if you lift non-trivial code.

| Pattern | Where (symbol) |
|---|---|
| Centered popup with margins, `None` when too small | `src/ui/widgets.rs` `centered_popup_rect` |
| Modal header/content/footer/actions split | `src/ui/widgets.rs` `modal_stack_areas` |
| Context menu and launcher menu: width from labels, clamped to screen, rows returned as hit rects | `src/client/shell/overlays.rs` `render_context_menu`, `render_global_menu`, `OverlayRender` |
| Single overlay enum | `src/client/shell/state.rs` `ClientShellOverlay` |
| Context-dependent menu items | `src/client/shell/state.rs` `ClientContextMenuTarget` |
| Collapsible groups flattened to visible rows; focused child stays visible when collapsed; collapsed parent shows children's worst status | `src/client/shell/sidebar.rs` `workspace_entries`, `displayed_workspace_status`, `render_parent_group_toggle` |
| Collapsed sidebar rail and section split | `src/client/shell/sidebar.rs` `collapsed_sidebar_sections`; `src/ui/sidebar.rs` `expanded_sidebar_sections` |
| Cursor vs selected row backgrounds | `src/client/shell/sidebar.rs` `workspace_active_background` |
| Scrollbar thumb math and drag | `src/ui/scrollbar.rs` `scrollbar_thumb`, `scrollbar_offset_from_drag_row` |
| UI preferences persisted by id | `src/client/shell/preferences.rs` `ClientChromePreferences` |
