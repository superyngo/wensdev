# Mobile Shell

The layout a TUI switches to on a phone terminal (Termux, Blink, Moshi, Termius). It has a
two-row app bar, one full-screen screen at a time with stack navigation, a bottom tab bar, a
floating add button (FAB), and a snackbar with undo. Use it when your app can run on a phone
or in any narrow terminal. Read [contracts C12](../contracts.md#c12-touch-input) first: touch
input sets every rule here.

**Build or buy:** self-write. It is layout and routing over components you already have
(lists, [bottom-sheet](bottom-sheet.md), [swipe-actions](swipe-actions.md)). About 250 lines.

## When it applies

```rust
pub const MOBILE_MAX_W: u16 = 64; // herdr uses the same idea: `mobile_width_threshold`

pub fn is_mobile(&self) -> bool {
    self.mobile.force || self.size.0 <= MOBILE_MAX_W
}
```

- Decide from **width only**. A phone in portrait is 40–45 columns. Opening the soft keyboard
  halves the height (Termux measured 43×39 → 43×21) but the user is still on the phone. Switching
  layouts every time the keyboard opens would be disorienting.
- Offer a **force switch** (CLI arg, a key such as F3) so the view can be developed and tested on
  a desktop. When it was forced and the screen is wide, offer "Desktop layout" in the overflow menu.
- Store the last frame size in app state (set it before `draw`). Input needs the same decision as
  render, and render must not mutate state (C1).
- Overlays from the desktop view (menus, dialogs, drag sessions) are dropped when the mobile
  view takes input. They were anchored to geometry that no longer exists.

## Layout

```
rows 0-1       ‹   Title                        ⋮      app bar: title row + ─ rule (back only when pushed)
               ─────────────────────────────────
rows 2..h-3    screen: list or detail                  body
rows h-4..h-3  closed editor #1              UNDO      snackbar, 2 rows (only while showing)
                                          ╭─────╮
                                          │  +  │      FAB, lifted 2 rows above the snackbar
                                          ╰─────╯
rows h-2..h-1      ▦              ❐                     bottom tab bar: icon over label
                 Panes         Windows
```

Every tap target is at least `TOUCH_H = 2` rows by `TOUCH_W = 5` columns (contracts C12). The
chrome costs 4 rows, so at 43×21 (keyboard open) the body has 17 rows: 8 list rows, 7 while a
snackbar shows.

- **App bar.** `  ‹  ` (5×2, the whole bar height) appears only on a pushed screen. The title is truncated by
  display width (C7). ` ⋮ ` opens the screen's overflow actions in a bottom sheet.
- **Tab bar.** It replaces F-key mode switches, because a touch-only session has no F keys. Split
  the width evenly. Two rows: icon centered on the first, label on the second. The active tab uses `focus` style. Switching tabs resets that tab's stack and
  scroll.
- **Screens.** A list screen, plus a detail screen pushed by tapping a row. An
  `Option<Item>` is enough at depth 2. Use a `Vec<Screen>` when deeper. If the item a pushed
  screen shows is removed, pop that screen (`ui 5`).
- **List rows** are 2 lines (title + muted subtitle). A 2-row row is the minimum touch height anyway, and it
  leaves room for state text. Each row has a trailing `  ⋯  ` button (5×2) (the tap path for [swipe-actions](swipe-actions.md)).
- **Detail screens** show buttons that are full width and 2 rows tall. Destructive buttons use the
  danger style.
- **FAB:** a 7×3 rounded box with `+` in the bottom-right of the list screen. It creates the
  primary thing for the current tab. It moves up while a snackbar is showing so neither covers the
  other.
- **Snackbar:** two reversed rows above the tab bar with ` UNDO ` (7×2) on the right. It expires after
  about 5 s using ticks (see Loop). It never takes focus. Tapping its text closes an open row
  strip, like any tap on the background.

## Destructive actions: undo instead of confirm

On mobile, act immediately and offer undo. Don't stop the user with a confirm dialog.

```rust
pub enum Undo {
    Pane { root: Node, focus: PaneId },                       // snapshot before the change
    Win { win: Window, index: usize, focus: Option<WinId> },  // re-insert at z position
}
```

Snapshot only what the action changes. A newer snackbar replaces the old one, and its undo
goes with it. That is the standard snackbar contract: only the latest action can be undone.
Keep the desktop confirm dialog where it is. This rule is only for the mobile shell.

## Lists: scrolling and pull-to-refresh

- **Damping.** One Termux swipe sends about 15 wheel events. Scroll one row per
  `WHEEL_PER_ROW = 3` events in the same direction, and reset the counter when the direction
  flips. Clamp to the last full page.
- **Pull to refresh.** Wheel-up events while already at the top count as a "pull". Show
  `↓ pull to refresh ···` with one dot per event. Swipes have no release event, so trigger at a
  threshold (6 events) instead of on finger-up. Then show `↻ refreshing…` for a few ticks.
  Scrolling down cancels the pull.
- The selection is not moved by the wheel. Keys move it, and the scroll follows it.

## Loop

Animations (row strips) and timeouts (snackbar, refresh) need time to pass with no input:

```rust
if app.wants_tick() && !event::poll(Duration::from_millis(100))? {
    app.tick();     // advance animations, expire the snackbar
    continue;       // redraw
}
match event::read()? { ... }
```

`wants_tick()` is true only while something is moving or counting down. When idle, the app still
blocks on input and uses no CPU.

## Keys

The phone may have a hardware keyboard or the Termux extra-keys row.

| Key | Effect |
|---|---|
| `↑` `↓` / `j` `k` | Move the selection (list) or the focused button (detail) |
| `Enter` | Open the row / press the button |
| `←` / `→` | Reveal / hide the row actions |
| `m` `.` Menu | Bottom sheet for the selected item |
| `Esc` Backspace | Close the sheet, then close the row strip, then go back |
| `Tab`, F1/F2 | Switch tab |
| `n` / `u` / `r` / `x` | New / undo / refresh / close the selected item |
| F3 | Toggle the forced mobile view |

## Edge cases

- 21 rows (keyboard open): everything reflows. The list shows fewer rows and the FAB and
  snackbar stay on screen. Test at 43×39 **and** 43×21.
- Width 24 or less: app bar buttons and the tab bar labels truncate. Nothing panics at the
  app's minimum size.
- An empty list shows a muted hint (`Nothing here — tap + to add`) so the FAB is discoverable.

## Acceptance

- [ ] 43×39 and 43×21 render the mobile view and 80×24 does not. Force overrides the width.
- [ ] Tapping a row pushes its detail and ` ‹ ` pops it. Closing the item from its detail pops too.
- [ ] Closing an item shows a snackbar, and UNDO restores it exactly (same position and focus).
- [ ] Every mobile hit-map target is ≥ 2 rows × 5 columns, in every screen and sheet, at 43×39 and 43×21.
- [ ] The FAB moves up while a snackbar is showing.
- [ ] 5 wheel events scroll 1 row. Wheel-up at the top shows the pull indicator and refreshes.
- [ ] A press released over a different target does nothing (tap cancel).

## Reference

Worked demo: `wens-tui-lab` `src/mobile.rs` (state, input, render), `src/tests.rs`
(mobile section), `scripts/pty/s5.json` (43×39 → 43×21 run). Prior art: herdr's mobile header
and full-screen switcher (`src/client/shell/mobile.rs` in the herdr fork).
