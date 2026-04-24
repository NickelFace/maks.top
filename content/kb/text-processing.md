---
title: "Text Processing"
description: "grep, awk, sed, cut, sort, uniq, xargs — text processing on the command line"
icon: "📝"
group: "Linux Core"
tags: ["grep", "awk", "sed", "xargs", "Linux"]
date: 2026-04-14
page_lang: "en"
lang_pair: "/kb/ru/text-processing/"
---

<div class="intro-card">
Linux text processing tools: <strong>grep</strong> (search), <strong>awk</strong> (fields and programs), <strong>sed</strong> (stream editor), <strong>cut / sort / uniq / xargs</strong> — the building blocks of any pipe pipeline.
</div>

## grep

<div class="ref-panel">
<div class="ref-panel-head">grep flags</div>
<div class="ref-panel-body">
<table class="cheat-table">
<thead><tr><th>Flag</th><th>Description</th></tr></thead>
<tbody>
<tr><td class="mono">-i</td><td class="desc">Case-insensitive match</td></tr>
<tr><td class="mono">-r / -R</td><td class="desc">Recursive search (R follows symlinks)</td></tr>
<tr><td class="mono">-l</td><td class="desc">Print only filenames with matches</td></tr>
<tr><td class="mono">-L</td><td class="desc">Files WITHOUT matches</td></tr>
<tr><td class="mono">-n</td><td class="desc">Show line numbers</td></tr>
<tr><td class="mono">-c</td><td class="desc">Count matching lines</td></tr>
<tr><td class="mono">-v</td><td class="desc">Invert match</td></tr>
<tr><td class="mono">-w</td><td class="desc">Match whole word</td></tr>
<tr><td class="mono">-x</td><td class="desc">Match whole line</td></tr>
<tr><td class="mono">-E</td><td class="desc">Extended regex (egrep)</td></tr>
<tr><td class="mono">-P</td><td class="desc">Perl-compatible regex (PCRE)</td></tr>
<tr><td class="mono">-F</td><td class="desc">Fixed string (no regex)</td></tr>
<tr><td class="mono">-o</td><td class="desc">Print only the matching part of the line</td></tr>
<tr><td class="mono">-A N</td><td class="desc">N lines after each match</td></tr>
<tr><td class="mono">-B N</td><td class="desc">N lines before each match</td></tr>
<tr><td class="mono">-C N</td><td class="desc">N lines around each match</td></tr>
<tr><td class="mono">-m N</td><td class="desc">Stop after N matches</td></tr>
<tr><td class="mono">--include="*.py"</td><td class="desc">Search only in .py files</td></tr>
<tr><td class="mono">--exclude-dir=".git"</td><td class="desc">Exclude a directory</td></tr>
</tbody>
</table>
</div>
</div>

<div class="ref-panel">
<div class="ref-panel-head">grep examples</div>
<div class="ref-panel-body">
<table class="cheat-table">
<thead><tr><th>Command</th><th>Description</th></tr></thead>
<tbody>
<tr><td class="mono">grep -rn "TODO" src/ --include="*.py"</td><td class="desc">Find TODO in Python files</td></tr>
<tr><td class="mono">grep -E "^(ERROR|WARN)" app.log</td><td class="desc">Lines starting with ERROR or WARN</td></tr>
<tr><td class="mono">grep -oP "(?&lt;=Host: )\S+" access.log</td><td class="desc">Extract Host headers</td></tr>
<tr><td class="mono">grep -v "^#" /etc/ssh/sshd_config | grep -v "^$"</td><td class="desc">Config without comments and blank lines</td></tr>
<tr><td class="mono">grep -c "ERROR" app.log</td><td class="desc">Count error lines</td></tr>
</tbody>
</table>
</div>
</div>

## awk

<div class="ref-panel">
<div class="ref-panel-head">Core constructs</div>
<div class="ref-panel-body">
<table class="cheat-table">
<thead><tr><th>Expression</th><th>Description</th></tr></thead>
<tbody>
<tr><td class="mono">awk '{print $1}'</td><td class="desc">First field (whitespace delimiter)</td></tr>
<tr><td class="mono">awk '{print $NF}'</td><td class="desc">Last field</td></tr>
<tr><td class="mono">awk '{print $1, $3}'</td><td class="desc">Fields 1 and 3 separated by space</td></tr>
<tr><td class="mono">awk -F: '{print $1}' /etc/passwd</td><td class="desc">Use : as delimiter</td></tr>
<tr><td class="mono">awk 'NR==5'</td><td class="desc">Print line 5</td></tr>
<tr><td class="mono">awk 'NR>=3 && NR<=7'</td><td class="desc">Lines 3–7</td></tr>
<tr><td class="mono">awk '/pattern/'</td><td class="desc">Lines matching pattern</td></tr>
<tr><td class="mono">awk '!/pattern/'</td><td class="desc">Lines NOT matching</td></tr>
<tr><td class="mono">awk '$3 > 100 {print}'</td><td class="desc">Lines where field 3 > 100</td></tr>
<tr><td class="mono">awk '{sum+=$1} END{print sum}'</td><td class="desc">Sum first column</td></tr>
<tr><td class="mono">awk 'END{print NR}'</td><td class="desc">Line count (like wc -l)</td></tr>
<tr><td class="mono">awk '{gsub(/old/,"new"); print}'</td><td class="desc">Global substitution on each line</td></tr>
<tr><td class="mono">awk '!seen[$0]++'</td><td class="desc">Remove duplicates (preserve order)</td></tr>
<tr><td class="mono">awk 'BEGIN{FS=":"; OFS="\t"} {print $1,$3}'</td><td class="desc">Input and output field separators</td></tr>
<tr><td class="mono">awk '{a[$1]+=$2} END{for(k in a) print k,a[k]}'</td><td class="desc">Group by key with sum</td></tr>
</tbody>
</table>
</div>
</div>

Built-in awk variables: `NR` (line number) · `NF` (field count) · `FS` (input separator) · `OFS` (output separator) · `RS` (record separator) · `ORS` (output record separator) · `FILENAME`

## sed

<div class="ref-panel">
<div class="ref-panel-head">sed commands</div>
<div class="ref-panel-body">
<table class="cheat-table">
<thead><tr><th>Expression</th><th>Description</th></tr></thead>
<tbody>
<tr><td class="mono">sed 's/old/new/'</td><td class="desc">Replace first occurrence per line</td></tr>
<tr><td class="mono">sed 's/old/new/g'</td><td class="desc">Replace all occurrences</td></tr>
<tr><td class="mono">sed 's/old/new/gi'</td><td class="desc">Case-insensitive replacement</td></tr>
<tr><td class="mono">sed -i 's/old/new/g' file</td><td class="desc">In-place replacement</td></tr>
<tr><td class="mono">sed -i.bak 's/.../.../' file</td><td class="desc">In-place with .bak backup</td></tr>
<tr><td class="mono">sed -n '5p'</td><td class="desc">Print only line 5</td></tr>
<tr><td class="mono">sed -n '3,7p'</td><td class="desc">Lines 3–7</td></tr>
<tr><td class="mono">sed -n '/pattern/p'</td><td class="desc">Lines matching pattern</td></tr>
<tr><td class="mono">sed -n '/start/,/end/p'</td><td class="desc">Block between two patterns</td></tr>
<tr><td class="mono">sed '3d'</td><td class="desc">Delete line 3</td></tr>
<tr><td class="mono">sed '/pattern/d'</td><td class="desc">Delete lines matching pattern</td></tr>
<tr><td class="mono">sed '/^#/d; /^$/d'</td><td class="desc">Remove comments and blank lines</td></tr>
<tr><td class="mono">sed '5a\new line'</td><td class="desc">Append line after line 5</td></tr>
<tr><td class="mono">sed '5i\new line'</td><td class="desc">Insert line before line 5</td></tr>
<tr><td class="mono">sed 'y/abc/ABC/'</td><td class="desc">Transliterate characters</td></tr>
<tr><td class="mono">sed 'G'</td><td class="desc">Add blank line after every line</td></tr>
<tr><td class="mono">sed -e 's/a/b/' -e 's/c/d/'</td><td class="desc">Multiple commands</td></tr>
</tbody>
</table>
</div>
</div>

## cut, sort, uniq, xargs

<div class="ref-panel">
<div class="ref-panel-head">cut — field extraction</div>
<div class="ref-panel-body">
<table class="cheat-table">
<thead><tr><th>Command</th><th>Description</th></tr></thead>
<tbody>
<tr><td class="mono">cut -d: -f1 /etc/passwd</td><td class="desc">Field 1 with : delimiter</td></tr>
<tr><td class="mono">cut -d, -f2-4</td><td class="desc">Fields 2, 3, 4</td></tr>
<tr><td class="mono">cut -d: -f1,3</td><td class="desc">Fields 1 and 3</td></tr>
<tr><td class="mono">cut -c1-10</td><td class="desc">Characters 1–10</td></tr>
<tr><td class="mono">cut -c-5</td><td class="desc">First 5 characters</td></tr>
<tr><td class="mono">cut -c10-</td><td class="desc">From character 10 to end</td></tr>
</tbody>
</table>
</div>
</div>

<div class="ref-panel">
<div class="ref-panel-head">sort</div>
<div class="ref-panel-body">
<table class="cheat-table">
<thead><tr><th>Command</th><th>Description</th></tr></thead>
<tbody>
<tr><td class="mono">sort</td><td class="desc">Alphabetical sort</td></tr>
<tr><td class="mono">sort -n</td><td class="desc">Numeric sort</td></tr>
<tr><td class="mono">sort -rn</td><td class="desc">Reverse numeric sort</td></tr>
<tr><td class="mono">sort -u</td><td class="desc">Unique lines</td></tr>
<tr><td class="mono">sort -k2,2n</td><td class="desc">Sort by field 2 numerically</td></tr>
<tr><td class="mono">sort -t: -k3,3n /etc/passwd</td><td class="desc">Sort passwd by UID</td></tr>
<tr><td class="mono">sort -h</td><td class="desc">Human-readable numbers (1K, 2M)</td></tr>
<tr><td class="mono">sort -R</td><td class="desc">Random shuffle</td></tr>
</tbody>
</table>
</div>
</div>

<div class="ref-panel">
<div class="ref-panel-head">uniq</div>
<div class="ref-panel-body">
<table class="cheat-table">
<thead><tr><th>Command</th><th>Description</th></tr></thead>
<tbody>
<tr><td class="mono">uniq</td><td class="desc">Remove consecutive duplicates (requires sort first)</td></tr>
<tr><td class="mono">uniq -c</td><td class="desc">Count occurrences</td></tr>
<tr><td class="mono">uniq -d</td><td class="desc">Duplicates only</td></tr>
<tr><td class="mono">uniq -u</td><td class="desc">Unique lines only</td></tr>
<tr><td class="mono">sort | uniq -c | sort -rn</td><td class="desc">Top frequent lines</td></tr>
</tbody>
</table>
</div>
</div>

<div class="ref-panel">
<div class="ref-panel-head">xargs — argument passing</div>
<div class="ref-panel-body">
<table class="cheat-table">
<thead><tr><th>Command</th><th>Description</th></tr></thead>
<tbody>
<tr><td class="mono">find . -name "*.log" | xargs rm</td><td class="desc">Delete all .log files</td></tr>
<tr><td class="mono">find . -name "*.py" | xargs grep "TODO"</td><td class="desc">grep across found files</td></tr>
<tr><td class="mono">cat hosts.txt | xargs -I{} ping -c1 {}</td><td class="desc">Ping each host</td></tr>
<tr><td class="mono">echo "a b c" | xargs -n1</td><td class="desc">One argument at a time</td></tr>
<tr><td class="mono">xargs -P4 -I{} cmd {}</td><td class="desc">4 parallel processes</td></tr>
<tr><td class="mono">find . -print0 | xargs -0 rm</td><td class="desc">Null delimiters (files with spaces)</td></tr>
<tr><td class="mono">xargs -n3 echo</td><td class="desc">3 arguments per invocation</td></tr>
</tbody>
</table>
</div>
</div>
