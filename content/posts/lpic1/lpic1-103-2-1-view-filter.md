---
title: "LPIC-1 103.2 — Text Filters: View, Filter, Sort"
date: 2026-04-16
description: "cat, head, tail, less, cut, paste, sort, uniq. Viewing and filtering text. LPIC-1 exam topic 103.2."
tags: ["Linux", "LPIC-1", "cat", "head", "tail", "sort", "uniq", "cut", "grep"]
categories: ["LPIC-1"]
page_lang: "en"
lang_pair: "/posts/lpic1/ru/lpic1-103-2-1-view-filter/"
---

> **Exam weight: 3** — LPIC-1 v5, Exam 101 | Part 1 of 103.2

## What you need to know

Send text files and streams through GNU textutils filter utilities and modify output using standard UNIX commands.

Utilities covered: `bzcat`, `cat`, `cut`, `head`, `less`, `md5sum`, `nl`, `od`, `paste`, `sed`, `sha256sum`, `sha512sum`, `sort`, `split`, `tail`, `tr`, `uniq`, `wc`, `xzcat`, `zcat`.

---

## Text streams and filters

In Linux almost everything is built around text. Config files, logs, command output, data tables, scripts — all text. Filters read text from standard input or a file, do something with it, and pass the result to standard output. That output can then be piped into the next filter with `|`.

A pipeline looks like this:

```bash
cat /etc/passwd | cut -d: -f1 | sort | uniq
```

Each command receives the output of the previous one as input. This is the Unix philosophy: small tools, each doing one thing well.

---

## Viewing and printing files

### cat

`cat` (concatenate) prints the contents of one or more files. With multiple filenames it prints them in sequence.

```bash
cat file.txt                 # print a file
cat file1.txt file2.txt      # concatenate two files
cat -n file.txt              # number all lines
cat -b file.txt              # number only non-empty lines
cat -A file.txt              # show special chars: $ at line ends, ^I for tabs
cat > newfile.txt            # write keyboard input to a file (Ctrl+D to finish)
```

### head and tail

`head` shows the beginning of a file, `tail` shows the end. Default is 10 lines.

```bash
head file.txt                # first 10 lines
head -n 20 file.txt          # first 20 lines
head -20 file.txt            # same, short syntax
head -c 100 file.txt         # first 100 bytes

tail file.txt                # last 10 lines
tail -n 5 file.txt           # last 5 lines
tail -f /var/log/syslog      # follow a file in real time
tail -n +5 file.txt          # output from line 5 to end of file
```

`tail -f` is especially useful for debugging: open a log in one terminal, run commands in another, and see what is happening immediately.

### less

`less` is a paginated file viewer. Unlike `more`, you can scroll backwards.

```bash
less file.txt
less +G file.txt             # open at the end of the file
```

Navigation inside `less`:
- `Space` / `f` — next page
- `b` — previous page
- `g` — beginning of file
- `G` — end of file
- `/pattern` — search forward
- `?pattern` — search backward
- `n` / `N` — next / previous search result
- `q` — quit

### nl

`nl` numbers the lines of a file. More flexible than `cat -n`.

```bash
nl file.txt                  # number only non-empty lines
nl -b a file.txt             # number all lines (including empty)
nl -b t file.txt             # number only non-empty (default)
nl -v 10 file.txt            # start numbering at 10
nl -i 5 file.txt             # increment by 5 (10, 15, 20...)
nl -w 3 -s ': ' file.txt     # field width 3, separator ': '
```

### od

`od` (octal dump) prints a file in octal, hexadecimal or other formats. Useful for inspecting binary files and hidden characters.

```bash
od file.txt                  # octal output (default)
od -c file.txt               # character output with escape sequences
od -x file.txt               # hexadecimal output
od -t x1 file.txt            # hex byte by byte
od -An -c file.txt           # no addresses, characters only
```

Example: `echo "AB" | od -c` shows `A`, `B`, `\n` — you can see the newline character.

---

## Working with columns and fields

### cut

`cut` extracts parts of lines by a delimiter character or by character position.

```bash
# Extract by delimiter (-d) and field number (-f)
cut -d: -f1 /etc/passwd          # first column (usernames)
cut -d: -f1,3 /etc/passwd        # first and third columns
cut -d: -f1-3 /etc/passwd        # columns 1 through 3
cut -d' ' -f2 file.txt           # second word on each line

# Extract by character position (-c)
cut -c1-10 file.txt              # characters 1 to 10
cut -c5 file.txt                 # only the 5th character of each line
cut -c1,5,10 file.txt            # characters 1, 5 and 10

# Extract by byte (-b)
cut -b1-5 file.txt               # bytes 1 to 5
```

Important: `cut` works with a single delimiter. For multiple consecutive spaces, `awk` is a better choice.

### paste

`paste` joins lines from multiple files horizontally, inserting a delimiter between them.

```bash
paste file1.txt file2.txt        # join as columns, tab-separated
paste -d, file1.txt file2.txt    # use comma as separator
paste -d: file1.txt file2.txt    # use colon as separator
paste -s file.txt                # transpose: file lines into one line
```

Example: if `names.txt` contains names and `ages.txt` contains ages, `paste -d, names.txt ages.txt` produces CSV.

---

## Sorting and uniqueness

### sort

`sort` sorts the lines of a text file or stream.

```bash
sort file.txt                    # alphabetical sort
sort -r file.txt                 # reverse order
sort -n file.txt                 # numeric sort
sort -rn file.txt                # numeric, reverse order
sort -k2 file.txt                # sort by second field
sort -k2 -t: file.txt            # by second field, delimiter ':'
sort -k2,2n file.txt             # by second field, numerically
sort -u file.txt                 # remove duplicates while sorting
sort -f file.txt                 # case-insensitive
sort -h file.txt                 # sort by human-readable sizes (1K, 2M)
```

The difference between `sort -n` and `sort`: without `-n`, the string "10" comes before "9" (lexicographically 1 < 9); with `-n`, correctly 9 < 10.

### uniq

`uniq` removes (or outputs) repeated lines. It only works on already-sorted input, so it almost always follows `sort`.

```bash
sort file.txt | uniq             # remove duplicates
sort file.txt | uniq -c          # show repeat count
sort file.txt | uniq -d          # show only duplicated lines
sort file.txt | uniq -u          # show only unique lines
sort file.txt | uniq -i          # case-insensitive
```

Example — count word frequency in a text:

```bash
tr ' ' '\n' < text.txt | sort | uniq -c | sort -rn | head
```

---


## Exam command reference

| Command | What it does |
|---------|-------------|
| `cat -n` | number all lines |
| `cat -b` | number only non-empty lines |
| `head -n 5` | first 5 lines |
| `tail -n 5` | last 5 lines |
| `tail -f` | follow a file in real time |
| `tail -n +N` | from line N to end of file |
| `wc -l` | line count |
| `wc -w` | word count |
| `wc -c` | byte count |
| `sort -n` | numeric sort |
| `sort -r` | reverse sort |
| `sort -k2 -t:` | by 2nd field, delimiter ':' |
| `sort -u` | sort and remove duplicates |
| `uniq -c` | lines with repeat count |
| `uniq -d` | only duplicated lines |
| `uniq -u` | only unique lines |
| `cut -d: -f1` | first field, delimiter ':' |
| `cut -c1-5` | characters 1–5 |
| `paste -d,` | join files with comma |

---


## Typical exam questions

**Which command prints the last 20 lines of a file?**
`tail -n 20 file.txt` or `tail -20 file.txt`

**How do you follow log updates in real time?**
`tail -f /var/log/syslog`

**How do you print only the first field from /etc/passwd (delimiter ':')?**
`cut -d: -f1 /etc/passwd`

**How do you count the number of lines in a file?**
`wc -l file.txt`

**How do you remove duplicates from a sorted file?**
`sort file.txt | uniq`


---

