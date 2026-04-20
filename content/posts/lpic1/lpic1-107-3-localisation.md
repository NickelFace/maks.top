---
title: "LPIC-1 107.3 — Localisation and Internationalisation"
date: 2026-04-20
description: "Configuring timezone and locale settings; /etc/timezone, /etc/localtime, /usr/share/zoneinfo/, tzselect, timedatectl, LANG, LC_* variables, LC_ALL, TZ, iconv character encoding conversion. LPIC-1 exam topic 107.3."
tags: ["Linux", "LPIC-1", "locale", "timezone", "iconv", "UTF-8", "admin"]
categories: ["LPIC-1"]
page_lang: "en"
lang_pair: "/posts/lpic1/ru/lpic1-107-3-localisation/"
---

> **Exam weight: 3** — LPIC-1 v5, Exam 102

## What You Need to Know

From the official LPIC-1 objectives:

- Configure locale settings and environment variables.
- Configure timezone settings and environment variables.

Key files and commands: `/etc/timezone`, `/etc/localtime`, `/usr/share/zoneinfo/`, `LC_*`, `LC_ALL`, `LANG`, `TZ`, `/usr/bin/locale`, `tzselect`, `timedatectl`, `date`, `iconv`, UTF-8, ISO-8859, ASCII, Unicode.

---

## Time Zones

Time zones are regions of Earth that share the same local time, defined as an offset from **UTC** (Coordinated Universal Time). The term GMT (Greenwich Mean Time) is used as a synonym for UTC in offset-based names.

- `GMT-5` means the region is 5 hours behind UTC.
- `GMT+3` means UTC time is 3 hours behind — the region is 3 hours ahead.

Servers and cloud services commonly run with the hardware clock set to UTC, leaving time zone adjustments to individual users.

### Checking the Current Time Zone

```bash
$ date
Mon Oct 21 10:45:21 -03 2019
```

The `-03` offset shows the system is 3 hours behind UTC (GMT-3 zone).

```bash
$ timedatectl
               Local time: Sat 2019-10-19 17:53:18 -03
           Universal time: Sat 2019-10-19 20:53:18 UTC
                 RTC time: Sat 2019-10-19 20:53:18
                Time zone: America/Sao_Paulo (-03, -0300)
System clock synchronized: yes
```

`timedatectl` is available on systems with systemd.

### System Time Zone Files

| Path | Purpose |
|---|---|
| `/etc/timezone` | Contains the time zone name, e.g., `America/Sao_Paulo` or `Etc/GMT+3` |
| `/etc/localtime` | Symlink to the active zone data file in `/usr/share/zoneinfo/` |
| `/usr/share/zoneinfo/` | Directory of all available zone data files |

Generic UTC-offset names must include `Etc`, for example `Etc/GMT+3` (not just `GMT+3`).

```bash
$ cat /etc/timezone
America/Sao_Paulo
```

`/etc/localtime` points to `/usr/share/zoneinfo/America/Sao_Paulo`.

### tzselect — Interactive Zone Finder

`tzselect` guides you through continent, country, and region menus to identify the correct zone name. It does not change system settings — it outputs the TZ value for you to use:

```bash
$ tzselect
# ... interactive menu ...
# Result:
TZ='America/Sao_Paulo'; export TZ
```

Add that line to `~/.profile` to make it permanent for your sessions.

### TZ Environment Variable

`TZ` overrides the system time zone for the current shell session without changing system files:

```bash
$ env TZ='Africa/Cairo' date
Mon Oct 21 15:45:21 EET 2019
```

---

## Language and Character Encoding

### LANG Variable

`LANG` is the primary locale variable. Its format is `language_REGION.ENCODING`, for example `pt_BR.UTF-8` (Brazilian Portuguese, UTF-8) or `en_US.UTF-8`.

```bash
$ echo $LANG
pt_BR.UTF-8
```

System-wide default is set in `/etc/locale.conf`:

```bash
$ cat /etc/locale.conf
LANG=pt_BR.UTF-8
```

Change it with `localectl` on systemd systems:

```bash
localectl set-locale LANG=en_US.UTF-8
```

To override for the current session, export `LANG` or `LC_ALL`.

### LC_* Variables

These variables control specific locale aspects and override `LANG` for their category:

| Variable | Controls |
|---|---|
| `LC_COLLATE` | Alphabetical ordering (file listing, sort order) |
| `LC_CTYPE` | Character classification (uppercase, lowercase, digits) |
| `LC_MESSAGES` | Language for program messages (GNU programs) |
| `LC_MONETARY` | Currency format |
| `LC_NUMERIC` | Decimal and thousand separators |
| `LC_TIME` | Date and time format |
| `LC_PAPER` | Standard paper size |
| `LC_ALL` | Overrides all other `LC_*` variables and `LANG` |

```bash
$ locale
LANG=pt_BR.UTF-8
LC_CTYPE="pt_BR.UTF-8"
LC_NUMERIC=pt_BR.UTF-8
...
LC_ALL=
```

`LC_ALL` is empty by default. Setting it to `en_US.UTF-8` temporarily forces English locale for all aspects:

```bash
$ env LC_ALL=en_US.UTF-8 date
Mon Oct 21 10:45:21 -03 2019
```

For shell scripts, set `LANG=C` to avoid locale-dependent behavior in sorting and character comparisons.

### Character Encoding

| Encoding | Description |
|---|---|
| ASCII | 7-bit, 128 characters; English letters, digits, punctuation only |
| ISO-8859 | 8-bit family (e.g., ISO-8859-1 for Latin-1); extends ASCII for Western European languages |
| Unicode | Universal standard assigning a unique number to every character |
| UTF-8 | Variable-width Unicode encoding; backward compatible with ASCII; default on modern Linux |

### iconv — Encoding Conversion

`iconv` converts a file from one character encoding to another:

```bash
iconv -f ISO-8859-1 -t UTF-8 original.txt > converted.txt
```

| Option | Description |
|---|---|
| `-f ENCODING` | Source encoding (`--from-code`) |
| `-t ENCODING` | Target encoding (`--to-code`) |
| `-o file` | Output file instead of redirecting stdout |
| `-l` / `--list` | List all supported encodings |

Add `//TRANSLIT` to the target encoding to transliterate characters that don't exist in the target charset:

```bash
iconv -f UTF-8 -t ASCII//TRANSLIT -o ascii.txt readme.txt
```

---

## Quick Reference

```
Time zone files:
  /etc/timezone          zone name (e.g., America/Sao_Paulo, Etc/GMT+3)
  /etc/localtime         symlink to /usr/share/zoneinfo/<zone>
  /usr/share/zoneinfo/   zone data files

Time zone commands:
  date                   current time + UTC offset
  timedatectl            detailed time/zone info (systemd)
  tzselect               interactive zone finder (outputs TZ value)
  TZ='Zone/Name'         per-session override; add to ~/.profile to persist

Locale settings:
  LANG=language_REGION.ENCODING   primary locale (e.g., en_US.UTF-8)
  LC_ALL                  overrides all LC_* and LANG
  LC_COLLATE              sort / alphabetical order
  LC_CTYPE                character types (upper/lower)
  LC_MESSAGES             program message language
  LC_MONETARY             currency format
  LC_NUMERIC              decimal / thousand separator
  LC_TIME                 date/time format

Locale commands:
  locale                  show all current LC_* values
  localectl set-locale LANG=en_US.UTF-8   (systemd)

Locale files:
  /etc/locale.conf        system-wide locale settings

Character encodings:
  ASCII       7-bit, English only
  ISO-8859    8-bit family, extends ASCII
  Unicode     universal standard
  UTF-8       variable-width Unicode, ASCII-compatible, Linux default

iconv:
  iconv -f SRC -t DST input.txt > output.txt
  iconv -f SRC -t DST//TRANSLIT -o out.txt in.txt
  iconv -l                list all encodings
```

---

## Exam Questions

1. What file stores the system default time zone name? → `/etc/timezone`
2. What is `/etc/localtime`? → A symlink to the active zone data file in `/usr/share/zoneinfo/`.
3. Where are all time zone data files stored? → `/usr/share/zoneinfo/`
4. What does `tzselect` do? → Interactively guides the user to identify their time zone and outputs the `TZ` value; does not change system settings.
5. What command shows the current time zone with full systemd details? → `timedatectl`
6. How do you temporarily run a command in a different time zone? → `env TZ='Zone/Name' command`
7. What is the format of the `LANG` variable? → `language_REGION.ENCODING`, e.g., `en_US.UTF-8`
8. What does `LC_ALL` do? → Overrides all other `LC_*` variables and `LANG`.
9. Which `LC_*` variable controls the decimal and thousand separator? → `LC_NUMERIC`
10. Which `LC_*` variable controls alphabetical sorting? → `LC_COLLATE`
11. What file stores system-wide locale settings? → `/etc/locale.conf`
12. What command changes the system locale on a systemd system? → `localectl set-locale LANG=en_US.UTF-8`
13. What is UTF-8? → A variable-width Unicode encoding, backward-compatible with ASCII, default on modern Linux.
14. What command converts a file from ISO-8859-1 to UTF-8? → `iconv -f ISO-8859-1 -t UTF-8 input.txt > output.txt`
15. What does `//TRANSLIT` do in `iconv`? → Transliterates characters that do not exist in the target encoding instead of replacing them with `?`.
16. How do you list all encodings supported by `iconv`? → `iconv -l` or `iconv --list`
17. What is the `Etc/GMT+3` time zone? → A zone where the offset from UTC is +3 hours (generic UTC-offset names must use the `Etc/` prefix).
18. Why is `LANG=C` recommended in shell scripts? → The C locale provides unambiguous, locale-independent behavior for sorting and character comparisons.

---

## Exercises

### Exercise 1 — Reading the Time Zone from date

The `date` command outputs: `Mon Oct 21 18:45:21 +05 2019`. What is the time zone in `Etc/` notation?

<details>
<summary>Answer</summary>

`Etc/GMT+5` — the offset `+05` means the region is 5 hours ahead of UTC, which in `Etc/` notation is `Etc/GMT+5`.

</details>

---

### Exercise 2 — Setting /etc/localtime

To make `Europe/Brussels` the system default time zone, what should `/etc/localtime` point to?

<details>
<summary>Answer</summary>

`/etc/localtime` should be a symlink to `/usr/share/zoneinfo/Europe/Brussels`.

</details>

---

### Exercise 3 — iconv Conversion

Convert the WINDOWS-1252 encoded file `old.txt` to UTF-8 and save it as `new.txt`.

<details>
<summary>Answer</summary>

```bash
iconv -f WINDOWS-1252 -t UTF-8 -o new.txt old.txt
```

</details>

---

### Exercise 4 — Per-Session Time Zone

Make `Pacific/Auckland` the default time zone for the current shell session only.

<details>
<summary>Answer</summary>

```bash
export TZ=Pacific/Auckland
```

This sets the time zone only for the current session. To persist across sessions, add the line to `~/.profile` or `~/.bash_profile`.

</details>

---

### Exercise 5 — Transliteration with iconv

Convert the UTF-8 file `readme.txt` to a plain ASCII file `ascii.txt`, keeping characters as readable as possible by transliterating non-ASCII characters.

<details>
<summary>Answer</summary>

```bash
iconv -f UTF-8 -t ASCII//TRANSLIT -o ascii.txt readme.txt
```

`//TRANSLIT` replaces characters not representable in ASCII with similar-looking ASCII characters rather than question marks.

</details>

---

*LPIC-1 Study Notes | Topic 107: Administrative Tasks*
