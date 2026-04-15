---
title: "Network Architect — 01. Address Space Design (CLOS)"
date: 2025-09-03
description: "OTUS Network Architect: CLOS topology with 3 Spine + 4 Leaf, address space distribution for Underlay network"
tags:
  - "Networking"
  - "DC Design"
  - "CLOS"
  - "Spine-Leaf"
  - "OTUS"
categories: ["Network Architect"]
---

Проектирование адресного пространства

Цель: Собрать схему CLOS;
Распределить адресное пространство;

В этой самостоятельной работе мы ожидаем, что вы самостоятельно:

1. Соберете топологию CLOS с 3 Spine и 4 Leaf. 3 Leaf подключены к 2 Spine. 1 Leaf подключен к оставшемуся Spine. Все Spine связаны между собой через дополнительный маршрутизатор(рекомендуется использовать IOL)
2. Leaf необходимо связать между собой для дальнейшей настройки VPC пары
3. Добавите 3 клиента будущей фабрики. Один клиент подключен к VPC паре. Остальные клиенты подключены к оставшимся Leaf(в качестве клиентов рекомендуется использовать IOL образы)
4. Распределите адресное пространство для Underlay сети
5. План работы, адресное пространство, схема сети, настройки - зафиксированы в документации

![Schema](/img/netarch/1/Schema.png)