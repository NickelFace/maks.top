---
title: "ISIS p2p adjacency"
description: "Routers 1 and 2 form a L1/L2 adjacency over a point-to-point serial link. Note that both levels of adjacency are managed with a point-to-point (P2P) hello."
icon: "📡"
tags: ["HDLC", "ISIS"]
date: 2026-08-31
capture_file: "ISIS_p2p_adjacency.cap"
packets: "26"
duration: "113s"
filesize: "21.7 KB"
---

<div class="intro-card">
Routers 1 and 2 form a L1/L2 adjacency over a point-to-point serial link. Note that both levels of adjacency are managed with a point-to-point (P2P) hello.
</div>

| | |
|---|---|
| File | `ISIS_p2p_adjacency.cap` |
| Packets | 26 |
| Duration | 113s |
| Size | 21.7 KB |
| Protocols | HDLC · ISIS |

[Download `ISIS_p2p_adjacency.cap`](/pcap/ISIS_p2p_adjacency.cap)

Open it with `wireshark ISIS_p2p_adjacency.cap` or inspect from the shell:

```bash
tshark -r ISIS_p2p_adjacency.cap -c 20
tcpdump -r ISIS_p2p_adjacency.cap -nn -v
```

---

Archived from packetlife.net by Jeremy Stretch, offline since 2024.
