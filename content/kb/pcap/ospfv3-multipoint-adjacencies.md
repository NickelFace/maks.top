---
title: "OSPFv3 multipoint adjacencies"
description: "The frame relay link connecting routers 1, 2, and 3 has been configured as a point-to-multipoint network with broadcast capability. Router 3 forms OSPFv3 adjacencies with routers 1 and 2, but no DR or BDR is elected."
icon: "📡"
tags: ["Frame Relay", "IPv6", "OSPF"]
date: 2026-08-31
capture_file: "OSPFv3_multipoint_adjacencies.cap"
packets: "73"
duration: "35s"
filesize: "11.5 KB"
---

<div class="intro-card">
The frame relay link connecting routers 1, 2, and 3 has been configured as a point-to-multipoint network with broadcast capability. Router 3 forms OSPFv3 adjacencies with routers 1 and 2, but no DR or BDR is elected.
</div>

| | |
|---|---|
| File | `OSPFv3_multipoint_adjacencies.cap` |
| Packets | 73 |
| Duration | 35s |
| Size | 11.5 KB |
| Protocols | Frame Relay · IPv6 · OSPF |

[Download `OSPFv3_multipoint_adjacencies.cap`](/pcap/OSPFv3_multipoint_adjacencies.cap)

Open it with `wireshark OSPFv3_multipoint_adjacencies.cap` or inspect from the shell:

```bash
tshark -r OSPFv3_multipoint_adjacencies.cap -c 20
tcpdump -r OSPFv3_multipoint_adjacencies.cap -nn -v
```

---

Archived from packetlife.net by Jeremy Stretch, offline since 2024.
