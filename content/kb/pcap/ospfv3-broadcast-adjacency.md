---
title: "OSPFv3 broadcast adjacency"
description: "Routers 1 and 2 form an OSPFv3 adjacency across their common Ethernet link (2001:db8:0:12::/64)."
icon: "📡"
tags: ["Ethernet", "IPv6", "OSPF"]
date: 2026-08-31
capture_file: "OSPFv3_broadcast_adjacency.cap"
packets: "38"
duration: "70s"
filesize: "5.4 KB"
---

<div class="intro-card">
Routers 1 and 2 form an OSPFv3 adjacency across their common Ethernet link (2001:db8:0:12::/64).
</div>

| | |
|---|---|
| File | `OSPFv3_broadcast_adjacency.cap` |
| Packets | 38 |
| Duration | 70s |
| Size | 5.4 KB |
| Protocols | Ethernet · IPv6 · OSPF |

[Download `OSPFv3_broadcast_adjacency.cap`](/pcap/OSPFv3_broadcast_adjacency.cap)

Open it with `wireshark OSPFv3_broadcast_adjacency.cap` or inspect from the shell:

```bash
tshark -r OSPFv3_broadcast_adjacency.cap -c 20
tcpdump -r OSPFv3_broadcast_adjacency.cap -nn -v
```
