---
title: "LPIC-2 208.2 — Apache HTTPS Configuration"
date: 2026-02-12
description: "SSL/TLS с mod_ssl: генерация ключа/CSR, самоподписанные сертификаты, CA.pl, SNI, wildcard-сертификаты, цепочки сертификатов, отключение слабых протоколов и шифров, ServerTokens, TraceEnable. Тема экзамена LPIC-2 208.2."
tags: ["Linux", "LPIC-2", "Apache", "HTTPS", "SSL", "TLS", "mod_ssl"]
categories: ["LPIC-2"]
page_lang: "ru"
lang_pair: "/posts/lpic2-208-2-https-configuration/"
pagefind_ignore: true
build:
  list: never
  render: always
---

> **Тема экзамена 208.2** — Конфигурация Apache HTTPS (вес: 3). Охватывает настройку SSL/TLS с mod_ssl, управление сертификатами, SNI, виртуальный хостинг через HTTPS и защиту от известных атак.

---

## Основы SSL/TLS

```
Client                              Server (Apache + mod_ssl)
  |                                        |
  |---- request public key --------------->|
  |<--- send (CA-signed) public key -------|
  |                                        |
  |  verify signature against CA trust     |
  |  (locally, in browser)                 |
  |                                        |
  |---- encrypt session key with pub key ->|
  |<--- decrypt with private key ----------|
  |         (symmetric session from here)  |
```

**Асимметричная криптография (PKC):**

- **Публичный ключ** — шифрует сообщения, распространяется открыто (в сертификате)
- **Приватный ключ** — расшифровывает сообщения, **никогда не покидает сервер**
- Сертификат подписан CA (Certificate Authority) — браузер ему доверяет

---

## Расположение SSL-файлов

| Тип | Debian | Red Hat |
|---|---|---|
| Сертификаты | `/etc/ssl/certs/` | `/etc/pki/tls/certs/` |
| Приватные ключи | `/etc/ssl/private/` | `/etc/pki/tls/private/` |
| Конфигурация OpenSSL | `/etc/ssl/openssl.cnf` | `/etc/pki/tls/openssl.cnf` |

> Лучшая практика: создавать поддиректорию для каждого сайта, например `/etc/ssl/webserver/`.

---

## Установка mod_ssl

```bash
# Red Hat / CentOS
yum install httpd mod_ssl

# Debian / Ubuntu
apt-get install apache2 openssl
```

### Включение на Debian:

```bash
a2enmod ssl
service apache2 restart

# Check:
apachectl status | grep -i ssl
```

### Включение на Red Hat (в `/etc/httpd/conf.d/ssl.conf`):

```apache
LoadModule ssl_module modules/mod_ssl.so
Listen 443
```

---

## Генерация ключа и CSR (для коммерческого CA)

```bash
# Step 1: Generate private key (2048-bit RSA, encrypted with 3DES)
openssl genrsa -des3 -out server.key 2048

# Step 1a (optional): Strip passphrase for automatic Apache restart
openssl rsa -in server.key -out stripped.key
# server.key = encrypted; stripped.key = plaintext (guard carefully)

# Step 2: Create CSR (Certificate Signing Request)
openssl req -new -key server.key -out server.csr
# When prompted for "Common Name", enter the FQDN: www.example.com
```

### Правила Common Name (CN):

| Значение CN | Действителен для |
|---|---|
| `www.foo.example` | Только `https://www.foo.example` |
| `foo.example` | НЕ действителен для `www.foo.example` |
| `*.foo.example` | Все поддомены, но НЕ сам `foo.example` |

После создания CSR:
1. Отправьте `server.csr` в коммерческий CA (DigiCert, Comodo и т.д.)
2. Получите подписанный сертификат `newcert.pem`
3. Файл `.csr` больше не нужен

---

## Создание самоподписанного сертификата

```bash
mkdir /etc/ssl/webserver

openssl req -new -x509 -days 365 -nodes \
  -out /etc/ssl/webserver/apache.pem \
  -keyout /etc/ssl/webserver/apache.key
```

| Флаг | Значение |
|---|---|
| `-x509` | Создать сертификат напрямую (не CSR) |
| `-nodes` | Без пароля на ключ (для автоматического запуска) |
| `-days 365` | Срок действия сертификата |

> Самоподписанные сертификаты вызывают предупреждения браузера — CA неизвестен. Используйте только для тестирования или внутренних сетей.

```bash
# Inspect certificate
openssl x509 -in /etc/ssl/webserver/apache.pem -text -noout

# Test SSL connection
openssl s_client -connect example.com:443
openssl s_client -connect example.com:443 -tls1_2
```

---

## Создание собственного CA с помощью CA.pl

```bash
# Script location:
# Debian:   /usr/lib/ssl/misc/CA.pl
# Red Hat:  /etc/pki/tls/misc/CA.pl

# Step 1: Create CA root  (→ ./demoCA/private/cakey.pem)
/usr/lib/ssl/misc/CA.pl -newca

# Step 2: Create certificate request  (→ newreq.pem, newkey.pem)
/usr/lib/ssl/misc/CA.pl -newreq

# Step 3: Sign the request  (→ newcert.pem)
/usr/lib/ssl/misc/CA.pl -signreq
```

| Файл | Содержимое |
|---|---|
| `newcert.pem` | Подписанный сертификат |
| `newkey.pem` | Приватный ключ |

> Переименуйте файлы для ясности: `ssltest.example.com.crt` и `ssltest.example.com.key`.

---

## Ключевые SSL-директивы

| Директива | Назначение |
|---|---|
| `SSLEngine on` | Включить SSL для данного VirtualHost |
| `SSLCertificateFile` | Путь к публичному сертификату (PEM) |
| `SSLCertificateKeyFile` | Путь к приватному ключу (PEM) |
| `SSLCACertificateFile` | Объединённые CA-сертификаты (один файл) |
| `SSLCACertificatePath` | Директория с CA-сертификатами |
| `SSLProtocol` | Разрешённые/запрещённые версии TLS/SSL |
| `SSLCipherSuite` | Список шифров через двоеточие |
| `SSLHonorCipherOrder` | Сервер (не клиент) выбирает порядок шифров |
| `SSLCompression` | Включить/выключить SSL-компрессию |
| `SSLVerifyClient` | `require` = взаимный TLS (аутентификация по клиентскому сертификату) |
| `ServerTokens` | Количество версионной информации в заголовках |
| `ServerSignature` | Подпись Apache на страницах ошибок |
| `TraceEnable` | Разрешить/запретить метод HTTP TRACE |

### SSLCACertificateFile против SSLCACertificatePath:

```bash
# Single file — concatenate all CAs
cat ca1.pem ca2.pem ca3.pem > /etc/ssl/certs/ca-bundle.pem
```

```apache
SSLCACertificateFile /etc/ssl/certs/ca-bundle.pem
# OR
SSLCACertificatePath /etc/ssl/certs/
```

---

## Полная конфигурация HTTPS VirtualHost

### ports.conf (Debian):

```apache
Listen 80
Listen 443
```

### Пример HTTP + HTTPS:

```apache
<VirtualHost *:80>
    ServerName   example.com
    DocumentRoot /var/www/html
    Redirect permanent / https://example.com/
</VirtualHost>

<VirtualHost *:443>
    SSLEngine             On
    SSLCertificateFile    /etc/ssl/webserver/apache.pem
    SSLCertificateKeyFile /etc/ssl/webserver/apache.key

    ServerName    example.com
    DocumentRoot  /var/www/html
    ErrorLog      /var/log/apache2/error.log
</VirtualHost>
```

---

## Проблема SSL + виртуальные хосты

### Проблема с порядком событий:

```
Client → TCP → SSL handshake → [certificate sent] → HTTP request → Apache reads Host:
                    ^
          Certificate already sent!
          Apache doesn't yet know which VirtualHost is needed
```

| Тип виртуального хоста | SSL | Примечания |
|---|---|---|
| **На основе IP** | Нет проблем | Уникальный IP для каждого сайта |
| **На основе имени** | Проблема | Один IP — Apache не знает имя хоста до завершения SSL-рукопожатия |

**Решение:** SNI

---

## SNI — Server Name Indication

**SNI** — расширение TLS, при котором браузер включает имя хоста в **первое сообщение SSL-рукопожатия** (`client hello`), ещё до установки зашифрованного канала.

```
Client ---- client hello + server_name=example.com ----> Apache
                                                           |
                                              Picks the right certificate
                                                           |
           <--------- Sends correct certificate -----------+
```

> **Ограничение:** `server_name` должен содержать имя хоста/домен — не IP-адрес.

### Браузеры без поддержки SNI:

| Браузер/Система | SNI |
|---|---|
| Все современные браузеры | Поддерживается |
| Android 2.x (стандартный браузер) | Не поддерживается |
| IE на Windows XP до SP3 | Не поддерживается |
| Java < 1.7 | Не поддерживается |

### Несколько HTTPS-сайтов через SNI:

```apache
<VirtualHost *:443>
    ServerName site1.example.com
    SSLEngine on
    SSLCertificateFile    /etc/ssl/certs/site1.pem
    SSLCertificateKeyFile /etc/ssl/private/site1.key
    DocumentRoot /var/www/site1
</VirtualHost>

<VirtualHost *:443>
    ServerName site2.example.com
    SSLEngine on
    SSLCertificateFile    /etc/ssl/certs/site2.pem
    SSLCertificateKeyFile /etc/ssl/private/site2.key
    DocumentRoot /var/www/site2
</VirtualHost>
```

### Резервный вариант для клиентов без SNI (мультидоменный сертификат):

```apache
# Block without ServerName — catches all requests without SNI
<VirtualHost *:443>
    SSLEngine on
    SSLCertificateFile    /etc/ssl/certs/multidomain.pem
    SSLCertificateKeyFile /etc/ssl/private/multidomain.key
</VirtualHost>
```

---

## Wildcard и мультидоменные сертификаты

### Wildcard (`*.example.com`):

| URL | Действителен? |
|---|---|
| `https://www.example.com` | Да |
| `https://mail.example.com` | Да |
| `https://example.com` | Нет (корневой домен) |
| `https://sub.www.example.com` | Нет (поддомен поддомена) |

```apache
<VirtualHost *:443>
    ServerName virtual01.example.com
    SSLCertificateFile /etc/ssl/certs/wildcard.example.com.pem
    # CN = *.example.com
</VirtualHost>
```

---

## Цепочка сертификатов

```
Root CA           ← in browser trust store
    |
    +-- Intermediate CA (G2)  ← may not be in browser!
            |
            +-- Your certificate
```

**Проблема:** браузер не знает промежуточный CA — ошибка цепочки.

**Решение:**

```bash
# Concatenate: your cert first, then intermediate(s)
cat your_cert.pem intermediate.pem > chain.pem
```

```apache
# Modern way (Apache 2.4.8+) — everything in one file
SSLCertificateFile /etc/ssl/certs/chain.pem
```

---

## Отключение слабых протоколов и шифров

```apache
# TLS 1.2 only (minimum recommended)
SSLProtocol -All +TLSv1.2

# Strong ciphers only, no RC4
SSLCipherSuite EECDH+AESGCM:EDH+AESGCM:AES256+EECDH:AES256+EDH:!RC4

# Server chooses cipher order (not client)
SSLHonorCipherOrder On

# Disable compression (CRIME attack protection)
SSLCompression Off
```

### Статус протоколов:

| Протокол | Статус | Причина |
|---|---|---|
| **SSLv2** | Запрещён | Удалён из Apache 2.4+ |
| **SSLv3** | Запрещён | POODLE, DROWN |
| **TLS 1.0** | Устарел | BEAST |
| **TLS 1.1** | Устарел | Слабые шифры |
| **TLS 1.2** | Рекомендован | Действующий стандарт |
| **TLS 1.3** | Предпочтителен | Наиболее безопасен |

### Шифры для блокировки:

| Шифр | Идентификатор | Причина |
|---|---|---|
| RC4 / Arcfour | `!RC4` | Известные уязвимости |
| CBC-шифры | `!CBC` | BEAST, Lucky13 |
| NULL-шифры | `!aNULL` | Отсутствие шифрования |
| MD5 | `!MD5` | Слабый хэш |
| EXPORT | `!EXPORT` | Намеренно ослабленные |

---

## Директивы безопасности

### ServerTokens

Управляет содержимым HTTP-заголовка `Server:`:

| Значение | Пример заголовка `Server:` |
|---|---|
| `Full` (по умолчанию) | `Apache/2.4.41 (Ubuntu) OpenSSL/1.1.1f PHP/7.4` |
| `OS` | `Apache/2.4.41 (Ubuntu)` |
| `Minor` | `Apache/2.4` |
| `Major` | `Apache/2` |
| `Prod` (рекомендуется) | `Apache` |

```apache
# Global directive (outside any VirtualHost!)
ServerTokens Prod
```

> Полностью скрыть или изменить значение заголовка можно только при компиляции Apache из исходников.

### ServerSignature

```apache
ServerSignature Off     # no signature (recommended for production)
ServerSignature On      # show version (useful in proxy chains)
ServerSignature Email   # show version + ServerAdmin email
```

### TraceEnable

| Значение | Поведение |
|---|---|
| `on` (по умолчанию) | TRACE разрешён согласно RFC 2616 |
| `off` | Сервер возвращает **405 Method Not Allowed** |
| `extended` | TRACE с телом запроса — только для отладки |

```apache
TraceEnable off
```

> HTTP TRACE является законной частью HTTP/1.1 (RFC 2616). Отключайте только при наличии конкретной причины, невзирая на то, что могут сообщать сканеры уязвимостей.

---

## Include против IncludeOptional

```apache
# Required include — Apache won't start if no files match
Include /etc/apache2/conf-enabled/*.conf

# Optional include — silently ignored if no files match
IncludeOptional /etc/apache2/sites-enabled/*.conf
```

---

## Шпаргалка к экзамену

### Атаки и защита

| Атака | Уязвимый компонент | Директива |
|---|---|---|
| **POODLE** | SSLv3 | `SSLProtocol -SSLv3` |
| **DROWN** | SSLv2 | `SSLProtocol -SSLv2` |
| **CRIME** | SSL-компрессия | `SSLCompression off` |
| **BEAST** | CBC + TLS 1.0 | `SSLProtocol -TLSv1` + `!CBC` |
| **RC4 attacks** | Шифр RC4/Arcfour | `SSLCipherSuite !RC4` |
| **Downgrade** | Клиент навязывает слабый шифр | `SSLHonorCipherOrder on` |
| **XST** | HTTP TRACE | `TraceEnable off` |
| **Info leak** | Версия Apache в заголовках | `ServerTokens Prod` |

### Команды openssl

```bash
openssl genrsa -des3 -out server.key 2048           # generate private key
openssl rsa -in server.key -out stripped.key         # remove passphrase
openssl req -new -key server.key -out server.csr     # create CSR
openssl req -new -x509 -days 365 -nodes \
  -out apache.pem -keyout apache.key                 # self-signed cert
openssl x509 -in apache.pem -text -noout             # inspect certificate
openssl s_client -connect example.com:443            # test connection
```

### Полная защищённая конфигурация HTTPS

```apache
# Global
ServerTokens Prod
ServerSignature Off
TraceEnable off

Listen 80
Listen 443

<VirtualHost *:80>
    ServerName example.com
    Redirect permanent / https://example.com/
</VirtualHost>

<VirtualHost *:443>
    ServerName    example.com
    DocumentRoot  /var/www/html

    SSLEngine on
    SSLCertificateFile    /etc/ssl/webserver/apache.pem
    SSLCertificateKeyFile /etc/ssl/webserver/apache.key

    SSLProtocol         -All +TLSv1.2
    SSLCipherSuite      EECDH+AESGCM:EDH+AESGCM:AES256+EECDH:AES256+EDH:!RC4
    SSLHonorCipherOrder On
    SSLCompression      Off
</VirtualHost>
```

### Расположение скрипта CA.pl

| Дистрибутив | Путь |
|---|---|
| Debian | `/usr/lib/ssl/misc/CA.pl` |
| Red Hat | `/etc/pki/tls/misc/CA.pl` |
