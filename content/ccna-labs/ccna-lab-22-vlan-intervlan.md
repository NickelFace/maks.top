---
title: "Lab 22-1 — VLAN and Inter-VLAN Routing"
date: 2026-05-07
description: "Configuring VLANs, trunk ports, Router-on-a-Stick, and SVI on an L3 switch"
tags: ["CCNA", "Cisco", "Lab", "VLAN", "Trunk", "Router-on-a-Stick", "SVI"]
categories: ["CCNA"]
page_lang: "en"
lang_pair: "/ccna-labs/ru/ccna-lab-22-vlan-intervlan/"
---

## Overview

Configure VLANs on switches, trunk ports, Inter-VLAN routing via Router-on-a-Stick, and via an L3 switch (SVI).

## Topology

```
PC1 (VLAN 10) ----SW1----trunk----R1 (Router-on-a-Stick)
PC2 (VLAN 20) ----SW1
PC3 (VLAN 10) ----SW2----trunk----SW1
PC4 (VLAN 20) ----SW2
```

VLAN 10: Engineering 10.10.10.0/24  
VLAN 20: Sales 10.10.20.0/24

## Tasks

### VLANs and Access Ports
1. Create VLAN 10 and VLAN 20 on SW1 and SW2: `vlan 10` → `name Engineering`
2. Configure access ports for PCs:
   ```
   SW1(config-if)#switchport mode access
   SW1(config-if)#switchport access vlan 10
   ```
3. Verify that PCs in the same VLAN can ping each other

### Trunk Ports
4. Configure the trunk between SW1 and SW2:
   ```
   SW1(config-if)#switchport mode trunk
   ```
5. Configure the trunk between SW1 and R1

### Router-on-a-Stick
6. Configure subinterfaces on R1:
   ```
   R1(config)#interface g0/0.10
   R1(config-subif)#encapsulation dot1Q 10
   R1(config-subif)#ip address 10.10.10.1 255.255.255.0
   R1(config)#interface g0/0.20
   R1(config-subif)#encapsulation dot1Q 20
   R1(config-subif)#ip address 10.10.20.1 255.255.255.0
   ```
7. Verify Inter-VLAN routing: PC1 (VLAN10) → ping → PC2 (VLAN20)

### L3 Switch SVI (Alternative)
8. Configure SVIs on the L3 switch:
   ```
   SW(config)#ip routing
   SW(config)#interface vlan 10
   SW(config-if)#ip address 10.10.10.1 255.255.255.0
   SW(config)#interface vlan 20
   SW(config-if)#ip address 10.10.20.1 255.255.255.0
   ```

## Key Commands

```
SW1(config)#vlan 10
SW1(config-vlan)#name Engineering
SW1(config-if)#switchport mode access
SW1(config-if)#switchport access vlan 10
SW1(config-if)#switchport mode trunk
SW1(config-if)#switchport trunk allowed vlan 10,20
SW1#show vlan brief
SW1#show interfaces trunk
R1(config-subif)#encapsulation dot1Q 10
SW(config)#ip routing
```
