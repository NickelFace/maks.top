---
title: "DTP"
description: "Dynamic Trunking Protocol (DTP) emanated from a Catalyst 3560 every 60 seconds, both with and without ISL encapsulation."
icon: "📡"
tags: ["DTP", "Ethernet", "ISL", "LLC"]
date: 2026-08-31
capture_file: "DTP.cap"
packets: "10"
duration: "120s"
filesize: "934 bytes"
---

<div class="intro-card">
Dynamic Trunking Protocol (DTP) emanated from a Catalyst 3560 every 60 seconds, both with and without ISL encapsulation.
</div>

| | |
|---|---|
| File | `DTP.cap` |
| Packets | 10 |
| Duration | 120s |
| Size | 934 bytes |
| Protocols | DTP · Ethernet · ISL · LLC |

[Download `DTP.cap`](/pcap/DTP.cap)

Open it with `wireshark DTP.cap` or inspect from the shell:

```bash
tshark -r DTP.cap -c 20
tcpdump -r DTP.cap -nn -v
```

---

Archived from packetlife.net by Jeremy Stretch, offline since 2024.
