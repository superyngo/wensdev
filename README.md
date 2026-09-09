# wensdev

Bundled Claude/agent skills for cross-project software development workflow: setting up a
project's engineering conventions, building a Rust cross-platform app, debugging VS Code
extensions, initializing a GitHub repo, cutting releases, and publishing to platform stores.

Start at [`CONTEXT.md`](CONTEXT.md) for how this repo is organized.

## Skills

- `wens-dev-principles` — cross-project UI, documentation-layout, and CLI engineering principles.
- `rust-crossplatform-app` — blueprint for one Rust codebase shipping to CLI/TUI/web/desktop/mobile/extension.
- `vscode-dev-experience-pack` — VS Code extension debugging and data-collection playbooks.
- `create-release-workflow` — generate a multi-platform Rust GitHub Actions release workflow.
- `publishing-platform-stores` — wire store submission (Microsoft Store, App Store, VS Marketplace, etc.) into a release pipeline.
- `git-workflow` — initialize a GitHub repo or Gist; commit, push, tag, and cut a release.

Migrated from `wenskills` on 2026-09-02, then consolidated from 8 skills to 6 on 2026-09-09
(see [`docs/audit/2026-09-09-skills-consolidation.md`](docs/audit/2026-09-09-skills-consolidation.md)).

## License

MIT — see [`LICENSE`](LICENSE).
