---
title: "Bgplu"
description: "BGP Labeled Unicast"
icon: "📡"
tags: ["BGP", "IP", "TCP"]
date: 2026-08-31
capture_file: "bgplu.cap"
packets: "22"
duration: "4s"
filesize: "2.1 KB"
---

<div class="intro-card">
BGP Labeled Unicast
</div>

| | |
|---|---|
| File | `bgplu.cap` |
| Packets | 22 |
| Duration | 4s |
| Size | 2.1 KB |
| Protocols | BGP · IP · TCP |

[Download `bgplu.cap`](/pcap/bgplu.cap)

Open it with `wireshark bgplu.cap` or inspect from the shell:

```bash
tshark -r bgplu.cap -c 20
tcpdump -r bgplu.cap -nn -v
```
