---
title: "BGP AS set"
description: "Packet #15 includes a BGP update containing both an AS sequence and an AS set in its AS path attribute."
icon: "📡"
tags: ["BGP", "Ethernet", "IP", "TCP"]
date: 2026-08-31
capture_file: "BGP_AS_set.cap"
packets: "18"
duration: "1s"
filesize: "1.6 KB"
---

<div class="intro-card">
Packet #15 includes a BGP update containing both an AS sequence and an AS set in its AS path attribute.
</div>

| | |
|---|---|
| File | `BGP_AS_set.cap` |
| Packets | 18 |
| Duration | 1s |
| Size | 1.6 KB |
| Protocols | BGP · Ethernet · IP · TCP |

[Download `BGP_AS_set.cap`](/pcap/BGP_AS_set.cap)

Open it with `wireshark BGP_AS_set.cap` or inspect from the shell:

```bash
tshark -r BGP_AS_set.cap -c 20
tcpdump -r BGP_AS_set.cap -nn -v
```

---

Archived from packetlife.net by Jeremy Stretch, offline since 2024.
