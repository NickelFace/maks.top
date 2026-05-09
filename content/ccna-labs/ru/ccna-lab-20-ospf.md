---
title: "Lab 20-1 — OSPF Configuration"
date: 2026-10-26
description: "Настройка OSPFv2: соседи, DR/BDR-выборы, стоимость интерфейсов"
tags: ["CCNA", "Cisco", "Lab", "OSPF", "DR/BDR"]
categories: ["CCNA"]
page_lang: "ru"
lang_pair: "/ccna-labs/ccna-lab-20-ospf/"
pagefind_ignore: true
build:
  list: never
  render: always
---

## Описание

Настройка OSPFv2, верификация соседских отношений, DR/BDR-выборы, настройка стоимости и passive-interface.

## Топология

```
R1 (G0/0: 10.10.10.1) ----10.10.10.0/24 (broadcast)---- R2 (G0/0: 10.10.10.2, G0/1: 10.10.20.1)
                                                          |
                                                         R3 (G0/0: 10.10.20.2)
Loopbacks: R1=1.1.1.1, R2=2.2.2.2, R3=3.3.3.3 (/32)
```

## Задачи

1. Настроить IP и loopback на всех роутерах
2. Настроить OSPFv2 на всех роутерах:
   ```
   R1(config)#router ospf 1
   R1(config-router)#router-id 1.1.1.1
   R1(config-router)#network 10.10.10.0 0.0.0.255 area 0
   R1(config-router)#network 1.1.1.1 0.0.0.0 area 0
   ```
3. Проверить соседей: `show ip ospf neighbor`
4. Проверить DR/BDR выборы (сеть broadcast 10.10.10.0/24)
5. Проверить таблицу маршрутизации (O = OSPF): `show ip route ospf`
6. Проверить LSDB: `show ip ospf database`
7. Изменить стоимость интерфейса:
   ```
   R1(config-if)#ip ospf cost 100
   ```
8. Изменить reference bandwidth: `auto-cost reference-bandwidth 1000`
9. Настроить passive-interface на loopback
10. Верифицировать через `show ip protocols`

## Ключевые команды

```
R1(config)#router ospf 1
R1(config-router)#router-id 1.1.1.1
R1(config-router)#network 10.10.10.0 0.0.0.255 area 0
R1(config-router)#passive-interface Loopback0
R1(config-router)#auto-cost reference-bandwidth 1000
R1(config-if)#ip ospf cost 100
R1(config-if)#ip ospf priority 100     ! DR/BDR выборы
R1#show ip ospf neighbor
R1#show ip ospf database
R1#show ip route ospf
R1#show ip protocols
R1#show ip ospf interface brief
```

> **💡 Совет:**
> DR/BDR выбирается на broadcast-сегментах. Priority 0 = не участвует. Highest Priority → DR. При равном приоритете → highest Router-ID. **Выборы не пересчитываются при добавлении нового роутера** (non-preemptive).
