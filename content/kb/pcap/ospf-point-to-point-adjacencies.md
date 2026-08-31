---
title: "OSPF point to point adjacencies"
description: "The frame relay network between four routers is configured with point-to-point subinterfaces. No DR/BDR is required as all adjacencies are point-to-point. Capture perspective from R1."
icon: "📡"
tags: ["Frame Relay", "IP", "OSPF"]
date: 2026-08-31
capture_file: "OSPF_point-to-point_adjacencies.cap"
packets: "93"
duration: "35s"
filesize: "9.9 KB"
---

<div class="intro-card">
The frame relay network between four routers is configured with point-to-point subinterfaces. No DR/BDR is required as all adjacencies are point-to-point. Capture perspective from R1.
</div>

| | |
|---|---|
| File | `OSPF_point-to-point_adjacencies.cap` |
| Packets | 93 |
| Duration | 35s |
| Size | 9.9 KB |
| Protocols | Frame Relay · IP · OSPF |

[Download `OSPF_point-to-point_adjacencies.cap`](/pcap/OSPF_point-to-point_adjacencies.cap)

Open it with `wireshark OSPF_point-to-point_adjacencies.cap` or inspect from the shell:

```bash
tshark -r OSPF_point-to-point_adjacencies.cap -c 20
tcpdump -r OSPF_point-to-point_adjacencies.cap -nn -v
```
