---
title: "TACACS+ encrypted"
description: "TACACS+ authentication and authorization requests as made by a Cisco IOS router upon a user logging in via Telnet."
icon: "📡"
tags: ["Ethernet", "IP", "TACACS+", "TCP"]
date: 2026-08-31
capture_file: "TACACS+_encrypted.cap"
packets: "34"
duration: "7s"
filesize: "2.8 KB"
---

<div class="intro-card">
TACACS+ authentication and authorization requests as made by a Cisco IOS router upon a user logging in via Telnet.
</div>

| | |
|---|---|
| File | `TACACS+_encrypted.cap` |
| Packets | 34 |
| Duration | 7s |
| Size | 2.8 KB |
| Protocols | Ethernet · IP · TACACS+ · TCP |

[Download `TACACS+_encrypted.cap`](/pcap/TACACS+_encrypted.cap)

Open it with `wireshark TACACS+_encrypted.cap` or inspect from the shell:

```bash
tshark -r TACACS+_encrypted.cap -c 20
tcpdump -r TACACS+_encrypted.cap -nn -v
```

---

Archived from packetlife.net by Jeremy Stretch, offline since 2024.
