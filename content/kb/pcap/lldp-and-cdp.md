---
title: "LLDP and CDP"
description: "LLDP and CDP advertisements sent between two switches, S1 and S2."
icon: "📡"
tags: ["CDP", "Ethernet", "LLC", "LLDP"]
date: 2026-08-31
capture_file: "LLDP_and_CDP.cap"
packets: "12"
duration: "98s"
filesize: "4.0 KB"
---

<div class="intro-card">
LLDP and CDP advertisements sent between two switches, S1 and S2.
</div>

| | |
|---|---|
| File | `LLDP_and_CDP.cap` |
| Packets | 12 |
| Duration | 98s |
| Size | 4.0 KB |
| Protocols | CDP · Ethernet · LLC · LLDP |

[Download `LLDP_and_CDP.cap`](/pcap/LLDP_and_CDP.cap)

Open it with `wireshark LLDP_and_CDP.cap` or inspect from the shell:

```bash
tshark -r LLDP_and_CDP.cap -c 20
tcpdump -r LLDP_and_CDP.cap -nn -v
```
