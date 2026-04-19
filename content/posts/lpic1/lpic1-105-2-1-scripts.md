---
title: "LPIC-1 105.2 Lesson 1 — Customize or Write Simple Scripts"
date: 2026-04-19
description: "Shebang, source and subshell, variables, arrays, arithmetic, echo/printf, test, if/case, for/while/until, read/seq/exec, command chains, mail, script permissions. LPIC-1 exam topic 105.2, lesson 1."
tags: ["Linux", "LPIC-1", "bash", "scripting", "test", "loops", "case"]
categories: ["LPIC-1"]
page_lang: "en"
lang_pair: "/posts/lpic1/ru/lpic1-105-2-1-scripts/"
---

> **Exam weight: 4** — LPIC-1 v5, Exam 102

## What You Need to Know

From the official LPIC-1 objectives:

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

```bash
#!/bin/bash
echo "Hello, world"
```

Common options:

- `#!/bin/sh`: POSIX compatibility, minimal feature set
- `#!/bin/bash`: Bash extensions, arrays, `[[ ]]`
- `#!/usr/bin/env python3`: find the interpreter via `env` using `$PATH`

There are two ways to run a script. By filename (`./script.sh`) — the kernel reads the shebang and starts the interpreter. By explicit interpreter call (`bash script.sh`) — the shebang is ignored and the named program runs.

---

## Running a Script, Comments, and Subshell

Lines inside a script that begin with `#` are comments and are ignored by the interpreter. Exception: the first shebang line `#!`. Empty lines are also skipped. Multiple commands can go on one line separated by semicolons, but in Bash a newline is equivalent to a semicolon, so each command on its own line is more readable.

The `.sh` suffix has no special meaning to the interpreter — filenames are free-form. The extension is useful only for quickly identifying scripts when browsing directories.

The `echo` command adds a newline at the end of its output by default. The `-n` option suppresses the trailing newline so the next output appears on the same line:

```bash
echo -n "Now: "
date +%H:%M
```

For other users to run the script, they need read permission. `chmod o+r script.sh` grants read access to everyone. Read permission is needed when the script is run via `bash script.sh`. Running by filename additionally requires the `x` bit (see [Script Location and Permissions](#script-location-and-permissions)).

When run normally, the script executes in a new child shell (subshell). This protects the current session: variables and directory changes made inside the script do not affect the parent shell. This behavior is desirable for most tasks.

To execute a script's instructions directly in the current session — without a subshell — use:

```bash
source script.sh
. script.sh
```

A space between the dot and the filename is required. This is useful when a script sets environment variables or functions that should persist in the current shell (typical use: profile files like `.bashrc`, `.profile`).

The `exec` command before a script or another command completely replaces the current shell process. After the script finishes, the session itself closes:

```bash
exec ./long_task.sh
# execution never reaches this line
```

After a normal script run, the script's exit code is available in `$?`.

---

## Basic sh Syntax

### Variables

Assignment — no spaces around the equals sign; access via `$`:

```bash
NAME="Maks"
echo "Hello, $NAME"
```

By convention variable names are uppercase, but this is not required. A name cannot begin with a digit or other non-alphanumeric character.

Variable value length (number of characters) is returned by prefixing `#` inside curly braces:

```bash
OS=$(uname -o)
echo $OS         # GNU/Linux
echo ${#OS}      # 9
```

Double quotes expand variables and command substitutions; single quotes pass everything literally.

### Script Parameters

Inside a script, positional parameters are available as variables:

`$0`: the script name itself  
`$1`, `$2`, …, `$9`: first, second, and so on arguments  
`$#`: number of arguments passed  
`$@`: all arguments as a list, each as a separate word with `"$@"`  
`$*`: all arguments as a single string  
`$?`: exit code of the last executed command  
`$$`: PID of the current script  
`$!`: PID of the last background process

```bash
#!/bin/bash
echo "Script: $0"
echo "First argument: $1"
echo "Total arguments: $#"
```

Parameters with numbers above nine require curly braces: `${10}`, `${11}`, and so on. Writing `$10` is interpreted as `$1` followed by the character `0`.

### Bash Arrays

Bash supports one-dimensional arrays. An array can be declared explicitly or initialized immediately:

```bash
declare -a SIZES
SIZES=( 1048576 1073741824 )
```

Indexing starts at zero. Reading an element requires curly braces and square-bracket indices:

```bash
echo ${SIZES[0]}     # 1048576
echo ${SIZES[1]}     # 1073741824
```

Writing an element does not require curly braces:

```bash
SIZES[0]=2097152
```

The length of an individual element is returned by `${#ARR[N]}`. The total number of elements in the array: `${#ARR[@]}` or `${#ARR[*]}`:

```bash
echo ${#SIZES[0]}    # 7 (length of string "2097152")
echo ${#SIZES[@]}    # 2 (total elements)
```

An array is conveniently created from command output — each word separated by space, tab, or newline becomes an element:

```bash
FS=( $(cut -f 2 < /proc/filesystems) )
echo ${FS[0]} ${FS[1]} ${FS[2]}
```

The field separator is controlled by the `IFS` variable (Input Field Separator). Default: space, tab, newline. To split only on newline:

```bash
IFS=$'\n'
```

---

## Command Substitution

Command substitution takes a program's standard output and substitutes it at the call site. Two forms are supported. Backticks come from POSIX; the `$(...)` form is modern, more readable, and supports nesting.

```bash
TODAY=$(date +%Y-%m-%d)
echo "Today: $TODAY"

# Equivalent with backticks
TODAY=`date +%Y-%m-%d`

# Nested substitutions
KERNEL_DIR=/lib/modules/$(uname -r)
```

The substitution result is usually stored in a variable or passed directly to another command:

```bash
mkdir backup-$(date +%F)
USER_COUNT=$(wc -l < /etc/passwd)
```

---

## Arithmetic

Bash handles integers two ways. The old POSIX approach via `expr`; the modern built-in `$(( ))`.

```bash
SUM=`expr $VAL1 + $VAL2`
SUM=$(( $VAL1 + $VAL2 ))
```

Spaces between numbers and the operator are required in `expr`. Inside `$(( ))` spaces are optional and the operators `+`, `-`, `*`, `/`, `%`, `**` (power) are supported:

```bash
echo $(( 1024 ** 2 ))    # 1048576
echo $(( 1024 ** 3 ))    # 1073741824
SIZES=( $((1024**2)) $((1024**3)) )
```

Command substitution can be combined with arithmetic — for example, get free RAM bytes from the second line of `/proc/meminfo`:

```bash
FREE=$(( 1000 * `sed -nre '2s/[^[:digit:]]//gp' < /proc/meminfo` ))
echo "Free: $(( $FREE / 1024**2 )) MB"
```

Inside `$(( ))`, variable names can be written without `$`: `$(( VAL1 + VAL2 ))` works the same.

---

## Script Output: echo and printf

### echo and Escape Sequences

The `echo` command prints a string and adds a newline at the end. The `-n` option suppresses the trailing newline. The `-e` option enables interpretation of backslash escape sequences:

`\n`: newline  
`\t`: tab  
`\\`: backslash itself  
`\"`: double quote

```bash
echo -e "Name:\tMaks\nCity:\tSydney"
```

When using `-e` always wrap the string in quotes — otherwise the shell may consume the backslashes before `echo` sees them.

### printf

The `printf` command formats output according to a template, like the C function of the same name. The first argument is the format string; the rest are values to substitute into the markers.

`%s`: string  
`%d`: integer  
`%f`: floating-point number  
`%x`: hexadecimal  
`%%`: literal percent sign

```bash
OS=$(uname -o)
FREE_MB=1491
printf "OS:\t%s\nMemory:\t%d MB\n" "$OS" "$FREE_MB"
```

Key differences between `printf` and `echo`:

- No automatic trailing newline — `\n` in the template is required
- Markers are replaced in order from the arguments
- If there are more values than markers, the template repeats
- The template can be saved in a variable to switch output formats

```bash
FMT_TXT='Name: %s, age: %d\n'
FMT_CSV='%s,%d\n'
printf "$FMT_TXT" "Maks" 30
printf "$FMT_CSV" "Maks" 30
```

Full format documentation: `man 3 printf`.

---

## Return Values and the test Command

### Exit Code

Every command returns an integer from 0 to 255 when it finishes. Zero means success; anything else is an error. The number is in `$?` immediately after:

```bash
ls /etc > /dev/null
echo $?    # 0

ls /no_such_dir 2>/dev/null
echo $?    # non-zero, typically 2
```

A script sets its exit code with `exit N` (0–255).

### File Checks

The `test` command evaluates a condition and returns 0 for true, 1 for false. The equivalent square-bracket form `[ ... ]` is used more often. Spaces around every element inside the brackets are mandatory.

`-e FILE`: file or directory exists  
`-f FILE`: regular file  
`-d FILE`: directory  
`-L FILE`: symbolic link  
`-r FILE`: readable  
`-w FILE`: writable  
`-x FILE`: executable  
`-s FILE`: non-zero size  
`FILE1 -nt FILE2`: FILE1 is newer than FILE2  
`FILE1 -ot FILE2`: FILE1 is older than FILE2

```bash
test -f /etc/passwd
[ -f /etc/passwd ]
[ -d /etc ] && echo "Directory found"
```

### String Comparisons

`STR1 = STR2`: strings are equal  
`STR1 != STR2`: strings differ  
`-z STR`: string is empty  
`-n STR`: string is non-empty

### Numeric Comparisons

`-eq`: equal  
`-ne`: not equal  
`-lt`: less than  
`-le`: less or equal  
`-gt`: greater than  
`-ge`: greater or equal

```bash
[ "$AGE" -ge 18 ] && echo "Adult"
```

In Bash the extended form `[[ ... ]]` is safer: variables don't need quoting, glob patterns and regex are supported, and `&&` and `||` can be used inside. For arithmetic the `(( ... ))` form is convenient.

```bash
if [[ "$FILE" == *.log ]]; then echo "log file"; fi
if (( COUNT > 10 )); then echo "many"; fi
```

---

## Conditional Constructs

### if / then / elif / else

```bash
if [ -f /etc/passwd ]; then
    echo "File found"
elif [ -d /etc/passwd ]; then
    echo "It's a directory"
else
    echo "Not found"
fi
```

The `if` condition is any command — its exit code is used, not its output. So `if grep -q root /etc/passwd; then ... fi` works correctly.

### case

```bash
case "$1" in
    start)
        echo "Starting service"
        ;;
    stop)
        echo "Stopping service"
        ;;
    restart|reload)
        echo "Reloading"
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|reload}"
        exit 1
        ;;
esac
```

Matching in `case` uses glob patterns, not regular expressions. Each branch ends with `;;`. Closed with `esac`.

---

## Loops: for, while, until

The `for` loop iterates over a list of elements:

```bash
for i in 1 2 3 4 5; do
    echo "Number $i"
done

for f in *.txt; do
    echo "File: $f"
done

for i in $(seq 1 10); do
    echo $i
done
```

Bash also supports C-style syntax:

```bash
for ((i=0; i<10; i++)); do
    echo $i
done
```

The `while` loop repeats a block as long as the condition is true:

```bash
COUNT=0
while [ $COUNT -lt 5 ]; do
    echo $COUNT
    COUNT=$((COUNT + 1))
done

# Read a file line by line
while read LINE; do
    echo "$LINE"
done < input.txt
```

The `until` loop works as the mirror image — it repeats while the condition is false:

```bash
until ping -c1 -W1 host >/dev/null 2>&1; do
    sleep 5
done
echo "Host is up"
```

---

## read, seq, exec

### read

Reads a line from standard input and stores it in one or more variables. If multiple variables are given, words are split on `IFS`.

```bash
read -p "Enter name: " NAME
echo "Hello, $NAME"

read FIRST LAST <<< "John Smith"
echo "$LAST, $FIRST"
```

If no variable name is given, the input is stored in `REPLY`:

```bash
echo "Continue (y/n)?"
read
echo "Answer: $REPLY"
```

When there are more words than variable names, the extra words are appended to the last variable.

Useful options:

`-p TEXT`: show a prompt  
`-s`: silent input (for passwords)  
`-t SEC`: input timeout  
`-n N`: read exactly N characters  
`-r`: do not interpret backslashes  
`-a ARRAY`: read words into a Bash array

### seq

Prints a numeric sequence.

```bash
seq 5         # 1 2 3 4 5
seq 2 8       # 2 3 4 5 6 7 8
seq 1 2 9     # 1 3 5 7 9 (step 2)
seq -w 1 10   # zero-padded: 01 02 ... 10
seq -s, 1 5   # 1,2,3,4,5 (custom separator)
```

In a `for` loop:

```bash
for i in $(seq 1 100); do
    curl -s "https://example.com/page$i" -o "page$i.html"
done
```

### exec

`exec` has two modes. With an argument it replaces the current process with the named program — the script does not continue:

```bash
exec ls /tmp
echo "this line never runs"
```

Without an argument (with redirection only), `exec` changes the file descriptors of the current shell. This is handy when all subsequent output should go to a log:

```bash
#!/bin/bash
exec >> /var/log/myscript.log 2>&1
echo "This and everything after goes to the log"
date
```

---

## Command Chains

Multiple commands can be joined on one line. The separator determines execution logic.

`cmd1 ; cmd2`: run both sequentially, ignoring the result  
`cmd1 && cmd2`: run `cmd2` only if `cmd1` succeeded (exit 0)  
`cmd1 || cmd2`: run `cmd2` only if `cmd1` failed (non-zero exit)

```bash
mkdir backup && cp *.conf backup/
ping -c1 host >/dev/null || echo "Host unreachable"
[ -f config ] && source config || echo "config missing"
```

These operators replace short `if` statements. Long chains are better rewritten as `if` blocks.

---

## Conditional Mail to the Administrator

Standard practice: notify root when something goes wrong. The message is piped to `mail`.

```bash
backup.sh || echo "Backup failed on $(hostname)" | mail -s "Backup error" root
```

Checking a service:

```bash
if ! systemctl is-active --quiet sshd; then
    echo "SSH stopped on $(hostname) at $(date)" | mail -s "ALERT: sshd" root
fi
```

Disk usage threshold:

```bash
USAGE=$(df / | awk 'NR==2 {print $5}' | tr -d %)
if [ "$USAGE" -gt 90 ]; then
    df -h | mail -s "Root nearly full on $(hostname)" root
fi
```

The `mail` command delivers to the local root mailbox when an MTA (postfix, sendmail, exim) or local delivery agent is configured.

---

## Script Location and Permissions

Common places to store scripts:

`~/bin` or `~/.local/bin`: personal user scripts; many distros add these to `$PATH` automatically  
`/usr/local/bin`: shared local scripts for all users  
`/usr/local/sbin`: administrative scripts accessible only to root  
`/etc/cron.daily`, `/etc/cron.hourly`: scripts run periodically  
`/etc/init.d`: legacy SysV service init scripts

Make a script executable:

```bash
chmod +x myscript.sh
chmod 755 myscript.sh   # rwxr-xr-x
chmod 750 myscript.sh   # rwxr-x--- (owner and group only)
```

For a script to be callable by short name, its directory must be in `$PATH`. Otherwise specify the full or relative path.

### SUID on Scripts

The SUID bit (octal 4000) normally gives the process the owner's privileges at runtime. Set it with:

```bash
chmod u+s script.sh
chmod 4755 script.sh
```

The Linux kernel ignores SUID on interpreted scripts for security reasons (race-condition vulnerability during shebang interpretation). The bit can be set but has no effect. SUID only works on compiled binaries. If a script needs root privileges, configure `sudo` via `/etc/sudoers`:

```
# /etc/sudoers
maks ALL=(root) NOPASSWD: /usr/local/sbin/backup.sh
```

---

## Quick Reference

| Construct | Purpose |
|---|---|
| `#!/bin/bash` | Shebang for bash |
| `#!/bin/sh` | Shebang for POSIX shell |
| `# comment` | Ignored by the interpreter |
| `$0`, `$1`…`$9` | Script name, positional arguments |
| `${10}`, `${11}` | Parameters with index above 9 |
| `$#` | Number of arguments |
| `$@`, `$*` | All arguments |
| `$?` | Exit code of last command |
| `$$` | PID of current process |
| `$!` | PID of last background process |
| `${#VAR}` | Length of variable value |
| `$(cmd)` or `` `cmd` `` | Command substitution |
| `$(( EXPR ))` | Bash integer arithmetic |
| `expr A + B` | POSIX arithmetic |
| `declare -a ARR` | Declare an array |
| `ARR=( a b c )` | Populate an array |
| `${ARR[0]}` | Read an element |
| `${#ARR[@]}` | Number of elements in array |
| `IFS=$'\n'` | Field separator: newline only |
| `source FILE` or `. FILE` | Run script in current session |
| `exec CMD` | Replace current process |
| `exec >> FILE` | Redirect script output |
| `echo -n` | Output without trailing newline |
| `echo -e "\t\n"` | Interpret escape sequences |
| `printf "%s\n" "$VAR"` | Formatted output |
| `test COND`, `[ COND ]` | Evaluate condition |
| `[[ COND ]]` | Extended Bash test |
| `(( EXPR ))` | Bash arithmetic test |
| `if ... then ... elif ... else ... fi` | Conditional block |
| `case ... in ... esac` | Multiple branch select |
| `for VAR in LIST; do ... done` | Iterate over a list |
| `while COND; do ... done` | Loop with precondition |
| `until COND; do ... done` | Loop with inverted condition |
| `read VAR` | Read a line from stdin |
| `read` (no name) | Store in `REPLY` |
| `read -p "?" -s VAR` | Read password with prompt |
| `seq START STEP END` | Numeric sequence |
| `cmd1 && cmd2` | Run on success |
| `cmd1 \|\| cmd2` | Run on failure |
| `chmod +x FILE` | Make executable |
| `chmod 4755 FILE` | SUID + rwxr-xr-x |
| `mail -s "subject" root` | Send mail to the administrator |

---

## Exam Questions

1. What is the shebang and where does it go? → `#!interpreter` on the very first line.
2. Practical difference between `#!/bin/sh` and `#!/bin/bash`? → `sh` is POSIX-only; `bash` adds arrays, `[[ ]]`, and `$(( ))`.
3. How do you get the exit code of the last command? → `$?`.
4. What does exit code 0 mean? → Success.
5. Which command substitution form is preferred — backticks or `$()`? → `$()`: supports nesting, more readable.
6. Difference between `&&`, `||`, and `;`? → `&&` on success; `||` on failure; `;` always.
7. How do you send mail to root if a command failed? → `cmd || echo "msg" | mail -s "subject" root`
8. Which command reads a line from stdin into a variable? → `read`.
9. Into which variable does `read` store input when no name is given? → `REPLY`.
10. Which `read` option hides input for passwords? → `-s`.
11. What does `seq 1 2 7` print? → `1 3 5 7`.
12. What does `exec` do with an argument vs without one? → With: replaces the current process. Without (with redirect): redirects the shell's file descriptors.
13. Difference between `bash script.sh`, `source script.sh`, and `. script.sh`? → `bash` runs in a subshell; `source`/`.` run in the current session.
14. How do you make a script executable in octal notation? → `chmod 755 script.sh`.
15. Where are personal, shared, and administrative scripts stored? → `~/bin`, `/usr/local/bin`, `/usr/local/sbin`.
16. Does SUID work on shell scripts in modern Linux? → No — the kernel ignores it.
17. Which `test` operators check file existence, directory, and executability? → `-e`, `-d`, `-x`.
18. Difference between `[ ]` and `[[ ]]` in Bash? → `[[ ]]` is a Bash extension: no quoting required, supports patterns and regex, allows `&&`/`||` inside.
19. How do you loop over all files in a directory with `for`? → `for f in /dir/*; do ...; done`.
20. How do you get the length of a variable's value? → `${#VAR}`.
21. How do you access the tenth positional parameter? → `${10}`.
22. Difference between `echo -e` and plain `echo`? → `-e` interprets `\n`, `\t`, etc.
23. Difference between `echo` and `printf` regarding line endings? → `echo` always adds a newline; `printf` only if the template contains `\n`.
24. How do you declare an array and access its elements? → `ARR=( a b c )`; access with `${ARR[0]}`.
25. How do you get the total number of elements in an array? → `${#ARR[@]}`.
26. What does `IFS` store and why change it? → The field separator for word splitting; set to `$'\n'` to prevent splitting on spaces.
27. How do you calculate an arithmetic expression with the Bash built-in? → `$(( EXPR ))`.
28. What does `exec` do before a script? → Replaces the current shell with the script; the session ends when the script finishes.

---

## Exercises

### Guided Exercise 1 — Reading a Password without Echo

The `-s` option of `read` is useful for password input: the typed text is not shown on screen. How do you store the user's input in the variable `PASSWORD`?

<details>
<summary>Answer</summary>

```bash
read -s PASSWORD
```

> `-s` is often combined with `-p` for a prompt and `-t` for a timeout. Full interactive form: `read -s -p "Password: " PASSWORD`. Add `echo` immediately after to print a newline — Enter with suppressed echo does not emit one.

</details>

---

### Guided Exercise 2 — Saving whoami Output to a Variable

How do you save the output of `whoami` into the variable `WHO` inside a Bash script?

<details>
<summary>Answer</summary>

```bash
WHO=`whoami`
```

or

```bash
WHO=$(whoami)
```

> The `$()` form is preferred: clearer and supports nesting (e.g., `LOG="$(whoami)-$(date +%F).log"`). Backticks are retained for compatibility with older POSIX scripts.

</details>

---

### Guided Exercise 3 — Conditional Execution with an Operator

Which Bash operator should appear between `apt-get dist-upgrade` and `systemctl reboot` if root wants to reboot only when the upgrade completes successfully?

<details>
<summary>Answer</summary>

The `&&` operator:

```bash
apt-get dist-upgrade && systemctl reboot
```

> `&&` runs the right-hand command only if the left-hand command returned exit code 0. The symmetric `||` runs the right-hand command on a non-zero code. Use `;` or a newline if the reboot should happen regardless.

</details>

---

### Explorational Exercise 1 — Permission Denied When Running a Script

When trying to run a freshly created Bash script the user gets:

```
bash: ./script.sh: Permission denied
```

The file was created by the same user. What is the likely cause?

<details>
<summary>Answer</summary>

The file does not have the execute bit set.

> Running via `./script.sh` requires read **and** execute permissions. A newly created file has no `x` bit by default. Fix with `chmod +x script.sh`. Alternative without the `x` bit: call the interpreter explicitly — `bash script.sh`. That requires only read permission because the file is read by the interpreter, not executed by the kernel.

</details>

---

### Explorational Exercise 2 — Identifying the Call Name via a Symbolic Link

Let `do.sh` be an executable script and `undo.sh` a symbolic link to it. How can the script determine from within itself which name was used to call it?

<details>
<summary>Answer</summary>

The special variable `$0` contains the filename under which the script was invoked.

```bash
#!/bin/bash
case "$(basename "$0")" in
    do.sh)    echo "Mode: apply" ;;
    undo.sh)  echo "Mode: undo" ;;
    *)        echo "Unknown call mode: $0" ;;
esac
```

> This technique (one script, multiple symbolic links) is widely used in Unix. Classic example: BusyBox — a single binary that behaves like `ls`, `cat`, `grep`, and dozens of other commands depending on `$0`. `basename` strips the path and leaves only the filename.

</details>

---

### Explorational Exercise 3 — Conditional Mail to Root on Non-Zero Exit Code

On a system with a configured mail service the command

```bash
mail -s "Maintenance Error" root <<<"Scheduled task error"
```

sends a notification to root. Write an `if` construct that executes this `mail` command if the exit code of the previous command is non-zero.

<details>
<summary>Answer</summary>

```bash
if [ "$?" -ne 0 ]; then mail -s "Maintenance Error" root <<<"Scheduled task error"; fi
```

> `[ "$?" -ne 0 ]` compares `$?` with zero. Quotes around `"$?"` guard against empty-value errors — though `$?` always holds a number. Alternative compact form via `||`: `previous_command || mail -s "Maintenance Error" root <<<"Scheduled task error"`. Drawback of `||`: it must be chained to the previous command on the same line.

</details>

---

*LPIC-1 Study Notes | Topic 105: Shells and Shell Scripting*
