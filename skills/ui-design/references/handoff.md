# Handoff to App Code

The design system shares no code with the app. The handoff is what keeps them the same design.

## When a design is approved

Before writing app code, write a short handoff list in the conversation (or the task's spec):

- **Components** — each component used, new or changed, with its file link.
- **Tokens** — any token added or changed in `theme.ts`; the app theme gets the same names.
- **States** — every state/variant union, which becomes an app enum with the same member names.
- **Non-mappable** — each margin-noted property and the chosen app-side substitute.

App code then implements against the list; the design page stays the visual reference and is
updated first if the look changes again.

## Tailwind → GPUI

GPUI's styling methods follow Tailwind names with `_` for `-`. Verify against the GPUI version
the repo pins; the API moves.

| Mock-up | GPUI |
|---|---|
| `flex`, `flex-col`, `items-center`, `justify-between` | `.flex()`, `.flex_col()`, `.items_center()`, `.justify_between()` |
| `gap-2`, `px-3`, `py-1`, `m-2` | `.gap_2()`, `.px_3()`, `.py_1()`, `.m_2()` |
| `w-full`, `size-4`, `w-[280px]` | `.w_full()`, `.size_4()`, `.w(px(280.))` |
| `bg-panel`, `text-muted`, `border-border` | `.bg(theme.panel)`, `.text_color(theme.muted)`, `.border_color(theme.border)` |
| `border`, `border-b` | `.border_1()`, `.border_b_1()` |
| `rounded-panel` | `.rounded(theme.radius_panel)` |
| `text-caption`, `font-semibold`, `truncate` | `.text_size(theme.text_caption)`, `.font_weight(FontWeight::SEMIBOLD)`, `.truncate()` |
| `shadow-menu` | `.shadow(theme.shadow_menu())` |
| `absolute top-2 left-2` | `.absolute().top_2().left_2()` |
| `opacity-50` | `.opacity(0.5)` |

## Tailwind → web (React, Svelte, …)

Copy the class lists verbatim and load the same `theme.ts` → `@theme` output. Replace each
static state mock-up with the real pseudo-class or state prop (`hover:`, `aria-selected:`,
`disabled:`) using the same tokens.
