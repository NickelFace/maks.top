---
title: "WCCPv2"
description: "WCCP communication captures between 7200 Router and a WCCP capable optimization device (In my case it is Riverbed's Stealhead 2050)"
icon: "📡"
tags: ["Ethernet", "IP", "UDP", "WCCP"]
date: 2026-08-31
capture_file: "WCCPv2.pcap.cap"
packets: "15"
duration: "27s"
filesize: "2.8 KB"
---

<div class="intro-card">
WCCP communication captures between 7200 Router and a WCCP capable optimization device (In my case it is Riverbed's Stealhead 2050)
</div>

| | |
|---|---|
| File | `WCCPv2.pcap.cap` |
| Packets | 15 |
| Duration | 27s |
| Size | 2.8 KB |
| Protocols | Ethernet · IP · UDP · WCCP |

[Download `WCCPv2.pcap.cap`](/pcap/WCCPv2.pcap.cap)

Open it with `wireshark WCCPv2.pcap.cap` or inspect from the shell:

```bash
tshark -r WCCPv2.pcap.cap -c 20
tcpdump -r WCCPv2.pcap.cap -nn -v
```

---

Archived from packetlife.net by Jeremy Stretch, offline since 2024.
