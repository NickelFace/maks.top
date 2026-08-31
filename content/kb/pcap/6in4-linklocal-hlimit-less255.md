---
title: "6in4 linklocal hlimit less255"
description: "Illegal packet: IPv4 (protocol 41) + IPv6 (hop limit = 100) + ICMPv6 Router Advertisement.  The illegal part is that hop limit of IPv6 neighbor discovery protocol (NDP) packets cannot be less than 255."
icon: "📡"
tags: ["ICMPv6", "IP", "IPv6"]
date: 2026-08-31
capture_file: "6in4-linklocal-hlimit-less255.pcapng.cap"
packets: "1"
duration: "n/a"
filesize: "444 bytes"
---

<div class="intro-card">
Illegal packet: IPv4 (protocol 41) + IPv6 (hop limit = 100) + ICMPv6 Router Advertisement.  The illegal part is that hop limit of IPv6 neighbor discovery protocol (NDP) packets cannot be less than 255.
</div>

| | |
|---|---|
| File | `6in4-linklocal-hlimit-less255.pcapng.cap` |
| Packets | 1 |
| Duration | n/a |
| Size | 444 bytes |
| Protocols | ICMPv6 · IP · IPv6 |

[Download `6in4-linklocal-hlimit-less255.pcapng.cap`](/pcap/6in4-linklocal-hlimit-less255.pcapng.cap)

Open it with `wireshark 6in4-linklocal-hlimit-less255.pcapng.cap` or inspect from the shell:

```bash
tshark -r 6in4-linklocal-hlimit-less255.pcapng.cap -c 20
tcpdump -r 6in4-linklocal-hlimit-less255.pcapng.cap -nn -v
```
