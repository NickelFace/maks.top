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

## Основы OpenVPN

OpenVPN — это VPN с открытым исходным кодом на основе SSL/TLS. Создаёт зашифрованный туннель между хостами, используя библиотеку OpenSSL.

Ключевые характеристики:
- Работает на уровне 2 (tap) или уровне 3 (tun)
- Использует один порт UDP или TCP (по умолчанию: UDP 1194)
- Кроссплатформенность: Linux, Windows, macOS, Android, iOS
- Два режима аутентификации: **статический ключ** (предварительно общий) или **TLS/PKI** (на основе сертификатов)

```bash
apt install openvpn easy-rsa    # Debian/Ubuntu
yum install openvpn easy-rsa    # RHEL/CentOS
```

Каталог конфигурации: `/etc/openvpn/`

---

## Режимы туннеля

| Режим | Устройство | Уровень | Применение |
|---|---|---|---|
| `tun` | tun0 | Уровень 3 (IP-маршрутизация) | VPN удалённого доступа, маршрутизируемый site-to-site |
| `tap` | tap0 | Уровень 2 (Ethernet-мост) | Соединённые сети, не-IP протоколы, общий доступ к файлам Windows |

```
dev tun    # маршрутизируемый туннель (наиболее распространённый)
dev tap    # туннель с мостом
```

`tun` — выбор по умолчанию и наиболее распространённый. Используйте `tap` только когда нужен мост уровня 2 (например, соединение двух сегментов LAN так, как будто они один).

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

## Конфигурация сервера

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
push "route 192.168.1.0 255.255.255.0"    # указать клиентам как добраться до LAN
push "redirect-gateway def1 bypass-dhcp"  # маршрутизировать весь трафик клиентов через VPN
push "dhcp-option DNS 8.8.8.8"

# Связь клиент-клиент
client-to-client

# Постоянные опции (сохраняются после перезапуска)
persist-key
persist-tun

# Сбросить привилегии после запуска
user nobody
group nobody        # или "group nogroup" на некоторых дистрибутивах

# Логирование
status /var/log/openvpn-status.log
log-append /var/log/openvpn.log
verb 3              # подробность: 0=тихо, 3=нормально, 9=отладка

keepalive 10 120    # пинговать каждые 10с; перезапустить если нет ответа в течение 120с
```

```bash
systemctl start openvpn@server     # запустить используя /etc/openvpn/server.conf
systemctl enable openvpn@server
```

Синтаксис `@server` ссылается на `server.conf` в `/etc/openvpn/`.

---

## Конфигурация клиента

```
# /etc/openvpn/client.conf  (или client.ovpn)

client                          # это клиент
dev tun
proto udp

remote vpn.example.com 1194    # адрес и порт сервера
# Несколько серверов для резервирования:
# remote vpn1.example.com 1194
# remote vpn2.example.com 1194
# remote-random             # подключиться к случайному серверу

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

Это создаёт единый переносимый файл `.ovpn` для распространения клиентам.

---

## Режим статического ключа (простая настройка)

Для VPN «точка-точка» без PKI:

```bash
# Создать статический ключ
openvpn --genkey --secret static.key
```

**Сервер:**
```
dev tun
ifconfig 10.8.0.1 10.8.0.2
secret static.key
```

**Клиент:**
```
remote server-ip
dev tun
ifconfig 10.8.0.2 10.8.0.1
secret static.key
```

> Режим статического ключа прост, но не обеспечивает Perfect Forward Secrecy и не масштабируется (одинаковый ключ для всех клиентов). Используйте режим PKI/TLS в production.

---

## Маршрутизация

### Пересылка IP на стороне сервера

Чтобы клиенты могли достичь LAN за VPN-сервером, включите пересылку IP:

```bash
echo 1 > /proc/sys/net/ipv4/ip_forward
# или в /etc/sysctl.conf:
net.ipv4.ip_forward = 1
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
| `/etc/openvpn/easy-rsa/pki/` | Каталог PKI |
| `/etc/openvpn/easy-rsa/pki/ca.crt` | Сертификат CA |
| `/etc/openvpn/easy-rsa/pki/issued/` | Подписанные сертификаты |
| `/etc/openvpn/easy-rsa/pki/private/` | Приватные ключи |
| `/var/log/openvpn.log` | Лог OpenVPN |
| `/var/log/openvpn-status.log` | Статус подключённых клиентов |

### Ключевые команды

```bash
systemctl start openvpn@server          # запустить экземпляр сервера
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

| Ошибка | Правило |
|---|---|
| `tun` vs `tap` | `tun` = маршрутизация уровня 3 (наиболее распространённый); `tap` = мост уровня 2 |
| Направление ключа `tls-auth` | `0` на сервере; `1` на клиенте |
| `remote-cert-tls server` | Проверить что узел действительно является серверным сертификатом — предотвращает MITM |
| Статический ключ vs PKI | Статический ключ = простой, без PFS; PKI/TLS = для production |
| Пересылка IP для маршрутизации | Необходимо включить `net.ipv4.ip_forward` чтобы клиенты VPN могли достичь LAN |
| CRL не обновлён | Отозвать + gen-crl + скопировать в `/etc/openvpn/` + `crl-verify` в конфиге |
| Синтаксис systemd `@server` | Ссылается на `/etc/openvpn/server.conf` |
