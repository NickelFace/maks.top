---
title: "EIGRP subnet down"
description: "R4's interface to 192.168.4.0/24 goes down and the route is advertised as unreachable. Queries are issued by all routers to find a new path to the subnet but none exists, and the route is removed from the topology. Capture perspective is from R1's 10.0.0.1 interface."
icon: "📡"
tags: ["EIGRP", "Ethernet", "IP"]
date: 2026-08-31
capture_file: "EIGRP_subnet_down.cap"
packets: "21"
duration: "23s"
filesize: "1.8 KB"
---

<div class="intro-card">
R4's interface to 192.168.4.0/24 goes down and the route is advertised as unreachable. Queries are issued by all routers to find a new path to the subnet but none exists, and the route is removed from the topology. Capture perspective is from R1's 10.0.0.1 interface.
</div>

| | |
|---|---|
| File | `EIGRP_subnet_down.cap` |
| Packets | 21 |
| Duration | 23s |
| Size | 1.8 KB |
| Protocols | EIGRP · Ethernet · IP |

[Download `EIGRP_subnet_down.cap`](/pcap/EIGRP_subnet_down.cap)

Open it with `wireshark EIGRP_subnet_down.cap` or inspect from the shell:

```bash
tshark -r EIGRP_subnet_down.cap -c 20
tcpdump -r EIGRP_subnet_down.cap -nn -v
```

---

Archived from packetlife.net by Jeremy Stretch, offline since 2024.
