---
title: "Gratuitous ARP HSRP"
description: "When router take the role of active in hsrp it sends a gratuitous arp in which source mac is 00:00:0c:07:ac:01, the switches update their mac table for the newly learned mac and starts forwarding to that port."
icon: "📡"
tags: ["ARP"]
date: 2026-08-31
capture_file: "gratuitous arp hsrp.cap"
packets: "6"
duration: "6s"
filesize: "480 bytes"
---

<div class="intro-card">
When router take the role of active in hsrp it sends a gratuitous arp in which source mac is 00:00:0c:07:ac:01, the switches update their mac table for the newly learned mac and starts forwarding to that port.
</div>

| | |
|---|---|
| File | `gratuitous arp hsrp.cap` |
| Packets | 6 |
| Duration | 6s |
| Size | 480 bytes |
| Protocols | ARP |

[Download `gratuitous arp hsrp.cap`](/pcap/gratuitous arp hsrp.cap)

Open it with `wireshark gratuitous arp hsrp.cap` or inspect from the shell:

```bash
tshark -r gratuitous arp hsrp.cap -c 20
tcpdump -r gratuitous arp hsrp.cap -nn -v
```
