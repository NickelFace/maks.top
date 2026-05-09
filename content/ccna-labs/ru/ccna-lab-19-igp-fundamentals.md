---
title: "Lab 19-1 — IGP Interior Gateway Protocol Fundamentals"
date: 2026-10-23
description: "Настройка EIGRP: соседские отношения, таблица топологии, Feasible Successor"
tags: ["CCNA", "Cisco", "Lab", "EIGRP", "IGP"]
categories: ["CCNA"]
page_lang: "ru"
lang_pair: "/ccna-labs/ccna-lab-19-igp-fundamentals/"
pagefind_ignore: true
build:
  list: never
  render: always
---

## Описание

Настройка и верификация EIGRP в качестве Interior Gateway Protocol. Анализ метрики, соседних отношений и таблицы топологии.

## Топология

```
R1 (10.10.10.1) ----10.10.20.0/24---- R2 ----10.10.30.0/24---- R3
     Loopback: 1.1.1.1/32                   Loopback: 3.3.3.3/32
```

## Задачи

1. Настроить IP-адреса на интерфейсах и loopback
2. Настроить EIGRP AS 100 на всех роутерах:
   ```
   R1(config)#router eigrp 100
   R1(config-router)#network 10.10.10.0 0.0.0.255
   R1(config-router)#network 10.10.20.0 0.0.0.255
   R1(config-router)#network 1.1.1.1 0.0.0.0
   R1(config-router)#no auto-summary
   ```
3. Проверить установление соседских отношений: `show ip eigrp neighbors`
4. Просмотреть таблицу топологии: `show ip eigrp topology`
5. Проверить таблицу маршрутизации (D = EIGRP): `show ip route eigrp`
6. Анализ метрики EIGRP: Feasible Distance (FD) vs Reported Distance (RD)
7. Настроить passive-interface на Loopback: `passive-interface Loopback0`
8. Пинговать loopback R3 с R1

## Ключевые команды

```
R1(config)#router eigrp 100
R1(config-router)#network 10.10.10.0 0.0.0.255
R1(config-router)#no auto-summary
R1(config-router)#passive-interface Loopback0
R1#show ip eigrp neighbors
R1#show ip eigrp topology
R1#show ip eigrp topology all-links
R1#show ip route eigrp
R1#show ip protocols
```

> **💡 Совет:**
> EIGRP Successor = лучший маршрут (в таблице маршрутизации). Feasible Successor = резервный маршрут (в таблице топологии, FD > RD соседа). При падении Successor → мгновенное переключение на FS без пересчёта.
