# Debug Case Library

Shipped bugs, grouped by the class they belong to rather than by the subsystem they happened in.
Each case gives the symptom, the mechanism, and the rule that generalizes. Use it two ways:
before diagnosing (does the symptom match a known class?) and after (which class do I now have
to check the rest of the codebase for?).

## 1. Stale-artifact illusions

**Symptom.** A verified fix has no effect in the product, or a "no-op" change appears to fix
something.

- A Rust core change reaches the browser only after `wasm-pack` reruns; a build step that
  *copies* `pkg/` will happily ship yesterday's core. Fix: one build script for dev/CI/all
  embedding hosts, plus a warning when `pkg/` is older than the sources, plus a build-stamped
  version visible in the UI.
- Browsers heuristically cache large wasm; a dev server without `Cache-Control: no-store` makes
  real fixes look like no-ops even in a private window.
- An editor extension's `media/` is a build-time copy of the web bundle — the same trap one
  layer up.

**Rule.** Before diagnosing "the fix didn't work", prove the artifact under test contains the
fix (version stamp, byte size, a deliberate marker).

## 2. The filed cause that no longer holds

**Symptom.** The audit says X; the code says something else. Four real verdicts from one
re-verification pass over 22 findings — 8 already fixed, 5 partial, 9 open *and differently
open than recorded*:

- "~15–20 sites mutate session fields directly" → five in production, and the real defect was
  that the instrumentation sat on a wrapper the main host deliberately skips.
- "Use structural sharing for undo snapshots" → snapshot *latency* was 49 µs–15 ms and never the
  problem; memory was, and the cheap fix was a byte cap, not a trait change across three
  backends.
- "Three redundant tree walks are 96% of the cost" → arithmetic refutes it (3 × 5.5 ms ≠ 96% of
  527 ms); the same walk cost 17× more in the mutable-tree context.
- "Eight call sites replace the session, so the reset belongs in a helper" → the helper refactor
  had already landed; exactly one line was missing.

**Rule.** Re-measure first; then fix the record and the code in the same commit.

## 3. Cost that depends on context, not on the operation

**Symptom.** A profile blames a function that is demonstrably cheap in isolation.

A mutable/`clone_for_update` syntax tree locates a child by scanning its parent's live-children
list. Holding a whole-document index of *live handles* therefore turns every traversal into a
list scan: `children().count()` over 5,000 root children costs 32 ms with the index alive and
0.09 ms without; a root splice costs 95 ms vs 7 ms. The fix was never "fewer walks" — it was
*never traverse a mutable tree while a whole-document index is alive*: drop the index once the
owned data is extracted, read spans off the immutable green tree, and ask the index (which is
keyed by path) instead of filtering children.

**Rule.** Generalize to any handle-based index, ORM identity map, or observer registry: an index
of live objects can make the container's own operations superlinear. Measure the operation twice
— with the index alive, and without.

## 4. Divergence across hosts, backends, or formats

**Symptom.** The same gesture behaves three ways, and nobody notices because each way has its
own test.

- One key remarked a node fine in one backend, returned `Unsupported` in the second and
  `Illegal` in the third — and the host maps those two variants to *different severities*.
- The same typo returned `Fragment` (keep the editor open) in one format and `Illegal` (abort)
  in another, because one lexer emitted a token for a string running to EOF.
- Deleting the undeletable root said "path not found" in all three — a true statement about the
  lookup, a false one about the world.
- Only the external-editor route checked the read-only flag; the inline route opened the editor
  and rejected the result at commit as a parser error.
- One web host tinted notices by severity; the other styled none of the severity classes, so a
  warning and a success differed only by their auto-hide timer.

**Rule.** One rule, one place (usually the core entry point both routes share), one test that
loops all implementations with an exhaustive per-implementation fixture match.

## 5. Cursors and high-water marks that outlive their object

**Symptom.** A feature works until the document/session/connection is swapped, then goes silent
forever.

A `lastSeenSeq` high-water mark over a diagnostic ring was advanced on drain and reset nowhere.
A new session brings a new ring starting at 0, so every later event sat below the inherited mark
(5 keystrokes → 20 events; after a swap, 3 keystrokes → 0).

**Rule.** Every cursor, high-water mark, memo, or cache keyed by a monotonic counter needs a
reset at the object's single replacement point — and that replacement point must be single.

## 6. Windowing that renders the wrong end

**Symptom.** A "last N" view is correct until there are more than N items, then shows the oldest
N. A `min(len, 20)`-sized box handed a full oldest-first vector renders from line 0. Also clamp
to what the terminal/viewport can display, and title it with what is shown (`last 20 of 25`) so
a clipped view is never mistaken for the whole thing.

## 7. Silent partial acceptance

**Symptom.** An edit reports success and destroys data.

- A fragment parser took the first value node and dropped the rest: `"x: a\ny: b"` landed as a
  corrupt `x: x: a` with the sibling gone.
- Pasting a comment into a flow collection emitted the comment *instead of* the collection,
  reporting success.
- A projection had no case for anchor/alias/tag tokens inside a one-line collection, so elements
  silently vanished and ordinals shifted — "edit element 1" hit item 2.

**Rule.** A fragment must cover its whole input; an unhandled token kind must fence the
construct as read-only/opaque rather than pretend it is absent; refuse the operation atomically
where the parent cannot represent the result.

## 8. Cross-boundary field and token drops

**Symptom.** A value is computed correctly on one side of a boundary and is simply absent on the
other.

- A mobile plugin's Kotlin response was deserialized into a typed Rust struct; the undeclared
  field was dropped by serde for weeks while the native side computed it correctly.
- A CSS `color-mix` referencing a custom property that exists in one host's palette and not the
  other collapsed to transparent — and a screenshot read as "thin green, probably fine".

**Rule.** At any typed boundary (FFI, IPC, IDL, JSON schema, CSS custom-property palette),
enumerate the contract's fields on both sides and assert one round-trip end to end. Verify
appearance with computed values, not screenshots.

## 9. Ambient configuration leaking into tests

**Symptom.** A test asserting user-visible text passes in CI and fails on the developer's
machine.

A CLI resolved its language from the *real* user config file when no flag was given, so an
English assertion passed everywhere except a machine configured for another locale.

**Rule.** Any test asserting output that ambient state can change (locale, timezone, editor,
color support, terminal width, home directory) pins that state explicitly — and the program
offers a session-only override flag to pin it with.

## 10. Layout/spacing bugs are style regressions, not niceties

**Symptom.** "Spacing is not byte-perfect" hides "repeated edits progressively destroy the
author's formatting".

Measuring 11 spellings × every index, insert and delete, showed a one-element-per-line array
collapsing onto one line, orphaned indents, and padding baked into a neighbouring node by the
parser. Each fix is a rule derived from the document's *own* layout (measure the existing
separator, the last comment's indent, the trailing pad) — never a constant.

**Rule.** Enumerate the input space as a table before fixing formatting behavior, then freeze
the table as the test.

## 11. Ordering assumed instead of observed

**Symptom.** A handler that is provably firing produces the opposite of its intent, and the
guard meant to prevent that is the thing breaking it.

A `<select>`'s `blur` guard returned early only when the element was already detached
(`document.contains(el)`), on the assumption that a removal fires `blur` afterwards. For a
re-render triggered by *that element's own* `change` event, Chrome fired `blur` **before** the
removal completed — so the guard passed, the cancel path ran, and the commit was undone by its
own success. The order was established only by instrumenting a module-scoped array of events
(the headless browser's console was not reachable from the harness) and reading the sequence.

**Rule.** Never encode an event-ordering assumption as a state check; two triggers racing on one
transition are resolved by an intent flag owned by whichever fires first. And when ordering *is*
the hypothesis, record the actual sequence — an in-page event log beats any narrative about how
the platform "should" behave.

## 12. The failing layer is not the layer with the symptom

**Symptom.** A widget misbehaves at some sizes, and the widget is innocent.

A native `<select>`'s dropdown arrow vanished at narrow widths — read as a `<select>` quirk. The
control had held its own 80 px floor the whole time; its flex parent, still carrying the
truncation rules written for the cell's *static* state (`overflow:hidden` + `min-width:0`), had
shrunk below it and clipped it.

**Rule.** When a leaf component misbehaves only under a container-driven condition (narrow,
scrolled, nested, long sibling), test the leaf in isolation at the same condition before
touching it. If it behaves, the defect belongs to the container — and inspect computed values,
not the rendered impression (see class 8).

## 13. Behavior only one engine has

**Symptom.** A user reports a bug on their browser that a thorough pass on yours cannot
reproduce — and a *variant* of the same action is fine.

Raw-pane Edit, and Cancel *after* an edit, scrolled the pane to the top on Firefox (480 → 10);
Cancel on an untouched buffer did not. Both failing paths seated the caret at offset 0, and
Gecko scrolls a focused caret into view while Chromium and WebKit do not — so a Chromium sweep
(headless and windowed, real wheel, real clicks) passed every check. The clean/dirty split was
the early return in the revert path: it touched neither value nor caret, hence no caret to
scroll.

**Rule.** The variant that *works* localizes the mechanism faster than the one that fails —
diff the two code paths first. Then verify on every engine you ship to, pre-fix build included
(`wens-dev-principles debug 12`), and store the state you care about numerically
(`scrollTop` before/after), never as an impression.

## 14. Green on my machine, red on the release runner

**Symptom.** Local `cargo test` passes, the release tag is pushed, and a platform job fails on
`Run tests` — repeatedly, one layer deeper each time.

An agm release failed Windows CI four re-tags in a row: a test referenced `platform::` without
the `crate::` prefix (compile error); a new assertion compared `Component<'_>` to `&str`
(another compile error); a test assumed `/etc/some.conf` joins to `config_dir` on Windows when
`resolve_path` anchors it to the current drive; and an e2e test asserted a created entry *is a
symlink* on a runner where unprivileged symlink creation is unavailable, so `agm`'s designed
copy fallback ran instead. Every one was invisible locally because verification grepped the
test output for `test result` lines — and a compile error never prints one.

**Rule.** A test is evidence only where it has run (`wens-dev-principles debug 13`). Read the
full test output unfiltered; assert platform-agnostic properties (absolute, not inside config
dir) or gate explicitly on the platform predicate with a comment naming the fallback; and do
not tag a release until the release workflow has passed on every shipped platform at least
once — the first green run, not the fourth, is the release.
