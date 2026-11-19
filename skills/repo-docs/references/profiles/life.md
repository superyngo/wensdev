# Profile: life

## Applies when

The repo is a person's base: renovation, a house sale, a pregnancy, an exam, work, plus
indexes into the person's other repos and file stores. It has no code and no releases. The
agent acts as an assistant for details and follow-through, and **the owner decides scope**.
Compared with `dev`: work is organized by **subject**, not by document lifecycle; most records
are written after something happened (a site visit, a call, a quote); facts arrive in
conversation and are lost unless filed at once; and the content is names, dates, prices, and
people, usually in the owner's language.

This profile **maps the folder set** (principle 25). Built from `~/life`.

## What each folder holds

| Path | Lifecycle class | Holds |
|---|---|---|
| Root `NOW.md` | Living tracker (roll-up) | This week's focus, at most 10 rows, each linking an area `BACKLOG.md` row; a `Week of YYYY-MM-DD` line; key dates ahead |
| Root `INBOX.md` | Capture queue | Anything not yet filed; the assistant files each line into an area and deletes it here |
| `areas/<area>/README.md` | Living canonical | The area's current state: what, where, who, constraints; links its `decisions/` |
| `areas/<area>/BACKLOG.md` | Living tracker | The area's one open-work tracker: `Open`, `Awaiting external` (a vendor's quote, a bank), `Watching` (someday items), and `Done` with date (principle 19). Row columns are `Due`, `Item`, `Notes`; evidence is a link to the log entry, and the code-specific fields (file and symbol, effort) do not apply |
| `areas/<area>/log/YYYY-MM-DD-kebab.md` | Event log | A site visit, call, quote, evaluation, or point-in-time check, written after the fact |
| `areas/<area>/decisions/NNNN-kebab.md` | Decision | A life choice that is expensive to reverse (see ADR scope) |
| `areas/<area>/files/` | Outside git | Attachments: photos, PDFs, archived listings; synced to a backup host |
| `docs/reference/glossary.md` | Living canonical | People, vendors, places, properties, terms, each with `_Avoid_:` names |
| `docs/adr/` | Decision | Decisions about the base itself |
| `docs/memo/` | Human-owned | The owner's notes |
| `docs/tmp/` | Scratch | Principle 13 |

- Areas are kebab-case nouns (`renovation`, `house-sale`, `baby`); time-boxed ones carry the
  year (`exam-ipas-2026`). A **check that touches no area** (an email-breach lookup, a repo
  secret scan) gets an area made for it (e.g. `digital-security/`), and its result is an event
  log there, never left in scratch.
- **Index, not truth, for other repos.** Systems that another repo owns (home servers in an
  ops repo, projects in `~/repos/*`) get an index area that links that repo's truth (principle
  5). Their facts, records, and scratch go in the owning repo.
- `CONTEXT.md` keeps a **path index** to stores outside git (large-file drive, media folders),
  so "where does this go" has one answer.
- Secrets never enter the repo: no ID, account, or card numbers and no passwords. Reference
  where they are kept. A vendor's business phone number in the glossary is fine.
- Conduct belongs in the agent instruction file (principle 3): the reply language, "the owner
  decides scope; do not pre-plan items unasked", and **every new fact, date, decision, or
  contact is written to its file in the same turn**.

## Optional folders

- `memo/`: **expected.** When the owner says "memo", write it there as given, then offer to
  extract the actionable facts into the area `README.md`, `BACKLOG.md`, a log entry, or the
  glossary. Do the extraction directly when it is clear-cut. The memo stays as written
  (principle 22).
- `note/`: rarely. General know-how (e.g. how a waterproofing product behaves) goes in a note
  only when a second area needs it.

## Cadences

- **NOW rewrite:** at the first session of a week whose `Week of` date is more than 7 days old,
  before any other work. Empty `INBOX.md` in the same pass, and re-check waiting rows in each
  area `BACKLOG.md`. "Update when priorities move" names no moment and does not fire.
- **tmp sweep:** at the first NOW rewrite of each month (principle 13).
- **Key dates:** `NOW.md` lists dates ahead (handover, due date, contract expiry). A date that
  has passed is resolved into its area during the rewrite.

## ADR scope

- **Never a decision:** scheduling, vendor contact details, quotes, shopping lists, and the
  order of trades. These go in the log, the glossary, or `BACKLOG.md`.
- **Area `decisions/`:** a life choice that is expensive to reverse and meant to stay fixed:
  hiring a contractor, signing a contract, a purchase, where to live or give birth. Record it
  when the owner has decided, not while options are being compared; a comparison is an event
  log.
- **`docs/adr/`:** the base itself: its layout, the content language (principle 4), privacy and
  backup policy, and what the agent may do on its own.

## Changelog and commits

- No versions. `CHANGELOG.md` is `## [Unreleased]` with one `### YYYY-MM-DD` heading per day;
  archive by year once the file's growth shows the need (principle 18).
- Commit prefixes name the area: `docs(<area>):` for area changes, `docs:` for base-wide ones.
  Commit after each change set.

## Common mistakes

- A fact, date, or phone number mentioned in conversation and never filed, so the next session
  starts without it (violates 24).
- `NOW.md` still showing a week that ended long ago, while the tmp sweep chained to it never
  runs (violates 13).
- A security or account check written in gitignored scratch and reported as done (violates 14).
- Scratch or records for a system that another repo owns written here, where its truth does not
  live (violates 5).
- An ID number, account number, or password written into an area file, or an attachment
  committed instead of placed in `files/` (violates 25: outside git class).
- A memo treated as a decision or as a fact, or memo content acted on without the owner asking
  (violates 22).
- A `decisions/` entry for a vendor's quote or a visit date, which is an event log (violates 16).
