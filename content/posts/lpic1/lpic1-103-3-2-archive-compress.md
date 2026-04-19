---
title: "LPIC-1 103.3 — Archiving, Compression and dd (Part 2)"
date: 2026-04-16
description: "tar, cpio, dd, gzip, bzip2, xz. Archiving and compressing files. LPIC-1 exam topic 103.3."
tags: ["Linux", "LPIC-1", "tar", "cpio", "dd", "gzip", "bzip2", "xz"]
categories: ["LPIC-1"]
page_lang: "en"
lang_pair: "/posts/lpic1/ru/lpic1-103-3-2-archive-compress/"
---

> **Exam weight: 4** — LPIC-1 v5, Exam 101 | Part 2 of 103.3

## What You Need to Know

- Create and extract archives with `tar`.
- Use `cpio` for archive creation from file lists.
- Copy raw data between devices with `dd`.
- Compress and decompress with `gzip`, `bzip2`, `xz`.

---

## Archiving: tar and cpio

### tar

`tar` (Tape ARchive) creates archives from files and directories.

#### Creating an Archive

```bash
tar -cf archive.tar dir/        # create archive
tar -czf archive.tar.gz dir/    # create + compress with gzip
tar -cjf archive.tar.bz2 dir/   # create + compress with bzip2
tar -cJf archive.tar.xz dir/    # create + compress with xz
tar -cvf archive.tar dir/       # create with verbose output
```

#### Viewing Contents

```bash
tar -tf archive.tar             # list files in archive
tar -tvf archive.tar            # detailed listing
```

#### Extracting

```bash
tar -xf archive.tar             # extract to current directory
tar -xzf archive.tar.gz         # extract .tar.gz
tar -xjf archive.tar.bz2        # extract .tar.bz2
tar -xf archive.tar -C /dest/   # extract to specified directory
tar -xf archive.tar file.txt    # extract only one file
```

#### tar Flags (memorize)

| Flag | Meaning |
|------|---------|
| `-c` | create |
| `-x` | extract |
| `-t` | list |
| `-f` | file (archive name) |
| `-z` | gzip |
| `-j` | bzip2 |
| `-J` | xz |
| `-v` | verbose |
| `-C` | change directory (extraction target) |
| `-p` | preserve permissions |
| `--exclude` | exclude file/directory |

`-f` is almost always required. The filename follows immediately after `-f`.

### cpio

`cpio` (copy in/out) works with a file list from stdin.

```bash
# Create archive
find . -name "*.conf" | cpio -ov > backup.cpio

# View contents
cpio -tv < backup.cpio

# Extract
cpio -idv < backup.cpio

# Extract to another directory
(mkdir -p /dest && cd /dest && cpio -idv < /path/backup.cpio)
```

`cpio` modes:
- `-o` (out) — create archive
- `-i` (in) — extract
- `-p` (pass-through) — copy without creating an archive

---

## Copying Data: dd

`dd` copies data byte by byte. Works with block devices and files.

```bash
# Create a disk image
dd if=/dev/sda of=/backup/disk.img

# Restore an image
dd if=/backup/disk.img of=/dev/sda

# Create a partition image
dd if=/dev/sda1 of=partition.img

# Create a file of a given size (filled with zeros)
dd if=/dev/zero of=test.img bs=1M count=100

# Create a file with random data
dd if=/dev/urandom of=random.bin bs=1M count=10

# Create a bootable USB
dd if=linux.iso of=/dev/sdb bs=4M status=progress

# Convert case
dd if=input.txt of=output.txt conv=ucase
```

`dd` parameters:

| Parameter | Meaning |
|-----------|---------|
| `if=` | input file (source) |
| `of=` | output file (destination) |
| `bs=` | block size |
| `count=` | number of blocks |
| `skip=` | skip blocks at start of input |
| `seek=` | skip blocks at start of output |
| `conv=` | conversion (ucase, lcase, notrunc, sync…) |
| `status=progress` | show progress |

---

## File Compression

### gzip and gunzip

`gzip` compresses files, replacing the original with `.gz`.

```bash
gzip file.txt           # creates file.txt.gz, removes file.txt
gzip -k file.txt        # keep the original file
gzip -d file.txt.gz     # decompress (= gunzip)
gzip -1 file.txt        # fast compression (weak)
gzip -9 file.txt        # maximum compression (slow)
gzip -l file.txt.gz     # show archive info
gunzip file.txt.gz      # decompress
zcat file.txt.gz        # read without decompressing
```

### bzip2 and bunzip2

`bzip2` gives better compression than gzip but is slower.

```bash
bzip2 file.txt          # creates file.txt.bz2, removes file.txt
bzip2 -k file.txt       # keep the original file
bzip2 -d file.txt.bz2   # decompress (= bunzip2)
bzip2 -1 file.txt       # fast compression
bzip2 -9 file.txt       # maximum compression
bunzip2 file.txt.bz2    # decompress
bzcat file.txt.bz2      # read without decompressing
```

### xz

`xz` provides the best compression of the three, but is the slowest.

```bash
xz file.txt             # creates file.txt.xz
xz -d file.txt.xz       # decompress
xz -k file.txt          # keep original
xzcat file.txt.xz       # read without decompressing
```

---
## Exam Quick Reference

```bash
# tar — remember order: operation, then modifiers, then -f
tar -czf backup.tar.gz /home/user/
tar -xzf backup.tar.gz -C /restore/
tar -tf archive.tar

# dd — disk copying
dd if=/dev/sda of=disk.img bs=4M status=progress

# gzip/bzip2
gzip -k largefile.log        # compress, keeping original
tar -czf backup.tar.gz dir/  # most often used through tar
```

---


---

## Exam Tips
**Create an archive compressed with bzip2:** `tar -cjf arch.tar.bz2 dir/`.

**Extract .tar.gz to /tmp:** `tar -xzf arch.tar.gz -C /tmp/`.

**View archive contents without extracting:** `tar -tf arch.tar`.

**Difference between mtime, atime, ctime:**
- `mtime` — time of last file content modification.
- `atime` — time of last file access.
- `ctime` — time of last metadata change (permissions, owner).

**What `touch` does to an existing file:** updates its timestamps to the current time.

**Difference between `cpio` and `tar`:** `cpio` reads a file list from stdin; `tar` takes filenames directly.

**`dd conv=notrunc`:** do not truncate the output file when writing.

---


---

## Exercises

### Guided Exercises

#### 7. Missing tar Flag

A user wants to create a compressed archive:

```bash
tar cvf /home/frank/backup.tar.gz /home/frank/dir1
```

**Which flag is missing for gzip compression?**

<details><summary>Answer</summary>

`-z`. Without it `tar` creates a plain uncompressed archive despite the `.gz` extension. The correct command:

```bash
tar -czvf /home/frank/backup.tar.gz /home/frank/dir1
```

</details>

---

### Explorational Exercises
6. List Specific Archives

**Task:** The directory `/home/lpi/databases` contains many files including `db-1.tar.gz`, `db-2.tar.gz`, and `db-3.tar.gz`. List only those three with a single command.

<details><summary>Answer</summary>

```bash
ls db-[1-3].tar.gz
```

`[1-3]` matches exactly one character in the range 1–3, which precisely excludes all other files.

</details>

---

#### 7. Remove Only PDFs

**Task:** Given a directory:

```
cne1222223.pdf  cne12349.txt  cne1234.pdf
```

Remove only `.pdf` files using a single glob character.

<details><summary>Answer</summary>

```bash
rm *.pdf
```

`*` matches any name before `.pdf`. The `.txt` file is untouched.

</details>

---

#### 8. Find and Delete Large Backup Files

**Task:** Find files with the `.backup` extension in `/var`.

<details><summary>Answer</summary>

```bash
find /var -name "*.backup"
```

</details>

**Task:** Narrow it down: find only `.backup` files between 100M and 1000M in size.

<details><summary>Answer</summary>

```bash
find /var -name "*.backup" -size +100M -size -1000M
```

Two `-size` conditions combine as AND: the file must be strictly larger than 100M and strictly smaller than 1000M.

</details>

**Task:** Add deletion of the found files to the previous command.

<details><summary>Answer</summary>

```bash
find /var -name "*.backup" -size +100M -size -1000M -delete
```

`-delete` removes each found file directly without spawning an external process. Use it only after verifying the search returns exactly the files you intend to delete.

</details>

---

#### 9. Archive Multiple Files

Four files are in `/var`:

```
db-jan-2018.backup
db-feb-2018.backup
db-march-2018.backup
db-apr-2018.backup
```

**Task:** Create an archive `db-first-quarter-2018.backup.tar` from all four files.

<details><summary>Answer</summary>

```bash
tar -cvf db-first-quarter-2018.backup.tar db-jan-2018.backup db-feb-2018.backup db-march-2018.backup db-apr-2018.backup
```

`tar` accepts multiple files separated by spaces. All of them go into the single archive.

</details>

**Task:** Create the same archive but compressed with gzip. The filename should end in `.gz`.

<details><summary>Answer</summary>

```bash
tar -zcvf db-first-quarter-2018.backup.tar.gz db-jan-2018.backup db-feb-2018.backup db-march-2018.backup db-apr-2018.backup
```

The `-z` flag adds gzip compression. The `.tar.gz` extension indicates a tar archive compressed with gzip.

</details>

---

---

*Topic 103: GNU and Unix Commands*
