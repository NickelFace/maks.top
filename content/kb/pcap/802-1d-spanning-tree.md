---
title: "802.1D spanning tree"
description: "IEEE 802.1D Spanning Tree Protocol (STP) advertisements sent every two seconds."
icon: "📡"
tags: ["Ethernet", "LLC", "STP"]
date: 2026-08-31
capture_file: "802.1D_spanning_tree.cap"
packets: "14"
duration: "26s"
filesize: "1.1 KB"
---

<div class="intro-card">
IEEE 802.1D Spanning Tree Protocol (STP) advertisements sent every two seconds.
</div>

| | |
|---|---|
| File | `802.1D_spanning_tree.cap` |
| Packets | 14 |
| Duration | 26s |
| Size | 1.1 KB |
| Protocols | Ethernet · LLC · STP |

[Download `802.1D_spanning_tree.cap`](/pcap/802.1D_spanning_tree.cap)

Open it with `wireshark 802.1D_spanning_tree.cap` or inspect from the shell:

```bash
tshark -r 802.1D_spanning_tree.cap -c 20
tcpdump -r 802.1D_spanning_tree.cap -nn -v
```

---

Archived from packetlife.net by Jeremy Stretch, offline since 2024.
