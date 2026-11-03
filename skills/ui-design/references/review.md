# Review

Never report a design that has not been built and looked at.

## Steps

1. `deno task build` in `design/` (runs `check` first). Fix every error; do not bypass.
2. Run the token audit from [tokens-and-css.md](tokens-and-css.md). It must print nothing.
3. Screenshot each changed page:

   ```sh
   deno task shot <page>        # e.g. deno task shot 20-top-bar
   ```

   The scaffold's `shot` task drives headless Chrome at a fixed 1440px width and writes
   `design/pages/<page>.png`. Without the scaffold, the equivalent is:

   ```sh
   "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new \
     --hide-scrollbars --window-size=1440,2400 \
     --screenshot=design/pages/<page>.png "file://$PWD/design/pages/<page>.html"
   ```

4. Open the PNG and check, in this order:
   - nothing overlaps or is clipped; captions wrap;
   - compared views align on titles, captions and mock-up tops;
   - every requested state and option is present, and nothing unrequested;
   - mock-ups use the app theme, the sheet stays light;
   - any non-mappable CSS carries a margin note.
5. Report the page as a clickable link to the HTML (and the PNG), list what changed and any
   open questions, then stop and wait for the user.
