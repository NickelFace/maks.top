---
title: "IPv6 neighbor spoofing"
description: "IPv6 neighbor spoofing on the local link using a forged ICMPv6 neighbor advertisement."
icon: "📡"
tags: ["Ethernet", "ICMPv6", "IPv6"]
date: 2026-08-31
capture_file: "ipv6_neighbor_spoofing.cap"
packets: "49"
duration: "27s"
filesize: "6.2 KB"
---

<div class="intro-card">
IPv6 neighbor spoofing on the local link using a forged ICMPv6 neighbor advertisement.
</div>

| | |
|---|---|
| File | `ipv6_neighbor_spoofing.cap` |
| Packets | 49 |
| Duration | 27s |
| Size | 6.2 KB |
| Protocols | Ethernet · ICMPv6 · IPv6 |

[Download `ipv6_neighbor_spoofing.cap`](/pcap/ipv6_neighbor_spoofing.cap)

Open it with `wireshark ipv6_neighbor_spoofing.cap` or inspect from the shell:

```bash
tshark -r ipv6_neighbor_spoofing.cap -c 20
tcpdump -r ipv6_neighbor_spoofing.cap -nn -v
```
