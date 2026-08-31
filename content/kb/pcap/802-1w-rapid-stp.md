---
title: "802.1w rapid STP"
description: "Rapid Spanning Tree Protocol BPDUs are received from a Catalyst switch after connecting to a port not configured for PortFast. The port transitions through the blocking and learning states before issuing a topology change notification (packet #30) and transitioning to the forwarding state."
icon: "📡"
tags: ["Ethernet", "LLC", "STP"]
date: 2026-08-31
capture_file: "802.1w_rapid_STP.cap"
packets: "30"
duration: "56s"
filesize: "2.2 KB"
---

<div class="intro-card">
Rapid Spanning Tree Protocol BPDUs are received from a Catalyst switch after connecting to a port not configured for PortFast. The port transitions through the blocking and learning states before issuing a topology change notification (packet #30) and transitioning to the forwarding state.
</div>

| | |
|---|---|
| File | `802.1w_rapid_STP.cap` |
| Packets | 30 |
| Duration | 56s |
| Size | 2.2 KB |
| Protocols | Ethernet · LLC · STP |

[Download `802.1w_rapid_STP.cap`](/pcap/802.1w_rapid_STP.cap)

Open it with `wireshark 802.1w_rapid_STP.cap` or inspect from the shell:

```bash
tshark -r 802.1w_rapid_STP.cap -c 20
tcpdump -r 802.1w_rapid_STP.cap -nn -v
```
