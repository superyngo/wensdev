# TypeScript

The TSX is build-time only, but its types are the contract the app code implements: prop names
and state unions become the app's structs and enums. Keep the rules few and enforced.

## Checked, not hoped

- `deno task check` runs `deno check`, `deno lint` and `deno fmt --check` over `design/system/`,
  and `deno task build` runs it first. `deno run` alone does **not** type-check.
- `compilerOptions.strict` is on (Deno's default); do not relax it.
- The JSX runtime types forbid `on*` attributes and `className` at compile time
  (see `scripts/scaffold/system/jsx/jsx-runtime.ts`); the build also rejects scripts at runtime.

## Components

- Every exported component has an explicitly typed props object and returns `Markup`.
- No `any`, no `as unknown as`, no non-null `!` to silence the checker.
- One export per concept; file name is the kebab-case component family (`timeline-clip.tsx`).
- Add a one-line `///` doc comment stating size and purpose: `/// A 30px number field ...`.

## States and variants

Model every state set as a string-literal union, never as a pile of booleans:

```tsx
export type ControlState = "default" | "hover" | "pressed" | "selected" | "disabled";

export function Button(props: { label: string; tone: "primary" | "secondary"; state: ControlState }): Markup
```

- A component that takes different shapes uses a discriminated union on `type`/`kind`, and
  renders it with an exhaustive `switch` (no `default` branch, so a new case is a type error).
- The union's members are the names the handoff uses for the app's enum variants.
- To show all states, iterate the union from a `const` array, so the page and the type cannot
  drift: `export const CONTROL_STATES = ["default", ...] as const satisfies readonly ControlState[]`.

## Tokens

- Colour props take `ColorToken` (`keyof typeof COLOR`), not `string`. Components turn a token
  into a class or `var(--color-…)`; hex strings never travel through props.
- Do not type Tailwind class strings with template-literal types — the cost exceeds the value;
  the token audit in [tokens-and-css.md](tokens-and-css.md) covers literals.
