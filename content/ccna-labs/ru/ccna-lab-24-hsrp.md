---
title: "Lab 24-1 — HSRP Configuration"
date: 2026-05-07
description: "Настройка HSRP для резервирования шлюза по умолчанию с preemption и interface tracking"
tags: ["CCNA", "Cisco", "Lab", "HSRP", "FHRP", "Redundancy"]
categories: ["CCNA"]
page_lang: "ru"
lang_pair: "/ccna-labs/ccna-lab-24-hsrp/"
pagefind_ignore: true
build:
  list: never
  render: always
---

## Описание

Настройка HSRP (Hot Standby Router Protocol) для обеспечения отказоустойчивости шлюза по умолчанию. Preemption, interface tracking.

## Топология

```
PC1 (GW: 10.10.10.254)
 |
SW1
 /  \
R1   R2      ← оба роутера pretend to be 10.10.10.254 (виртуальный IP)
(10.10.10.1) (10.10.10.2)
 |           |
 +----WAN----+
```

HSRP Virtual IP: 10.10.10.254  
HSRP Group: 1

## Задачи

### Базовая настройка HSRP
1. Настроить IP на интерфейсах R1 и R2
2. Настроить HSRP на R1 (Active):
   ```
   R1(config-if)#standby 1 ip 10.10.10.254
   R1(config-if)#standby 1 priority 110
   R1(config-if)#standby 1 preempt
   ```
3. Настроить HSRP на R2 (Standby, priority по умолчанию 100):
   ```
   R2(config-if)#standby 1 ip 10.10.10.254
   R2(config-if)#standby 1 preempt
   ```
4. Проверить состояние HSRP: `show standby brief`
5. Убедиться R1 = Active, R2 = Standby

### Тест отказоустойчивости
6. Shutdown интерфейс на R1: `interface g0/0` → `shutdown`
7. Проверить, что R2 стал Active: `show standby brief`
8. Пинговать виртуальный IP с PC — должен работать через R2
9. Поднять интерфейс R1: `no shutdown`
10. С preempt — R1 снова становится Active

### Interface Tracking
11. Настроить track объект:
    ```
    R1(config)#track 1 interface g0/1 line-protocol
    R1(config-if)#standby 1 track 1 decrement 20
    ```
12. Если WAN-интерфейс R1 упал → priority уменьшается на 20 → R2 берёт управление

## Ключевые команды

```
R1(config-if)#standby 1 ip 10.10.10.254
R1(config-if)#standby 1 priority 110
R1(config-if)#standby 1 preempt
R1(config-if)#standby 1 track 1 decrement 20
R1(config)#track 1 interface g0/1 line-protocol
R1#show standby
R1#show standby brief
```

> **💡 Совет:**
> Виртуальный MAC-адрес HSRP v1: **0000.0C07.ACxx** (xx = group hex). PC использует этот MAC как gateway. При переключении Active — MAC тот же, PC не нужно менять ARP-кэш.
