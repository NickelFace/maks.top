---
title: "TCP SACK"
description: "A TCP SACK option is included in packets #31, #33, #35, and #37. The missing segment is retransmitted in packet #38."
icon: "📡"
tags: ["Ethernet", "HTTP", "IP", "TCP"]
date: 2026-08-31
capture_file: "TCP_SACK.cap"
packets: "39"
duration: "n/a"
filesize: "27.5 KB"
---

<div class="intro-card">
A TCP SACK option is included in packets #31, #33, #35, and #37. The missing segment is retransmitted in packet #38.
</div>

| | |
|---|---|
| File | `TCP_SACK.cap` |
| Packets | 39 |
| Duration | n/a |
| Size | 27.5 KB |
| Protocols | Ethernet · HTTP · IP · TCP |

[Download `TCP_SACK.cap`](/pcap/TCP_SACK.cap)

Open it with `wireshark TCP_SACK.cap` or inspect from the shell:

```bash
tshark -r TCP_SACK.cap -c 20
tcpdump -r TCP_SACK.cap -nn -v
```
