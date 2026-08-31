---
title: "IGMP V2"
description: "All IGMP V2 requests : Query General, Query specfic group, Join specific group, leave specific group"
icon: "📡"
tags: ["IGMP", "IP"]
date: 2026-08-31
capture_file: "IGMP_V2.cap"
packets: "18"
duration: "133s"
filesize: "1.3 KB"
---

<div class="intro-card">
All IGMP V2 requests : Query General, Query specfic group, Join specific group, leave specific group
</div>

| | |
|---|---|
| File | `IGMP_V2.cap` |
| Packets | 18 |
| Duration | 133s |
| Size | 1.3 KB |
| Protocols | IGMP · IP |

[Download `IGMP_V2.cap`](/pcap/IGMP_V2.cap)

Open it with `wireshark IGMP_V2.cap` or inspect from the shell:

```bash
tshark -r IGMP_V2.cap -c 20
tcpdump -r IGMP_V2.cap -nn -v
```
