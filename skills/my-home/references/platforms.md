# Platforms

Commands `init` uses to gather facts. The macOS rows were tested on macOS 26 (2026-11-20).
The Windows and Linux rows come from documentation and have not been tested yet.

## Known folders

| OS | How to find them |
|---|---|
| macOS | `~/Desktop`, `~/Documents`, `~/Downloads`, `~/Movies`, `~/Music`, `~/Pictures`. iCloud Desktop & Documents sync: `ls ~/Library/Mobile\ Documents/com~apple~CloudDocs`. If Desktop/Documents appear there, they are synced |
| Windows | `[Environment]::GetFolderPath('MyDocuments')` (also `Desktop`, `MyPictures`, …). A path under `%OneDrive%` means Known Folder Move redirected it, and the folder is synced. Downloads: `(New-Object -ComObject Shell.Application).NameSpace('shell:Downloads').Self.Path` |
| Linux | `xdg-user-dir DOCUMENTS` (also `DESKTOP`, `DOWNLOAD`, `PICTURES`, …), or read `~/.config/user-dirs.dirs` |

## Trash

| OS | Command |
|---|---|
| macOS | `trash <path>` (built in since macOS 15; otherwise `brew install trash`). Trash lives in `~/.Trash` |
| Windows | PowerShell: `Add-Type -AssemblyName Microsoft.VisualBasic; [Microsoft.VisualBasic.FileIO.FileSystem]::DeleteFile('<path>','OnlyErrorDialogs','SendToRecycleBin')` (`DeleteDirectory` for folders) |
| Linux | `gio trash <path>`, or `trash-put` (trash-cli). Trash lives in `~/.local/share/Trash` |

## Backup status

| OS | Command | Record |
|---|---|---|
| macOS | `tmutil destinationinfo`; `tmutil latestbackup` | "No destinations configured" → `none configured` |
| Windows | File History: `Get-WmiObject -Namespace root/Microsoft/Windows/FileHistory`, or check Settings → Backup. OneDrive-synced folders are **sync, not backup**: deletions propagate | Tool, destination, last date |
| Linux | Look for the configured tool: `systemctl --user list-timers` (restic, borg, Déjà Dup), `crontab -l` | Tool, destination, last date |

## Config locations

| OS | App-owned (hands off) | Owner config |
|---|---|---|
| macOS | `~/Library` | `~/.zshrc`, `~/.config/`, dotfile repo if any |
| Windows | `%APPDATA%`, `%LOCALAPPDATA%` (both under the home) | `$PROFILE`, `~/.config/` |
| Linux | `~/.local/share`, `~/.cache` | `~/.bashrc` / `~/.zshrc`, `~/.config/` |

Find a dotfile manager: `ls -la ~ | grep -- '->'` (symlinks to a repo), `chezmoi source-path`,
`yadm`, or a `~/.dotfiles` / `~/dotfiles` repo.

## Disk

| OS | Command |
|---|---|
| macOS | `df -h ~`; `du -sh ~/* 2>/dev/null \| sort -h \| tail` |
| Windows | `Get-PSDrive C`; `Get-ChildItem ~ -Directory \| ForEach-Object { …measure… }` |
| Linux | `df -h ~`; `du -sh ~/* 2>/dev/null \| sort -h \| tail` |

## Launch alias

Agents treat a session started at `~` differently:

| Agent | Starting at `~` |
|---|---|
| omp | Moves the session to `~/tmp` unless `--allow-home` is given. `~/AGENTS.md` still loads |
| Claude Code | Starts at `~`; loads `~/AGENTS.md` when no `CLAUDE.md` is in cwd or above |
| Codex | With `~/.git`, `~` is the project root; loads `~/AGENTS.md` |

Proposed alias for the owner's shell rc. Add it only on approval:

```sh
alias home='cd ~ && omp --allow-home'   # zsh / bash
```

```powershell
function home { Set-Location ~; omp --allow-home }   # PowerShell $PROFILE
```
