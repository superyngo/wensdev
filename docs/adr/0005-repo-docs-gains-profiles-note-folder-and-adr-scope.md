# 0005 — `repo-docs` gains profiles, an optional `docs/note/` folder, and an ADR scope test

Date: 2026-11-19

## Context

`repo-docs` was written for software repos. An operations repo built on it (`maintain`: hosts,
patches, CVE responses, compliance) showed four places where it did not fit:

- It had to add `docs/note/` for cross-system tool knowledge. Because principle 2 is `MUST`,
  that took a deviation ADR in that repo.
- It wrote three ADRs about package-install methods within about two weeks (0003 → 0006 → 0007),
  each superseding the last, while it was still learning the procedure. Its owner then ruled
  that procedures go in the runbook and notes, not in ADRs.
- With no releases, the tmp sweep "at each release" never came. That repo moved it to a weekly
  trigger.
- Folders meant different things there: `plan/` was a method of procedure with an execution
  log, and `audit/` held CVE and compliance work.

More domains are expected (e.g. a life-assistant repo), so the fix must be easy to extend.

## Decision

1. **Profiles.** The principles stay domain-neutral. `references/profiles/<name>.md` maps one
   domain onto them: folder contents, optional folders, cadences, ADR scope, changelog and
   commit conventions. Every profile file follows a fixed section contract. A repo declares its
   profile on a `Profile:` line in `CONTEXT.md`, and the default is `dev`. A profile never
   changes lifecycle rules. This is principle 25 (`SHOULD`).
2. **`docs/note/`**, principle 23 (`SHOULD`), is optional and admitted by principle 2:
   - living and undated, one file per topic, canonical for what it states;
   - ends with `## Cases`;
   - no catch-all lessons file.
3. **Finding routing**, principle 24 (`SHOULD`):
   - each piece of a finding goes home by its nature;
   - a lesson edits the procedure step itself;
   - records and notes link both ways.
4. **ADR scope**, added to principle 16:
   - an ADR needs both: expensive to reverse, and meant to stay fixed;
   - procedures never get an ADR;
   - in development, weigh the stage and the room left to switch;
   - when in doubt, write it in `reference/` first.
5. All new principles are appended, so no existing number or citation moves.

## Alternatives rejected

- **Fork an ops variant of the skill.** That gives two copies of the lifecycle rules to keep
  in sync. Profiles share the rules and differ only in meaning and cadence.
- **Name the folder `knowledge/` or `kb/`.** `maintain` already uses `note/` and cites it.
  ADR 0004 rejected `note` only as the name for the human's memo folder. The glossary's
  `_Avoid_: Note` on Working record now names the distinction instead.
- **Call profiles "domains".** "Domain" already means a `wens-dev-principles` principle set.
- **Leave ADR scope to judgement.** The churn above happened under exactly that rule.

## Consequence

- `maintain` no longer needs its `note/` deviation ADR; retiring it is that repo's call.
- A new domain costs one profile file plus one row in each of the two profile tables.
- Risk accepted: a profile could drift into rewriting lifecycle rules. The contract forbids it,
  and such a change belongs in the principles.
