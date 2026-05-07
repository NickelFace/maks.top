---
title: "CCNA — 1.8 Концепции коммутации"
date: 2026-05-07
description: "Ethernet switch operation principles: MAC address learning, forwarding and flooding, MAC Address Table, Store-and-Forward/Cut-through modes, duplex mismatch."
tags: ["CCNA", "Cisco", "коммутация", "MAC-таблица", "Ethernet"]
categories: ["CCNA"]
page_lang: "en"
lang_pair: "/posts/ccna/ru/ccna-1-08-switching-concepts/"
---

**Exam topic:** 1.13 Describe switching concepts
**Odom:** Vol.1, Ch. 5 — Analyzing Ethernet LAN Switching

## How an Ethernet Switch Works

A switch makes frame-forwarding decisions based on **destination MAC addresses**, operating at Layer 2 (Data Link) of the OSI model.

### Three Core Actions

| Action | When | What Happens |
|---|---|---|
| **Learn** | On receiving any frame | Records Source MAC → incoming port in the MAC table |
| **Forward** | Destination MAC is **known** in the table | Forwards frame only to the correct port |
| **Flood** | Destination MAC is **unknown** | Sends frame out all ports in the VLAN (except the incoming port) |

> **Flooding** also applies to **broadcast** frames (FF:FF:FF:FF:FF:FF) and **multicast** (if IGMP Snooping is not configured).

---

## MAC Address Table (CAM Table)

```
show mac address-table
show mac address-table dynamic
show mac address-table count
```

**Entry structure:**
- VLAN
- MAC address
- Type (dynamic / static)
- Port

**Aging timer** — how long a dynamic entry is kept (default **300 sec = 5 minutes**):
```
mac address-table aging-time 300
```

If no traffic from a given MAC arrives within the aging time, the entry is deleted and the switch floods again for that address.

---

## Frame Forwarding Modes

| Mode | Description | Latency | CRC Check |
|---|---|---|---|
| **Store-and-Forward** | Receives entire frame, checks CRC, then forwards | High | Yes — errored frames are dropped |
| **Cut-through** | Forwards immediately after reading the destination address | Low | No |
| **Fragment-free** | Waits for first 64 bytes (collision check), then forwards | Medium | Partial |

> Cisco Catalyst uses **store-and-forward** by default. This is preferred — errored frames are not propagated.

---

## Duplex and Speed

```
interface GigabitEthernet0/1
 duplex full          ! full / half / auto
 speed 1000           ! 10 / 100 / 1000 / auto
```

**Duplex mismatch problem:**
- One end: full-duplex, other end: half-duplex
- Symptoms: late collisions, poor performance, CRC errors
- Diagnosis:

```
show interfaces GigabitEthernet0/1
! Check: "Duplex", "Speed", "input errors", "CRC", "collisions"
```

**Typical interface error counters:**

| Field | What it means |
|---|---|
| CRC | Corrupted frames — physical issue or duplex mismatch |
| Input errors | Total of all incoming frame errors |
| Runts | Frames < 64 bytes — sign of collisions |
| Giants | Frames > 1518 bytes |
| Late collisions | Collisions after byte 64 — duplex mismatch |

---

## Static and Dynamic MAC Entries

**Static entry** — does not age out, cannot be overwritten:
```
mac address-table static 0011.2233.4455 vlan 10 interface Gi0/1
```

**Clearing the MAC table:**
```
clear mac address-table dynamic
clear mac address-table dynamic interface Gi0/1
clear mac address-table dynamic vlan 10
```

---

## Unicast Flooding (Unknown Unicast Flood)

If the destination MAC is unknown, the switch floods. This is normal behavior for a new device. It becomes a problem when:
- The broadcast domain is very large
- Response frames are suppressed (asymmetric routing)
