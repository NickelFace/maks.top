---
title: "Traceroute MPLS"
description: "ICMP
IP
UDP"
icon: "📡"
tags: ["ICMP", "IP", "UDP"]
date: 2026-08-31
capture_file: "traceroute_MPLS.cap"
packets: "29"
duration: "3s"
filesize: "3.3 KB"
---

<div class="intro-card">
ICMP
IP
UDP
</div>

| | |
|---|---|
| File | `traceroute_MPLS.cap` |
| Packets | 29 |
| Duration | 3s |
| Size | 3.3 KB |
| Protocols | ICMP · IP · UDP |

[Download `traceroute_MPLS.cap`](/pcap/traceroute_MPLS.cap)

Open it with `wireshark traceroute_MPLS.cap` or inspect from the shell:

```bash
tshark -r traceroute_MPLS.cap -c 20
tcpdump -r traceroute_MPLS.cap -nn -v
```
