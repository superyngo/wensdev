---
name: ui-design
description: Use when designing new UI or changing the look of existing UI before writing app code for it, when working in a static design system (design/system, design/pages, TSX + Tailwind mock-ups), when adding design tokens or components, or when handing an approved design to app code (GPUI, React, native). Also when setting up such a design system in a new repo.
allowed-tools: Read, Grep, Glob, Edit, Write, Bash
---

# UI Design

A shared visual language between the human and the agent: UI is designed as static TSX +
Tailwind mock-ups, reviewed as rendered pages, and only then implemented in app code. Adapted
from OpenCut's `ui-design` skill and tightened where that repo's rules went unenforced.

Paths below assume the default layout (`design/system/` source, `design/pages/` build output);
a repo may relocate them — read its `CONTEXT.md` first.

## Hard rules

1. **Design first.** UI that does not exist in code is designed first; changes to existing UI
   start in the design pages. No app code until the user has reviewed the rendered page.
2. **Static only.** The built HTML has no JavaScript; the build fails if it does. Interaction
   states (hover, selected, disabled, editing, error, empty, loading) are separate static
   mock-ups side by side, not behaviour.
3. **Tokens, not literals.** Inside mock-ups: no `[#hex]`, no `[Npx]` text sizes or radii, no
   hex strings in props. Missing value → add a token to `theme.ts` in the same change.
4. **Mappable subset.** Mock-ups use only CSS the target app framework can reproduce. Anything
   else is flagged in a margin note. Page chrome (the sheet around mock-ups) may use any CSS.
5. **Typed and checked.** `deno task check` (type check + lint + fmt) passes before `build`.
6. **One owner per value.** A component, colour or state set exists once; repeated parts are
   extracted, never copied. `design/system/components/` is the source; the `00-design-system`
   page only *shows* it.
7. **Show each fact once.** No hints, labels or buttons the user did not ask for. Notes go in
   the page margin; text inside a mock-up reads as real UI.
8. **Stop and review.** After each design step: build, screenshot, inspect, then report the page
   as a clickable link and wait. Options are drawn side by side, each with a one-line note.

## Which reference

| Task | Reference |
|---|---|
| Laying out a design page: sheet vs mock-up, sections, aligned comparison rows | [references/page-layout.md](references/page-layout.md) |
| Choosing colours, sizes, radii, spacing; Tailwind usage; why not another CSS framework | [references/tokens-and-css.md](references/tokens-and-css.md) |
| Writing components and pages in TypeScript; state and variant types | [references/typescript.md](references/typescript.md) |
| Build, screenshot and self-review before reporting | [references/review.md](references/review.md) |
| Handing an approved design to app code; Tailwind → GPUI / React mapping | [references/handoff.md](references/handoff.md) |
| Setting up the design system in a repo that has none | [scripts/scaffold/](scripts/scaffold/README.md) |

## Related skills

- `wens-dev-principles` (`ui` domain) owns interaction behaviour — focus, keyboard, popups,
  selection. This skill owns how UI *looks* and how that look is agreed before code.
- `tui-components` owns terminal UI; this design system targets pixel UIs.
