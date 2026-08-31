---
title: "4 byte AS numbers Full Support"
description: "Router at 172.16.1.2 (hostname \"D\", AS 40.1 / 2621441) clears a previous established peering with 172.16.1.1 (hostname \"A\", AS 10.1 / 655361); They both support 32-bit ASN."
icon: "📡"
tags: ["BGP", "HDLC", "IP", "TCP"]
date: 2026-08-31
capture_file: "4-byte_AS_numbers_Full_Support.cap"
packets: "9"
duration: "56s"
filesize: "1.2 KB"
---

<div class="intro-card">
Router at 172.16.1.2 (hostname "D", AS 40.1 / 2621441) clears a previous established peering with 172.16.1.1 (hostname "A", AS 10.1 / 655361); They both support 32-bit ASN.
</div>

| | |
|---|---|
| File | `4-byte_AS_numbers_Full_Support.cap` |
| Packets | 9 |
| Duration | 56s |
| Size | 1.2 KB |
| Protocols | BGP · HDLC · IP · TCP |

[Download `4-byte_AS_numbers_Full_Support.cap`](/pcap/4-byte_AS_numbers_Full_Support.cap)

Open it with `wireshark 4-byte_AS_numbers_Full_Support.cap` or inspect from the shell:

```bash
tshark -r 4-byte_AS_numbers_Full_Support.cap -c 20
tcpdump -r 4-byte_AS_numbers_Full_Support.cap -nn -v
```
