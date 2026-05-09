---
title: "Lab 16 — Routing Fundamentals"
date: 2026-10-16
description: "Настройка статической маршрутизации и анализ таблицы маршрутизации"
tags: ["CCNA", "Cisco", "Lab", "Static Routing"]
categories: ["CCNA"]
page_lang: "ru"
lang_pair: "/ccna-labs/ccna-lab-16-routing-fundamentals/"
pagefind_ignore: true
build:
  list: never
  render: always
---

## Описание

Настройка статической маршрутизации, анализ таблицы маршрутизации.

## Топология

```
PC1 (10.10.10.10/24)
 |
SW1
 |
R1 (F0/0: 10.10.10.1, F0/1: 10.10.20.1) ---- R2 (F0/0: 10.10.20.2, F0/1: 10.10.30.1) ---- R3 (F0/0: 10.10.30.2)
                                                                                                |
                                                                                              PC2 (10.10.30.10/24)
```

## Задачи

1. Настроить IP-адреса на всех интерфейсах роутеров
2. Убедиться в наличии Connected маршрутов: `show ip route`
3. Добавить статический маршрут на R1 до 10.10.30.0/24: `ip route 10.10.30.0 255.255.255.0 10.10.20.2`
4. Добавить статический маршрут на R3 до 10.10.10.0/24: `ip route 10.10.10.0 255.255.255.0 10.10.30.1`
5. Добавить маршруты на R2 (обе стороны)
6. Проверить таблицу маршрутизации (S = Static, C = Connected): `show ip route`
7. Пинговать PC2 с PC1: должен проходить
8. Добавить default route на R1: `ip route 0.0.0.0 0.0.0.0 10.10.20.2`
9. Проверить Longest Prefix Match: более специфичный маршрут всегда побеждает

## Ключевые команды

```
R1(config)#ip route 10.10.30.0 255.255.255.0 10.10.20.2    ! next-hop IP
R1(config)#ip route 10.10.30.0 255.255.255.0 F0/1          ! exit interface
R1(config)#ip route 0.0.0.0 0.0.0.0 10.10.20.2             ! default route
R1#show ip route
R1#show ip route static
R1#ping 10.10.30.10 source 10.10.10.1
```

> **💡 Совет:**
> Таблица маршрутизации: **C** = Connected, **S** = Static, **S*** = default static route. Longest prefix match — роутер выбирает самый конкретный маршрут.
