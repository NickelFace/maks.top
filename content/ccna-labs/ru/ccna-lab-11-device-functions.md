---
title: "Lab 11 — Cisco Device Functions"
date: 2026-10-03
description: "Изучение MAC-таблицы коммутатора и таблицы маршрутизации роутера"
tags: ["CCNA", "Cisco", "Lab", "MAC-table", "Routing Table"]
categories: ["CCNA"]
page_lang: "ru"
lang_pair: "/ccna-labs/ccna-lab-11-device-functions/"
pagefind_ignore: true
build:
  list: never
  render: always
---

## Описание

Изучение MAC-таблицы на Cisco IOS-коммутаторах и таблицы маршрутизации на роутерах. Guided walkthrough.

## Топология

```
        R2 (G0/0)
        |  F0/2
   F0/1 |  
       SW1 ----F0/24---- SW2
   F0/3 |               F0/4  F0/3
        |               |      |
       R1 (G0/0, G0/1)  R4    R3
       10.10.10.1       10.10.10.4  10.10.10.3
```

Все роутеры предварительно настроены на сеть **10.10.10.0/24**.

## Задачи

### Проверка интерфейсов роутеров
1. Войти на R1–R4, проверить какой интерфейс активен в 10.10.10.0/24: `show ip interface brief`
2. Запомнить MAC-адреса активных интерфейсов: `show interface gi0/0`

### MAC-таблица коммутатора
3. На SW1 просмотреть MAC-таблицу: `show mac address-table`
4. Пинговать с R1 все роутеры, снова просмотреть MAC-таблицу — она заполнится
5. На SW2 просмотреть MAC-таблицу: `show mac address-table`

### Таблица маршрутизации
6. На R1 просмотреть таблицу маршрутизации: `show ip route`
7. Разобрать вывод: Connected (C), Static (S), коды протоколов
8. Понять откуда R1 знает маршруты (Connected vs learned)

## Ключевые команды

```
R1#show ip interface brief
R1#show interface gigabitEthernet 0/0
SW1#show mac address-table
SW1#show mac address-table dynamic
R1#show ip route
```

> **💡 Совет:**
> MAC-таблица пустая при первом просмотре — генерируй трафик (ping) для её заполнения. Коммутатор узнаёт MAC только при получении фрейма.
