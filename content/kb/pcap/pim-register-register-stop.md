---
title: "PIM register register stop"
description: "Switch at 192.168.0.6 receives an IGMP request for the group 239.1.2.3, encapsulates the original IGMP packet in a PIM Register and sends it to the RP at 192.168.1.254. In packet #2 RP sends a Register-Stop to the switch."
icon: "📡"
tags: ["Ethernet", "IP", "PIM"]
date: 2026-08-31
capture_file: "PIM_register_register-stop.cap"
packets: "2"
duration: "n/a"
filesize: "258 bytes"
---

<div class="intro-card">
Switch at 192.168.0.6 receives an IGMP request for the group 239.1.2.3, encapsulates the original IGMP packet in a PIM Register and sends it to the RP at 192.168.1.254. In packet #2 RP sends a Register-Stop to the switch.
</div>

| | |
|---|---|
| File | `PIM_register_register-stop.cap` |
| Packets | 2 |
| Duration | n/a |
| Size | 258 bytes |
| Protocols | Ethernet · IP · PIM |

[Download `PIM_register_register-stop.cap`](/pcap/PIM_register_register-stop.cap)

Open it with `wireshark PIM_register_register-stop.cap` or inspect from the shell:

```bash
tshark -r PIM_register_register-stop.cap -c 20
tcpdump -r PIM_register_register-stop.cap -nn -v
```

---

Archived from packetlife.net by Jeremy Stretch, offline since 2024.
