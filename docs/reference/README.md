# Reference

Current behavior only. Anything historical — a superseded design, a shipped plan, a resolved
investigation — lives in `../spec/`, `../plan/`, `../debug/`, or `../audit/`, not here.

- **[glossary.md](glossary.md)** — canonical vocabulary; read first.
- **[skill-anatomy.md](skill-anatomy.md)** — the required shape of a skill in this repo.

Machine-checked: `skill-anatomy.md`'s structural rules by
[`../../scripts/check_structure.py`](../../scripts/check_structure.py)
(`uv run --python 3.14 python3 scripts/check_structure.py`). The frozen original stays in
`../audit/2026-09-09-skills-consolidation/` as that audit's repro.

See also [`../adr/`](../adr/README.md) for decision records.
