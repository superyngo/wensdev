# Changelog

## Unreleased Update

- 2026-09-02: Initial migration of `wens-dev-principles`, `vscode-dev-experience-pack`,
  `rust-crossplatform-app`, `publishing-platform-stores`, `github-init`, `dev-prompt`,
  `create-release-workflow`, and `git-release` from `wenskills` into this new bundled
  skills repo. Content unchanged in this migration.
- 2026-09-09: Removed the 326-line `release.yml` embedded in `github-init`, which duplicated
  `create-release-workflow` in a stale form (no `verify-versions` gate, bare `apt-get` steps,
  no `.gitattributes`); it now delegates. Added the missing cross-references between
  `rust-crossplatform-app`, `publishing-platform-stores`, `create-release-workflow`, and
  `vscode-dev-experience-pack`. Gave every skill an `allowed-tools` line and trimmed
  `wens-dev-principles`'s 1053-char description.
