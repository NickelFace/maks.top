---
title: "LPIC-1 104.6 — Create and Change Hard and Symbolic Links"
date: 2026-04-19
description: "ln, ln -s, inode, link count, hard and symbolic links, ls -li, broken links. LPIC-1 exam topic 104.6."
tags: ["Linux", "LPIC-1", "ln", "symlink", "hardlink", "inode", "links"]
categories: ["LPIC-1"]
page_lang: "en"
lang_pair: "/posts/lpic1/ru/lpic1-104-6-links/"
---

> **Exam weight: 2** — LPIC-1 v5, Exam 101

## What You Need to Know

- Create hard and symbolic links with `ln`.
- Distinguish them using `ls -l` and `ls -i`.
- Understand the difference between copying and linking.
- Know hard link limitations: same filesystem only, no links to directories.

---

## Inodes and Links

### What is an Inode

An inode is a filesystem data structure storing a file's attributes: permissions, owner, size, timestamps, and disk block pointers. **The filename is not stored in the inode.** A filename exists as a directory entry that maps a string to an inode number.

All kernel interaction with a file goes through its inode.

### Two Types of Links

**Hard link:** an additional directory entry pointing to the same inode as the original name. Both names are fully equivalent — there is no way to tell which is the "original."

**Symbolic link (symlink/soft link):** a separate file with its own inode whose contents are a path string pointing to the target. When accessed, the kernel follows that path to the target.

---

## Hard Links

### Creating a Hard Link

```
ln TARGET LINK_NAME
```

```bash
ln target.txt /home/carol/Documents/hardlink
```

Omitting `LINK_NAME` creates a link with the same name as the target in the current directory.

### Link Count and Inode

```bash
ls -li
# 3806696 -r--r--r-- 2 carol carol 111702 Jun 7 10:13 hardlink
# 3806696 -r--r--r-- 2 carol carol 111702 Jun 7 10:13 target.txt
```

- First column — inode number. Same number = same data.
- `2` after permissions — hard link count.
- Default count: 1 for regular files, 2 for directories.
- Each new hard link increments the count by 1.

Changes through any name are visible through all others — the data on disk is shared.

### Moving and Deleting

Hard links behave like regular files: `rm` to delete, `mv` to move/rename. Because the link points to an inode (not a path), moving it does not break the connection.

`rm` on one name only decrements the counter. Data survives as long as count > 0.

### Limitations

- **Cannot** create a hard link to a **directory** (prevents directory cycles).
- **Cannot** create a hard link **across filesystem boundaries**.

```bash
ln /media/user/FlashA/file.txt ~/link
# ln: failed to create hard link ... : Invalid cross-device link
```

---

## Symbolic Links

### Creating a Symbolic Link

```
ln -s TARGET LINK_NAME
```

```bash
ln -s target.txt /home/carol/Documents/softlink
```

Unlike hard links: can point to directories and can cross filesystem boundaries.

### Identifying in ls Output

```bash
ls -lh
# lrwxrwxrwx 1 carol carol 12 Jun 7 10:14 softlink -> target.txt
```

Indicators: first character `l`, and `->` followed by the target path after the name.

### Permissions

A symlink always shows `lrwxrwxrwx` in `ls -l`. **Real access is determined by the target's permissions.**

### Relative vs Absolute Paths

If the target path is relative, it is interpreted **relative to the symlink's location**. Moving the symlink to another directory will break it.

```bash
# Created in ~/Documents/ — dangerous (relative)
ln -s original.txt softlink

# After mv softlink ../ — broken!
# Fix: always use an absolute path
ln -s /home/carol/Documents/original.txt softlink
```

### Broken Links

When the target is deleted, the symlink remains but points nowhere — a **broken (dangling) link**. If a file with the same name is later created at the same path, the symlink works again.

### Deleting and Moving

Same as regular files: `rm link`, `mv link /new/path`.

---

## Copying vs Linking

| Method | Inode | Disk space | Relation to original |
|---|---|---|---|
| `cp` | new | new | independent |
| `ln` (hard) | shared with target | shared | full — same data |
| `ln -s` (symlink) | own, new | a few bytes (path string) | via path to target |

---

## Comparison Table

| Property | Hard link | Symbolic link |
|---|---|---|
| Command | `ln T L` | `ln -s T L` |
| Type in `ls -l` | `-` (like a file) | `l` |
| Own inode | no, shared | yes |
| Increments link count | yes | no |
| Cross filesystem | no | yes |
| Link to directory | no | yes |
| When target deleted | data survives (count ≥ 1) | link breaks |
| Size in `ls -l` | same as target | length of path string |

---

## Uses in System Administration

- **Version switching:** `/usr/bin/python` → `python3.11`. Retarget the link to switch interpreters without editing scripts.
- **nginx `sites-enabled`:** config files are symlinks to `sites-available/`.
- **Incremental backups** (`rsync --link-dest`): unchanged files are hard links to the previous snapshot — space-efficient while each snapshot looks complete.
- **Convenience access:** symlink in `~` pointing to `/var/log/myapp/`.

---

## Quick Reference

```bash
# Hard link
ln target.txt hardlink

# Symbolic link
ln -s target.txt softlink

# Symbolic link with absolute path (safe)
ln -s /home/user/file.txt /home/user/links/file

# Overwrite an existing link
ln -sf newtarget.txt softlink

# Show inode number and link count
ls -li

# Show inode number only
ls -i

# Delete any link
rm link

# Move a link
mv link /new/path
```

---

## Exam Questions

1. What happens when the target of a hard link is deleted? → Data remains accessible through the link; count drops to 1, not 0.
2. What happens when the target of a symlink is deleted? → The symlink becomes broken: `No such file or directory`.
3. Can you create a hard link to a directory? → **No**, only a symbolic link.
4. Can you create a hard link across filesystem boundaries? → **No**: `Invalid cross-device link`. Use a symlink instead.
5. Which `ls` flag shows the inode number? → **`-i`**.
6. What permissions does a symlink show in `ls -l`? → Always **`lrwxrwxrwx`**. Real access is from the target.
7. How does a copy differ from a hard link? → A copy has its own inode and disk space; a hard link shares the inode and data with the target.
8. How to create `c.txt` with the same inode as `a.txt`? → `ln a.txt c.txt`.
9. Does a symlink increase the target's link count? → **No**.
10. Why does a relative symlink break when moved? → The target path is resolved relative to the symlink's location; in the new directory, that relative path leads nowhere.
