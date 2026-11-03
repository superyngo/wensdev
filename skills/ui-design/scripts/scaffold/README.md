# Design System Scaffold

Copy this directory to `design/` in a repo that has no design system yet, then:

```sh
cd design
deno task build          # check (types, lint, fmt) → pages/<page>.html
deno task shot           # headless Chrome → pages/<page>.png
```

Add `design/pages/` to `.gitignore`; it is build output.

| File | Role |
|---|---|
| `deno.json` | Strict TS, JSX runtime, pinned Tailwind, `check` / `build` / `shot` tasks |
| `system/theme.ts` | The only place design values live: `COLOR`, `TEXT`, `RADIUS`, `SHADOW`, `FONT` |
| `system/styles.css` | `@utility` rules for purely visual patterns that are not one token |
| `system/build.ts` | Emits tokens into `@theme`, renders pages, fails on any JavaScript in the output |
| `system/shot.ts` | Fixed-width screenshots for review (`CHROME` overrides the browser path) |
| `system/jsx/jsx-runtime.ts` | String JSX runtime; `on*` and `className` are type errors |
| `system/components/page.tsx` | `Page` / `Section` / `Row` / `Figure` — the sheet and aligned comparison rows |
| `system/components/button.tsx` | Example component: typed tone and state unions, exhaustive switch |
| `system/pages/00-design-system.tsx` | Example page rendering every state from the union |

Then replace the example tokens and component with the product's own. Rules: [../../SKILL.md](../../SKILL.md).
