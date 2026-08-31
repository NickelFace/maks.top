---
title: "IBGP adjacency"
description: "Routers 3 and 4 form an internal BGP relationship. This is evidenced by the OPEN messages in packets #4 and #5, which show both routers belong to the same AS (65300). Also note that IBGP packets are not subject to a limited TTL as are EBGP packets."
icon: "📡"
tags: ["BGP", "Ethernet", "IP", "TCP"]
date: 2026-08-31
capture_file: "IBGP_adjacency.cap"
packets: "17"
duration: "63s"
filesize: "2.3 KB"
---

<div class="intro-card">
Routers 3 and 4 form an internal BGP relationship. This is evidenced by the OPEN messages in packets #4 and #5, which show both routers belong to the same AS (65300). Also note that IBGP packets are not subject to a limited TTL as are EBGP packets.
</div>

| | |
|---|---|
| File | `IBGP_adjacency.cap` |
| Packets | 17 |
| Duration | 63s |
| Size | 2.3 KB |
| Protocols | BGP · Ethernet · IP · TCP |

[Download `IBGP_adjacency.cap`](/pcap/IBGP_adjacency.cap)

Open it with `wireshark IBGP_adjacency.cap` or inspect from the shell:

```bash
tshark -r IBGP_adjacency.cap -c 20
tcpdump -r IBGP_adjacency.cap -nn -v
```
