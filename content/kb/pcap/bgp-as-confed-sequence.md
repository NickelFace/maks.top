---
title: "BGP as confed sequence"
description: "AS confederation sequence set in the BGP updates. Confederations are used to minimize IBGP mesh between BGP speakers but IBGP rules apply between EBGP sub confederation peers. AS confederation sequence are an ordered list of Autonomous systems passed within confederations."
icon: "📡"
tags: ["BGP", "IP", "TCP"]
date: 2026-08-31
capture_file: "bgp as confed sequence.pcapng.cap"
packets: "1"
duration: "n/a"
filesize: "432 bytes"
---

<div class="intro-card">
AS confederation sequence set in the BGP updates. Confederations are used to minimize IBGP mesh between BGP speakers but IBGP rules apply between EBGP sub confederation peers. AS confederation sequence are an ordered list of Autonomous systems passed within confederations.
</div>

| | |
|---|---|
| File | `bgp as confed sequence.pcapng.cap` |
| Packets | 1 |
| Duration | n/a |
| Size | 432 bytes |
| Protocols | BGP · IP · TCP |

[Download `bgp as confed sequence.pcapng.cap`](/pcap/bgp as confed sequence.pcapng.cap)

Open it with `wireshark bgp as confed sequence.pcapng.cap` or inspect from the shell:

```bash
tshark -r bgp as confed sequence.pcapng.cap -c 20
tcpdump -r bgp as confed sequence.pcapng.cap -nn -v
```
