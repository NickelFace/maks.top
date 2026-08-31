---
title: "EIGRPv2 adjacency"
description: "Routers 1 and 2 form an EIGRPv2 adjacency and exchange IPv6 routes."
icon: "📡"
tags: ["EIGRP", "Ethernet", "IPv6"]
date: 2026-08-31
capture_file: "EIGRPv2_adjacency.cap"
packets: "31"
duration: "52s"
filesize: "4.1 KB"
---

<div class="intro-card">
Routers 1 and 2 form an EIGRPv2 adjacency and exchange IPv6 routes.
</div>

| | |
|---|---|
| File | `EIGRPv2_adjacency.cap` |
| Packets | 31 |
| Duration | 52s |
| Size | 4.1 KB |
| Protocols | EIGRP · Ethernet · IPv6 |

[Download `EIGRPv2_adjacency.cap`](/pcap/EIGRPv2_adjacency.cap)

Open it with `wireshark EIGRPv2_adjacency.cap` or inspect from the shell:

```bash
tshark -r EIGRPv2_adjacency.cap -c 20
tcpdump -r EIGRPv2_adjacency.cap -nn -v
```

---

Archived from packetlife.net by Jeremy Stretch, offline since 2024.
