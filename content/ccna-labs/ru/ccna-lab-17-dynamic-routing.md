---
title: "Lab 17 — Dynamic Routing Protocols"
date: 2026-05-07
description: "Настройка динамической маршрутизации: RIPv2 и EIGRP"
tags: ["CCNA", "Cisco", "Lab", "RIP", "EIGRP"]
categories: ["CCNA"]
page_lang: "ru"
lang_pair: "/ccna-labs/ccna-lab-17-dynamic-routing/"
pagefind_ignore: true
build:
  list: never
  render: always
---

## Описание

Знакомство с динамической маршрутизацией: RIP и EIGRP. Сравнение с ручной статической маршрутизацией.

## Топология

```
R1 (10.10.10.1) ---- R2 (10.10.20.1/10.10.20.2) ---- R3 (10.10.30.1)
     10.10.10.0/24       10.10.20.0/24                    10.10.30.0/24
```

## Задачи

### RIPv2
1. Настроить RIPv2 на всех роутерах:
   ```
   R1(config)#router rip
   R1(config-router)#version 2
   R1(config-router)#network 10.0.0.0
   R1(config-router)#no auto-summary
   ```
2. Проверить таблицу маршрутизации (R = RIP): `show ip route`
3. Проверить RIP-базу данных: `show ip rip database`
4. Убедиться, что маршруты распространились

### EIGRP
5. Удалить RIP: `no router rip`
6. Настроить EIGRP на всех роутерах:
   ```
   R1(config)#router eigrp 1
   R1(config-router)#network 10.0.0.0
   R1(config-router)#no auto-summary
   ```
7. Проверить соседей: `show ip eigrp neighbors`
8. Проверить топологию: `show ip eigrp topology`
9. Проверить таблицу маршрутизации (D = EIGRP): `show ip route`

## Ключевые команды

```
! RIPv2
R1(config)#router rip
R1(config-router)#version 2
R1(config-router)#network 10.0.0.0
R1(config-router)#no auto-summary
R1#show ip rip database

! EIGRP
R1(config)#router eigrp 1
R1(config-router)#network 10.0.0.0
R1(config-router)#no auto-summary
R1#show ip eigrp neighbors
R1#show ip eigrp topology
R1#show ip route eigrp
```

> **💡 Совет:**
> **RIP** — дистанционно-векторный, метрика = hop count, медленная конвергенция. **EIGRP** — улучшенный дистанционно-векторный Cisco, быстрая конвергенция, composite metric. AD: RIP=120, EIGRP internal=90.
