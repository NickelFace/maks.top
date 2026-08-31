---
title: "SNMPv2c get requests"
description: "SNMPv2c get requests are issued from a manager to an SNMP agent in order to monitor the bandwidth utilization of an interface."
icon: "📡"
tags: ["Ethernet", "IP", "SNMP", "UDP"]
date: 2026-08-31
capture_file: "SNMPv2c_get_requests.cap"
packets: "8"
duration: "n/a"
filesize: "894 bytes"
---

<div class="intro-card">
SNMPv2c get requests are issued from a manager to an SNMP agent in order to monitor the bandwidth utilization of an interface.
</div>

| | |
|---|---|
| File | `SNMPv2c_get_requests.cap` |
| Packets | 8 |
| Duration | n/a |
| Size | 894 bytes |
| Protocols | Ethernet · IP · SNMP · UDP |

[Download `SNMPv2c_get_requests.cap`](/pcap/SNMPv2c_get_requests.cap)

Open it with `wireshark SNMPv2c_get_requests.cap` or inspect from the shell:

```bash
tshark -r SNMPv2c_get_requests.cap -c 20
tcpdump -r SNMPv2c_get_requests.cap -nn -v
```

---

Archived from packetlife.net by Jeremy Stretch, offline since 2024.
