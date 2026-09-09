---
name: github-init
description: Use when initializing a new GitHub repository or Gist for the current directory. Handles git init, pre-flight checks, standard skeleton file generation (README, CHANGELOG, LICENSE, .gitignore, PRIVACY.md, release workflow), remote creation, and initial push.
argument-hint: [repo|gist]
allowed-tools: Read, Write, Edit, Bash, Grep, Glob, AskUserQuestion
---

# GitHub Initialization Workflow

Initialize a GitHub remote repository or Gist for the current directory and generate standard project skeleton files.

---

## Step 0: Determine Mode

Determine execution flow based on argument:
- Argument is `gist` → Skip directly to Step 5 (Gist Workflow).
- Argument is `repo` or omitted → Execute Repository Workflow.
- If ambiguous, ask user: "Create a GitHub Repository or Gist?"

---

## Step 1: Pre-flight & Git Health Checks

Run pre-flight checks for `gh` authentication and Git status:

```bash
# Check GitHub CLI authentication status
gh auth status 2>/dev/null

# Check Git configurations and remotes
git config user.name 2>/dev/null
git config user.email 2>/dev/null
git remote -v 2>/dev/null
git status 2>/dev/null
```

Handling pre-flight results:
- **`gh` CLI not installed/authenticated**: Prompt user to install `gh` (`brew install gh`) or authenticate (`gh auth login`).
- **Git user configuration missing**: Ask user for name/email or set sensible defaults before committing.
- **No Git repository**: Run `git init && git branch -M main`, then proceed.
- **Git repo exists, no remote**: Ensure default branch is set (`git branch -M main`), then proceed to Step 2.
- **Git repo exists with remote**: Inform user that a remote already exists, ask whether to generate missing skeleton files only, then exit.

---

## Step 2: Detect Project Type

Check for marker files in order:

| Marker File | Project Type | Caching Recommendation |
|---|---|---|
| `Cargo.toml` | Rust | `Swatinem/rust-cache@v2` |
| `package.json` | Node.js | `actions/setup-node@v4` with `cache: 'npm'` (or `pnpm`/`yarn`) |
| `go.mod` | Go | `actions/setup-go@v5` with `cache: true` |
| `pyproject.toml` / `setup.py` / `requirements.txt` | Python | `actions/setup-python@v5` with `cache: 'pip'` (or `poetry`/`uv`) |
| None | Generic | Standard GitHub Actions caching as needed |

Also detect if the project produces **binary executables**:
- **Rust**: Presence of `src/main.rs` or `[[bin]]` in `Cargo.toml`.
- **Go**: `main` package.
- **Node.js**: Presence of `bin` field in `package.json`.

---

## Step 3: Generate Skeleton Files

Prompt user to confirm which files to generate (pre-selected based on project type, skipping existing files):

### Standard Required Files (All Repositories)

**README.md** (if missing):

```markdown
# <project-name>

<description>

## Installation

### Via wenget

```bash
wenget add <project-name>
```

### Windows (PowerShell)
```powershell
$env:APP_NAME="<project-name>"; $env:REPO="superyngo/<project-name>"; irm https://gist.githubusercontent.com/superyngo/a6b786af38b8b4c2ce15a70ae5387bd7/raw/gpinstaller.ps1 | iex
```

### Linux / macOS (Bash)
```bash
APP_NAME="<project-name>" REPO="superyngo/<project-name>" curl -fsSL https://gist.githubusercontent.com/superyngo/a6b786af38b8b4c2ce15a70ae5387bd7/raw/gpinstaller.sh | bash
```

## Usage

...

## License

MIT
```

> **Note**: Include Installation section only if project is a binary project. Description is obtained from user in Step 4.

**CHANGELOG.md** (if missing):

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
```

**LICENSE** (if missing) — MIT, author from `git config user.name` (fallback: `wen`), current year:

```
MIT License

Copyright (c) <YEAR> <AUTHOR>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

**.gitignore** (if missing) — Based on project type:

- **Rust**:
  ```
  /target/
  **/*.rs.bk
  ```
- **Node.js**:
  ```
  node_modules/
  dist/
  .env
  ```
- **Python**:
  ```
  __pycache__/
  *.pyc
  .venv/
  dist/
  *.egg-info/
  ```
- **Go**:
  ```
  *.exe
  *.exe~
  *.test
  vendor/
  ```
- **Generic**: Empty or standard OS file ignores (`.DS_Store`, `Thumbs.db`).

**PRIVACY.md** (if missing):

```markdown
# Privacy Policy

This application does not collect, store, or transmit any personal data or sensitive user information.

Last updated: <YEAR>-<MONTH>-<DAY>
```

### Additional Files for Binary Projects

If the project produces binary executables, it needs `.github/workflows/release.yml`.

**Do not write that YAML here.** Delegate to the `create-release-workflow` skill, which owns
the multi-platform Rust release workflow and carries the hard-won corrections this skill would
otherwise duplicate and drift from: the `verify-versions` consistency gate every build job must
depend on, the bounded timeout + retry wrapper around every `apt-get` step (a bare `apt-get` on
`ubuntu-latest` can hang 10+ minutes with no error), and the `.gitattributes` `* text=auto
eol=lf` file that any matrix containing `windows-latest` requires.

Ask the user whether to generate the release workflow now:

- **Yes** → invoke `create-release-workflow` and let it collect binary name, target platforms,
  and build features. Return here afterwards for Step 4.
- **Not now** → note in the completion summary that the project still needs a release workflow.

If the project also ships to a platform store (Microsoft Store, VS Marketplace, Google Play,
Chrome Web Store, …), that is a separate follow-up — see `publishing-platform-stores`.

---

## Step 4: Create GitHub Repo and Push

Before generating skeleton files, collect information from the user:

1. **Repository Description** (used for `gh repo create --description` and `README.md`)
2. **Visibility**: Public (default) or Private?

```bash
PROJECT_NAME=$(basename "$PWD")

gh repo create "$PROJECT_NAME" \
  --public \
  --description "<user-provided description>" \
  --source=. \
  --remote=origin \
  --push
```

- If user chooses Private, replace `--public` with `--private`.
- Display the Repo URL after pushing.

**Execution Order**:

1. Prompt user for description and visibility.
2. Generate skeleton files (fill `README.md` with description).
3. Perform initial commit (`git add -A && git commit -m "chore: initial commit"`).
4. Create GitHub repository and push (`git push -u origin main`).

---

## Step 5: Gist Workflow (When Argument is `gist`)

```bash
# Display files in current directory for selection
ls -la

# Prompt user for:
# 1. Which files to upload (default: all non-hidden files)
# 2. Gist description
# 3. Public or Secret? (default: Public)

gh gist create <files> --desc "<description>" --public
# Or omit --public for secret Gist:
gh gist create <files> --desc "<description>"
```

Display Gist URL after creation.

---

## Step 6: Completion Summary

```
✓ Git repository initialized (default branch: main)
✓ Skeleton files generated: README.md, CHANGELOG.md, LICENSE, .gitignore, PRIVACY.md [, .github/workflows/release.yml]
✓ GitHub repository created: https://github.com/superyngo/<project-name>
✓ Initial commit pushed to main branch

Next Steps:
- Edit README.md to complete project documentation
- Prepare for version release using /git-release
```

---

## Error Handling

- `gh` CLI not installed → Prompt user: `brew install gh` or visit https://cli.github.com
- `gh` not authenticated → Prompt user to run `gh auth login`
- Repository name exists → Inform user and ask to use a different name or set existing repo as remote
- Git operation fails → Display detailed error message and abort workflow

---

## Usage Examples

```bash
# Initialize GitHub repository for current directory (auto-detect project type)
/github-init

# Explicitly specify repository creation
/github-init repo

# Upload current directory files as a Gist
/github-init gist
```
