# Profiles

A **profile** is a repo's primary kind of work. The principles in
[../principles.md](../principles.md) are domain-neutral; a profile maps one domain onto them
(principle 25). It may change what a folder **holds** and **when** things happen. It never
changes the lifecycle rules: the folder set, dated ⇔ frozen, the `Status:` values, the indexes.

A repo declares its profile on a `Profile:` line in root `CONTEXT.md`. Several may be listed,
primary first; the primary decides cadences when they conflict. No line means `dev`.

| Profile | Applies when | File |
|---|---|---|
| `dev` | The repo ships software: code, releases, versions | [dev.md](dev.md) |
| `ops` | The repo runs existing systems: hosts, services, accounts, patches, compliance, with no releases | [ops.md](ops.md) |

## Profile file contract

Every profile file has these sections, in this order, so profiles can be compared side by side.
Leave a section as "Core rules apply." rather than dropping it.

1. `## Applies when`: how to recognize the domain, and how it differs from `dev`.
2. `## What each folder holds`: a table of folder → content in this domain.
3. `## Optional folders`: whether `note/` and `memo/` are expected.
4. `## Cadences`: the tmp sweep trigger (principle 13) and any other recurring trigger.
5. `## ADR scope`: what counts as procedure (never an ADR) and what counts as ADR-worthy here
   (principle 16).
6. `## Changelog and commits`: changelog shape (principle 18) and commit prefixes.
7. `## Common mistakes`: domain-specific mistakes, each citing the principle it violates.

## Adding, changing, or removing a profile

- **Add:** write `<name>.md` to the contract, add a row to the table above and to the Profiles
  table in [../../SKILL.md](../../SKILL.md), and add a changelog entry. Build the profile from
  one real repo's practice; do not design one in the abstract.
- **Change:** edit the profile file in place. A change that would alter a lifecycle rule
  belongs in the principles instead, not in a profile.
- **Remove:** delete the file and both table rows in one commit. Repos still declaring that
  profile fall back to `dev`, so say so in the changelog entry.
