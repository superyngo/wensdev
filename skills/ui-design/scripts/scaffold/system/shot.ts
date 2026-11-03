// Screenshots built pages with headless Chrome at a fixed width.
// Usage: deno task shot [page ...]   (no arguments: every built page)
// Set CHROME to override the browser path.

const distDirectory = new URL("../pages/", import.meta.url);
const chrome = Deno.env.get("CHROME") ??
  (Deno.build.os === "darwin"
    ? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
    : Deno.build.os === "windows"
    ? "C:/Program Files/Google/Chrome/Application/chrome.exe"
    : "google-chrome");

const pages = Deno.args.length > 0
  ? Deno.args
  : [...Deno.readDirSync(distDirectory)].filter((entry) => entry.name.endsWith(".html"))
    .map((entry) => entry.name.replace(/\.html$/, "")).sort();

for (const page of pages) {
  const html = new URL(`${page}.html`, distDirectory);
  const png = new URL(`${page}.png`, distDirectory);
  const { success } = await new Deno.Command(chrome, {
    args: [
      "--headless=new",
      "--hide-scrollbars",
      "--window-size=1440,2400",
      `--screenshot=${png.pathname}`,
      html.href,
    ],
    stdout: "null",
    stderr: "null",
  }).output();
  if (!success) throw new Error(`${page}: screenshot failed`);
  console.log(`pages/${page}.png`);
}
