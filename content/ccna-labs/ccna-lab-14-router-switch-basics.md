---
title: "Lab 14 — Cisco Router and Switch Basics"
date: 2026-10-11
description: "Basic router and switch configuration: CDP, speed/duplex, interface descriptions"
tags: ["CCNA", "Cisco", "Lab", "CDP", "Interfaces"]
categories: ["CCNA"]
page_lang: "en"
lang_pair: "/ccna-labs/ru/ccna-lab-14-router-switch-basics/"
---

## Overview

Basic router and switch configuration, CDP, and speed/duplex management.

## Topology

```
R1 (F0/0: 10.10.10.1) ----F0/1-[ SW1 (Vlan1: 10.10.10.10) ]-F0/2---- R2 (F0/0: 10.10.10.2)
```

## Tasks

### Basic Configuration
1. Configure the hostname on R1, R2, and SW1
2. Assign an IP to R1 F0/0 → 10.10.10.1/24
3. Assign an IP to R2 F0/0 → 10.10.10.2/24
4. Assign a management IP to SW1 (Vlan1) → 10.10.10.10/24
5. Set the default gateway on SW1: `SW1(config)#ip default-gateway 10.10.10.2`
6. Verify the ping from SW1 to the gateway
7. Add descriptions to interfaces: `description Link to R1`
8. Verify speed/duplex auto-negotiation (SW1 F0/1): `show interface f0/1` → Full-duplex, 100Mb/s

### Manual Speed/Duplex Configuration
9. SW1 F0/2: `speed 100` + `duplex full`
10. R2 F0/0: `speed 100` + `duplex full`
11. Check the IOS version: `SW1#show version`

### CDP
12. View neighbors: `SW1#show cdp neighbors`
13. Disable CDP on SW1 F0/1: `no cdp enable`
14. Reset the CDP cache on R1: `R1(config)#no cdp run` → `cdp run`
15. Confirm R1 no longer sees SW1: `R1#show cdp neighbors`

### Interface Diagnostics
16. Check the status of SW1 F0/2: `show ip interface brief`
17. Shut down F0/2 → verify administratively down
18. `no shutdown` → verify recovery
19. Set `duplex half` → F0/2 goes down (mismatch with R2)
20. Restore to `duplex full`
21. Set `speed 10` → F0/2 goes down/down on R2

## Key Commands

```
R1(config)#hostname R1
R1(config)#interface fastEthernet 0/0
R1(config-if)#ip address 10.10.10.1 255.255.255.0
R1(config-if)#no shutdown
R1(config-if)#description Link to SW1
SW1(config)#interface vlan 1
SW1(config-if)#ip address 10.10.10.10 255.255.255.0
SW1(config)#ip default-gateway 10.10.10.2
SW1(config-if)#speed 100
SW1(config-if)#duplex full
SW1#show cdp neighbors
SW1(config-if)#no cdp enable
R1(config)#no cdp run
R1(config)#cdp run
SW1#show version
SW1#show interface f0/2
```
