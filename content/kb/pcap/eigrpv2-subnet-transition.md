---
title: "EIGRPv2 subnet transition"
description: "R4's 2001:db8:0:400::/64 subnet goes down, then comes back up roughly thirty seconds later. Capture perspective from R1's 2001:db8:0:12::1 interface."
icon: "📡"
tags: ["EIGRP", "Ethernet", "IPv6"]
date: 2026-08-31
capture_file: "EIGRPv2_subnet_transition.cap"
packets: "49"
duration: "65s"
filesize: "5.3 KB"
---

<div class="intro-card">
R4's 2001:db8:0:400::/64 subnet goes down, then comes back up roughly thirty seconds later. Capture perspective from R1's 2001:db8:0:12::1 interface.
</div>

| | |
|---|---|
| File | `EIGRPv2_subnet_transition.cap` |
| Packets | 49 |
| Duration | 65s |
| Size | 5.3 KB |
| Protocols | EIGRP · Ethernet · IPv6 |

[Download `EIGRPv2_subnet_transition.cap`](/pcap/EIGRPv2_subnet_transition.cap)

Open it with `wireshark EIGRPv2_subnet_transition.cap` or inspect from the shell:

```bash
tshark -r EIGRPv2_subnet_transition.cap -c 20
tcpdump -r EIGRPv2_subnet_transition.cap -nn -v
```
