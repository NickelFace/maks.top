---
title: "CCNA — 6.3 Инструменты конфигурации"
date: 2026-05-04
description: "Ansible (agentless, YAML, push), Puppet и Chef (agent-based, pull), сравнение инструментов автоматизации, Terraform для IaC и встроенные средства IOS: EEM и TCL."
tags: ["CCNA", "Cisco", "Ansible", "автоматизация", "конфигурация"]
categories: ["CCNA"]
page_lang: "ru"
lang_pair: "/posts/ccna/ccna-6-03-config-tools/"
pagefind_ignore: true
build:
  list: never
  render: always
---

## Зачем нужна автоматизация конфигурации

| Проблема ручного управления | Решение |
|---|---|
| Ошибки при вводе вручную | Шаблоны, декларативный подход |
| Непоследовательность конфигураций | Idempotency — применяется только разница |
| Долгое развёртывание | Параллельное применение на сотни устройств |
| Нет истории изменений | Git-интеграция (IaC — Infrastructure as Code) |

---

## Ansible

**Ansible** — наиболее популярный инструмент для сетевой автоматизации.

| Характеристика | Описание |
|---|---|
| Язык | YAML (Playbooks) |
| Агент | Нет (agentless) |
| Транспорт | SSH или API (для сетевых устройств — NETCONF, HTTP) |
| Разработчик | Red Hat |

### Компоненты Ansible

| Компонент | Описание |
|---|---|
| Inventory | Список хостов (IP, группы, переменные) |
| Playbook | Набор задач в YAML |
| Task | Одна операция (вызов модуля) |
| Module | Плагин для взаимодействия с устройством |
| Role | Набор Playbooks для конкретной функции |
| Jinja2 | Шаблонизатор для генерации конфигов |

### Пример Ansible Playbook для Cisco IOS

```yaml
---
- name: Configure Cisco Router
  hosts: routers
  gather_facts: no

  vars:
    interface: GigabitEthernet0/0
    ip_address: 192.168.1.1
    subnet_mask: 255.255.255.0

  tasks:
    - name: Set hostname
      cisco.ios.ios_hostname:
        config:
          hostname: R1

    - name: Configure interface
      cisco.ios.ios_interfaces:
        config:
          - name: "{{ interface }}"
            description: "LAN Interface"
            enabled: true

    - name: Configure IP address
      cisco.ios.ios_l3_interfaces:
        config:
          - name: "{{ interface }}"
            ipv4:
              - address: "{{ ip_address }}/24"
```

### Inventory файл

```ini
[routers]
192.168.1.1 ansible_user=admin ansible_password=cisco123 ansible_network_os=ios

[switches]
192.168.1.10 ansible_user=admin ansible_password=cisco123 ansible_network_os=ios
192.168.1.11

[all:vars]
ansible_connection=network_cli
```

---

## Puppet

| Характеристика | Описание |
|---|---|
| Язык | Puppet DSL (Ruby-based) |
| Агент | Да (Puppet Agent на каждом узле) |
| Модель | Pull (агент запрашивает конфиг у Puppet Master) |
| Разработчик | Puppet, Inc. |

**Принцип работы:**
1. Puppet Master хранит "манифесты" (желаемое состояние)
2. Puppet Agent (на устройствах) периодически запрашивает манифест
3. Агент применяет изменения, если состояние отличается от желаемого

```puppet
# Пример манифеста Puppet
class network_config {
  cisco_interface { 'GigabitEthernet0/0':
    ensure      => present,
    description => 'LAN Interface',
    shutdown    => false,
    ipv4_address => '192.168.1.1/24',
  }
}
```

---

## Chef

| Характеристика | Описание |
|---|---|
| Язык | Ruby (Recipes/Cookbooks) |
| Агент | Да (Chef Client) |
| Модель | Pull (Chef Client → Chef Server) |
| Разработчик | Progress (ранее Chef Software) |

**Компоненты:**
- **Chef Server** — хранит конфигурации
- **Chef Client** — агент на управляемых узлах
- **Workstation** — где разработчики пишут рецепты
- **Cookbook** — набор рецептов для одной задачи

---

## Сравнение инструментов

| Характеристика | Ansible | Puppet | Chef |
|---|---|---|---|
| Агент | Нет | Да | Да |
| Язык конфига | YAML | Puppet DSL | Ruby |
| Модель | Push | Pull | Pull |
| Кривая обучения | Низкая | Средняя | Высокая |
| Сетевые модули | Отличные (cisco.ios, cisco.nxos) | Ограниченные | Ограниченные |
| Популярность для сетей | Очень высокая | Средняя | Низкая |

> **💡 Совет:** Для CCNA экзамена главное: **Ansible = agentless = YAML = push**; **Puppet/Chef = agent-based = pull**. Ansible наиболее распространён для автоматизации сетей Cisco.

---

## Terraform

**Terraform** (HashiCorp) — Infrastructure as Code для облачных и on-prem ресурсов.

| Характеристика | Описание |
|---|---|
| Язык | HCL (HashiCorp Configuration Language) |
| Подход | Декларативный (описываешь конечное состояние) |
| Провайдеры | AWS, Azure, GCP, Cisco ACI, VMware, и др. |
| Применение | Создание инфраструктуры (VM, сети, маршрутизаторы) |

```hcl
resource "cisco-asa_access_rules" "example" {
  interface = "inside"
  action    = "permit"
  source    = "192.168.1.0/24"
  destination = "any"
  protocols = ["tcp"]
}
```

---

## Cisco IOS и автоматизация

### EEM (Embedded Event Manager)

Встроенный в IOS инструмент для автоматизации реакций на события:

```bash
# Пример: при падении интерфейса — отправить syslog + backup config
Router(config)# event manager applet LINK_DOWN
Router(config-applet)# event syslog pattern "Interface.*down"
Router(config-applet)# action 1.0 syslog msg "Interface went down - alerting"
Router(config-applet)# action 2.0 cli command "enable"
Router(config-applet)# action 3.0 cli command "copy running-config tftp://10.0.0.1/backup.cfg"
```

### TCL Scripting

Cisco IOS поддерживает TCL-скрипты:

```tcl
# Простой TCL-скрипт на IOS
Router# tclsh
Router(tcl)# puts [exec "show version | include IOS"]
```

---

## Ресурсы

| Ресурс | Описание |
|---|---|
| [Ansible for Network Automation — Ansible Docs](https://docs.ansible.com/ansible/latest/network/index.html) | Официальная документация Ansible по автоматизации сети |
| [RFC 6241 — NETCONF](https://www.rfc-editor.org/rfc/rfc6241) | Network Configuration Protocol: операции, XML, capabilities |
| [RESTCONF — RFC 8040](https://www.rfc-editor.org/rfc/rfc8040) | RESTCONF Protocol: HTTP-интерфейс для YANG моделей |
| [Configuration Management Tools — networklessons.com](https://networklessons.com/cisco/ccna-routing-switching-icnd2-200-105/configuration-management) | Ansible vs Puppet vs Chef: агентные и безагентные подходы |
| [Jeremy's IT Lab — Configuration Management (YouTube)](https://www.youtube.com/watch?v=_k_v_-0TH_k) | Ansible, Puppet, Chef, Terraform, YANG из серии Free CCNA |
| [Cisco DevNet — Network Automation](https://developer.cisco.com/network-automation/) | Cisco DevNet: ресурсы по NETCONF, RESTCONF, YANG, Ansible |
