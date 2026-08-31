---
title: "DECnet Phone"
description: "A DECnet Phone session, using the Linux DECnet stack and a clone/port of the OpenVMS eponymous tool."
icon: "📡"
tags: ["DEC_DNA", "Ethernet"]
date: 2026-08-31
capture_file: "DECnet_Phone.pcap.cap"
packets: "139"
duration: "100s"
filesize: "7.5 KB"
---

<div class="intro-card">
A DECnet Phone session, using the Linux DECnet stack and a clone/port of the OpenVMS eponymous tool.
</div>

| | |
|---|---|
| File | `DECnet_Phone.pcap.cap` |
| Packets | 139 |
| Duration | 100s |
| Size | 7.5 KB |
| Protocols | DEC_DNA · Ethernet |

[Download `DECnet_Phone.pcap.cap`](/pcap/DECnet_Phone.pcap.cap)

Open it with `wireshark DECnet_Phone.pcap.cap` or inspect from the shell:

```bash
tshark -r DECnet_Phone.pcap.cap -c 20
tcpdump -r DECnet_Phone.pcap.cap -nn -v
```
