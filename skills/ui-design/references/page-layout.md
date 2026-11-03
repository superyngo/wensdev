# Page Layout

A design page is a document *about* the UI, not the UI itself. Its layout makes visible, at a
glance, what is UI and what is commentary, which views belong together, and which are compared.

## File and structure

- One page per file: `design/system/pages/NN-<slug>.tsx`, default-exporting `(): Markup`.
  `NN` is a unique two-digit order; never reuse a number for two files.
- Copy the structure of an existing page: title, one-line subtitle, sections, margin notes.
  Use the shared `Page` / `Section` / `Row` / `Figure` components rather than re-deriving them.
- Pages under `design/pages/` are build output: never edit, never commit.

## Sheet vs mock-up

- The page is a light sheet with dark text (titles, headings, captions, notes).
- Only mock-ups use the app theme (often dark), so they read as UI on paper.
- Never paint a page-wide app background.

## Sections and rows

- One section per logical unit (the states of one component, the menus of one panel): a
  heading, a one-line description, a rule above it.
- Rows inside a section hold related variants that are meant to be compared.
- Align what is compared: every view in a row shares tracks — titles on one line, captions on
  one line, mock-ups starting at the same height even when a caption is longer or missing.
  Use a row grid with `grid-rows-subgrid` children, not per-item offsets.
- Captions wrap; the row grows. Text never overlaps.

## Flow, not coordinates

- Sections, rows and mock-up internals use normal flow, flex and grid. Adding a view or a longer
  caption must never require repositioning.
- `absolute` is allowed only for genuine overlays (badges, playheads, popovers anchored to a
  point) and never with fractional pixel offsets.
- Mock-ups have an explicit outer size from tokens or a size prop, so the screenshot is stable.

## Options

When proposing alternatives, draw them on one page, side by side, labelled `A`, `B`, `C`, each
with a one-line trade-off note in the margin, and let the user pick. Delete the losers after the
choice; do not keep dead options in the system.
