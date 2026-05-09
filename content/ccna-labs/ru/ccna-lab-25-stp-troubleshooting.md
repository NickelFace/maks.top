---
title: "Lab 25-1 — Spanning Tree Troubleshooting"
date: 2026-11-05
description: "Диагностика STP: определение Root Bridge и оптимизация топологии"
tags: ["CCNA", "Cisco", "Lab", "STP", "Troubleshooting"]
categories: ["CCNA"]
page_lang: "ru"
lang_pair: "/ccna-labs/ccna-lab-25-stp-troubleshooting/"
pagefind_ignore: true
build:
  list: never
  render: always
---

## Описание

Диагностика STP: определение Root Bridge, анализ портовых ролей/состояний, устранение неоптимальной топологии.

## Топология

```
SW1 (Priority 32768) ----SW2 (Priority 32768)
 \                          /
  SW3 (Priority 32768, lowest MAC = Root?)
```

## Задачи

1. Проверить текущее STP-состояние: `show spanning-tree`
2. Определить Root Bridge (флаг `This bridge is the root`)
3. Просмотреть порты и их роли (Root/Designated/Blocked)
4. Определить, оптимальна ли топология (Root Bridge должен быть ближе к серверам)
5. Изменить Root Bridge: установить SW1 как Primary Root:
   ```
   SW1(config)#spanning-tree vlan 1 priority 4096
   ```
   или автоматически:
   ```
   SW1(config)#spanning-tree vlan 1 root primary
   ```
6. Проверить изменение Root Bridge: `show spanning-tree`
7. Убедиться в корректных портовых ролях после переключения

## Ключевые команды

```
SW1#show spanning-tree
SW1#show spanning-tree vlan 1
SW1#show spanning-tree summary
SW1(config)#spanning-tree vlan 1 priority 4096
SW1(config)#spanning-tree vlan 1 root primary     ! автоматически ставит priority ниже текущего
SW1(config)#spanning-tree vlan 1 root secondary   ! priority 28672
```

> **💡 Совет:**
> Bridge ID = Priority (16 bits) + MAC (48 bits). Меньший Bridge ID = Root Bridge. Default priority = 32768. Priority настраивается кратно 4096. `root primary` = 24576, `root secondary` = 28672.
