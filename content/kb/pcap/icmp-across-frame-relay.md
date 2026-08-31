---
title: "ICMP across frame relay"
description: "A Cisco 3725 pinging its neighbor across a point-to-point frame relay connection."
icon: "📡"
tags: ["Frame Relay", "ICMP", "IP"]
date: 2026-08-31
capture_file: "ICMP_across_frame_relay.cap"
packets: "10"
duration: "n/a"
filesize: "1.2 KB"
---

<div class="intro-card">
A Cisco 3725 pinging its neighbor across a point-to-point frame relay connection.
</div>

| | |
|---|---|
| File | `ICMP_across_frame_relay.cap` |
| Packets | 10 |
| Duration | n/a |
| Size | 1.2 KB |
| Protocols | Frame Relay · ICMP · IP |

[Download `ICMP_across_frame_relay.cap`](/pcap/ICMP_across_frame_relay.cap)

Open it with `wireshark ICMP_across_frame_relay.cap` or inspect from the shell:

```bash
tshark -r ICMP_across_frame_relay.cap -c 20
tcpdump -r ICMP_across_frame_relay.cap -nn -v
```
