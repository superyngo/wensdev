# CLI Principles

Conventions for command-line programs: how a command behaves when the user has not given it
enough to work with, and where it is allowed to write files. Applies to any binary or script a
user invokes from a shell, on any platform.

## Index

| # | Grade | Principle |
|---|---|---|
| 1 | SHOULD | Missing required arguments degrade to interactive selection or full help, never a bare error |
| 2 | MUST | User-level application files follow the XDG Base Directory Specification, with per-platform defaults |

## A. Argument handling

1. **[SHOULD]** A command invoked without its required arguments does not print a one-line
   usage error and exit. It degrades along one of two paths, chosen by the shape of what is
   missing:

   - **Enumerable choice** — the missing argument is one value from a list the program already
     knows (a subcommand, a profile name, a detected target, a file in the working directory).
     Present an interactive menu with arrow-key selection (`inquirer`, `fzf`, `dialoguer`, or
     the stack's equivalent) and let the user pick.
   - **Not enumerable** — the missing argument is free-form text, a nested structure, or a
     mixture of types the program cannot offer a closed list for. Print the full `--help`
     output, exactly as `-h`/`--help` would.

   Two constraints on the interactive path. It is only reachable when stdin is an interactive
   terminal — when the program is being piped, redirected, or run in CI, fall back to the help
   text and a non-zero exit so scripts fail loudly instead of blocking on a prompt no one can
   answer. And it never invents a default: an interactive menu is a way to *ask*, not a way to
   guess.

## B. File placement

2. **[MUST]** User-level application files go where the platform expects them, resolved in this
   order: (1) the XDG environment variable, if set; (2) the platform default below; (3) a
   legacy path the application previously used, read-only, migrated forward on first write.
   Never scatter dotfiles or state directories directly in `$HOME` on any platform, and never
   hardcode `~/.config` on Windows or macOS.

   | Kind | XDG variable | Linux/BSD default | macOS default | Windows default |
   |---|---|---|---|---|
   | Config | `XDG_CONFIG_HOME` | `~/.config/<app>` | `~/Library/Application Support/<app>` | `%APPDATA%\<app>` |
   | Data | `XDG_DATA_HOME` | `~/.local/share/<app>` | `~/Library/Application Support/<app>` | `%APPDATA%\<app>` |
   | State | `XDG_STATE_HOME` | `~/.local/state/<app>` | `~/Library/Application Support/<app>` | `%LOCALAPPDATA%\<app>` |
   | Cache | `XDG_CACHE_HOME` | `~/.cache/<app>` | `~/Library/Caches/<app>` | `%LOCALAPPDATA%\<app>\cache` |
   | Runtime | `XDG_RUNTIME_DIR` | that dir, or a `0700` temp dir | temp dir | `%TEMP%` |

   The distinction that gets collapsed most often: **config** is user-authored and worth backing
   up; **data** is application-authored and worth backing up; **state** is application-authored
   and disposable but should survive a reboot (logs, history, window geometry); **cache** is
   disposable at any moment. Deleting the cache directory must never lose anything. Prefer a
   maintained library (`directories`/`dirs` in Rust, `platformdirs` in Python) over
   re-deriving this table by hand.

## Common Mistakes

- Exiting with `error: missing argument <TARGET>` when `<TARGET>` is one of four known values
  the program could have offered as a menu (violates 1).
- Blocking on an interactive prompt inside CI because the TTY check was never written
  (violates 1).
- Hardcoding `~/.config/<app>` on every platform, or dropping `~/.<app>rc` into `$HOME`
  (violates 2).
- Writing logs and history into the cache directory, so clearing the cache destroys them
  (violates 2).
