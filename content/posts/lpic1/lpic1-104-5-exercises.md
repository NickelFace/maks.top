---
title: "LPIC-1 104.5 — Exercises and Walkthroughs"
date: 2026-04-19
description: "Guided and explorational exercises for LPIC-1 topic 104.5: chmod, chown, umask, SUID, SGID, sticky bit."
tags: ["Linux", "LPIC-1", "chmod", "chown", "umask", "SUID", "SGID", "sticky bit", "exercises"]
categories: ["LPIC-1"]
page_lang: "en"
lang_pair: "/posts/lpic1/ru/lpic1-104-5-exercises/"
---

> **Topic 104.5** — Manage File Permissions and Ownership. Guided and explorational exercises.

---

## Guided Exercises

### 1. Permissions on an empty directory

**Task:** create `emptydir` with `mkdir emptydir`. Show the permissions on the directory itself (not its contents).

**Answer:**

```bash
ls -ld emptydir
# or
ls -l -d emptydir
```

Without `-d`, `ls` lists the directory's contents. The `-d` flag makes it show the directory's own attributes.

---

### 2. chmod in symbolic mode

**Task:** create `emptyfile` with `touch emptyfile`. In a single `chmod` command using symbolic mode: add execute for the owner and remove write and execute from group and others.

**Answer:**

```bash
chmod u+x,go-wx emptyfile
```

`u+x` — add execute for owner. `go-wx` — remove write and execute from group and others. Multiple changes are comma-separated with no spaces.

---

### 3. Calculate permissions from umask

**Task:** what permissions will new files have if umask is `027`?

**Answer:** `rw-r-----` (640).

Calculation: `666 - 027 = 640`. Files never get `x` by default, so the `x` bits in the mask have no effect on files.

---

### 4. Parse permissions and remove SGID

**Task:**

```
-rwxr-sr-x 1 carol root 33 Dec 11 10:36 test.sh
```

What are the owner's permissions? How to remove the special permission with octal notation?

**Answer:**

Owner permissions — characters 2–4 in `ls -l` output: `rwx`. Owner can read, write, and execute.

Converting to octal: `rwx`=7, `r-x` for group (the `s` is in the `x` position, so `x` is present)=5, `r-x`=5 → regular permissions are `755`.

To remove the special permission, pass `0` as the 4th digit:

```bash
chmod 0755 test.sh
```

---

### 5. Block device

**Task:**

```
$ ls -l /dev/sdb1
brw-rw---- 1 root disk 8, 17 Dec 21 18:51 /dev/sdb1
```

What type of file is this? Who can write to it?

**Answer:** first character `b` — block device (typically a disk).

Write access: owner (`root`) and any member of the `disk` group. Others have no access.

---

### 6. Octal notation for four files

**Task:** express permissions in four-digit octal notation:

```
drwxr-xr-t 2 carol carol  4,0K Dec 20 18:46 Another_Directory
----r--r-- 1 carol carol     0 Dec 11 10:55 foo.bar
-rw-rw-r-- 1 carol carol  1,2G Dec 20 18:22 HugeFile.zip
drwxr-sr-x 2 carol users 4,0K Jan 18 17:26 Sample_Directory
```

**Answer:**

| File | Octal | Notes |
|---|---|---|
| `Another_Directory` | **1755** | sticky=1; `rwx`=7, `r-x`=5, `r-x`=5 |
| `foo.bar` | **0044** | no special bits; `---`=0, `r--`=4, `r--`=4 |
| `HugeFile.zip` | **0664** | no special bits; `rw-`=6, `rw-`=6, `r--`=4 |
| `Sample_Directory` | **2755** | SGID=2; `rwx`=7, `r-x`=5, `r-x`=5 |

---

## Explorational Exercises

### 1. chmod with one or two digits

**Task:** reset all permissions with `chmod 000 emptyfile`. What happens with `chmod 4 emptyfile`? With `chmod 44 emptyfile`? What does this reveal about how `chmod` reads numeric values?

**Answer:**

After `chmod 4 emptyfile`:
```
-------r-- 1 carol carol 0 emptyfile
```
Changed: **others** only.

After `chmod 44 emptyfile`:
```
----r--r-- 1 carol carol 0 emptyfile
```
Changed: **group and others**.

**Conclusion:** `chmod` reads digits right to left:

| Digits given | What changes |
|---|---|
| 1 | others only |
| 2 | group + others |
| 3 | owner + group + others |
| 4 | special bits + all three groups |

---

### 2. /tmp permissions and file deletion

**Task:**

```
drwxrwxrwt 19 root root 16K /tmp
```

Owner, group, and others all have full permissions. Can a regular user delete another user's files?

**Answer:** No. `/tmp` is world-writable (anyone can create files), but the **sticky bit** (`t`) is set. It means only the file's owner or the directory's owner can delete or rename files inside.

A regular user can only delete their own files in `/tmp`.

---

### 3. SUID and uppercase S

**Task:** `test.sh` has `-rwsr-xr-x` (SUID set). After running:

```bash
chmod u-x test.sh
ls -l test.sh
# -rwSr-xr-x 1 carol carol 33 Dec 11 10:36 test.sh
```

What happened? What does the uppercase `S` mean?

**Answer:** removed execute permission from the owner. Since `s` and `t` occupy the `x` position, the system uses letter case to encode whether `x` is present:

| Symbol | Special bit | `x` present? |
|---|---|---|
| `s` (lowercase) | set | yes |
| `S` (uppercase) | set | **no** |
| `t` (lowercase) | sticky set | yes |
| `T` (uppercase) | sticky set | **no** |

Uppercase is a diagnostic signal: the special bit is set, but without `x` it is likely useless.

---

### 4. Shared Box directory with SGID and sticky bit

**Task:** create a `Box` directory where all new files automatically belong to group `users`, and only the file's creator can delete it.

**Answer:**

Step 1 — create the directory:

```bash
mkdir Box
```

Step 2 — assign group ownership and set SGID (new files inherit the parent's group):

```bash
chown :users Box/
chmod g+wxs Box/
```

Step 3 — set sticky bit (only the file's owner can delete):

```bash
chmod o+t Box/
```

Or combine both in one command:

```bash
chmod g+wxs,o+t Box/
```

Result:

```
drwxrwsr-t 2 carol users 4,0K Jan 18 19:09 Box
```
