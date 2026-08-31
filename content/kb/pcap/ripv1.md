---
title: "RIPv1"
description: "A RIPv1 router periodically flooding its database. Capture perspective from R1's 10.0.1.1 interface."
icon: "📡"
tags: ["Ethernet", "IP", "RIP", "UDP"]
date: 2026-08-31
capture_file: "RIPv1.cap"
packets: "6"
duration: "65s"
filesize: "876 bytes"
---

<div class="intro-card">
A RIPv1 router periodically flooding its database. Capture perspective from R1's 10.0.1.1 interface.
</div>

| | |
|---|---|
| File | `RIPv1.cap` |
| Packets | 6 |
| Duration | 65s |
| Size | 876 bytes |
| Protocols | Ethernet · IP · RIP · UDP |

[Download `RIPv1.cap`](/pcap/RIPv1.cap)

Open it with `wireshark RIPv1.cap` or inspect from the shell:

```bash
tshark -r RIPv1.cap -c 20
tcpdump -r RIPv1.cap -nn -v
```

---

Archived from packetlife.net by Jeremy Stretch, offline since 2024.
