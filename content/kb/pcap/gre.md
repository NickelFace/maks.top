---
title: "GRE"
description: "ICMP is encapsulated into a Generic Routing Encapsulation (GRE) tunnel."
icon: "📡"
tags: ["Ethernet", "GRE", "IP"]
date: 2026-08-31
capture_file: "GRE.cap"
packets: "10"
duration: "n/a"
filesize: "1.5 KB"
---

<div class="intro-card">
ICMP is encapsulated into a Generic Routing Encapsulation (GRE) tunnel.
</div>

| | |
|---|---|
| File | `GRE.cap` |
| Packets | 10 |
| Duration | n/a |
| Size | 1.5 KB |
| Protocols | Ethernet · GRE · IP |

[Download `GRE.cap`](/pcap/GRE.cap)

Open it with `wireshark GRE.cap` or inspect from the shell:

```bash
tshark -r GRE.cap -c 20
tcpdump -r GRE.cap -nn -v
```
