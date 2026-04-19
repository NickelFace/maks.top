---
title: "LPIC-2 212.5 — OpenVPN"
date: 2026-07-01
description: "Режимы туннеля OpenVPN (tun/tap), настройка PKI и сертификатов, конфигурация сервера и клиента, статический ключ vs режим TLS, маршрутизация, конфигурация /etc/openvpn. Тема экзамена LPIC-2 212.5."
tags: ["Linux", "LPIC-2", "OpenVPN", "VPN", "PKI", "TLS", "networking"]
categories: ["LPIC-2"]
page_lang: "ru"
lang_pair: "/posts/lpic2/lpic2-212-5-openvpn/"
pagefind_ignore: true
build:
  list: never
  render: always
---

> **Тема экзамена 212.5** — OpenVPN (вес: 2). Охватывает настройку туннеля OpenVPN, создание PKI, конфигурационные файлы сервера/клиента и маршрутизацию.

---

## Что такое OpenVPN

OpenVPN — свободное приложение для создания VPN туннелей. Создаёт зашифрованный канал между двумя или несколькими узлами через публичную сеть.

Ключевые характеристики:

- Работает поверх SSL/TLS — использует библиотеку OpenSSL и протоколы TLSv1.2/TLSv1.3
- Проходит через NAT и firewall
- Один бинарный файл для сервера и клиента
- Не совместим с IPsec и другими VPN-пакетами
- Порт по умолчанию: UDP 1194
- Кроссплатформенность: Linux, Windows, macOS, Android, iOS

Конфигурационные файлы хранятся в `/etc/openvpn/`. Сервер использует `server.conf`, клиент использует `client.conf`.

На экзамене: OpenVPN несовместим с IPsec. Один бинарник работает и как сервер, и как клиент. Порт по умолчанию — 1194/UDP.

```bash
apt-get install openvpn easy-rsa    # Debian/Ubuntu
yum install openvpn easy-rsa        # Red Hat/CentOS
```

Каталог конфигурации: `/etc/openvpn/`

---

## Типы сетевых устройств TUN и TAP

OpenVPN создаёт виртуальные сетевые интерфейсы двух типов.

| Устройство | Уровень | Назначение |
|---|---|---|
| tun | L3 (IP) | Маршрутизация IP-пакетов, point-to-point |
| tap | L2 (Ethernet) | Bridging, передача всего Ethernet-трафика |

TUN — для большинства VPN. TAP нужен, когда требуется передавать широковещательный трафик или протоколы не-IP (например, соединение двух сегментов LAN).

В конфиге: `dev tun0` задаёт конкретный интерфейс, `dev tun` создаёт динамический.

---

## Методы аутентификации

OpenVPN поддерживает два метода:

### 1. Static Key (статический ключ)

Оба узла используют один и тот же ключ. Проще в настройке, подходит для point-to-point. Ключ генерируется командой:

```bash
openvpn --genkey --secret static.key
```

Файл `static.key` нужно скопировать на оба узла через защищённый канал (например, scp). Статический ключ нельзя передавать по незащищённому каналу.

Режим статического ключа прост, но не обеспечивает Perfect Forward Secrecy и не масштабируется. Используйте режим PKI/TLS в production.

### 2. PKI (Public Key Infrastructure)

Сервер и клиент генерируют пары ключей. Центр сертификации (CA) подписывает ключи. Для этого используются скрипты из пакета easy-rsa:

| Скрипт | Назначение |
|---|---|
| `build-ca` | Создаёт CA-сертификат |
| `build-key-server` | Создаёт ключевую пару сервера |
| `build-key` | Создаёт ключевую пару клиента |
| `build-dh` | Вычисляет параметры Diffie-Hellman |

Ключи клиентов после генерации копируются в `/etc/openvpn/keys/` и передаются клиентам по защищённому каналу.

---

## PKI с Easy-RSA

Режим TLS OpenVPN требует:

1. Сертификат CA (`ca.crt`)
2. Сертификат + ключ сервера (`server.crt`, `server.key`)
3. Сертификат + ключ клиента (`client.crt`, `client.key`)
4. Параметры Диффи-Хеллмана (`dh.pem`)
5. Ключ аутентификации TLS (`ta.key`) — необязательно, но рекомендуется

### Настройка с Easy-RSA

```bash
make-cadir /etc/openvpn/easy-rsa
cd /etc/openvpn/easy-rsa

# Инициализировать PKI
./easyrsa init-pki

# Создать CA (Certificate Authority — удостоверяющий центр)
./easyrsa build-ca

# Создать сертификат и ключ сервера (без пароля для сервера)
./easyrsa build-server-full server nopass

# Создать сертификат и ключ клиента
./easyrsa build-client-full client1 nopass

# Создать параметры Диффи-Хеллмана
./easyrsa gen-dh

# Создать ключ аутентификации TLS (для директивы tls-auth)
openvpn --genkey --secret ta.key
```

Файлы размещаются в `/etc/openvpn/easy-rsa/pki/`:

```
pki/ca.crt                        # сертификат CA (скопировать на сервер и всем клиентам)
pki/issued/server.crt             # сертификат сервера
pki/private/server.key            # приватный ключ сервера
pki/issued/client1.crt            # сертификат клиента
pki/private/client1.key           # приватный ключ клиента
pki/dh.pem                        # параметры DH
ta.key                            # ключ аутентификации TLS
```

```bash
# Скопировать в /etc/openvpn/
cp pki/ca.crt pki/issued/server.crt pki/private/server.key pki/dh.pem /etc/openvpn/
```

---

## Основные опции команды openvpn

Опции можно передавать через командную строку (с префиксом `--`) или записывать в конфигурационный файл (без `--`).

| Опция | Описание |
|---|---|
| `--config file` | Загрузить дополнительные опции из файла |
| `--dev tunX\|tapX` | Виртуальный сетевой интерфейс |
| `--nobind` | Не привязываться к локальному адресу и порту; динамический порт для исходящих соединений |
| `--ifconfig l rn` | Задать IP-адреса VPN endpoint'ов; для TUN: l — локальный, rn — удалённый |
| `--secret file` | Файл статического ключа для шифрования (non-TLS режим) |
| `--remote host` | Адрес удалённого сервера (используется на клиенте) |
| `--keepalive n m` | Ping каждые n секунд, считать соединение упавшим через m секунд |
| `--ping-timer-rem` | Таймер ping работает только при наличии remote endpoint |
| `--persist-tun` | Не закрывать TUN/TAP интерфейс при перезапуске |
| `--persist-key` | Не перечитывать ключевые файлы при перезапуске |
| `--client-to-client` | Разрешить трафик между клиентами внутри VPN сервера |

`--nobind` нужен только на клиенте, который инициирует соединение через `--remote`.

---

## Конфигурация point-to-point со статическим ключом

**Шаг 1** — Генерация ключа (на любом узле):

```bash
openvpn --genkey --secret static.key
```

**Шаг 2** — Копирование ключа на второй узел:

```bash
scp static.key user@vpnclient:/etc/openvpn/
```

**Шаг 3** — Конфиг сервера `/etc/openvpn/server.conf`:

```
dev tun
ifconfig 10.10.10.10 10.10.10.11
keepalive 10 60
ping-timer-rem
persist-tun
persist-key
secret static.key
```

**Шаг 4** — Конфиг клиента `/etc/openvpn/client.conf`:

```
remote vpnserver.example.com
dev tun
ifconfig 10.10.10.11 10.10.10.10
keepalive 10 60
ping-timer-rem
persist-tun
persist-key
secret static.key
```

В `ifconfig` у сервера и клиента адреса зеркально переставлены: сервер указывает свой IP первым, клиент — свой первым.

---

## Конфигурация сервера (PKI/TLS)

```
# /etc/openvpn/server.conf

port 1194
proto udp                       # UDP быстрее; используйте tcp если UDP заблокирован
dev tun

# Файлы PKI
ca   /etc/openvpn/ca.crt
cert /etc/openvpn/server.crt
key  /etc/openvpn/server.key    # хранить в тайне
dh   /etc/openvpn/dh.pem

# Подсеть VPN
server 10.8.0.0 255.255.255.0   # подсеть VPN; сервер получает 10.8.0.1

# Аутентификация TLS (необязательно, но рекомендуется — защищает от DoS)
tls-auth /etc/openvpn/ta.key 0  # 0 = сервер

# Маршруты, передаваемые клиентам
push "route 192.168.1.0 255.255.255.0"
push "redirect-gateway def1 bypass-dhcp"  # маршрутизировать весь трафик клиентов через VPN
push "dhcp-option DNS 8.8.8.8"

# Связь клиент-клиент
client-to-client

# Постоянные опции
persist-key
persist-tun

# Сбросить привилегии после запуска
user nobody
group nobody        # или "group nogroup" на некоторых дистрибутивах

# Логирование
status /var/log/openvpn-status.log
log-append /var/log/openvpn.log
verb 3              # подробность: 0=тихо, 3=нормально, 9=отладка

keepalive 10 120
```

Пример конфига с явными именами цепочек (для exam):

```
mode server
tls-server
dev tun
ifconfig 10.8.0.1 10.8.0.2
ca /etc/openvpn/keys/ca.crt
cert /etc/openvpn/keys/server.crt
key /etc/openvpn/keys/server.key
dh /etc/openvpn/keys/dh2048.pem
client-to-client
keepalive 10 120
persist-tun
persist-key
```

---

## Конфигурация клиента (PKI/TLS)

```
# /etc/openvpn/client.conf  (или client.ovpn)

client                          # это клиент
dev tun
proto udp

remote vpn.example.com 1194    # адрес и порт сервера
resolv-retry infinite          # продолжать попытки разрешить имя хоста
nobind                         # не привязываться к конкретному локальному порту

persist-key
persist-tun

# Файлы PKI
ca   ca.crt
cert client1.crt
key  client1.key

# Аутентификация TLS
tls-auth ta.key 1              # 1 = клиент

# Проверить что сертификат сервера действительно является серверным сертификатом
remote-cert-tls server

verb 3
```

Пример конфига клиента для экзамена:

```
tls-client
remote vpnserver.example.com
dev tun
ca /etc/openvpn/keys/ca.crt
cert /etc/openvpn/keys/client.crt
key /etc/openvpn/keys/client.key
nobind
persist-tun
persist-key
```

Каждый узел в PKI-VPN должен иметь уникальный Common Name (CN) в сертификате.

### Встроенная конфигурация сертификатов (единый .ovpn файл)

Вместо отдельных файлов можно встроить сертификаты в конфигурацию:

```
<ca>
-----BEGIN CERTIFICATE-----
...CA certificate contents...
-----END CERTIFICATE-----
</ca>

<cert>
-----BEGIN CERTIFICATE-----
...client certificate...
-----END CERTIFICATE-----
</cert>

<key>
-----BEGIN PRIVATE KEY-----
...client private key...
-----END PRIVATE KEY-----
</key>

<tls-auth>
-----BEGIN OpenVPN Static key V1-----
...ta.key contents...
-----END OpenVPN Static key V1-----
</tls-auth>
key-direction 1
```

Это создаёт единый переносимый файл `.ovpn` для распространения клиентам. Один файл содержит всё необходимое — удобно раздавать пользователям.

---

## Запуск и управление

```bash
# Запуск сервера
sudo openvpn /etc/openvpn/server.conf
sudo openvpn --config server.conf       # то же самое через флаг

# Запуск клиента
sudo openvpn /etc/openvpn/client.conf

# Запуск через systemd
sudo systemctl start openvpn@server
sudo systemctl enable openvpn@server
```

Синтаксис `@server` ссылается на `server.conf` в `/etc/openvpn/`.

После успешного подключения появляется интерфейс `tun0` (или `tap0`). По умолчанию ему назначается адрес из сети `10.8.0.0/24` — сервер `10.8.0.1`, клиенты `10.8.0.2`–`10.8.0.254`.

```bash
# Проверка интерфейса после подключения
ifconfig tun0
ip addr show tun0
ip -br addr                        # современный краткий вариант
```

`ip link show tun0` показывает state UNKNOWN — виртуальные интерфейсы не имеют физического «carrier», это норма (то же самое у `lo`).

### Systemd-шаблоны: server vs client

На современной Ubuntu пакет `openvpn` регистрирует два специализированных шаблона:

| Шаблон | Путь к конфигу | Назначение |
|---|---|---|
| `openvpn-server@.service` | `/etc/openvpn/server/<n>.conf` | Серверный режим |
| `openvpn-client@.service` | `/etc/openvpn/client/<n>.conf` | Клиентский режим |
| `openvpn@.service` (legacy) | `/etc/openvpn/<n>.conf` | Старый шаблон, работает с обоими режимами |

Проверить доступные шаблоны:

```bash
systemctl cat openvpn-server@.service
systemctl cat openvpn-client@.service
systemctl cat openvpn@.service
```

Примеры запуска:

```bash
# Для /etc/openvpn/server/server.conf
sudo systemctl enable --now openvpn-server@server

# Для /etc/openvpn/client/work.conf
sudo systemctl start openvpn-client@work

# Диагностика
sudo systemctl status openvpn-server@server
sudo journalctl -xeu openvpn-server@server
```

### Client-side deployment из .ovpn профиля

```bash
# Вариант 1 — разовый запуск
sudo openvpn --client --config /path/to/dons-laptop.ovpn

# Вариант 2 — через systemd для постоянного подключения
# Переименовать .ovpn → .conf (systemd ожидает .conf)
mv dons-laptop.ovpn dons-laptop.conf
sudo mv dons-laptop.conf /etc/openvpn/client/

sudo systemctl enable --now openvpn-client@dons-laptop
```

Формат файла одинаковый — отличается только расширение. На Windows/Android OpenVPN-клиентах работает `.ovpn` напрямую. На Linux через systemd нужен `.conf`.

---

## Маршрутизация

### Пересылка IP на стороне сервера

Чтобы клиенты могли достичь LAN за VPN-сервером, включите пересылку IP:

```bash
echo 1 > /proc/sys/net/ipv4/ip_forward
# или в /etc/sysctl.conf:
# net.ipv4.ip_forward = 1
```

### NAT для клиентов VPN

```bash
iptables -t nat -A POSTROUTING -s 10.8.0.0/24 -o eth0 -j MASQUERADE
```

### Маршрутизировать весь трафик клиентов через VPN

В server.conf:

```
push "redirect-gateway def1 bypass-dhcp"
push "dhcp-option DNS 10.8.0.1"
```

Это перезаписывает маршрут по умолчанию у клиентов, чтобы весь их трафик шёл через VPN.

### Назначение IP для конкретного клиента

```
# server.conf
client-config-dir /etc/openvpn/ccd

# /etc/openvpn/ccd/client1
ifconfig-push 10.8.0.10 255.255.255.0
```

### Ловушка UFW vs iptables

Скрипты типа Nyr/openvpn-install добавляют правило для порта 1194 **напрямую в iptables**. `sudo ufw status` его **не покажет**, но соединение будет работать:

```bash
sudo ufw status                   # 1194 здесь НЕ увидишь
sudo iptables-save | grep 1194    # а вот здесь правило есть
```

Чтобы привести к UFW-единообразию: найти правило в iptables, удалить его, добавить через `sudo ufw allow 1194/udp`.

---

## Отзыв сертификатов

```bash
# Отозвать сертификат клиента
cd /etc/openvpn/easy-rsa
./easyrsa revoke client1

# Создать CRL (список отозванных сертификатов)
./easyrsa gen-crl

# Скопировать CRL в каталог OpenVPN
cp pki/crl.pem /etc/openvpn/

# Добавить в server.conf
crl-verify /etc/openvpn/crl.pem
```

OpenVPN проверяет CRL при каждом новом соединении. Отозванные сертификаты отклоняются.

---

## Шпаргалка для экзамена

### Файлы и пути

| Путь | Описание |
|---|---|
| `/etc/openvpn/` | Каталог конфигурации OpenVPN |
| `/etc/openvpn/server.conf` | Конфигурация сервера |
| `/etc/openvpn/client.conf` | Конфигурация клиента |
| `/etc/openvpn/keys/` | Директория ключей (PKI) |
| `/etc/openvpn/easy-rsa/pki/` | Каталог PKI |
| `/etc/openvpn/easy-rsa/pki/ca.crt` | Сертификат CA |
| `/etc/openvpn/easy-rsa/pki/issued/` | Подписанные сертификаты |
| `/etc/openvpn/easy-rsa/pki/private/` | Приватные ключи |
| `/var/log/openvpn.log` | Лог OpenVPN |
| `/var/log/openvpn-status.log` | Статус подключённых клиентов |

### Ключевые команды

```bash
openvpn --genkey --secret static.key   # генерация статического ключа
openvpn server.conf                    # запуск с конфигом
openvpn --config server.conf           # то же самое через флаг
openvpn --client --config client.ovpn  # запуск клиента из .ovpn профиля

systemctl start openvpn@server          # запустить экземпляр сервера (legacy)
systemctl enable --now openvpn-server@server  # серверный шаблон
systemctl enable --now openvpn-client@work    # клиентский шаблон

./easyrsa init-pki                      # инициализировать PKI
./easyrsa build-ca                      # создать CA
./easyrsa build-server-full server nopass
./easyrsa build-client-full client1 nopass
./easyrsa gen-dh                        # параметры Диффи-Хеллмана
openvpn --genkey --secret ta.key        # ключ аутентификации TLS
./easyrsa revoke client1                # отозвать сертификат
./easyrsa gen-crl                       # создать CRL
```

### Типичные ошибки на экзамене

- `tun` vs `tap`: `tun` = маршрутизация L3 (наиболее распространённый); `tap` = мост L2
- OpenVPN не совместим с IPsec
- `ifconfig` на сервере и клиенте имеют зеркальный порядок IP-адресов
- `--nobind` только для клиента, который инициирует соединение
- Статический ключ — один файл для обоих узлов; PKI — у каждого свои ключи
- `client-to-client` нужно явно указать, чтобы VPN-клиенты видели друг друга
- Направление ключа `tls-auth`: `0` на сервере; `1` на клиенте
- `remote-cert-tls server` — проверить что узел действительно является серверным сертификатом (предотвращает MITM)
- Пересылка IP для маршрутизации: необходимо включить `net.ipv4.ip_forward` чтобы клиенты VPN могли достичь LAN
- CRL не обновлён — отозвать + gen-crl + скопировать в `/etc/openvpn/` + `crl-verify` в конфиге
- Синтаксис systemd `@server` ссылается на `/etc/openvpn/server.conf`
- Скрипты-установщики пишут в iptables, а не в UFW — `ufw status` не показывает эти правила

---

## Вопросы для практики

**1. Какую команду используют для генерации статического ключа OpenVPN?**

`openvpn --genkey --secret static.key`

**2. Каков порт по умолчанию для OpenVPN?**

UDP 1194.

**3. В чём разница между устройствами tun и tap?**

tun работает на уровне L3 (маршрутизация IP), tap работает на уровне L2 (Ethernet bridging). tun используется для большинства VPN-соединений.

**4. Какой параметр конфигурации OpenVPN на клиенте разрешает использовать динамический исходящий порт?**

`nobind`. Он запрещает привязку к локальному адресу и порту, IP-стек сам назначает динамический порт.

**5. Где хранятся ключевые файлы PKI после генерации скриптами easy-rsa?**

В `/etc/openvpn/easy-rsa/pki/` (и в `/etc/openvpn/keys/` после копирования).

**6. Что нужно добавить в конфиг сервера, чтобы VPN-клиенты могли обмениваться трафиком напрямую через сервер?**

Директиву `client-to-client`.

**7. Как запустить OpenVPN через systemd для конфига `/etc/openvpn/server.conf`?**

`systemctl start openvpn@server`.

**8. Чем отличается static key от PKI в OpenVPN?**

При static key оба узла используют один и тот же файл ключа. При PKI каждый узел имеет собственную пару ключей, подписанных CA. PKI требуется для multi-client сценариев и обеспечивает отзыв конкретных сертификатов.
