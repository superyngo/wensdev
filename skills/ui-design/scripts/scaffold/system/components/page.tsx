import type { Child, Markup } from "@design/jsx/jsx-runtime";

/// The light sheet a design page is drawn on: title, one-line subtitle, sections.
export function Page(props: { title: string; subtitle: string; children: Child }): Markup {
  return (
    <main class="w-[1240px] px-12 pt-10 pb-12 font-sans text-ink">
      <h1 class="text-heading font-bold">{props.title}</h1>
      <p class="mt-2 text-body text-note">{props.subtitle}</p>
      {props.children}
    </main>
  );
}

/// One logical unit: a rule, a heading, a one-line description, then rows.
export function Section(props: { title: string; description: string; children: Child }): Markup {
  return (
    <section class="mt-8 border-t border-rule pt-6">
      <h2 class="text-title font-semibold">{props.title}</h2>
      <p class="mt-1 text-label text-note">{props.description}</p>
      {props.children}
    </section>
  );
}

/// A row of compared views. Children are `Figure`s; their title, mock-up and caption share tracks.
export function Row(props: { columns: number; children: Child }): Markup {
  return (
    <div
      class="mt-4 grid grid-rows-[auto_auto_auto] gap-x-8 gap-y-2"
      style={`grid-template-columns:repeat(${props.columns},max-content)`}
    >
      {props.children}
    </div>
  );
}

/// One view in a `Row`. The caption is a margin note: it wraps and never overlaps.
export function Figure(props: { title: string; caption?: string; children: Child }): Markup {
  return (
    <figure class="row-span-3 m-0 grid grid-rows-subgrid">
      <figcaption class="text-label font-semibold">{props.title}</figcaption>
      <div class="justify-self-start">{props.children}</div>
      <p class="max-w-[280px] text-label text-note">{props.caption ?? ""}</p>
    </figure>
  );
}
