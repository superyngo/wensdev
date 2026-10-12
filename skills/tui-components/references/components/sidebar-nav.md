# Sidebar List Navigation

A vertical panel at the screen edge listing navigable destinations (workspaces, files,
settings sections), optionally split into stacked sections, resizable, and collapsible to a
narrow rail. Web terms covered: Sidebar, Hamburger menu (collapsed form), Navbar (vertical).

**Build or buy:** self-write the layout and section split; render each section with built-in
`List` (or [toggle-tree](toggle-tree.md) when grouped). Scrolling follows
`wens-dev-principles ui 7` (deep reference `scrollable-list-viewport.md`) — not restated here.

## State

```rust
#[derive(Debug, Clone, PartialEq)]
pub struct SidebarState {
    /// Expanded width in columns, persisted (contracts C9).
    pub width: u16,
    /// Collapsed to the rail.
    pub collapsed: bool,
    /// Fraction of the height given to the first section, persisted.
    pub split: f32,
    /// Which section has keyboard focus.
    pub focused_section: usize,
}
```

Per section, the list state is the usual pair: the **selected id** (data) and the scroll offset
(screen). Three row treatments must stay distinct (`wens-dev-principles ui 5`):

| Treatment | Meaning | Style |
|---|---|---|
| Cursor | Keyboard focus while the sidebar is focused | `accent` bg + `accent_fg` + bold |
| Active | The destination currently shown in the main area | `selection_bg` |
| Hover (optional) | Pointer over a row | Underline or `muted` bg — never the cursor style |

herdr distinguishes "navigating" (sidebar has focus) from not: the active row keeps its
background either way; the cursor fill appears only while navigating
(`workspace_active_background`).

## Geometry

```rust
use ratatui::layout::Rect;

pub const RAIL_WIDTH: u16 = 3;
pub const MIN_SIDEBAR: u16 = 12;
pub const MIN_MAIN: u16 = 20;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct SidebarLayout {
    pub sidebar: Rect,
    /// One-column drag handle between sidebar and main; empty when collapsed.
    pub divider: Rect,
    pub main: Rect,
}

/// Left sidebar. Width is clamped so the main area keeps `MIN_MAIN` columns; on screens too
/// narrow for both, the sidebar degrades to the rail.
pub fn sidebar_layout(area: Rect, state: &SidebarState) -> SidebarLayout {
    let fits_expanded = area.width >= MIN_SIDEBAR + 1 + MIN_MAIN;
    if state.collapsed || !fits_expanded {
        let rail = RAIL_WIDTH.min(area.width);
        return SidebarLayout {
            sidebar: Rect::new(area.x, area.y, rail, area.height),
            divider: Rect::default(),
            main: Rect::new(area.x + rail, area.y, area.width - rail, area.height),
        };
    }
    let max = area.width - 1 - MIN_MAIN;
    let width = state.width.clamp(MIN_SIDEBAR, max);
    SidebarLayout {
        sidebar: Rect::new(area.x, area.y, width, area.height),
        divider: Rect::new(area.x + width, area.y, 1, area.height),
        main: Rect::new(area.x + width + 1, area.y, area.width - width - 1, area.height),
    }
}

/// Split the sidebar into two sections with a one-row divider between them. Below 7 rows,
/// the second section is dropped rather than squeezed to nothing.
pub fn section_split(sidebar: Rect, split: f32) -> (Rect, Option<Rect>, Option<Rect>) {
    if sidebar.height < 7 {
        return (sidebar, None, None);
    }
    let usable = sidebar.height - 1;
    let first = ((f32::from(usable) * split.clamp(0.0, 1.0)).round() as u16).clamp(3, usable - 3);
    let divider = Rect::new(sidebar.x, sidebar.y + first, sidebar.width, 1);
    let second = Rect::new(sidebar.x, sidebar.y + first + 1, sidebar.width, usable - first);
    (Rect::new(sidebar.x, sidebar.y, sidebar.width, first), Some(divider), Some(second))
}
```

Subtractions are safe: each follows a check guaranteeing the minuend is larger.

## Render

- Section header row (title in `muted`, count badge optional), then rows; labels truncated by
  display width (contracts C7).
- Rail mode: one glyph or initial per destination, centered; the active one in
  `selection_bg`; a toggle (`›`) at the top to expand. Rail rows carry the same hit targets as
  the full rows.
- Divider: `│` in `muted`, `accent` while dragging. Section divider: `─`, draggable.
- Hit map (C2): each row → "select id"; collapse toggle; vertical divider → "resize sidebar";
  section divider → "resize split".

## Input

| Event | Effect |
|---|---|
| Up / Down / Home / End / PgUp / PgDn | Move the cursor within the focused section (sticky scroll) |
| Tab / Shift-Tab | Next / previous section, then out to the main area |
| Enter | Make the cursor row active (navigate), focus the main area |
| Esc | Leave the sidebar; cursor snaps back to the active row |
| Toggle key (app-defined, e.g. `Ctrl-b`) | Collapse / expand |
| Click on a row | Make it active (single click navigates in a sidebar) |
| Wheel over a section | Scroll that section, cursor unchanged |
| Drag the vertical divider | Set `width` live; persist on release |
| Drag the section divider | Set `split` live; persist on release |
| Double click on the divider (optional) | Reset width to default |

## Edge cases

- Terminal narrower than `MIN_SIDEBAR + 1 + MIN_MAIN`: rail mode automatically; restore the
  user's width when it grows again (do not overwrite the persisted width).
- Active destination removed: activate the neighbor by id order; never leave the main area
  showing a dead target.
- Very long lists: only the visible slice is rendered; scroll position preserved across
  reloads (`ui 8`).
- Persisted width larger than the current screen: clamp at layout time, keep the stored value.

## Acceptance

- [ ] At 30 columns total the sidebar is the rail and the main area keeps ≥ 20 columns.
- [ ] Dragging the divider to the far right stops at `area.width - 1 - MIN_MAIN`.
- [ ] Cursor, active, and hover rows are distinguishable at a glance, including under `NO_COLOR`.
- [ ] Esc returns the cursor to the active row.
- [ ] Width and split survive a restart; collapsed survives a restart.
- [ ] At 6 rows tall only the first section renders, without panic.

## Reference

herdr `collapsed_sidebar_sections`, `workspace_active_background`, `render_sidebar` in
`src/client/shell/sidebar.rs`; `expanded_sidebar_sections` in `src/ui/sidebar.rs`;
`ClientChromePreferences` (`sidebar_width`, `sidebar_section_split`, `sidebar_collapsed`) in
`src/client/shell/preferences.rs`.
