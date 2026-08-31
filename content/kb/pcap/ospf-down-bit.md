---
title: "OSPF Down Bit"
description: "LSA Update with down bit set. 
Router R5 56.0.0.5 PE is receiving an update from the MPLS VPN, which is advertised to CE 56.0.0.6 ospf routing table. In order for for the packet(LSA) not to be re-advertised back into the MPLS cloud through another PE(2) router, PE sets the Down-bit to 1.
filter: ospf.v2.options.dn == 1"
icon: "📡"
tags: ["CDP", "HDLC", "IP", "OSPF", "SLARP"]
date: 2026-08-31
capture_file: "OSPF_Down-Bit.cap"
packets: "98"
duration: "203s"
filesize: "8.9 KB"
---

<div class="intro-card">
LSA Update with down bit set. 
Router R5 56.0.0.5 PE is receiving an update from the MPLS VPN, which is advertised to CE 56.0.0.6 ospf routing table. In order for for the packet(LSA) not to be re-advertised back into the MPLS cloud through another PE(2) router, PE sets the Down-bit to 1.
filter: ospf.v2.options.dn == 1
</div>

| | |
|---|---|
| File | `OSPF_Down-Bit.cap` |
| Packets | 98 |
| Duration | 203s |
| Size | 8.9 KB |
| Protocols | CDP · HDLC · IP · OSPF · SLARP |

[Download `OSPF_Down-Bit.cap`](/pcap/OSPF_Down-Bit.cap)

Open it with `wireshark OSPF_Down-Bit.cap` or inspect from the shell:

```bash
tshark -r OSPF_Down-Bit.cap -c 20
tcpdump -r OSPF_Down-Bit.cap -nn -v
```

---

Archived from packetlife.net by Jeremy Stretch, offline since 2024.
