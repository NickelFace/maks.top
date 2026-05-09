---
title: "Lab 22-1 — VLAN and Inter-VLAN Routing"
date: 2026-10-28
description: "Настройка VLAN, trunk-портов, Router-on-a-Stick и SVI на L3-коммутаторе"
tags: ["CCNA", "Cisco", "Lab", "VLAN", "Trunk", "Router-on-a-Stick", "SVI"]
categories: ["CCNA"]
page_lang: "ru"
lang_pair: "/ccna-labs/ccna-lab-22-vlan-intervlan/"
pagefind_ignore: true
build:
  list: never
  render: always
---

## Описание

Настройка VLANs на коммутаторах, trunk-портов, Inter-VLAN Routing через Router-on-a-Stick и через L3-коммутатор (SVI).

## Топология

```
PC1 (VLAN 10) ----SW1----trunk----R1 (Router-on-a-Stick)
PC2 (VLAN 20) ----SW1
PC3 (VLAN 10) ----SW2----trunk----SW1
PC4 (VLAN 20) ----SW2
```

VLAN 10: Engineering 10.10.10.0/24  
VLAN 20: Sales 10.10.20.0/24

## Задачи

### VLANs и Access Ports
1. Создать VLAN 10 и 20 на SW1 и SW2: `vlan 10` → `name Engineering`
2. Настроить access-порты для PC:
   ```
   SW1(config-if)#switchport mode access
   SW1(config-if)#switchport access vlan 10
   ```
3. Убедиться, что PC в одном VLAN пингуют друг друга

### Trunk Ports
4. Настроить trunk между SW1 и SW2:
   ```
   SW1(config-if)#switchport mode trunk
   ```
5. Настроить trunk между SW1 и R1

### Router-on-a-Stick
6. На R1 настроить subinterfaces:
   ```
   R1(config)#interface g0/0.10
   R1(config-subif)#encapsulation dot1Q 10
   R1(config-subif)#ip address 10.10.10.1 255.255.255.0
   R1(config)#interface g0/0.20
   R1(config-subif)#encapsulation dot1Q 20
   R1(config-subif)#ip address 10.10.20.1 255.255.255.0
   ```
7. Проверить Inter-VLAN routing: PC1 (VLAN10) → ping → PC2 (VLAN20)

### L3 Switch SVI (альтернатива)
8. На L3-коммутаторе настроить SVIs:
   ```
   SW(config)#ip routing
   SW(config)#interface vlan 10
   SW(config-if)#ip address 10.10.10.1 255.255.255.0
   SW(config)#interface vlan 20
   SW(config-if)#ip address 10.10.20.1 255.255.255.0
   ```

## Ключевые команды

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
