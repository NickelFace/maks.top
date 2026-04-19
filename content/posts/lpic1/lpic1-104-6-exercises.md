---
title: "LPIC-1 104.6 — Exercises and Walkthroughs"
date: 2026-04-19
description: "Guided and explorational exercises for LPIC-1 topic 104.6: hard links, symlinks, ln, ls -li, broken links."
tags: ["Linux", "LPIC-1", "ln", "symlink", "hardlink", "links", "exercises"]
categories: ["LPIC-1"]
page_lang: "en"
lang_pair: "/posts/lpic1/ru/lpic1-104-6-exercises/"
---

> **Topic 104.6** — Create and Change Hard and Symbolic Links. Guided and explorational exercises.

---

## Guided Exercises

### 1. chmod option for sticky bit

**Question:** which symbolic-mode `chmod` option enables the sticky bit on a directory?

**Answer:**

```bash
chmod +t /path/to/dir
# or explicitly for others:
chmod o+t /path/to/dir
```

The sticky bit symbol is `t`. To enable it, use `+t`.

---

### 2. Creating a symbolic link

**Task:** the file `document.txt` is in `/home/carol/Documents`. Create a symbolic link named `text.txt` in the current directory pointing to it.

**Answer:**

```bash
ln -s /home/carol/Documents/document.txt text.txt
```

The `-s` flag creates a symbolic link. Using the full path prevents the link from breaking if it is ever moved.

---

### 3. Hard link vs copy

**Question:** explain the difference between a hard link to a file and a copy of that file.

**Answer:**

A **hard link** is another name for the same file. Link and original share one inode and one set of disk blocks. Changes through any name are visible through all others.

A **copy** is a fully independent entity with its own inode and its own disk space. Changes to the copy do not affect the original.

---

## Explorational Exercises

### 1. Deleting the target — what happens to the symlink?

**Scenario:**

```bash
touch recipes.txt
ln recipes.txt receitas.txt
ln -s receitas.txt rezepte.txt
```

```
5388833 -rw-r--r-- 2 carol carol  0 recipes.txt
5388833 -rw-r--r-- 2 carol carol  0 receitas.txt
5388837 lrwxrwxrwx 1 carol carol 12 rezepte.txt -> receitas.txt
```

**Question:** what happens to `rezepte.txt` after `rm receitas.txt`?

**Answer:** `rezepte.txt` becomes a **broken link**. Symlinks point to **names**, not inodes. The name `receitas.txt` no longer exists, so the symlink leads nowhere.

The data itself survives on disk and is accessible via `recipes.txt` (a hard link with the same inode), but the symlink has no knowledge of that.

---

### 2. Hard link to a flash drive

**Scenario:** a USB drive is mounted at `/media/youruser/FlashA`. You run:

```bash
ln /media/youruser/FlashA/esquema.pdf ~/schematics.pdf
```

**Question:** what happens? Why?

**Answer:** the command fails with `Invalid cross-device link`. Hard links cannot span different devices or filesystems — an inode is only meaningful within its own filesystem.

Fix — use a symlink:

```bash
ln -s /media/youruser/FlashA/esquema.pdf ~/schematics.pdf
```

---

### 3. Analysing ls -lah output

**Scenario:**

```
-rw-rw-r-- 1 carol carol 2,8M jun 17 15:45 compressed.zip
-rw-r--r-- 4 carol carol  77K jun 17 17:25 document.txt
-rw-rw-r-- 1 carol carol 216K jun 17 17:25 image.png
-rw-r--r-- 4 carol carol  77K jun 17 17:25 text.txt
```

**Questions:**
- How many links point to `document.txt`?
- Are they hard or symbolic?
- Which `ls` flag shows inode numbers?

**Answers:**

Link count is **4**. Starting count is 1 (the name itself), so **3 additional hard links** were created.

They are **hard links** — symlinks do not increase the target's link count.

Flag **`-i`**:

```bash
ls -lahi
# 5388833 -rw-r--r-- 4 document.txt
# 5388833 -rw-r--r-- 4 text.txt
```

`document.txt` and `text.txt` share inode `5388833` → `text.txt` is one of those hard links.

---

### 4. Moving a relative symlink

**Scenario:**

```
~/Documents/
├── clients.txt          ("John, Michael, Bob")
└── somedir/
    ├── clients.txt      ("Bill, Luke, Karl")
    └── partners.txt -> clients.txt    (relative symlink)
```

```bash
mv ~/Documents/somedir/partners.txt ~/Documents/
less ~/Documents/partners.txt
```

**Question:** does the link work? Which file's content is shown?

**Answer:** the link works, but shows `~/Documents/clients.txt` — `John, Michael, Bob` — **not the intended file**.

Why: `partners.txt` stores `clients.txt` as a **relative path**, resolved from its current location. After moving from `somedir/` to `Documents/`, the link looks for `clients.txt` next to itself — and finds `Documents/clients.txt` instead.

Fix: always use an absolute path when creating symlinks:

```bash
ln -s /home/carol/Documents/somedir/clients.txt partners.txt
```

---

### 5. Symlink permissions

**Scenario:**

```
-rw-r--r-- 1 carol carol 19 Jun 24 11:12 clients.txt
lrwxrwxrwx 1 carol carol 11 Jun 24 11:13 partners.txt -> clients.txt
```

**Question:** what are the actual access permissions for `partners.txt`?

**Answer:** `rw-r--r--` — the target's permissions (`clients.txt`).

A symlink always shows `lrwxrwxrwx` in `ls -l`, but those are its own metadata. Access through the link is governed by the **target's permissions**.
