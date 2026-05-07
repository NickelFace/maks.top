---
title: "Lab 13 — The Cisco Troubleshooting Methodology"
date: 2026-05-07
description: "Тренировка методологии поиска неисправностей на примере нерабочего DNS"
tags: ["CCNA", "Cisco", "Lab", "Troubleshooting", "DNS"]
categories: ["CCNA"]
page_lang: "ru"
lang_pair: "/ccna-labs/ccna-lab-13-troubleshooting-methodology/"
pagefind_ignore: true
build:
  list: never
  render: always
---

## Описание

Тренировка методологии диагностики неисправностей. DNS не работает — нужно найти и устранить несколько проблем одновременно.

## Топология

```
DNS-Server (10.10.10.10)
    |
   F0/3
   SW1 ----F0/2---- R2 (F0/0: 10.10.10.2, F1/0: 10.10.20.2)
   F0/1              |
    |               SW2
   R1               F0/1
  (F0/0: 10.10.10.1) |
                     R3 (F0/0: 10.10.20.1)
```

Стартовая конфигурация: R3 использует R1 как DNS-сервер. Добавлены статические маршруты между R1 и R3.

## Задачи

1. Пользователи жалуются: DNS не работает
2. С R3 проверить доступность DNS-сервера по Telnet: `R3#telnet 10.10.10.10`
3. Пинговать DNS-сервер с R3: `R3#ping 10.10.10.10`
4. Использовать traceroute для локализации проблемы: `R3#traceroute 10.10.10.10`
5. Проверить интерфейсы R2 (найти shutdown): `R2#show ip interface brief`
6. Поднять интерфейс R2: `R2(config-if)#no shutdown`
7. Проверить DNS-конфиг на R3: `R3(config)#no ip name-server 10.10.10.1` → `ip name-server 10.10.10.10`
8. Проверить, что DNS-сервис включён на DNS-Server (GUI → Services → DNS → On)
9. Финальный тест: `R3#ping R1` (должен резолвиться через DNS)

## Проблемы в лабе (спойлер)

- FastEthernet0/0 на R2 в состоянии **administratively down**
- R3 настроен на **неверный IP** DNS-сервера (10.10.10.1 вместо 10.10.10.10)
- DNS-сервис на сервере **выключен** (DNS Service: Off)

## Ключевые команды

```
R3#telnet 10.10.10.10
R3#ping 10.10.10.10
R3#traceroute 10.10.10.10
R2#show ip interface brief
R2(config)#interface fastEthernet 0/0
R2(config-if)#no shutdown
R3(config)#no ip name-server 10.10.10.1
R3(config)#ip name-server 10.10.10.10
R3#ping R1
```

> **💡 Совет:**
> Методология Cisco: 1) Было ли раньше? 2) Затрагивает всех или одного? → Ping → Traceroute → Проверяй слой за слоем (L1→L2→L3→L4→L7).
