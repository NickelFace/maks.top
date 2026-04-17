---
title: "Network Engineer — 07. IP Addressing (IPv4/IPv6)"
date: 2025-10-18
description: "Diploma project: IPv4/IPv6 address space planning, VLANs, management networks, link-local addressing"
tags: ["Networking", "IPv4", "IPv6", "VLAN", "Cisco", "OTUS"]
categories: ["Network Engineer"]
code_toggle: true
lang_pair: "/posts/neteng/ru/neteng-07-ipv4-ipv6/"
---

# IP Addressing — Diploma Project

<p class="ru-text">IP адресация для Дипломной работы</p>

## IPv4 — Full Network

<p class="ru-text">IPv4 на всю сеть</p>

![image](/img/neteng/diplom/1.png)

## Assignment

<p class="ru-text">Домашнее задание</p>

**Goal:** Plan and document the address space for the lab topology. Configure IPs on all active ports. Assign each VPC to its own VLAN in every office. Configure management VLANs for network devices. Optimize link usage and prevent broadcast storms. Use both IPv4 and IPv6.

<p class="ru-text">Цель: распланировать адресное пространство, настроить IP на всех активных портах, настроить каждый VPC в своём VLAN, настроить VLAN управления, использовать IPv4 и IPv6.</p>

### ISPs (Providers)

<p class="ru-text">Наши провайдеры:</p>

- **Kitorn**
- **Lamas**
- **Triada**

| Device | Port | IPv4 | Note | Region |
| ---------- | ---- | ----------------- | --------------- | ------ |
| R22 | e0/0 | 100.100.100.2/30 | R14 (Msk) | Kitorn |
| | e0/1 | 110.110.110.1/30 | R21 (Lamas) | |
| | e0/2 | 100.100.100.5/30 | R23 (Triada) | |
| R21 | e0/0 | 111.111.111.2/30 | R15 (Msk) | Lamas |
| | e0/1 | 110.110.110.2/30 | R22 (Kitorn) | |
| | e0/2 | 111.111.111.5/30 | R24 (Triada) | |
| R23 | e0/0 | 100.100.100.6/30 | R22 (Kitorn) | Triada |
| | e0/1 | 10.10.30.5/30 | R25 (Triada) | |
| | e0/2 | 10.10.30.1/30 | R24 (Triada) | |
| R24 | e0/0 | 111.111.111.6/30 | R21 (Lamas) | |
| | e0/1 | 10.10.30.13/30 | R26 (Triada) | |
| | e0/2 | 10.10.30.2/30 | R23 (Triada) | |
| | e0/3 | 111.111.111.9/30 | R18 (Spb) | |
| R25 | e0/0 | 10.10.30.6/30 | R23 (Triada) | |
| | e0/1 | 210.110.35.1/30 | R27 (Labytnangi) | |
| | e0/2 | 10.10.30.9/30 | R26 (Triada) | |
| | e0/3 | 111.110.35.9/30 | R28 (Chukordah) | |
| R26 | e0/0 | 10.10.30.14/30 | R24 (Triada) | |
| | e0/1 | 111.110.35.13/30 | R28 (Chukordah) | |
| | e0/2 | 10.10.30.10/30 | R25 (Triada) | |
| | e0/3 | 111.111.111.13/30 | R18 (Spb) | |

### Moscow Office

<p class="ru-text">За Москву</p>

| Device | Port | IPv4 | Note | IP-Loopback | Region |
| ---------- | ---- | ---------------- | ------------------ | ----------- | ------ |
| R15 | e0/0 | 10.10.10.5 | R13 (local) | 1.1.1.15/32 | MOSCOW |
| | e0/1 | 10.10.10.9 | R12 (local) | | |
| | e0/2 | 111.111.111.1/30 | R21 (Lamas) | | |
| | e0/3 | 10.10.10.1 | R20 (local) | | |
| R14 | e0/0 | 10.10.10.17 | R12 (local) | 1.1.1.14/32 | |
| | e0/1 | 10.10.10.21 | R13 (local) | | |
| | e0/2 | 100.100.100.1/30 | R22 (Kitorn) | | |
| | e0/3 | 10.10.10.13 | R19 (local) | | |
| R13 | e0/0 | 172.16.1.2/24 | Aggregation channel | 1.1.1.13/32 | |
| | e0/2 | 10.10.10.6 | R15 (local) | | |
| | e0/3 | 10.10.10.22 | R14 (local) | | |
| R12 | e0/0 | 172.16.0.1/24 | Aggregation channel | 1.1.1.12/32 | |
| | e0/2 | 10.10.10.18 | R14 (local) | | |
| | e0/3 | 10.10.10.10 | R15 (local) | | |
| R19 | e0/0 | 10.10.10.14 | R14 (local) | | |
| R20 | e0/0 | 10.10.10.2 | R15 (local) | | |
| SW2 | | | | 1.1.1.2/32 | |
| SW3 | | | | 1.1.1.3/32 | |
| SW4 | | | | 1.1.1.4/32 | |
| SW5 | | | | 1.1.1.5/32 | |

### Saint Petersburg Office

<p class="ru-text">За Санкт-Петербург</p>

| Device | Port | IPv4 | Note | IP-Loopback | Region |
| --------- | ---- | ----------------- | ------------------ | ----------- | ------------ |
| R18 | e0/0 | 10.10.20.5 | R16 (local) | 1.1.2.18 | St. Petersburg |
| | e0/1 | 10.10.20.1 | R17 (local) | | |
| | e0/2 | 111.111.111.10/30 | R24 (Triada) | | |
| | e0/3 | 111.111.111.14/30 | R26 (Triada) | | |
| R17 | e0/1 | 10.10.20.2 | R18 (local) | 1.1.2.17 | |
| | e0/2 | 172.16.10.1 | Aggregation channel | | |
| R16 | e0/0 | 10.10.20.9 | R32 (local) | 1.1.2.16 | |
| | e0/1 | 10.10.20.6 | R18 (local) | | |
| | e0/2 | 172.16.11.1 | Aggregation channel | | |
| R32 | e0/0 | 10.10.20.10 | R16 (local) | 1.1.2.32 | |
| SW10 | | | | 1.1.2.10 | |
| SW9 | | | | 1.1.2.9 | |

### Chukordah Office

<p class="ru-text">За Чокурдах</p>

| Device | Port | IPv4 | Note | IP-Loopback | Region |
| --------- | ---- | ---------------- | --------------- | ----------- | -------- |
| R28 | e0/0 | 111.110.35.14/30 | R26 (Triada) | 1.1.3.28 | Chukordah |
| | e0/1 | 111.110.35.10/30 | R25 (Triada) | | |
| | e0/2 | 172.16.40.1/24 | SW29 (Chukordah) | | |
| SW29 | | | | 1.1.3.29 | |

### Labytnangi Office

<p class="ru-text">За Лабытнанги</p>

| Device | Port | IPv4 | Note | VLAN | Region |
| --------- | ---- | ------------ | ----------- | ---- | ---------- |
| R27 | e0/0 | 210.220.35.2 | R25 (Triada) | | Labytnangi |

### Network Summary

<p class="ru-text">Теперь коротко о резерве сети</p>

| Moscow | Networks | Mask | Loopback |
| ---- | ---------- | ----- | ---------- |
| P2P | 10.10.10.0 | /24 | 1.1.1.0/24 |
| LAN1 | 172.16.0.0 | /24 | |
| | 172.16.1.0 | | |

| Spb | Networks | Mask | Loopback |
| ---- | ----------- | ----- | ---------- |
| P2P | 10.10.20.0 | /24 | 1.1.2.0/24 |
| LAN2 | 172.16.10.0 | /24 | |
| | 172.16.11.0 | | |

| Chukordah | Network | Mask | Loopback |
| -------- | ----------- | ----- | ---------- |
| LAN3 | 172.16.40.0 | /24 | 1.1.3.0/24 |

| Labytnangi | Network | Mask | Loopback |
| ---------- | ---------- | ----- | ---------- |
| LAN4 | 10.10.50.0 | /24 | 1.1.4.0/24 |

ISP internal addressing is not our concern — they provide internet access.
<p class="ru-text">Как там устроено у провайдера, по большому счёту всё-равно. Он нам предоставляет выход в интернет и на том спасибо.</p>

## IPv6

![image](/img/neteng/diplom/2.png)

### Moscow

<p class="ru-text">За Москву</p>

| Device | Port | IPv6 | Note | Region |
| --------- | ---- | ------------------- | ------------------ | ------ |
| R15 | e0/0 | 2002:ACAD:0DB8:0::0 | R13 (local) | MOSCOW |
| | e0/1 | 2002:ACAD:0DB8:1::0 | R12 (local) | |
| | e0/2 | 2002:ACAD:0DB8:2::0 | R21 (Lamas) | |
| | e0/3 | 2002:ACAD:0DB8:3::0 | R20 (local) | |
| R14 | e0/0 | 2002:ACAD:0DB8:4::0 | R12 (local) | |
| | e0/1 | 2002:ACAD:0DB8:5::0 | R13 (local) | |
| | e0/2 | 2002:ACAD:0DB8:6::0 | R22 (Kitorn) | |
| | e0/3 | 2002:ACAD:0DB8:7::0 | R19 (local) | |
| R13 | e0/0 | 2002:ACAD:0DB8:8::0 | Aggregation | |
| | e0/2 | 2002:ACAD:0DB8:0::1 | R15 (local) | |
| | e0/3 | 2002:ACAD:0DB8:5::1 | R14 (local) | |
| R12 | e0/0 | 2002:ACAD:0DB8:9::0 | Aggregation | |
| | e0/2 | 2002:ACAD:0DB8:4::1 | R14 (local) | |
| | e0/3 | 2002:ACAD:0DB8:1::1 | R15 (local) | |
| R19 | e0/0 | 2002:ACAD:0DB8:7::1 | R14 (local) | |
| R20 | e0/0 | 2002:ACAD:0DB8:3::1 | R15 (local) | |

### Saint Petersburg

<p class="ru-text">За Санкт-Петербург</p>

| Device | Port | IPv6 | Note | Region |
| --------- | ---- | ------------------- | ------------------ | ------------ |
| R18 | e0/0 | 2CAD:1995:B0DA:0::0 | R16 (local) | St. Petersburg |
| | e0/1 | 2CAD:1995:B0DA:1::0 | R17 (local) | |
| | e0/2 | 2CAD:1995:B0DA:2::0 | R24 (Triada) | |
| | e0/3 | 2CAD:1995:B0DA:3::0 | R26 (Triada) | |
| R17 | e0/1 | 2CAD:1995:B0DA:1::1 | R18 (local) | |
| R16 | e0/0 | 2CAD:1995:B0DA:4::0 | R32 (local) | |
| | e0/1 | 2CAD:1995:B0DA:0::1 | R18 (local) | |
| | e0/2 | 2CAD:1995:B0DA:5::0 | Aggregation | |
| R32 | e0/0 | 2CAD:1995:B0DA:4::1 | R16 (local) | |

Triada is the ISP for three of our sites, so the address pool is shared:
<p class="ru-text">Так как Триада является провайдером для 3х наших сетей, то пул адресов будет одинаковым.</p>

| Device | Port | IPv6 | Note | Region |
| --------- | ---- | ------------------- | ----------- | ---------- |
| R27 | e0/0 | 2CAD:1995:B0DA:A::0 | R25 (Triada) | Labytnangi |

| Device | Port | IPv6 | Note | Region |
| --------- | ---- | ------------------- | --------------- | -------- |
| R28 | e0/0 | 2CAD:1995:B0DA:7::0 | R26 (Triada) | Chukordah |
| | e0/1 | 2CAD:1995:B0DA:8::0 | R25 (Triada) | |
| | e0/2 | 2CAD:1995:B0DA:9::0 | SW29 | |

**Summary:**
- `2002:ACAD:0DB8::/48` — allocated by Lamas
- `2CAD:1995:B0DA::/48` — allocated by Triada

<p class="ru-text">Подытожим: 2002:ACAD:0DB8::/48 этот пул выдал Ламас; 2CAD:1995:B0DA::/48 выдан был Триадой.</p>

### VLANs

| City | VLAN | Purpose |
| ---------- | ---- | ---------- |
| Msk | 10 | Native |
| | 11 | Native |
| | 99 | Management |
| Spb | 12 | Native |
| | 13 | Native |
| | 98 | Management |
| Labytnangi | 14 | Native |
| | 97 | Management |
| Chukordah | 15 | Native |
| | 96 | Management |

### Link-Local Addressing

<p class="ru-text">Link-Local адресация</p>

![3](/img/neteng/diplom/3.png)

| Device | Port | IPv6 | Note | Region |
| --------- | ---- | ---------------------- | ----------- | ------ |
| R15 | e0/0 | fe80:1::15 | R13 (local) | MOSCOW |
| | e0/1 | fe80:2::15 | R12 (local) | |
| | e0/2 | ??? | R21 (Lamas) | |
| | e0/3 | fe80:3::15 | R20 (local) | |
| R14 | e0/0 | fe80:4::14 | R12 (local) | |
| | e0/1 | fe80:5::14 | R13 (local) | |
| | e0/2 | ??? | R22 (Kitorn) | |
| | e0/3 | fe80:6::14 | R19 (local) | |
| R13 | e0/0 | fe80:8::13 | in SW5 | |
| | e0/2 | fe80:1::13 | R15 (local) | |
| | e0/3 | fe80:5::13 | R14 (local) | |
| R12 | e0/0 | fe80:7::12 | in SW4 | |
| | e0/2 | fe80:4::12 | R14 (local) | |
| | e0/3 | fe80:2::12 | R15 (local) | |
| R19 | e0/0 | fe80:6::19 | R14 (local) | |
| R20 | e0/0 | fe80:3::20 | R15 (local) | |
| SW2-SW5 | | Are link-locals needed if global addresses are already assigned? | | |

| Device | Port | IPv6 | Note | Region |
| --------- | ---- | ----------------------- | ----------- | ------------ |
| R18 | e0/0 | fe80:12::18 | R16 (local) | St. Petersburg |
| | e0/1 | fe80:11::18 | R17 (local) | |
| | e0/2 | ??? | R24 (Triada) | |
| | e0/3 | ??? | R26 (Triada) | |
| R17 | e0/1 | fe80:11::17 | R18 (local) | |
| | e0/2 | fe80:13::17 | in SW9 | |
| R16 | e0/0 | fe80:15::16 | R32 (local) | |
| | e0/1 | fe80:12::16 | R18 (local) | |
| | e0/2 | fe80:14::16 | in SW10 | |
| R32 | e0/0 | fe80:15::32 | R16 (local) | |

| Device | Port | IPv6 | Note | Region |
| --------- | ---- | ---- | ----------- | ---------- |
| R27 | e0/0 | ??? | R25 (Triada) | Labytnangi |

| Device | Port | IPv6 | Note | Region |
| --------- | ---- | ----------- | --------------- | -------- |
| R28 | e0/0 | ??? | R26 (Triada) | Chukordah |
| | e0/1 | ??? | R25 (Triada) | |
| | e0/2 | fe80:21::28 | SW29 | |
