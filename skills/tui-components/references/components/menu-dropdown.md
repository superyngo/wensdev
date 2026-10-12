# Menu / Dropdown / Context Menu

A short vertical list of actions in a bordered overlay, opened from a trigger (dropdown,
launcher button) or at the pointer (context menu). Non-modal: it closes on the first decisive
event. Web terms covered: Dropdown, Hamburger-menu contents, context menu.

**Build or buy:** self-write. It is ~100 lines and must emit row hit rects (contracts C2);
`tui-menu` exists but is low-adoption. A command palette is this component plus a filter input.

## State

```rust
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum MenuAnchor {
    /// Context menu: top-left corner at the pointer cell.
    Pointer { x: u16, y: u16 },
    /// Dropdown: below the trigger rect, flipping above when there is no room.
    Below(ratatui::layout::Rect),
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct MenuItem<A> {
    pub label: String,
    pub action: A,
    pub enabled: bool,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct MenuState {
    pub anchor: MenuAnchor,
    pub highlighted: usize,
}

impl MenuState {
    /// Open with the first enabled item highlighted; `None` when nothing is enabled.
    pub fn open<A>(anchor: MenuAnchor, items: &[MenuItem<A>]) -> Option<Self> {
        let first = items.iter().position(|item| item.enabled)?;
        Some(Self { anchor, highlighted: first })
    }

    /// Move by `delta` (+1 / -1), wrapping, skipping disabled items.
    pub fn step<A>(&mut self, items: &[MenuItem<A>], delta: isize) {
        let len = items.len() as isize;
        if len == 0 {
            return;
        }
        let mut index = self.highlighted as isize;
        for _ in 0..len {
            index = (index + delta).rem_euclid(len);
            if items[index as usize].enabled {
                self.highlighted = index as usize;
                return;
            }
        }
    }
}
```

Items are **derived** from the target each time the menu opens (herdr builds them from
`ClientContextMenuTarget`); do not store a stale item list when the target can change.
Disabled items are shown in `muted` and skipped by navigation — hide an item instead when it can
never apply to this target.

## Geometry

- Width = widest label in **display width** (contracts C7) + 4 (border + one space each side),
  at least 14, at most the screen width. Height = items + 2, at most the screen height.
- Pointer anchor: top-left at the pointer, then clamp into the screen (contracts C6).
- Below anchor: x = trigger x, y = trigger bottom; if the menu does not fit below but fits
  above, put its bottom edge at the trigger top. Then clamp.
- If the clamped height is smaller than items + 2, the list scrolls (sticky cursor,
  `wens-dev-principles ui 7`); never silently drop items.

```rust
use ratatui::layout::Rect;
use unicode_width::UnicodeWidthStr;

pub fn menu_rect<A>(anchor: MenuAnchor, items: &[MenuItem<A>], screen: Rect) -> Option<Rect> {
    if screen.width < 3 || screen.height < 3 || items.is_empty() {
        return None;
    }
    let label_width = items.iter().map(|item| item.label.width()).max().unwrap_or(0);
    let width = u16::try_from(label_width)
        .unwrap_or(u16::MAX)
        .saturating_add(4)
        .max(14);
    let height = u16::try_from(items.len()).unwrap_or(u16::MAX).saturating_add(2);
    let want = match anchor {
        MenuAnchor::Pointer { x, y } => Rect::new(x, y, width, height),
        MenuAnchor::Below(trigger) => {
            let fits_below = trigger.bottom().saturating_add(height) <= screen.bottom();
            let fits_above = trigger.y.saturating_sub(screen.y) >= height;
            let y = if !fits_below && fits_above {
                trigger.y - height
            } else {
                trigger.bottom()
            };
            Rect::new(trigger.x, y, width, height)
        }
    };
    Some(clamp_into(want, screen))
}
```

`clamp_into` is contracts C6.

## Render

1. `Clear` the rect, fill with `panel_bg`, draw the border in `accent`.
2. One row per item inside the border: ` label` padded to the inner width, truncated by display
   width with `…` (C7).
3. Highlighted row: `accent` bg + `accent_fg` + bold across the full inner width. Disabled: `muted`.
4. Push each row rect with its item index into the hit map (C2), and push the whole menu rect
   last as a "menu body" target so clicks on the border are consumed, not passed through.

## Input

| Event | Effect |
|---|---|
| Up / `k`, Down / `j` | `step(-1)` / `step(+1)`, wrapping |
| Home / End | First / last enabled item |
| Enter | Activate highlighted, close |
| Esc | Close, no action; focus returns to the trigger |
| Letter with an underlined accelerator (optional) | Activate that item |
| Left click on a row | Activate that row (if enabled), close |
| Mouse move over a row | Highlight it (optional; terminals may not report motion) |
| Left click outside | Close; the click is **consumed** (contracts C3) |
| Second click on the trigger | Close (`wens-dev-principles ui 15`) |
| Right click elsewhere | Close this menu, open the context menu for the new target |
| Resize | Close |

## Edge cases

- Screen smaller than 3×3: `menu_rect` returns `None`; render nothing and treat the open as
  failed (the trigger stays focused).
- Pointer at the bottom-right corner: the menu shifts up/left fully inside the screen.
- CJK labels: width uses display width; `"ＡＢab"` (fullwidth) is 6 columns, not 4.
- All items disabled: `MenuState::open` returns `None`; do not show an empty menu.
- Target disappears while open (pane closed): close the menu on the next state update.

## Acceptance

- [ ] Opens with the first enabled item highlighted; Up from the first wraps to the last.
- [ ] Disabled items are rendered muted and never highlighted.
- [ ] Opened at the bottom-right cell, the whole menu is visible.
- [ ] A dropdown under a trigger on the last screen row opens above it.
- [ ] Clicking the center of `hit_map.rect_of(row 2)` activates item 2.
- [ ] Clicking outside closes the menu and does not act on the cell underneath.
- [ ] Second click on the trigger closes it.
- [ ] A CJK label is not clipped mid-glyph; the border is intact.

## Reference

herdr `render_context_menu` (pointer anchor, min width 14, clamp) and `render_global_menu`
(anchored to a launcher, right-aligned, opens upward, badge glyph) in
`src/client/shell/overlays.rs`.
