---
title: "IGMPv2 query and report"
description: "R1 issues IGMPv2 general membership queries to the 172.16.40.0/24 segment every 60 seconds. A host replies to each query reporting it belongs to the multicast group 239.255.255.250."
icon: "📡"
tags: ["Ethernet", "IGMP", "IP"]
date: 2026-08-31
capture_file: "IGMPv2_query_and_report.cap"
packets: "6"
duration: "126s"
filesize: "438 bytes"
---

<div class="intro-card">
R1 issues IGMPv2 general membership queries to the 172.16.40.0/24 segment every 60 seconds. A host replies to each query reporting it belongs to the multicast group 239.255.255.250.
</div>

| | |
|---|---|
| File | `IGMPv2_query_and_report.cap` |
| Packets | 6 |
| Duration | 126s |
| Size | 438 bytes |
| Protocols | Ethernet · IGMP · IP |

[Download `IGMPv2_query_and_report.cap`](/pcap/IGMPv2_query_and_report.cap)

Open it with `wireshark IGMPv2_query_and_report.cap` or inspect from the shell:

```bash
tshark -r IGMPv2_query_and_report.cap -c 20
tcpdump -r IGMPv2_query_and_report.cap -nn -v
```
