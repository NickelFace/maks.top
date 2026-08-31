---
title: "GLBP election"
description: "Routers 1, 2, and 3 participate in a GLBP election. R1 becomes the AVG due to having the highest priority (200), and R3 becomes the standby GLBP. All three routers become AVFs."
icon: "📡"
tags: ["Ethernet", "GLBP", "IP", "UDP"]
date: 2026-08-31
capture_file: "GLBP_election.cap"
packets: "80"
duration: "68s"
filesize: "8.4 KB"
---

<div class="intro-card">
Routers 1, 2, and 3 participate in a GLBP election. R1 becomes the AVG due to having the highest priority (200), and R3 becomes the standby GLBP. All three routers become AVFs.
</div>

| | |
|---|---|
| File | `GLBP_election.cap` |
| Packets | 80 |
| Duration | 68s |
| Size | 8.4 KB |
| Protocols | Ethernet · GLBP · IP · UDP |

[Download `GLBP_election.cap`](/pcap/GLBP_election.cap)

Open it with `wireshark GLBP_election.cap` or inspect from the shell:

```bash
tshark -r GLBP_election.cap -c 20
tcpdump -r GLBP_election.cap -nn -v
```
