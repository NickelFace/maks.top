---
title: "LPIC-1 107.2 — Automate System Administration Tasks by Scheduling Jobs"
date: 2026-04-20
description: "Scheduling recurring jobs with cron and crontab, one-time jobs with at/atq/atrm, systemd timers with OnCalendar, access control via cron.allow/cron.deny and at.allow/at.deny. LPIC-1 exam topic 107.2."
tags: ["Linux", "LPIC-1", "cron", "at", "systemd", "scheduling", "admin"]
categories: ["LPIC-1"]
page_lang: "en"
lang_pair: "/posts/lpic1/ru/lpic1-107-2-scheduling/"
---

> **Exam weight: 4** — LPIC-1 v5, Exam 102

## What You Need to Know

From the official LPIC-1 objectives:

- Manage cron and at jobs.
- Configure user access to job scheduling.
- Use systemd timer units as an alternative to cron.

Key files and commands: `/etc/cron.d/`, `/etc/cron.{daily,hourly,monthly,weekly}/`, `/etc/at.deny`, `/etc/at.allow`, `/etc/crontab`, `/etc/cron.allow`, `/etc/cron.deny`, `/var/spool/cron/`, `crontab`, `at`, `atq`, `atrm`, `systemctl`, `systemd-run`.

---

## Cron — Recurring Jobs

The `cron` daemon wakes every minute and checks crontab files for jobs to run. User crontabs are stored in `/var/spool/cron/`.

### User Crontab Format

A user crontab has **5 time fields** followed by the command:

```
min  hour  dom  month  dow  command
```

| Field | Range | Description |
|---|---|---|
| min | 0-59 | Minute |
| hour | 0-23 | Hour |
| dom | 1-31 | Day of month |
| month | 1-12 | Month |
| dow | 0-7 | Day of week (0 and 7 both = Sunday) |
| command | — | Shell command to run |

### Time Field Operators

| Operator | Meaning | Example |
|---|---|---|
| `*` | Any value | `* * * * *` — every minute |
| `,` | List | `1,15,30` — at minutes 1, 15, 30 |
| `-` | Range | `1-5` — Monday through Friday |
| `/` | Step | `*/20` — every 20 units |

### Crontab Examples

```
# Run daily at 10:00 am
0 10 * * * /home/frank/foo.sh

# Run every Tuesday at 08:00, 08:15, 08:30, 08:45
0,15,30,45 08 * * 2 /home/frank/bar.sh

# Run Mon-Fri Jan and June, days 1-15, at 20:30
30 20 1-15 1,6 1-5 /home/frank/foobar.sh

# Every 20 minutes
*/20 * * * * /path/to/script.sh
```

### Crontab Shortcuts

| Shortcut | Equivalent | Meaning |
|---|---|---|
| `@reboot` | — | Once at startup |
| `@hourly` | `0 * * * *` | Every hour at :00 |
| `@daily` / `@midnight` | `0 0 * * *` | Daily at midnight |
| `@weekly` | `0 0 * * 0` | Weekly, Sunday midnight |
| `@monthly` | `0 0 1 * *` | Monthly, 1st at midnight |
| `@yearly` / `@annually` | `0 0 1 1 *` | Yearly, Jan 1 at midnight |

### Crontab Variables

Set at the top of a crontab file:

| Variable | Default | Effect |
|---|---|---|
| `HOME` | User home | Working directory for cron jobs |
| `MAILTO` | Username | Email recipient for output; set to `""` to suppress |
| `PATH` | System path | Search path for commands |
| `SHELL` | `/bin/sh` | Shell used to run commands |

### crontab Command

| Option | Description |
|---|---|
| `-e` | Edit the current user's crontab (opens `$EDITOR`) |
| `-l` | List (display) the current crontab |
| `-r` | Remove the current crontab |
| `-u user` | Operate on another user's crontab (root only) |

### System Crontabs

System crontabs have a **6th field** (username) before the command, since they run as root:

```bash
# /etc/crontab or files in /etc/cron.d/
30 01 * * * root /root/barfoo.sh >>/root/output.log 2>>/root/error.log
```

Drop-in directories for scripts (no crontab format needed — just executable scripts):
- `/etc/cron.hourly/`
- `/etc/cron.daily/`
- `/etc/cron.weekly/`
- `/etc/cron.monthly/`

### Cron Access Control

`/etc/cron.allow` and `/etc/cron.deny` control which non-root users may use `crontab`:

- If `/etc/cron.allow` exists: only listed users may schedule jobs.
- If only `/etc/cron.deny` exists: listed users may not schedule jobs; an empty file means all users are allowed.
- If neither exists: access depends on the distribution.

Both files contain one username per line.

---

## systemd Timers — Cron Alternative

Systemd timers are unit files with the `.timer` suffix. Each timer activates a matching `.service` unit (same name, different suffix).

### Timer File Structure

```ini
[Unit]
Description=Run the foobar service

[Timer]
OnCalendar=Mon *-*-1..7 05:30:00
Persistent=true

[Install]
WantedBy=timers.target
```

### OnCalendar Syntax

```
DayOfWeek Year-Month-Day Hour:Minute:Second
```

`DayOfWeek` is optional. Use `*` for any, `,` for list, `..` for range (not `-`), `/` for step.

### OnCalendar Examples

| Expression | Meaning |
|---|---|
| `*-*-* 08:30:00` | Every day at 08:30 |
| `Sat,Sun *-*-* 05:00:00` | Saturday and Sunday at 05:00 |
| `*-*-01 13:15,30,45:00` | 1st of every month at 13:15, 13:30, 13:45 |
| `Fri *-09..12-* 16:20:00` | Every Friday in Sep, Oct, Nov, Dec at 16:20 |
| `*-*-* *:00/05:00` | Every 5 minutes |
| `Mon *-*-* 00:00:00` | Every Monday at midnight |

### OnCalendar Shortcuts

| Shortcut | Equivalent |
|---|---|
| `hourly` | `*-*-* *:00:00` |
| `daily` | `*-*-* 00:00:00` |
| `weekly` | `Mon *-*-* 00:00:00` |
| `monthly` | `*-*-01 00:00:00` |
| `yearly` | `*-01-01 00:00:00` |

### Managing Timers

```bash
systemctl enable foobar.timer
systemctl start foobar.timer
systemctl daemon-reload          # after editing timer files
systemctl list-timers            # active timers, sorted by next trigger
systemctl list-timers --all      # include inactive timers
```

Timer logs go to the systemd journal; review with `journalctl`. Ordinary users need `--user` with `systemctl` and `journalctl`.

---

## at — One-Time Jobs

`at` schedules a command to run once at a specified future time. The `atd` daemon must be running.

```bash
$ at now +5 minutes
warning: commands will be executed using /bin/sh
at> date
at> Ctrl+D
job 12 at Sat Sep 14 09:15:00 2019
```

### at Options

| Option | Description |
|---|---|
| `-c jobid` | Print commands of a job to stdout |
| `-d jobid` | Delete a job (alias for `atrm`) |
| `-f file` | Read job commands from a file |
| `-l` | List pending jobs (alias for `atq`) |
| `-m` | Send mail even if there was no output |
| `-q queue` | Specify queue (a-z, A-Z); capital letters behave like `batch` |
| `-v` | Show execution time before reading the job |

### Time Specifications for at

- `HH:MM` — 24h or 12h with AM/PM; if time has passed, next day is assumed
- `midnight`, `noon`, `teatime` (4 PM)
- `now +N minutes/hours/days/weeks`
- `today`, `tomorrow`
- Date formats: `month-name day`, `MMDDYY`, `MM/DD/YY`, `DD.MM.YY`, `YYYY-MM-DD`

### atq and atrm

```bash
atq                    # list pending at jobs (as root: all users)
atrm 14                # delete job 14
atrm 50 51 52          # delete multiple jobs
at -l                  # alias for atq
at -d 14               # alias for atrm 14
```

### at Access Control

Same logic as cron:
- If `/etc/at.allow` exists: only listed users may schedule `at` jobs.
- If only `/etc/at.deny` exists: listed users may not; empty file = all allowed.
- If neither exists: access depends on the distribution.

### systemd-run — Alternative to at

```bash
# Run date at a specific calendar time
systemd-run --on-calendar='2019-10-06 11:30' date

# Run a script after 2 minutes
systemd-run --on-active="2m" ./foo.sh
```

Ordinary users need `--user`. Review logs with `journalctl --user`.

---

## Quick Reference

```
User crontab: 5 time fields + command (min hour dom month dow cmd)
System crontab: 6 fields (adds username before command)
  /etc/crontab, /etc/cron.d/

Drop-in script dirs (no crontab format):
  /etc/cron.hourly/  /etc/cron.daily/  /etc/cron.weekly/  /etc/cron.monthly/

User crontabs stored in: /var/spool/cron/

crontab flags:
  -e  edit    -l  list    -r  remove    -u user  (root only)

Cron shortcuts (in crontab):
  @reboot  @hourly  @daily/@midnight  @weekly  @monthly  @yearly/@annually

Cron output: mailed by default; MAILTO="" suppresses; MAILTO="user" redirects

Cron access:
  /etc/cron.allow   whitelist (only listed users allowed)
  /etc/cron.deny    blacklist (listed users denied; empty = all allowed)

systemd timer:
  OnCalendar=DayOfWeek Year-Month-Day Hour:Minute:Second
  Persistent=true   catch up missed runs
  systemctl enable/start NAME.timer
  systemctl list-timers [--all]

at — one-time scheduling (requires atd):
  at HH:MM / at now +N minutes / at midnight / at tomorrow
  atq                 list pending jobs
  atrm ID             delete job
  at -c ID            show job commands
  at -l = atq    at -d = atrm

at access:
  /etc/at.allow   /etc/at.deny   (same logic as cron)

systemd-run (alternative to at):
  systemd-run --on-calendar='YYYY-MM-DD HH:MM' cmd
  systemd-run --on-active="Nm" cmd
```

---

## Exam Questions

1. What is the format of a user crontab entry? → Five time fields (min hour dom month dow) followed by the command.
2. What does `*/20 * * * *` mean in crontab? → Run every 20 minutes.
3. What shortcut replaces `0 0 * * *` in crontab? → `@daily` or `@midnight`
4. What is the difference between `/etc/crontab` and user crontabs? → System crontabs have a 6th field specifying the username to run the job as.
5. Where are user crontabs stored? → `/var/spool/cron/`
6. What does `crontab -e` do? → Opens the current user's crontab for editing in `$EDITOR`.
7. What does the `MAILTO=""` variable in a crontab do? → Suppresses email output from cron jobs.
8. What is `/etc/cron.allow`? → Whitelist — only listed non-root users may use `crontab`; takes precedence over `cron.deny`.
9. What command runs a job once in 30 minutes? → `at now +30 minutes`
10. What is `atq`? → Lists pending `at` jobs; as root, shows jobs for all users.
11. What is `atrm`? → Deletes pending `at` jobs by job ID; `at -d` is an alias.
12. What daemon must be running for `at` to work? → `atd`
13. What is the OnCalendar syntax for every Friday in September–December at 16:20? → `Fri *-09..12-* 16:20:00`
14. How do you view active systemd timers? → `systemctl list-timers`
15. What systemd-run option schedules a one-time job at a calendar time? → `--on-calendar=`
16. What does `Persistent=true` do in a systemd timer? → Runs the timer immediately at next start if the last scheduled run was missed.
17. How do you schedule a cron job for the 1st and 15th of each month at 08:30? → `30 08 1,15 * * command`
18. What `OnCalendar` shortcut means "every Monday at midnight"? → `weekly` (equivalent to `Mon *-*-* 00:00:00`)

---

## Exercises

### Exercise 1 — Crontab Shortcuts

What crontab time specification corresponds to `@weekly`?

<details>
<summary>Answer</summary>

`0 0 * * 0` — run at midnight on Sunday (day of week 0).

</details>

---

### Exercise 2 — Reading Cron Expressions

Explain what the following crontab entries do:

```
30 13 * * 1-5
00 09-18 * * *
0,20,40 11 * * Sun
*/20 * * * *
```

<details>
<summary>Answer</summary>

- `30 13 * * 1-5` — at 13:30 (1:30 PM) every weekday (Mon-Fri)
- `00 09-18 * * *` — at the top of every hour from 09:00 to 18:00, every day
- `0,20,40 11 * * Sun` — every Sunday at 11:00, 11:20, and 11:40
- `*/20 * * * *` — every 20 minutes

</details>

---

### Exercise 3 — Send Cron Output by Email

How do you redirect all cron job output to user `emma` via email? And how do you prevent any mail from being sent?

<details>
<summary>Answer</summary>

Set `MAILTO` at the top of the crontab:

```
MAILTO="emma"      # send output to emma
MAILTO=""          # suppress all mail
```

</details>

---

### Exercise 4 — One-Time at Job

Schedule a job to run `./backup.sh` at 10:30 AM on October 31st as an ordinary user.

<details>
<summary>Answer</summary>

```bash
at 10:30 AM October 31
at> ./backup.sh
at> Ctrl+D
```

</details>

---

### Exercise 5 — OnCalendar Expressions

Write an `OnCalendar` expression that runs a timer every 5 minutes.

<details>
<summary>Answer</summary>

`*-*-* *:00/05:00`

This matches every day, every hour, at minutes 0, 5, 10, 15, …, 55.

</details>

---

*LPIC-1 Study Notes | Topic 107: Administrative Tasks*
