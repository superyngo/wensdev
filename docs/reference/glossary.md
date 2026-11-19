# Glossary

Canonical vocabulary for this repo. Code identifiers, document headings, and commit messages
use these terms. Introducing a new term means adding its entry in the same commit.

**Skill**:
One directory under `skills/`, containing a `SKILL.md` and whatever supporting files it needs.
The unit of installation and the unit of triggering — an agent loads a whole skill or none of
it. Named in kebab-case matching its directory.
_Avoid_: Module, plugin, pack

**SKILL.md**:
The single required file in a skill: YAML frontmatter (`name`, `description`, optionally
`allowed-tools`, `argument-hint`) followed by the router body. Always this exact filename.
_Avoid_: Manifest, index, entrypoint file

**Description**:
The frontmatter field an agent reads to decide whether to load a skill. It is permanently
resident in the agent's context for every installed skill, so its length is a shared cost paid
on every request, not a per-use cost. Written as trigger conditions, not as a summary.
_Avoid_: Summary, blurb, abstract

**Router**:
The body of a `SKILL.md`: enough to decide *which* reference to open, and nothing more. A router
holds no payload a reference could hold. A `SKILL.md` that inlines a large artifact has stopped
being a router.
_Avoid_: Dispatcher, index, table of contents

**Reference**:
A file under a skill's `references/` holding the detail a router points at. Loaded only when the
task actually needs it. Not to be confused with `docs/reference/`, which is this repo's own
source of truth about itself.
_Avoid_: Doc, guide, appendix

**Domain**:
A numbered namespace of principles inside `wens-dev-principles` — currently `ui`, `cli`,
`debug`, `perf`, `agents`. (The former `docs` domain is now the `repo-docs` skill; see
[ADR 0003](../adr/0003-docs-domain-becomes-the-repo-docs-skill.md).)
Each has its own `references/<domain>/principles.md` and its own number sequence. Numbers may
be renumbered to keep a domain organized.
_Avoid_: Category, section, area

**Grade**:
The importance tag on a principle — `MUST`, `SHOULD`, or `CONSIDER` — that determines what
deviating from it costs (an ADR, a commit-body reason, or nothing).
_Avoid_: Severity, priority, level

**Payload**:
Content a skill carries because a consumer of that skill needs it — references, and the
skill-local `CONTEXT.md`/`docs/adr/` that explain the pattern it teaches. Payload travels with
the skill when it is installed alone; repo-level documentation does not.
_Avoid_: Assets, bundled docs

**Changelog entry**:
A bullet under `## [Unreleased]` in `CHANGELOG.md`, grouped beneath a `### YYYY-MM-DD`
sub-heading. The `## [Unreleased]` spelling is a tooling contract, not a style choice — release
tooling converts it and a CI gate greps for what it becomes. See
[ADR 0002](../adr/0002-changelog-uses-keep-a-changelog-headings.md).
_Avoid_: Release note, update entry

**Working record**:
A document in `docs/spec/`, `docs/plan/`, `docs/debug/`, or `docs/audit/`. Opens with a
`Status:` line, is named `YYYY-MM-DD-kebab-title.md`, and freezes when it lands — after which
only its `Status:` line may change.
_Avoid_: Note (a `docs/note/` file, not a record), writeup, report

**Note** (repo-docs):
A living, topic-named, undated file in a repo's `docs/note/` holding knowledge that holds beyond
that repo's own systems — tool or platform behavior, a gotcha. Explains why; the steps live in
`reference/`. Ends with `## Cases` linking the records where it was learned. Distinct from a
working record. See [ADR 0005](../adr/0005-repo-docs-gains-profiles-note-folder-and-adr-scope.md).
_Avoid_: Lessons learned, tip, knowledge-base article

**Profile** (repo-docs):
A repo's primary kind of work (`dev`, `ops`, `life`, …), declared on a `Profile:` line in its
`CONTEXT.md`. A profile file under `skills/repo-docs/references/profiles/` sets what each docs
folder holds, the cadences, and the ADR scope for that domain, and may map the folder set
through **Lifecycle classes** (ADR 0006); never the lifecycle rules.
Distinct from a **Domain** of `wens-dev-principles`.
_Avoid_: Domain, mode, flavor

**Lifecycle class** (repo-docs):
One of the closed list in `skills/repo-docs/references/profiles/README.md` (living canonical,
living tracker, working record, event log, decision, capture queue, scratch, human-owned,
outside git). A profile that maps the folder set assigns each mapped folder or file exactly one,
and that class's rules apply. See [ADR 0006](../adr/0006-repo-docs-profiles-may-map-the-folder-set.md).
_Avoid_: Folder type, kind
