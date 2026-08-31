---
title: "HDLC"
description: "ICMP across an HDLC serial link."
icon: "📡"
tags: ["CDP", "HDLC", "ICMP", "IP", "SLARP"]
date: 2026-08-31
capture_file: "HDLC.cap"
packets: "38"
duration: "111s"
filesize: "3.4 KB"
---

<div class="intro-card">
ICMP across an HDLC serial link.
</div>

| | |
|---|---|
| File | `HDLC.cap` |
| Packets | 38 |
| Duration | 111s |
| Size | 3.4 KB |
| Protocols | CDP · HDLC · ICMP · IP · SLARP |

[Download `HDLC.cap`](/pcap/HDLC.cap)

Open it with `wireshark HDLC.cap` or inspect from the shell:

```bash
tshark -r HDLC.cap -c 20
tcpdump -r HDLC.cap -nn -v
```

---

Archived from packetlife.net by Jeremy Stretch, offline since 2024.
