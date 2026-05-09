---
title: "CCNA — 1.3 Физические интерфейсы и кабели"
date: 2026-07-06
description: "Типы медных и оптоволоконных кабелей Ethernet, стандарты T568A/B, разъёмы, стандарты скоростей и команды IOS для настройки интерфейсов."
tags: ["CCNA", "Cisco", "Ethernet", "кабели", "интерфейсы"]
categories: ["CCNA"]
page_lang: "ru"
lang_pair: "/posts/ccna/ccna-1-03-interfaces/"
pagefind_ignore: true
build:
  list: never
  render: always
---

## Типы кабелей Ethernet

### Медные кабели (UTP/STP)

| Тип кабеля | Применение | Стандарт |
|---|---|---|
| Прямой (Straight-through) | Разные типы устройств (ПК → коммутатор, коммутатор → маршрутизатор) | T568A↔T568A или T568B↔T568B |
| Перекрёстный (Crossover) | Одинаковые устройства (ПК → ПК, коммутатор → коммутатор) | T568A↔T568B |
| Консольный (Rollover) | ПК (COM-порт) → консоль Cisco | Перевёрнутый разъём |

### Правило подбора кабеля

| Устройство A | Устройство B | Кабель |
|---|---|---|
| ПК (NIC) | Коммутатор | Прямой |
| ПК (NIC) | ПК (NIC) | Перекрёстный |
| ПК (NIC) | Маршрутизатор (Ethernet) | Перекрёстный |
| Коммутатор | Маршрутизатор (Ethernet) | Прямой |
| Коммутатор | Коммутатор | Перекрёстный |
| Маршрутизатор (Ethernet) | Маршрутизатор (Ethernet) | Перекрёстный |
| ПК (COM/USB) | Консоль маршрутизатора/коммутатора | Консольный (rollover) |

> **💡 Совет:** Современные коммутаторы поддерживают **Auto-MDIX** — автоматически определяют тип кабеля. При включённом Auto-MDIX тип кабеля не важен. Включить: `(config-if)# mdix auto`

### Пиновка стандартов T568A и T568B

| Пин | T568A | T568B |
|:---:|---|---|
| 1 | Бело-зелёный | Бело-оранжевый |
| 2 | Зелёный | Оранжевый |
| 3 | Бело-оранжевый | Бело-зелёный |
| 4 | Синий | Синий |
| 5 | Бело-синий | Бело-синий |
| 6 | Оранжевый | Зелёный |
| 7 | Бело-коричневый | Бело-коричневый |
| 8 | Коричневый | Коричневый |

> **💡 Совет:** Прямой кабель — оба конца одного стандарта (A–A или B–B). Перекрёстный — разные стандарты (A–B). Консольный — разъём перевёрнут зеркально (пин 1 → пин 8).

---

## Оптоволоконные кабели

| Тип | Сердцевина | Дальность | Применение |
|---|---|---|---|
| Одномодовое (SMF) | 8–10 мкм | До 100+ км | WAN, магистрали |
| Многомодовое (MMF) | 50–62,5 мкм | До 2 км | LAN, ЦОД |

| Разъём | Применение |
|---|---|
| LC (Lucent Connector) | Наиболее распространён в SFP |
| SC (Subscriber Connector) | Корпоративные сети |
| ST (Straight Tip) | Устаревший, промышленные |

---

## Стандарты Ethernet

| Стандарт | Скорость | Среда | Макс. длина |
|---|---|---|---|
| 10BASE-T | 10 Мбит/с | UTP Cat 3 | 100 м |
| 100BASE-TX | 100 Мбит/с | UTP Cat 5 | 100 м |
| 1000BASE-T | 1 Гбит/с | UTP Cat 5e/6 | 100 м |
| 10GBASE-T | 10 Гбит/с | UTP Cat 6a | 100 м |
| 1000BASE-SX | 1 Гбит/с | MMF | 550 м |
| 1000BASE-LX | 1 Гбит/с | SMF/MMF | 10 км |

> **📌 Обратите внимание:** Категория кабеля UTP для CCNA:
> - Cat 5e → Gigabit Ethernet (1 Гбит/с)
> - Cat 6 → 10GbE до 55 м
> - Cat 6a → 10GbE до 100 м

---

## Консольное подключение к Cisco

Для первоначальной настройки без IP-адреса:

| Способ | Кабель | Настройки терминала |
|---|---|---|
| COM-порт → RJ-45 Console | Консольный (rollover) | 9600 бод, 8N1, без управления потоком |
| USB → Mini-USB Console | USB Type A → 5-pin Mini-B | Требует драйвер |

---

## Команды IOS для интерфейсов

```bash
# Просмотр интерфейсов
Router# show interfaces
Router# show interfaces gigabitethernet 0/0
Router# show ip interface brief          # краткая сводка (IP, статус)
Switch# show interfaces status           # статус портов коммутатора

# Настройка интерфейса
Router(config)# interface gigabitethernet 0/0
Router(config-if)# description Link to ISP
Router(config-if)# ip address 192.168.1.1 255.255.255.0
Router(config-if)# no shutdown           # включить интерфейс
Router(config-if)# shutdown              # выключить

# Скорость и дуплекс (коммутатор)
Switch(config-if)# speed 100            # 10, 100, 1000, auto
Switch(config-if)# duplex full          # full, half, auto
Switch(config-if)# mdix auto            # Auto-MDIX

# Диагностика
Router# show controllers serial 0/0/0   # DCE/DTE для серийных
```

> **💡 Совет:** Статус интерфейса в `show ip interface brief`:
> - `up/up` — работает нормально
> - `up/down` — физически подключён, нет протокола
> - `down/down` — нет физического сигнала
> - `administratively down/down` — выключен командой `shutdown`

---

## Ресурсы

| Ресурс | Описание |
|---|---|
| [Ethernet Cables — networklessons.com](https://networklessons.com/cisco/ccna-routing-switching-icnd1-100-105/ethernet-wiring) | Типы кабелей Ethernet: прямой, кросс, rollover |
| [TIA/EIA-568 Standard — Wikipedia](https://en.wikipedia.org/wiki/ANSI/TIA-568) | Стандарт структурированной кабельной системы, категории кабелей |
| [SFP vs SFP+ vs QSFP — Cisco](https://www.cisco.com/c/en/us/products/interfaces-modules/gigabit-interface-converter/index.html) | Cisco трансиверы: GLC/SFP модули, типы и скорости |
| [Fiber Optic Cables — networklessons.com](https://networklessons.com/cisco/ccna-routing-switching-icnd1-100-105/fiber-optic-cables) | Одномодовое и многомодовое волокно, SC/LC разъёмы |
| [Jeremy's IT Lab — Ethernet LAN Switching (YouTube)](https://www.youtube.com/watch?v=DtXfP-5N_4k) | Физические интерфейсы Cisco, скорости, Auto-MDIX |
| [IEEE 802.3 Ethernet Standards](https://standards.ieee.org/ieee/802.3/7071/) | Официальные стандарты IEEE 802.3 для Ethernet |
