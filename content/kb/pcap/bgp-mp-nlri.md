---
title: "BGP MP NLRI"
description: "IPv6 routes are carried as a separate address family inside MP_REACH_NLRI attributes."
icon: "📡"
tags: ["BGP", "Ethernet", "IP", "IPv6", "TCP"]
date: 2026-08-31
capture_file: "BGP_MP_NLRI.cap"
packets: "24"
duration: "60s"
filesize: "2.9 KB"
---

<div class="intro-card">
IPv6 routes are carried as a separate address family inside MP_REACH_NLRI attributes.
</div>

| | |
|---|---|
| File | `BGP_MP_NLRI.cap` |
| Packets | 24 |
| Duration | 60s |
| Size | 2.9 KB |
| Protocols | BGP · Ethernet · IP · IPv6 · TCP |

[Download `BGP_MP_NLRI.cap`](/pcap/BGP_MP_NLRI.cap)

Open it with `wireshark BGP_MP_NLRI.cap` or inspect from the shell:

```bash
tshark -r BGP_MP_NLRI.cap -c 20
tcpdump -r BGP_MP_NLRI.cap -nn -v
```
