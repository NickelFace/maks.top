---
title: "RADIUS"
description: "A RADIUS authentication request is issued from a switch at 10.0.0.1 on behalf of an EAP client. The user authenticates via MD5 challenge with the username \"John.McGuirk\" and the password \"S0cc3r\"."
icon: "📡"
tags: ["Ethernet", "IP", "RADIUS", "UDP"]
date: 2026-08-31
capture_file: "RADIUS.cap"
packets: "4"
duration: "n/a"
filesize: "775 bytes"
---

<div class="intro-card">
A RADIUS authentication request is issued from a switch at 10.0.0.1 on behalf of an EAP client. The user authenticates via MD5 challenge with the username "John.McGuirk" and the password "S0cc3r".
</div>

| | |
|---|---|
| File | `RADIUS.cap` |
| Packets | 4 |
| Duration | n/a |
| Size | 775 bytes |
| Protocols | Ethernet · IP · RADIUS · UDP |

[Download `RADIUS.cap`](/pcap/RADIUS.cap)

Open it with `wireshark RADIUS.cap` or inspect from the shell:

```bash
tshark -r RADIUS.cap -c 20
tcpdump -r RADIUS.cap -nn -v
```

---

Archived from packetlife.net by Jeremy Stretch, offline since 2024.
