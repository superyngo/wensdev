# TUI demo: mobile view evaluation
Status: Resolved (2026-10-14)

Evaluation backing the mobile-mode design in
[wens-tui-lab](https://github.com/superyngo/wens-tui-lab), folded into stage d (mobile) and
stage e (2-row touch targets) of
[docs/plan/2026-10-13-tui-demo.md](../plan/2026-10-13-tui-demo.md).

## Facts (sources)

- Termux measured (github.com/prathamdupare/termux-tui `FINDINGS.md`): tap = press+release
  cell-exact, 1-row targets OK; swipe/drag = ~15 wheel events, never motion; long-press = Termux
  menu; pinch = font size; 43x39 -> 43x21 when the soft keyboard opens.
- Termux never reports right-click (`termux-app` #5237); no horizontal wheel (#751); drag
  gestures open since 2016 (#35).
- Blink: touch+mouse supported out of the box (discussion #1528); drag mapping unverified. Moshi:
  gestures bindable.
- Prior art: `~/repos/sshdr` `src/client/shell/mobile.rs` (mobile header + full-screen switcher,
  width threshold, default doc 64).

## Conclusions

Gestures are enhancements only; every action needs a tap target. Swipe-to-reveal must have a tap
path (`⋯`/tap row) and keyboard path; real drag reveal only where motion events arrive. Bottom
sheet replaces right-click menus. Wheel damping ~1 row / 3 events. Layouts must survive 21 rows.

## Proposed (approved, implemented in stage d)

`mobile` breakpoint (auto <= 64 cols + forced `mobile` arg / F3), elements: app bar w/ back,
bottom tab bar, bottom sheet (scrim, grabber, tap-to-toggle detent), row swipe actions, snackbar
w/ undo, FAB, pull-to-refresh via wheel overscroll. Skill: contract C12 touch/input capability;
specs `bottom-sheet.md`, `swipe-actions.md`, `mobile-shell.md`; catalog rows.

A follow-up on-device check (2026-10-14) raised the 1-row-target conclusion above to a 2-row
minimum for fingers — see stage e in the paired plan record.
