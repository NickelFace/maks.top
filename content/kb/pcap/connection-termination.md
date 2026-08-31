---
title: "Connection termination"
description: "This is a connection termination packet in which both the server and client sends fin & ack to each other.For details of how connection is been teared down by both client and server see the link below.http://www.firewall.cx/networking-topics/protocols/tcp/136-tcp-flag-options.html"
icon: "📡"
tags: ["IP", "TCP"]
date: 2026-08-31
capture_file: "connection termination.cap"
packets: "4"
duration: "n/a"
filesize: "316 bytes"
---

<div class="intro-card">
This is a connection termination packet in which both the server and client sends fin & ack to each other.For details of how connection is been teared down by both client and server see the link below.http://www.firewall.cx/networking-topics/protocols/tcp/136-tcp-flag-options.html
</div>

| | |
|---|---|
| File | `connection termination.cap` |
| Packets | 4 |
| Duration | n/a |
| Size | 316 bytes |
| Protocols | IP · TCP |

[Download `connection termination.cap`](/pcap/connection termination.cap)

Open it with `wireshark connection termination.cap` or inspect from the shell:

```bash
tshark -r connection termination.cap -c 20
tcpdump -r connection termination.cap -nn -v
```

---

Archived from packetlife.net by Jeremy Stretch, offline since 2024.
