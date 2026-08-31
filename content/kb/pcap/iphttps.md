---
title: "Iphttps"
description: "IP-HTTPS capture.  This is Microsoft's IPv6 inside HTTPS tunneling for DirectAccess."
icon: "📡"
tags: ["ARP", "DNS", "Ethernet", "ICMPv6", "IGMP", "IP", "IPv6", "LLC", "NBNS", "NBSS", "SSL", "TCP", "UDP"]
date: 2026-08-31
capture_file: "iphttps.cap"
packets: "83"
duration: "38s"
filesize: "12.4 KB"
---

<div class="intro-card">
IP-HTTPS capture.  This is Microsoft's IPv6 inside HTTPS tunneling for DirectAccess.
</div>

| | |
|---|---|
| File | `iphttps.cap` |
| Packets | 83 |
| Duration | 38s |
| Size | 12.4 KB |
| Protocols | ARP · DNS · Ethernet · ICMPv6 · IGMP · IP · IPv6 · LLC · NBNS · NBSS · SSL · TCP · UDP |

[Download `iphttps.cap`](/pcap/iphttps.cap)

Open it with `wireshark iphttps.cap` or inspect from the shell:

```bash
tshark -r iphttps.cap -c 20
tcpdump -r iphttps.cap -nn -v
```
