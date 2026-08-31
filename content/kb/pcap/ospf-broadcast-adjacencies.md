---
title: "OSPF broadcast adjacencies"
description: "Three routers form OSPF adjacencies across a broadcast segment. All interface priorities are left default, so R3 (with the highest router ID) becomes the DR, and R2 (with the next-highest router ID) becomes the BDR. Capture perspective from R1."
icon: "📡"
tags: ["Ethernet", "IP", "OSPF"]
date: 2026-08-31
capture_file: "OSPF_broadcast_adjacencies.cap"
packets: "74"
duration: "95s"
filesize: "8.4 KB"
---

<div class="intro-card">
Three routers form OSPF adjacencies across a broadcast segment. All interface priorities are left default, so R3 (with the highest router ID) becomes the DR, and R2 (with the next-highest router ID) becomes the BDR. Capture perspective from R1.
</div>

| | |
|---|---|
| File | `OSPF_broadcast_adjacencies.cap` |
| Packets | 74 |
| Duration | 95s |
| Size | 8.4 KB |
| Protocols | Ethernet · IP · OSPF |

[Download `OSPF_broadcast_adjacencies.cap`](/pcap/OSPF_broadcast_adjacencies.cap)

Open it with `wireshark OSPF_broadcast_adjacencies.cap` or inspect from the shell:

```bash
tshark -r OSPF_broadcast_adjacencies.cap -c 20
tcpdump -r OSPF_broadcast_adjacencies.cap -nn -v
```
