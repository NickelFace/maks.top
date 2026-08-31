---
title: "Stun2"
description: "Stun (2) Protocol. UDP Holepunching technique."
icon: "📡"
tags: ["IP", "STUN", "UDP"]
date: 2026-08-31
capture_file: "stun2.cap"
packets: "1"
duration: "n/a"
filesize: "102 bytes"
---

<div class="intro-card">
Stun (2) Protocol. UDP Holepunching technique.
</div>

| | |
|---|---|
| File | `stun2.cap` |
| Packets | 1 |
| Duration | n/a |
| Size | 102 bytes |
| Protocols | IP · STUN · UDP |

[Download `stun2.cap`](/pcap/stun2.cap)

Open it with `wireshark stun2.cap` or inspect from the shell:

```bash
tshark -r stun2.cap -c 20
tcpdump -r stun2.cap -nn -v
```
