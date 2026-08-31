---
title: "DHCP Inter VLAN"
description: "R1 is a router-on-a-stick. It receives a DHCP Discover on the trunk interface, it sets the \"Relay agent IP address\" to the sub-interface's IP address it received the packet on and, finally, it forwards it to the DHCP server. Capture perspective is R1-DHCP server link."
icon: "📡"
tags: ["BOOTP", "Ethernet", "IP", "UDP"]
date: 2026-08-31
capture_file: "DHCP_Inter_VLAN.cap"
packets: "4"
duration: "n/a"
filesize: "2.0 KB"
---

<div class="intro-card">
R1 is a router-on-a-stick. It receives a DHCP Discover on the trunk interface, it sets the "Relay agent IP address" to the sub-interface's IP address it received the packet on and, finally, it forwards it to the DHCP server. Capture perspective is R1-DHCP server link.
</div>

| | |
|---|---|
| File | `DHCP_Inter_VLAN.cap` |
| Packets | 4 |
| Duration | n/a |
| Size | 2.0 KB |
| Protocols | BOOTP · Ethernet · IP · UDP |

[Download `DHCP_Inter_VLAN.cap`](/pcap/DHCP_Inter_VLAN.cap)

Open it with `wireshark DHCP_Inter_VLAN.cap` or inspect from the shell:

```bash
tshark -r DHCP_Inter_VLAN.cap -c 20
tcpdump -r DHCP_Inter_VLAN.cap -nn -v
```

---

Archived from packetlife.net by Jeremy Stretch, offline since 2024.
