---
title: "Cm4116 Telnet"
description: "Short Telnet session with an Opengear CM4116 used to demonstrate the urgent flag and pointer"
icon: "📡"
tags: ["Ethernet", "IP", "TCP", "Telnet"]
date: 2026-08-31
capture_file: "cm4116_telnet.cap"
packets: "113"
duration: "14s"
filesize: "9.4 KB"
---

<div class="intro-card">
Short Telnet session with an Opengear CM4116 used to demonstrate the urgent flag and pointer
</div>

| | |
|---|---|
| File | `cm4116_telnet.cap` |
| Packets | 113 |
| Duration | 14s |
| Size | 9.4 KB |
| Protocols | Ethernet · IP · TCP · Telnet |

[Download `cm4116_telnet.cap`](/pcap/cm4116_telnet.cap)

Open it with `wireshark cm4116_telnet.cap` or inspect from the shell:

```bash
tshark -r cm4116_telnet.cap -c 20
tcpdump -r cm4116_telnet.cap -nn -v
```
