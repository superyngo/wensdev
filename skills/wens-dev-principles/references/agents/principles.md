# Multi-Agent Execution Principles

Conventions for running a plan through dispatched subagents — especially inside an isolated
checkout. Small domain, expensive lessons: every principle below was paid for by work landing in
the wrong working tree during one 13-task plan execution.

## Index

| # | Grade | Principle |
|---|---|---|
| 1 | MUST | Absolute paths in file tools whenever two checkouts of the repo exist |
| 2 | MUST | Every write is verified by re-reading the path it was supposed to land on |
| 3 | SHOULD | The controller audits the *other* checkout, not only the one being worked in |
| 4 | SHOULD | A dispatch states the isolation mechanism, not just the destination |

## A. Paths and isolation

1. **[MUST]** When more than one checkout of the same repository exists in the workspace (any
   `git worktree` setup, a second clone, a scratch copy), every path handed to a read/write/edit
   tool is **absolute** — the primary target, the patch/section header, and any path embedded in
   a shell command. Agent file tools commonly resolve a relative path against the *session's*
   root checkout, not against the calling subagent's shell `cwd`; setting `cwd` for `bash` has
   no effect on how the file tools resolve anything. That mismatch — "the shell tool respects
   `cwd`, the file tools do not" — is the actual trap, and it is invisible until something
   lands in the wrong tree. Measured rate in one session: at least 5 of ~14 dispatches leaked,
   each one from a bare relative path.

2. **[MUST]** Treat a write as unconfirmed until it is read back. After each edit, re-read the
   same absolute path, or `git status`/`git diff` the checkout that was supposed to change.
   This turns a cross-checkout leak into an immediate, local correction instead of a merge-time
   archaeology exercise. It is the same rule as "reproduce on the real artifact"
   ([debug 1](../debug/principles.md)) applied to file writes: the tool reporting success is
   evidence about the call, not about the tree.

3. **[SHOULD]** During a long multi-subagent session, the controller periodically runs
   `git status --short --untracked-files=all` on the checkouts *nobody is working in*. A leak
   can sit uncommitted and unnoticed for many turns, and in the worst case pollutes the human's
   own working directory with unreviewed content — which is a trust failure, not just a bug.

4. **[SHOULD]** A dispatch that says "work exclusively in `<path>`" has not communicated
   anything actionable; it names a destination while the failure is a resolution rule. State the
   mechanism instead: absolute paths for every file-tool call, verify each write, never mix a
   `cwd`-relative shell command with an absolute-path edit in the same task. Isolation
   instructions are only as strong as the tool semantics they account for.

## Common Mistakes

- Assuming a subagent is isolated because its `bash` calls set `cwd` to the worktree (violates 1).
- Passing `web/foo.ts` rather than `/abs/worktree/web/foo.ts` to an edit tool "just this once"
  (violates 1).
- Ending a task on the tool's success report, with no read-back or `git diff` (violates 2).
- Auditing only the branch being built, so a stale partial duplicate sits in `main`'s working
  tree for the rest of the session (violates 3).
- Writing throwaway probe content into a source file and relying on memory to revert it, in a
  session where the path may not even be the intended checkout (violates 1, 2).
