# Swipe Actions (row reveal)

List rows that slide aside to reveal action buttons on their right edge, like iOS swipe-to-reveal
or Android swipe actions. In a terminal the swipe itself is usually **not available**.
Termux turns every finger drag into wheel events and reports no horizontal wheel
(contracts C12). So this component is built from three paths to the same state:

1. **Tap** (works everywhere): a trailing ` ⋯ ` button toggles the strip. This is the primary path.
2. **Key**: `←` reveals the selected row's actions and `→` / Esc hides them.
3. **Real drag** (enhancement): if the terminal reports `Drag(Left)`, which a desktop mouse
   does, dragging a row left moves the strip with the pointer and settles open or closed on release.

**Build or buy:** self-write. About 100 lines.

## State

```rust
/// Only one row is revealed at a time.
pub struct Reveal { pub item: Item, pub shown: u16, pub target: u16 }

/// Tap vs drag: decided by motion between press and release.
pub struct Press { pub target: MTarget, pub x: u16, pub base: u16, pub dragging: bool }

pub const ACTION_W: u16 = 7;     // one action button
pub const REVEAL_STEP: u16 = 4;  // cells per 100 ms tick
```

- `target` is `0` (closed) or the strip width (`actions × ACTION_W`). `shown` moves toward it by
  `REVEAL_STEP` per tick: a 2-action strip opens in 4 frames. When both reach 0, drop the `Reveal`.
- Identify the row by item id, never by index (C9). Re-sorting or deleting rows must not move the
  strip onto a different row.

## Render

- Row container first (`Row(item)`, C2). Its content is shifted: the text gets `width − shown − 6`
  columns.
- The `  ⋯  ` button (5 columns × the row's 2 rows, contracts C12) sits just left of the strip and moves with the content.
- Strip: the buttons start at `row.right − shown` and are clipped at the right edge, so they
  slide in from the edge. Destructive actions use `danger_focus`, the others `focus`. Push a
  `RowAction(action)` hit for each visible part. Mid-animation taps go to whatever part the user
  can see.

## Input

| Event | Effect |
|---|---|
| Tap ` ⋯ ` | Toggle this row's strip. Opening it closes any other row's strip |
| Tap an action | Run it, close the strip |
| Tap the row body while a strip is open | **Only** close the strip. Don't open the row |
| Tap the row body (nothing open) | Normal row action (push detail) |
| Tap anywhere else (background, snackbar) | Close the open strip |
| `←` / `→` on the selected row | Reveal / hide. Moving the selection closes a strip on another row |
| Press on a row, then `Drag(Left)` ≥ 2 cells | Become a drag. `shown = clamp(base + press.x − x, 0, strip)`, following the pointer without animation |
| Release after a drag | Settle: `shown × 2 ≥ strip` → open, else close (animated). A drag never counts as a tap |
| Resize | Drop the press, keep the reveal state |

`base` is the strip's current target when the press started, so dragging an open row to the right
closes it.

## Acceptance

- [ ] Tapping ` ⋯ ` animates the strip open within 4 ticks, and its buttons have hit rects.
- [ ] A drag of 8 cells on a 14-cell strip settles open. A drag of 6 settles closed. Neither pushes the detail screen.
- [ ] With a strip open, the first tap on another row only closes the strip.
- [ ] `←` reveals the selected row's actions without a mouse. Esc hides them.
- [ ] Deleting the revealed row's item drops the reveal and doesn't show a strip on the next row.

## Reference

[wens-tui-lab](https://github.com/superyngo/wens-tui-lab) `src/mobile.rs`: `push_row`, `set_reveal`, `tick`, and the `Down`/`Drag`/`Up`
arms of `mobile_mouse`.
