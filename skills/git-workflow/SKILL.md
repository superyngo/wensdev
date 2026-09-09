---
name: git-workflow
description: Use when initializing a GitHub repository or Gist for the current directory, or when committing, pushing, and cutting a tagged release with changelog and version bumps. Covers git init, gh pre-flight checks, skeleton file generation (README, CHANGELOG, LICENSE, .gitignore, PRIVACY.md), remote creation, branch/remote sync, quality gates, semver bump, tagging, and GitHub Release creation.
argument-hint: [init|gist|release] [version]
allowed-tools: Read, Write, Edit, Bash, Grep, Glob, AskUserQuestion, mcp__github__create_pull_request, mcp__github__list_tags, mcp__github__get_latest_release
---

# Git / GitHub Repository Workflow

Two entry points over one shared set of checks:

| Mode | Argument | Purpose | Runs once or repeatedly |
|---|---|---|---|
| **Init** | `init` (or omitted, in a repo with no remote) | Create the GitHub repo, generate skeleton files, first push | Once per project |
| **Gist** | `gist` | Upload the current directory's files as a Gist | Ad hoc |
| **Release** | `release [version]` (or omitted, in a repo that already has a remote) | Commit, push, optionally bump/tag/release | Every release |

If the argument is missing, pick by state: no git repo or no `origin` remote → **Init**;
remote exists → **Release**. If still ambiguous, ask.

---

## Shared: Pre-flight

### S.1 Tool and identity checks

```bash
gh auth status 2>/dev/null
git config user.name 2>/dev/null
git config user.email 2>/dev/null
git remote -v 2>/dev/null
git status 2>/dev/null
```

- **`gh` missing / unauthenticated** → tell the user to run `brew install gh` or `gh auth login`. Stop.
- **git identity missing** → ask for name/email and set it before any commit.
- **No git repository** → `git init && git branch -M main`, then Init mode.
- **Repo, no remote** → `git branch -M main`, then Init mode.
- **Repo with remote, Init requested** → say so, offer to generate only the missing skeleton files, then stop.

### S.2 Project type detection

The single detection table both modes use. Check marker files in order:

| Marker file | Type | Format / lint / test | CI caching |
|---|---|---|---|
| `Cargo.toml` | Rust | `cargo fmt` / `cargo clippy` / `cargo test` | `Swatinem/rust-cache@v2` |
| `package.json` | Node.js | project scripts; `tsc --noEmit` if TS | `actions/setup-node@v4`, `cache: 'npm'` (or pnpm/yarn) |
| `pyproject.toml` / `setup.py` / `requirements.txt` | Python | `ruff format` / `ruff` / `pytest` | `actions/setup-python@v5`, `cache: 'pip'` (or poetry/uv) |
| `go.mod` | Go | `gofmt` / `go vet` / `go test` | `actions/setup-go@v5`, `cache: true` |
| none | Generic | — | standard Actions caching |

Also detect whether the project produces **binary executables** — Rust: `src/main.rs` or
`[[bin]]` in `Cargo.toml`; Go: a `main` package; Node.js: a `bin` field in `package.json`.
This decides whether a release workflow is needed (Init) and whether a tag triggers CI (Release).

---

## Init mode

### I.1 Collect inputs

Ask for the **repository description** (used for `gh repo create --description` and the README)
and **visibility** (Public default / Private).

### I.2 Generate skeleton files

Confirm which to generate; pre-select by project type and skip any that already exist.

**README.md** — H1 project name, description, Usage, License. Include an Installation section
only for binary projects.

**CHANGELOG.md**:

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
```

Keep the heading exactly `## [Unreleased]` — Release mode's step R.5.3 converts it, and
`create-release-workflow`'s `verify-versions` gate greps for the `## [vX.Y.Z]` it becomes.

**LICENSE** — MIT by default, current year. Resolve the copyright holder in this order:
`git config user.name` → `gh api user --jq .login` → ask. Never substitute a literal name; a
wrong copyright line is a legal defect that survives every later commit.

**.gitignore** — by project type: Rust `/target/`, `**/*.rs.bk`; Node `node_modules/`, `dist/`,
`.env`; Python `__pycache__/`, `*.pyc`, `.venv/`, `dist/`, `*.egg-info/`; Go `*.exe`, `*.exe~`,
`*.test`, `vendor/`; generic OS noise (`.DS_Store`, `Thumbs.db`).

**PRIVACY.md**:

```markdown
# Privacy Policy

This application does not collect, store, or transmit any personal data or sensitive user information.

Last updated: <YEAR>-<MONTH>-<DAY>
```

### I.3 Release workflow for binary projects

If the project produces binary executables, it needs `.github/workflows/release.yml`.

**Do not write that YAML here.** Delegate to the `create-release-workflow` skill, which owns
the multi-platform Rust release workflow and carries the hard-won corrections this skill would
otherwise duplicate and drift from: the `verify-versions` consistency gate every build job must
depend on, the bounded timeout + retry wrapper around every `apt-get` step (a bare `apt-get` on
`ubuntu-latest` can hang 10+ minutes with no error), and the `.gitattributes` `* text=auto
eol=lf` file that any matrix containing `windows-latest` requires.

Ask whether to generate it now; if the user defers, note it in the completion summary. If the
project also ships to a platform store, that is a separate follow-up — see
`publishing-platform-stores`.

### I.4 Create the repo and push

```bash
PROJECT_NAME=$(basename "$PWD")

git add -A && git commit -m "chore: initial commit"
gh repo create "$PROJECT_NAME" \
  --public \
  --description "<description>" \
  --source=. --remote=origin --push
```

`--private` instead of `--public` if chosen. Display the repo URL afterwards.

---

## Gist mode

```bash
ls -la    # show candidates
```

Ask which files (default: all non-hidden), a description, and public vs secret.

```bash
gh gist create <files> --desc "<description>" --public   # omit --public for secret
```

Display the Gist URL.

---

## Release mode

### R.1 Branch and sync

```bash
BRANCH=$(git branch --show-current)
```

If `$BRANCH` ≠ `main`, warn and ask (releasing off-main may miss CI/CD or target the wrong ref):

- **Continue on this branch** — release stays on `$BRANCH`.
- **Switch to main** — record `FEAT_BRANCH=$BRANCH` for cleanup in R.6, then:
  ```bash
  FEAT_BRANCH=$BRANCH
  git checkout main && git merge --no-ff "$FEAT_BRANCH"
  BRANCH=main
  ```
  On merge conflict: stop, show conflicts.
- **Cancel**.

Uncommitted changes (`git status --porcelain` non-empty) → ask whether to commit now (R.3);
a release needs a clean tree.

```bash
git fetch origin
git status
```

Behind / diverged / ahead → show the difference and ask how to resolve:

```bash
git log --oneline HEAD..origin/$BRANCH      # remote-ahead commits
git diff HEAD...origin/$BRANCH --stat
```

**Rebase** (`git pull --rebase origin $BRANCH`, recommended) / **Merge** / **Cancel**. On
conflict: stop, show conflicts.

### R.2 Quality gates

Using the S.2 table: **format → lint → type check → test**. All must pass. Auto-fixes are
committed in R.3. If a check fails and cannot auto-fix, ask whether to continue.

### R.3 Commit

```bash
git status && git diff --stat
```

Summarize the changes, propose a commit message, let the user confirm or edit, then
`git add -A && git commit -m "<message>"`.

### R.4 Release or not

```bash
LAST_TAG=$(git describe --tags --abbrev=0 2>/dev/null || echo "")
[ -n "$LAST_TAG" ] && git log $LAST_TAG..HEAD --pretty=format:"%s" \
                   || git log --pretty=format:"%s" --max-count=20
```

Suggested semver bump from Conventional Commits: `BREAKING CHANGE` / `!:` → **major**;
`feat:` → **minor**; everything else → **patch**.

Show last version + change summary + suggested version, then ask:
`[1] suggested version  [2] custom version  [3] push only`. `[3]` → push, then R.6.

### R.5 Cut the release

1. **Normalize** — accept `v1.2.3` or `1.2.3`; use the `v` prefix internally.
2. **Bump every version-bearing file** (no `v` prefix) — Rust `Cargo.toml`, Node
   `package.json`, Python `pyproject.toml`. A workspace whose crates use
   `version.workspace = true` needs only the root, but a bundled web frontend or editor
   extension has its own manifest. Miss one and `create-release-workflow`'s `verify-versions`
   job fails the build.
3. **CHANGELOG.md** — convert `## [Unreleased]` into a dated section, leaving an empty
   `## [Unreleased]` behind:
   ```markdown
   ## [vX.Y.Z] - YYYY-MM-DD
   ### Added / Changed / Fixed / Docs
   - from feat: / refactor:,chore: / fix: / docs: commits
   ```
4. **README.md** — update the version badge or references if present.
5. **Commit and tag**:
   ```bash
   git add -A
   git commit -m "chore: release vX.Y.Z"
   git tag -a vX.Y.Z -m "Release vX.Y.Z

   <release notes>"
   ```
6. **Push**: `git push origin $BRANCH && git push origin --tags`
7. **Auto-release detection**: `[ -f .github/workflows/release.yml ] && echo auto || echo manual`
   - **auto** — GitHub Actions creates the Release; give the Actions link
     `https://github.com/<owner>/<repo>/actions` and skip step 8. If the run fails, see
     `create-release-workflow` §Diagnosing a Failed Release Run before retagging.
   - **manual** — continue.
8. **Create the Release manually.** Priority: GitHub MCP → `gh` CLI → link.
   ```bash
   gh release create vX.Y.Z --title "Release vX.Y.Z" --notes "<notes>"
   ```
   Fallback: `https://github.com/<owner>/<repo>/releases/new?tag=vX.Y.Z`
9. **Report** updated files, tag, push status, and the Release / Actions link.

### R.6 Clean up the feature branch

If `FEAT_BRANCH` was set in R.1 and the release succeeded, ask before removing the merged
local branch:

```bash
git branch -d "$FEAT_BRANCH"   # -d is safe; refuses if unmerged
```

Use `-d` only, never `-D`. If git refuses, report and leave the branch.

---

## Error Handling

- Any git operation fails → show the error, stop.
- Repository name already exists → ask for a different name, or set the existing repo as remote.
- No auto workflow and no GitHub MCP → `gh` CLI → manual link.
- A file update fails → ask whether to continue.

---

## Notes

**Semver** — major = breaking; minor = backward-compatible feature; patch = backward-compatible fix.

**Branch protection** — a direct push to a protected `main` may fail.

**Auto-release** — triggered by the tag push, e.g. `on: { push: { tags: ["v*.*.*"] } }`. If the
project uses another filename (`ci.yml`, `build.yml`), adjust the R.5.7 detection.

## Companion Skills

- `create-release-workflow` — generates and diagnoses `.github/workflows/release.yml`.
- `publishing-platform-stores` — store submission workflows hanging off that release.

## Usage

```bash
/git-workflow                # pick mode from repo state
/git-workflow init           # create the GitHub repository
/git-workflow gist           # upload files as a Gist
/git-workflow release        # commit + ask whether to release
/git-workflow release v1.3.0 # release a specific version
```
