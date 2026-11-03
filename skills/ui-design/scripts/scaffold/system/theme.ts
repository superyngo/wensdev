// The single source of design values. build.ts emits each group into Tailwind's @theme,
// so `COLOR.panel` becomes `bg-panel`, `TEXT.caption` becomes `text-caption`, and so on.
// Name tokens by role, never by value.

export const COLOR = {
  // Sheet (the light page around mock-ups)
  sheet: "#f4f4f6",
  ink: "#1b1b1e",
  rule: "#d9d9de",
  note: "#6b6b74",
  // App theme (inside mock-ups)
  panel: "#0d0d0f",
  surface: "#17171a",
  hover: "#202024",
  border: "#2b2b31",
  text: "#f2f2f4",
  muted: "#777780",
  dim: "#55555e",
  accent: "#f0b75e",
  accentInk: "#17120a",
  error: "#ff8b8b",
} as const;

export type ColorToken = keyof typeof COLOR;

/// Text sizes with their line heights: [size, line-height].
export const TEXT = {
  micro: ["10px", "1"],
  caption: ["11px", "1"],
  label: ["12px", "16px"],
  body: ["13px", "18px"],
  title: ["15px", "20px"],
  heading: ["24px", "28px"],
} as const;

export const RADIUS = {
  control: "6px",
  panel: "10px",
} as const;

export const SHADOW = {
  panel: "0 5px 14px rgb(0 0 0 / 24%)",
  menu: "0 8px 20px rgb(0 0 0 / 55%)",
} as const;

export const FONT = {
  sans: '-apple-system,BlinkMacSystemFont,"SF Pro Text","Helvetica Neue",Arial,sans-serif',
  mono: '"SF Mono",Menlo,Monaco,Consolas,monospace',
} as const;
