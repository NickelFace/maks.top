---
title: "Cflow"
description: "Netflow v9 packet containing template as well as data set"
icon: "📡"
tags: ["IP", "UDP"]
date: 2026-08-31
capture_file: "cflow.cap"
packets: "1"
duration: "n/a"
filesize: "782 bytes"
---

<div class="intro-card">
Netflow v9 packet containing template as well as data set
</div>

| | |
|---|---|
| File | `cflow.cap` |
| Packets | 1 |
| Duration | n/a |
| Size | 782 bytes |
| Protocols | IP · UDP |

[Download `cflow.cap`](/pcap/cflow.cap)

Open it with `wireshark cflow.cap` or inspect from the shell:

```bash
tshark -r cflow.cap -c 20
tcpdump -r cflow.cap -nn -v
```
