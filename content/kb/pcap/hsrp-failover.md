---
title: "HSRP failover"
description: "R1 is the active router, R3 is the standby, and R2 is passive. R1 goes offline and R3 takes over as active after ten seconds. R2 is then promoted to the standby state."
icon: "📡"
tags: ["Ethernet", "HSRP", "IP", "UDP"]
date: 2026-08-31
capture_file: "HSRP_failover.cap"
packets: "39"
duration: "47s"
filesize: "3.0 KB"
---

<div class="intro-card">
R1 is the active router, R3 is the standby, and R2 is passive. R1 goes offline and R3 takes over as active after ten seconds. R2 is then promoted to the standby state.
</div>

| | |
|---|---|
| File | `HSRP_failover.cap` |
| Packets | 39 |
| Duration | 47s |
| Size | 3.0 KB |
| Protocols | Ethernet · HSRP · IP · UDP |

[Download `HSRP_failover.cap`](/pcap/HSRP_failover.cap)

Open it with `wireshark HSRP_failover.cap` or inspect from the shell:

```bash
tshark -r HSRP_failover.cap -c 20
tcpdump -r HSRP_failover.cap -nn -v
```
