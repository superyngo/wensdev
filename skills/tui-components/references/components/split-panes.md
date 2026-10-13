# Split Panes / Tiling Workspace

Regions that tile the screen with no gaps and no overlap, separated by one-cell dividers that the
user drags to resize. Covers a two-pane split (sidebar | main) through a full tiling workspace
(VS Code editor groups, tmux, herdr panes, omarchy/Hyprland tiles). Web terms covered: split view,
resizable panels, "Split / resizable panes" from the catalog.

**Build or buy:** self-write. No 0.30-ready crate owns a split tree whose dividers report hit
rects (contracts C2). The tree is about 150 lines; the drag session (contracts C11) is the hard part.

## State

A binary split tree. Each split owns one ratio, so dragging a divider changes only that split.
Ids are stable, which makes focus, preferences, and preset re-tiling key on identity (C9).

```rust
pub type PaneId = u32;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Axis {
    /// Children side by side; the divider is a vertical line.
    Cols,
    /// Children stacked; the divider is a horizontal line.
    Rows,
}

#[derive(Debug, Clone, PartialEq)]
pub enum Node {
    Leaf(PaneId),
    Split { axis: Axis, ratio: f32, a: Box<Node>, b: Box<Node> },
}

/// Root-to-split path: `false` = first child, `true` = second. Identifies a divider.
pub type SplitPath = Vec<bool>;
```

App state alongside the tree: `focus: PaneId`, `next_id`, and an optional drag session.
Operations: `split(target, axis, new_id)` replaces a leaf with a split whose second child is the
new pane. `remove(target)` promotes the sibling into the parent's place, and the last pane cannot
be removed. The other operations are `set_ratio(path, r)`, `flip(path)` (swap the axis), and
`swap(path)` (swap the children and use `1 - ratio`).

An n-ary tree (one node with N weights) fits "equalize all columns" better. A binary tree gives
each divider exactly one owner and keeps drag math to one ratio. Start with binary.

## Geometry

The divider takes **exactly one cell** between the children and is shared by both. Panes
draw no side borders of their own. Shared dividers give the grid look and avoid `││` doubling.

```rust
use ratatui::layout::Rect;

pub fn split_rect(area: Rect, axis: Axis, ratio: f32) -> (Rect, Rect, Rect) {
    let extent = match axis { Axis::Cols => area.width, Axis::Rows => area.height };
    if extent == 0 {
        return (area, Rect::default(), Rect::default());
    }
    let avail = extent - 1; // one cell for the divider
    let first = ((f32::from(avail) * ratio).round() as u16).min(avail);
    let second = avail - first;
    match axis {
        Axis::Cols => (
            Rect::new(area.x, area.y, first, area.height),
            Rect::new(area.x + first, area.y, 1, area.height),
            Rect::new(area.x + first + 1, area.y, second, area.height),
        ),
        Axis::Rows => (
            Rect::new(area.x, area.y, area.width, first),
            Rect::new(area.x, area.y + first, area.width, 1),
            Rect::new(area.x, area.y + first + 1, area.width, second),
        ),
    }
}
```

`layout(root, area) -> Tiles { panes: Vec<(PaneId, Rect)>, dividers: Vec<Divider> }` walks the
tree once per frame. Each `Divider` records `path`, `axis`, its one-cell `rect`, and the `parent`
rect it divides. The drag math needs `parent`. Invariant (worth a test): the pane areas plus the
divider areas sum to the area, for every preset.

Pointer → ratio, clamped so both children keep a minimum extent (`MIN_PANE`, 4 is usable):

```rust
pub const MIN_PANE: u16 = 4;

pub fn ratio_at_pointer(div: &Divider, column: u16, row: u16) -> f32 {
    let (origin, extent, at) = match div.axis {
        Axis::Cols => (div.parent.x, div.parent.width, column),
        Axis::Rows => (div.parent.y, div.parent.height, row),
    };
    let avail = extent.saturating_sub(1);
    if avail == 0 {
        return 0.5;
    }
    let offset = at.saturating_sub(origin).min(avail);
    let offset = if avail >= MIN_PANE * 2 { offset.clamp(MIN_PANE, avail - MIN_PANE) } else { avail / 2 };
    f32::from(offset) / f32::from(avail)
}
```

The ratio is a fraction, so a terminal resize keeps proportions. If a design needs one side to stay
a fixed number of columns (a sidebar), store that side as `Fixed(cols)` instead of a ratio and clamp it on resize.

## Render

1. Each pane fills its rect. Row 0 is the title row. The focused pane's title uses the focus style
   (`accent` bg, C8) and the others use `selection_bg`. That gives one strong focus (`ui 5`) and no
   per-pane borders.
2. Dividers are drawn last as `│` / `─` in `muted`. A hovered divider, or the one being dragged,
   switches to the heavy glyph (`┃` / `━`) in `accent`. That is the only resize affordance a
   terminal has, so show it.
3. Hit map: push `Pane(id)` for each pane rect and `Divider(divider)` for each divider rect. The
   divider target **carries its frame geometry** (`Divider { path, axis, rect, parent }`), so a
   drag starts from what the user saw and never re-runs layout inside the input handler (C2).

## Input

| Event | Effect |
|---|---|
| Left press on a pane | Focus it |
| Left press on a divider | Start a drag session: capture the `Divider` from the hit and the original ratio (C11) |
| Drag (session active) | `set_ratio(path, ratio_at_pointer(..))`, even when the pointer leaves the divider |
| Release | End the session, keep the ratio |
| Esc during a drag | Restore the original ratio, end the session |
| Right click pane / divider | Context menu for that target ([menu-dropdown](menu-dropdown.md)) |
| Tab / Shift-Tab | Next / previous pane in tree order |
| `\|` / `-` (or `v` / `s`) | Split the focused pane right / down; the new pane takes focus |
| `x` | Close the focused pane, confirmed with a destructive dialog ([modal-dialog](modal-dialog.md)) |
| `[` / `]` | Nudge the split directly containing the focused pane by ±5% (keyboard path for the drag, `ui 11`) |
| `m` / Menu key | Open the focused pane's context menu at its top-left corner (keyboard path for right-click) |
| Resize | Cancel any drag; ratios keep the proportions |

Divider context menu: **Reset to 50/50**, **Flip orientation**, **Swap sides**. Pane context
menu: **Split right / down**, **Close pane…** (disabled when it is the last pane), **Layout…**.

## Preset layouts (layout dialog)

A modal list of presets with a live preview, as in VS Code's "Editor Layout" and omarchy's tiling
presets:

| Preset | Tree |
|---|---|
| Single | `Leaf` |
| Two columns / rows | one `Cols` / `Rows` split at 0.5 |
| Main + stack | `Cols` 0.6 → (main, `Rows` 0.5 → (a, b)) |
| Grid 2×2 | `Rows` 0.5 → (`Cols` 0.5, `Cols` 0.5) |
| Three columns | `Cols` ⅓ → (a, `Cols` ½ → (b, c)) |

- **Keep identity when re-tiling.** Fill the slots with the existing pane ids in tree order, with
  the focused pane first so it lands in the main slot. Mint new ids for empty slots.
- When a preset has fewer slots than there are panes, it closes panes. The footer says so in
  `danger` ("applying closes 2 panes") and the primary button switches to the destructive style
  (`ui 8`).
- The preview calls the same `layout()` function inside the dialog, so the preview cannot drift
  from the real result.
- Clicking a row selects it. A second click on the selected row applies it (`ui 15`). Enter applies.
  Mouse wheel moves the highlight.
- Below the dialog's minimum (about 30×8, where the list, footer and actions all fit), use the
  status-line fallback ([modal-dialog](modal-dialog.md) edge case) rather than a cut-off box.

## Edge cases

- Width 0 or 1: `split_rect` returns empty children, nothing panics, and nothing is drawn.
- Parent too small for `2 × MIN_PANE + 1`: the drag pins the divider at the midpoint instead of
  oscillating between the two clamps.
- Closing the focused pane moves focus to the first remaining pane, so focus is never lost.
- A drag in progress when a resize arrives: cancel it, because the captured `parent` is stale.
- Wide (CJK) pane titles are truncated by display width (C7). A glyph that would straddle the
  divider is dropped.

## Acceptance

- [ ] Press on the divider, drag to column 20, and the left pane is exactly 20 columns wide.
- [ ] Dragging past either edge stops at `MIN_PANE`. Esc mid-drag restores the starting ratio.
- [ ] The drag continues while the pointer is off the divider. Release ends it.
- [ ] Right-click on a pane opens that pane's menu. Right-click on a divider while that menu is
      open re-targets to the divider menu.
- [ ] Applying Grid to 3 panes keeps ids 1–3 and adds 4. Applying Single keeps the focused pane.
- [ ] Every preset's panes and dividers sum to the area exactly.
- [ ] 0×0, 1×1 and 24×6 render without panic.

## Reference

herdr `src/layout.rs` (`Node`, `TileLayout`, `collect_splits`, `set_ratio_at`, `split_rect`) and
`src/ui/panes.rs` (`add_split_border_cells`: one shared divider cell). Worked demo (local
repo `wens-tui-lab`): `src/tile.rs`, `src/app.rs`, `src/tests.rs`.
