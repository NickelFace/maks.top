---
title: "4 byte AS numbers Mixed Scenario"
description: "Router \"B\" (AS 2) at 172.16.3.2 does not support 4-byte AS numbers, while router \"A\" (AS 10.1 / 655361) at 172.16.3.1 does."
icon: "📡"
tags: ["BGP", "HDLC", "IP", "TCP"]
date: 2026-08-31
capture_file: "4-byte_AS_numbers_Mixed_Scenario.cap"
packets: "4"
duration: "60s"
filesize: "414 bytes"
---

<div class="intro-card">
Router "B" (AS 2) at 172.16.3.2 does not support 4-byte AS numbers, while router "A" (AS 10.1 / 655361) at 172.16.3.1 does.
</div>

| | |
|---|---|
| File | `4-byte_AS_numbers_Mixed_Scenario.cap` |
| Packets | 4 |
| Duration | 60s |
| Size | 414 bytes |
| Protocols | BGP · HDLC · IP · TCP |

[Download `4-byte_AS_numbers_Mixed_Scenario.cap`](/pcap/4-byte_AS_numbers_Mixed_Scenario.cap)

Open it with `wireshark 4-byte_AS_numbers_Mixed_Scenario.cap` or inspect from the shell:

```bash
tshark -r 4-byte_AS_numbers_Mixed_Scenario.cap -c 20
tcpdump -r 4-byte_AS_numbers_Mixed_Scenario.cap -nn -v
```

---

Archived from packetlife.net by Jeremy Stretch, offline since 2024.
