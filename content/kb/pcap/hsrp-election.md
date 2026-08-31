---
title: "HSRP election"
description: "The Ethernet link shared by routers 1, 2, and 3 comes online. R1 wins the HSRP election because it has a priority of 200 (versus the default of 100 held by the other two routers). R3 becomes the standby router."
icon: "📡"
tags: ["Ethernet", "HSRP", "IP", "UDP"]
date: 2026-08-31
capture_file: "HSRP_election.cap"
packets: "49"
duration: "57s"
filesize: "3.7 KB"
---

<div class="intro-card">
The Ethernet link shared by routers 1, 2, and 3 comes online. R1 wins the HSRP election because it has a priority of 200 (versus the default of 100 held by the other two routers). R3 becomes the standby router.
</div>

| | |
|---|---|
| File | `HSRP_election.cap` |
| Packets | 49 |
| Duration | 57s |
| Size | 3.7 KB |
| Protocols | Ethernet · HSRP · IP · UDP |

[Download `HSRP_election.cap`](/pcap/HSRP_election.cap)

Open it with `wireshark HSRP_election.cap` or inspect from the shell:

```bash
tshark -r HSRP_election.cap -c 20
tcpdump -r HSRP_election.cap -nn -v
```
