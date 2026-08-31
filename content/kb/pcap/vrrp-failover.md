---
title: "VRRP failover"
description: "The master router (R1) goes offline. After the down interval passes (roughly 3 seconds), R3 takes over as the master router in packet #12. R2 also offers to take over but R3 wins because it has the higher IP address."
icon: "📡"
tags: ["Ethernet", "IP", "VRRP"]
date: 2026-08-31
capture_file: "VRRP_failover.cap"
packets: "32"
duration: "33s"
filesize: "2.4 KB"
---

<div class="intro-card">
The master router (R1) goes offline. After the down interval passes (roughly 3 seconds), R3 takes over as the master router in packet #12. R2 also offers to take over but R3 wins because it has the higher IP address.
</div>

| | |
|---|---|
| File | `VRRP_failover.cap` |
| Packets | 32 |
| Duration | 33s |
| Size | 2.4 KB |
| Protocols | Ethernet · IP · VRRP |

[Download `VRRP_failover.cap`](/pcap/VRRP_failover.cap)

Open it with `wireshark VRRP_failover.cap` or inspect from the shell:

```bash
tshark -r VRRP_failover.cap -c 20
tcpdump -r VRRP_failover.cap -nn -v
```

---

Archived from packetlife.net by Jeremy Stretch, offline since 2024.
