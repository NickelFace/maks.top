---
title: "EBGP adjacency"
description: "The external BGP adjacency between routers 1 and 2 is brought online and routes are exchanged. Keepalives are then exchanged every 60 seconds. Note that the IP TTL (normally 1) has been increased to 2 with ebgp-multihop to facilitate communication between the routers' loopback interfaces."
icon: "📡"
tags: ["BGP", "Ethernet", "IP", "TCP"]
date: 2026-08-31
capture_file: "EBGP_adjacency.cap"
packets: "24"
duration: "182s"
filesize: "2.7 KB"
---

<div class="intro-card">
The external BGP adjacency between routers 1 and 2 is brought online and routes are exchanged. Keepalives are then exchanged every 60 seconds. Note that the IP TTL (normally 1) has been increased to 2 with ebgp-multihop to facilitate communication between the routers' loopback interfaces.
</div>

| | |
|---|---|
| File | `EBGP_adjacency.cap` |
| Packets | 24 |
| Duration | 182s |
| Size | 2.7 KB |
| Protocols | BGP · Ethernet · IP · TCP |

[Download `EBGP_adjacency.cap`](/pcap/EBGP_adjacency.cap)

Open it with `wireshark EBGP_adjacency.cap` or inspect from the shell:

```bash
tshark -r EBGP_adjacency.cap -c 20
tcpdump -r EBGP_adjacency.cap -nn -v
```
