---
title: "ICMP across dot1q"
description: "A ping issued from 192.168.123.2 to 192.168.123.1 is encapsulated with an IEEE 802.1Q header, placing it in VLAN 123."
icon: "📡"
tags: ["ARP", "Ethernet", "ICMP", "IP", "VLAN"]
date: 2026-08-31
capture_file: "ICMP_across_dot1q.cap"
packets: "15"
duration: "35s"
filesize: "1.7 KB"
---

<div class="intro-card">
A ping issued from 192.168.123.2 to 192.168.123.1 is encapsulated with an IEEE 802.1Q header, placing it in VLAN 123.
</div>

| | |
|---|---|
| File | `ICMP_across_dot1q.cap` |
| Packets | 15 |
| Duration | 35s |
| Size | 1.7 KB |
| Protocols | ARP · Ethernet · ICMP · IP · VLAN |

[Download `ICMP_across_dot1q.cap`](/pcap/ICMP_across_dot1q.cap)

Open it with `wireshark ICMP_across_dot1q.cap` or inspect from the shell:

```bash
tshark -r ICMP_across_dot1q.cap -c 20
tcpdump -r ICMP_across_dot1q.cap -nn -v
```
