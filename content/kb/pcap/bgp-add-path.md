---
title: "BGP add path"
description: "BGP additional path feature.
https://tools.ietf.org/html/draft-ietf-idr-add-paths-10"
icon: "📡"
tags: ["BGP", "IP", "TCP"]
date: 2026-08-31
capture_file: "bgp-add-path.cap"
packets: "9"
duration: "54s"
filesize: "1.1 KB"
---

<div class="intro-card">
BGP additional path feature.
https://tools.ietf.org/html/draft-ietf-idr-add-paths-10
</div>

| | |
|---|---|
| File | `bgp-add-path.cap` |
| Packets | 9 |
| Duration | 54s |
| Size | 1.1 KB |
| Protocols | BGP · IP · TCP |

[Download `bgp-add-path.cap`](/pcap/bgp-add-path.cap)

Open it with `wireshark bgp-add-path.cap` or inspect from the shell:

```bash
tshark -r bgp-add-path.cap -c 20
tcpdump -r bgp-add-path.cap -nn -v
```
