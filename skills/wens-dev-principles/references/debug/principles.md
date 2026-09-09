# Debugging Principles

How a defect is diagnosed, fixed, and pinned so it cannot come back — and so the *next* reader
can tell evidence from guesswork. Applies to any codebase; every principle below was paid for by
a shipped bug. The concrete cases are in [case-library.md](case-library.md).

## Index

| # | Grade | Principle |
|---|---|---|
| 1 | MUST | Reproduce on the real artifact, before and after, with identical input |
| 2 | MUST | Re-measure the filed cause before implementing the filed fix |
| 3 | MUST | Choose an instrument that can move, and say what it can resolve |
| 4 | SHOULD | Isolate the mechanism, not the call site |
| 5 | MUST | Fix a divergence in the shared layer, and pin it with a parity test |
| 6 | MUST | A defect found while fixing another is recorded, not bundled |
| 7 | SHOULD | A bug caused by duplication is fixed by extraction, never by a second copy |
| 8 | SHOULD | Freeze the measured table as a test, including the negative rows |
| 9 | MUST | Silent partial success is a worse bug than the failure it hides |
| 10 | CONSIDER | Give the app an in-session diagnostic channel, and verify it records |
| 11 | SHOULD | Never build a guard on assumed platform ordering — observe the sequence |

## A. Evidence

1. **[MUST]** A fix is not complete until the original symptom has been reproduced on the **real
   artifact** and its absence confirmed on the same artifact — the built binary, the rebuilt
   wasm in a real browser, the installed extension, the APK on hardware. Same input, same
   keystrokes, both builds, before/after pasted into the commit message. Green unit tests are
   evidence about the code, not about the product; a build boundary (a wasm bundle that is
   *copied* rather than rebuilt, a cached service worker, a stale `media/` copy) sits between
   them and routinely swallows the fix.

2. **[MUST]** Before implementing a fix recorded by an earlier audit, plan, or bug record,
   re-measure its stated cause against the current tree. A record's diagnosis is a *hypothesis
   with a date*; the code moved, and roughly half of them are wrong in a way that changes the
   fix. Verdicts to expect: already fixed, fixed differently, worse than filed, or right symptom
   with the wrong mechanism. Correct the record in the same commit — and if the premise is
   refuted, close it as refuted rather than silently doing something else.

3. **[MUST]** Pick an instrument whose reading can actually move with the change, and state its
   resolution alongside the number. Process RSS cannot see a 200-entry cap (allocator retention
   dominates); a screenshot cannot see `background: transparent`; "it looks fine" is not a
   reading. When the obvious instrument is too coarse, measure the proxy that is exact —
   `getComputedStyle`, a captured console, a byte comparison of the saved file, an explicit
   counter — and say in the record why the coarse one was rejected.

4. **[SHOULD]** When two runs of the *same* code differ, the bug is in the context, not the call
   site. Isolate by running the identical operation in both contexts and reporting both numbers
   (the same tree walk: 5.6 ms alone, 97 ms with a live index alive). Counting call sites is
   pattern-matching; a mechanism is what lets you predict which other call sites are affected —
   and which are not.

## B. Shape of the fix

5. **[MUST]** When N hosts, backends, or platforms disagree about one behavior, fix it once in
   the layer they share (the core guard, not each host's; the shared rule, not each backend's),
   and pin it with a **parity test that iterates every implementation in one loop**. Per-format
   fixtures are selected by an exhaustive match so a new implementation cannot compile until its
   expectations exist. A test that loops over two implementations and handles the third in a
   block below the loop is the gap, not the guard.

6. **[MUST]** A defect discovered while fixing another one is *recorded, not bundled*: filed
   with its evidence into the backlog record, and fixed in its own commit. Bundling hides a
   second bug's verification inside the first one's, and the second one is the one that ships
   unverified. "Found while measuring, recorded not fixed:" is a normal and healthy line in a
   commit message.

7. **[SHOULD]** If the bug exists because behavior was written per host and one copy was
   forgotten, the fix is to extract the behavior into a shared module — not to paste the missing
   copy. Pasting reproduces the exact condition that caused the bug and doubles the cost of the
   next rule added to it. Retarget the test at the shared module and assert every host wires it
   up.

8. **[SHOULD]** Whatever table you measured to understand the bug becomes the regression test —
   all of it, including the rows that were already correct. Those negative rows are what stop the
   fix from over-reaching (the guard that keeps a *trailing* comment's space out of a span, the
   spellings that must stay untouched). A fix pinned only by its own happy row will be widened
   by the next person.

9. **[MUST]** An operation that silently accepts input and applies part of it is a data-loss bug
   of higher severity than an outright rejection, and is fixed at the point of acceptance:
   validate that the parsed fragment covers the whole input, or fail atomically with a message.
   The same applies to an error taxonomy — if hosts branch on the error variant, the same
   situation must yield the same variant everywhere, or one typo produces two different user
   experiences depending on an unrelated attribute of the file.

10. **[CONSIDER]** A UI app benefits from an in-session diagnostic ring (bounded, monotonic
    sequence, viewable from inside the app) far more than from log files it cannot write.
    Two failure modes to check the day you build it: does the channel record *everything*, or
    only the events that were already displayed? And does the viewer window the **tail** of the
    ring rather than its head — a `min(len, N)` box fed a full oldest-first vector clips exactly
    the recent activity it exists to show.

11. **[SHOULD]** Never build a diagnosis — or a guard — on *assumed* platform ordering. If the
    hypothesis is "A happens before B", observe the sequence with an explicit in-process log
    before acting on it: a DOM `blur` fired by a re-render the element itself triggered arrives
    while the element is still attached, the reverse of the externally-removed case everyone
    reasons from. Where two independent triggers can drive the same transition, the fix is an
    intent flag owned by whichever fires first, never a state read taken after the fact.

## Common Mistakes

- Closing a bug on green unit tests without running the built product (violates 1).
- Implementing an audit's recommended rewrite before checking whether its root cause still
  holds — then optimizing the wrong axis at the cost of a public trait (violates 2).
- Reporting "no visible change" from an instrument that could not have shown one (violates 3).
- Counting call sites and calling it a mechanism, so the "same shape" fix lands in a backend
  that never had the problem (violates 4).
- Fixing the read-only guard in the one host that reported it, leaving three hosts unguarded
  (violates 5).
- Bundling three fixes into one commit whose verification covers one of them (violates 6).
- Copying the missing drain into the second host instead of extracting it (violates 7).
- Pinning only the row that was broken, so the next widening breaks the rows nobody wrote down
  (violates 8).
- Treating "the parser accepted it" as success when it dropped everything after the first node
  (violates 9).
- Guarding a handler with "is this element still in the document?" instead of an owned flag, on
  an event-order assumption nobody logged (violates 11).
