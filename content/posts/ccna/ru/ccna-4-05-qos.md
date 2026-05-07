---
title: "CCNA — 4.5 QoS"
date: 2026-04-04
description: "Quality of Service: классификация и маркировка трафика (DSCP/CoS), очереди LLQ/CBWFQ, policing vs shaping и WRED — модель Per-Hop Behavior для приоритизации VoIP и видео."
tags: ["CCNA", "Cisco", "QoS", "DSCP", "IP-сервисы"]
categories: ["CCNA"]
page_lang: "ru"
lang_pair: "/posts/ccna/ccna-4-05-qos/"
pagefind_ignore: true
build:
  list: never
  render: always
---

**Экзаменационная тема:** 4.7 Explain the forwarding per-hop behavior (PHB) for QoS such as classification, marking, queuing, congestion, policing, and shaping
**Odom:** Vol.2, Ch. 11

---

## Зачем нужен QoS

В современных сетях один канал передаёт: **голос (VoIP)**, **видео**, **данные**. Без QoS — все конкурируют за полосу пропускания одинаково. QoS позволяет:
- Приоритизировать чувствительный к задержкам трафик (VoIP, видео)
- Ограничивать нежелательный трафик
- Гарантировать минимальную полосу для важных приложений

**Основные проблемы без QoS:**

| Проблема | Влияние на VoIP |
|---|---|
| **Bandwidth** (нехватка полосы) | Прерывания, потери пакетов |
| **Delay (задержка)** | Эхо, несинхронный разговор |
| **Jitter (джиттер)** | Неравномерные задержки → дрожание голоса |
| **Packet loss (потери)** | Пропущенные слова |

> VoIP требования: задержка < 150 мс, джиттер < 30 мс, потери < 1%.

---

## Per-Hop Behavior (PHB) — модель QoS

QoS работает по принципу **PHB**: каждый узел (роутер/коммутатор) обрабатывает пакет независимо, на основе его метки (маркировки).

### Шаги QoS:

```
1. Classification (Классификация)
2. Marking (Маркировка)
3. Queuing (Постановка в очередь)
4. Scheduling (Планировщик / обслуживание очередей)
5. Policing / Shaping (Управление скоростью)
6. Congestion avoidance (Предотвращение перегрузки)
```

---

## 1. Classification (Классификация)

Определение типа трафика для применения политики.

**Методы классификации:**
- **ACL** (IP-адреса, порты)
- **NBAR** (Network-Based Application Recognition — по сигнатуре приложения)
- **DSCP/CoS marking** (по существующей метке)

```
class-map match-any VOICE
 match protocol rtp            ! NBAR: RTP-трафик
 match dscp ef                 ! или по DSCP EF
```

---

## 2. Marking (Маркировка)

Помечает пакеты для последующей обработки на других устройствах.

### L3 — IP Precedence и DSCP

**DSCP** (Differentiated Services Code Point) — 6 бит в IP-заголовке (часть поля ToS/DSCP).

| Класс | DSCP имя | Значение | Применение |
|---|---|---|---|
| Best Effort | BE / CS0 | 0 | Обычные данные |
| Expedited Forwarding | **EF** | 46 | VoIP (голос) |
| Assured Forwarding 4 | **AF41** | 34 | Видео |
| Assured Forwarding 3 | **AF31** | 26 | Critical data |
| Class Selector 3 | CS3 | 24 | Сигнализация |

**AF (Assured Forwarding):** AFxy — x = класс (1-4), y = вероятность сброса (1-3).
- AF11, AF12, AF13 — класс 1 (низкий/средний/высокий drop)
- AF41, AF42, AF43 — класс 4

### L2 — CoS (Class of Service)

**CoS** — 3 бита в 802.1Q тег (только в Ethernet с VLAN). Значения 0–7.

```
interface GigabitEthernet0/0
 mls qos trust dscp          ! Доверять DSCP от IP-телефона
 mls qos trust cos           ! Доверять CoS (switchport)
```

**Граница доверия (trust boundary):**
- Обычно — на уровне IP-телефона или точки доступа
- Компьютеры НЕ доверяются — могут подделать DSCP

```
! Маркировка в policy-map:
policy-map MARK-VOICE
 class VOICE
  set dscp ef
 class VIDEO
  set dscp af41
 class class-default
  set dscp default
```

---

## 3. Queuing (Очереди) и Scheduling (Планировщик)

### FIFO (First In, First Out)
- Одна очередь, без приоритетов
- Не подходит для смешанного трафика

### WFQ (Weighted Fair Queuing)
- Несколько очередей с весами
- Автоматически разделяет потоки

### CBWFQ (Class-Based WFQ)
- Очереди определяются class-map
- Гарантированная полоса для каждого класса

### LLQ (Low Latency Queuing) = CBWFQ + Priority Queue
- **Приоритетная очередь (PQ)** для VoIP — обслуживается первой
- Остальные классы — через CBWFQ

```
policy-map QOS-POLICY
 class VOICE
  priority 512                ! PQ: 512 кбит/с гарантировано
 class VIDEO
  bandwidth 2048              ! CBWFQ: минимум 2 Мбит/с
 class CRITICAL-DATA
  bandwidth percent 20        ! 20% от общей полосы
 class class-default
  fair-queue                  ! WFQ для остального
```

---

## 4. Policing (Полисинг) vs Shaping (Шейпинг)

| Параметр | Policing | Shaping |
|---|---|---|
| Действие при превышении | **Сброс пакетов** (drop) | **Буферизация** (задержка) |
| Где применяется | Входящий/исходящий трафик | Только исходящий |
| Влияние на задержку | Нет | Увеличивает задержку |
| Применение | ISP rate limiting | Выравнивание скорости |

```
! Policing: ограничить входящий HTTP-трафик до 1 Мбит/с
policy-map POLICE-HTTP
 class HTTP
  police rate 1000000 bps
   conform-action transmit
   exceed-action drop

! Shaping: ограничить исходящий трафик (выравнивание)
policy-map SHAPE-OUTPUT
 class class-default
  shape average 1000000       ! 1 Мбит/с
```

---

## 5. Congestion Avoidance — WRED

**WRED** (Weighted Random Early Detection) — начинает сбрасывать пакеты **случайным образом** при заполнении очереди, не дожидаясь 100% заполнения. Более высокий DSCP → меньше вероятность сброса.

Цель: предотвратить **TCP global synchronization** (когда все потоки одновременно снижают скорость).

---

## Применение QoS

```
interface GigabitEthernet0/1
 service-policy input MARK-VOICE          ! На входящем трафике
 service-policy output QOS-POLICY         ! На исходящем трафике
```

**Верификация:**
```
show policy-map interface Gi0/1
show class-map
show policy-map
```

---

## Чеклист QoS для экзамена

- Classification → Marking → Queuing → Scheduling → Policing/Shaping
- DSCP EF = 46 = VoIP
- LLQ = CBWFQ + Priority Queue для голоса
- Policing = сброс, Shaping = буферизация/задержка
- Trust boundary — где начинаем доверять DSCP/CoS
- `service-policy input/output` применяет политику
