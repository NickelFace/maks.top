---
title: "CCNA — 1.9 Виртуализация и VRF"
date: 2026-05-07
description: "Основы виртуализации серверов (Type 1/Type 2 гипервизоры), контейнеры Docker/Kubernetes и VRF для создания изолированных таблиц маршрутизации на Cisco IOS."
tags: ["CCNA", "Cisco", "виртуализация", "VRF", "контейнеры"]
categories: ["CCNA"]
page_lang: "ru"
lang_pair: "/posts/ccna/ccna-1-09-virtualization/"
pagefind_ignore: true
build:
  list: never
  render: always
---

**Экзаменационная тема:** 1.12 Explain virtualization fundamentals (server virtualization, containers, VRF)

## Виртуализация серверов

**Гипервизор** — программный слой, позволяющий запускать несколько виртуальных машин (VM) на одном физическом сервере.

| Тип | Описание | Примеры |
|---|---|---|
| **Type 1 (Bare-metal)** | Запускается прямо на железе, без ОС | VMware ESXi, Microsoft Hyper-V, KVM |
| **Type 2 (Hosted)** | Запускается поверх обычной ОС | VMware Workstation, VirtualBox |

**Преимущества виртуализации:**
- Уменьшение физического оборудования (консолидация)
- Изоляция приложений
- Быстрое развёртывание
- Снапшоты (backup без остановки)
- Живая миграция VM между хостами (vMotion)

### vSwitch — виртуальный коммутатор

Каждый гипервизор содержит **vSwitch** — программный коммутатор, соединяющий VM между собой и с физической сетью. Cisco Nexus 1000v — пример продвинутого vSwitch с поддержкой VLAN, QoS, port security.

---

## Контейнеры (Containers)

**Контейнер** — лёгкий вариант изоляции: приложения делят ядро ОС хоста, но изолированы друг от друга.

| Параметр | VM | Контейнер |
|---|---|---|
| Изоляция | Полная (отдельная ОС) | Частичная (общее ядро) |
| Накладные расходы | Высокие (ГБ) | Низкие (МБ) |
| Запуск | Секунды–минуты | Миллисекунды |
| Примеры | VMware, Hyper-V | Docker, Kubernetes, LXC |

> Docker — наиболее распространённый инструмент. Kubernetes (K8s) — оркестрация контейнеров в кластере.

---

## VRF — Virtual Routing and Forwarding

**VRF** создаёт несколько независимых таблиц маршрутизации на одном физическом маршрутизаторе. Каждый VRF — изолированная «виртуальная сеть».

**Применение:**
- Разделение трафика между клиентами/отделами без дополнительного оборудования
- MPLS VPN (VRF-Lite в корпоративных сетях)
- Разделение management и data plane

```
! Создание VRF
ip vrf CUSTOMER-A
 rd 1:1

ip vrf CUSTOMER-B
 rd 1:2

! Назначение интерфейса в VRF
interface GigabitEthernet0/1
 ip vrf forwarding CUSTOMER-A
 ip address 192.168.1.1 255.255.255.0

! Маршрутизация в VRF
ip route vrf CUSTOMER-A 0.0.0.0 0.0.0.0 10.0.0.1

! Верификация
show ip route vrf CUSTOMER-A
show ip vrf
show ip vrf interfaces
```

> **VRF-Lite** — упрощённая версия без MPLS, используется в корпоративных сетях для изоляции трафика.
