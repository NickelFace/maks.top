---
title: "BGP hard reset"
description: "A hard reset (clear ip bgp) is performed on R1 for its adjacency with R2. Packet #7 shows R1 sending a packet with the TCP FIN flag set, indicating the connection is to be torn down. The TCP connection is then reestablished and UPDATEs are retransmitted."
icon: "📡"
tags: ["BGP", "Ethernet", "IP", "TCP"]
date: 2026-08-31
capture_file: "BGP_hard_reset.cap"
packets: "32"
duration: "208s"
filesize: "3.2 KB"
---

<div class="intro-card">
A hard reset (clear ip bgp) is performed on R1 for its adjacency with R2. Packet #7 shows R1 sending a packet with the TCP FIN flag set, indicating the connection is to be torn down. The TCP connection is then reestablished and UPDATEs are retransmitted.
</div>

| | |
|---|---|
| File | `BGP_hard_reset.cap` |
| Packets | 32 |
| Duration | 208s |
| Size | 3.2 KB |
| Protocols | BGP · Ethernet · IP · TCP |

[Download `BGP_hard_reset.cap`](/pcap/BGP_hard_reset.cap)

Open it with `wireshark BGP_hard_reset.cap` or inspect from the shell:

```bash
tshark -r BGP_hard_reset.cap -c 20
tcpdump -r BGP_hard_reset.cap -nn -v
```

---

Archived from packetlife.net by Jeremy Stretch, offline since 2024.
