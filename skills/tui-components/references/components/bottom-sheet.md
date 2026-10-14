# Bottom Sheet

A full-width panel anchored to the bottom edge over a dimmed scrim. It holds actions for one
item (an action sheet) or screen-level options. On touch it replaces the context menu, because
phone terminals deliver neither right-click nor long-press (contracts C12). Open it from a visible
` ⋯ ` / ` ⋮ ` button. A desktop mouse can also open it with a right-click.

**Build or buy:** self-write. It is a [menu](menu-dropdown.md) with different geometry and
row heights. About 120 lines.

## State

```rust
pub struct SheetItem { pub label: String, pub action: MAction }

pub struct Sheet {
    pub title: String,
    pub items: Vec<SheetItem>,
    pub highlighted: usize,
    /// Detent: half height (false) or nearly full height (true).
    pub expanded: bool,
    pub scroll: usize,
}
```

The sheet is the top overlay (C3). While open, it gets every key and tap.

## Geometry

```
   (scrim: everything above is dimmed, tap closes)
──────────────────━━━━━━━──────────────────   grabber, 2 rows: tap toggles the detent

 Title (muted)
  Open                                         every item is 2 rows tall

  Hide window

  Close window                                 destructive: danger style

                  Cancel                       always the last 2 rows

```

- Height = `5 + 2 × items` (grabber 2, title 1, Cancel 2), capped at the detent:
  half (`max(2h/3, 7)`) or expanded (`h − 1`). The half detent is 2/3, not 1/2: with 2-row
  items, half of 21 rows (keyboard open) fits only two items, which hid "Close window".
  Always leave at least one scrim row, so there is somewhere to tap outside the sheet.
- When the items don't fit, they scroll inside the sheet. The grabber, title and Cancel stay fixed.
- Items are full width and 2 rows tall: finger-sized (contracts C12), not just cell-exact.
  Destructive items differ by danger style only.
- Below 5 rows tall, don't draw a sheet at all. The scrim alone still dismisses on tap.

## Render and hit map (C2 push order)

1. Dim the whole area, then push `Scrim` for the whole area.
2. `Clear` the sheet rect, fill it with `panel_bg`, and push `Body`. `Body` swallows taps on the
   chrome so they don't fall through to the scrim.
3. Draw the grabber: a `─` line with a 7-cell `━` handle in `accent` on its first row. Push
   `Grabber` for both rows.
4. Draw the title in `muted`.
5. Draw the items from `scroll`, push `Item(i)` for each, and highlight with the `focus` style.
6. Draw `Cancel` centered on the first of the last 2 rows and push `Cancel` for both.

## Input

| Event | Effect |
|---|---|
| Tap an item | Run its action and close the sheet |
| Tap the scrim / Cancel | Close the sheet |
| Tap the grabber | Toggle the detent (half ↔ expanded) and reset the scroll |
| Wheel over the sheet | Scroll the items (damped, see mobile-shell). The list behind does not move |
| `↑` `↓` / `j` `k` | Move the highlight (wraps). Scroll follows |
| `Enter` | Run the highlighted item |
| `Space` | Toggle the detent |
| `Esc` | Close the sheet |

**Why the grabber is not dragged:** in Termux a finger drag arrives as wheel events, never as
motion events. So "drag the handle up" can't be detected. A tap toggling the detent is the
equivalent that works everywhere. If a terminal does report `Drag(Left)`, you can add
drag-to-resize on top using a C11 session, but don't make it the only way.

Taps act on **release** over the same target as the press (see mobile-shell). A finger that
slides off an item before lifting doesn't run it.

## Acceptance

- [ ] The sheet bottom equals the screen bottom, and one scrim row stays visible even when the sheet is expanded.
- [ ] Tapping the scrim closes the sheet and nothing behind it reacts. Tapping the grabber toggles `expanded`.
- [ ] Every item, the grabber and Cancel are ≥ 2 rows tall. Destructive items use the danger style.
- [ ] With more items than fit, the wheel scrolls inside the sheet and Cancel stays visible.
- [ ] A sheet with zero items still renders (grabber, title, Cancel) without panicking at 24×6.

## Reference

[wens-tui-lab](https://github.com/superyngo/wens-tui-lab) `src/mobile.rs`: `render_sheet`, `sheet_activate`, the sheet branch of
`mobile_key`.
