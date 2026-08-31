---
title: "QinQ"
description: "ARP requests having two vlan IDs attached (QinQ)"
icon: "📡"
tags: ["ARP", "Ethernet", "VLAN"]
date: 2026-08-31
capture_file: "QinQ.pcap.cap"
packets: "2"
duration: "2s"
filesize: "184 bytes"
---

<div class="intro-card">
ARP requests having two vlan IDs attached (QinQ)
</div>

| | |
|---|---|
| File | `QinQ.pcap.cap` |
| Packets | 2 |
| Duration | 2s |
| Size | 184 bytes |
| Protocols | ARP · Ethernet · VLAN |

[Download `QinQ.pcap.cap`](/pcap/QinQ.pcap.cap)

Open it with `wireshark QinQ.pcap.cap` or inspect from the shell:

```bash
tshark -r QinQ.pcap.cap -c 20
tcpdump -r QinQ.pcap.cap -nn -v
```

---

Archived from packetlife.net by Jeremy Stretch, offline since 2024.
