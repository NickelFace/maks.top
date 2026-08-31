---
title: "OSPFv3 NBMA adjacencies"
description: "Router 3 forms OSPFv3 adjacencies with routers 1 and two across the non-broadcast multi-access (NBMA) frame relay link."
icon: "📡"
tags: ["Frame Relay", "IPv6", "OSPF"]
date: 2026-08-31
capture_file: "OSPFv3_NBMA_adjacencies.cap"
packets: "86"
duration: "90s"
filesize: "12.9 KB"
---

<div class="intro-card">
Router 3 forms OSPFv3 adjacencies with routers 1 and two across the non-broadcast multi-access (NBMA) frame relay link.
</div>

| | |
|---|---|
| File | `OSPFv3_NBMA_adjacencies.cap` |
| Packets | 86 |
| Duration | 90s |
| Size | 12.9 KB |
| Protocols | Frame Relay · IPv6 · OSPF |

[Download `OSPFv3_NBMA_adjacencies.cap`](/pcap/OSPFv3_NBMA_adjacencies.cap)

Open it with `wireshark OSPFv3_NBMA_adjacencies.cap` or inspect from the shell:

```bash
tshark -r OSPFv3_NBMA_adjacencies.cap -c 20
tcpdump -r OSPFv3_NBMA_adjacencies.cap -nn -v
```

---

Archived from packetlife.net by Jeremy Stretch, offline since 2024.
