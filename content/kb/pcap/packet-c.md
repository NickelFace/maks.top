---
title: "Packet c"
description: "This is a packet capture from a SonicWall. We were troubleshooting DHCP packet flows. The SonicWall saw the DHCP Discover and Sent an Offer. We never saw the DHCP acknowledgement. In the adjacent core stacked switching we were running \"debug ip dhcp server packets\" we only saw discover packets from IP phones up to the SonicWall. For some reason the SonicWall could not let any other DHCP packets through or out of it INSIDE (LAN) interface. Even if we put an ANY-ANY ALC for that interface. We ended up having to replace the SonicWall and upload the configuration from the old SonicWall to the new one."
icon: "📡"
tags: ["BOOTP", "DNS", "HTTP", "IP", "LLC", "SKINNY", "SSL", "STP", "TCP", "UDP"]
date: 2026-08-31
capture_file: "packet-c.cap"
packets: "926"
duration: "13s"
filesize: "675.0 KB"
---

<div class="intro-card">
This is a packet capture from a SonicWall. We were troubleshooting DHCP packet flows. The SonicWall saw the DHCP Discover and Sent an Offer. We never saw the DHCP acknowledgement. In the adjacent core stacked switching we were running "debug ip dhcp server packets" we only saw discover packets from IP phones up to the SonicWall. For some reason the SonicWall could not let any other DHCP packets through or out of it INSIDE (LAN) interface. Even if we put an ANY-ANY ALC for that interface. We ended up having to replace the SonicWall and upload the configuration from the old SonicWall to the new one.
</div>

| | |
|---|---|
| File | `packet-c.cap` |
| Packets | 926 |
| Duration | 13s |
| Size | 675.0 KB |
| Protocols | BOOTP · DNS · HTTP · IP · LLC · SKINNY · SSL · STP · TCP · UDP |

[Download `packet-c.cap`](/pcap/packet-c.cap)

Open it with `wireshark packet-c.cap` or inspect from the shell:

```bash
tshark -r packet-c.cap -c 20
tcpdump -r packet-c.cap -nn -v
```

---

Archived from packetlife.net by Jeremy Stretch, offline since 2024.
