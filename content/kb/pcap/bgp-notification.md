---
title: "BGP notification"
description: "R1 has been misconfigured to expect R2 to reside in AS 65100. R2 attempts to peer with R1 advertising itself correctly in AS 65200. R1 issues a NOTIFICATION in packet #5 citing a \"bad peer AS\" error and terminates the TCP connection."
icon: "📡"
tags: ["BGP", "Ethernet", "IP", "TCP"]
date: 2026-08-31
capture_file: "BGP_notification.cap"
packets: "9"
duration: "n/a"
filesize: "764 bytes"
---

<div class="intro-card">
R1 has been misconfigured to expect R2 to reside in AS 65100. R2 attempts to peer with R1 advertising itself correctly in AS 65200. R1 issues a NOTIFICATION in packet #5 citing a "bad peer AS" error and terminates the TCP connection.
</div>

| | |
|---|---|
| File | `BGP_notification.cap` |
| Packets | 9 |
| Duration | n/a |
| Size | 764 bytes |
| Protocols | BGP · Ethernet · IP · TCP |

[Download `BGP_notification.cap`](/pcap/BGP_notification.cap)

Open it with `wireshark BGP_notification.cap` or inspect from the shell:

```bash
tshark -r BGP_notification.cap -c 20
tcpdump -r BGP_notification.cap -nn -v
```

---

Archived from packetlife.net by Jeremy Stretch, offline since 2024.
