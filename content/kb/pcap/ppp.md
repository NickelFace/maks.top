---
title: "PPP"
description: "ICMP across a PPP serial link."
icon: "📡"
tags: ["CDP", "ICMP", "IP", "LCP", "PPP"]
date: 2026-08-31
capture_file: "PPP.cap"
packets: "50"
duration: "83s"
filesize: "3.6 KB"
---

<div class="intro-card">
ICMP across a PPP serial link.
</div>

| | |
|---|---|
| File | `PPP.cap` |
| Packets | 50 |
| Duration | 83s |
| Size | 3.6 KB |
| Protocols | CDP · ICMP · IP · LCP · PPP |

[Download `PPP.cap`](/pcap/PPP.cap)

Open it with `wireshark PPP.cap` or inspect from the shell:

```bash
tshark -r PPP.cap -c 20
tcpdump -r PPP.cap -nn -v
```
