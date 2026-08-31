---
title: "EoMPLS"
description: "Routers at 1.1.2.1 and 1.1.2.2 are PEs in a MPLS cloud. LDP starts at packet 8 and they build up a pseudo-wire VC (last FEC in packets 11 and 13). At packet 15 we already have STP running between CE1 and CE2 (two routers with ESW), encapsulated in 2 MPLS headers. All the ethernet stuff follows: CDP, ARP, ICMP between two hosts on the same subnet."
icon: "📡"
tags: ["Ethernet", "IP", "LOOP", "MPLS", "TCP", "UDP"]
date: 2026-08-31
capture_file: "EoMPLS.cap"
packets: "56"
duration: "32s"
filesize: "7.0 KB"
---

<div class="intro-card">
Routers at 1.1.2.1 and 1.1.2.2 are PEs in a MPLS cloud. LDP starts at packet 8 and they build up a pseudo-wire VC (last FEC in packets 11 and 13). At packet 15 we already have STP running between CE1 and CE2 (two routers with ESW), encapsulated in 2 MPLS headers. All the ethernet stuff follows: CDP, ARP, ICMP between two hosts on the same subnet.
</div>

| | |
|---|---|
| File | `EoMPLS.cap` |
| Packets | 56 |
| Duration | 32s |
| Size | 7.0 KB |
| Protocols | Ethernet · IP · LOOP · MPLS · TCP · UDP |

[Download `EoMPLS.cap`](/pcap/EoMPLS.cap)

Open it with `wireshark EoMPLS.cap` or inspect from the shell:

```bash
tshark -r EoMPLS.cap -c 20
tcpdump -r EoMPLS.cap -nn -v
```
