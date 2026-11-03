# Tokens and CSS

## Why Tailwind stays

Tailwind v4 is the default and should not be swapped for a "cheaper" framework:

- **Mapping.** GPUI's style API is modelled on Tailwind (`div().flex().items_center().gap_2()`),
  and React/web targets can use the classes verbatim. A mock-up class list is close to the code.
- **Model familiarity.** Tailwind is the CSS vocabulary agents write most reliably; less common
  syntaxes (UnoCSS attributify, variant groups) raise error rates more than they save tokens.
- **Where tokens actually go.** In OpenCut's design system class strings were ~15% of TSX bytes,
  and arbitrary values (`text-[11px]`, `bg-[#294d75]`, `top-[27.9px]`) were ~30% of that.
  The saving is in removing arbitrary values, not in changing frameworks.

| Alternative | Verdict |
|---|---|
| UnoCSS (shortcuts, attributify) | ~10–20% shorter class strings at best; weaker GPUI mapping; less familiar. No. |
| Classless CSS (Pico etc.) | Cannot draw pixel-precise mock-ups. No. |
| CSS Modules / vanilla-extract / Panda / StyleX | Longer, splits style from structure across files. No. |

## Tokens

All design values live in `design/system/theme.ts` and are emitted into Tailwind's `@theme` by
the build, so each becomes a utility:

| Token group | `theme.ts` export | Tailwind namespace | Utility example |
|---|---|---|---|
| Colours | `COLOR` | `--color-*` | `bg-panel`, `text-muted`, `border-accent` |
| Text sizes (with line height) | `TEXT` | `--text-*` | `text-caption`, `text-body` |
| Radii | `RADIUS` | `--radius-*` | `rounded-control`, `rounded-panel` |
| Shadows | `SHADOW` | `--shadow-*` | `shadow-menu` |
| Fonts | `FONT` | `--font-*` | `font-sans`, `font-mono` |

Rules:

- Name tokens by role (`panel`, `caption`, `control`), never by value (`gray-900`, `px13`).
- Spacing uses Tailwind's default 4px scale (`gap-2`, `px-3`) — it matches GPUI's. Add no custom
  spacing; an off-scale gap is a design decision to discuss, not a literal to type.
- A domain palette (track kinds, file types) is a typed `Record` in `theme.ts`, mirrored into
  `COLOR` under prefixed names (`trackVideoFill`). Components never declare their own copy.
- A repeated multi-utility combination becomes a component, or an `@utility` in `styles.css`
  when it is purely visual (hatching, scanlines).
- Audit before reporting:

  ```sh
  rg -n '\-\[#[0-9a-fA-F]+\]|"#[0-9a-fA-F]{3,8}"' design/system/components design/system/pages
  rg -n '(text|rounded|leading)-\[[0-9.]+px\]|(top|left|right|bottom)-\[[0-9]+\.[0-9]+px\]' design/system
  ```

  Both must print nothing, except lines carrying a `// token-exempt: <reason>` comment.

## Mappable subset

Inside mock-ups, use only what the target framework can reproduce. For GPUI the safe set is:
flex layout, size, padding/margin/gap, borders, radius, solid fills, box shadows, opacity,
text size/weight/colour/truncation, absolute overlays.

Treat as **not mappable** unless the target's current version is confirmed to support it:
`clip-path`, CSS filters (`drop-shadow`, `blur`), `color-mix()`, gradients and repeating
backgrounds, `subgrid`, transforms/skew, blend modes. If a design needs one, use it, and add a
margin note: `Not in <framework>: <property> — implement as <custom paint / asset / omit>`.

Page chrome (sheet layout, `grid-rows-subgrid` comparison rows) is exempt: it is never ported.
