# Component Catalog

Web UI vocabulary mapped to terminal equivalents. Source list: HyC Wiki UI terminology article
(navigation, overlays, content display, actions/inputs, status/indicators). Disposition:

- **Direct** — same concept, terminal rendering.
- **Adapt** — the need exists; the web form does not fit a character grid.
- **Skip** — no terminal value; do not build.

Spec status: **Specified** (has a spec under `components/`), **Mapped** (row only).

## Navigation & layout

| Web term | Terminal equivalent | Disposition | Spec / crate | Status |
|---|---|---|---|---|
| Navbar | Top bar or tab bar, one row | Direct | built-in `Tabs` | Mapped |
| Sidebar | Vertical navigable list, optionally sectioned | Direct | [sidebar-nav](components/sidebar-nav.md) | Specified |
| Breadcrumb | Path line in a header, `a › b › c`, segments clickable | Direct | self-write (one `Line`) | Mapped |
| Hamburger menu | Collapsed sidebar (icon/one-char rail) or a launcher button opening a menu | Adapt | [sidebar-nav](components/sidebar-nav.md), [menu-dropdown](components/menu-dropdown.md) | Specified |
| Tab | Tab bar switching panes in one region | Direct | built-in `Tabs` | Mapped |
| Footer | Status line + key-hint bar | Adapt | self-write | Mapped |

## Overlays & popups

| Web term | Terminal equivalent | Disposition | Spec / crate | Status |
|---|---|---|---|---|
| Pop-up | Any bordered overlay over `Clear` | Direct | [modal-dialog](components/modal-dialog.md) | Specified |
| Modal | Overlay capturing all input until dismissed | Direct | [modal-dialog](components/modal-dialog.md) | Specified |
| Dialog | Modal with message + action buttons; confirm | Direct | [modal-dialog](components/modal-dialog.md) | Specified |
| Tooltip | Hover popup (mouse) or status-line hint for the focused control (keyboard) | Adapt | self-write | Mapped |
| Dropdown | Anchored menu below/above its trigger | Direct | [menu-dropdown](components/menu-dropdown.md) | Specified |
| Toast / Snackbar | Corner overlay, auto-expiring, never takes focus | Direct | `ratatui-toaster` or self-write | Mapped |

## Content display

| Web term | Terminal equivalent | Disposition | Spec / crate | Status |
|---|---|---|---|---|
| Card | Bordered `Block` grouping a record | Adapt | built-in `Block` | Mapped |
| Carousel / Slider | — | Skip | — | — |
| Accordion | Toggle tree / collapsible sections | Direct | [toggle-tree](components/toggle-tree.md) | Specified |
| Hero | — | Skip | — | — |
| Skeleton | Dim placeholder rows or a spinner while loading | Adapt | `throbber-widgets-tui` | Mapped |

## Actions & inputs

| Web term | Terminal equivalent | Disposition | Spec / crate | Status |
|---|---|---|---|---|
| Button | Bracketed label ` ↵ continue ` with a hit rect and a key hint | Adapt | self-write ([modal-dialog](components/modal-dialog.md) action row) | Specified |
| FAB | — | Skip | — | — |
| Checkbox / Radio | `[x]` / `(•)` rows; Space toggles (`wens-dev-principles ui 12`) | Direct | `tui-checkbox` or self-write | Mapped |
| Toggle / Switch | `on`/`off` value cycled by Space | Direct | self-write | Mapped |
| Input / Text field | Single-line or multi-line editor honoring `wens-dev-principles ui 10` | Direct | `tui-input`, `ratatui-textarea` | Mapped |

## Status & indicators

| Web term | Terminal equivalent | Disposition | Spec / crate | Status |
|---|---|---|---|---|
| Badge | One-cell glyph (`●`, count) beside a label | Direct | self-write | Mapped |
| Chip / Tag | Short styled span, optionally clickable filter | Direct | self-write | Mapped |
| Progress bar / Spinner | `Gauge` / `LineGauge`; throbber | Direct | built-in, `throbber-widgets-tui` | Mapped |
| Avatar | — | Skip | — | — |

## Terminal-only components (not in the web list)

These carry most of a TUI's usability and have no web-list row.

| Component | Purpose | Spec / crate | Status |
|---|---|---|---|
| Key-hint bar | Persistent list of currently valid keys (`wens-dev-principles ui 14`) | self-write | Mapped |
| Command palette | Fuzzy-filtered list of every action | self-write over [menu-dropdown](components/menu-dropdown.md) + input | Mapped |
| Focus cycling | Tab/Shift-Tab between regions; one visible focus (`ui 5`) | `rat-focus` or self-write | Mapped |
| Scroll viewport + scrollbar | Sticky-cursor list scrolling (`ui 7`) | built-in `Scrollbar`, `tui-scrollview` | Mapped |
| Table | Column-aligned rows with a header | built-in `Table` | Mapped |
| Search / filter | Inline query narrowing a list | `tui-input` + self-write filter | Mapped |
| Split / resizable panes | Split tree with draggable one-cell dividers, preset layouts | [split-panes](components/split-panes.md) | Specified |
| Floating window / desktop | Overlapping windows in z-order: move, resize, grid and edge snap, min/max/close | [floating-windows](components/floating-windows.md) | Specified |
| Taskbar | One button per window in creation order; click raises / minimizes the active one | [floating-windows](components/floating-windows.md) | Specified |
| Inline confirm | Destructive action confirmed in place (`ui 8`) | [modal-dialog](components/modal-dialog.md) | Specified |
