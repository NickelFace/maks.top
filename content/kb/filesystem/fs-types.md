---
title: "Filesystem Types"
description: "ext4, XFS, Btrfs, ZFS — differences, advantages, and use cases"
icon: "🗃️"
tags: ["Linux", "ext4", "XFS", "Btrfs", "ZFS", "filesystem"]
date: 2026-04-14
---

<div class="intro-card">
Linux filesystem comparison: <strong>ext4</strong> (universal default), <strong>XFS</strong> (high throughput), <strong>Btrfs</strong> (snapshots + compression), <strong>ZFS</strong> (enterprise reliability). Formatting, tuning, and repair commands.
</div>

## ext4

<div class="ref-panel">
<div class="ref-panel-head">ext4 — Extended Filesystem 4</div>
<div class="ref-panel-body">
<table class="cheat-table">
<thead><tr><th>Property</th><th>Value</th></tr></thead>
<tbody>
<tr><td class="mono">Max file size</td><td class="desc">16 TB</td></tr>
<tr><td class="mono">Max volume size</td><td class="desc">1 EB</td></tr>
<tr><td class="mono">Journaling</td><td class="desc">Yes — data, ordered (default), writeback modes</td></tr>
<tr><td class="mono">Snapshots</td><td class="desc">No — use LVM snapshots externally</td></tr>
<tr><td class="mono">Online shrink</td><td class="desc">No — must unmount to shrink</td></tr>
<tr><td class="mono">Online grow</td><td class="desc">Yes (resize2fs while mounted)</td></tr>
<tr><td class="mono">Default on</td><td class="desc">Debian, Ubuntu, and most general-purpose distros</td></tr>
<tr><td class="mono">Best for</td><td class="desc">General purpose, VMs, boot partitions, broad compatibility</td></tr>
</tbody>
</table>
</div>
</div>

<div class="ref-panel">
<div class="ref-panel-head">ext4 commands</div>
<div class="ref-panel-body">
<table class="cheat-table">
<thead><tr><th>Command</th><th>Description</th></tr></thead>
<tbody>
<tr><td class="mono">mkfs.ext4 /dev/sdb1</td><td class="desc">Format with ext4</td></tr>
<tr><td class="mono">mkfs.ext4 -L mydata /dev/sdb1</td><td class="desc">Format with label</td></tr>
<tr><td class="mono">mkfs.ext4 -b 4096 -j /dev/sdb1</td><td class="desc">Specify block size (4096 = default)</td></tr>
<tr><td class="mono">tune2fs -l /dev/sdb1</td><td class="desc">Show superblock (UUID, features, mount count)</td></tr>
<tr><td class="mono">tune2fs -L newlabel /dev/sdb1</td><td class="desc">Set filesystem label</td></tr>
<tr><td class="mono">tune2fs -c 30 /dev/sdb1</td><td class="desc">Force fsck every 30 mounts</td></tr>
<tr><td class="mono">tune2fs -i 6m /dev/sdb1</td><td class="desc">Force fsck every 6 months</td></tr>
<tr><td class="mono">tune2fs -e remount-ro /dev/sdb1</td><td class="desc">Remount read-only on error (safe default)</td></tr>
<tr><td class="mono">e2fsck -f /dev/sdb1</td><td class="desc">Force check (must be unmounted)</td></tr>
<tr><td class="mono">e2fsck -p /dev/sdb1</td><td class="desc">Auto-repair without interactive prompts</td></tr>
<tr><td class="mono">resize2fs /dev/data-vg/lv</td><td class="desc">Grow to fill LV (online)</td></tr>
<tr><td class="mono">resize2fs /dev/sdb1 30G</td><td class="desc">Shrink to 30 GB (unmounted)</td></tr>
<tr><td class="mono">dumpe2fs /dev/sdb1</td><td class="desc">Full superblock + group descriptor dump</td></tr>
<tr><td class="mono">debugfs /dev/sdb1</td><td class="desc">Interactive ext2/3/4 debugger (recover deleted files)</td></tr>
</tbody>
</table>
</div>
</div>

## XFS

<div class="ref-panel">
<div class="ref-panel-head">XFS properties</div>
<div class="ref-panel-body">
<table class="cheat-table">
<thead><tr><th>Property</th><th>Value</th></tr></thead>
<tbody>
<tr><td class="mono">Max file size</td><td class="desc">8 EB</td></tr>
<tr><td class="mono">Max volume size</td><td class="desc">8 EB</td></tr>
<tr><td class="mono">Journaling</td><td class="desc">Yes — metadata only by default (fast)</td></tr>
<tr><td class="mono">Online shrink</td><td class="desc">No — cannot shrink XFS</td></tr>
<tr><td class="mono">Online grow</td><td class="desc">Yes (xfs_growfs while mounted)</td></tr>
<tr><td class="mono">Delayed allocation</td><td class="desc">Yes — batches writes for efficiency</td></tr>
<tr><td class="mono">Default on</td><td class="desc">RHEL, CentOS, AlmaLinux, Rocky Linux</td></tr>
<tr><td class="mono">Best for</td><td class="desc">Large files, databases, high-throughput I/O, media storage</td></tr>
</tbody>
</table>
</div>
</div>

<div class="ref-panel">
<div class="ref-panel-head">XFS commands</div>
<div class="ref-panel-body">
<table class="cheat-table">
<thead><tr><th>Command</th><th>Description</th></tr></thead>
<tbody>
<tr><td class="mono">mkfs.xfs /dev/sdb1</td><td class="desc">Format with XFS</td></tr>
<tr><td class="mono">mkfs.xfs -L mydata /dev/sdb1</td><td class="desc">Format with label</td></tr>
<tr><td class="mono">mkfs.xfs -f /dev/sdb1</td><td class="desc">Force overwrite existing filesystem</td></tr>
<tr><td class="mono">xfs_info /mount/point</td><td class="desc">Filesystem info (block size, allocation groups)</td></tr>
<tr><td class="mono">xfs_growfs /mount/point</td><td class="desc">Grow to fill block device (must be mounted)</td></tr>
<tr><td class="mono">xfs_repair /dev/sdb1</td><td class="desc">Repair XFS filesystem (must be unmounted)</td></tr>
<tr><td class="mono">xfs_repair -n /dev/sdb1</td><td class="desc">Dry-run check, no changes</td></tr>
<tr><td class="mono">xfs_check /dev/sdb1</td><td class="desc">Check consistency (older, xfs_repair preferred)</td></tr>
<tr><td class="mono">xfs_fsr /mount/point</td><td class="desc">Defragment XFS (online)</td></tr>
<tr><td class="mono">xfs_db -r /dev/sdb1</td><td class="desc">Interactive debugger (read-only)</td></tr>
<tr><td class="mono">xfs_admin -l /dev/sdb1</td><td class="desc">Show label</td></tr>
<tr><td class="mono">xfs_admin -L newlabel /dev/sdb1</td><td class="desc">Set label (unmounted)</td></tr>
<tr><td class="mono">xfs_quota -x -c 'report -h' /mount</td><td class="desc">Show quota report</td></tr>
</tbody>
</table>
</div>
</div>

## Btrfs

<div class="ref-panel">
<div class="ref-panel-head">Btrfs — B-tree Filesystem properties</div>
<div class="ref-panel-body">
<table class="cheat-table">
<thead><tr><th>Property</th><th>Value</th></tr></thead>
<tbody>
<tr><td class="mono">Max file size</td><td class="desc">16 EB</td></tr>
<tr><td class="mono">Max volume size</td><td class="desc">16 EB</td></tr>
<tr><td class="mono">Snapshots</td><td class="desc">Yes — native, instant, space-efficient (Copy-on-Write)</td></tr>
<tr><td class="mono">Built-in RAID</td><td class="desc">RAID 0, 1, 10, 5, 6 (RAID 5/6 still experimental)</td></tr>
<tr><td class="mono">Compression</td><td class="desc">zlib, lzo, zstd — transparent, per-file or per-mount</td></tr>
<tr><td class="mono">Checksums</td><td class="desc">CRC32C per block — detects silent data corruption</td></tr>
<tr><td class="mono">Online shrink</td><td class="desc">Yes</td></tr>
<tr><td class="mono">Subvolumes</td><td class="desc">Independent filesystem trees within the same volume</td></tr>
<tr><td class="mono">Default on</td><td class="desc">openSUSE, Fedora (since F33), SteamOS</td></tr>
<tr><td class="mono">Best for</td><td class="desc">Desktop Linux, NAS, systems needing snapshots and compression</td></tr>
</tbody>
</table>
</div>
</div>

<div class="ref-panel">
<div class="ref-panel-head">Btrfs commands</div>
<div class="ref-panel-body">
<table class="cheat-table">
<thead><tr><th>Command</th><th>Description</th></tr></thead>
<tbody>
<tr><td class="mono">mkfs.btrfs /dev/sdb1</td><td class="desc">Format with Btrfs</td></tr>
<tr><td class="mono">mkfs.btrfs -L mydata /dev/sdb1</td><td class="desc">Format with label</td></tr>
<tr><td class="mono">mkfs.btrfs -d raid1 -m raid1 /dev/sdb /dev/sdc</td><td class="desc">RAID 1 across two drives</td></tr>
<tr><td class="mono">btrfs filesystem show /mount</td><td class="desc">Filesystem info</td></tr>
<tr><td class="mono">btrfs filesystem df /mount</td><td class="desc">Space usage by type (data, metadata)</td></tr>
<tr><td class="mono">btrfs filesystem resize max /mount</td><td class="desc">Grow to fill block device (online)</td></tr>
<tr><td class="mono">btrfs filesystem resize -10G /mount</td><td class="desc">Shrink by 10 GB (online)</td></tr>
<tr><td class="mono">btrfs subvolume create /mount/vol</td><td class="desc">Create a subvolume</td></tr>
<tr><td class="mono">btrfs subvolume list /mount</td><td class="desc">List all subvolumes</td></tr>
<tr><td class="mono">btrfs subvolume snapshot /mount/vol /mount/vol_snap</td><td class="desc">Create read-write snapshot</td></tr>
<tr><td class="mono">btrfs subvolume snapshot -r /mount/vol /mount/vol_snap</td><td class="desc">Create read-only snapshot</td></tr>
<tr><td class="mono">btrfs subvolume delete /mount/vol_snap</td><td class="desc">Delete snapshot</td></tr>
<tr><td class="mono">btrfs scrub start /mount</td><td class="desc">Verify all block checksums (background)</td></tr>
<tr><td class="mono">btrfs scrub status /mount</td><td class="desc">Check scrub progress</td></tr>
<tr><td class="mono">btrfs balance start /mount</td><td class="desc">Rebalance data across drives</td></tr>
<tr><td class="mono">btrfs check /dev/sdb1</td><td class="desc">Check consistency (unmounted)</td></tr>
</tbody>
</table>
</div>
</div>

Enable compression in fstab: `compress=zstd` or `compress=zstd:3` (level 1–22). Per-file: `chattr +c file` or `btrfs property set file compression zstd`.

## ZFS (OpenZFS)

<div class="ref-panel">
<div class="ref-panel-head">ZFS properties</div>
<div class="ref-panel-body">
<table class="cheat-table">
<thead><tr><th>Property</th><th>Value</th></tr></thead>
<tbody>
<tr><td class="mono">Snapshots</td><td class="desc">Instant, space-efficient, unlimited</td></tr>
<tr><td class="mono">RAIDZ</td><td class="desc">RAIDZ1 (RAID 5 equiv), RAIDZ2 (RAID 6), RAIDZ3</td></tr>
<tr><td class="mono">Compression</td><td class="desc">lz4 (default), gzip, zstd — per dataset</td></tr>
<tr><td class="mono">Deduplication</td><td class="desc">Yes — RAM-intensive (DDT table)</td></tr>
<tr><td class="mono">Checksums</td><td class="desc">End-to-end, SHA256/Blake3 — self-healing</td></tr>
<tr><td class="mono">ARC cache</td><td class="desc">Adaptive Replacement Cache — in RAM</td></tr>
<tr><td class="mono">Default on</td><td class="desc">FreeBSD, TrueNAS, Proxmox (optional)</td></tr>
<tr><td class="mono">Best for</td><td class="desc">NAS, mission-critical data, storage servers</td></tr>
<tr><td class="mono">RAM minimum</td><td class="desc">1 GB per 1 TB storage (ARC sizing rule of thumb)</td></tr>
</tbody>
</table>
</div>
</div>

<div class="ref-panel">
<div class="ref-panel-head">ZFS commands</div>
<div class="ref-panel-body">
<table class="cheat-table">
<thead><tr><th>Command</th><th>Description</th></tr></thead>
<tbody>
<tr><td class="mono">apt install zfsutils-linux</td><td class="desc">Install ZFS on Ubuntu/Debian</td></tr>
<tr><td class="mono">zpool create mypool /dev/sdb /dev/sdc</td><td class="desc">Create striped pool (RAID 0)</td></tr>
<tr><td class="mono">zpool create mypool mirror /dev/sdb /dev/sdc</td><td class="desc">Mirror pool (RAID 1)</td></tr>
<tr><td class="mono">zpool create mypool raidz /dev/sdb /dev/sdc /dev/sdd</td><td class="desc">RAIDZ1 pool (min 3 drives)</td></tr>
<tr><td class="mono">zpool status</td><td class="desc">Pool health, degraded drives</td></tr>
<tr><td class="mono">zpool status -v</td><td class="desc">Verbose — shows error counts</td></tr>
<tr><td class="mono">zpool list</td><td class="desc">Pool size and usage</td></tr>
<tr><td class="mono">zpool scrub mypool</td><td class="desc">Verify all checksums (runs in background)</td></tr>
<tr><td class="mono">zfs list</td><td class="desc">All datasets and their sizes</td></tr>
<tr><td class="mono">zfs create mypool/data</td><td class="desc">Create a dataset</td></tr>
<tr><td class="mono">zfs set compression=lz4 mypool/data</td><td class="desc">Enable compression on dataset</td></tr>
<tr><td class="mono">zfs set quota=100G mypool/data</td><td class="desc">Set quota on dataset</td></tr>
<tr><td class="mono">zfs snapshot mypool/data@snap1</td><td class="desc">Create a snapshot</td></tr>
<tr><td class="mono">zfs list -t snapshot</td><td class="desc">List all snapshots</td></tr>
<tr><td class="mono">zfs rollback mypool/data@snap1</td><td class="desc">Roll dataset back to snapshot</td></tr>
<tr><td class="mono">zfs clone mypool/data@snap1 mypool/clone</td><td class="desc">Writable clone from snapshot</td></tr>
<tr><td class="mono">zfs send mypool/data@snap1 | ssh host zfs receive pool/data</td><td class="desc">Replicate dataset to remote host</td></tr>
<tr><td class="mono">zfs destroy mypool/data@snap1</td><td class="desc">Delete a snapshot</td></tr>
</tbody>
</table>
</div>
</div>

## Comparison

<div class="ref-panel">
<div class="ref-panel-head">Feature matrix</div>
<div class="ref-panel-body">
<table class="cheat-table">
<thead><tr><th>Feature</th><th>ext4</th><th>XFS</th><th>Btrfs</th><th>ZFS</th></tr></thead>
<tbody>
<tr><td class="mono">Snapshots</td><td class="desc">No</td><td class="desc">No</td><td class="desc">Yes (CoW)</td><td class="desc">Yes (CoW)</td></tr>
<tr><td class="mono">Built-in RAID</td><td class="desc">No</td><td class="desc">No</td><td class="desc">Yes</td><td class="desc">Yes (RAIDZ)</td></tr>
<tr><td class="mono">Compression</td><td class="desc">No</td><td class="desc">No</td><td class="desc">Yes</td><td class="desc">Yes</td></tr>
<tr><td class="mono">Checksums</td><td class="desc">No</td><td class="desc">No</td><td class="desc">Yes</td><td class="desc">Yes (e2e)</td></tr>
<tr><td class="mono">Deduplication</td><td class="desc">No</td><td class="desc">No</td><td class="desc">Limited</td><td class="desc">Yes</td></tr>
<tr><td class="mono">Online shrink</td><td class="desc">No</td><td class="desc">No</td><td class="desc">Yes</td><td class="desc">No</td></tr>
<tr><td class="mono">Online grow</td><td class="desc">Yes</td><td class="desc">Yes</td><td class="desc">Yes</td><td class="desc">Yes</td></tr>
<tr><td class="mono">Subvolumes</td><td class="desc">No</td><td class="desc">No</td><td class="desc">Yes</td><td class="desc">Yes (datasets)</td></tr>
<tr><td class="mono">Maturity / stability</td><td class="desc">★★★★★</td><td class="desc">★★★★★</td><td class="desc">★★★★☆</td><td class="desc">★★★★★</td></tr>
<tr><td class="mono">RAM overhead</td><td class="desc">Very low</td><td class="desc">Very low</td><td class="desc">Low</td><td class="desc">High (ARC)</td></tr>
<tr><td class="mono">Linux kernel</td><td class="desc">Mainline</td><td class="desc">Mainline</td><td class="desc">Mainline</td><td class="desc">DKMS module</td></tr>
<tr><td class="mono">Default distro</td><td class="desc">Ubuntu/Debian</td><td class="desc">RHEL/Fedora</td><td class="desc">openSUSE/Fedora</td><td class="desc">FreeBSD/TrueNAS</td></tr>
</tbody>
</table>
</div>
</div>

<div class="ref-panel">
<div class="ref-panel-head">When to choose</div>
<div class="ref-panel-body">
<table class="cheat-table">
<thead><tr><th>Use case</th><th>Recommended FS</th><th>Reason</th></tr></thead>
<tbody>
<tr><td class="mono">Boot partition</td><td class="desc">ext4</td><td class="desc">Maximum compatibility with bootloaders</td></tr>
<tr><td class="mono">General server</td><td class="desc">ext4 or XFS</td><td class="desc">Proven, simple, no surprises</td></tr>
<tr><td class="mono">Database (MySQL, Postgres)</td><td class="desc">XFS or ext4</td><td class="desc">Consistent write performance, no CoW overhead</td></tr>
<tr><td class="mono">Large files (video, backups)</td><td class="desc">XFS</td><td class="desc">Excellent at sequential I/O and large extents</td></tr>
<tr><td class="mono">Desktop with snapshots</td><td class="desc">Btrfs</td><td class="desc">Native snapshots before upgrades, compression</td></tr>
<tr><td class="mono">NAS with data integrity</td><td class="desc">ZFS</td><td class="desc">End-to-end checksums, self-healing, RAIDZ</td></tr>
<tr><td class="mono">Container host</td><td class="desc">Btrfs or ZFS</td><td class="desc">Efficient layer snapshots (Docker, LXC)</td></tr>
<tr><td class="mono">Limited RAM server</td><td class="desc">ext4 or XFS</td><td class="desc">ZFS/Btrfs need more RAM for metadata</td></tr>
</tbody>
</table>
</div>
</div>

## Common utilities

<div class="ref-panel">
<div class="ref-panel-head">Universal filesystem tools</div>
<div class="ref-panel-body">
<table class="cheat-table">
<thead><tr><th>Command</th><th>Description</th></tr></thead>
<tbody>
<tr><td class="mono">blkid</td><td class="desc">Show UUID, type, and label of all block devices</td></tr>
<tr><td class="mono">lsblk -f</td><td class="desc">Block device tree with filesystem info</td></tr>
<tr><td class="mono">file -s /dev/sdb1</td><td class="desc">Detect filesystem type on a raw device</td></tr>
<tr><td class="mono">fsck /dev/sdb1</td><td class="desc">Check and repair filesystem (generic wrapper)</td></tr>
<tr><td class="mono">fdisk -l</td><td class="desc">Partition table and sizes</td></tr>
<tr><td class="mono">parted /dev/sdb print</td><td class="desc">Partition info (GPT-aware)</td></tr>
<tr><td class="mono">lsblk -o NAME,SIZE,FSTYPE,MOUNTPOINT,UUID</td><td class="desc">Custom lsblk columns</td></tr>
</tbody>
</table>
</div>
</div>
