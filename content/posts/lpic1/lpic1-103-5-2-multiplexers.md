---
title: "LPIC-1 103.5 — nohup, screen and tmux (Part 2)"
date: 2026-04-16
description: "Surviving logout with nohup, GNU Screen sessions, tmux sessions and panes. LPIC-1 exam topic 103.5."
tags: ["Linux", "LPIC-1", "nohup", "screen", "tmux", "multiplexer"]
categories: ["LPIC-1"]
page_lang: "en"
lang_pair: "/posts/lpic1/ru/lpic1-103-5-2-multiplexers/"
---

> **Exam weight: 4** — LPIC-1 v5, Exam 101 | Part 2 of 103.5

## What You Need to Know

- Keep programs running after logging out.
- Use `nohup` to protect against SIGHUP.
- Manage GNU Screen and tmux: create, detach, reattach.
- Work with windows, panes and regions.

---

## Surviving Logout: nohup, screen, tmux

By default, when you exit a terminal the shell sends **SIGHUP** to all its child processes and they terminate. Three tools solve this problem in different ways.

### nohup

`nohup` runs a command with SIGHUP ignored. Output goes to `nohup.out` in the current directory by default (or `$HOME/nohup.out` if the current directory is not writable).

```bash
nohup ./long_script.sh &
# output -> nohup.out

nohup ./script.sh > /var/log/script.log 2>&1 &
# output -> specified file
```

`nohup` only protects against SIGHUP and does not create a persistent session.

### screen

GNU Screen was created in 1987 to emulate multiple independent VT100 terminals on a single physical terminal. Structure: a session contains windows; windows can be split into regions.

Command prefix: `Ctrl+A`.

**Starting and sessions:**

```bash
screen              # new session
screen -S mywork    # new session with a name
screen -ls          # list sessions
screen -r           # reattach (when there's only one session)
screen -r mywork    # reattach by name or PID
screen -S PID -X quit   # terminate a session by PID
```

Reattach options:

| Option | Action |
|--------|--------|
| `-d -r` | Attach, detaching from elsewhere first if needed |
| `-d -R` | Same, but create session if it doesn't exist |
| `-d -m` | Start session in detached mode (for startup scripts) |

**Key bindings (after `Ctrl+A`):**

| Key | Action |
|-----|--------|
| `c` | Create new window |
| `n` | Next window |
| `p` | Previous window |
| `number` | Go to window by number |
| `"` | List all windows for selection |
| `w` | Window list in the bottom bar |
| `A` | Rename current window |
| `k` | Close current window (with confirmation) |
| `d` | Detach from session |
| `S` | Split horizontally (create region) |
| `\|` | Split vertically (create region) |
| `Tab` | Move to next region |
| `Q` | Close all regions except current |
| `X` | Close current region |
| `[` | Enter copy/scrollback mode |
| `]` | Paste copied text |
| `?` | Help for all keys |
| `:` | Screen command line |

Closing a region does not close its window; the window keeps running.

**Copy mode in screen:**

1. Enter: `Ctrl+A [`
2. Navigate with arrows or PgUp/PgDown.
3. Mark start: `Space`.
4. Move to end.
5. Mark end: `Space`.
6. Paste in the target window: `Ctrl+A ]`.

**Config:** `/etc/screenrc` (system) and `~/.screenrc` (user).

### tmux

tmux was released in 2007. It uses a client-server model. Structure: a session contains windows; windows are split into panes. Unlike screen regions, panes are full pseudo-terminals — closing a pane terminates its process.

Command prefix: `Ctrl+B`.

**Starting and sessions:**

```bash
tmux                            # new session
tmux new -s "LPI" -n "Window"   # session with name, first window named
tmux ls                         # list sessions
tmux a                          # attach (when there's only one session)
tmux attach -t mywork           # attach by name
tmux attach -d -t mywork        # attach, detaching other clients first
tmux kill-session -t mywork     # terminate session
```

**Key bindings (after `Ctrl+B`):**

| Key | Action |
|-----|--------|
| `c` | Create new window |
| `n` | Next window |
| `p` | Previous window |
| `number` | Go to window by number |
| `w` | List all windows for selection |
| `f` | Find window by name |
| `,` | Rename current window |
| `&` | Close current window (with confirmation) |
| `d` | Detach |
| `D` | Choose client to detach |
| `s` | Session list for switching |
| `$` | Rename current session |
| `"` | Split pane horizontally |
| `%` | Split pane vertically |
| `x` | Close current pane (with confirmation) |
| `!` | Break pane into a separate window |
| `z` | Zoom/unzoom pane to full screen |
| arrows | Switch between panes |
| `;` | Go to last active pane |
| `Ctrl+arrow` | Resize pane by 1 row |
| `Alt+arrow` | Resize pane by 5 rows |
| `{` | Swap current pane with previous |
| `}` | Swap current pane with next |
| `t` | Show clock in pane |
| `r` | Refresh client terminal |
| `?` | Help |
| `:` | tmux command line |

**Copy mode in tmux:**

1. Enter: `Ctrl+B [`
2. Navigate with arrows.
3. Mark start: `Ctrl+Space`.
4. Move to end.
5. Copy: `Alt+W`.
6. Paste: `Ctrl+B ]`.

**Config:** `/etc/tmux.conf` and `~/.tmux.conf`. Example with alternate config: `tmux -f /path/to/config`.

### screen vs tmux

| | screen | tmux |
|-|--------|------|
| Prefix | `Ctrl+A` | `Ctrl+B` |
| Model | Monolithic | Client-server |
| Window split | Regions | Panes (pseudo-terminals) |
| Closing split | Doesn't close window | Terminates pane's process |
| Released | 1987 | 2007 |

Key difference from `nohup`: in `screen` and `tmux` processes live inside a server that keeps running independently of the network connection.

---

---

## Quick Reference

```bash
# Protect from logout
nohup command &                  # ignore SIGHUP
nohup cmd > file.log 2>&1 &      # with redirection
screen -S name                   # new screen session
screen -r name                   # reattach
tmux new -s name                 # new tmux session
tmux attach -t name              # reattach

```

---

## Exam Tips
**How does nohup differ from screen?**
`nohup` only protects against SIGHUP. `screen` creates a persistent session you can return to.

**Where does nohup send output?**
To `nohup.out` in the current directory, or `$HOME/nohup.out`.

**How do you detach from a tmux session?**
`Ctrl+B`, then `d`.

**What does a load average of 2.0 mean on a dual-core processor?**
Full load across all cores (1.0 per core).

**How do you list all signals?**
`kill -l`.

**Which signals cannot be caught or ignored?**
SIGKILL (9) and SIGSTOP (19).

---

---

## Exercises

### Guided Exercises — Lesson 2

#### Exercise 11. screen vs tmux: Feature Comparison

**Task:** Identify which feature belongs to GNU Screen, tmux, or both.

| Feature | GNU Screen | tmux |
|---------|:----------:|:----:|
| Ctrl+A command prefix | + | |
| Client-server model | | + |
| Panes are pseudo-terminals | | + |
| Closing a region doesn't close its window | + | |
| Sessions contain windows | + | + |
| Sessions can be detached | + | + |

---

#### Exercise 12. Working with GNU Screen

**How do you start screen?**

<details><summary>Answer</summary>

```bash
screen
```

</details>

**How do you open a new window and edit `/etc/screenrc` in vi?**

<details><summary>Answer</summary>

Press `Ctrl+A c`, then:

```bash
sudo vi /etc/screenrc
```

</details>

**How do you display the window list in the bottom bar?**

<details><summary>Answer</summary>

`Ctrl+A w`

</details>

**How do you rename the current window to "vi"?**

<details><summary>Answer</summary>

Press `Ctrl+A A`, type `vi`, press Enter.

</details>

**How do you detach and create a new session named "ssh"?**

<details><summary>Answer</summary>

```
Ctrl+A d
screen -S "ssh"
```

</details>

**How do you list sessions and reattach to the first one by PID?**

<details><summary>Answer</summary>

```
Ctrl+A d
screen -ls
screen -r PID
```

</details>

**How do you split the window horizontally and move to the new empty region?**

<details><summary>Answer</summary>

```
Ctrl+A S
Ctrl+A Tab
```

</details>

**How do you terminate a session by PID from the command line?**

<details><summary>Answer</summary>

```bash
screen -S PID -X quit
```

</details>

---

#### Exercise 13. Working with tmux

**How do you start tmux?**

<details><summary>Answer</summary>

```bash
tmux
```

</details>

**How do you open a new window and create `~/.tmux.conf` with nano?**

<details><summary>Answer</summary>

```
Ctrl+B c
nano ~/.tmux.conf
```

</details>

**How do you split the window vertically and resize the new pane?**

<details><summary>Answer</summary>

```
Ctrl+B "
Ctrl+B Ctrl+↓   (several times)
```

</details>

**How do you rename the current window to "text editing"?**

<details><summary>Answer</summary>

```
Ctrl+B ,   (type "text editing", Enter)
```

</details>

**How do you detach and create a new session named "ssh" with window "ssh window"?**

<details><summary>Answer</summary>

```
Ctrl+B d
tmux new -s "ssh" -n "ssh window"
```

</details>

**How do you attach to the "ssh" session from a remote machine, guaranteeing the other client is detached?**

<details><summary>Answer</summary>

```bash
tmux a -d -t ssh
```

</details>

**How do you terminate a session by name?**

<details><summary>Answer</summary>

```bash
tmux kill-session -t ssh
```

</details>

---

### Explorational Exercises — Lesson 2

#### Exercise 14. Multiplexer Command Line

Both tools support a command mode via `prefix + :`.

**How do you enter copy mode in screen via the command line?**

<details><summary>Answer</summary>

```
Ctrl+A :
copy
```

</details>

**How do you rename the current tmux window via the command line?**

<details><summary>Answer</summary>

```
Ctrl+B :
rename-window
```

</details>

**How do you close all screen windows and end the session via the command line?**

<details><summary>Answer</summary>

```
Ctrl+A :
quit
```

</details>

**How do you split a tmux pane via the command line?**

<details><summary>Answer</summary>

```
Ctrl+B :
split-window
```

</details>

**How do you close the current tmux window via the command line?**

<details><summary>Answer</summary>

```
Ctrl+B :
kill-window
```

</details>

---

#### Exercise 15. Copy Mode in screen with vi-like Navigation

**How do you echo a long word?**

<details><summary>Answer</summary>

```bash
echo supercalifragilisticexpialidocious
```

</details>

**How do you copy five consecutive characters from that line?**

<details><summary>Answer</summary>

Enter copy mode: `Ctrl+A [`. Move up one line with `k`. Press `Space` to mark the start. Move 4 characters right with `l`. Press `Space` to mark the end.

</details>

**How do you paste the copied text into the command line?**

<details><summary>Answer</summary>

```
Ctrl+A ]
```

</details>

---

#### Exercise 16. Shared tmux Session

**Task:** Another user wants to connect via `tmux -S /tmp/our_socket a -t our_session`. The socket is already created with correct permissions. What two other conditions are needed?

<details><summary>Answer</summary>

1. Both users must belong to a common group (e.g., `multiplexer`).
2. The socket must be handed to that group: `chgrp multiplexer /tmp/our_socket`.

</details>


---

*Topic 103: GNU and Unix Commands*
