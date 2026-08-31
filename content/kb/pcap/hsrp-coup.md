---
title: "HSRP coup"
description: "Initially only routers 3 (active) and 2 (standby) are online. R1 comes online with a priority higher than R3's. R1 takes over as the active router (the coup occurs in packet #22) almost immediately. R2 is bumped down to passive and R3 becomes the standby router."
icon: "📡"
tags: ["Ethernet", "HSRP", "IP", "UDP"]
date: 2026-08-31
capture_file: "HSRP_coup.cap"
packets: "51"
duration: "49s"
filesize: "3.9 KB"
---

<div class="intro-card">
Initially only routers 3 (active) and 2 (standby) are online. R1 comes online with a priority higher than R3's. R1 takes over as the active router (the coup occurs in packet #22) almost immediately. R2 is bumped down to passive and R3 becomes the standby router.
</div>

| | |
|---|---|
| File | `HSRP_coup.cap` |
| Packets | 51 |
| Duration | 49s |
| Size | 3.9 KB |
| Protocols | Ethernet · HSRP · IP · UDP |

[Download `HSRP_coup.cap`](/pcap/HSRP_coup.cap)

Open it with `wireshark HSRP_coup.cap` or inspect from the shell:

```bash
tshark -r HSRP_coup.cap -c 20
tcpdump -r HSRP_coup.cap -nn -v
```

---

Archived from packetlife.net by Jeremy Stretch, offline since 2024.
