---
title: "LPIC-1 104.3 — Exercises and Walkthroughs"
date: 2026-04-19
description: "Guided and explorational exercises for LPIC-1 topic 104.3: mount, umount, fstab, UUID, systemd mount units."
tags: ["Linux", "LPIC-1", "mount", "umount", "fstab", "UUID", "systemd", "exercises"]
categories: ["LPIC-1"]
page_lang: "en"
lang_pair: "/posts/lpic1/ru/lpic1-104-3-exercises/"
---

> **Topic 104.3** — Control Mounting and Unmounting of Filesystems. Guided and explorational exercises.

---

## Guided Exercises

### 1. Mount ext4 as read-only

**Task:** mount ext4 on `/dev/sdc1` to `/mnt/external` read-only, with options `noatime` and `async`.

**Answer:**

```bash
mount -t ext4 -o noatime,async,ro /dev/sdc1 /mnt/external
```

---

### 2. target is busy

**Task:** unmounting `/dev/sdd2` returns `target is busy`. How to find which files are open?

**Answer:**

```bash
lsof /dev/sdd2
```

Output shows: process name, PID, user, and the open file. Close the program, then unmount.

---

### 3. noauto and mount -a

**Task:** `/etc/fstab` contains:

```
/dev/sdb1  /data  ext4  noatime,noauto,async
```

Will this filesystem be mounted by `mount -a`?

**Answer:** No. The `noauto` option tells `mount -a` to skip this entry.

---

### 4. Finding a filesystem's UUID

**Task:** how to find the UUID of the filesystem on `/dev/sdb1`?

**Answer:**

```bash
lsblk -f /dev/sdb1
# or
blkid /dev/sdb1
```

`lsblk -f` shows a table with type, label, UUID, free space and mount point. `blkid` gives compact output, convenient for scripts. Both are in the 104.3 objectives.

---

### 5. Remount as read-only

**Task:** exFAT with UUID `6e2c12e3-472d-4bac-a257-c49ac07f3761` is mounted at `/mnt/data`. How to remount it read-only?

**Answer:** when remounting, type and UUID are not needed — mount point alone is sufficient:

```bash
mount -o remount,ro /mnt/data
```

---

### 6. List ext3 and ntfs mounts

**Task:** how to list all mounted filesystems of type ext3 and ntfs?

**Answer:**

```bash
mount -t ext3,ntfs
```

---

## Explorational Exercises

### 1. nouser and mount /backup

**Given:** `/etc/fstab`:

```
/dev/sdc1  /backup  ext4  noatime,nouser,async
```

Can a regular user mount this filesystem with `mount /backup`?

**Answer:** No. The `nouser` option allows only root to mount this filesystem.

To allow regular users: use `user` (any user) or `group` (users in the device's group).

---

### 2. Unreachable network filesystem

**Task:** network filesystem at `/mnt/server` has become unreachable due to connection loss. How to force-unmount it, or fall back to read-only if that fails?

**Answer:**

```bash
umount -f -r /mnt/server
# short form
umount -fr /mnt/server
```

`-f` forces unmount; `-r` falls back to remounting read-only if unmounting fails.

---

### 3. fstab entry for btrfs Backup

**Task:** write an `/etc/fstab` line that mounts a btrfs volume with label `Backup` at `/mnt/backup` with default options but no binary execution.

**Answer:**

```
LABEL=Backup  /mnt/backup  btrfs  defaults,noexec  0  0
```

`defaults` includes `exec`. Adding `noexec` overrides it — the last matching option wins.

DUMP and PASS are `0 0`: skip `dump` backup, skip fsck on boot.

---

### 4. fstab equivalent of a mount unit

**Given:**

```ini
[Unit]
Description=External data disk

[Mount]
What=/dev/disk/by-uuid/56C11DCC5D2E1334
Where=/mnt/external
Type=ntfs
Options=defaults

[Install]
WantedBy=multi-user.target
```

What is the equivalent `/etc/fstab` line?

**Answer:**

```
UUID=56C11DCC5D2E1334  /mnt/external  ntfs  defaults  0  0
```

`What=/dev/disk/by-uuid/UUID` is a symlink path created by udev. In fstab, the same UUID is written as `UUID=`.

---

### 5. Unit file name and location

**Task:** what must the unit file from the previous exercise be named and where should it be placed?

**Answer:** `mnt-external.mount` in `/etc/systemd/system/`.

Naming rule: replace each `/` in the mount point path with `-`:

| Mount point | File name |
|---|---|
| `/mnt/external` | `mnt-external.mount` |
| `/var/log/db` | `var-log-db.mount` |
| `/` | `-.mount` |

The same rule applies to `.automount` files.
