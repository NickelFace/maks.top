---
title: "DNS zone transfer axfr"
description: "DNS zone transfer AXFR"
icon: "📡"
tags: ["DNS", "IP", "TCP"]
date: 2026-08-31
capture_file: "dns-zone-transfer-axfr.cap"
packets: "9"
duration: "n/a"
filesize: "915 bytes"
---

<div class="intro-card">
DNS zone transfer AXFR
</div>

| | |
|---|---|
| File | `dns-zone-transfer-axfr.cap` |
| Packets | 9 |
| Duration | n/a |
| Size | 915 bytes |
| Protocols | DNS · IP · TCP |

[Download `dns-zone-transfer-axfr.cap`](/pcap/dns-zone-transfer-axfr.cap)

Open it with `wireshark dns-zone-transfer-axfr.cap` or inspect from the shell:

```bash
tshark -r dns-zone-transfer-axfr.cap -c 20
tcpdump -r dns-zone-transfer-axfr.cap -nn -v
```
