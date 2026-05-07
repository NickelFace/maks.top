---
title: "Lab 25-2 — Spanning Tree Configuration"
date: 2026-05-07
description: "Настройка Rapid PVST+, PortFast и BPDU Guard для защиты портов"
tags: ["CCNA", "Cisco", "Lab", "STP", "RSTP", "PortFast", "BPDU Guard"]
categories: ["CCNA"]
page_lang: "ru"
lang_pair: "/ccna-labs/ccna-lab-25b-stp-config/"
pagefind_ignore: true
build:
  list: never
  render: always
---

## Описание

Настройка RSTP (Rapid Spanning Tree), PortFast, BPDU Guard. Верификация быстрой конвергенции.

## Задачи

### RSTP
1. Включить Rapid PVST+ (по умолчанию на новых IOS):
   ```
   SW1(config)#spanning-tree mode rapid-pvst
   ```
2. Проверить режим: `show spanning-tree` (Protocol: rstp)
3. Сравнить скорость конвергенции STP (30-50 сек) vs RSTP (< 1 сек)

### PortFast
4. Настроить PortFast на access-портах к конечным устройствам:
   ```
   SW1(config-if)#spanning-tree portfast
   ```
5. Глобально для всех access-портов:
   ```
   SW1(config)#spanning-tree portfast default
   ```
6. PortFast пропускает Listening/Learning → сразу в Forwarding
7. Убедиться, что PortFast не настроен на trunk-портах!

### BPDU Guard
8. Настроить BPDU Guard на портах с PortFast:
   ```
   SW1(config-if)#spanning-tree bpduguard enable
   ```
9. Глобально:
   ```
   SW1(config)#spanning-tree portfast bpduguard default
   ```
10. Подключить коммутатор к порту с BPDU Guard → порт уходит в err-disable
11. Восстановить порт:
    ```
    SW1(config-if)#shutdown
    SW1(config-if)#no shutdown
    ```
    или автоматически: `SW1(config)#errdisable recovery cause bpduguard`

### Root Guard
12. На designated-портах, смотрящих в сторону клиентов, настроить Root Guard:
    ```
    SW1(config-if)#spanning-tree guard root
    ```

## Ключевые команды

```
SW1(config)#spanning-tree mode rapid-pvst
SW1(config-if)#spanning-tree portfast
SW1(config)#spanning-tree portfast default
SW1(config-if)#spanning-tree bpduguard enable
SW1(config)#spanning-tree portfast bpduguard default
SW1(config-if)#spanning-tree guard root
SW1(config)#errdisable recovery cause bpduguard
SW1#show spanning-tree
SW1#show spanning-tree summary
SW1#show errdisable recovery
```

> **⚠️ Важно:**
> PortFast только на access-портах к конечным устройствам (PC, серверы). На trunk-портах PortFast может создать петлю STP при подключении другого коммутатора.
