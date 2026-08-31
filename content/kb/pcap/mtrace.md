---
title: "Mtrace"
description: "mtrace 172.16.40.1 172.16.20.1 is issued on R1 to trace the RPF path from R4's 172.16.20.0/24 subnet to R1's 172.16.40.0/24 subnet. The capture is taken on the R1-R3 link."
icon: "📡"
tags: ["Ethernet", "IGMP", "IP"]
date: 2026-08-31
capture_file: "mtrace.cap"
packets: "2"
duration: "n/a"
filesize: "238 bytes"
---

<div class="intro-card">
mtrace 172.16.40.1 172.16.20.1 is issued on R1 to trace the RPF path from R4's 172.16.20.0/24 subnet to R1's 172.16.40.0/24 subnet. The capture is taken on the R1-R3 link.
</div>

| | |
|---|---|
| File | `mtrace.cap` |
| Packets | 2 |
| Duration | n/a |
| Size | 238 bytes |
| Protocols | Ethernet · IGMP · IP |

[Download `mtrace.cap`](/pcap/mtrace.cap)

Open it with `wireshark mtrace.cap` or inspect from the shell:

```bash
tshark -r mtrace.cap -c 20
tcpdump -r mtrace.cap -nn -v
```
