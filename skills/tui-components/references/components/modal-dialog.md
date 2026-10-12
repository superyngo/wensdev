# Modal / Dialog / Confirm

A centered overlay that captures all input until dismissed: information panels, forms, and
confirmations of destructive actions (`wens-dev-principles ui 8`). Web terms covered: Pop-up,
Modal, Dialog, Button (action row), inline confirm.

**Build or buy:** self-write the frame (geometry below) and its action row; adopt `tui-popup`
only for a plain message box. Forms inside use `tui-input` / `ratatui-textarea`.

## Anatomy

```
┌ title ───────────────────────────┐
│ header (1-2 rows)                │
│                                  │
│ content (scrolls when long)      │
│                                  │
│ footer (hint / error line)       │
│                                  │
│  ↵ confirm           esc cancel  │
└──────────────────────────────────┘
```

Vertical slots: header, content (takes the rest), optional footer, optional actions, separated
by a gap row. herdr: `modal_stack_areas`.

## State

```rust
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum DialogKind {
    /// One action: close.
    Info,
    /// Primary + cancel; primary is destructive and starts unfocused.
    ConfirmDestructive,
    /// Primary + cancel; primary starts focused.
    Confirm,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum DialogButton {
    Primary,
    Cancel,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct DialogState {
    pub kind: DialogKind,
    pub focused: DialogButton,
    pub scroll: u16,
}

impl DialogState {
    pub fn new(kind: DialogKind) -> Self {
        let focused = match kind {
            DialogKind::ConfirmDestructive | DialogKind::Info => DialogButton::Cancel,
            DialogKind::Confirm => DialogButton::Primary,
        };
        Self { kind, focused, scroll: 0 }
    }
}
```

`Info` renders its single button as "close" and maps it to `Cancel`. A destructive dialog
starts on Cancel so a reflexive Enter does nothing harmful; the primary is styled `danger`.

## Geometry

```rust
use ratatui::layout::{Constraint, Layout, Rect};

/// Centered rect with a 2-column side margin and 1-row top/bottom margin;
/// `None` when the result would be smaller than 4×4.
pub fn centered_rect(area: Rect, width: u16, height: u16) -> Option<Rect> {
    let width = width.min(area.width.saturating_sub(4));
    let height = height.min(area.height.saturating_sub(2));
    if width < 4 || height < 4 {
        return None;
    }
    Some(Rect::new(
        area.x + (area.width - width) / 2,
        area.y + (area.height - height) / 2,
        width,
        height,
    ))
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct DialogAreas {
    pub header: Rect,
    pub content: Rect,
    pub footer: Option<Rect>,
    pub actions: Option<Rect>,
}

/// Split the inner (border-excluded) rect into slots with `gap` rows between them.
pub fn dialog_areas(inner: Rect, header: u16, footer: u16, actions: u16, gap: u16) -> DialogAreas {
    let mut constraints = vec![Constraint::Length(header), Constraint::Length(gap), Constraint::Min(0)];
    if footer > 0 {
        constraints.extend([Constraint::Length(gap), Constraint::Length(footer)]);
    }
    if actions > 0 {
        constraints.extend([Constraint::Length(gap), Constraint::Length(actions)]);
    }
    let rects = Layout::vertical(constraints).split(inner);
    let mut slots = rects.iter().step_by(2).copied();
    let header = slots.next().unwrap_or_default();
    let content = slots.next().unwrap_or_default();
    let footer = (footer > 0).then(|| slots.next().unwrap_or_default());
    let actions = (actions > 0).then(|| slots.next().unwrap_or_default());
    DialogAreas { header, content, footer, actions }
}
```

`(area.width - width)` is safe because `width <= area.width - 4` was enforced above.

Sizing: request the content's natural size (longest line in display width + 4; lines + chrome)
capped at roughly 80% of the screen; the cap is applied by `centered_rect`. Content that does
not fit scrolls (`wens-dev-principles ui 11`) with a scrollbar.

Action buttons: cancel right-aligned, primary left-aligned in the actions row; each button is
` {key} {label} `, width measured in display width. herdr: `close_button_rect`,
`continue_button_rect`.

## Render

1. Optionally dim the whole screen beneath (apply `Modifier::DIM` to the buffer area) — the
   background stays readable but obviously inactive.
2. `Clear` the dialog rect, fill `panel_bg`, border in `accent`, title in the top border.
3. Header, content (wrapped `Paragraph` with `.scroll((state.scroll, 0))`), footer in `muted`
   or `danger` for an error.
4. Buttons: focused one `accent` bg + `accent_fg` + bold; destructive primary uses `danger` as
   its accent. Push each button rect and the whole dialog rect to the hit map (C2).

## Input

All events go to the dialog while it is open (contracts C3).

| Event | Effect |
|---|---|
| Enter | Activate the focused button |
| `y` / `n` (Confirm kinds, optional) | Primary / Cancel directly |
| Esc | Cancel; never the primary |
| Tab / Shift-Tab, Left / Right | Move button focus |
| Up / Down, PgUp / PgDn, Home / End | Scroll content |
| Click on a button | Activate it |
| Click inside the dialog elsewhere | Nothing |
| Click outside | Info: close. Confirm kinds: nothing (an accidental click must not confirm or lose a form) |
| Resize | Recompute geometry; keep state |

## Edge cases

- Screen too small (`centered_rect` returns `None`): render a one-line fallback in the status
  line ("terminal too small — esc to cancel"); input still works; Esc still cancels.
- Async work behind Confirm (deleting files): keep the dialog open with a footer
  "working…", disable buttons, close on completion; on failure show the error in the footer and
  keep the dialog so the user can retry (`wens-dev-principles ui 9`).
- Content changes while open (the target vanished): replace the content with the reason and
  degrade to `Info`.

## Acceptance

- [ ] A destructive confirm opened and immediately sent Enter does not perform the action.
- [ ] Esc cancels from every button focus.
- [ ] Keys do not reach the pane underneath while open.
- [ ] Click outside a confirm does nothing; click outside an info dialog closes it.
- [ ] At 20×6 the dialog either fits with margins or falls back to the status line; no panic
      at 0×0.
- [ ] Long content scrolls with Up/Down and PgUp/PgDn; the action row stays visible.
- [ ] Button hit rects come from the frame hit map; clicking the center of each activates it.

## Reference

herdr `centered_popup_rect`, `modal_stack_areas`, `close_button_rect` in `src/ui/widgets.rs`;
`ClientConfirmCloseOverlay` in `src/client/shell/state.rs`.
