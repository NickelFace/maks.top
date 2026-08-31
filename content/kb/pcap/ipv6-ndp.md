---
title: "IPv6 NDP"
description: "Neighbor Discovery Protocol (NDP) uses ICMPv6 to perform duplicate address detection and address resolution. Also includes multicast listener reports."
icon: "📡"
tags: ["Ethernet", "ICMPv6", "IPv6"]
date: 2026-08-31
capture_file: "IPv6_NDP.cap"
packets: "20"
duration: "41s"
filesize: "2.1 KB"
---

<div class="intro-card">
Neighbor Discovery Protocol (NDP) uses ICMPv6 to perform duplicate address detection and address resolution. Also includes multicast listener reports.
</div>

| | |
|---|---|
| File | `IPv6_NDP.cap` |
| Packets | 20 |
| Duration | 41s |
| Size | 2.1 KB |
| Protocols | Ethernet · ICMPv6 · IPv6 |

[Download `IPv6_NDP.cap`](/pcap/IPv6_NDP.cap)

Open it with `wireshark IPv6_NDP.cap` or inspect from the shell:

```bash
tshark -r IPv6_NDP.cap -c 20
tcpdump -r IPv6_NDP.cap -nn -v
```
