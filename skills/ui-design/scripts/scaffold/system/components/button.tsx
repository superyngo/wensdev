import type { Markup } from "@design/jsx/jsx-runtime";

export type ButtonTone = "primary" | "secondary";
export type ControlState = "default" | "hover" | "pressed" | "disabled";
export const CONTROL_STATES = ["default", "hover", "pressed", "disabled"] as const satisfies readonly ControlState[];

/// A 28px push button. One shape; tone and state change only colour and fill.
export function Button(props: { label: string; tone: ButtonTone; state: ControlState }): Markup {
  return (
    <span class={`inline-flex h-7 items-center rounded-control border px-3 text-body font-semibold ${fill(props)}`}>
      {props.label}
    </span>
  );
}

function fill({ tone, state }: { tone: ButtonTone; state: ControlState }): string {
  switch (state) {
    case "disabled":
      return "border-border bg-surface text-dim";
    case "pressed":
      return tone === "primary"
        ? "border-accent bg-accent text-accent-ink opacity-80"
        : "border-border bg-hover text-text";
    case "hover":
      return tone === "primary" ? "border-accent bg-accent text-accent-ink" : "border-muted bg-hover text-text";
    case "default":
      return tone === "primary" ? "border-accent bg-accent text-accent-ink" : "border-border bg-surface text-text";
  }
}
