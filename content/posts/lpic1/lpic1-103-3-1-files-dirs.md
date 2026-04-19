---
title: "LPIC-1 103.3 — Basic File Management: Files, Directories and Globbing"
date: 2026-04-16
description: "cp, mv, rm, mkdir, touch, ls, globbing, file command. Basic file operations. LPIC-1 exam topic 103.3."
tags: ["Linux", "LPIC-1", "cp", "mv", "rm", "ls", "mkdir", "glob"]
categories: ["LPIC-1"]
page_lang: "en"
lang_pair: "/posts/lpic1/ru/lpic1-103-3-1-files-dirs/"
---

> **Exam weight: 4** — LPIC-1 v5, Exam 101 | Part 1 of 103.3

## What You Need to Know

- Copy, move, and delete files and directories individually.
- Recursively copy and delete multiple files and directories.
- Use simple and extended wildcard patterns in commands.
- Search for files using `find` by type, size, and time.
- Work with `tar`, `cpio`, and `dd`.

---

## Copying Files and Directories

### cp

`cp` copies files and directories.

```bash
cp source dest          # copy a file
cp file1 file2 dir/     # copy multiple files into a directory
cp -r dir1/ dir2/       # recursively copy a directory
cp -p file dest         # preserve permissions, owner, timestamps
cp -a dir1/ dir2/       # archive mode: recursive + preserve all attributes (= -dR --preserve=all)
cp -i file dest         # prompt before overwriting
cp -u file dest         # copy only if source is newer than dest
cp -v file dest         # verbose output
cp -l file dest         # create a hard link instead of copying
cp -s file dest         # create a symbolic link instead of copying
```

`-r` (or `-R`) copies directories recursively. Without it `cp` will error on a directory.

`-a` combines `-dR --preserve=all`: preserves symbolic links, permissions, timestamps, and owner. Use it for full backups.

---

## Moving and Renaming

### mv

`mv` moves files and directories, and renames them.

```bash
mv file newname         # rename a file
mv file dir/            # move a file into a directory
mv dir1/ dir2/          # move or rename a directory
mv -i file dest         # prompt before overwriting
mv -u file dest         # move only if source is newer than dest
mv -v file dest         # verbose output
```

`mv` is atomic within a single filesystem: the file simply gets a new name in the directory tree. Across different filesystems, `mv` copies the file and removes the original.

---

## Removing Files and Directories

### rm

```bash
rm file                 # remove a file
rm file1 file2          # remove multiple files
rm -r dir/              # recursively remove a directory and its contents
rm -f file              # force remove without prompt (ignores non-existent files)
rm -rf dir/             # recursive and forced (be careful!)
rm -i file              # prompt for each file
rm -v file              # verbose output
```

### rmdir

`rmdir` removes only empty directories.

```bash
rmdir dir/              # remove an empty directory
rmdir -p a/b/c          # remove a chain of empty directories
```

If a directory contains even one file, `rmdir` will error. For non-empty directories use `rm -r`.

---

## Creating Files and Directories

### mkdir

```bash
mkdir dir               # create a directory
mkdir -p a/b/c          # create the full directory chain (-p doesn't error on existing ones)
mkdir -m 755 dir        # create a directory with specified permissions
```

### touch

`touch` creates an empty file or updates the timestamps of an existing one.

```bash
touch file              # create a file or update atime/mtime to current time
touch -t 202312311230 file  # set a specific time (YYYYMMDDhhmm)
touch -d "2023-12-31" file  # set a date in readable format
touch -a file           # update only atime
touch -m file           # update only mtime
```

---

## Listing Directory Contents

### ls

```bash
ls                      # list files in current directory
ls -l                   # long listing
ls -a                   # show hidden files (starting with .)
ls -la                  # long listing with hidden files
ls -lh                  # sizes in human-readable format (K, M, G)
ls -lt                  # sort by modification time
ls -lr                  # reverse sort order
ls -R                   # recursive listing
ls -i                   # show inode numbers
ls -d dir/              # show info about the directory itself, not its contents
```

---

## Globbing and Patterns

File globbing is the shell expanding patterns before passing arguments to a command.

### Basic Wildcards

| Character | Meaning |
|-----------|---------|
| `*` | any sequence of characters (including empty) |
| `?` | exactly one character |
| `[abc]` | one character from the set |
| `[a-z]` | one character from the range |
| `[!abc]` | one character not in the set |
| `[^abc]` | same (shell-dependent) |

### Examples

```bash
ls *.txt            # all files with .txt extension
ls file?.log        # file1.log, file2.log, but not file10.log
ls report[0-9].pdf  # report0.pdf ... report9.pdf
ls [!.]* 2>/dev/null # files not starting with a dot (like ls without -a)
cp *.conf /etc/bak/ # copy all .conf files
rm temp*            # remove everything starting with temp
```

### Extended Globbing (extglob)

In bash, extended globbing is enabled with `shopt -s extglob`:

| Pattern | Meaning |
|---------|---------|
| `?(pattern)` | zero or one match |
| `*(pattern)` | zero or more matches |
| `+(pattern)` | one or more matches |
| `@(pattern)` | exactly one match |
| `!(pattern)` | anything except the match |

```bash
shopt -s extglob
ls !(*.bak)         # all files except .bak
```

---


## Identifying File Types

### file

`file` determines a file's type by examining its content, not its extension.

```bash
file document.pdf       # PDF document, version 1.4
file script.sh          # POSIX shell script
file /bin/ls            # ELF 64-bit LSB executable
file image.jpg          # JPEG image data
file archive.tar.gz     # gzip compressed data
```

`file` reads signatures from `/etc/magic` and `/usr/share/misc/magic`.

---

## Exam Quick Reference

```bash
# cp
cp -r src/ dst/                          # recursive copy
cp -a src/ dst/                          # archive mode (preserves everything)
cp -i *.txt /backup/                     # copy with prompt

```

---


## Exam Tips

**Recursively remove a directory:** `rm -rf dir/` (not `rmdir`).

**Preserve permissions when copying:** `cp -a` or `cp -p`.


---

## Exercises

### Guided Exercises

#### 1. Analyzing ls -lh Output

Given the output of `ls -lh`:

```
total 60K
drwxr-xr-x  2  frank  frank  4.0K  Apr 1  2018  Desktop
drwxr-xr-x  2  frank  frank  4.0K  Apr 1  2018  Documents
-rw-r--r--  1  frank  frank  21    Sep 7  12:59  emp_name
-rw-r--r--  1  frank  frank  20    Sep 7  13:03  emp_salary
-rw-r--r--  1  frank  frank  8.8K  Apr 1  2018  examples.desktop
-rw-r--r--  1  frank  frank  10    Sep 1  2018  file1
```

**What does the `d` at the start of a line mean?**

<details><summary>Answer</summary>

`d` marks a directory. A regular file uses `-`, a special character device uses `c`.

</details>

**Why are sizes displayed in human-readable format?**

<details><summary>Answer</summary>

Because of the `-h` flag. Without it sizes would be in bytes.

</details>

**How would the output of plain `ls` differ?**

<details><summary>Answer</summary>

Only filenames would be shown — no permissions, owner, size, or date.

</details>

---

#### 2. Copying and Moving

Given:

```bash
cp /home/frank/emp_name /home/frank/backup
```

**What happens to `emp_name` on success?**

<details><summary>Answer</summary>

`emp_name` is copied into the `backup` directory. The original file stays in place.

</details>

**If `emp_name` were a directory, which flag would `cp` need?**

<details><summary>Answer</summary>

`-r` (recursive). Without it `cp` refuses to copy a directory with the message `omitting directory`.

</details>

**If `cp` were replaced with `mv`, what changes?**

<details><summary>Answer</summary>

`emp_name` would be moved into `backup`. It would no longer exist in frank's home directory.

</details>

---

#### 3. Removing with a Wildcard

Given a directory with:

```
file1.txt  file2.txt  file3.txt  file4.txt
```

**Which wildcard removes everything with one command?**

<details><summary>Answer</summary>

The asterisk `*`:

```bash
rm *
```

`*` matches any number of any characters, including empty — it captures all files.

</details>

---

#### 4. ls with a Wildcard

**Which files does `ls file*.txt` list from the same directory?**

<details><summary>Answer</summary>

All four: `file1.txt`, `file2.txt`, `file3.txt`, `file4.txt`. The asterisk matches any number of characters, including a single digit.

</details>

---

#### 5. Bracket Globbing

**Complete the command to list all four files (`file1.txt`…`file4.txt`):**

```bash
ls file[].txt
```

<details><summary>Answer</summary>

```bash
ls file[0-9].txt
```

`[0-9]` is a range matching one digit from 0 to 9. `[1-4]` or `[1234]` also work.

</details>

---



### Explorational Exercises

#### 1. Create Files dog and cat

**Task:** In your home directory, create files named `dog` and `cat`.

<details><summary>Answer</summary>

```bash
touch dog cat
```

`touch` creates empty files with current timestamps. Multiple names can be passed in one command.

</details>

---

#### 2. Create a Directory and Move Files

**Task:** Create an `animal` directory and move `dog` and `cat` into it.

<details><summary>Answer</summary>

```bash
mkdir animal
mv dog cat -t animal/
```

`-t` specifies the target directory explicitly — convenient when moving multiple files. `mv dog cat animal/` also works.

</details>

---

#### 3. Create backup Inside Documents

**Task:** Go to `~/Documents` and create a `backup` directory there.

<details><summary>Answer</summary>

```bash
cd ~/Documents
mkdir backup
```

</details>

---

#### 4. Recursive Copy

**Task:** Copy `animal` together with its contents into `backup`.

<details><summary>Answer</summary>

```bash
cp -r animal ~/Documents/backup
```

`-r` copies the directory recursively. Without this flag `cp` errors with `omitting directory`.

</details>

---

#### 5. Rename Inside backup

**Task:** Rename `animal` inside `backup` to `animal.bkup`.

<details><summary>Answer</summary>

```bash
mv animal/ animal.bkup
```

Run inside the `backup` directory. `mv` renames a directory the same way it renames a file.

</details>

---


---

---

*Topic 103: GNU and Unix Commands*
