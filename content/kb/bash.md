---
title: "Bash & Scripting"
description: "Variables, arrays, conditionals, loops, functions, parameter expansion"
icon: "🐚"
group: "Linux Core"
tags: ["Bash", "Shell", "Scripting", "Linux"]
date: 2026-04-14
page_lang: "en"
lang_pair: "/kb/ru/bash/"
---

<div class="intro-card">
Bash reference: <strong>parameter expansion</strong>, special variables, arrays, tests, loops, functions — everything needed for writing reliable shell scripts.
</div>

## Variables & expansion

<div class="ref-panel">
<div class="ref-panel-head">Parameter Expansion</div>
<div class="ref-panel-body">
<table class="cheat-table">
<thead><tr><th>Expression</th><th>Result</th></tr></thead>
<tbody>
<tr><td class="mono">${VAR}</td><td class="desc">Value of VAR</td></tr>
<tr><td class="mono">${VAR:-default}</td><td class="desc">VAR if set, otherwise default (does not assign)</td></tr>
<tr><td class="mono">${VAR:=default}</td><td class="desc">VAR if set, otherwise assign default</td></tr>
<tr><td class="mono">${VAR:?error msg}</td><td class="desc">VAR if set, otherwise print error and exit</td></tr>
<tr><td class="mono">${VAR:+alt}</td><td class="desc">alt if VAR is set, otherwise empty</td></tr>
<tr><td class="mono">${#VAR}</td><td class="desc">String length</td></tr>
<tr><td class="mono">${VAR:2:5}</td><td class="desc">Substring: 5 characters starting at position 2</td></tr>
<tr><td class="mono">${VAR^^}</td><td class="desc">Convert entire string to UPPERCASE</td></tr>
<tr><td class="mono">${VAR,,}</td><td class="desc">Convert entire string to lowercase</td></tr>
<tr><td class="mono">${VAR^}</td><td class="desc">Capitalise first character</td></tr>
<tr><td class="mono">${VAR/old/new}</td><td class="desc">Replace first occurrence</td></tr>
<tr><td class="mono">${VAR//old/new}</td><td class="desc">Replace all occurrences</td></tr>
<tr><td class="mono">${VAR#prefix}</td><td class="desc">Strip shortest matching prefix (glob)</td></tr>
<tr><td class="mono">${VAR##prefix}</td><td class="desc">Strip longest matching prefix</td></tr>
<tr><td class="mono">${VAR%suffix}</td><td class="desc">Strip shortest matching suffix</td></tr>
<tr><td class="mono">${VAR%%suffix}</td><td class="desc">Strip longest matching suffix</td></tr>
</tbody>
</table>
</div>
</div>

## Special variables

<div class="ref-panel">
<div class="ref-panel-head">Special Parameters</div>
<div class="ref-panel-body">
<table class="cheat-table">
<thead><tr><th>Variable</th><th>Value</th></tr></thead>
<tbody>
<tr><td class="mono">$0</td><td class="desc">Script name / shell name</td></tr>
<tr><td class="mono">$1 .. $9</td><td class="desc">Positional parameters</td></tr>
<tr><td class="mono">${10} ..</td><td class="desc">Parameters ≥ 10 (braces required)</td></tr>
<tr><td class="mono">$@</td><td class="desc">All parameters as separate words (quoted)</td></tr>
<tr><td class="mono">$*</td><td class="desc">All parameters as a single string</td></tr>
<tr><td class="mono">$#</td><td class="desc">Number of parameters</td></tr>
<tr><td class="mono">$?</td><td class="desc">Exit code of the last command</td></tr>
<tr><td class="mono">$$</td><td class="desc">PID of the current shell</td></tr>
<tr><td class="mono">$!</td><td class="desc">PID of the last background process</td></tr>
<tr><td class="mono">$_</td><td class="desc">Last argument of the previous command</td></tr>
<tr><td class="mono">$-</td><td class="desc">Current shell option flags</td></tr>
</tbody>
</table>
</div>
</div>

## Arrays

<div class="ref-panel">
<div class="ref-panel-head">Arrays</div>
<div class="ref-panel-body">
<table class="cheat-table">
<thead><tr><th>Expression</th><th>Description</th></tr></thead>
<tbody>
<tr><td class="mono">arr=(alpha beta gamma)</td><td class="desc">Declare an array</td></tr>
<tr><td class="mono">arr[0]="delta"</td><td class="desc">Assign an element</td></tr>
<tr><td class="mono">arr+=("epsilon")</td><td class="desc">Append to the end</td></tr>
<tr><td class="mono">${arr[0]}</td><td class="desc">First element</td></tr>
<tr><td class="mono">${arr[-1]}</td><td class="desc">Last element</td></tr>
<tr><td class="mono">${arr[@]}</td><td class="desc">All elements (as separate words)</td></tr>
<tr><td class="mono">${arr[*]}</td><td class="desc">All elements (as one string)</td></tr>
<tr><td class="mono">${#arr[@]}</td><td class="desc">Array length</td></tr>
<tr><td class="mono">${arr[@]:1:2}</td><td class="desc">Slice: 2 elements starting at index 1</td></tr>
<tr><td class="mono">unset arr[1]</td><td class="desc">Remove an element</td></tr>
<tr><td class="mono">declare -A map</td><td class="desc">Declare an associative array (hash map)</td></tr>
<tr><td class="mono">map[key]="value"</td><td class="desc">Assign a key</td></tr>
<tr><td class="mono">${!map[@]}</td><td class="desc">All keys of the associative array</td></tr>
</tbody>
</table>
</div>
</div>

## Tests

<div class="ref-panel">
<div class="ref-panel-head">File operators</div>
<div class="ref-panel-body">
<table class="cheat-table">
<thead><tr><th>Flag</th><th>True if</th></tr></thead>
<tbody>
<tr><td class="mono">-e file</td><td class="desc">Exists (any type)</td></tr>
<tr><td class="mono">-f file</td><td class="desc">Regular file</td></tr>
<tr><td class="mono">-d file</td><td class="desc">Directory</td></tr>
<tr><td class="mono">-s file</td><td class="desc">File is non-empty (size &gt; 0)</td></tr>
<tr><td class="mono">-L file</td><td class="desc">Symbolic link</td></tr>
<tr><td class="mono">-r / -w / -x</td><td class="desc">Readable / writable / executable</td></tr>
<tr><td class="mono">-O file</td><td class="desc">Owned by the current user</td></tr>
<tr><td class="mono">f1 -nt f2</td><td class="desc">f1 is newer than f2</td></tr>
<tr><td class="mono">f1 -ot f2</td><td class="desc">f1 is older than f2</td></tr>
</tbody>
</table>
</div>
</div>

<div class="ref-panel">
<div class="ref-panel-head">String & numeric operators</div>
<div class="ref-panel-body">
<table class="cheat-table">
<thead><tr><th>Expression</th><th>True if</th></tr></thead>
<tbody>
<tr><td class="mono">-z str</td><td class="desc">String is empty</td></tr>
<tr><td class="mono">-n str</td><td class="desc">String is non-empty</td></tr>
<tr><td class="mono">str1 = str2</td><td class="desc">Strings are equal</td></tr>
<tr><td class="mono">str1 != str2</td><td class="desc">Strings are not equal</td></tr>
<tr><td class="mono">str =~ regex</td><td class="desc">Matches regex (only inside [[ ]])</td></tr>
<tr><td class="mono">n1 -eq n2</td><td class="desc">Numbers are equal</td></tr>
<tr><td class="mono">n1 -ne n2</td><td class="desc">Numbers are not equal</td></tr>
<tr><td class="mono">n1 -lt / -le / -gt / -ge n2</td><td class="desc">&lt; / ≤ / &gt; / ≥</td></tr>
</tbody>
</table>
</div>
</div>

## Conditionals & loops

<div class="ref-panel">
<div class="ref-panel-head">Control flow</div>
<div class="ref-panel-body">
<table class="cheat-table">
<thead><tr><th>Construct</th><th>Description</th></tr></thead>
<tbody>
<tr><td class="mono">if [[ cond ]]; then ...; elif ...; else ...; fi</td><td class="desc">Conditional block</td></tr>
<tr><td class="mono">[[ cond ]] && cmd</td><td class="desc">Run cmd if condition is true</td></tr>
<tr><td class="mono">[[ cond ]] || cmd</td><td class="desc">Run cmd if condition is false</td></tr>
<tr><td class="mono">case "$v" in pat1) ...;; pat2|pat3) ...;; *) ...;; esac</td><td class="desc">Switch/case</td></tr>
<tr><td class="mono">for i in {1..10}; do ...; done</td><td class="desc">Range loop</td></tr>
<tr><td class="mono">for f in *.txt; do ...; done</td><td class="desc">Glob loop</td></tr>
<tr><td class="mono">for (( i=0; i&lt;10; i++ )); do ...; done</td><td class="desc">C-style loop</td></tr>
<tr><td class="mono">for item in "${arr[@]}"; do ...; done</td><td class="desc">Array loop</td></tr>
<tr><td class="mono">while IFS= read -r line; do ...; done &lt; file</td><td class="desc">Read lines from a file</td></tr>
<tr><td class="mono">while IFS= read -r line; do ...; done &lt; &lt;(cmd)</td><td class="desc">Read lines from a command</td></tr>
<tr><td class="mono">until [[ cond ]]; do ...; done</td><td class="desc">Until loop</td></tr>
<tr><td class="mono">break / continue</td><td class="desc">Exit / skip current iteration</td></tr>
</tbody>
</table>
</div>
</div>

## Functions

<div class="ref-panel">
<div class="ref-panel-head">Functions</div>
<div class="ref-panel-body">
<table class="cheat-table">
<thead><tr><th>Construct</th><th>Description</th></tr></thead>
<tbody>
<tr><td class="mono">myfunc() { ...; }</td><td class="desc">Declare a function</td></tr>
<tr><td class="mono">function myfunc { ...; }</td><td class="desc">Alternative syntax</td></tr>
<tr><td class="mono">local var="$1"</td><td class="desc">Local variable (function scope only)</td></tr>
<tr><td class="mono">return 0 / return 1</td><td class="desc">Function exit code</td></tr>
<tr><td class="mono">result=$(myfunc args)</td><td class="desc">Capture function output</td></tr>
<tr><td class="mono">myfunc "$@"</td><td class="desc">Pass all script arguments to the function</td></tr>
<tr><td class="mono">declare -f myfunc</td><td class="desc">Print function definition</td></tr>
<tr><td class="mono">unset -f myfunc</td><td class="desc">Remove a function</td></tr>
</tbody>
</table>
</div>
</div>
