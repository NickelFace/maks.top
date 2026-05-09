---
title: "Lab 04 — The IOS Operating System"
date: 2026-10-01
description: "Знакомство с CLI Cisco IOS: режимы, навигация, управление конфигурацией"
tags: ["CCNA", "Cisco", "Lab", "IOS CLI"]
categories: ["CCNA"]
page_lang: "ru"
lang_pair: "/ccna-labs/ccna-lab-04-ios/"
pagefind_ignore: true
build:
  list: never
  render: always
---

## Описание

Guided walkthrough — пошаговое знакомство с CLI Cisco IOS. Один роутер. Никаких предварительных знаний не требуется.

## Топология

```
[ Router0 ]  ← один устройство, консольное подключение
```

## Задачи

### Базовая навигация
1. Подключиться к Router0 → CLI tab
2. Войти в Privileged Exec mode: `enable`
3. Перезагрузить устройство: `reload`

### User Exec и справка
4. Исследовать команды User Exec: `Router>?`
5. Убедиться, что `show run` не работает в User Exec
6. Войти в Privileged Exec: `Router>enable` → `Router#`
7. Вернуться в User Exec: `Router#disable`

### Privileged Exec и сокращения
8. Попробовать сокращение: `Router>en` → работает
9. Попробовать `Router#di` → ошибка "Ambiguous command"
10. Использовать `Router#di?` для просмотра вариантов (dir/disable/disconnect)
11. Просмотреть все `show` команды: `Router#sh ?`

### Global Configuration Mode
12. Войти в Global Config: `Router#configure terminal`
13. Изменить hostname: `Router(config)#hostname R1`
14. Изучить command history (↑ / ↓ стрелки)
15. Использовать `do show ip interface brief` из config mode
16. Войти в Interface Config: `R1(config)#interface gigabitEthernet 0/0`
17. Вернуться: `exit` (один уровень) или `end` / Ctrl-C (до Privileged Exec)

### Управление конфигурацией
18. Просмотреть конфиг: `R1#show running-config`
19. Фильтры: `sh run | begin hostname`, `sh run | include interface`, `sh run | exclude interface`
20. Сохранить конфиг: `R1#copy run start`
21. Сделать backup в flash: `copy run flash:` (имя: config-backup)
22. Попробовать backup на TFTP (завершится ошибкой таймаута — это нормально)
23. Перезагрузить и убедиться, что конфиг сохранился

## Ключевые команды

```
Router>enable                        ! Privileged Exec
Router#disable                       ! обратно в User Exec
Router#configure terminal            ! Global Config mode
R1(config)#hostname R1
R1(config)#interface gigabitEthernet 0/0
R1(config-if)#exit                   ! один уровень назад
R1(config-if)#end                    ! сразу в Privileged Exec
R1#show running-config
R1#sh run | begin hostname
R1#copy run start                    ! сохранить конфиг
R1#copy run flash:                   ! backup в flash
R1#reload
```

> **💡 Совет:**
> IOS не чувствителен к регистру для команд, но чувствителен при использовании `| begin` / `| include`. `begin Hostname` ≠ `begin hostname`.
