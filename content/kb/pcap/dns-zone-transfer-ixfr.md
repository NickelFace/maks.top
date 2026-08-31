---
title: "DNS zone transfer ixfr"
description: "DNS Zone transfer, both AXFR and IXFR"
icon: "📡"
tags: ["DNS", "IP", "UDP"]
date: 2026-08-31
capture_file: "dns-zone-transfer-ixfr.cap"
packets: "2"
duration: "n/a"
filesize: "442 bytes"
---

<div class="intro-card">
DNS Zone transfer, both AXFR and IXFR
</div>

| | |
|---|---|
| File | `dns-zone-transfer-ixfr.cap` |
| Packets | 2 |
| Duration | n/a |
| Size | 442 bytes |
| Protocols | DNS · IP · UDP |

[Download `dns-zone-transfer-ixfr.cap`](/pcap/dns-zone-transfer-ixfr.cap)

Open it with `wireshark dns-zone-transfer-ixfr.cap` or inspect from the shell:

```bash
tshark -r dns-zone-transfer-ixfr.cap -c 20
tcpdump -r dns-zone-transfer-ixfr.cap -nn -v
```
