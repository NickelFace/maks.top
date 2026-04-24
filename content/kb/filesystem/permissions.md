---
title: "Permissions & ACL"
description: "chmod, chown, umask, setfacl/getfacl — Linux file permissions"
icon: "🔐"
tags: ["Linux", "chmod", "chown", "ACL", "permissions", "umask"]
date: 2026-04-14
---

<div class="intro-card">
Linux permission system: <strong>chmod</strong> (mode bits), <strong>chown</strong> (ownership), <strong>umask</strong> (default permissions), <strong>setfacl/getfacl</strong> (fine-grained ACL for multiple users and groups).
</div>

## chmod

<div class="ref-panel">
<div class="ref-panel-head">Octal mode</div>
<div class="ref-panel-body">
<table class="cheat-table">
<thead><tr><th>Command</th><th>Symbolic</th><th>Meaning</th></tr></thead>
<tbody>
<tr><td class="mono">chmod 755 file</td><td class="desc">rwxr-xr-x</td><td class="desc">Owner full, others read+execute</td></tr>
<tr><td class="mono">chmod 644 file</td><td class="desc">rw-r--r--</td><td class="desc">Owner read+write, others read</td></tr>
<tr><td class="mono">chmod 600 file</td><td class="desc">rw-------</td><td class="desc">Owner only (private key, secret file)</td></tr>
<tr><td class="mono">chmod 700 dir</td><td class="desc">rwx------</td><td class="desc">Owner only (private directory)</td></tr>
<tr><td class="mono">chmod 664 file</td><td class="desc">rw-rw-r--</td><td class="desc">Owner + group write, others read</td></tr>
<tr><td class="mono">chmod 777 file</td><td class="desc">rwxrwxrwx</td><td class="desc">Everyone full — avoid unless intentional</td></tr>
</tbody>
</table>
</div>
</div>

<div class="ref-panel">
<div class="ref-panel-head">Symbolic mode</div>
<div class="ref-panel-body">
<table class="cheat-table">
<thead><tr><th>Command</th><th>Description</th></tr></thead>
<tbody>
<tr><td class="mono">chmod u+x file</td><td class="desc">Add execute for owner (u)</td></tr>
<tr><td class="mono">chmod g-w file</td><td class="desc">Remove write for group (g)</td></tr>
<tr><td class="mono">chmod o= file</td><td class="desc">Remove all permissions for others (o)</td></tr>
<tr><td class="mono">chmod a+r file</td><td class="desc">Add read for all (a = u+g+o)</td></tr>
<tr><td class="mono">chmod ug+rw file</td><td class="desc">Owner and group read+write</td></tr>
<tr><td class="mono">chmod -R 755 /var/www</td><td class="desc">Recursive — dangerous if mixed files/dirs</td></tr>
<tr><td class="mono">find /var/www -type f -exec chmod 644 {} +</td><td class="desc">Safer: set 644 on files only</td></tr>
<tr><td class="mono">find /var/www -type d -exec chmod 755 {} +</td><td class="desc">Set 755 on directories only</td></tr>
</tbody>
</table>
</div>
</div>

<div class="ref-panel">
<div class="ref-panel-head">Special bits</div>
<div class="ref-panel-body">
<table class="cheat-table">
<thead><tr><th>Command</th><th>Octal</th><th>Effect</th></tr></thead>
<tbody>
<tr><td class="mono">chmod u+s /usr/bin/ping</td><td class="desc">4755</td><td class="desc">SUID — runs as file owner (root for ping)</td></tr>
<tr><td class="mono">chmod g+s /shared/dir</td><td class="desc">2755</td><td class="desc">SGID — new files in dir inherit the group</td></tr>
<tr><td class="mono">chmod +t /tmp</td><td class="desc">1777</td><td class="desc">Sticky — only file owner can delete (shared dirs)</td></tr>
<tr><td class="mono">chmod 4755 file</td><td class="desc">4755</td><td class="desc">SUID + rwxr-xr-x in one octal</td></tr>
</tbody>
</table>
</div>
</div>

<div class="ref-panel">
<div class="ref-panel-head">Permission bits reference</div>
<div class="ref-panel-body">
<table class="cheat-table">
<thead><tr><th>Octal</th><th>Binary</th><th>Symbolic</th></tr></thead>
<tbody>
<tr><td class="mono">7</td><td class="desc">111</td><td class="desc">rwx</td></tr>
<tr><td class="mono">6</td><td class="desc">110</td><td class="desc">rw-</td></tr>
<tr><td class="mono">5</td><td class="desc">101</td><td class="desc">r-x</td></tr>
<tr><td class="mono">4</td><td class="desc">100</td><td class="desc">r--</td></tr>
<tr><td class="mono">3</td><td class="desc">011</td><td class="desc">-wx</td></tr>
<tr><td class="mono">2</td><td class="desc">010</td><td class="desc">-w-</td></tr>
<tr><td class="mono">1</td><td class="desc">001</td><td class="desc">--x</td></tr>
<tr><td class="mono">0</td><td class="desc">000</td><td class="desc">---</td></tr>
</tbody>
</table>
</div>
</div>

## chown

<div class="ref-panel">
<div class="ref-panel-head">chown commands</div>
<div class="ref-panel-body">
<table class="cheat-table">
<thead><tr><th>Command</th><th>Description</th></tr></thead>
<tbody>
<tr><td class="mono">chown alice file</td><td class="desc">Change owner to alice</td></tr>
<tr><td class="mono">chown alice:staff file</td><td class="desc">Change owner and group</td></tr>
<tr><td class="mono">chown :staff file</td><td class="desc">Change group only</td></tr>
<tr><td class="mono">chgrp staff file</td><td class="desc">Change group only (alternative)</td></tr>
<tr><td class="mono">chown -R alice:alice /home/alice</td><td class="desc">Recursive ownership change</td></tr>
<tr><td class="mono">chown --reference=ref_file target</td><td class="desc">Copy ownership from another file</td></tr>
</tbody>
</table>
</div>
</div>

## umask

<div class="ref-panel">
<div class="ref-panel-head">umask — default permissions</div>
<div class="ref-panel-body">
<table class="cheat-table">
<thead><tr><th>umask</th><th>New files</th><th>New dirs</th><th>Use case</th></tr></thead>
<tbody>
<tr><td class="mono">022</td><td class="desc">644 (rw-r--r--)</td><td class="desc">755 (rwxr-xr-x)</td><td class="desc">Default — others can read</td></tr>
<tr><td class="mono">027</td><td class="desc">640 (rw-r-----)</td><td class="desc">750 (rwxr-x---)</td><td class="desc">Group read, no others</td></tr>
<tr><td class="mono">077</td><td class="desc">600 (rw-------)</td><td class="desc">700 (rwx------)</td><td class="desc">Private — owner only</td></tr>
<tr><td class="mono">002</td><td class="desc">664 (rw-rw-r--)</td><td class="desc">775 (rwxrwxr-x)</td><td class="desc">Collaborative — group can write</td></tr>
</tbody>
</table>
</div>
</div>

umask subtracts from maximum: files start at `666`, dirs at `777`. `umask 022` → `666 - 022 = 644` for files, `777 - 022 = 755` for dirs.

```bash
umask          # show current umask
umask 027      # set for current shell
umask -S       # symbolic form: u=rwx,g=rx,o=
```

Set system-wide default in `/etc/login.defs` (LOGIN_UMASK) or `/etc/profile`.

## setfacl / getfacl

<div class="ref-panel">
<div class="ref-panel-head">ACL — extended permissions</div>
<div class="ref-panel-body">
<table class="cheat-table">
<thead><tr><th>Command</th><th>Description</th></tr></thead>
<tbody>
<tr><td class="mono">getfacl file</td><td class="desc">Show all ACL entries for a file</td></tr>
<tr><td class="mono">setfacl -m u:alice:rw file</td><td class="desc">Give alice read+write</td></tr>
<tr><td class="mono">setfacl -m u:bob:r-- file</td><td class="desc">Give bob read-only</td></tr>
<tr><td class="mono">setfacl -m u:carol:--- file</td><td class="desc">Explicitly deny carol</td></tr>
<tr><td class="mono">setfacl -m g:devs:rwx dir</td><td class="desc">Give group devs full access</td></tr>
<tr><td class="mono">setfacl -m o::r-- file</td><td class="desc">Set other ACL entry</td></tr>
<tr><td class="mono">setfacl -x u:alice file</td><td class="desc">Remove alice's ACL entry</td></tr>
<tr><td class="mono">setfacl -b file</td><td class="desc">Remove all ACL entries (reset to standard)</td></tr>
<tr><td class="mono">setfacl -R -m u:alice:rX dir</td><td class="desc">Recursive: read + conditional execute (X = dirs only)</td></tr>
<tr><td class="mono">setfacl -d -m u:alice:rw dir</td><td class="desc">Default ACL — inherited by new files in dir</td></tr>
<tr><td class="mono">setfacl -d -m g:devs:rwx dir</td><td class="desc">Default ACL for group</td></tr>
<tr><td class="mono">setfacl -k dir</td><td class="desc">Remove only default ACL</td></tr>
<tr><td class="mono">getfacl dir1 | setfacl --set-file=- dir2</td><td class="desc">Copy ACL from one dir to another</td></tr>
<tr><td class="mono">getfacl -R /data > acl_backup.txt</td><td class="desc">Backup ACLs recursively</td></tr>
<tr><td class="mono">setfacl --restore=acl_backup.txt</td><td class="desc">Restore backed up ACLs</td></tr>
</tbody>
</table>
</div>
</div>

<div class="ref-panel">
<div class="ref-panel-head">ACL entry format</div>
<div class="ref-panel-body">
<table class="cheat-table">
<thead><tr><th>Entry</th><th>Meaning</th></tr></thead>
<tbody>
<tr><td class="mono">u::rwx</td><td class="desc">Owner permissions</td></tr>
<tr><td class="mono">u:alice:rw-</td><td class="desc">Named user alice</td></tr>
<tr><td class="mono">g::r-x</td><td class="desc">Owning group permissions</td></tr>
<tr><td class="mono">g:devs:rwx</td><td class="desc">Named group devs</td></tr>
<tr><td class="mono">m::rwx</td><td class="desc">Effective rights mask (limits named users/groups)</td></tr>
<tr><td class="mono">o::r--</td><td class="desc">Other (everyone else)</td></tr>
<tr><td class="mono">d:u:alice:rw-</td><td class="desc">Default ACL entry (prefix d:)</td></tr>
</tbody>
</table>
</div>
</div>

A `+` at the end of `ls -l` output means ACL is present. The mask (`m`) limits the effective permissions of named users and groups — `getfacl` shows both the entry and `#effective:` if the mask reduces it.

Requirements: filesystem must be mounted with ACL support. On ext4 it's enabled by default. Check: `tune2fs -l /dev/sda1 | grep "Default mount"`.
