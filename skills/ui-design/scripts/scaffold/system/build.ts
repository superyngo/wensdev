// Renders every page in pages/ to a standalone, script-free HTML file in ../pages/.
// Run with: deno task build  (type check, lint and fmt run first)

import type { Markup } from "./jsx/jsx-runtime.ts";
import { COLOR, FONT, RADIUS, SHADOW, TEXT } from "./theme.ts";
import { compile } from "tailwindcss";

const pagesDirectory = new URL("./pages/", import.meta.url);
const distDirectory = new URL("../pages/", import.meta.url);
await Deno.mkdir(distDirectory, { recursive: true });

const kebab = (name: string) => name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
const tokens = [
  ...Object.entries(COLOR).map(([name, value]) => `--color-${kebab(name)}:${value};`),
  ...Object.entries(TEXT).map(([name, [size, lineHeight]]) =>
    `--text-${kebab(name)}:${size};--text-${kebab(name)}--line-height:${lineHeight};`
  ),
  ...Object.entries(RADIUS).map(([name, value]) => `--radius-${kebab(name)}:${value};`),
  ...Object.entries(SHADOW).map(([name, value]) => `--shadow-${kebab(name)}:${value};`),
  ...Object.entries(FONT).map(([name, value]) => `--font-${kebab(name)}:${value};`),
].join("\n");

const read = (specifier: string) => Deno.readTextFile(new URL(import.meta.resolve(specifier)));
const stylesheet = `
@layer theme, base, components, utilities;
@layer theme { ${await read("tailwindcss/theme.css")} }
@layer base { ${await read("tailwindcss/preflight.css")} }
@theme { ${tokens} }
${await Deno.readTextFile(new URL("./styles.css", import.meta.url))}
@tailwind utilities;
`;
const compiler = await compile(stylesheet);

const pageFiles = [...Deno.readDirSync(pagesDirectory)]
  .filter((entry) => entry.isFile && entry.name.endsWith(".tsx"))
  .map((entry) => entry.name)
  .sort();

for (const fileName of pageFiles) {
  const name = fileName.replace(/\.tsx$/, "");
  const page: () => Markup = (await import(new URL(fileName, pagesDirectory).href)).default;
  const markup = page().html;
  const classes = [...markup.matchAll(/\bclass="([^"]*)"/g)].flatMap((match) =>
    match[1].replaceAll("&quot;", '"').replaceAll("&lt;", "<").replaceAll("&gt;", ">").replaceAll("&amp;", "&")
      .split(/\s+/)
  );
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${name}</title>
<style>${compiler.build(classes)}</style>
</head>
<body class="m-0 bg-sheet">
${markup}
</body>
</html>
`;
  if (/<script\b|\son[a-z]+=|javascript:/i.test(html)) {
    throw new Error(`${name}: the built HTML must not contain JavaScript`);
  }
  await Deno.writeTextFile(new URL(`${name}.html`, distDirectory), html);
  console.log(`pages/${name}.html`);
}
