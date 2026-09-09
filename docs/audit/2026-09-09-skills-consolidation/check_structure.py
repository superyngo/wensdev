#!/usr/bin/env python3
"""Structural checks for the wensdev skills repo.

Standard library only, no build step, so it still runs after the code moves on.
Usage: uv run --python 3.14 python3 check_structure.py [repo_root]
"""
import re
import sys
from pathlib import Path

DESC_LIMIT = 550
REQUIRED = ("name", "description", "allowed-tools")
LINK = re.compile(r"\[[^\]]*\]\(([^)#][^)]*)\)")
FENCE = re.compile(r"^\s*```")


def prose(text):
    """Drop fenced code blocks: templates inside them are illustrative, not real links."""
    out, inside = [], False
    for line in text.splitlines():
        if FENCE.match(line):
            inside = not inside
            continue
        out.append("" if inside else line)
    return out


def frontmatter(text):
    if not text.startswith("---\n"):
        return None
    end = text.find("\n---\n", 3)
    if end == -1:
        return None
    out = {}
    for line in text[4:end].splitlines():
        if ":" in line and not line.startswith(" "):
            k, v = line.split(":", 1)
            out[k.strip()] = v.strip()
    return out


def main(root):
    fails = []
    skills = sorted(p for p in (root / "skills").iterdir() if p.is_dir())
    print(f"skills: {len(skills)}")

    for s in skills:
        f = s / "SKILL.md"
        if not f.is_file():
            fails.append(f"{s.name}: no SKILL.md")
            continue
        fm = frontmatter(f.read_text(encoding="utf-8"))
        if fm is None:
            fails.append(f"{s.name}: unparseable frontmatter")
            continue
        for key in REQUIRED:
            if key not in fm:
                fails.append(f"{s.name}: missing frontmatter '{key}'")
        if fm.get("name") != s.name:
            fails.append(f"{s.name}: frontmatter name is {fm.get('name')!r}")
        n = len(fm.get("description", ""))
        if n > DESC_LIMIT:
            fails.append(f"{s.name}: description {n} chars > {DESC_LIMIT}")

    # every relative markdown link resolves
    for md in root.rglob("*.md"):
        if ".git/" in str(md):
            continue
        for target in LINK.findall("\n".join(prose(md.read_text(encoding="utf-8")))):
            if "://" in target or target.startswith("mailto:"):
                continue
            if not (md.parent / target.split("#")[0]).exists():
                fails.append(f"{md.relative_to(root)}: dead link -> {target}")

    # no references to skills that no longer exist
    names = {s.name for s in skills}
    # Scoped to skills/ and README.md: historical prose in docs/ may name a removed skill,
    # but a live pointer to one is a broken handoff.
    targets = list((root / "skills").rglob("*.md")) + [root / "README.md"]
    for gone in {"dev-prompt", "github-init", "git-release"} - names:
        for md in targets:
            for i, line in enumerate(md.read_text(encoding="utf-8").splitlines(), 1):
                if re.search(rf"\b{re.escape(gone)}\b", line):
                    fails.append(f"{md.relative_to(root)}:{i}: stale ref to {gone}")

    total = sum(len(frontmatter((s / "SKILL.md").read_text(encoding="utf-8")).get("description", ""))
                for s in skills)
    print(f"resident description budget: {total} chars")

    for x in fails:
        print(f"FAIL {x}")
    print("OK" if not fails else f"{len(fails)} failure(s)")
    return 1 if fails else 0


if __name__ == "__main__":
    sys.exit(main(Path(sys.argv[1] if len(sys.argv) > 1 else ".").resolve()))
