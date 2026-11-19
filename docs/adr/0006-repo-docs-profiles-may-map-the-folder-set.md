# 0006 — `repo-docs` profiles may map the folder set; a `life` profile

Date: 2026-11-19

## Context

ADR 0005 introduced profiles and forbade them from changing the folder set. The next domain
named there, a life-assistant repo, now exists: `~/life` (renovation, house sale, baby, exam,
home-server and dev indexes). Its work is organized by **subject**, not by document lifecycle,
and to fit `repo-docs` its ADR 0001 had to deviate from three principles:

- `areas/<area>/` (living `README.md` + `BACKLOG.md`, dated `log/`, numbered `decisions/`,
  gitignored `files/`) replaces `spec/`, `plan/`, `debug/`, `audit/` — against principle 2, a
  `MUST`;
- one backlog per area plus a root `NOW.md` roll-up — against 19;
- content in Traditional Chinese — against 4.

It also keeps `NOW.md` and `INBOX.md` at the root, against principle 1 (a `MUST`), without
naming the deviation. Its log entries carry no `Status:` line: they are written after the event
and have nothing left to land.

After 15 days of use, the layout itself works. The failures are in cadence and routing. `NOW.md`
went stale (a "Week of" 17 days old) because "update when priorities move" names no moment.
Two security checks sat in gitignored scratch because no area fitted a cross-cutting check.
Host configuration for a system that another repo owns was written into this repo's scratch.

## Decision

1. **Principle 25 is widened:** a profile may *map the folder set*. It may replace the
   working-record folders and the backlog's location with a domain layout, and it may name extra
   living files at the root, if its mapping table assigns every replacement folder and file
   exactly one **lifecycle class**. The classes are defined once, in
   `references/profiles/README.md`. Each class carries the core rules of the folder it
   stands in for. `reference/`, `adr/`, `tmp/`, and the optional `memo/` and `note/` are never
   mapped away. Lifecycle rules are still not a profile's to change: dated ⇔ frozen, the
   `Status:` values, and indexes.
2. **Three classes with no core folder.** An **event log** holds records written after the fact
   (a site visit, a call, a quote, a point-in-time check). It is dated, frozen on write, and has
   no `Status:` line; the folder's date-sorted listing is its index. A **capture queue**
   (`INBOX.md`) is emptied as items are filed. **Outside git** covers attachments that
   `CONTEXT.md` locates. Every other class maps to an existing folder's rules.
3. Principles 1, 2, and 19 defer to the declared profile's mapping, citing principle 25.
   Without a mapping, nothing changes.
4. **A `life` profile** (`references/profiles/life.md`), built from `~/life`. Its cadences are
   tied to events: rewrite `NOW.md` in the first session of a week whose `Week of` is more than
   7 days old. A cross-cutting check is an event log in an area made for it. Systems that
   another repo owns get only an index entry here.

## Alternatives rejected

- **Make `life` a profile on the standard folder set** (area logs in `plan/` or `debug/`). That
  splits one subject across lifecycle folders, so finding "everything about the renovation"
  means reading four indexes. `~/life` ADR 0001 rejected this for that reason.
- **No profile; each life-shaped repo keeps its own deviation ADRs.** Every new repo of this
  kind then re-derives the same three or four deviations, and nothing in the skill checks the
  result.
- **Let a profile change any rule.** Class-by-class mapping keeps the rules shared. The three
  new classes cover only material the core folders cannot hold: a record with nothing left to
  land, a queue that empties, and files that stay outside git.

## Consequence

- `~/life` can declare `Profile: life`, and a new ADR there can supersede ADR 0001 §2–4 by
  reference. That is `~/life`'s change to make, and it needs its own approval.
- A future subject-organized domain costs one profile file with a mapping table.
- Risk accepted: mapping widens what a profile can do. The mapping table and the closed class
  list are the guard. A folder with no class is a violation of principle 25.
