---
title: "No advertise community"
description: "BGP update packet with no-advertise community set [Community:NO_ADVERTISE (0xffffff02)]
A BGP router telling its BGP peer not to advertise this route to any other peer whether EBGP or IBGP."
icon: "📡"
tags: ["BGP", "IP", "TCP"]
date: 2026-08-31
capture_file: "no-advertise community.pcapng.cap"
packets: "2"
duration: "n/a"
filesize: "420 bytes"
---

<div class="intro-card">
BGP update packet with no-advertise community set [Community:NO_ADVERTISE (0xffffff02)]
A BGP router telling its BGP peer not to advertise this route to any other peer whether EBGP or IBGP.
</div>

| | |
|---|---|
| File | `no-advertise community.pcapng.cap` |
| Packets | 2 |
| Duration | n/a |
| Size | 420 bytes |
| Protocols | BGP · IP · TCP |

[Download `no-advertise community.pcapng.cap`](/pcap/no-advertise community.pcapng.cap)

Open it with `wireshark no-advertise community.pcapng.cap` or inspect from the shell:

```bash
tshark -r no-advertise community.pcapng.cap -c 20
tcpdump -r no-advertise community.pcapng.cap -nn -v
```

---

Archived from packetlife.net by Jeremy Stretch, offline since 2024.
