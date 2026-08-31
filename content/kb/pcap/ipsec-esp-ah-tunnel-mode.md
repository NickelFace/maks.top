---
title: "IPsec ESP AH tunnel mode"
description: "Encrypted ICMP across an IPsec tunnel. AH and ESP headers are present."
icon: "📡"
tags: ["AH", "ESP", "Ethernet", "IP"]
date: 2026-08-31
capture_file: "IPsec_ESP-AH_tunnel_mode.cap"
packets: "10"
duration: "n/a"
filesize: "2.1 KB"
---

<div class="intro-card">
Encrypted ICMP across an IPsec tunnel. AH and ESP headers are present.
</div>

| | |
|---|---|
| File | `IPsec_ESP-AH_tunnel_mode.cap` |
| Packets | 10 |
| Duration | n/a |
| Size | 2.1 KB |
| Protocols | AH · ESP · Ethernet · IP |

[Download `IPsec_ESP-AH_tunnel_mode.cap`](/pcap/IPsec_ESP-AH_tunnel_mode.cap)

Open it with `wireshark IPsec_ESP-AH_tunnel_mode.cap` or inspect from the shell:

```bash
tshark -r IPsec_ESP-AH_tunnel_mode.cap -c 20
tcpdump -r IPsec_ESP-AH_tunnel_mode.cap -nn -v
```
