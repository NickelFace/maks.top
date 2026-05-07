---
title: "CCNA — 1.3 Physical Interfaces and Cables"
date: 2026-01-20
description: "Types of copper and fiber-optic Ethernet cables, T568A/B standards, connectors, Ethernet speed standards and IOS commands for interface configuration."
tags: ["CCNA", "Cisco", "Ethernet", "cables", "interfaces"]
categories: ["CCNA"]
page_lang: "en"
lang_pair: "/posts/ccna/ru/ccna-1-03-interfaces/"
---

## Ethernet Cable Types

### Copper Cables (UTP/STP)

| Cable Type | Usage | Standard |
|---|---|---|
| Straight-through | Different device types (PC → Switch, Switch → Router) | T568A↔T568A or T568B↔T568B |
| Crossover | Same device types (PC → PC, Switch → Switch) | T568A↔T568B |
| Rollover (Console) | PC (COM port) → Cisco console | Reversed connector |

### Cable Selection Guide

| Device A | Device B | Cable |
|---|---|---|
| PC (NIC) | Switch | Straight-through |
| PC (NIC) | PC (NIC) | Crossover |
| PC (NIC) | Router (Ethernet) | Crossover |
| Switch | Router (Ethernet) | Straight-through |
| Switch | Switch | Crossover |
| Router (Ethernet) | Router (Ethernet) | Crossover |
| PC (COM/USB) | Router/Switch Console | Rollover (console) |

> **💡 Tip:** Modern switches support **Auto-MDIX** — they automatically detect the cable type. With Auto-MDIX enabled, cable type does not matter. Enable it with: `(config-if)# mdix auto`

### T568A and T568B Pin Assignments

| Pin | T568A | T568B |
|:---:|---|---|
| 1 | White-Green | White-Orange |
| 2 | Green | Orange |
| 3 | White-Orange | White-Green |
| 4 | Blue | Blue |
| 5 | White-Blue | White-Blue |
| 6 | Orange | Green |
| 7 | White-Brown | White-Brown |
| 8 | Brown | Brown |

> **💡 Tip:** A straight-through cable uses the same standard on both ends (A–A or B–B). A crossover uses different standards (A–B). A rollover cable is mirrored (pin 1 → pin 8).

---

## Fiber-Optic Cables

| Type | Core | Distance | Usage |
|---|---|---|---|
| Single-Mode (SMF) | 8–10 µm | 100+ km | WAN, backbone |
| Multi-Mode (MMF) | 50–62.5 µm | Up to 2 km | LAN, data centers |

| Connector | Usage |
|---|---|
| LC (Lucent Connector) | Most common in SFP |
| SC (Subscriber Connector) | Enterprise networks |
| ST (Straight Tip) | Obsolete, industrial use |

---

## Ethernet Standards

| Standard | Speed | Medium | Max Length |
|---|---|---|---|
| 10BASE-T | 10 Mbps | UTP Cat 3 | 100 m |
| 100BASE-TX | 100 Mbps | UTP Cat 5 | 100 m |
| 1000BASE-T | 1 Gbps | UTP Cat 5e/6 | 100 m |
| 10GBASE-T | 10 Gbps | UTP Cat 6a | 100 m |
| 1000BASE-SX | 1 Gbps | MMF | 550 m |
| 1000BASE-LX | 1 Gbps | SMF/MMF | 10 km |

> **📌 Important:** UTP cable categories for CCNA:
> - Cat 5e → Gigabit Ethernet (1 Gbps)
> - Cat 6 → 10GbE up to 55 m
> - Cat 6a → 10GbE up to 100 m

---

## Console Connection to Cisco

For initial configuration without an IP address:

| Method | Cable | Terminal Settings |
|---|---|---|
| COM port → RJ-45 Console | Rollover (console) | 9600 baud, 8N1, no flow control |
| USB → Mini-USB Console | USB Type A → 5-pin Mini-B | Requires driver |

---

## IOS Commands for Interfaces

```bash
# View interfaces
Router# show interfaces
Router# show interfaces gigabitethernet 0/0
Router# show ip interface brief          # brief summary (IP, status)
Switch# show interfaces status           # switch port status

# Configure interface
Router(config)# interface gigabitethernet 0/0
Router(config-if)# description Link to ISP
Router(config-if)# ip address 192.168.1.1 255.255.255.0
Router(config-if)# no shutdown           # bring up interface
Router(config-if)# shutdown              # shut down

# Speed and duplex (switch)
Switch(config-if)# speed 100            # 10, 100, 1000, auto
Switch(config-if)# duplex full          # full, half, auto
Switch(config-if)# mdix auto            # Auto-MDIX

# Diagnostics
Router# show controllers serial 0/0/0   # DCE/DTE for serial interfaces
```

> **💡 Tip:** Interface status in `show ip interface brief`:
> - `up/up` — operating normally
> - `up/down` — physically connected, no protocol
> - `down/down` — no physical signal
> - `administratively down/down` — disabled with the `shutdown` command

---

## Resources

| Resource | Description |
|---|---|
| [Ethernet Cables — networklessons.com](https://networklessons.com/cisco/ccna-routing-switching-icnd1-100-105/ethernet-wiring) | Ethernet cable types: straight-through, crossover, rollover |
| [TIA/EIA-568 Standard — Wikipedia](https://en.wikipedia.org/wiki/ANSI/TIA-568) | Structured cabling standard, cable categories |
| [SFP vs SFP+ vs QSFP — Cisco](https://www.cisco.com/c/en/us/products/interfaces-modules/gigabit-interface-converter/index.html) | Cisco transceivers: GLC/SFP modules, types and speeds |
| [Fiber Optic Cables — networklessons.com](https://networklessons.com/cisco/ccna-routing-switching-icnd1-100-105/fiber-optic-cables) | Single-mode and multi-mode fiber, SC/LC connectors |
| [Jeremy's IT Lab — Ethernet LAN Switching (YouTube)](https://www.youtube.com/watch?v=DtXfP-5N_4k) | Cisco physical interfaces, speeds, Auto-MDIX |
| [IEEE 802.3 Ethernet Standards](https://standards.ieee.org/ieee/802.3/7071/) | Official IEEE 802.3 Ethernet standards |
