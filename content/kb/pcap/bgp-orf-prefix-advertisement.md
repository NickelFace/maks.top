---
title: "BGP orf prefix advertisement"
description: "BGP prefix list sent during route refresh when outbound route filtering is configured.
here we clearly see whether the prefix list is add or delete and permit or deny.
Also we can see the actual network/mask sent."
icon: "📡"
tags: ["BGP", "IP", "TCP"]
date: 2026-08-31
capture_file: "bgp orf prefix advertisement.pcapng.cap"
packets: "1"
duration: "n/a"
filesize: "336 bytes"
---

<div class="intro-card">
BGP prefix list sent during route refresh when outbound route filtering is configured.
here we clearly see whether the prefix list is add or delete and permit or deny.
Also we can see the actual network/mask sent.
</div>

| | |
|---|---|
| File | `bgp orf prefix advertisement.pcapng.cap` |
| Packets | 1 |
| Duration | n/a |
| Size | 336 bytes |
| Protocols | BGP · IP · TCP |

[Download `bgp orf prefix advertisement.pcapng.cap`](/pcap/bgp orf prefix advertisement.pcapng.cap)

Open it with `wireshark bgp orf prefix advertisement.pcapng.cap` or inspect from the shell:

```bash
tshark -r bgp orf prefix advertisement.pcapng.cap -c 20
tcpdump -r bgp orf prefix advertisement.pcapng.cap -nn -v
```
