---
title: "Lab 18 — Connectivity Troubleshooting"
date: 2026-10-21
description: "Поиск и устранение проблем связности с применением методологии Cisco"
tags: ["CCNA", "Cisco", "Lab", "Troubleshooting", "Connectivity"]
categories: ["CCNA"]
page_lang: "ru"
lang_pair: "/ccna-labs/ccna-lab-18-connectivity-troubleshooting/"
pagefind_ignore: true
build:
  list: never
  render: always
---

## Описание

Поиск и устранение проблем связности в многоуровневой сети. Предусмотрено несколько преднамеренных ошибок конфигурации.

## Задачи

1. Проверить базовую связность: `ping` между всеми устройствами
2. Идентифицировать недоступные хосты
3. Применить методологию Cisco: Physical → Data Link → Network
4. Использовать инструменты диагностики:
   - `show ip interface brief` — состояние интерфейсов
   - `show ip route` — таблица маршрутизации
   - `ping` / `traceroute` — проверка связности
   - `show cdp neighbors` — обнаружение топологии
5. Исправить найденные проблемы
6. Верифицировать полную связность

## Типичные проблемы в лабораторных сетях

| Симптом | Причина | Команда диагностики |
|---|---|---|
| Interface down/down | Кабель / shutdown | `show ip int brief` |
| Interface up/down | Неверная инкапсуляция | `show interface` |
| Нет маршрута | Ошибка статики / протокола | `show ip route` |
| Неверный next-hop | Ошибка в `ip route` | `show ip route` |
| Неверная маска | Суммаризация | `show ip route` |

## Ключевые команды

```
R1#show ip interface brief
R1#show interface f0/0
R1#show ip route
R1#ping 10.x.x.x
R1#traceroute 10.x.x.x
R1#show cdp neighbors detail
R1#debug ip routing              ! включить только для диагностики
R1#undebug all                   ! выключить все debug
```

> **💡 Совет:**
> Работай по слоям снизу вверх: сначала Physical (кабели, shutdown), затем Data Link (encapsulation, duplex), затем Network (IP, маски, маршруты).
