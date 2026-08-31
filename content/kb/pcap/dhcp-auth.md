---
title: "Dhcp auth"
description: "Dhcp v4 Offer with Auth using Options 53,1,54,51,3,6,66,120,61,90,82"
icon: "📡"
tags: ["BOOTP", "IP", "UDP"]
date: 2026-08-31
capture_file: "dhcp-auth.cap"
packets: "1"
duration: "n/a"
filesize: "458 bytes"
---

<div class="intro-card">
Dhcp v4 Offer with Auth using Options 53,1,54,51,3,6,66,120,61,90,82
</div>

| | |
|---|---|
| File | `dhcp-auth.cap` |
| Packets | 1 |
| Duration | n/a |
| Size | 458 bytes |
| Protocols | BOOTP · IP · UDP |

[Download `dhcp-auth.cap`](/pcap/dhcp-auth.cap)

Open it with `wireshark dhcp-auth.cap` or inspect from the shell:

```bash
tshark -r dhcp-auth.cap -c 20
tcpdump -r dhcp-auth.cap -nn -v
```
