---
title: "find"
description: "Search by name, type, size, date, permissions; -exec; -print0"
icon: "🔍"
tags: ["Linux", "find", "filesystem"]
date: 2026-04-14
---

<div class="intro-card">
<strong>find</strong> — recursive filesystem search. Combines filters for name, type, size, time, permissions, and ownership, then runs actions with <strong>-exec</strong>.
</div>

## Name & type

<div class="ref-panel">
<div class="ref-panel-head">Search by name & type</div>
<div class="ref-panel-body">
<table class="cheat-table">
<thead><tr><th>Command</th><th>Description</th></tr></thead>
<tbody>
<tr><td class="mono">find /etc -name "*.conf"</td><td class="desc">Files matching glob pattern</td></tr>
<tr><td class="mono">find /var -iname "*.log"</td><td class="desc">Case-insensitive match</td></tr>
<tr><td class="mono">find / -name "passwd" 2>/dev/null</td><td class="desc">Suppress permission errors</td></tr>
<tr><td class="mono">find . -type f</td><td class="desc">Regular files only</td></tr>
<tr><td class="mono">find . -type d</td><td class="desc">Directories only</td></tr>
<tr><td class="mono">find . -type l</td><td class="desc">Symbolic links only</td></tr>
<tr><td class="mono">find . -type s</td><td class="desc">Sockets only</td></tr>
<tr><td class="mono">find . -maxdepth 2 -name "*.sh"</td><td class="desc">Limit search depth to 2 levels</td></tr>
<tr><td class="mono">find . -mindepth 2 -name "*.py"</td><td class="desc">Skip top level, search from depth 2</td></tr>
<tr><td class="mono">find . -not -name "*.log"</td><td class="desc">Exclude a pattern</td></tr>
<tr><td class="mono">find . \( -name "*.txt" -o -name "*.md" \)</td><td class="desc">OR — match either pattern</td></tr>
<tr><td class="mono">find . -name "*.py" -not -path "*/venv/*"</td><td class="desc">Exclude a directory subtree</td></tr>
</tbody>
</table>
</div>
</div>

## Size & time

<div class="ref-panel">
<div class="ref-panel-head">Search by size</div>
<div class="ref-panel-body">
<table class="cheat-table">
<thead><tr><th>Command</th><th>Description</th></tr></thead>
<tbody>
<tr><td class="mono">find / -size +100M</td><td class="desc">Larger than 100 MB</td></tr>
<tr><td class="mono">find / -size -1k</td><td class="desc">Smaller than 1 KB</td></tr>
<tr><td class="mono">find / -size +1G -size -10G</td><td class="desc">Between 1 GB and 10 GB</td></tr>
<tr><td class="mono">find . -empty</td><td class="desc">Empty files and directories</td></tr>
</tbody>
</table>
</div>
</div>

Size units: `c` bytes · `k` KB · `M` MB · `G` GB. Prefix `+` = larger than, `-` = smaller than.

<div class="ref-panel">
<div class="ref-panel-head">Search by time</div>
<div class="ref-panel-body">
<table class="cheat-table">
<thead><tr><th>Command</th><th>Description</th></tr></thead>
<tbody>
<tr><td class="mono">find . -mtime -7</td><td class="desc">Modified in the last 7 days</td></tr>
<tr><td class="mono">find . -mtime +30</td><td class="desc">Not modified in over 30 days</td></tr>
<tr><td class="mono">find . -mtime 0</td><td class="desc">Modified today (less than 24h ago)</td></tr>
<tr><td class="mono">find . -mmin -30</td><td class="desc">Modified in the last 30 minutes</td></tr>
<tr><td class="mono">find . -atime -1</td><td class="desc">Accessed in the last 24 hours</td></tr>
<tr><td class="mono">find . -ctime -1</td><td class="desc">Inode changed in the last 24 hours</td></tr>
<tr><td class="mono">find . -newer /etc/passwd</td><td class="desc">Newer than a reference file</td></tr>
<tr><td class="mono">find . -newer /etc/passwd -not -newer /tmp/ref</td><td class="desc">Modified between two reference files</td></tr>
</tbody>
</table>
</div>
</div>

Time flags: `m` = modified · `a` = accessed · `c` = inode changed. `time` = days, `min` = minutes.

## Permissions & ownership

<div class="ref-panel">
<div class="ref-panel-head">Search by permissions</div>
<div class="ref-panel-body">
<table class="cheat-table">
<thead><tr><th>Command</th><th>Description</th></tr></thead>
<tbody>
<tr><td class="mono">find / -perm 644</td><td class="desc">Exact permission 644</td></tr>
<tr><td class="mono">find / -perm -644</td><td class="desc">At least 644 (all listed bits set)</td></tr>
<tr><td class="mono">find / -perm /111</td><td class="desc">Any execute bit set (u, g, or o)</td></tr>
<tr><td class="mono">find / -perm -u=x</td><td class="desc">Owner has execute bit</td></tr>
<tr><td class="mono">find / -perm -4000</td><td class="desc">SUID bit set</td></tr>
<tr><td class="mono">find / -perm -2000</td><td class="desc">SGID bit set</td></tr>
<tr><td class="mono">find / -perm -1000</td><td class="desc">Sticky bit set</td></tr>
</tbody>
</table>
</div>
</div>

<div class="ref-panel">
<div class="ref-panel-head">Search by ownership</div>
<div class="ref-panel-body">
<table class="cheat-table">
<thead><tr><th>Command</th><th>Description</th></tr></thead>
<tbody>
<tr><td class="mono">find / -user alice</td><td class="desc">Files owned by user alice</td></tr>
<tr><td class="mono">find / -group staff</td><td class="desc">Files owned by group staff</td></tr>
<tr><td class="mono">find / -uid 1001</td><td class="desc">Files owned by UID 1001</td></tr>
<tr><td class="mono">find / -nouser</td><td class="desc">No valid owner (orphaned files)</td></tr>
<tr><td class="mono">find / -nogroup</td><td class="desc">No valid group</td></tr>
</tbody>
</table>
</div>
</div>

## Actions: -exec & -print0

<div class="ref-panel">
<div class="ref-panel-head">-exec and actions</div>
<div class="ref-panel-body">
<table class="cheat-table">
<thead><tr><th>Command</th><th>Description</th></tr></thead>
<tbody>
<tr><td class="mono">find . -name "*.tmp" -exec rm {} \;</td><td class="desc">Delete each file (one process per file)</td></tr>
<tr><td class="mono">find . -name "*.tmp" -exec rm {} +</td><td class="desc">Delete — batch all files into one rm call (faster)</td></tr>
<tr><td class="mono">find . -type f -exec chmod 644 {} +</td><td class="desc">Fix file permissions in bulk</td></tr>
<tr><td class="mono">find . -type d -exec chmod 755 {} +</td><td class="desc">Fix directory permissions in bulk</td></tr>
<tr><td class="mono">find . -name "*.sh" -exec chmod +x {} +</td><td class="desc">Make scripts executable</td></tr>
<tr><td class="mono">find . -name "*.log" -exec gzip {} \;</td><td class="desc">Compress each log file</td></tr>
<tr><td class="mono">find . -name "*.bak" -delete</td><td class="desc">Delete matching files (built-in, no subprocess)</td></tr>
<tr><td class="mono">find . -name "*.conf" -exec grep -l "port 22" {} +</td><td class="desc">Search inside found files</td></tr>
<tr><td class="mono">find /var/log -name "*.log" -mtime +90 -exec rm {} +</td><td class="desc">Delete logs older than 90 days</td></tr>
</tbody>
</table>
</div>
</div>

<div class="ref-panel">
<div class="ref-panel-head">-print0 & xargs -0 (safe pipes)</div>
<div class="ref-panel-body">
<table class="cheat-table">
<thead><tr><th>Command</th><th>Description</th></tr></thead>
<tbody>
<tr><td class="mono">find . -name "*.py" -print0 | xargs -0 grep "TODO"</td><td class="desc">Safe pipe — handles filenames with spaces/newlines</td></tr>
<tr><td class="mono">find . -print0 | xargs -0 ls -la</td><td class="desc">List every found file with details</td></tr>
<tr><td class="mono">find . -name "*.log" -print0 | xargs -0 -P4 gzip</td><td class="desc">Parallel compression (4 workers)</td></tr>
<tr><td class="mono">find . -name "*.py" | xargs grep "import"</td><td class="desc">Plain pipe — breaks on spaces in filenames</td></tr>
</tbody>
</table>
</div>
</div>

`{}` is replaced by the filename. `\;` runs one process per file; `+` batches all files into one invocation (like xargs). `-print0` uses null byte as separator — immune to spaces and special characters.
