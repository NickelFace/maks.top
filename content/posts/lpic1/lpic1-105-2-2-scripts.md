---
title: "LPIC-1 105.2 Lesson 2 — Customize or Write Simple Scripts"
date: 2026-04-19
description: "Full test flags, file comparison, logical modifiers, nocasematch, sync.sh with mapfile, read/seq/exec, command chains, mail, SUID. LPIC-1 exam topic 105.2, lesson 2."
tags: ["Linux", "LPIC-1", "bash", "scripting", "test", "loops", "case"]
categories: ["LPIC-1"]
page_lang: "en"
lang_pair: "/posts/lpic1/ru/lpic1-105-2-2-scripts/"
---

> **Exam weight: 4** — LPIC-1 v5, Exam 102

## What You Need to Know

- Apply standard `sh` syntax: loops and conditionals.
- Use command substitution.
- Test command return values to determine success or failure.
- Chain commands together.
- Send conditional notifications to the root administrator.
- Select the correct script interpreter via the shebang line `#!`.
- Manage script location, ownership, execute permissions, and SUID.

Key files, terms, and utilities: `for`, `while`, `test`, `if`, `read`, `seq`, `exec`, `||`, `&&`.

---

## Shebang and Interpreter Selection

The first line of a script begins with `#!` (shebang) followed by the absolute path to the interpreter. The kernel reads this line when executing the file and passes it to the named program. Without a shebang the script still runs, but through the current shell — which may not be the intended behavior.

Common options:

```bash
#!/bin/bash       # Bash — the most common choice
#!/bin/sh         # POSIX-compatible shell (varies by distro)
#!/usr/bin/env python3   # Python via env — more portable
```

Bash scripts use the shell's built-in commands combined with Linux command-line utilities. Their full power comes from combining built-ins with external tools.

---

## Basic sh Syntax

### Variables

Assignment — no spaces around the equals sign:

```bash
NAME="Alice"
COUNT=42
```

Reference a variable with `$NAME` or `${NAME}`. Double quotes preserve variable substitutions; single quotes suppress them.

### Script Parameters

Inside a script, arguments are available as positional parameters:

`$0`: the script name  
`$1`, `$2`, `$3` …: first, second, third argument  
`$#`: number of arguments  
`$@`: all arguments as separate words  
`$*`: all arguments as a single string  
`$?`: exit code of the last command  
`$$`: PID of the current process  
`$!`: PID of the last background process

---

## Command Substitution

Capture a command's output and assign it to a variable or embed it in a string:

```bash
TODAY=$(date +%Y-%m-%d)
TODAY=`date +%Y-%m-%d`    # older form
```

The modern `$(...)` syntax is preferred because it supports nesting; backticks do not.

---

## Return Values and the test Command

### Exit Code

Every command returns an integer when it finishes. Zero means success; anything else is an error. The code is available in `$?` immediately after:

```bash
ls /etc
echo $?       # 0
ls /nonexistent
echo $?       # 2
```

A script can return its own code with `exit N` (0–255).

### Two Forms of test

The `test` builtin has two equivalent forms — as a command name or as square brackets where `test` is implied:

```bash
$ test -d /etc
$ echo $?
0
$ [ -d /etc ]
$ echo $?
0
```

Spaces inside `[ ]` are mandatory — after `[` and before `]`.

### File and Directory Tests

Assume the path is stored in `$VAR`:

`-a "$VAR"`: path exists and is a file  
`-b "$VAR"`: block special device  
`-c "$VAR"`: character special device  
`-d "$VAR"`: directory  
`-e "$VAR"`: path exists in the filesystem  
`-f "$VAR"`: regular file  
`-g "$VAR"`: has SGID bit  
`-h "$VAR"`: symbolic link  
`-L "$VAR"`: symbolic link (synonym for `-h`)  
`-k "$VAR"`: has sticky bit  
`-p "$VAR"`: named pipe  
`-r "$VAR"`: readable by current user  
`-s "$VAR"`: exists and is non-empty  
`-S "$VAR"`: socket  
`-t "$VAR"`: open on a terminal  
`-u "$VAR"`: has SUID bit  
`-w "$VAR"`: writable by current user  
`-x "$VAR"`: executable by current user  
`-O "$VAR"`: owned by current user  
`-G "$VAR"`: owned by current user's effective group  
`-N "$VAR"`: modified since last read

Double quotes around the tested variable are not optional — an empty variable without quotes produces a syntax error because the required operand disappears.

### Comparing Two Files

`"$VAR1" -nt "$VAR2"`: VAR1 is newer than VAR2 (by modification time)  
`"$VAR1" -ot "$VAR2"`: VAR1 is older than VAR2  
`"$VAR1" -ef "$VAR2"`: VAR1 is a hard link to VAR2 (same inode)

### String Comparisons

`-z "$TXT"`: variable is empty (zero length)  
`-n "$TXT"` or `test "$TXT"`: variable is non-empty  
`"$TXT1" = "$TXT2"` or `"$TXT1" == "$TXT2"`: strings are equal  
`"$TXT1" != "$TXT2"`: strings differ  
`"$TXT1" < "$TXT2"`: TXT1 sorts before TXT2 alphabetically  
`"$TXT1" > "$TXT2"`: TXT1 sorts after TXT2 alphabetically

Alphabetical ordering rules differ between locales. For stable results regardless of system locale set:

```bash
LANG=C
```

### Numeric Comparisons

`$NUM1 -lt $NUM2`: less than  
`$NUM1 -gt $NUM2`: greater than  
`$NUM1 -le $NUM2`: less or equal  
`$NUM1 -ge $NUM2`: greater or equal  
`$NUM1 -eq $NUM2`: equal  
`$NUM1 -ne $NUM2`: not equal

Numeric tests work only with integers and only with these letter operators. Using `<` or `>` for numbers compares them as strings — and the `>` shell operator additionally redirects stdout: `test 1 > 2` creates a file named `2` and returns true.

### Logical Modifiers

`! EXPR`: true if EXPR is false  
`EXPR1 -a EXPR2`: both expressions are true (AND)  
`EXPR1 -o EXPR2`: at least one is true (OR)

Example:

```bash
if [ ! -d "$FROM" -o ! -d "$TO" ]
then
    echo "One of the directories does not exist"
    exit 1
fi
```

---

## Conditional Constructs

### if / then / elif / else

```bash
if CONDITION
then
    COMMANDS
elif OTHER_CONDITION
then
    COMMANDS
else
    COMMANDS
fi
```

The condition is any command — its exit code is tested. Closed with `fi` (if reversed).

### case

Use `case` when many branches are needed:

```bash
#!/bin/bash
DISTRO=$1
echo -n "Distribution $DISTRO uses "
case "$DISTRO" in
  debian | ubuntu | mint)
    echo -n "the DEB"
    ;;
  centos | fedora | opensuse)
    echo -n "the RPM"
    ;;
  *)
    echo -n "an unknown"
    ;;
esac
echo " package format."
```

```
$ ./script.sh opensuse
Distribution opensuse uses the RPM package format.
```

Each pattern list ends with `;;`, `;&`, or `;;&`. The `*` pattern matches anything not caught earlier. Closed with `esac` (case reversed).

### nocasematch Option

Enable case-insensitive pattern matching in `case` and `[[ ]]`:

```bash
shopt -s nocasematch    # enable
shopt -u nocasematch    # disable
```

Changes made inside a script do not affect the parent session — scripts run in a subshell.

---

## Loops

Scripts automate repetitive tasks: the same set of commands runs until a stop condition is met. Bash has three loop constructs.

### for

```bash
for VARNAME in LIST
do
    COMMANDS
done
```

`LIST` is a sequence of separated elements. The separator is defined by `IFS` (default: space, tab, newline).

Example — check odd/even:

```bash
#!/bin/bash
for NUM in 1 1 2 3 5 8 13
do
    echo -n "$NUM is "
    if [ $(( $NUM % 2 )) -ne 0 ]
    then
        echo "odd."
    else
        echo "even."
    fi
done
```

### C-Style for

```bash
#!/bin/bash
SEQ=( 1 1 2 3 5 8 13 )
for (( IDX = 0; IDX < ${#SEQ[*]}; IDX++ ))
do
    echo -n "${SEQ[$IDX]} is "
    if [ $(( ${SEQ[$IDX]} % 2 )) -ne 0 ]; then echo "odd."; else echo "even."; fi
done
```

### until

Repeats while the test command returns non-zero:

```bash
IDX=0
until [ $IDX -eq ${#SEQ[*]} ]
do
    echo "${SEQ[$IDX]}"
    IDX=$(( $IDX + 1 ))
done
```

Always include an action in the body that moves toward the stop condition (e.g., increment a counter), otherwise the loop runs forever.

### while

Repeats while the test returns zero (success). `while [ $IDX -lt ${#SEQ[*]} ]` is the mirror of the `until` example above.

### Practical Example: sync.sh

A script to synchronise files from a source to a destination directory. The list of items is stored in `~/.sync.list` (one entry per line, spaces in names allowed):

```
Documents
To do
Work
Family Album
.config
.ssh
.bash_profile
.vimrc
```

The `mapfile` built-in reads the file and creates an array with one element per line — convenient when names can contain spaces.

```bash
#!/bin/bash
set -ef

FILE=~/.sync.list
FROM=$1
TO=$2

if [ ! -d "$FROM" -o ! -d "$TO" ]
then
    echo "Usage: $0 <SOURCEDIR> <DESTDIR>"
    exit 1
fi

mapfile -t LIST < $FILE

for (( IDX = 0; IDX < ${#LIST[*]}; IDX++ ))
do
    echo -e "$FROM/${LIST[$IDX]} \u2192 $TO/${LIST[$IDX]}"
    rsync -qa --delete "$FROM/${LIST[$IDX]}" "$TO"
done
```

`set -ef`: `-e` exits on any error; `-f` disables filename globbing.

`mapfile -t LIST < $FILE`: loads the file into array `LIST`, one line per element, stripping trailing newlines.

`rsync -qa --delete`: quiet mode, archive (preserves attributes), deletes in destination what is gone in source.

---

## read, seq, exec

### read

```bash
read -p "Name: " NAME           # prompt and read
read -s PASSWORD                # silent (for passwords)
read -t 5 ANSWER                # timeout 5 seconds
read FIRST SECOND REST          # split input across variables
```

### seq

Print a sequence of numbers:

```bash
seq 5            # 1 2 3 4 5
seq 2 2 10       # 2 4 6 8 10  (step 2)
seq -w 1 10      # 01 02 ... 10  (leading zeros)
```

In a `for` loop:

```bash
for i in $(seq 1 10); do echo "Step $i"; done
```

### exec

Replaces the current shell process with the named command — no new process, no return:

```bash
exec /usr/bin/python3 myscript.py
```

Without a command, `exec` redirects the rest of the script's I/O:

```bash
exec > /tmp/log.txt 2>&1    # all subsequent output goes to the file
```

---

## Command Chains

| Separator | Behavior |
|---|---|
| `;` | run in sequence regardless of result |
| `&&` | run next command only if previous succeeded (exit 0) |
| `\|\|` | run next command only if previous failed (exit ≠ 0) |

```bash
make && make install                    # install only on successful build
test -f /tmp/lock || touch /tmp/lock    # create lock file if absent
mkdir backup && cp -r data backup/      # copy only if directory was created
```

A `&&` chain replaces a simple `if`:

```bash
[ -d /backup ] && rsync -a /data/ /backup/
```

---

## Conditional Mail to the Administrator

The objective: know how to send conditional notifications to root. Use `mail` or `mailx`:

```bash
df -h | grep -E '9[0-9]%|100%' && \
    df -h | mail -s "Disk usage critical on $(hostname)" root
```

With `if`:

```bash
if ! systemctl is-active --quiet apache2
then
    echo "Apache down at $(date)" | mail -s "ALERT: apache2 down" root
fi
```

An MTA (postfix, sendmail, exim) must be running on the server for mail to actually be delivered.

---

## Script Location and Permissions

| Path | Use |
|---|---|
| `~/bin` or `~/.local/bin` | personal scripts |
| `/usr/local/bin` | scripts for all users |
| `/usr/local/sbin` | administrative scripts requiring root |
| `/etc/cron.daily/` etc. | scripts run by cron |

Make a script executable:

```bash
chmod +x myscript.sh         # for everyone
chmod 755 myscript.sh        # rwxr-xr-x
chmod 700 myscript.sh        # owner only
```

Short-name execution works only when the script's directory is in `$PATH`. Otherwise use the full or relative path.

### SUID on Scripts

The Linux kernel ignores the SUID bit on shell scripts for security reasons (race conditions during interpretation). If you need a regular user to run something as root, use:

- `sudo` with a specific rule in `/etc/sudoers`
- A C wrapper that calls the script
- `setcap` for specific capabilities

---

## Quick Reference

```bash
# Shebang (first line of script)
#!/bin/bash
#!/bin/sh
#!/usr/bin/env python3

# Script parameters
$0  $1  $2  $#  $@  $*  $?  $$  $!

# Command substitution
result=$(command)
result=`command`      # older form

# test
test -f "$FILE"       # regular file
[ -d "$DIR" ]         # directory
[ -z "$VAR" ]         # empty string
[ "$A" -lt "$B" ]     # numeric: less than
[ "$A" -nt "$B" ]     # file A newer than B
[ "$A" -ef "$B" ]     # same inode (hard link)
echo $?               # check last exit code

# Logical operators inside test
[ ! EXPR ]                    # NOT
[ EXPR1 -a EXPR2 ]            # AND
[ EXPR1 -o EXPR2 ]            # OR

# if
if [ COND ]; then CMD; elif [ COND2 ]; then CMD2; else CMD3; fi

# case
case "$VAR" in
  pat1) CMDS ;;
  pat2|pat3) CMDS ;;
  *) CMDS ;;
esac
shopt -s nocasematch   # case-insensitive matching

# for
for VAR in LIST; do CMDS; done
for (( i=0; i<N; i++ )); do CMDS; done

# while / until
while [ COND ]; do CMDS; done
until [ COND ]; do CMDS; done

# read / seq / exec
read -p "Prompt: " VAR
seq 1 10
for i in $(seq 1 10); do ...; done
exec CMD          # replace shell with CMD
exec > file.txt   # redirect all script output

# mapfile
mapfile -t ARR < file    # one array element per line

# Command chains
CMD1 && CMD2      # CMD2 only if CMD1 succeeded
CMD1 || CMD2      # CMD2 only if CMD1 failed
CMD1 ; CMD2       # always run both

# Permissions
chmod +x script.sh
chmod 755 script.sh

# set / shopt options
set -e    # exit on error
set -f    # disable globbing
set -x    # trace execution
shopt -s nocasematch    # case-insensitive matching
shopt -u nocasematch    # disable
```

---

## Exam Questions

1. What exit code means success? → Zero.
2. How is `==` inside `test` different from `-eq`? → `==` compares strings; `-eq` compares integers.
3. How to test that a variable is empty? → `[ -z "$VAR" ]`.
4. How to test that a path is a directory? → `[ -d "$PATH" ]`.
5. How to test that file A is newer than file B? → `[ "$A" -nt "$B" ]`.
6. What is a shebang and where does it go? → `#!interpreter` on the very first line of the script.
7. How to do case-insensitive matching in `case`? → `shopt -s nocasematch` before the construct.
8. How to close a `case` block? → `esac`.
9. How to close an `if` block? → `fi`.
10. Difference between `&&` and `;`? → `&&` runs the next command only on success; `;` always runs it.
11. Why does `test 1 > 2` return true? → `>` is a string operator (and is intercepted by the shell as a redirect, creating a file named `2`). `test 1` evaluates a non-empty string as true.
12. How to ensure stable alphabetical ordering regardless of locale? → Set `LANG=C` before the comparison.
13. What does `mapfile -t LIST < file` do? → Reads the file into array `LIST`, one line per element, trimming trailing newlines.
14. Which `set` option exits the script on any error? → `-e`.
15. Do `shopt` changes inside a script affect the parent shell? → No — the script runs in a subshell.
16. What does `exec > /tmp/log.txt 2>&1` do in a script? → Redirects all subsequent stdout and stderr to the file without replacing the shell.
17. How to send a one-line alert to root? → `echo "message" | mail -s "subject" root`.
18. Why does the kernel ignore SUID on shell scripts? → Race condition risk during shebang interpretation.

---

## Exercises

### Exercise 1 — test for File Comparison

How do you use `test` to check whether the file in `$FROM` is newer than the file in `$TO`?

<details>
<summary>Answer</summary>

```bash
test "$FROM" -nt "$TO"
```

Returns exit code 0 if `$FROM` is newer. The `-nt` flag stands for "newer than". Double quotes protect against empty variables.

</details>

---

### Exercise 2 — Infinite while and Missing Increment

This script should print numbers 0 through 9, but instead prints 0 forever. Fix it.

```bash
#!/bin/bash
COUNTER=0
while [ $COUNTER -lt 10 ]
do
    echo $COUNTER
done
```

<details>
<summary>Answer</summary>

The loop body never increments `COUNTER`, so the condition stays true forever.

Fixed:

```bash
#!/bin/bash
COUNTER=0
while [ $COUNTER -lt 10 ]
do
    echo $COUNTER
    COUNTER=$(( $COUNTER + 1 ))
done
```

Alternative increment forms: `(( COUNTER++ ))` or `let COUNTER++`.

</details>

---

### Exercise 3 — Different Sort Order on Two Machines

The same script sorts a list of usernames differently on two machines:

Machine 1:
```
carol
Dave
emma
Frank
Grace
henry
```

Machine 2:
```
Dave
Frank
Grace
carol
emma
henry
```

Why, and how do you fix it?

<details>
<summary>Answer</summary>

Sorting depends on the system locale. Different locales apply different rules for comparing upper- and lowercase letters. Fix:

```bash
LANG=C sort users.txt
```

Machine 1 likely uses a UTF-8 locale (e.g., `en_US.UTF-8`) that interleaves upper- and lowercase. Machine 2 uses `C`/`POSIX`, which places all uppercase ASCII letters before all lowercase.

</details>

---

### Exercise 4 — Script Arguments into a Bash Array

How do you populate a Bash array with all the command-line arguments of a script?

<details>
<summary>Answer</summary>

```bash
PARAMS=( "$@" )
```

Or equivalently:

```bash
PARAMS=( $* )
```

`"$@"` is preferred — it preserves each argument as a separate element even when arguments contain spaces. `$*` (unquoted) splits on `IFS` and can lose argument boundaries.

</details>

---

### Exercise 5 — Why does `test 1 > 2` return true?

<details>
<summary>Answer</summary>

Two reasons:

1. The `>` operator inside `test` is for **string** comparison, not numeric. For numbers use `-lt`, `-gt`, etc.
2. The shell intercepts `>` as a **redirect** before `test` sees it. The actual command is `test 1` (with stdout redirected to a file named `2`). `test 1` evaluates a non-empty string as true.

For correct numeric comparison: `[ 1 -gt 2 ]`. For correct string comparison escape the operator: `test 1 \> 2`.

</details>

---

### Exercise 6 — Temporarily Change IFS to Newline

How do you change the field separator to newline and restore it afterwards?

<details>
<summary>Answer</summary>

```bash
OLDIFS=$IFS
IFS=$'\n'

# ... commands that rely on newline as separator ...

IFS=$OLDIFS
```

`$'\n'` is ANSI-C quoting in Bash — backslash sequences (`\n`, `\t`, etc.) are interpreted as the actual control characters. Without the `$`, the literal two-character string `\n` would be assigned.

</details>

---

*LPIC-1 Study Notes | Topic 105: Shells and Shell Scripting*
