---
title: "PIM SM join prune"
description: "A host on R4's 172.16.20.0/24 subnet requests to join the 239.123.123.123 group. R4 sends a PIMv2 join message up to the RP (R1). Subsequent join messages are sent every 30 seconds, until R4 determines it no longer has any interested hosts and sends a prune request (packet #45). PIMv1 RP-Reachable messages for the group are also visible from R1."
icon: "📡"
tags: ["Ethernet", "IGMP", "IP", "PIM"]
date: 2026-08-31
capture_file: "PIM-SM_join_prune.cap"
packets: "47"
duration: "473s"
filesize: "3.8 KB"
---

<div class="intro-card">
A host on R4's 172.16.20.0/24 subnet requests to join the 239.123.123.123 group. R4 sends a PIMv2 join message up to the RP (R1). Subsequent join messages are sent every 30 seconds, until R4 determines it no longer has any interested hosts and sends a prune request (packet #45). PIMv1 RP-Reachable messages for the group are also visible from R1.
</div>

| | |
|---|---|
| File | `PIM-SM_join_prune.cap` |
| Packets | 47 |
| Duration | 473s |
| Size | 3.8 KB |
| Protocols | Ethernet · IGMP · IP · PIM |

[Download `PIM-SM_join_prune.cap`](/pcap/PIM-SM_join_prune.cap)

Open it with `wireshark PIM-SM_join_prune.cap` or inspect from the shell:

```bash
tshark -r PIM-SM_join_prune.cap -c 20
tcpdump -r PIM-SM_join_prune.cap -nn -v
```

---

Archived from packetlife.net by Jeremy Stretch, offline since 2024.
