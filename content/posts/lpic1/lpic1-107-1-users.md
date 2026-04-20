---
title: "LPIC-1 107.1 — Manage User and Group Accounts"
date: 2026-04-20
description: "Creating, modifying, and deleting users and groups; /etc/passwd, /etc/shadow, /etc/group, /etc/gshadow; useradd, usermod, userdel, passwd, chage, getent. LPIC-1 exam topic 107.1."
tags: ["Linux", "LPIC-1", "users", "groups", "passwd", "shadow", "admin"]
categories: ["LPIC-1"]
page_lang: "en"
lang_pair: "/posts/lpic1/ru/lpic1-107-1-users/"
---

> **Exam weight: 5** — LPIC-1 v5, Exam 102

## What You Need to Know

From the official LPIC-1 objectives:

- Add, modify, and remove users and groups.
- Manage user/group info in password and group databases.
- Create and manage special-purpose and limited accounts.

Key files and commands: `/etc/passwd`, `/etc/shadow`, `/etc/group`, `/etc/gshadow`, `/etc/skel`, `/etc/login.defs`, `useradd`, `usermod`, `userdel`, `groupadd`, `groupmod`, `groupdel`, `passwd`, `chage`, `getent`.

---

## User Account Files

### /etc/passwd

Every local user has one line in `/etc/passwd` with seven colon-separated fields:

```
frank:x:1001:1001:Frank User:/home/frank:/bin/bash
```

| Field | Example | Description |
|---|---|---|
| Username | `frank` | Login name |
| Password | `x` | `x` means the password is stored in `/etc/shadow` |
| UID | `1001` | User ID number |
| GID | `1001` | Primary group ID |
| GECOS | `Frank User` | Full name / comment |
| Home Directory | `/home/frank` | User's home directory |
| Shell | `/bin/bash` | Default login shell |

System accounts typically have UIDs below 1000; ordinary user accounts use UIDs of 1000 and above.

### /etc/shadow

Stores password hashes and aging information (readable by root only):

```
frank:$6$...:18600:0:99999:7:::
```

| Field | Description |
|---|---|
| Username | Login name |
| Encrypted Password | Hash; `!` prefix means account is locked |
| Last Change | Days since 1970-01-01 when password was last changed; `0` = must change at next login |
| Minimum Age | Minimum days before password can be changed |
| Maximum Age | Maximum days before password must be changed |
| Warning Period | Days before expiry that user is warned |
| Inactivity Period | Days after expiry before account is disabled |
| Expiration Date | Days since 1970-01-01 when account expires; empty = never |
| Reserved | Unused |

### /etc/group

Each group occupies one line with four fields:

```
db-admin:x:1050:frank,emma
```

| Field | Description |
|---|---|
| Group Name | Name of the group |
| Group Password | `x` means password stored in `/etc/gshadow` |
| GID | Group ID number |
| Member List | Comma-separated list of secondary members (primary members are not listed) |

### /etc/gshadow

Group shadow file with four fields: group name, encrypted password (`!` = no `newgrp` access), group administrators, group members.

---

## Managing Users

### useradd

Creates a new user account. Common options:

| Option | Description |
|---|---|
| `-c comment` | GECOS field (full name, etc.) |
| `-d dir` | Home directory path |
| `-e YYYY-MM-DD` | Account expiry date |
| `-f days` | Days after password expiry before account is disabled |
| `-g GID` | Primary group (name or GID) |
| `-G group,...` | Additional (secondary) groups |
| `-k dir` | Skeleton directory (requires `-m`) |
| `-m` | Create home directory |
| `-M` | Do not create home directory |
| `-s shell` | Login shell |
| `-u UID` | Specify UID |

Example — create user `emma` with home directory and bash shell:

```bash
useradd -m -s /bin/bash -c "Emma User" emma
```

### usermod

Modifies an existing user account. Options mirror `useradd` with additions:

| Option | Description |
|---|---|
| `-d dir [-m]` | Change home directory; `-m` also moves existing contents |
| `-G groups [-a]` | Set secondary groups; `-a` appends instead of replacing |
| `-l newname` | Rename login name |
| `-L` | Lock account (prepends `!` to password hash in shadow) |
| `-U` | Unlock account (removes `!`) |

### userdel

Removes a user account. Use `-r` to also delete the home directory and mail spool:

```bash
userdel -r emma
```

---

## Managing Groups

| Command | Description |
|---|---|
| `groupadd -g GID name` | Create a new group with optional GID |
| `groupmod -n newname name` | Rename a group |
| `groupmod -g GID name` | Change a group's GID |
| `groupdel name` | Delete a group |

---

## Password and Aging — passwd and chage

### passwd

Manages user passwords and account locking:

| Option | Description |
|---|---|
| `-d` | Delete password (no password required) |
| `-e` | Force password change on next login |
| `-i days` | Inactivity period after expiry |
| `-l` | Lock account |
| `-n days` | Minimum password lifetime |
| `-S` | Show account status |
| `-u` | Unlock account |
| `-w days` | Warning days before expiry |
| `-x days` | Maximum password lifetime |

### chage

Manages password expiry and aging:

| Option | Description |
|---|---|
| `-d YYYY-MM-DD` | Set date of last password change |
| `-E YYYY-MM-DD` | Set account expiry date |
| `-I days` | Set inactivity period |
| `-l` | List account aging info (non-root can run for own account) |
| `-m days` | Minimum password age |
| `-M days` | Maximum password age |
| `-W days` | Warning days before expiry |

### passwd ↔ chage equivalents

| passwd | chage | Meaning |
|---|---|---|
| `-n` | `-m` | Minimum password lifetime |
| `-x` | `-M` | Maximum password lifetime |
| `-w` | `-W` | Warning days |
| `-i` | `-I` | Inactivity days |
| `-S` | `-l` | Show status/list |

To **lock** an account: `usermod -L username` or `passwd -l username`.  
To **unlock** an account: `usermod -U username` or `passwd -u username`.

---

## Skeleton and Login Defaults

### /etc/skel

When `useradd -m` creates a home directory, the contents of `/etc/skel` are copied into it. Place default config files (`.bashrc`, `.profile`, etc.) here.

### /etc/login.defs

System-wide defaults for user/group creation:

| Directive | Meaning |
|---|---|
| `UID_MIN` / `UID_MAX` | UID range for ordinary users |
| `GID_MIN` / `GID_MAX` | GID range for ordinary groups |
| `CREATE_HOME` | Whether to create home by default |
| `USERGROUPS_ENAB` | Create a matching group for each new user |
| `MAIL_DIR` | Mail spool directory |
| `PASS_MAX_DAYS` | Default maximum password age |
| `PASS_MIN_DAYS` | Default minimum password age |
| `PASS_MIN_LEN` | Minimum password length |
| `PASS_WARN_AGE` | Default warning days |

---

## Querying Accounts — getent

`getent` retrieves entries from Name Service Switch (NSS) databases, supporting both local files and network directories (LDAP, NIS):

```bash
getent passwd emma
# emma:x:1020:1020:User Emma:/home/emma:/bin/bash

getent group db-admin
# db-admin:x:1050:frank,emma
```

---

## Quick Reference

```
User account files:
  /etc/passwd      7 fields: username:x:UID:GID:GECOS:home:shell
  /etc/shadow      9 fields: username:hash:lastchg:min:max:warn:inactive:expire:reserved
  /etc/group       4 fields: groupname:x:GID:members
  /etc/gshadow     4 fields: groupname:hash:admins:members

Creating users:
  useradd -m -s /bin/bash -c "Name" -G group1,group2 username
  useradd flags: -c -d -e -f -g -G -k -m -M -s -u

Modifying users:
  usermod -d -m   move home directory
  usermod -G -a   append secondary groups
  usermod -l      rename login
  usermod -L/-U   lock / unlock

Deleting users:
  userdel -r username    remove user + home + mail spool

Groups:
  groupadd -g GID name
  groupmod -n newname -g GID name
  groupdel name

Passwords & aging:
  passwd -l/-u    lock / unlock
  passwd -x/-n/-w/-i   max/min/warn/inactive days
  chage -M/-m/-W/-I    same via chage
  chage -E YYYY-MM-DD  set account expiry
  chage -l username    list aging info

Skeleton & defaults:
  /etc/skel        copied to new home directories
  /etc/login.defs  system defaults for UIDs, GIDs, password aging

Query NSS databases:
  getent passwd username
  getent group groupname
```

---

## Exam Questions

1. What command creates user `frank` with a home directory and bash shell? → `useradd -m -s /bin/bash frank`
2. What does `usermod -L username` do? → Locks the account by prepending `!` to the password hash in `/etc/shadow`.
3. What is the equivalent of `passwd -l`? → `usermod -L` — both lock the account.
4. How do you append a user to secondary group `staff` without removing existing groups? → `usermod -aG staff username`
5. What command changes the maximum password age to 90 days? → `chage -M 90 username` or `passwd -x 90 username`
6. What file stores password hashes on Linux? → `/etc/shadow`
7. What does a `!` prefix in the password field of `/etc/shadow` mean? → The account is locked.
8. What is `/etc/skel`? → Directory whose contents are copied to a new user's home directory when it is created.
9. What command removes user `emma` and her home directory? → `userdel -r emma`
10. What does `getent passwd emma` do? → Queries the NSS passwd database for user emma — works with local files and network directories.
11. How many fields does `/etc/passwd` have? → **7**: username, password placeholder, UID, GID, GECOS, home, shell.
12. How many fields does `/etc/shadow` have? → **9**: username, hash, last-change, min, max, warn, inactive, expire, reserved.
13. What UID range is typically used for ordinary users? → **1000 and above** (system accounts are below 1000).
14. What file defines system-wide defaults for user creation such as `UID_MIN`? → `/etc/login.defs`
15. What command lists aging information for a user account? → `chage -l username`
16. Which option of `chage` sets the account expiry date? → `-E YYYY-MM-DD`
17. What does `userdel` do without the `-r` flag? → Removes the user account but leaves the home directory and mail spool intact.
18. How do you force a user to change their password on next login? → `passwd -e username` or `chage -d 0 username`

---

## Exercises

### Exercise 1 — Create a Developer Account

Create user `dev1` with UID 2001, home directory `/home/dev1`, bash shell, and secondary group `developers`. What command achieves this?

<details>
<summary>Answer</summary>

```bash
useradd -u 2001 -m -s /bin/bash -G developers dev1
```

This creates the user with the specified UID (`-u 2001`), creates a home directory (`-m`), sets the shell (`-s`), and assigns the secondary group (`-G developers`).

</details>

---

### Exercise 2 — Lock and Unlock an Account

A user account must be temporarily disabled while an employee is on leave. What are two ways to lock it, and how do you unlock it?

<details>
<summary>Answer</summary>

**Lock:**
- `usermod -L username` — prepends `!` to password hash
- `passwd -l username` — same effect

**Unlock:**
- `usermod -U username`
- `passwd -u username`

Both methods modify the password field in `/etc/shadow`.

</details>

---

### Exercise 3 — Password Aging Policy

Set a password policy for user `frank` where: maximum age is 60 days, minimum age is 2 days, warning 7 days before expiry, and inactivity lock after 14 days.

<details>
<summary>Answer</summary>

```bash
chage -M 60 -m 2 -W 7 -I 14 frank
```

Equivalently with `passwd`:
```bash
passwd -x 60 -n 2 -w 7 -i 14 frank
```

</details>

---

### Exercise 4 — Reading /etc/shadow

Given this shadow entry: `emma:$6$abc:19000:5:90:7:30:19365:`

Interpret each field.

<details>
<summary>Answer</summary>

| Field | Value | Meaning |
|---|---|---|
| Username | `emma` | Login name |
| Password | `$6$abc` | SHA-512 hash |
| Last change | `19000` | Day 19000 since 1970-01-01 |
| Min age | `5` | Can't change for 5 days |
| Max age | `90` | Must change every 90 days |
| Warning | `7` | Warned 7 days before expiry |
| Inactivity | `30` | Locked 30 days after expiry |
| Expiration | `19365` | Account expires on day 19365 since epoch |
| Reserved | (empty) | Unused |

</details>

---

### Exercise 5 — Group Membership

User `kevin` needs to be added to the `sysadmin` group as a secondary group without losing existing group memberships. What command achieves this?

<details>
<summary>Answer</summary>

```bash
usermod -aG sysadmin kevin
```

The `-a` flag is critical — without it, `-G` would replace all current secondary group memberships with only `sysadmin`.

</details>

---

*LPIC-1 Study Notes | Topic 107: Administrative Tasks*
