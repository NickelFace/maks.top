---
title: "LVM"
description: "pvcreate, vgcreate, lvcreate, lvextend, snapshots — Logical Volume Manager"
icon: "🗄️"
tags: ["Linux", "LVM", "storage", "filesystem"]
date: 2026-04-14
---

<div class="intro-card">
LVM (Logical Volume Manager): flexible disk management with <strong>Physical Volumes → Volume Groups → Logical Volumes</strong>. Supports online resize, snapshots, and spanning multiple disks.
</div>

## LVM concepts

<div class="ref-panel">
<div class="ref-panel-head">Three-layer model</div>
<div class="ref-panel-body">
<table class="cheat-table">
<thead><tr><th>Layer</th><th>Command prefix</th><th>Description</th></tr></thead>
<tbody>
<tr><td class="mono">PV — Physical Volume</td><td class="desc">pv*</td><td class="desc">A disk or partition initialised for LVM. Building block.</td></tr>
<tr><td class="mono">VG — Volume Group</td><td class="desc">vg*</td><td class="desc">Named pool aggregating one or more PVs. Total storage.</td></tr>
<tr><td class="mono">LV — Logical Volume</td><td class="desc">lv*</td><td class="desc">Virtual partition carved from the VG. Formatted and mounted.</td></tr>
</tbody>
</table>
</div>
</div>

<div class="ref-panel">
<div class="ref-panel-head">Key LVM terms</div>
<div class="ref-panel-body">
<table class="cheat-table">
<thead><tr><th>Term</th><th>Description</th></tr></thead>
<tbody>
<tr><td class="mono">PE — Physical Extent</td><td class="desc">Smallest allocatable unit on a PV (default 4 MB)</td></tr>
<tr><td class="mono">LE — Logical Extent</td><td class="desc">Matching unit on an LV (maps to PEs)</td></tr>
<tr><td class="mono">Thin provisioning</td><td class="desc">Allocate LVs larger than physical space (over-commit)</td></tr>
<tr><td class="mono">CoW snapshot</td><td class="desc">Point-in-time copy — only changed blocks are stored</td></tr>
</tbody>
</table>
</div>
</div>

## Setup: PV → VG → LV

<div class="ref-panel">
<div class="ref-panel-head">Create and format</div>
<div class="ref-panel-body">
<table class="cheat-table">
<thead><tr><th>Command</th><th>Description</th></tr></thead>
<tbody>
<tr><td class="mono">pvcreate /dev/sdb /dev/sdc</td><td class="desc">Initialise disks as Physical Volumes</td></tr>
<tr><td class="mono">vgcreate data-vg /dev/sdb /dev/sdc</td><td class="desc">Create Volume Group spanning both PVs</td></tr>
<tr><td class="mono">lvcreate -L 50G -n web-lv data-vg</td><td class="desc">Create 50 GB Logical Volume</td></tr>
<tr><td class="mono">lvcreate -l 100%FREE -n data-lv data-vg</td><td class="desc">Use all free space in the VG</td></tr>
<tr><td class="mono">lvcreate -l 80%VG -n data-lv data-vg</td><td class="desc">Use 80% of total VG capacity</td></tr>
<tr><td class="mono">mkfs.ext4 /dev/data-vg/web-lv</td><td class="desc">Format with ext4</td></tr>
<tr><td class="mono">mkfs.xfs /dev/data-vg/web-lv</td><td class="desc">Format with XFS</td></tr>
<tr><td class="mono">mount /dev/data-vg/web-lv /var/www</td><td class="desc">Mount the Logical Volume</td></tr>
</tbody>
</table>
</div>
</div>

Typical fstab entry using device mapper path:
```
/dev/data-vg/web-lv  /var/www  ext4  defaults,noatime  0  2
```

## Inspecting LVM

<div class="ref-panel">
<div class="ref-panel-head">pv* / vg* / lv* display commands</div>
<div class="ref-panel-body">
<table class="cheat-table">
<thead><tr><th>Command</th><th>Description</th></tr></thead>
<tbody>
<tr><td class="mono">pvs</td><td class="desc">One-line summary of all PVs</td></tr>
<tr><td class="mono">pvdisplay /dev/sdb</td><td class="desc">Detailed PV info (PE size, total/free PEs)</td></tr>
<tr><td class="mono">pvscan</td><td class="desc">Scan for PVs on all block devices</td></tr>
<tr><td class="mono">vgs</td><td class="desc">One-line summary of all VGs</td></tr>
<tr><td class="mono">vgdisplay data-vg</td><td class="desc">Detailed VG info (free space, PE count)</td></tr>
<tr><td class="mono">lvs</td><td class="desc">One-line summary of all LVs</td></tr>
<tr><td class="mono">lvdisplay /dev/data-vg/web-lv</td><td class="desc">Detailed LV info (size, path, type)</td></tr>
<tr><td class="mono">lsblk</td><td class="desc">Block device tree — shows LVM hierarchy</td></tr>
<tr><td class="mono">dmsetup ls</td><td class="desc">Device mapper mappings (underlying LVM)</td></tr>
</tbody>
</table>
</div>
</div>

## Extending & resizing

<div class="ref-panel">
<div class="ref-panel-head">Grow LV and filesystem</div>
<div class="ref-panel-body">
<table class="cheat-table">
<thead><tr><th>Command</th><th>Description</th></tr></thead>
<tbody>
<tr><td class="mono">vgextend data-vg /dev/sdd</td><td class="desc">Add a new disk to the Volume Group</td></tr>
<tr><td class="mono">lvextend -L +20G /dev/data-vg/web-lv</td><td class="desc">Grow LV by 20 GB</td></tr>
<tr><td class="mono">lvextend -L 100G /dev/data-vg/web-lv</td><td class="desc">Set LV to exactly 100 GB</td></tr>
<tr><td class="mono">lvextend -l +100%FREE /dev/data-vg/web-lv</td><td class="desc">Use all remaining free space in VG</td></tr>
<tr><td class="mono">lvextend -r -L +20G /dev/data-vg/web-lv</td><td class="desc">Extend LV and resize filesystem in one step (-r flag)</td></tr>
<tr><td class="mono">resize2fs /dev/data-vg/web-lv</td><td class="desc">Resize ext4 to fill LV (online, no unmount needed)</td></tr>
<tr><td class="mono">xfs_growfs /var/www</td><td class="desc">Resize XFS to fill LV (must be mounted, use mount point)</td></tr>
<tr><td class="mono">btrfs filesystem resize max /mnt</td><td class="desc">Resize Btrfs to fill LV (online)</td></tr>
</tbody>
</table>
</div>
</div>

<div class="ref-panel">
<div class="ref-panel-head">Shrink LV (ext4 only — XFS cannot shrink)</div>
<div class="ref-panel-body">
<table class="cheat-table">
<thead><tr><th>Command</th><th>Description</th></tr></thead>
<tbody>
<tr><td class="mono">umount /var/www</td><td class="desc">Step 1: unmount</td></tr>
<tr><td class="mono">e2fsck -f /dev/data-vg/web-lv</td><td class="desc">Step 2: force check</td></tr>
<tr><td class="mono">resize2fs /dev/data-vg/web-lv 30G</td><td class="desc">Step 3: shrink filesystem to 30 GB</td></tr>
<tr><td class="mono">lvreduce -L 30G /dev/data-vg/web-lv</td><td class="desc">Step 4: shrink LV to match</td></tr>
<tr><td class="mono">mount /dev/data-vg/web-lv /var/www</td><td class="desc">Step 5: remount</td></tr>
</tbody>
</table>
</div>
</div>

Shrink order matters: **always shrink filesystem first, then LV**. Doing it in reverse destroys the filesystem.

## Snapshots

<div class="ref-panel">
<div class="ref-panel-head">LVM snapshots</div>
<div class="ref-panel-body">
<table class="cheat-table">
<thead><tr><th>Command</th><th>Description</th></tr></thead>
<tbody>
<tr><td class="mono">lvcreate -s -n snap-lv -L 5G /dev/data-vg/web-lv</td><td class="desc">Create snapshot (5 GB CoW buffer)</td></tr>
<tr><td class="mono">mount -o ro /dev/data-vg/snap-lv /mnt/snap</td><td class="desc">Mount snapshot read-only for backup</td></tr>
<tr><td class="mono">lvs -a</td><td class="desc">List all LVs including snapshots (snap% shows usage)</td></tr>
<tr><td class="mono">lvconvert --merge /dev/data-vg/snap-lv</td><td class="desc">Rollback origin to snapshot state</td></tr>
<tr><td class="mono">lvremove /dev/data-vg/snap-lv</td><td class="desc">Delete snapshot without rolling back</td></tr>
</tbody>
</table>
</div>
</div>

Snapshot fills up when CoW buffer is exhausted → it becomes invalid. Allocate at least 10–20% of original volume size, or use thin provisioned snapshots for better flexibility.

## Moving & removing

<div class="ref-panel">
<div class="ref-panel-head">Move, rename, remove</div>
<div class="ref-panel-body">
<table class="cheat-table">
<thead><tr><th>Command</th><th>Description</th></tr></thead>
<tbody>
<tr><td class="mono">pvmove /dev/sdb</td><td class="desc">Migrate data from /dev/sdb to other PVs (online)</td></tr>
<tr><td class="mono">pvmove /dev/sdb /dev/sdd</td><td class="desc">Migrate to specific target PV</td></tr>
<tr><td class="mono">vgreduce data-vg /dev/sdb</td><td class="desc">Remove PV from VG (after pvmove)</td></tr>
<tr><td class="mono">lvrename data-vg web-lv app-lv</td><td class="desc">Rename a Logical Volume</td></tr>
<tr><td class="mono">vgrename data-vg prod-vg</td><td class="desc">Rename a Volume Group</td></tr>
<tr><td class="mono">lvremove /dev/data-vg/web-lv</td><td class="desc">Delete LV (unmount first)</td></tr>
<tr><td class="mono">vgremove data-vg</td><td class="desc">Delete VG (all LVs must be removed first)</td></tr>
<tr><td class="mono">pvremove /dev/sdb</td><td class="desc">Remove PV label (must be removed from VG first)</td></tr>
</tbody>
</table>
</div>
</div>
