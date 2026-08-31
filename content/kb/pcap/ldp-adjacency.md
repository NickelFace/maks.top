---
title: "LDP adjacency"
description: "PE1 and P1 multicast LDP hellos to 224.0.0.2 on UDP port 646. They then establish an adjacency on TCP port 646 and exchange labels."
icon: "📡"
tags: ["Ethernet", "IP", "LDP", "TCP", "UDP"]
date: 2026-08-31
capture_file: "LDP_adjacency.cap"
packets: "61"
duration: "108s"
filesize: "5.7 KB"
---

<div class="intro-card">
PE1 and P1 multicast LDP hellos to 224.0.0.2 on UDP port 646. They then establish an adjacency on TCP port 646 and exchange labels.
</div>

| | |
|---|---|
| File | `LDP_adjacency.cap` |
| Packets | 61 |
| Duration | 108s |
| Size | 5.7 KB |
| Protocols | Ethernet · IP · LDP · TCP · UDP |

[Download `LDP_adjacency.cap`](/pcap/LDP_adjacency.cap)

Open it with `wireshark LDP_adjacency.cap` or inspect from the shell:

```bash
tshark -r LDP_adjacency.cap -c 20
tcpdump -r LDP_adjacency.cap -nn -v
```
