---
title: "Lab 14 — Cisco Router and Switch Basics"
date: 2026-10-11
description: "Базовая конфигурация роутера и коммутатора: CDP, speed/duplex, описания интерфейсов"
tags: ["CCNA", "Cisco", "Lab", "CDP", "Interfaces"]
categories: ["CCNA"]
page_lang: "ru"
lang_pair: "/ccna-labs/ccna-lab-14-router-switch-basics/"
pagefind_ignore: true
build:
  list: never
  render: always
---

## Описание

Базовая конфигурация роутера и коммутатора, CDP, управление speed/duplex.

## Топология

```
R1 (F0/0: 10.10.10.1) ----F0/1-[ SW1 (Vlan1: 10.10.10.10) ]-F0/2---- R2 (F0/0: 10.10.10.2)
```

## Задачи

### Базовая конфигурация
1. Настроить hostname на R1, R2, SW1
2. Настроить IP на R1 F0/0 → 10.10.10.1/24
3. Настроить IP на R2 F0/0 → 10.10.10.2/24
4. Настроить Management IP на SW1 (Vlan1) → 10.10.10.10/24
5. Default gateway на SW1: `SW1(config)#ip default-gateway 10.10.10.2`
6. Проверить пинг с SW1 до gateway
7. Добавить описания на интерфейсы: `description Link to R1`
8. Проверить speed/duplex auto-negotiate (SW1 F0/1): `show interface f0/1` → Full-duplex, 100Mb/s

### Ручная настройка speed/duplex
9. SW1 F0/2: `speed 100` + `duplex full`
10. R2 F0/0: `speed 100` + `duplex full`
11. Проверить версию IOS: `SW1#show version`

### CDP
12. Просмотреть соседей: `SW1#show cdp neighbors`
13. Отключить CDP на порту SW1 F0/1: `no cdp enable`
14. Сбросить CDP-кэш на R1: `R1(config)#no cdp run` → `cdp run`
15. Убедиться, что R1 не видит SW1: `R1#show cdp neighbors`

### Диагностика интерфейсов
16. Проверить статус F0/2 SW1: `show ip interface brief`
17. Shutdown F0/2 → проверить administratively down
18. `no shutdown` → проверить восстановление
19. Установить `duplex half` → F0/2 уходит down (mismatch с R2)
20. Исправить обратно до `duplex full`
21. Установить `speed 10` → F0/2 уходит down/down на R2

## Ключевые команды

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
