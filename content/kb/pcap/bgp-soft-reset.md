---
title: "BGP soft reset"
description: "R1 performs a soft bidirectional reset (clear ip bgp soft) on its adjacency with R2. The ROUTE-REFRESH message is visible in packet #7. Note that the TCP connection remains uninterrupted, and neither router views the reset as disruptive."
icon: "📡"
tags: ["BGP", "Ethernet", "IP", "TCP"]
date: 2026-08-31
capture_file: "BGP_soft_reset.cap"
packets: "17"
duration: "180s"
filesize: "2.0 KB"
---

<div class="intro-card">
R1 performs a soft bidirectional reset (clear ip bgp soft) on its adjacency with R2. The ROUTE-REFRESH message is visible in packet #7. Note that the TCP connection remains uninterrupted, and neither router views the reset as disruptive.
</div>

| | |
|---|---|
| File | `BGP_soft_reset.cap` |
| Packets | 17 |
| Duration | 180s |
| Size | 2.0 KB |
| Protocols | BGP · Ethernet · IP · TCP |

[Download `BGP_soft_reset.cap`](/pcap/BGP_soft_reset.cap)

Open it with `wireshark BGP_soft_reset.cap` or inspect from the shell:

```bash
tshark -r BGP_soft_reset.cap -c 20
tcpdump -r BGP_soft_reset.cap -nn -v
```
