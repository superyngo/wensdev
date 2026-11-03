// Renders JSX straight to HTML/SVG markup at build time. No virtual DOM, no client JS.

export class Markup {
  constructor(readonly html: string) {}
  toString(): string {
    return this.html;
  }
}

export type Child = Markup | string | number | boolean | null | undefined | Child[];
type Props = Record<string, unknown> & { children?: Child };
type Component = (props: Props) => Markup;

const voidElements = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "source",
  "track",
  "wbr",
]);

export function jsx(type: string | Component, props: Props): Markup {
  if (typeof type === "function") return type(props);
  const { children, ...attributes } = props;
  const attributeText = Object.entries(attributes)
    .filter(([, value]) => value !== undefined && value !== null && value !== false)
    .map(([name, value]) => value === true ? ` ${name}` : ` ${name}="${escape(String(value))}"`)
    .join("");
  if (voidElements.has(type)) return new Markup(`<${type}${attributeText}>`);
  return new Markup(`<${type}${attributeText}>${renderChildren(children)}</${type}>`);
}

export const jsxs = jsx;

export function Fragment(props: Props): Markup {
  return new Markup(renderChildren(props.children));
}

/// Inserts markup as is, e.g. an SVG asset read from disk.
export function raw(html: string): Markup {
  return new Markup(html);
}

function renderChildren(children: Child): string {
  if (children === undefined || children === null || children === false || children === true) return "";
  if (Array.isArray(children)) return children.map(renderChildren).join("");
  if (children instanceof Markup) return children.html;
  return escape(String(children));
}

function escape(text: string): string {
  return text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

/// Attributes every element accepts. Event handlers and React's `className` are type errors:
/// the output is static HTML, and the attribute is `class`.
type Attributes = {
  class?: string;
  style?: string;
  children?: Child;
  className?: never;
  [handler: `on${string}`]: never;
  [name: string]: unknown;
};

export declare namespace JSX {
  type Element = Markup;
  interface IntrinsicElements {
    [name: string]: Attributes;
  }
  interface ElementChildrenAttribute {
    children: unknown;
  }
}
