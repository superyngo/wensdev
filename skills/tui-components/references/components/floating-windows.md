# Floating Windows / Desktop

Overlapping windows in a z-order on a desktop area. Click raises a window. The title bar moves it
and the borders resize it. A hidden grid snaps the edges, and dragging to a screen edge snaps to a
half or maximizes. A taskbar lists the windows. This is a Windows-style desktop in a character
grid. Use it for multi-document tools, inspectors, and floating palettes. Prefer
[split-panes](split-panes.md) when regions never need to overlap: tiling uses every cell, and
overlap costs the user hidden content.

**Build or buy:** self-write. `tui-popup` can drag one popup but has no z-order, no resize, and no
per-part hit rects (contracts C2). About 300 lines including the geometry.

## State

```rust
use ratatui::layout::Rect;

pub type WinId = u32;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum WinState {
    Normal,
    Minimized,
    /// Remembers the rect to go back to.
    Maximized { restore: Rect },
}

pub struct Window {
    pub id: WinId,
    pub title: String,
    /// Absolute screen rect. Render clamps it into the current desk area; it is not the truth
    /// about what was drawn (the hit map is).
    pub rect: Rect,
    pub state: WinState,
}

pub struct Desk {
    /// Z-order: index 0 is the bottom, the last window is on top. Raise = remove + push.
    pub windows: Vec<Window>,
    pub focus: Option<WinId>,
    pub next_id: WinId,
}
```

- **Z-order is the Vec order.** Render draws front to back in that order and the hit map is
  last-wins (C2), so paint order and hit order are the same thing. No separate z field can
  drift out of sync.
- `raise(id)` moves the window to the end, focuses it, and un-minimizes it.
- `minimize` and `close` move focus to the topmost visible window, so focus is never left on a
  hidden or closed window (`ui 5`).
- The taskbar lists windows in **creation (id) order**, not z-order. Raising a window must not
  reshuffle the buttons under the user's pointer.

## Geometry

Windows stay **fully inside the desk** (contracts C6: shift, then shrink). `u16` rects make
off-screen windows awkward, and a title bar dragged out of reach strands the window. If you need
partly off-screen windows, store `i32` positions and clip every draw to the desk, and keep at
least the title bar reachable.

```rust
pub const MIN_W: u16 = 16;  // fits title + three buttons
pub const MIN_H: u16 = 5;
pub const GRID_COLS: u16 = 12;
pub const GRID_ROWS: u16 = 6;
pub const SNAP: u16 = 2;    // snap distance in cells

/// Shrink to the desk, enforce minimums when they fit, then shift inside.
pub fn fit(want: Rect, desk: Rect) -> Rect {
    let w = want.width.max(MIN_W.min(desk.width));
    let h = want.height.max(MIN_H.min(desk.height));
    clamp_into(Rect::new(want.x, want.y, w, h), desk)
}

pub fn grid_lines(origin: u16, extent: u16, divisions: u16) -> Vec<u16> {
    (0..=divisions)
        .map(|i| origin + (u32::from(extent) * u32::from(i) / u32::from(divisions)) as u16)
        .collect()
}

/// Snap to the nearest line within `SNAP` cells; otherwise unchanged.
pub fn snap(v: u16, lines: &[u16]) -> u16 {
    lines.iter().copied()
        .filter(|l| l.abs_diff(v) <= SNAP)
        .min_by_key(|l| l.abs_diff(v))
        .unwrap_or(v)
}
```

- **Move**: `x = pointer.x - grab.x` (the grab offset is captured at press, so the cell under the
  pointer stays under it). Snap the left edge. If it didn't snap, try snapping the right edge
  (`x + width`). Do the same vertically. Then clamp.
- **Resize**: only the edges named by the handle move. Each one follows the pointer, snaps,
  and is clamped between the desk border and `opposite edge ± MIN`, so the opposite edges stay
  fixed. Clamp each edge to its legal range **before** building the rect. Computing a width
  first and clamping afterwards lets the window creep when it hits the minimum.
- **Handles**: the left and right columns, the bottom row, and the four corner cells. The top row
  is the title bar (move) except for its corner cells. Maximized windows have no handles.
- **Edge snap (Aero)**: while moving, the pointer on the desk's left or right column previews
  that half. The pointer on the top row previews maximize. Release applies it. A maximize via
  edge snap stores the pre-drag size as `restore`.
- The snap grid is **hidden**. Draw its intersections as dim `·` only during a drag, so the user
  can see what edges will snap to.

## Render

1. Fill the desk with `desktop_bg` and push `Desktop`. It is the target for desktop clicks and
   the desktop context menu.
2. If a drag is active, draw the grid dots.
3. For each non-minimized window, bottom to top: compute the frame (the desk if maximized,
   otherwise `fit(rect, desk)`), `Clear` it, and draw a bordered `panel_bg` block. The focused
   window gets a thick `accent` border. The others get a plain `muted` border. The title is
   truncated by display width (C7).
4. Hit map per window, **container first** (C2 push order): `Window(id)` for the frame, then
   `Edge(id, edges)` handles, then `TitleBar(id)` (the top row inside the corners), then
   `WinBtn(id, Minimize | Maximize | Close)` (` _ `, ` □ `, ` × ` on the right of the title row,
   shown only when the title row is at least 15 cells wide).
5. On top of everything, the edge-snap preview: a double `accent` border around the target zone.
6. Taskbar row: one ` ▪ title ` button per window. Focused uses `accent`, minimized uses `muted`
   with `▫`, the others use `selection_bg`.

## Input

| Event | Effect |
|---|---|
| Left press on a window body | Raise and focus |
| Left press on the title bar | Raise, then start a **move** session (C11). If the window is maximized, restore its size under the pointer first |
| Left press on an edge or corner | Raise, then start a **resize** session for those edges (none while maximized) |
| Drag (session active) | Move/resize from the captured geometry, snapping; while moving, update the edge-snap zone |
| Release | End; apply the edge-snap zone if any |
| Esc during a drag | Restore the rect *and* the state captured at press (undoes the drag-unmaximize too) |
| Click `_` / `□` / `×` | Minimize / maximize-restore toggle / close |
| Click a taskbar button | Minimized → restore and raise; active and on top → minimize (`ui 15`); otherwise raise |
| Left click on the desktop | Clear focus |
| Right click window / title / edge | Window menu: Maximize or Restore, Minimize, Snap left/right half, Close. Right-click raises first so the menu acts on the visible window |
| Right click desktop | New window, Tile windows, Cascade windows (disabled when no window is visible) |
| Right click taskbar button | Restore or Minimize, Close window |
| Tab / Shift-Tab | Raise the bottom-most window / send the top window to the back, which cycles the stack |
| Arrows / Shift+arrows | Move / resize the focused window by one grid cell (keyboard path, `ui 11`) |
| `+` / `-` / `x` / `n` / `t` / `c` / `m` | Maximize toggle / minimize / close / new / tile / cascade / context menu |
| Resize | Cancel any drag; render re-fits every window to the new desk |

## Edge cases

- Desk smaller than `MIN_W × MIN_H`: `fit` shrinks to the desk. Frames under 3×3 are not drawn
  and have no handles. Nothing panics at 0×0.
- A terminal shrink leaves `rect` outside the desk. Render fits it, and the next interaction
  writes the fitted rect back. Drags capture the **drawn** rect from the hit map, never the
  stored one.
- Overlapping wide glyphs: a window's border can land on the second half of a wide title glyph
  in a window below. The `Buffer` is correct, because ratatui's diff re-sends invalidated
  continuation cells. Terminal emulators differ, though, so check overlapping CJK titles in a real
  terminal.
- Closing the last window leaves focus `None`. Keys that need a window do nothing, and `m` opens
  the desktop menu instead.

## Acceptance

- [ ] Where windows 2 and 3 overlap, the hit is the one later in z-order. Clicking 2 raises it, and
      the same cell now hits 2.
- [ ] A title drag keeps the grab offset, the left edge snaps to the nearest grid line within 2
      cells, and Esc restores the exact rect.
- [ ] Dragging the bottom-right corner past the top-left gives exactly `MIN_W × MIN_H` and
      the top-left corner does not move.
- [ ] Dragging the title to column 0 shows a half-screen preview, and release fills the left half.
- [ ] Maximize removes the resize handles. Dragging the title restores the previous size.
- [ ] Clicking the active window's taskbar button minimizes it and moves focus to the next window.
      Clicking it again restores it.
- [ ] Right-click on a title, on the desktop, and on a taskbar button opens three different menus.
- [ ] 0×0, 1×1, 24×6 desks render, tile, and cascade without panic.

## Reference

Worked demo (local repo `wens-tui-lab`): `src/desk.rs` (model + geometry), `src/desk_input.rs`
(sessions, keys, menus), `src/ui.rs` `render_desk`, and `src/tests.rs` (desktop section).
