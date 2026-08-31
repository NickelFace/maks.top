---
title: "UDLD"
description: "Unidirectional Link Detection (UDLD) is used to monitor the status of a link between a Catalyst 2960 and a Catalyst 3560. Note that echos are initially sent at very small intervals, gradually throttling back to the configured interval of 15 seconds."
icon: "📡"
tags: ["Ethernet", "LLC", "UDLD"]
date: 2026-08-31
capture_file: "UDLD.cap"
packets: "29"
duration: "93s"
filesize: "3.3 KB"
---

<div class="intro-card">
Unidirectional Link Detection (UDLD) is used to monitor the status of a link between a Catalyst 2960 and a Catalyst 3560. Note that echos are initially sent at very small intervals, gradually throttling back to the configured interval of 15 seconds.
</div>

| | |
|---|---|
| File | `UDLD.cap` |
| Packets | 29 |
| Duration | 93s |
| Size | 3.3 KB |
| Protocols | Ethernet · LLC · UDLD |

[Download `UDLD.cap`](/pcap/UDLD.cap)

Open it with `wireshark UDLD.cap` or inspect from the shell:

```bash
tshark -r UDLD.cap -c 20
tcpdump -r UDLD.cap -nn -v
```

---

Archived from packetlife.net by Jeremy Stretch, offline since 2024.
