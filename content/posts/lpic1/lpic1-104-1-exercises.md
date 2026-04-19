---
title: "LPIC-1 104.1 — Exercises and Walkthroughs"
date: 2026-04-19
description: "Guided and explorational exercises for LPIC-1 topic 104.1: partitions, filesystems, swap, fdisk, gdisk, parted."
tags: ["Linux", "LPIC-1", "fdisk", "gdisk", "parted", "mkfs", "swap", "exercises"]
categories: ["LPIC-1"]
page_lang: "en"
lang_pair: "/posts/lpic1/ru/lpic1-104-1-exercises/"
---

> **Topic 104.1** — Create Partitions and Filesystems. Guided and explorational exercises.

---

## Guided Exercises

### 1. Which partition table for a 3 TB disk with three 1 GB partitions — and why?

**Answer:** GPT. MBR is limited to 2 TB disks, so a 3 TB disk cannot be fully addressed by MBR.

---

### 2. How to see free space remaining on a disk in gdisk?

**Answer:** command `p` (print). The header above the partition list shows total free space:

```
Total free space is 1282071 sectors (626.0 MiB)
```

---

### 3. Create ext3 on /dev/sdc1 with bad block check, label MyDisk, and a random UUID

**Answer:**

```bash
mkfs.ext3 -c -L MyDisk -U random /dev/sdc1
```

Alternative via `mke2fs`:

```bash
mke2fs -t ext3 -c -L MyDisk -U random /dev/sdc1
```

---

### 4. In parted: create a 300 MB ext4 partition starting at 500 MB

**Answer:**

```
(parted) mkpart primary ext4 500m 800m
```

**Remember:** parted only sets a type flag — it does **not** create the filesystem. After exiting parted, run `mkfs.ext4 /dev/sdXN` separately.

---

### 5. Two 20 GB partitions. Combine into one Btrfs with mirroring. What is the usable size?

**Answer:**

```bash
mkfs.btrfs /dev/sda1 /dev/sdb1 -m raid1
```

Usable size: **20 GB** — one partition mirrors the other.

For full mirroring of both data and metadata:

```bash
mkfs.btrfs -d raid1 -m raid1 /dev/sda1 /dev/sdb1
```

---

## Explorational Exercises

### 1. Can you create a 600 MB partition on an MBR disk that has a gap between partitions?

**Given:** MBR disk 1.9 GB with `/dev/sdb1` (512 MB) and `/dev/sdb3` (512 MB). Free space exists between and after the partitions.

**Answer:** No. Total free space is about 1 GB, but the largest *contiguous* free block is only 512 MB. A partition cannot span a gap.

```
Value out of range.
```

Use `F` in fdisk to see the layout of free space:

```
Unpartitioned space /dev/sdd: 881 MiB, 923841536 bytes, 1804378 sectors
  Start       End  Sectors  Size
1050624   2099199  1048576  512M
3147776   3903577   755802  369M
```

---

### 2. Shrink the first partition on /dev/sdc to the minimum needed size

**Given:** first partition 1 GB with ext4, about 256 MB of files inside.

**Answer:** two-step operation — filesystem first, then partition boundary.

Step 1 — shrink the filesystem to fit actual data (`-M`):

```bash
resize2fs -M /dev/sdc1
```

Step 2 — move the partition end in parted:

```
(parted) resizepart 1 241M
```

**Order is critical:** always shrink the filesystem before moving the partition boundary. Doing it in reverse destroys data.

---

### 3. swapon gives "read swap header failed" — what is wrong?

**Given:** partition created with `mkpart primary linux-swap 0 1024M`, then `swapon /dev/sdb1` fails.

**Answer:** `mkpart` creates the partition but does **not** write the swap header. Run `mkswap` first:

```bash
mkswap /dev/sdb1
swapon /dev/sdb1
```

---

### 4. Recover an accidentally deleted third partition in parted

**Given:** disk had an EFI partition (250 MB), swap (4 GB), and a third partition (10 GB). The third was accidentally deleted.

**Answer:** use `rescue` with estimated boundaries.

Calculate: 250 MB (EFI) + 4×1024 MB (swap) = 4346 MB — start. End: 4346 + 10×1024 = 14 586 MB.

```
(parted) rescue 4346m 14586m
```

Give a small margin in both directions — disk geometry can shift boundaries slightly. `rescue` only finds partitions that had a filesystem.

---

### 5. Turn /dev/sda3 into active swap using fdisk

**Given:** unused 4 GB partition on /dev/sda3.

**Answer:** three steps.

Step 1 — change partition type to Linux Swap in fdisk:

```
Command (m for help): t
Partition number (1-3, default 3): 3
Hex code (type L to list all codes): 82

Changed type of partition 'Linux' to 'Linux swap / Solaris'.

Command (m for help): w
```

Step 2 — write the swap header:

```bash
mkswap /dev/sda3
```

Step 3 — activate swap:

```bash
swapon /dev/sda3
```
