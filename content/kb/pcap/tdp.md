---
title: "TDP"
description: "P2 and PE2 exchange Tag Distribution Protocol hellos and form an adjacency over TCP port 711."
icon: "📡"
tags: ["Ethernet", "IP", "TCP", "TDP", "UDP"]
date: 2026-08-31
capture_file: "TDP.cap"
packets: "33"
duration: "47s"
filesize: "2.8 KB"
---

<div class="intro-card">
P2 and PE2 exchange Tag Distribution Protocol hellos and form an adjacency over TCP port 711.
</div>

| | |
|---|---|
| File | `TDP.cap` |
| Packets | 33 |
| Duration | 47s |
| Size | 2.8 KB |
| Protocols | Ethernet · IP · TCP · TDP · UDP |

[Download `TDP.cap`](/pcap/TDP.cap)

Open it with `wireshark TDP.cap` or inspect from the shell:

```bash
tshark -r TDP.cap -c 20
tcpdump -r TDP.cap -nn -v
```
