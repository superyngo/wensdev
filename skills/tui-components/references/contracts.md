# Shared Contracts

Rules every component spec in this skill assumes. Target: ratatui 0.30, crossterm 0.29.
Snippets are reference implementations; each compiles and is unit-tested against ratatui 0.30.

## C1. Anatomy: State, Geometry, Render, Input

| Part | Owns | Must not |
|---|---|---|
| State | Plain data: indices, scroll offsets, `HashSet<Id>`, open/closed | Hold widgets, terminal handles, or screen rects as truth |
| Geometry | Pure `fn(area, &state, &content) -> Option<Rects>` | Read globals, allocate per cell, panic on small areas |
| Render | Draw into `Buffer`; return the frame hit map | Mutate app state (`wens-dev-principles ui 16`) |
| Input | `fn(&mut state, event, &HitMap) -> Outcome` | Recompute geometry with different inputs than render |

Prefer ratatui's `StatefulWidget` only when the state type is the component's own; app-level
state (which group is collapsed, which item is highlighted) stays in the app.

## C2. Frame hit map

Render records every clickable rect with the target it stands for. Input resolves mouse
events against the hit map of the last drawn frame — what the user saw — never against a
fresh recomputation. Tests click by reading a rect out of the hit map, not by hardcoding
coordinates. herdr: `OverlayRender::menu_rows` fed into the shell's `hits.context_menu_rows`.

**Push order is paint order.** `hit` is last-wins, so push a container (menu body, dialog rect,
window frame) **before** its rows and buttons. A body pushed after its rows shadows them and
every click lands on the body.

A target may carry the geometry it was drawn with, for example `Divider { path, rect, parent }`.
Input then acts on exactly what the user saw (drags, C11) without re-running layout.

```rust
use ratatui::layout::{Position, Rect};

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct HitMap<T> {
    entries: Vec<(Rect, T)>,
}

impl<T> Default for HitMap<T> {
    fn default() -> Self {
        Self { entries: Vec::new() }
    }
}

impl<T: Clone> HitMap<T> {
    pub fn clear(&mut self) {
        self.entries.clear();
    }

    pub fn push(&mut self, rect: Rect, target: T) {
        if !rect.is_empty() {
            self.entries.push((rect, target));
        }
    }

    /// Last pushed wins, so overlays pushed after the base layer shadow it.
    pub fn hit(&self, column: u16, row: u16) -> Option<T> {
        let point = Position::new(column, row);
        self.entries
            .iter()
            .rev()
            .find(|(rect, _)| rect.contains(point))
            .map(|(_, target)| target.clone())
    }

    pub fn rect_of(&self, target: &T) -> Option<Rect>
    where
        T: PartialEq,
    {
        self.entries.iter().find(|(_, t)| t == target).map(|(r, _)| *r)
    }
}
```

## C3. Overlay stack and focus

- At most one overlay is *modal* at a time; model it as one `Option<Overlay>` enum (herdr:
  `ClientShellOverlay`) or a `Vec<Overlay>` when nesting is real (menu → confirm).
- While a modal overlay is open, **every** key and mouse event goes to it. Events never fall
  through to the layer underneath. A click outside a modal is consumed (dismiss or ignore,
  per spec) — it does not also act on what is under it.
- Non-modal popups (menu, dropdown) close on: Esc, activation, click outside, second click on
  the trigger (`wens-dev-principles ui 15`), resize.
- Esc peels exactly one layer (`ui 14`). Closing an overlay restores focus to the control that
  opened it.
- One strong focus treatment on screen (`ui 5`). An open modal owns it; the dimmed background
  keeps no competing cursor.

## C4. Baseline keymap

Use these unless the host app's global map conflicts; when it conflicts, change the app map,
not one component.

| Key | List-like components | Overlays |
|---|---|---|
| Up / `k` | Previous item | Previous item / scroll up |
| Down / `j` | Next item | Next item / scroll down |
| Home / `g` | First item | First item |
| End / `G` | Last item | Last item |
| PgUp / PgDn | Move by visible page | Same |
| Enter | Activate | Confirm the primary action |
| Space | Toggle / cycle (`ui 12`) | Toggle |
| Esc | Leave mode / clear filter | Close (one layer) |
| Left / `h` | Tree: collapse, or go to parent | — |
| Right / `l` | Tree: expand, or go to first child | — |
| Tab / Shift-Tab | Next / previous region or button | Next / previous button |

Navigation does not wrap at the ends unless the spec says so (menus wrap; lists and trees do
not). Movement keys never activate.

## C5. Mouse

- Enable capture explicitly (`crossterm::event::EnableMouseCapture`) and disable on exit,
  including the panic hook.
- Left click on an item: move the highlight there **and** activate it in menus; only select in
  lists and trees (activation is Enter or double click).
- Right click: open the context menu for the target under the pointer, at the pointer.
- Wheel: scroll the region under the pointer, not the focused region.
- Hover may move a menu's highlight (crossterm reports `MouseEventKind::Moved` only when the
  terminal sends motion events; never make hover the only path).
- Every mouse affordance has a keyboard path (`ui 11`).

## C6. Geometry safety

- All arithmetic on `u16` coordinates uses `saturating_*`; never `-` on a width or height.
- A geometry function returns `None` (or an empty `Rect`) when the area cannot hold the
  minimum layout; render then draws nothing rather than a broken box.
- Clamp popups into the screen: shift first, then shrink. Never let a rect extend past
  `area.right()` / `area.bottom()` — ratatui `Buffer` indexing panics out of bounds.
- Recompute on every resize (`ui 19`); a resize closes anchored popups.

```rust
use ratatui::layout::Rect;

/// Clamp `want` (position + size) into `screen`: shrink to fit, then shift inside.
pub fn clamp_into(want: Rect, screen: Rect) -> Rect {
    let width = want.width.min(screen.width);
    let height = want.height.min(screen.height);
    let max_x = screen.right().saturating_sub(width);
    let max_y = screen.bottom().saturating_sub(height);
    Rect::new(
        want.x.clamp(screen.x, max_x),
        want.y.clamp(screen.y, max_y),
        width,
        height,
    )
}
```

## C7. Text width (CJK, emoji)

Measure and truncate by **display width**, never `len()` or `chars().count()`. Use
`Span::width` / `Line::width`, or `unicode-width` directly (ratatui depends on it, but add it to
your own `Cargo.toml` to call it). Truncate on a character boundary and append `…` when cut; a
wide character that would straddle the edge is dropped, not split.

```rust
use unicode_width::UnicodeWidthStr;

/// Truncate to at most `max` display columns, appending `…` when cut.
pub fn truncate_to_width(text: &str, max: u16) -> String {
    let max = usize::from(max);
    if text.width() <= max {
        return text.to_string();
    }
    if max == 0 {
        return String::new();
    }
    let budget = max - 1; // room for the ellipsis
    let mut out = String::new();
    let mut used = 0;
    for ch in text.chars() {
        let w = unicode_width::UnicodeWidthChar::width(ch).unwrap_or(0);
        if used + w > budget {
            break;
        }
        used += w;
        out.push(ch);
    }
    out.push('…');
    out
}
```

`chars()` is adequate for CJK; use `unicode-segmentation` graphemes when labels may contain
combining marks or ZWJ emoji sequences.

## C8. Theme roles

Components take a palette of **roles**, never literal colors. Minimum role set (herdr
`Palette` is a superset):

| Role | Used for |
|---|---|
| `text` | Normal foreground |
| `muted` | Secondary text, disabled items, hints |
| `accent` | Highlight background, borders of the focused overlay, toggle glyphs |
| `accent_fg` | Foreground on `accent` (contrast; herdr `panel_contrast_fg`) |
| `panel_bg` | Overlay fill |
| `selection_bg` | Selected-but-not-focused rows (weaker than the cursor, `ui 5`) |
| `danger` / `warn` / `ok` | Destructive actions, warnings, success (`ui 20`) |

The focused row is `accent` background + `accent_fg` + bold. Honor `NO_COLOR`: map every role
to `Color::Reset` and express focus with `Modifier::REVERSED`.

## C9. UI state persisted by identity

Collapsed groups, sidebar width, section split, and last selection persist by **stable id**,
never by index (`ui 8`). Serialize sets sorted so the file is deterministic (herdr:
`ClientChromePreferences::collapsed_groups`). Ids that no longer exist are ignored on load and
dropped on next save.

## C10. Testing

| Layer | How |
|---|---|
| Geometry | Plain unit tests on the pure function: tiny areas (0×0, 1×1, 3×3), exact fit, overflow, CJK labels |
| Render | `Buffer::empty(area)` + render, then assert cells/styles; or `ratatui::backend::TestBackend` + `Terminal::draw` for whole frames |
| Input | Feed `crossterm::event::KeyEvent` / `MouseEvent` to the input function with a hit map from a real render |
| Mouse | Click at the center of `hit_map.rect_of(target)`; never hardcode coordinates |
| Real artifact | Drive the built binary in a pty: write SGR mouse sequences (`ESC [ < b ; x ; y M`/`m`, 1-based; b=0 left, 2 right, 32 left-drag) and keys, and read the screen through a terminal emulator such as `pyte`. pyte leaves orphaned `""` cells when a wide glyph is partly overwritten, and its `display` then crashes. Dump `screen.buffer` yourself and mark orphans. Real terminals clear both halves of a wide glyph when either half is overwritten, so a pyte orphan where the TestBackend buffer is clean is an emulator artifact |
| Identity | Reorder or reload content, assert collapsed/selected state follows the id |

Real-artifact check: run the component in the actual terminal at 80×24 and at a minimum size,
with a CJK label, before calling it done.

## C11. Drag sessions

A drag is a short-lived mode that starts on press and ends on release. Model it as
`Option<Drag>` in app state, next to the overlay:

```rust
pub struct DividerDrag {
    /// Geometry captured from the hit-map target at press time (C2).
    pub divider: Divider,
    /// Value restored when the drag is cancelled.
    pub original: f32,
}
```

- **Start** only on `Down(Left)` over a draggable target. Capture its frame geometry and the
  value you are about to change.
- **Own the pointer.** While the session is active, every mouse event goes to it before hit
  testing. `Drag(Left)` updates from the pointer even outside the original rect, and
  `Up(_)` ends it. Nothing underneath reacts (same rule as a modal, C3).
- **Compute from the captured geometry**, not the live layout. The thing being dragged changes
  the layout on every event.
- **Esc cancels**: restore `original` and end the session. Any other key ends it in place.
- **Resize cancels**: the captured geometry is stale.
- **Show it**: the dragged handle uses the heavy glyph in `accent`, and the status line says what
  is changing and how to cancel ("resizing 38% · release to keep · esc restores").
- **Clamp every update** to the component's minimums. Never let the value pass a limit and
  then snap back.
- Keyboard path (`ui 11`): every drag has a stepping key (`[` / `]`, arrows in a resize mode).

Terminals report `Drag` only while a button is held, and only after `EnableMouseCapture`
(xterm 1002/1003). `Moved` (hover) needs any-motion reporting, which crossterm requests. Some
multiplexers drop it, so hover can never be the only cue.

## C12. Touch input

Phone terminals (Termux, Blink, Moshi, Termius) turn touch into mouse events, but only a few
kinds. Measured in Termux
([termux-tui FINDINGS](https://github.com/prathamdupare/termux-tui/blob/main/FINDINGS.md)):

| Gesture | What the app receives |
|---|---|
| Tap | `Down(Left)` + `Up(Left)` on the exact cell. 1-row targets are reliable |
| Swipe / drag | About 15 `ScrollUp`/`ScrollDown` events, **never** `Drag` motion |
| Long-press | Nothing. The terminal opens its own menu |
| Pinch | Nothing. The terminal changes the font size |
| Right-click | Never reported ([termux-app #5237](https://github.com/termux/termux-app/issues/5237)) |
| Horizontal swipe | No horizontal wheel ([#751](https://github.com/termux/termux-app/issues/751)) |

Rules:

- **Every action has a visible tap target and a key.** Gestures (drag, right-click, hover) are
  enhancements for desktop mice and must never be the only path. Right-click menus get a
  ` ⋯ ` button that opens a [bottom sheet](components/bottom-sheet.md). Swipe-to-reveal gets a tap
  path ([swipe-actions](components/swipe-actions.md)).
- **Act on release over the press target.** Record the target on `Down`, and fire on `Up` only if
  the hit is the same target. Sliding off cancels. A press that turned into a real drag is not a tap.
- **Damp the wheel.** About 3 events per row. Treat wheel-up at the top as overscroll
  (pull-to-refresh) rather than ignoring it.
- **Survive the soft keyboard.** The height halves when it opens (43×39 → 43×21). Choose the
  layout by width and reflow by height.
- **No F-keys or modifiers are guaranteed.** Mode switches need on-screen controls (tab bar).
- Termux taps are cell-exact, so use 1-row targets. Use 2-row targets for destructive actions,
  as a margin against mis-taps.
- Test with a pty driver that sends taps as SGR press+release pairs and swipes as bursts of
  `\x1b[<64;x;yM` / `\x1b[<65;x;yM`. Change the window size (TIOCSWINSZ + SIGWINCH) to simulate the
  keyboard opening. Then run it once on the device.
