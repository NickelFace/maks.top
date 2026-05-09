---
title: "Lab 29-1 — NAT Configuration"
date: 2026-11-18
description: "Настройка Static NAT, Dynamic NAT и PAT на Cisco IOS"
tags: ["CCNA", "Cisco", "Lab", "NAT", "PAT"]
categories: ["CCNA"]
page_lang: "ru"
lang_pair: "/ccna-labs/ccna-lab-29-nat/"
pagefind_ignore: true
build:
  list: never
  render: always
---

## Описание

Настройка Static NAT, Dynamic NAT и PAT (Port Address Translation). Верификация трансляций.

## Топология

```
PC1 (10.10.10.10) ----SW1---- R1 (inside: G0/0 10.10.10.1, outside: G0/1 203.0.113.1) ---- Internet
PC2 (10.10.10.20)
```

## Задачи

### Static NAT
1. Настроить статическое соответствие IP:
   ```
   R1(config)#ip nat inside source static 10.10.10.10 203.0.113.10
   ```
2. Пометить интерфейсы:
   ```
   R1(config-if)#ip nat inside     ! G0/0
   R1(config-if)#ip nat outside    ! G0/1
   ```
3. Проверить: `show ip nat translations`

### Dynamic NAT
4. Создать NAT-пул:
   ```
   R1(config)#ip nat pool MYPOOL 203.0.113.20 203.0.113.30 netmask 255.255.255.0
   ```
5. Создать ACL для inside-хостов:
   ```
   R1(config)#access-list 1 permit 10.10.10.0 0.0.0.255
   ```
6. Применить Dynamic NAT:
   ```
   R1(config)#ip nat inside source list 1 pool MYPOOL
   ```
7. Проверить активные трансляции: `show ip nat translations`

### PAT (Overload)
8. PAT использует один IP с разными портами:
   ```
   R1(config)#ip nat inside source list 1 interface g0/1 overload
   ```
9. Пинговать из обоих PC → проверить трансляции с разными портами
10. Проверить статистику: `show ip nat statistics`

## Ключевые команды

```
R1(config)#ip nat inside source static 10.10.10.10 203.0.113.10
R1(config)#ip nat pool MYPOOL 203.0.113.20 203.0.113.30 netmask 255.255.255.0
R1(config)#ip nat inside source list 1 pool MYPOOL
R1(config)#ip nat inside source list 1 interface g0/1 overload
R1(config-if)#ip nat inside
R1(config-if)#ip nat outside
R1#show ip nat translations
R1#show ip nat statistics
R1#clear ip nat translation *        ! сбросить все трансляции
```

> **💡 Совет:**
> Inside Local = реальный IP внутри сети. Inside Global = публичный IP после трансляции. PAT (overload) = наиболее распространён в реальных сетях: один публичный IP для тысяч устройств.
