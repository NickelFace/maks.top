---
title: "OSPF NBMA adjacencies"
description: "Formation of OSPF adjacencies across a Non-broadcast Multiaccess (NBMA) frame relay topology. Neighbors have been manually specified on all routers, with R1 configured to become the DR. No BDR is present. Capture perspective from R1."
icon: "📡"
tags: ["Frame Relay", "IP", "OSPF"]
date: 2026-08-31
capture_file: "OSPF_NBMA_adjacencies.cap"
packets: "99"
duration: "66s"
filesize: "11.7 KB"
---

<div class="intro-card">
Formation of OSPF adjacencies across a Non-broadcast Multiaccess (NBMA) frame relay topology. Neighbors have been manually specified on all routers, with R1 configured to become the DR. No BDR is present. Capture perspective from R1.
</div>

| | |
|---|---|
| File | `OSPF_NBMA_adjacencies.cap` |
| Packets | 99 |
| Duration | 66s |
| Size | 11.7 KB |
| Protocols | Frame Relay · IP · OSPF |

[Download `OSPF_NBMA_adjacencies.cap`](/pcap/OSPF_NBMA_adjacencies.cap)

Open it with `wireshark OSPF_NBMA_adjacencies.cap` or inspect from the shell:

```bash
tshark -r OSPF_NBMA_adjacencies.cap -c 20
tcpdump -r OSPF_NBMA_adjacencies.cap -nn -v
```
