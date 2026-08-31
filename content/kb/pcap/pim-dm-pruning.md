---
title: "PIM DM pruning"
description: "The multicast source at 172.16.40.10 begins sending traffic to the group 239.123.123.123, and PIM-DM floods the traffic down the tree. R4 has no group members, and prunes itself from the tree. R2 and R3 then realize they have no members, and each prunes itself from the tree. The capture shows R2 receiving the multicast traffic flooded from R1 and subsequently pruning itself every three minutes."
icon: "📡"
tags: ["Ethernet", "IP", "PIM", "UDP"]
date: 2026-08-31
capture_file: "PIM-DM_pruning.cap"
packets: "38"
duration: "415s"
filesize: "10.2 KB"
---

<div class="intro-card">
The multicast source at 172.16.40.10 begins sending traffic to the group 239.123.123.123, and PIM-DM floods the traffic down the tree. R4 has no group members, and prunes itself from the tree. R2 and R3 then realize they have no members, and each prunes itself from the tree. The capture shows R2 receiving the multicast traffic flooded from R1 and subsequently pruning itself every three minutes.
</div>

| | |
|---|---|
| File | `PIM-DM_pruning.cap` |
| Packets | 38 |
| Duration | 415s |
| Size | 10.2 KB |
| Protocols | Ethernet · IP · PIM · UDP |

[Download `PIM-DM_pruning.cap`](/pcap/PIM-DM_pruning.cap)

Open it with `wireshark PIM-DM_pruning.cap` or inspect from the shell:

```bash
tshark -r PIM-DM_pruning.cap -c 20
tcpdump -r PIM-DM_pruning.cap -nn -v
```
