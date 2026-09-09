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
A numbered namespace of principles inside `wens-dev-principles` — currently `ui`, `docs`, `cli`,
`debug`, `perf`.
Each has its own `references/<domain>/principles.md` and its own number sequence. Numbers are
frozen per domain: append, never renumber or reuse.
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
_Avoid_: Note, writeup, report
