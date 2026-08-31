---
title: "OSPF multipoint adjacencies"
description: "Routers 1 through 4 are configured to view the non-broadcast frame relay network as a point-to-multipoint topology. Adjacencies are formed without the need of a DR or BDR. Note that inverse ARP was used to dynamically learn the addresses of neighbors."
icon: "📡"
tags: ["ARP", "Frame Relay", "IP", "LMI", "OSPF", "Q933"]
date: 2026-08-31
capture_file: "OSPF_multipoint_adjacencies.cap"
packets: "196"
duration: "277s"
filesize: "16.3 KB"
---

<div class="intro-card">
Routers 1 through 4 are configured to view the non-broadcast frame relay network as a point-to-multipoint topology. Adjacencies are formed without the need of a DR or BDR. Note that inverse ARP was used to dynamically learn the addresses of neighbors.
</div>

| | |
|---|---|
| File | `OSPF_multipoint_adjacencies.cap` |
| Packets | 196 |
| Duration | 277s |
| Size | 16.3 KB |
| Protocols | ARP · Frame Relay · IP · LMI · OSPF · Q933 |

[Download `OSPF_multipoint_adjacencies.cap`](/pcap/OSPF_multipoint_adjacencies.cap)

Open it with `wireshark OSPF_multipoint_adjacencies.cap` or inspect from the shell:

```bash
tshark -r OSPF_multipoint_adjacencies.cap -c 20
tcpdump -r OSPF_multipoint_adjacencies.cap -nn -v
```

---

Archived from packetlife.net by Jeremy Stretch, offline since 2024.
