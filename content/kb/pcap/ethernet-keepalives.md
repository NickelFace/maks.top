---
title: "Ethernet keepalives"
description: "Loopback keepalives transmitted by an Ethernet interface."
icon: "📡"
tags: ["Ethernet", "LOOP"]
date: 2026-08-31
capture_file: "Ethernet_keepalives.cap"
packets: "13"
duration: "120s"
filesize: "1012 bytes"
---

<div class="intro-card">
Loopback keepalives transmitted by an Ethernet interface.
</div>

| | |
|---|---|
| File | `Ethernet_keepalives.cap` |
| Packets | 13 |
| Duration | 120s |
| Size | 1012 bytes |
| Protocols | Ethernet · LOOP |

[Download `Ethernet_keepalives.cap`](/pcap/Ethernet_keepalives.cap)

Open it with `wireshark Ethernet_keepalives.cap` or inspect from the shell:

```bash
tshark -r Ethernet_keepalives.cap -c 20
tcpdump -r Ethernet_keepalives.cap -nn -v
```

---

Archived from packetlife.net by Jeremy Stretch, offline since 2024.
