---
title: "RIPv1 subnet down"
description: "RIPv1 routes are being flooded on the R1-R2 link. R2's connection to 192.168.2.0/24 goes down, and the route is advertised as unreachable (metric 16) in packet #5. Capture perspective from R1's 10.0.1.1 interface."
icon: "📡"
tags: ["Ethernet", "IP", "RIP", "UDP"]
date: 2026-08-31
capture_file: "RIPv1_subnet_down.cap"
packets: "8"
duration: "58s"
filesize: "1.0 KB"
---

<div class="intro-card">
RIPv1 routes are being flooded on the R1-R2 link. R2's connection to 192.168.2.0/24 goes down, and the route is advertised as unreachable (metric 16) in packet #5. Capture perspective from R1's 10.0.1.1 interface.
</div>

| | |
|---|---|
| File | `RIPv1_subnet_down.cap` |
| Packets | 8 |
| Duration | 58s |
| Size | 1.0 KB |
| Protocols | Ethernet · IP · RIP · UDP |

[Download `RIPv1_subnet_down.cap`](/pcap/RIPv1_subnet_down.cap)

Open it with `wireshark RIPv1_subnet_down.cap` or inspect from the shell:

```bash
tshark -r RIPv1_subnet_down.cap -c 20
tcpdump -r RIPv1_subnet_down.cap -nn -v
```
