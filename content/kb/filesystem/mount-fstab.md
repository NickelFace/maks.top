---
title: "mount / umount / fstab"
description: "Mounting filesystems, fstab entries, bind mounts, loop mounts"
icon: "🗂️"
tags: ["Linux", "mount", "fstab", "filesystem"]
date: 2026-04-14
---

<div class="intro-card">
Linux filesystem mounting: <strong>mount/umount</strong> commands, <strong>/etc/fstab</strong> persistent mounts, bind mounts, loop devices, and common mount options.
</div>

## mount & umount

<div class="ref-panel">
<div class="ref-panel-head">Basic mount commands</div>
<div class="ref-panel-body">
<table class="cheat-table">
<thead><tr><th>Command</th><th>Description</th></tr></thead>
<tbody>
<tr><td class="mono">mount</td><td class="desc">List all currently mounted filesystems</td></tr>
<tr><td class="mono">mount -t ext4 /dev/sdb1 /mnt/data</td><td class="desc">Mount with explicit type</td></tr>
<tr><td class="mono">mount /dev/sdb1 /mnt/data</td><td class="desc">Mount (type auto-detected from superblock)</td></tr>
<tr><td class="mono">mount UUID=abc123 /mnt/data</td><td class="desc">Mount by UUID</td></tr>
<tr><td class="mono">mount LABEL=data /mnt/data</td><td class="desc">Mount by filesystem label</td></tr>
<tr><td class="mono">mount -o ro /dev/sdb1 /mnt/data</td><td class="desc">Mount read-only</td></tr>
<tr><td class="mono">mount -o remount,rw /mnt/data</td><td class="desc">Remount without unmounting (change options)</td></tr>
<tr><td class="mono">mount -a</td><td class="desc">Mount all fstab entries not yet mounted</td></tr>
<tr><td class="mono">umount /mnt/data</td><td class="desc">Unmount by mount point</td></tr>
<tr><td class="mono">umount /dev/sdb1</td><td class="desc">Unmount by device</td></tr>
<tr><td class="mono">umount -l /mnt/data</td><td class="desc">Lazy unmount (detach immediately, wait for last process)</td></tr>
<tr><td class="mono">umount -f /mnt/nfs</td><td class="desc">Force unmount (NFS gone stale)</td></tr>
</tbody>
</table>
</div>
</div>

<div class="ref-panel">
<div class="ref-panel-head">Special mounts</div>
<div class="ref-panel-body">
<table class="cheat-table">
<thead><tr><th>Command</th><th>Description</th></tr></thead>
<tbody>
<tr><td class="mono">mount -o loop image.iso /mnt/iso</td><td class="desc">Mount an ISO image as a filesystem</td></tr>
<tr><td class="mono">mount --bind /src /dst</td><td class="desc">Bind mount — expose a directory at another path</td></tr>
<tr><td class="mono">mount --rbind /src /dst</td><td class="desc">Recursive bind (includes sub-mounts)</td></tr>
<tr><td class="mono">mount --make-private /mnt</td><td class="desc">Prevent mount propagation (namespaces)</td></tr>
<tr><td class="mono">mount -t tmpfs -o size=512m tmpfs /mnt/ram</td><td class="desc">In-memory tmpfs mount</td></tr>
<tr><td class="mono">mount -t nfs 10.0.0.1:/exports /mnt/nfs</td><td class="desc">NFS mount</td></tr>
</tbody>
</table>
</div>
</div>

<div class="ref-panel">
<div class="ref-panel-head">Inspect mounts</div>
<div class="ref-panel-body">
<table class="cheat-table">
<thead><tr><th>Command</th><th>Description</th></tr></thead>
<tbody>
<tr><td class="mono">findmnt</td><td class="desc">Tree view of all active mounts</td></tr>
<tr><td class="mono">findmnt -t ext4</td><td class="desc">Filter by filesystem type</td></tr>
<tr><td class="mono">findmnt /mnt/data</td><td class="desc">Info about a specific mount point</td></tr>
<tr><td class="mono">findmnt --verify</td><td class="desc">Verify all fstab entries</td></tr>
<tr><td class="mono">cat /proc/mounts</td><td class="desc">Kernel view of current mounts</td></tr>
<tr><td class="mono">lsof +D /mnt/data</td><td class="desc">Find what process is keeping a mount busy</td></tr>
<tr><td class="mono">fuser -mv /mnt/data</td><td class="desc">Show all processes using the mount point</td></tr>
<tr><td class="mono">blkid</td><td class="desc">UUIDs and filesystem types of block devices</td></tr>
</tbody>
</table>
</div>
</div>

## /etc/fstab

<div class="ref-panel">
<div class="ref-panel-head">fstab fields</div>
<div class="ref-panel-body">
<table class="cheat-table">
<thead><tr><th>Field</th><th>Example</th><th>Description</th></tr></thead>
<tbody>
<tr><td class="mono">device</td><td class="desc">UUID=abc-123 or /dev/sdb1</td><td class="desc">Source — UUID is preferred (stable across reboots)</td></tr>
<tr><td class="mono">mount point</td><td class="desc">/mnt/data</td><td class="desc">Target directory</td></tr>
<tr><td class="mono">type</td><td class="desc">ext4 / xfs / btrfs / nfs / auto</td><td class="desc">Filesystem type</td></tr>
<tr><td class="mono">options</td><td class="desc">defaults,noatime,nofail</td><td class="desc">Comma-separated mount options</td></tr>
<tr><td class="mono">dump</td><td class="desc">0 or 1</td><td class="desc">Include in dump backup — almost always 0</td></tr>
<tr><td class="mono">pass</td><td class="desc">0, 1, 2</td><td class="desc">fsck order: 0 = skip, 1 = root, 2 = all others</td></tr>
</tbody>
</table>
</div>
</div>

<div class="ref-panel">
<div class="ref-panel-head">Mount options</div>
<div class="ref-panel-body">
<table class="cheat-table">
<thead><tr><th>Option</th><th>Description</th></tr></thead>
<tbody>
<tr><td class="mono">defaults</td><td class="desc">rw, suid, dev, exec, auto, nouser, async</td></tr>
<tr><td class="mono">noatime</td><td class="desc">Don't update access time on reads (major I/O reduction)</td></tr>
<tr><td class="mono">relatime</td><td class="desc">Update atime only if older than mtime (kernel default)</td></tr>
<tr><td class="mono">noexec</td><td class="desc">Disallow executing binaries on this filesystem</td></tr>
<tr><td class="mono">nosuid</td><td class="desc">Ignore SUID/SGID bits</td></tr>
<tr><td class="mono">nodev</td><td class="desc">Ignore device files</td></tr>
<tr><td class="mono">nofail</td><td class="desc">Don't fail boot if device is missing</td></tr>
<tr><td class="mono">ro</td><td class="desc">Mount read-only</td></tr>
<tr><td class="mono">rw</td><td class="desc">Mount read-write (default)</td></tr>
<tr><td class="mono">user</td><td class="desc">Allow regular user to mount (implies noexec,nosuid,nodev)</td></tr>
<tr><td class="mono">users</td><td class="desc">Any user can mount AND unmount</td></tr>
<tr><td class="mono">discard</td><td class="desc">Enable TRIM for SSDs</td></tr>
<tr><td class="mono">compress=zstd</td><td class="desc">Btrfs transparent compression</td></tr>
<tr><td class="mono">_netdev</td><td class="desc">Wait for network before mounting (NFS, CIFS)</td></tr>
<tr><td class="mono">x-systemd.automount</td><td class="desc">Automount via systemd on first access</td></tr>
</tbody>
</table>
</div>
</div>

**Example fstab entries:**
```
# Standard data disk (UUID recommended over /dev/sdX)
UUID=1234-abcd  /mnt/data  ext4  defaults,noatime,nofail  0  2

# SSD with TRIM
UUID=5678-efgh  /home      ext4  defaults,noatime,discard  0  2

# XFS — growfs works while mounted
UUID=9abc-1234  /var/data  xfs   defaults,noatime          0  2

# NFS share — wait for network, don't block boot
10.0.0.1:/exports  /mnt/nfs  nfs  defaults,_netdev,nofail  0  0

# tmpfs RAM disk
tmpfs  /tmp  tmpfs  size=2g,mode=1777  0  0

# ISO bind mount
/data/image.iso  /mnt/iso  iso9660  loop,ro  0  0
```

After editing fstab: `mount -a` to apply changes and check for errors before rebooting.
