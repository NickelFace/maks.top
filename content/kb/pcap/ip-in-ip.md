---
title: "IP in IP"
description: "Direct IP-in-IP tunnel encapsulation (configured in Cisco IOS with tunnel mode ipip)."
icon: "📡"
tags: ["Ethernet", "ICMP", "IP"]
date: 2026-08-31
capture_file: "IP_in_IP.cap"
packets: "10"
duration: "n/a"
filesize: "1.5 KB"
---

<div class="intro-card">
Direct IP-in-IP tunnel encapsulation (configured in Cisco IOS with tunnel mode ipip).
</div>

| | |
|---|---|
| File | `IP_in_IP.cap` |
| Packets | 10 |
| Duration | n/a |
| Size | 1.5 KB |
| Protocols | Ethernet · ICMP · IP |

[Download `IP_in_IP.cap`](/pcap/IP_in_IP.cap)

Open it with `wireshark IP_in_IP.cap` or inspect from the shell:

```bash
tshark -r IP_in_IP.cap -c 20
tcpdump -r IP_in_IP.cap -nn -v
```

---

Archived from packetlife.net by Jeremy Stretch, offline since 2024.
