---
title: "Lab 27-1 — Port Security Configuration"
date: 2026-05-07
description: "Настройка Port Security: режимы нарушения и Sticky MAC"
tags: ["CCNA", "Cisco", "Lab", "Port Security", "Layer 2 Security"]
categories: ["CCNA"]
page_lang: "ru"
lang_pair: "/ccna-labs/ccna-lab-27-port-security/"
pagefind_ignore: true
build:
  list: never
  render: always
---

## Описание

Настройка Port Security для защиты от несанкционированных устройств. Режимы нарушения: shutdown, restrict, protect. Sticky MAC.

## Задачи

### Базовая Port Security
1. Включить Port Security на access-порту:
   ```
   SW1(config-if)#switchport port-security
   ```
2. Установить максимум 1 MAC-адрес (по умолчанию)
3. Добавить статический MAC:
   ```
   SW1(config-if)#switchport port-security mac-address 0090.2B82.AB01
   ```
4. Проверить: `show port-security interface f0/1`

### Режимы нарушения
5. Режим **shutdown** (по умолчанию): порт → err-disable при нарушении
6. Режим **restrict**: нарушитель блокируется, счётчик растёт, порт работает
7. Режим **protect**: нарушитель блокируется, счётчик НЕ растёт
   ```
   SW1(config-if)#switchport port-security violation restrict
   ```
8. Подключить другое устройство → симулировать нарушение
9. Проверить счётчик нарушений: `show port-security`

### Sticky MAC
10. Включить sticky MAC — автоматически запоминает подключённые устройства:
    ```
    SW1(config-if)#switchport port-security mac-address sticky
    ```
11. Подключить PC — MAC автоматически добавится в конфиг
12. Проверить: `show run` → в конфиге появится `mac-address sticky XXXX.XXXX.XXXX`

### Восстановление err-disable
13. Вручную: `shutdown` → `no shutdown` на порту
14. Автоматически:
    ```
    SW1(config)#errdisable recovery cause psecure-violation
    SW1(config)#errdisable recovery interval 30
    ```

## Ключевые команды

```
SW1(config-if)#switchport port-security
SW1(config-if)#switchport port-security maximum 2
SW1(config-if)#switchport port-security mac-address sticky
SW1(config-if)#switchport port-security violation shutdown
SW1(config-if)#switchport port-security violation restrict
SW1(config-if)#switchport port-security violation protect
SW1#show port-security
SW1#show port-security interface f0/1
SW1#show port-security address
SW1(config)#errdisable recovery cause psecure-violation
```

> **💡 Совет:**
> | Режим | Блокировка | Syslog | Счётчик | Порт |
> |---|:---:|:---:|:---:|---|
> | Shutdown | ✓ | ✓ | ✓ | err-disable |
> | Restrict | ✓ | ✓ | ✓ | Работает |
> | Protect | ✓ | ✗ | ✗ | Работает |
