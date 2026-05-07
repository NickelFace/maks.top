---
title: "Lab 11 — Cisco Device Functions"
date: 2026-05-07
description: "Exploring the switch MAC address table and the router routing table"
tags: ["CCNA", "Cisco", "Lab", "MAC-table", "Routing Table"]
categories: ["CCNA"]
page_lang: "en"
lang_pair: "/ccna-labs/ru/ccna-lab-11-device-functions/"
---

## Overview

Exploring the MAC address table on Cisco IOS switches and the routing table on routers. Guided walkthrough.

## Topology

```
        R2 (G0/0)
        |  F0/2
   F0/1 |  
       SW1 ----F0/24---- SW2
   F0/3 |               F0/4  F0/3
        |               |      |
       R1 (G0/0, G0/1)  R4    R3
       10.10.10.1       10.10.10.4  10.10.10.3
```

All routers are pre-configured on the **10.10.10.0/24** network.

## Tasks

### Verify Router Interfaces
1. Log in to R1–R4 and check which interface is active in the 10.10.10.0/24 network: `show ip interface brief`
2. Note the MAC addresses of the active interfaces: `show interface gi0/0`

### Switch MAC Address Table
3. On SW1, view the MAC address table: `show mac address-table`
4. Ping all routers from R1, then view the MAC address table again — it will be populated
5. On SW2, view the MAC address table: `show mac address-table`

### Routing Table
6. On R1, view the routing table: `show ip route`
7. Interpret the output: Connected (C), Static (S), protocol codes
8. Understand how R1 knows its routes (Connected vs. learned)

## Key Commands

```
R1#show ip interface brief
R1#show interface gigabitEthernet 0/0
SW1#show mac address-table
SW1#show mac address-table dynamic
R1#show ip route
```

> **💡 Tip:**
> The MAC address table is empty on first inspection — generate traffic (ping) to populate it. The switch learns MAC addresses only when it receives a frame.
