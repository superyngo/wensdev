# Skill Anatomy

The required shape of a skill in this repo. Enforced by
[`../audit/2026-09-09-skills-consolidation/check_structure.py`](../audit/2026-09-09-skills-consolidation/check_structure.py).

## Files

```
skills/<name>/
  SKILL.md            required
  references/*.md     optional — detail the router points at
  CONTEXT.md          optional — a glossary for the skill's own domain vocabulary
  docs/adr/*.md       optional — decisions about the pattern the skill teaches
  scripts/            optional — self-contained, no repo build step
```

`<name>` is kebab-case and equals the frontmatter `name`.

## Frontmatter

| Field | Required | Notes |
|---|---|---|
| `name` | yes | Matches the directory name exactly |
| `description` | yes | Trigger conditions, not a summary. Keep under ~550 characters — every skill's description is resident in the agent's context on every request |
| `allowed-tools` | yes | The narrowest set the skill actually needs |
| `argument-hint` | only for command-shaped skills | e.g. `[init\|gist\|release] [version]` |

## Body

The body is a router. It states when the skill applies, then dispatches to references.

- No large artifact inlined in `SKILL.md`. A workflow file, a long template, or a table that
  only one task needs belongs in `references/`, or belongs to another skill that already owns
  it. The failure this rule exists to prevent: `github-init` once inlined a 326-line
  `release.yml` that `create-release-workflow` owned, and the copy silently rotted into a
  version missing three fixes the original had learned — see
  [`../audit/2026-09-09-skills-consolidation.md`](../audit/2026-09-09-skills-consolidation.md).
- One owner per topic. If two skills would both explain a thing, one owns it and the other
  links.
- Every skill that presupposes or hands off to another names it, so no skill is reachable only
  by the agent guessing it exists.
