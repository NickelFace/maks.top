---
title: "RIPv2 subnet down"
description: "RIPv2 routes are being flooded on the R1-R2 link. R2's connection to 192.168.2.0/24 goes down, and the route is advertised as unreachable (metric 16) in packet #7. Capture perspective from R1's 10.0.0.1 interface."
icon: "📡"
tags: ["Ethernet", "IP", "RIP", "UDP"]
date: 2026-08-31
capture_file: "RIPv2_subnet_down.cap"
packets: "10"
duration: "86s"
filesize: "1.3 KB"
---

<div class="intro-card">
RIPv2 routes are being flooded on the R1-R2 link. R2's connection to 192.168.2.0/24 goes down, and the route is advertised as unreachable (metric 16) in packet #7. Capture perspective from R1's 10.0.0.1 interface.
</div>

| | |
|---|---|
| File | `RIPv2_subnet_down.cap` |
| Packets | 10 |
| Duration | 86s |
| Size | 1.3 KB |
| Protocols | Ethernet · IP · RIP · UDP |

[Download `RIPv2_subnet_down.cap`](/pcap/RIPv2_subnet_down.cap)

Open it with `wireshark RIPv2_subnet_down.cap` or inspect from the shell:

```bash
tshark -r RIPv2_subnet_down.cap -c 20
tcpdump -r RIPv2_subnet_down.cap -nn -v
```

---

Archived from packetlife.net by Jeremy Stretch, offline since 2024.
