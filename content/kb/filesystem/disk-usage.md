---
title: "du / df / lsof"
description: "Disk usage analysis and open file inspection"
icon: "📊"
tags: ["Linux", "du", "df", "lsof", "filesystem"]
date: 2026-04-14
---

<div class="intro-card">
Disk usage and open file tools: <strong>df</strong> (filesystem usage), <strong>du</strong> (directory sizes), <strong>lsof</strong> (open files, network connections, deleted-but-held files).
</div>

## df — filesystem usage

<div class="ref-panel">
<div class="ref-panel-head">df commands</div>
<div class="ref-panel-body">
<table class="cheat-table">
<thead><tr><th>Command</th><th>Description</th></tr></thead>
<tbody>
<tr><td class="mono">df -h</td><td class="desc">Human-readable sizes (GiB, MiB)</td></tr>
<tr><td class="mono">df -H</td><td class="desc">SI units (powers of 1000)</td></tr>
<tr><td class="mono">df -hT</td><td class="desc">Include filesystem type column</td></tr>
<tr><td class="mono">df -i</td><td class="desc">Inode usage instead of blocks</td></tr>
<tr><td class="mono">df /home</td><td class="desc">Usage for a specific mount point</td></tr>
<tr><td class="mono">df -x tmpfs -x devtmpfs</td><td class="desc">Exclude virtual filesystems</td></tr>
<tr><td class="mono">df -l</td><td class="desc">Local filesystems only (skip NFS)</td></tr>
<tr><td class="mono">df --output=source,fstype,size,used,avail,pcent,target</td><td class="desc">Custom columns</td></tr>
</tbody>
</table>
</div>
</div>

A full disk (100% Use%) with many inodes but 0 inode usage left will also block writes. Check both: `df -h` and `df -i`.

## du — directory sizes

<div class="ref-panel">
<div class="ref-panel-head">du commands</div>
<div class="ref-panel-body">
<table class="cheat-table">
<thead><tr><th>Command</th><th>Description</th></tr></thead>
<tbody>
<tr><td class="mono">du -sh /var/log</td><td class="desc">Total size of a directory</td></tr>
<tr><td class="mono">du -sh *</td><td class="desc">Size of each item in current directory</td></tr>
<tr><td class="mono">du -h --max-depth=1 /var</td><td class="desc">One level deep, human-readable</td></tr>
<tr><td class="mono">du -sh * | sort -rh | head -20</td><td class="desc">Top 20 largest items</td></tr>
<tr><td class="mono">du -sh /home/* | sort -rh</td><td class="desc">Home directories by size</td></tr>
<tr><td class="mono">du -ah / 2>/dev/null | sort -rh | head -30</td><td class="desc">Top 30 largest files/dirs system-wide</td></tr>
<tr><td class="mono">du --exclude="*.mp4" -sh /home</td><td class="desc">Exclude a pattern from count</td></tr>
<tr><td class="mono">du -sh /proc /sys /dev</td><td class="desc">Virtual filesystem sizes (near 0)</td></tr>
<tr><td class="mono">du -sk * | sort -rn | head -10</td><td class="desc">Top 10 by size in KB (numeric sort)</td></tr>
</tbody>
</table>
</div>
</div>

`-s` = summary (one line per argument) · `-h` = human-readable · `-a` = all files, not just directories · `--max-depth=N` limits recursion.

## lsof — open files

<div class="ref-panel">
<div class="ref-panel-head">Files & processes</div>
<div class="ref-panel-body">
<table class="cheat-table">
<thead><tr><th>Command</th><th>Description</th></tr></thead>
<tbody>
<tr><td class="mono">lsof /var/log/syslog</td><td class="desc">Which processes have this file open</td></tr>
<tr><td class="mono">lsof -u alice</td><td class="desc">All files opened by user alice</td></tr>
<tr><td class="mono">lsof -p 1234</td><td class="desc">All files opened by PID 1234</td></tr>
<tr><td class="mono">lsof -c nginx</td><td class="desc">Files opened by processes named nginx</td></tr>
<tr><td class="mono">lsof +D /var/www</td><td class="desc">All files open under a directory (recursive)</td></tr>
<tr><td class="mono">lsof -d 4</td><td class="desc">Files with file descriptor 4</td></tr>
<tr><td class="mono">lsof -t /var/log/auth.log</td><td class="desc">PIDs only — useful in kill scripts</td></tr>
<tr><td class="mono">lsof -u alice -c vim</td><td class="desc">AND — alice AND vim</td></tr>
<tr><td class="mono">lsof -u alice -c vim -a</td><td class="desc">AND explicit — alice AND vim (with -a)</td></tr>
</tbody>
</table>
</div>
</div>

<div class="ref-panel">
<div class="ref-panel-head">Network connections</div>
<div class="ref-panel-body">
<table class="cheat-table">
<thead><tr><th>Command</th><th>Description</th></tr></thead>
<tbody>
<tr><td class="mono">lsof -i</td><td class="desc">All network connections</td></tr>
<tr><td class="mono">lsof -i :80</td><td class="desc">Processes using port 80</td></tr>
<tr><td class="mono">lsof -i TCP:22</td><td class="desc">TCP connections on port 22</td></tr>
<tr><td class="mono">lsof -i @10.0.0.1</td><td class="desc">Connections to a specific host</td></tr>
<tr><td class="mono">lsof -i TCP -s TCP:LISTEN</td><td class="desc">Listening TCP ports only</td></tr>
<tr><td class="mono">lsof -i UDP</td><td class="desc">UDP sockets</td></tr>
<tr><td class="mono">lsof -i 4</td><td class="desc">IPv4 only</td></tr>
<tr><td class="mono">lsof -i 6</td><td class="desc">IPv6 only</td></tr>
</tbody>
</table>
</div>
</div>

<div class="ref-panel">
<div class="ref-panel-head">Deleted files (disk not freed)</div>
<div class="ref-panel-body">
<table class="cheat-table">
<thead><tr><th>Command</th><th>Description</th></tr></thead>
<tbody>
<tr><td class="mono">lsof | grep deleted</td><td class="desc">Files deleted but still held open — disk space not freed until process closes them</td></tr>
<tr><td class="mono">lsof -p 1234 | grep REG</td><td class="desc">Regular files open by a process</td></tr>
<tr><td class="mono">ls -la /proc/1234/fd/</td><td class="desc">All file descriptors of a process</td></tr>
<tr><td class="mono">cp /proc/1234/fd/3 /tmp/recovered</td><td class="desc">Recover a deleted file via /proc fd link</td></tr>
<tr><td class="mono">kill -HUP $(lsof -t /var/log/app.log)</td><td class="desc">Signal process to reopen log file</td></tr>
</tbody>
</table>
</div>
</div>

Common use case: `df -h` shows 100% full but `du -sh /*` doesn't add up → a deleted file is still held open. Find it with `lsof | grep deleted`, then restart or HUP the process.
