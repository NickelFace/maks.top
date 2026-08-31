---
title: "SNMP ipv4"
description: "SNMPv3 over IPv4."
icon: "📡"
tags: ["IP", "SNMP", "UDP"]
date: 2026-08-31
capture_file: "snmp-ipv4.cap"
packets: "2100"
duration: "2s"
filesize: "447.8 KB"
---

<div class="intro-card">
SNMPv3 over IPv4.
</div>

| | |
|---|---|
| File | `snmp-ipv4.cap` |
| Packets | 2100 |
| Duration | 2s |
| Size | 447.8 KB |
| Protocols | IP · SNMP · UDP |

[Download `snmp-ipv4.cap`](/pcap/snmp-ipv4.cap)

Open it with `wireshark snmp-ipv4.cap` or inspect from the shell:

```bash
tshark -r snmp-ipv4.cap -c 20
tcpdump -r snmp-ipv4.cap -nn -v
```
