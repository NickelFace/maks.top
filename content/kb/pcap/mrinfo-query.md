---
title: "Mrinfo query"
description: "mrinfo 2.2.2.2 is issued on R1. DVMRPv3 is used to query R2 for its multicast interfaces."
icon: "📡"
tags: ["DVMRP", "Ethernet", "IGMP", "IP"]
date: 2026-08-31
capture_file: "mrinfo_query.cap"
packets: "2"
duration: "n/a"
filesize: "182 bytes"
---

<div class="intro-card">
mrinfo 2.2.2.2 is issued on R1. DVMRPv3 is used to query R2 for its multicast interfaces.
</div>

| | |
|---|---|
| File | `mrinfo_query.cap` |
| Packets | 2 |
| Duration | n/a |
| Size | 182 bytes |
| Protocols | DVMRP · Ethernet · IGMP · IP |

[Download `mrinfo_query.cap`](/pcap/mrinfo_query.cap)

Open it with `wireshark mrinfo_query.cap` or inspect from the shell:

```bash
tshark -r mrinfo_query.cap -c 20
tcpdump -r mrinfo_query.cap -nn -v
```
