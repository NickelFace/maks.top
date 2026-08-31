---
title: "SFLOW"
description: "SFLOW capture containing
- counter sample packets
- flow sample packet"
icon: "📡"
tags: ["IP", "SFLOW", "UDP"]
date: 2026-08-31
capture_file: "sflow.cap"
packets: "9"
duration: "109s"
filesize: "1.8 KB"
---

<div class="intro-card">
SFLOW capture containing
- counter sample packets
- flow sample packet
</div>

| | |
|---|---|
| File | `sflow.cap` |
| Packets | 9 |
| Duration | 109s |
| Size | 1.8 KB |
| Protocols | IP · SFLOW · UDP |

[Download `sflow.cap`](/pcap/sflow.cap)

Open it with `wireshark sflow.cap` or inspect from the shell:

```bash
tshark -r sflow.cap -c 20
tcpdump -r sflow.cap -nn -v
```

---

Archived from packetlife.net by Jeremy Stretch, offline since 2024.
