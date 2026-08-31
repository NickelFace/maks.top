---
title: "Telnet"
description: "Telnetting from one router to another. Note that all communication is visible in clear text."
icon: "📡"
tags: ["Ethernet", "IP", "TCP", "Telnet"]
date: 2026-08-31
capture_file: "telnet.cap"
packets: "74"
duration: "10s"
filesize: "9.4 KB"
---

<div class="intro-card">
Telnetting from one router to another. Note that all communication is visible in clear text.
</div>

| | |
|---|---|
| File | `telnet.cap` |
| Packets | 74 |
| Duration | 10s |
| Size | 9.4 KB |
| Protocols | Ethernet · IP · TCP · Telnet |

[Download `telnet.cap`](/pcap/telnet.cap)

Open it with `wireshark telnet.cap` or inspect from the shell:

```bash
tshark -r telnet.cap -c 20
tcpdump -r telnet.cap -nn -v
```

---

Archived from packetlife.net by Jeremy Stretch, offline since 2024.
