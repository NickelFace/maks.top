---
title: "LPIC-1 103.2 — Text Filters: Transform, Compress, Checksums (Part 2)"
date: 2026-04-16
description: "tr, sed, split, wc, zcat, md5sum, sha256sum. Text transformation and compression tools. LPIC-1 exam topic 103.2."
tags: ["Linux", "LPIC-1", "sed", "tr", "wc", "gzip", "md5sum", "checksum"]
categories: ["LPIC-1"]
page_lang: "en"
lang_pair: "/posts/lpic1/ru/lpic1-103-2-2-transform-compress/"
---

> **Exam weight: 3** — LPIC-1 v5, Exam 101 | Part 2 of 103.2

## What you need to know

- Convert and translate text with `tr`.
- Apply stream editing with `sed`.
- Split files and count lines, words, bytes.
- Read compressed files without unpacking.
- Verify file integrity with checksums.

---

## Text transformation

### tr

`tr` (translate) replaces or deletes individual characters. It only works with streams; it does not accept files directly.

```bash
echo "Hello World" | tr 'a-z' 'A-Z'    # convert to uppercase
echo "Hello World" | tr 'A-Z' 'a-z'    # convert to lowercase
echo "Hello   World" | tr -s ' '       # squeeze repeated spaces into one
echo "abc123" | tr -d '0-9'            # delete all digits
echo "abc123" | tr -cd '0-9'           # keep only digits
cat file.txt | tr '\t' ' '             # replace tabs with spaces
cat file.txt | tr -s '\n'              # remove blank lines
```

`tr` supports character classes: `[:alpha:]`, `[:digit:]`, `[:space:]`, `[:upper:]`, `[:lower:]`.

```bash
echo "Hello World 123" | tr -d '[:digit:]'        # delete digits
echo "Hello World" | tr '[:lower:]' '[:upper:]'   # to uppercase
```

### sed

`sed` (stream editor) is a powerful stream editor. It applies commands to each line.

Most common use — text substitution (`s` = substitute):

```bash
sed 's/old/new/' file.txt           # replace first occurrence per line
sed 's/old/new/g' file.txt          # replace all occurrences (global)
sed 's/old/new/i' file.txt          # case-insensitive
sed 's/old/new/2' file.txt          # replace only the second occurrence
sed -i 's/old/new/g' file.txt       # edit file in-place
sed -i.bak 's/old/new/g' file.txt   # edit in-place, save .bak copy
```

Deleting lines:

```bash
sed '3d' file.txt                # delete line 3
sed '2,5d' file.txt              # delete lines 2–5
sed '/pattern/d' file.txt        # delete lines containing pattern
sed '/^#/d' file.txt             # delete comment lines
sed '/^$/d' file.txt             # delete blank lines
```

Printing selected lines:

```bash
sed -n '5p' file.txt             # print only line 5
sed -n '2,5p' file.txt           # print lines 2–5
sed -n '/pattern/p' file.txt     # print lines matching pattern
sed -n -e '1'p -e '10'p -e '$'p file.txt  # lines 1, 10 and last
```

In `sed`, `$` denotes the last line of the file. The trick `sed -n '$='` prints the last line number — i.e. the total line count, as an alternative to `wc -l`.

`sed` also accepts input via redirection:

```bash
sed -n /pattern/p < file.txt
```

---

## Splitting and counting

### split

`split` divides a file into parts. Convenient for large files.

```bash
split file.txt                       # split every 1000 lines, names xaa, xab...
split -l 500 file.txt                # split every 500 lines
split -b 1M file.txt                 # split every 1 megabyte
split -b 1M file.txt part_           # parts with prefix part_
split -l 100 -d file.txt chunk_      # numeric suffixes (chunk_00, chunk_01...)
```

To reassemble: `cat part_* > original.txt`

### wc

`wc` (word count) counts lines, words and bytes.

```bash
wc file.txt                     # lines, words, bytes
wc -l file.txt                  # lines only
wc -w file.txt                  # words only
wc -c file.txt                  # bytes only
wc -m file.txt                  # characters (multi-byte aware)
wc -L file.txt                  # length of the longest line
wc -l *.txt                     # for multiple files + total
```

Classic example: `ls | wc -l` — count files in a directory.

---

## Compressed files

These utilities let you read compressed files without explicit decompression. Convenient for viewing compressed logs.

### zcat, bzcat, xzcat

```bash
zcat file.gz                    # read a gzip file without decompressing
zcat file.gz | grep error       # filter a compressed file
bzcat file.bz2                  # read a bzip2 file
xzcat file.xz                   # read an xz file
```

These commands are equivalent to:

```bash
zcat file.gz      # same as: gunzip -c file.gz
bzcat file.bz2    # same as: bunzip2 -c file.bz2
xzcat file.xz     # same as: xz -dc file.xz
```

Note: `gzip file.txt` compresses the file to `file.txt.gz` and removes the original. That is why `zcat` is so convenient — no need to decompress, read, then recompress.

Combining with other filters:

```bash
zcat access.log.gz | tail -100 | grep "404"
bzcat large_data.bz2 | cut -d, -f3 | sort | uniq -c
```

---

## Checksums

Checksums are used to verify file integrity: download an ISO image, compute the checksum, compare it with the official one. If they match, the file is intact.

### md5sum, sha256sum, sha512sum

```bash
md5sum file.txt                  # compute MD5 hash
sha256sum file.txt               # compute SHA-256 hash
sha512sum file.txt               # compute SHA-512 hash

md5sum file1.txt file2.txt       # for multiple files

# Save checksums to a file
sha256sum *.txt > checksums.sha256

# Verify files against saved checksums
sha256sum -c checksums.sha256
```

MD5 is cryptographically outdated (collisions can be engineered), but it still appears for integrity checks. For serious use, prefer SHA-256 or SHA-512.

Output of `sha256sum`:

```
e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855  empty.txt
```

First part is the hash, second is the filename.

---

## Exam command reference
| Command | What it does |
|---------|-------------|
| `tr 'a-z' 'A-Z'` | to uppercase |
| `tr -d '0-9'` | delete digits |
| `tr -s ' '` | squeeze repeated spaces |
| `sed 's/a/b/g'` | replace all a with b |
| `sed -i` | edit file in-place |
| `sed -n '5p'` | print only line 5 |
| `sed '/pattern/d'` | delete lines matching pattern |
| `nl -b a` | number all lines |
| `od -c` | character dump |
| `split -l 100` | split every 100 lines |
| `split -b 1M` | split every 1 megabyte |
| `zcat file.gz` | read gzip without decompressing |
| `bzcat file.bz2` | read bzip2 without decompressing |
| `xzcat file.xz` | read xz without decompressing |
| `sha256sum -c` | verify files against checksums |

---


---

## Typical exam questions
**What is the difference between `uniq -d` and `uniq -u`?**
`-d` prints only lines that appear more than once. `-u` prints only lines that appear exactly once.

**How do you convert text to uppercase?**
`tr 'a-z' 'A-Z'` or `tr '[:lower:]' '[:upper:]'`

**How do you read the contents of file.gz without decompressing it?**
`zcat file.gz`

**What is the difference between `sha256sum -c` and running `sha256sum` without flags?**
Without `-c` it computes a hash. With `-c` it reads a file of previously saved checksums and verifies them.

**How do you split a file into parts of 500 lines with the prefix "part_"?**
`split -l 500 file.txt part_`

---


---


## Exercises

### Guided Exercises

**Exercise 1 — Counting processors**

The file `/proc/cpuinfo` has a line like `processor : 0`, `processor : 1`, etc. for each processor.

**1.1. Count the number of processors using `grep` and `wc`.**

<details>
<summary>Answer</summary>

```bash
grep processor /proc/cpuinfo | wc -l
```

Or via `cat`:
```bash
cat /proc/cpuinfo | grep processor | wc -l
```

> Both give the same result. `grep file` is faster in scripts; the `cat | grep` pipeline is clearer for interactive use.

</details>

---

**1.2. Do the same with `sed` instead of `grep`.**

<details>
<summary>Answer</summary>

```bash
sed -n /processor/p /proc/cpuinfo | wc -l
```

The `-n` flag suppresses output of all lines. The `p` command prints only lines matching the pattern `processor`. Then `wc -l` counts them.

A variant entirely in `sed` without `wc`:
```bash
sed -n /processor/p /proc/cpuinfo | sed -n '$='
```

Here `'$='` means: find the last line (`$`) and print its number (`=`). The result is the same as `wc -l`.

</details>

---

**Exercise 2 — Exploring /etc/passwd**

**2.1. Which users have access to the Bash shell?**

<details>
<summary>Answer</summary>

```bash
grep ":/bin/bash$" /etc/passwd
```

To print only usernames:
```bash
grep ":/bin/bash$" /etc/passwd | cut -d: -f1
```

The `$` at the end of the regex anchors to the end of line, avoiding accidental matches in other fields.

</details>

---

**2.2. How many users in the system do not have shell access (service accounts)?**

<details>
<summary>Answer</summary>

```bash
grep -v ":/bin/bash$" /etc/passwd | wc -l
```

The `-v` flag inverts the match: lines where `:/bin/bash$` is not found are printed.

</details>

---

**2.3. How many unique users and groups exist in the system (from /etc/passwd only)?**

<details>
<summary>Answer</summary>

Unique UIDs (users):
```bash
cut -d: -f3 /etc/passwd | sort -u | wc -l
```

Unique GIDs (groups):
```bash
cut -d: -f4 /etc/passwd | sort -u | wc -l
```

> Plain `cut | wc -l` without `sort -u` may overcount if multiple users share a UID. `sort -u` removes duplicates before counting.

</details>

---

**2.4. Print only the first line, the last line and the tenth line of /etc/passwd.**

<details>
<summary>Answer</summary>

```bash
sed -n -e '1'p -e '10'p -e '$'p /etc/passwd
```

The `-n` flag suppresses all output. Each `-e` block is a separate instruction: `1p` — first line, `10p` — tenth line, `'$'p` — last line (`$` in sed means end of file).

</details>

---

**Exercise 3 — The mypasswd file**

Create a file `mypasswd` with the following content:

```
root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
bin:x:2:2:bin:/bin:/usr/sbin/nologin
sys:x:3:3:sys:/dev:/usr/sbin/nologin
sync:x:4:65534:sync:/bin:/bin/sync
nvidia-persistenced:x:121:128:NVIDIA Persistence Daemon,,,:/nonexistent:/sbin/nologin
libvirt-qemu:x:64055:130:Libvirt Qemu,,,:/var/lib/libvirt:/usr/sbin/nologin
libvirt-dnsmasq:x:122:133:Libvirt Dnsmasq,,,:/var/lib/libvirt/dnsmasq:/usr/sbin/nologin
carol:x:1000:2000:Carol Smith,Finance,,,Main Office:/home/carol:/bin/bash
dave:x:1001:1000:Dave Edwards,Finance,,,Main Office:/home/dave:/bin/ksh
emma:x:1002:1000:Emma Jones,Finance,,,Main Office:/home/emma:/bin/bash
frank:x:1003:1000:Frank Cassidy,Finance,,,Main Office:/home/frank:/bin/bash
grace:x:1004:1000:Grace Kearns,Engineering,,,Main Office:/home/grace:/bin/ksh
henry:x:1005:1000:Henry Adams,Sales,,,Main Office:/home/henry:/bin/bash
john:x:1006:1000:John Chapel,Sales,,,Main Office:/home/john:/bin/bash
```

**3.1. Print all users from group 1000 using `sed`.**

<details>
<summary>Answer</summary>

```bash
sed -n /:1000:[A-Z]/p mypasswd
```

The naive `sed -n /1000/p mypasswd` also matches carol (whose UID is 1000). The regex `/:1000:[A-Z]/` requires an uppercase letter immediately after `1000:`, which marks the GECOS field (full name) — uniquely identifying the GID field.

</details>

---

**3.2. Print only the full names of users in group 1000.**

<details>
<summary>Answer</summary>

```bash
sed -n /:1000:[A-Z]/p mypasswd | cut -d: -f5 | cut -d, -f1
```

The fifth field contains `Dave Edwards,Finance,,,Main Office`, so a second `cut` on `,` extracts just the name.

Result:
```
Dave Edwards
Emma Jones
Frank Cassidy
Grace Kearns
Henry Adams
John Chapel
```

</details>

---

### Explorational Exercises

**Exercise 1 — Prize draw**

Pick a random Main Office employee for a prize draw using `sed`, `cut` and `sort -R`.

<details>
<summary>Answer</summary>

```bash
sed -n /'Main Office'/p mypasswd | cut -d: -f5 | cut -d, -f1 | sort -R | head -1
```

Breakdown:
- `sed -n /'Main Office'/p mypasswd` — lines containing "Main Office"
- `cut -d: -f5` — fifth field (full name + department)
- `cut -d, -f1` — only the name before the first comma
- `sort -R` — random shuffle (different order each run)
- `head -1` — take only the first name

</details>

---

**Exercise 2 — Count by department**

How many people work in Finance, Engineering and Sales?

<details>
<summary>Answer</summary>

```bash
sed -n /'Main Office'/p mypasswd | cut -d, -f2 | uniq -c
```

Result:
```
4 Finance
1 Engineering
2 Sales
```

> `uniq` only works on adjacent lines. If the data is not ordered, add `sort` before `uniq`. Here the lines are already grouped by department, so `sort` is not needed.

</details>

---

**Exercise 3 — Create a CSV file**

Prepare `names.csv` for import into LibreOffice in the format:

```
First Name,Last Name,Position
Carol,Smith,Finance
...
John,Chapel,Sales
```

<details>
<summary>Answer</summary>

Build three separate files first:
```bash
sed -n /'Main Office'/p mypasswd | cut -d: -f5 | cut -d" " -f1 > firstname
sed -n /'Main Office'/p mypasswd | cut -d: -f5 | cut -d" " -f2 | cut -d, -f1 > lastname
sed -n /'Main Office'/p mypasswd | cut -d: -f5 | cut -d, -f2 > department
```

Join with `paste` and replace tabs with commas:
```bash
paste firstname lastname department | tr '\t' , > names.csv
```

Or shorter using `paste -d`:
```bash
paste -d, firstname lastname department > names.csv
```

Most compact version without intermediate files:
```bash
sed -n /'Main Office'/p mypasswd | cut -d: -f5 | cut -d, -f1,2 | tr ' ' , > names.csv
```

</details>

---

**Exercise 4 — Integrity check with md5sum**

Verify that `names.csv` was not modified during transfer.

<details>
<summary>Answer</summary>

Compute the hash:
```bash
md5sum names.csv
# 61f0251fcab61d9575b1d0cbf0195e25  names.csv
```

If the file is modified, the hash changes completely:
```bash
sed -i.backup s/Jones/James/ names.csv
md5sum names.csv
# f44a0d68cb480466099021bf6d6d2e65  names.csv
```

It is best to send the file and its checksum over different channels. Linux distributions use the same principle: they publish `SHA256SUMS` or `MD5SUMS` files alongside ISO images. For real security use SHA-256 or SHA-512 — MD5 is cryptographically broken.

</details>

---

**Exercise 5 — Split a book into parts**

Split a text file into parts of 100 lines to read 100 lines per day.

<details>
<summary>Answer</summary>

Download a book from Project Gutenberg:
```bash
wget https://www.gutenberg.org/files/50461/50461-0.txt
```

Split into 100-line parts with numeric suffixes:
```bash
split -l 100 -d 50461-0.txt melville
```

Flags:
- `-l 100` — 100 lines per file
- `-d` — numeric suffixes instead of alphabetic (melville00, melville01...)

Check the line count of a part:
```bash
nl melville00 | tail -1
```

</details>

---

**Exercise 6 — ls -l, tr and cut**

Display file information from `/etc` in various ways, combining `ls -l`, `tr` and `cut`.

<details>
<summary>Answer</summary>

The problem with `ls -l`: multiple spaces between fields break `cut`. Squeeze them with `tr -s ' '`:

```bash
ls -l /etc | tr -s ' '
```

Only filenames (9th field):
```bash
ls -l /etc | tr -s ' ' | cut -d" " -f9
```

Filename and owner (fields 9 and 3):
```bash
ls -l /etc | tr -s ' ' | cut -d" " -f9,3
```

Only directories with their owners:
```bash
ls -l /etc | grep ^d | tr -s ' ' | cut -d" " -f9,3
```

`grep ^d` keeps only lines starting with `d` (directory indicator in `ls -l`).

</details>

---

**Exercise 7 — Monitor a log and plug in a USB drive**

Use `tail -f` to monitor `/var/log/syslog` while inserting a USB drive. Find the device model, manufacturer and storage capacity.

<details>
<summary>Answer</summary>

```bash
tail -f /var/log/syslog | grep -i 'product\:\|blocks\|manufacturer'
```

Example output:
```
Nov  8 06:01:35 hostname kernel: usb 1-4.3: Product: Cruzer Blade
Nov  8 06:01:35 hostname kernel: usb 1-4.3: Manufacturer: SanDisk
Nov  8 06:01:37 hostname kernel: sd 2:0:0:0: [sdc] 61056064 512-byte logical blocks: (31.3 GB/29.1 GiB)
```

The `-i` flag makes `grep` case-insensitive. The `|` inside quotes acts as a logical OR: match lines containing `product:`, `blocks` or `manufacturer`. The backslash escapes `|` from shell interpretation.

</details>

---


## Related topics

- [103.1 Work on the Command Line](/posts/lpic1-103-1-work-on-command-line/) — shell, I/O redirection and pipelines
- 103.3 Perform Basic File Management — file management
- 103.4 Use Streams, Pipes and Redirects — streams and redirections
- 103.7 Search Text Files Using Regular Expressions — text editors (vi, nano)

---

*LPIC-1 Study Notes | Topic 103: GNU and Unix Commands*
