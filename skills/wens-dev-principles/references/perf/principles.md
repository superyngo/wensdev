# Performance Principles

How a performance problem is measured, fixed, and reported. The recurring failure is not slow
code but *unmeasured* code: an optimization that targets the wrong axis, a rewrite justified by
arithmetic that does not add up, a win nobody can reproduce six months later. The harness,
report template, and cost-model traps are in
[measurement-playbook.md](measurement-playbook.md).

## Index

| # | Grade | Principle |
|---|---|---|
| 1 | MUST | Profile per phase before changing code; a cause must account for the total |
| 2 | MUST | Identify the axis that degrades before optimizing anything |
| 3 | SHOULD | State the acceptance number before starting |
| 4 | SHOULD | Remove the expensive context before rewriting the algorithm |
| 5 | SHOULD | When one implementation is already fast, its shape is the specification |
| 6 | MUST | An edit that measures no difference is reverted, not left in |
| 7 | MUST | Verify the optimized path produces identical output on the real artifact |
| 8 | SHOULD | Report the regression a fix or upgrade introduces, with its number |
| 9 | SHOULD | Cap the resource on the axis that grows, and let the tighter cap win |
| 10 | SHOULD | Build and dev-loop cost is performance; record the trade where it is made |
| 11 | CONSIDER | Keep a plain in-repo bench harness and always measure at documented sizes |
| 12 | MUST | Measure the fallback branch the headline capability actually takes |
| 13 | SHOULD | Prove a time-ceiling test fails without the fix |

## A. Before touching code

1. **[MUST]** Measure per phase first, and check that the named cause can arithmetically account
   for the total. Three walks at 5.5 ms cannot be 96% of a 527 ms operation — that mismatch is
   the finding. Split the operation into its phases (resolve / capture / delete / re-insert /
   serialize) and time each; the phase that dominates is often not the one the code review
   flagged, and two phases can turn out to be one mechanism each.

2. **[MUST]** Decide *which axis* is degrading — wall time, memory footprint, allocation churn,
   binary size, build time — before choosing a fix. A history stack cost ~201× the document text
   in memory while one undo re-parse cost 49 µs: latency was never the problem, and the proposed
   latency fix would have touched a public trait and every backend to speed up the wrong axis.
   Say the axis out loud in the record; it is the single most common reason an optimization is
   wasted work.

3. **[SHOULD]** Write the acceptance criterion as a number before starting ("within 2× of the
   fastest backend's 80 ms at 7k nodes"), so the work has a defined end. Without it, an
   optimization either stops at the first improvement or never stops.

## B. Shape of the fix

4. **[SHOULD]** Prefer removing the expensive *context* to rewriting the algorithm. Dropping an
   index before a splice, reading from the immutable representation, or asking the index instead
   of filtering the container are narrow, reviewable rules that keep behavior identical; a
   redesign of the index type is a project. Three such rules took one operation from 296 ms to
   33 ms with no rewrite.

5. **[SHOULD]** When several implementations do the same job and one is already fast, that one is
   the specification — thread one traversal result through the phases the way it does, rather
   than inventing a third design. Also check the reverse: the slow one's fix may not apply to the
   others at all (one backend was never exposed to the mechanism, and "the same shape in all
   three" was call-site pattern-matching).

6. **[MUST]** Try the same fix in the adjacent code path, measure, and **revert it if the number
   does not move**. Speculative symmetry ("it can't hurt") is unreviewable and permanent. Say in
   the commit that it was tried, measured flat, and reverted.

7. **[MUST]** A performance fix is verified on the real artifact with the byte-level output
   compared before and after. Optimizations that skip work are exactly the changes most likely to
   skip *necessary* work; identical keystrokes on the two builds must produce a byte-identical
   file, and the undo of the operation must restore the original byte for byte.

## C. Reporting

8. **[SHOULD]** Record the cost a change introduces next to the benefit, with a number: a
   dependency upgrade that grows the shipped wasm by 139 KB gzipped (+11%) and 5 transitive
   crates is a real cost every visitor pays. Recorded, it is a decision; glossed, it is a
   surprise found by someone else later.

9. **[SHOULD]** Bound any accumulating resource on the axis that actually grows, and let the
   tighter of the caps win. An entry-count cap alone makes memory linear in document size; adding
   a byte cap keeps small documents at full depth and trades depth for footprint on large ones.
   Guarantee the minimum useful amount survives (at least one undo step).

10. **[SHOULD]** Developer-loop cost counts: incremental-compilation caches, test-suite runtime,
    CI wall time. Measure it the same way (a 23 GB cache directory buying 1.6 s per rebuild, and
    the dramatic "110 s" figure reproducing only on a cold filesystem cache), and record the
    reasoning **in the config file that makes the trade**, so it can be taken back deliberately.

11. **[CONSIDER]** Keep a plain bench harness in the repo — a `main()` that prints medians, with
    a size knob (`--nodes 5000`) — rather than a framework. Always publish numbers at the same
    documented sizes so runs months apart are comparable, and re-run the old sizes when
    re-verifying an old finding.

## D. Branches and guards

12. **[MUST]** Benchmark the branch the *advertised* capability takes, not the branch the common
    case takes. A Block edit's cursor re-anchor only ran when the pre-edit path stopped
    resolving — precisely the key **rename** the feature exists to enable — so the fast path
    (26 ms at 3,000 nodes) was measured and the headline one (20.7 s on the same buffer) was
    not. Enumerate the fallbacks, error recoveries, and "path no longer resolves" branches, and
    put each on the bench with its own row; a branch reachable only by the marquee feature is
    the one users hit first.

13. **[SHOULD]** A wall-clock ceiling asserted in a regression test must be shown to fail with
    the old code restored, and the failing number recorded (2 s ceiling; 205.9 s with the
    per-node query back). An unfalsified ceiling is decoration — it passes on a quadratic
    implementation at the size the test happens to use. Prefer a ceiling that also states the
    shape it is defending: after the fix, the rename column *equalled* the same-key column, so
    the quadratic term is gone rather than merely smaller.

## Common Mistakes

- Optimizing the phase the reviewer named instead of the phase the profile named (violates 1).
- Speeding up latency when the complaint was memory (violates 2).
- Reporting a 2× win with no target, so nobody can tell whether the work is finished
  (violates 3).
- Redesigning a data structure when dropping it one line earlier would have done (violates 4).
- Copying the fix into every backend "for consistency" without measuring each (violates 5, 6).
- Shipping a faster path that changes the output's whitespace (violates 7).
- Upgrading a dependency for a fix and never mentioning the binary-size cost (violates 8).
- Capping a cache by entry count when entries vary in size by three orders of magnitude
  (violates 9).
- Benchmarks at "a big file" instead of a stated node count, so no later run is comparable
  (violates 11).
- Benchmarking only the path that resolves, so the feature's own path is the slow one
  (violates 12).
- Landing a "does not regress" time bound without ever seeing it fail (violates 13).
