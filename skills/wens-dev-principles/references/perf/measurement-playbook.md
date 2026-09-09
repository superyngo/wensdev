# Performance — Measurement Playbook

The concrete form of [principles.md](principles.md): how to build the harness, what a phase
profile looks like, the cost-model traps that produce the most wasted optimization work, and the
report template a perf commit is expected to carry.

## The harness

A framework is not needed and gets in the way of the two things that matter — a size knob and
comparable numbers across dates.

```
crates/<core>/benches/perf.rs      # plain main(), no criterion
  --nodes N                        # synthetic document of N nodes (default a small one)
  prints: operation, n, median of k runs, in ms
```

Rules that keep it useful:

- **Medians, not means**, over an odd number of runs; print all runs when they disagree by more
  than ~10%.
- **Synthetic documents generated from the size knob**, so anyone can reproduce a number without
  a fixture file.
- **Document the sizes you publish at** (e.g. 7,001 and 98,001 nodes) and re-use them forever.
  A re-verification pass six months later is only meaningful at the original sizes.
- Beware argument capture: if the bench binary shares a runner with the test binary, the size
  flag may be eaten by the wrong target — pin the target explicitly
  (`cargo bench -p core --bench perf -- --nodes 5000`) and note that in the build docs.

## Phase profile

Time the phases, not the operation. The table below is the shape a diagnosis should reach before
any code changes:

| Phase | Cost | Notes |
|---|---|---|
| resolve path → target | 52 µs | negligible |
| capture fragment | 85 ms | *same* walk that costs 5.6 ms in isolation |
| delete source | 45 ms/source | one operation, quadratic on its own |
| re-insert | 90 ms | 95 ms of it is the final splice |
| serialize | — | once per mutation, not once per phase |

Two findings fall straight out of a table like this: the total is accounted for (no hand-waving
about "redundant walks"), and two phases turn out to share one mechanism.

## Cost-model traps

**Live-handle indexes over mutable trees.** A mutable syntax tree (rowan's `clone_for_update`,
and any parent→children linked-list representation) locates a child by scanning its parent's
live children. An index holding one live handle per node therefore makes *every* traversal a
list scan:

```
walk @ 7,001 nodes, nothing else alive:   5.58 / 5.59 / 5.59 ms
walk @ 7,001 nodes, an index still alive: 97 / 98 / 97 / 97 ms
children().count() @ 5,000 root children: 32 ms with index, 0.09 ms without
root splice:                              ~95 ms with index, ~7 ms without
```

Countermeasures, in order of cost: drop the index as soon as the owned data is extracted; read
spans off the immutable green tree; query the index by key instead of filtering the container;
only then consider an index of paths instead of handles.

**Memory multipliers of tree representations.** A parsed green tree can be ~70× its text
(1.07 MB → ~94 MB resident); a 200-deep snapshot history ~201× the text (216 MB at 1.07 MB).
Estimate the multiplier before proposing structural sharing.

**RSS is not an instrument for a cap.** 20 operations and 200 operations both landed at ~257 MB
on the same file. Verify a cap by its own counter or by a functional check (the product still
behaves identically), and say in the record that RSS was rejected and why.

**Cold vs warm filesystem cache.** A dramatic build-time measurement ("110 s, 99.9% of it
stat-ing fingerprints") reproduced only cold; warm, the same no-op run was 0.32 s either way.
Always state which one you measured.

**Serialize-per-mutation leaks.** A helper that "just needs the text" will re-serialize the whole
document on every mutation. Thread the text that the mutation already returned; keep the
argument-less public entry point for callers that genuinely have no text.

## Report template

A perf commit message (or record) carries, in this order:

1. **What was filed, and what re-measurement said** — including the part of the filing that was
   refuted.
2. **The isolation experiment**, with raw runs, that identifies the mechanism.
3. **The rules applied** (usually 1–3 narrow ones), each with why it is safe.
4. **A before/after table at the documented sizes**, with the acceptance criterion restated.

   ```
   Move @ 7,001 nodes   before    after
   1 source             527 ms    33 ms    -94%
   4 sources            2.09 s    88 ms    -96%
   8 sources            4.18 s    147 ms   -96%   (acceptance: within 2x of YAML's 80 ms)
   ```

5. **Anything tried and reverted**, with its measurement.
6. **Real-artifact verification** — identical keystrokes on before/after builds, byte-identical
   output, undo restores the original.
7. **The regression introduced**, if any, with its number.
8. **Where the invariant is now documented**, so the next reader does not re-introduce it.
