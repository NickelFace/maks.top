---
title: "HTTP"
description: "Simple HTTP transfer of a PNG image using wget"
icon: "📡"
tags: ["Ethernet", "HTTP", "IP", "TCP"]
date: 2026-08-31
capture_file: "HTTP.cap"
packets: "40"
duration: "n/a"
filesize: "24.9 KB"
---

<div class="intro-card">
Simple HTTP transfer of a PNG image using wget
</div>

| | |
|---|---|
| File | `HTTP.cap` |
| Packets | 40 |
| Duration | n/a |
| Size | 24.9 KB |
| Protocols | Ethernet · HTTP · IP · TCP |

[Download `HTTP.cap`](/pcap/HTTP.cap)

Open it with `wireshark HTTP.cap` or inspect from the shell:

```bash
tshark -r HTTP.cap -c 20
tcpdump -r HTTP.cap -nn -v
```

---

Archived from packetlife.net by Jeremy Stretch, offline since 2024.
