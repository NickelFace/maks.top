---
title: "DHCP MessageType 10,11,12 and 13"
description: "Access Concentrator/router queries lease for particular IP addresses using message type as \"DHCP LEASE QUERY\" and gets response as DHCP LEASE ACTIVE,LEASE UNASSIGNED and LEASE UNKNOWN."
icon: "📡"
tags: ["BOOTP", "Ethernet", "IP", "UDP"]
date: 2026-08-31
capture_file: "DHCP_MessageType 10,11,12 and 13.cap"
packets: "6"
duration: "13s"
filesize: "1.9 KB"
---

<div class="intro-card">
Access Concentrator/router queries lease for particular IP addresses using message type as "DHCP LEASE QUERY" and gets response as DHCP LEASE ACTIVE,LEASE UNASSIGNED and LEASE UNKNOWN.
</div>

| | |
|---|---|
| File | `DHCP_MessageType 10,11,12 and 13.cap` |
| Packets | 6 |
| Duration | 13s |
| Size | 1.9 KB |
| Protocols | BOOTP · Ethernet · IP · UDP |

[Download `DHCP_MessageType 10,11,12 and 13.cap`](/pcap/DHCP_MessageType 10,11,12 and 13.cap)

Open it with `wireshark DHCP_MessageType 10,11,12 and 13.cap` or inspect from the shell:

```bash
tshark -r DHCP_MessageType 10,11,12 and 13.cap -c 20
tcpdump -r DHCP_MessageType 10,11,12 and 13.cap -nn -v
```
