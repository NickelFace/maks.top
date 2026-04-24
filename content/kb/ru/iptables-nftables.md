---
title: "iptables / nftables"
description: "Linux firewall: цепочки, таблицы, NAT, stateful-фильтрация, персистентность"
icon: "🔥"
group: "Security"
tags: ["Security", "iptables", "nftables", "Linux", "Firewall"]
date: 2026-04-14
page_lang: "ru"
lang_pair: "/kb/iptables-nftables/"
pagefind_ignore: true
build:
  list: never
  render: always
---

<div class="intro-card">
Справочник по Linux firewall: <strong>iptables</strong> (цепочки, таблицы, stateful-фильтрация, NAT, логирование, персистентность) и <strong>nftables</strong> (современный синтаксис). Покрывает тему LPIC-2 212.1.
</div>

## iptables — структура

<div class="ref-panel">
<div class="ref-panel-head">Таблицы и цепочки</div>
<div class="ref-panel-body">
<table class="cheat-table">
<thead><tr><th>Таблица</th><th>Цепочки</th><th>Назначение</th></tr></thead>
<tbody>
<tr><td class="mono">filter</td><td class="desc">INPUT · OUTPUT · FORWARD</td><td class="desc">Основная таблица — allow/drop/reject</td></tr>
<tr><td class="mono">nat</td><td class="desc">PREROUTING · OUTPUT · POSTROUTING</td><td class="desc">Трансляция адресов</td></tr>
<tr><td class="mono">mangle</td><td class="desc">Все пять</td><td class="desc">Модификация пакетов (TTL, TOS, метки)</td></tr>
<tr><td class="mono">raw</td><td class="desc">PREROUTING · OUTPUT</td><td class="desc">Обход conntrack</td></tr>
</tbody>
</table>
</div>
</div>

<div class="ref-panel">
<div class="ref-panel-head">Путь пакета</div>
<div class="ref-panel-body">
<table class="cheat-table">
<thead><tr><th>Трафик</th><th>Путь</th></tr></thead>
<tbody>
<tr><td class="mono">Входящий на хост</td><td class="desc">PREROUTING → INPUT → локальный процесс</td></tr>
<tr><td class="mono">Исходящий с хоста</td><td class="desc">локальный процесс → OUTPUT → POSTROUTING</td></tr>
<tr><td class="mono">Транзитный (роутер)</td><td class="desc">PREROUTING → FORWARD → POSTROUTING</td></tr>
</tbody>
</table>
</div>
</div>

## Просмотр и сброс

<div class="ref-panel">
<div class="ref-panel-head">Просмотр правил</div>
<div class="ref-panel-body">
<table class="cheat-table">
<thead><tr><th>Команда</th><th>Описание</th></tr></thead>
<tbody>
<tr><td class="mono">iptables -L -n -v --line-numbers</td><td class="desc">Все правила filter со счётчиками и номерами</td></tr>
<tr><td class="mono">iptables -L INPUT -n -v --line-numbers</td><td class="desc">Только цепочка INPUT</td></tr>
<tr><td class="mono">iptables -t nat -L -n -v</td><td class="desc">Таблица NAT</td></tr>
<tr><td class="mono">iptables -t mangle -L -n -v</td><td class="desc">Таблица mangle</td></tr>
</tbody>
</table>
</div>
</div>

<div class="ref-panel">
<div class="ref-panel-head">Сброс в чистое состояние</div>
<div class="ref-panel-body">
<table class="cheat-table">
<thead><tr><th>Команда</th><th>Описание</th></tr></thead>
<tbody>
<tr><td class="mono">iptables -F</td><td class="desc">Очистить все правила filter</td></tr>
<tr><td class="mono">iptables -F INPUT</td><td class="desc">Очистить только INPUT</td></tr>
<tr><td class="mono">iptables -X</td><td class="desc">Удалить пользовательские цепочки</td></tr>
<tr><td class="mono">iptables -Z</td><td class="desc">Обнулить счётчики</td></tr>
<tr><td class="mono">iptables -Z INPUT</td><td class="desc">Обнулить счётчики только INPUT</td></tr>
<tr><td class="mono">iptables -t nat -F</td><td class="desc">Очистить таблицу NAT</td></tr>
<tr><td class="mono">iptables -t mangle -F</td><td class="desc">Очистить таблицу mangle</td></tr>
<tr><td class="mono">iptables -P INPUT ACCEPT</td><td class="desc">Сбросить политику INPUT в ACCEPT</td></tr>
</tbody>
</table>
</div>
</div>

## Политики и управление правилами

<div class="ref-panel">
<div class="ref-panel-head">Добавление, вставка, удаление правил</div>
<div class="ref-panel-body">
<table class="cheat-table">
<thead><tr><th>Команда</th><th>Описание</th></tr></thead>
<tbody>
<tr><td class="mono">iptables -P INPUT DROP</td><td class="desc">Установить политику по умолчанию DROP</td></tr>
<tr><td class="mono">iptables -A INPUT -p tcp --dport 22 -j ACCEPT</td><td class="desc">Добавить правило в конец цепочки</td></tr>
<tr><td class="mono">iptables -I INPUT 1 -s 10.0.0.0/8 -j ACCEPT</td><td class="desc">Вставить правило на позицию 1</td></tr>
<tr><td class="mono">iptables -D INPUT 3</td><td class="desc">Удалить правило по номеру строки</td></tr>
<tr><td class="mono">iptables -D INPUT -p tcp --dport 80 -j ACCEPT</td><td class="desc">Удалить правило по совпадению</td></tr>
<tr><td class="mono">iptables -R INPUT 2 -p tcp --dport 443 -j ACCEPT</td><td class="desc">Заменить правило на позиции 2</td></tr>
</tbody>
</table>
</div>
</div>

## Типовые правила фильтрации

<div class="ref-panel">
<div class="ref-panel-head">Базовые правила INPUT</div>
<div class="ref-panel-body">
<table class="cheat-table">
<thead><tr><th>Команда</th><th>Описание</th></tr></thead>
<tbody>
<tr><td class="mono">iptables -A INPUT -i lo -j ACCEPT</td><td class="desc">Разрешить loopback (обязательно)</td></tr>
<tr><td class="mono">iptables -A INPUT -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT</td><td class="desc">Разрешить established/related трафик</td></tr>
<tr><td class="mono">iptables -A INPUT -m conntrack --ctstate INVALID -j DROP</td><td class="desc">Дропать невалидные пакеты</td></tr>
<tr><td class="mono">iptables -A INPUT -p tcp --dport 22 -j ACCEPT</td><td class="desc">Разрешить SSH</td></tr>
<tr><td class="mono">iptables -A INPUT -p tcp -m multiport --dports 80,443 -j ACCEPT</td><td class="desc">Разрешить HTTP/HTTPS (multiport)</td></tr>
<tr><td class="mono">iptables -A INPUT -p icmp --icmp-type echo-request -j ACCEPT</td><td class="desc">Разрешить ping</td></tr>
<tr><td class="mono">iptables -A INPUT -j DROP</td><td class="desc">Дропать всё остальное</td></tr>
</tbody>
</table>
</div>
</div>

<div class="ref-panel">
<div class="ref-panel-head">Фильтрация по источнику/назначению</div>
<div class="ref-panel-body">
<table class="cheat-table">
<thead><tr><th>Команда</th><th>Описание</th></tr></thead>
<tbody>
<tr><td class="mono">iptables -A INPUT -s 192.168.1.0/24 -j ACCEPT</td><td class="desc">Разрешить из подсети</td></tr>
<tr><td class="mono">iptables -A INPUT -s 10.0.0.55 -j DROP</td><td class="desc">Заблокировать конкретный IP</td></tr>
<tr><td class="mono">iptables -A INPUT -i eth0 -p tcp --dport 22 -j ACCEPT</td><td class="desc">SSH только с конкретного интерфейса</td></tr>
<tr><td class="mono">iptables -A INPUT -m iprange --src-range 10.0.0.10-10.0.0.11 -j ACCEPT</td><td class="desc">Разрешить диапазон IP</td></tr>
<tr><td class="mono">iptables -A INPUT -m mac --mac-source aa:bb:cc:dd:ee:ff -j DROP</td><td class="desc">Блокировать по MAC (только L2)</td></tr>
<tr><td class="mono">iptables -A OUTPUT -m owner --uid-owner nobody -j DROP</td><td class="desc">Дропать трафик от пользователя (только OUTPUT)</td></tr>
</tbody>
</table>
</div>
</div>

## Stateful-фильтрация (conntrack)

<div class="ref-panel">
<div class="ref-panel-head">Состояния соединений</div>
<div class="ref-panel-body">
<table class="cheat-table">
<thead><tr><th>Состояние</th><th>Значение</th></tr></thead>
<tbody>
<tr><td class="mono">NEW</td><td class="desc">Первый пакет нового соединения</td></tr>
<tr><td class="mono">ESTABLISHED</td><td class="desc">Соединение установлено, пакеты идут в обе стороны</td></tr>
<tr><td class="mono">RELATED</td><td class="desc">Связано с существующим соединением (FTP data, ICMP error)</td></tr>
<tr><td class="mono">INVALID</td><td class="desc">Не соответствует ни одному соединению — дропать</td></tr>
</tbody>
</table>
</div>
</div>

<div class="ref-panel">
<div class="ref-panel-head">Команды conntrack</div>
<div class="ref-panel-body">
<table class="cheat-table">
<thead><tr><th>Команда</th><th>Описание</th></tr></thead>
<tbody>
<tr><td class="mono">iptables -A INPUT -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT</td><td class="desc">Базовое stateful-правило</td></tr>
<tr><td class="mono">iptables -A INPUT -m conntrack --ctstate INVALID -j DROP</td><td class="desc">Дропать невалидные</td></tr>
<tr><td class="mono">iptables -A INPUT -p tcp --dport 22 --syn -m conntrack --ctstate NEW -j ACCEPT</td><td class="desc">Только новые SSH-соединения</td></tr>
<tr><td class="mono">conntrack -L</td><td class="desc">Показать таблицу conntrack</td></tr>
<tr><td class="mono">conntrack -S</td><td class="desc">Статистика conntrack</td></tr>
</tbody>
</table>
</div>
</div>

## NAT

<div class="ref-panel">
<div class="ref-panel-head">SNAT и MASQUERADE</div>
<div class="ref-panel-body">
<table class="cheat-table">
<thead><tr><th>Команда</th><th>Описание</th></tr></thead>
<tbody>
<tr><td class="mono">iptables -t nat -A POSTROUTING -s 192.168.10.0/24 -o eth0 -j MASQUERADE</td><td class="desc">MASQUERADE — динамический src IP (DHCP, PPPoE)</td></tr>
<tr><td class="mono">iptables -t nat -A POSTROUTING -s 192.168.10.0/24 -o eth0 -j SNAT --to-source 203.0.113.10</td><td class="desc">SNAT — фиксированный IP (быстрее MASQUERADE)</td></tr>
<tr><td class="mono">echo 1 | sudo tee /proc/sys/net/ipv4/ip_forward</td><td class="desc">Включить IP forwarding (нужен для NAT-роутера)</td></tr>
<tr><td class="mono">net.ipv4.ip_forward = 1</td><td class="desc">Постоянно — в /etc/sysctl.conf, применить sysctl -p</td></tr>
</tbody>
</table>
</div>
</div>

<div class="ref-panel">
<div class="ref-panel-head">DNAT и port forwarding</div>
<div class="ref-panel-body">
<table class="cheat-table">
<thead><tr><th>Команда</th><th>Описание</th></tr></thead>
<tbody>
<tr><td class="mono">iptables -t nat -A PREROUTING -i eth0 -p tcp --dport 8080 -j DNAT --to-destination 10.0.0.50:80</td><td class="desc">Пробросить 8080 → внутренний хост:80</td></tr>
<tr><td class="mono">iptables -t nat -A PREROUTING -i eth0 -p tcp --dport 10000:10010 -j DNAT --to-destination 10.0.0.50</td><td class="desc">Пробросить диапазон портов (маппинг 1:1)</td></tr>
<tr><td class="mono">iptables -t nat -A PREROUTING -p tcp --dport 80 -j REDIRECT --to-ports 8080</td><td class="desc">Перенаправить на локальный порт (PREROUTING/OUTPUT)</td></tr>
<tr><td class="mono">iptables -A FORWARD -i eth0 -o eth1 -p tcp --dport 80 -d 10.0.0.50 -m conntrack --ctstate NEW -j ACCEPT</td><td class="desc">Правило FORWARD обязательно при DNAT</td></tr>
<tr><td class="mono">conntrack -L -j</td><td class="desc">Показать активные NAT-трансляции</td></tr>
</tbody>
</table>
</div>
</div>

## Логирование и пользовательские цепочки

<div class="ref-panel">
<div class="ref-panel-head">Логирование</div>
<div class="ref-panel-body">
<table class="cheat-table">
<thead><tr><th>Команда</th><th>Описание</th></tr></thead>
<tbody>
<tr><td class="mono">iptables -A INPUT -j LOG --log-prefix "[DROP] " --log-level 4</td><td class="desc">LOG не останавливает обработку — пакет идёт дальше</td></tr>
<tr><td class="mono">iptables -A INPUT -m limit --limit 5/min -j LOG --log-prefix "[INPUT-DROP] "</td><td class="desc">LOG с rate limit (последнее правило перед политикой)</td></tr>
<tr><td class="mono">journalctl -k | grep DROP</td><td class="desc">Читать ядерный лог (цель LOG пишет в kern.log)</td></tr>
</tbody>
</table>
</div>
</div>

<div class="ref-panel">
<div class="ref-panel-head">Пользовательские цепочки</div>
<div class="ref-panel-body">
<table class="cheat-table">
<thead><tr><th>Команда</th><th>Описание</th></tr></thead>
<tbody>
<tr><td class="mono">iptables -N LOGDROP</td><td class="desc">Создать пользовательскую цепочку</td></tr>
<tr><td class="mono">iptables -A LOGDROP -j LOG --log-prefix "[DROP] "</td><td class="desc">Добавить LOG в цепочку</td></tr>
<tr><td class="mono">iptables -A LOGDROP -j DROP</td><td class="desc">Добавить DROP в цепочку</td></tr>
<tr><td class="mono">iptables -A INPUT -s 10.0.0.55 -j LOGDROP</td><td class="desc">Отправить трафик в пользовательскую цепочку</td></tr>
<tr><td class="mono">iptables -A chain -j RETURN</td><td class="desc">Вернуться в родительскую цепочку</td></tr>
</tbody>
</table>
</div>
</div>

## Rate limiting

<div class="ref-panel">
<div class="ref-panel-head">Модули limit и recent</div>
<div class="ref-panel-body">
<table class="cheat-table">
<thead><tr><th>Команда</th><th>Описание</th></tr></thead>
<tbody>
<tr><td class="mono">iptables -A INPUT -p icmp --icmp-type echo-request -m limit --limit 5/second --limit-burst 10 -j ACCEPT</td><td class="desc">Ограничить ping до 5/с (burst 10)</td></tr>
<tr><td class="mono">iptables -A INPUT -p tcp --dport 22 --syn -m conntrack --ctstate NEW -m limit --limit 1/second --limit-burst 5 -j ACCEPT</td><td class="desc">Защита SSH от брутфорса</td></tr>
<tr><td class="mono">iptables -A INPUT -p tcp --dport 80 -m conntrack --ctstate NEW -m recent --set --name HTTP</td><td class="desc">Отслеживать новые HTTP-соединения по IP</td></tr>
<tr><td class="mono">iptables -A INPUT -p tcp --dport 80 -m conntrack --ctstate NEW -m recent --update --seconds 1 --hitcount 20 --name HTTP -j DROP</td><td class="desc">Дропать при >20 новых соединений/с с одного IP</td></tr>
</tbody>
</table>
</div>
</div>

## FORWARD и маршрутизация

<div class="ref-panel">
<div class="ref-panel-head">Правила форвардинга</div>
<div class="ref-panel-body">
<table class="cheat-table">
<thead><tr><th>Команда</th><th>Описание</th></tr></thead>
<tbody>
<tr><td class="mono">iptables -A FORWARD -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT</td><td class="desc">Разрешить транзитный трафик для установленных соединений</td></tr>
<tr><td class="mono">iptables -A FORWARD -s 192.168.10.0/24 -i eth1 -o eth0 -m conntrack --ctstate NEW -j ACCEPT</td><td class="desc">Разрешить внутренней сети инициировать соединения наружу</td></tr>
<tr><td class="mono">iptables -I FORWARD 1 -s 192.168.10.50 -j DROP</td><td class="desc">Заблокировать конкретный внутренний хост</td></tr>
</tbody>
</table>
</div>
</div>

## Персистентность

<div class="ref-panel">
<div class="ref-panel-head">Сохранение и восстановление</div>
<div class="ref-panel-body">
<table class="cheat-table">
<thead><tr><th>Команда</th><th>Описание</th></tr></thead>
<tbody>
<tr><td class="mono">iptables-save > /etc/iptables/rules.v4</td><td class="desc">Сохранить правила в файл</td></tr>
<tr><td class="mono">iptables-restore < /etc/iptables/rules.v4</td><td class="desc">Применить правила атомарно</td></tr>
<tr><td class="mono">sudo apt install iptables-persistent</td><td class="desc">Автозагрузка правил при старте</td></tr>
<tr><td class="mono">sudo netfilter-persistent save</td><td class="desc">Сохранить текущие правила через сервис</td></tr>
<tr><td class="mono">sudo netfilter-persistent reload</td><td class="desc">Перезагрузить правила из /etc/iptables/</td></tr>
</tbody>
</table>
</div>
</div>

## Минимальный шаблон для сервера

```bash
# SSH первым — до установки политики DROP
iptables -F; iptables -X
iptables -A INPUT -p tcp --dport 22 -j ACCEPT
iptables -P INPUT DROP
iptables -P FORWARD DROP
iptables -P OUTPUT ACCEPT

iptables -A INPUT -i lo -j ACCEPT
iptables -A INPUT -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT
iptables -A INPUT -m conntrack --ctstate INVALID -j DROP
iptables -A INPUT -p tcp -m multiport --dports 80,443 -j ACCEPT
iptables -A INPUT -p icmp --icmp-type echo-request -m limit --limit 5/s -j ACCEPT
iptables -A INPUT -m limit --limit 5/min -j LOG --log-prefix "[DROP] "

netfilter-persistent save
```

## nftables

<div class="ref-panel">
<div class="ref-panel-head">Ключевые отличия от iptables</div>
<div class="ref-panel-body">
<table class="cheat-table">
<thead><tr><th>Возможность</th><th>iptables</th><th>nftables</th></tr></thead>
<tbody>
<tr><td class="mono">CLI</td><td class="desc">iptables / ip6tables / arptables</td><td class="desc">nft (единый инструмент)</td></tr>
<tr><td class="mono">Атомарное обновление</td><td class="desc">Нет (правило за правилом)</td><td class="desc">Да (транзакции)</td></tr>
<tr><td class="mono">Множества (sets)</td><td class="desc">ipset (внешний инструмент)</td><td class="desc">Встроены</td></tr>
<tr><td class="mono">Таблицы</td><td class="desc">Встроенные (filter/nat/…)</td><td class="desc">Определяются пользователем</td></tr>
</tbody>
</table>
</div>
</div>

<div class="ref-panel">
<div class="ref-panel-head">Синтаксис nft</div>
<div class="ref-panel-body">
<table class="cheat-table">
<thead><tr><th>Команда</th><th>Описание</th></tr></thead>
<tbody>
<tr><td class="mono">nft list ruleset</td><td class="desc">Показать все таблицы, цепочки, правила</td></tr>
<tr><td class="mono">nft add table inet filter</td><td class="desc">Создать таблицу (inet = IPv4+IPv6)</td></tr>
<tr><td class="mono">nft add chain inet filter input '{ type filter hook input priority 0; policy drop; }'</td><td class="desc">Создать цепочку input с политикой DROP</td></tr>
<tr><td class="mono">nft add rule inet filter input ct state established,related accept</td><td class="desc">Разрешить established</td></tr>
<tr><td class="mono">nft add rule inet filter input tcp dport { 22, 80, 443 } accept</td><td class="desc">Разрешить порты (set literal)</td></tr>
<tr><td class="mono">nft add rule inet filter input iif lo accept</td><td class="desc">Разрешить loopback</td></tr>
<tr><td class="mono">nft delete rule inet filter input handle 5</td><td class="desc">Удалить правило по номеру handle</td></tr>
<tr><td class="mono">nft -f /etc/nftables.conf</td><td class="desc">Загрузить набор правил из файла</td></tr>
<tr><td class="mono">nft list ruleset > /etc/nftables.conf</td><td class="desc">Сохранить набор правил в файл</td></tr>
</tbody>
</table>
</div>
</div>

<div class="ref-panel">
<div class="ref-panel-head">iptables → nftables: соответствия</div>
<div class="ref-panel-body">
<table class="cheat-table">
<thead><tr><th>iptables</th><th>nftables эквивалент</th></tr></thead>
<tbody>
<tr><td class="mono">-p tcp --dport 22 -j ACCEPT</td><td class="desc">tcp dport 22 accept</td></tr>
<tr><td class="mono">-s 192.168.1.0/24 -j DROP</td><td class="desc">ip saddr 192.168.1.0/24 drop</td></tr>
<tr><td class="mono">-m conntrack --ctstate ESTABLISHED -j ACCEPT</td><td class="desc">ct state established accept</td></tr>
<tr><td class="mono">-t nat -A POSTROUTING -j MASQUERADE</td><td class="desc">ip saddr ... masquerade (в цепочке postrouting)</td></tr>
<tr><td class="mono">-m multiport --dports 80,443</td><td class="desc">tcp dport { 80, 443 }</td></tr>
<tr><td class="mono">-m limit --limit 5/s -j ACCEPT</td><td class="desc">limit rate 5/second accept</td></tr>
<tr><td class="mono">-j LOG --log-prefix "DROP: "</td><td class="desc">log prefix "DROP: "</td></tr>
</tbody>
</table>
</div>
</div>
