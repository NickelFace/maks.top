---
title: "Network Engineer — 02. STP"
date: 2025-08-12
description: "Лабораторная работа: построение коммутируемой сети с резервными каналами. Выбор корневого моста, стоимость порта, приоритет порта."
tags: ["Networking", "STP", "Spanning Tree", "Cisco"]
categories: ["Network Engineer"]
code_toggle: true
page_lang: "ru"
lang_pair: "/posts/neteng/neteng-02-stp/"
pagefind_ignore: true
build:
  list: never
  render: always
---

## Лабораторная работа: Построение коммутируемой сети с резервными каналами

### Топология

![STP scheme](/img/neteng/02/Scheme.png)

### Таблица адресации

| Устройство | Интерфейс | IP-адрес    | Маска подсети |
| ---------- | --------- | ----------- | ------------- |
| S1         | VLAN 1    | 192.168.1.1 | 255.255.255.0 |
| S2         | VLAN 1    | 192.168.1.2 | 255.255.255.0 |
| S3         | VLAN 1    | 192.168.1.3 | 255.255.255.0 |

### Цели

- **Часть 1.** Соберите топологию и настройте базовые параметры устройств
- **Часть 2.** Выберите корневой мост
- **Часть 3.** Наблюдайте за выбором портов STP на основе стоимости порта
- **Часть 4.** Наблюдайте за выбором портов STP на основе приоритета порта

---

### Часть 1 — Базовая настройка

Соберите топологию и назначьте IP-адреса интерфейсу VLAN 1.

<details>
<summary>S1</summary>
<pre><code>
enable
conf t
hostname S1
interface vlan 1
ip address 192.168.1.1 255.255.255.0
no shutdown
exit
no ip domain-lookup
enable secret cisco
line console 0
password cisco
login
logging synchronous
exit
do copy run start
</code></pre>
</details>
<details>
<summary>S2</summary>
<pre><code>
enable
conf t
hostname S2
interface vlan 1
ip address 192.168.1.2 255.255.255.0
no shutdown
exit
no ip domain-lookup
enable secret cisco
line console 0
password cisco
login
logging synchronous
exit
do copy run start
</code></pre>
</details>
<details>
<summary>S3</summary>
<pre><code>
enable
conf t
hostname S3
interface vlan 1
ip address 192.168.1.3 255.255.255.0
no shutdown
exit
no ip domain-lookup
enable secret cisco
line console 0
password cisco
login
logging synchronous
exit
do copy run start
</code></pre>
</details>

---

### Часть 2 — Выбор корневого моста

Проверьте текущее состояние STP на каждом коммутаторе:

```
show spanning-tree
```

<details>
<summary>Пример состояния STP</summary>

![STP status](/img/neteng/02/stp_status.png)

</details>

Коммутатор с наименьшим Bridge ID становится корневым мостом. Bridge ID состоит из приоритета (по умолчанию 32768) и MAC-адреса.

Чтобы принудительно назначить конкретный коммутатор корневым:

```
spanning-tree vlan 1 root primary
```

---

### Часть 3 — Выбор порта по стоимости

STP выбирает путь с наименьшей стоимостью до корня. Стоимости портов по умолчанию:

| Скорость канала | Стоимость |
| --------------- | --------- |
| 10 Мбит/с       | 100       |
| 100 Мбит/с      | 19        |
| 1 Гбит/с        | 4         |

Измените стоимость порта для влияния на выбор пути:

```
interface Ethernet 0/1
spanning-tree cost 18
```

<details>
<summary>Результат после изменения стоимости порта</summary>

![Port cost after change](/img/neteng/02/44res_cost.png)

</details>

---

### Часть 4 — Выбор порта по приоритету

При равной стоимости STP предпочитает порт с наименьшим приоритетом. По умолчанию — 128.

```
interface Ethernet 0/1
spanning-tree port-priority 64
```

<details>
<summary>Состояние порта после изменения приоритета</summary>

![Port status after](/img/neteng/02/port_status_after.png)

</details>

---

*Network Engineer Course | Лабораторная работа 02*
