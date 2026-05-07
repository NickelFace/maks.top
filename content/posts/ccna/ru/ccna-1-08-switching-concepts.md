---
title: "CCNA — 1.8 Концепции коммутации"
date: 2026-02-08
description: "Принципы работы коммутатора Ethernet: обучение MAC-адресам, пересылка и флудинг, MAC Address Table, режимы Store-and-Forward/Cut-through, duplex mismatch."
tags: ["CCNA", "Cisco", "коммутация", "MAC-таблица", "Ethernet"]
categories: ["CCNA"]
page_lang: "ru"
lang_pair: "/posts/ccna/ccna-1-08-switching-concepts/"
pagefind_ignore: true
build:
  list: never
  render: always
---

**Экзаменационная тема:** 1.13 Describe switching concepts
**Odom:** Vol.1, Ch. 5 — Analyzing Ethernet LAN Switching

## Как работает коммутатор Ethernet

Коммутатор принимает решения о пересылке кадров на основе **MAC-адресов** назначения, работая на уровне 2 (Data Link) модели OSI.

### Три основных действия

| Действие | Когда | Что делает |
|---|---|---|
| **Learn** (Обучение) | При получении любого кадра | Записывает Source MAC → входящий порт в MAC-таблицу |
| **Forward** (Пересылка) | MAC назначения **известен** в таблице | Пересылает кадр только на нужный порт |
| **Flood** (Затопление) | MAC назначения **неизвестен** | Рассылает кадр на все порты VLAN (кроме входящего) |

> **Flooding** применяется также для **broadcast** (FF:FF:FF:FF:FF:FF) и **multicast** (если не настроен IGMP Snooping).

---

## MAC Address Table (CAM Table)

```
show mac address-table
show mac address-table dynamic
show mac address-table count
```

**Структура записи:**
- VLAN
- MAC-адрес
- Тип (dynamic / static)
- Порт

**Aging timer** — время хранения динамической записи (по умолчанию **300 сек = 5 минут**):
```
mac address-table aging-time 300
```

При отсутствии трафика с данного MAC в течение aging-time — запись удаляется → коммутатор снова флудит для этого адреса.

---

## Режимы пересылки кадров

| Режим | Описание | Задержка | Проверка CRC |
|---|---|---|---|
| **Store-and-Forward** | Принимает весь кадр, проверяет CRC, потом пересылает | Высокая | Да — ошибочные кадры отбрасываются |
| **Cut-through** | Пересылает сразу после прочтения адреса назначения | Низкая | Нет |
| **Fragment-free** | Ждёт первые 64 байта (проверяет коллизии), потом пересылает | Средняя | Частичная |

> Cisco Catalyst использует **store-and-forward** по умолчанию. Это предпочтительнее — ошибочные кадры не транслируются.

---

## Дуплекс и скорость

```
interface GigabitEthernet0/1
 duplex full          ! full / half / auto
 speed 1000           ! 10 / 100 / 1000 / auto
```

**Проблема mismatched duplex (duplex mismatch):**
- Один конец: full-duplex, другой: half-duplex
- Симптомы: поздние коллизии (late collisions), низкая производительность, CRC-ошибки
- Диагностика:

```
show interfaces GigabitEthernet0/1
! Смотри: "Duplex", "Speed", "input errors", "CRC", "collisions"
```

**Типичные ошибки интерфейса:**

| Поле | Что означает |
|---|---|
| CRC | Повреждённые кадры — физическая проблема или duplex mismatch |
| Input errors | Сумма всех ошибок входящих кадров |
| Runts | Кадры < 64 байт — признак коллизий |
| Giants | Кадры > 1518 байт |
| Late collisions | Коллизии после 64-го байта — duplex mismatch |

---

## Статические и динамические MAC-записи

**Статическая запись** — не устаревает, не перезаписывается:
```
mac address-table static 0011.2233.4455 vlan 10 interface Gi0/1
```

**Очистка MAC-таблицы:**
```
clear mac address-table dynamic
clear mac address-table dynamic interface Gi0/1
clear mac address-table dynamic vlan 10
```

---

## Unicast Flooding (Unknown Unicast Flood)

Если MAC назначения неизвестен — коммутатор флудит. Это нормальное поведение для нового устройства. Становится проблемой при:
- Большом broadcast-домене
- Отключении ответных кадров (asymmetric routing)
