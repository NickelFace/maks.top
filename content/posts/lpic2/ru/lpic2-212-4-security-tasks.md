---
title: "LPIC-2 212.4 — Security Tasks"
date: 2026-06-22
description: "Управление ключами GPG/OpenPGP, обнаружение вторжений (fail2ban, portsentry), сертификаты OpenSSL, инструменты аудита безопасности (nmap, lsof, fuser, netstat, arp), хеширование паролей. Тема экзамена LPIC-2 212.4."
tags: ["Linux", "LPIC-2", "GPG", "OpenPGP", "fail2ban", "portsentry", "nmap", "lsof", "john", "OpenSSL", "security"]
categories: ["LPIC-2"]
page_lang: "ru"
lang_pair: "/posts/lpic2/lpic2-212-4-security-tasks/"
pagefind_ignore: true
build:
  list: never
  render: always
---

> **Тема экзамена 212.4** — Security tasks (вес: 3). Охватывает управление ключами GPG, обнаружение вторжений, сертификаты OpenSSL и инструменты аудита безопасности.

---

## GPG — GNU Privacy Guard

GPG реализует стандарт OpenPGP (RFC 4880). Используется для шифрования файлов и электронной почты, подписи данных и проверки целостности.

### Основные понятия

| Термин | Значение |
|---|---|
| Публичный ключ | Передаётся всем; используется для шифрования данных, отправляемых вам, или проверки ваших подписей |
| Приватный ключ (секретный) | Хранится в тайне; используется для расшифровки данных или подписи |
| Связка ключей | Коллекция хранимых ключей |
| Отпечаток | Короткий хеш, идентифицирующий ключ; используется для проверки подлинности ключа |
| Сеть доверия | Модель доверия OpenPGP: ключи доверяются транзитивно через подписи |
| Сервер ключей | Публичный сервер для распространения публичных ключей |

### Управление ключами

```bash
# Создать пару ключей
gpg --gen-key
gpg --full-generate-key      # больше опций (тип ключа, размер, срок действия)

# Список ключей
gpg --list-keys              # список публичных ключей
gpg --list-secret-keys       # список приватных ключей
gpg -k                       # сокращение для --list-keys
gpg -K                       # сокращение для --list-secret-keys

# Экспорт / импорт
gpg --export -a "Alice" > alice.pub.asc         # экспортировать публичный ключ (ASCII-броня)
gpg --export-secret-keys -a "Alice" > alice.sec.asc
gpg --import alice.pub.asc                      # импортировать чужой публичный ключ

# Операции с сервером ключей
gpg --keyserver keys.openpgp.org --send-keys <fingerprint>
gpg --keyserver keys.openpgp.org --recv-keys <fingerprint>
gpg --keyserver keys.openpgp.org --search-keys alice@example.com

# Удалить ключи
gpg --delete-key "Alice"             # удалить публичный ключ
gpg --delete-secret-key "Alice"      # удалить приватный ключ

# Редактировать ключ (изменить срок действия, добавить UID, подписать и т.д.)
gpg --edit-key "Alice"
```

### Подпись и доверие к ключам

```bash
gpg --sign-key alice@example.com      # подписать ключ Алисы своим приватным ключом
# или интерактивно:
gpg --edit-key alice@example.com
gpg> sign
gpg> trust
gpg> quit
```

Уровни доверия: неизвестный → неопределённый → частичный → полный → абсолютный

### Шифрование и расшифровка

```bash
# Зашифровать для получателя (использует его публичный ключ)
gpg --encrypt --recipient alice@example.com file.txt
# → создаёт file.txt.gpg

# Зашифровать с ASCII-бронёй (для электронной почты)
gpg -e -a -r alice@example.com file.txt
# → создаёт file.txt.asc

# Расшифровать (использует ваш приватный ключ)
gpg --decrypt file.txt.gpg > file.txt
gpg -d file.txt.gpg

# Симметричное шифрование (только пароль, без ключей)
gpg --symmetric file.txt
gpg -c file.txt
```

### Подпись и проверка

```bash
# Подписать файл (создаёт отдельную подпись)
gpg --detach-sign file.txt          # создаёт file.txt.sig
gpg --detach-sign -a file.txt       # ASCII-броня: file.txt.asc

# Встроенная подпись (подпись встроена в файл)
gpg --sign file.txt                 # создаёт file.txt.gpg

# Подпись в открытом тексте (читаемая, подпись добавляется в конец)
gpg --clearsign message.txt         # создаёт message.txt.asc

# Проверить подпись
gpg --verify file.txt.sig file.txt
gpg --verify message.txt.asc
```

### Отзыв

```bash
# Создать сертификат отзыва (сделать это сразу после создания ключа)
gpg --gen-revoke alice@example.com > revoke.asc

# Отозвать ключ
gpg --import revoke.asc
```

> **Факт для экзамена:** Создайте сертификат отзыва сразу после генерации пары ключей — если вы потеряете доступ к приватному ключу, вы не сможете отозвать его позже.

### Файлы GPG

| Путь | Содержимое |
|---|---|
| `~/.gnupg/` | Домашний каталог GPG (0700) |
| `~/.gnupg/pubring.kbx` | Связка публичных ключей (современная) |
| `~/.gnupg/trustdb.gpg` | База данных доверия |
| `~/.gnupg/private-keys-v1.d/` | Приватные ключи |

---

## OpenSSL

OpenSSL предоставляет реализацию SSL/TLS и универсальный криптографический инструментарий.

### Создание ключей и сертификатов

```bash
# Создать приватный RSA-ключ
openssl genrsa -out private.key 2048

# Создать приватный ключ с защитой паролем
openssl genrsa -aes256 -out private.key 2048

# Создать самоподписанный сертификат (ключ + сертификат за один шаг)
openssl req -x509 -nodes -newkey rsa:2048 \
  -keyout private.key -out certificate.crt -days 365

# Создать CSR (запрос на подпись сертификата) из существующего ключа
openssl req -new -key private.key -out request.csr

# Подписать CSR с помощью CA
openssl x509 -req -in request.csr -CA ca.crt -CAkey ca.key \
  -CAcreateserial -out signed.crt -days 365

# Просмотреть детали сертификата
openssl x509 -in certificate.crt -text -noout

# Проверить сертификат относительно CA
openssl verify -CAfile ca.crt certificate.crt

# Проверить срок действия сертификата
openssl x509 -in certificate.crt -noout -dates

# Конвертировать форматы
openssl pkcs12 -export -in cert.crt -inkey key.pem -out bundle.p12   # PEM → PKCS12
openssl pkcs12 -in bundle.p12 -out cert.pem -nodes                   # PKCS12 → PEM
```

### Тестирование SSL/TLS-соединений

```bash
openssl s_client -connect host:443              # тест HTTPS
openssl s_client -connect host:993              # тест IMAPS
openssl s_client -starttls smtp -connect host:587  # тест STARTTLS
```

---

## Обнаружение вторжений

### fail2ban

fail2ban отслеживает файлы журналов и блокирует IP-адреса, проявляющие вредоносную активность (слишком много неудачных попыток входа).

```bash
apt install fail2ban
systemctl start fail2ban
systemctl enable fail2ban
```

Конфигурация:
- `/etc/fail2ban/jail.conf` — конфиг по умолчанию (НЕ редактировать)
- `/etc/fail2ban/jail.local` — локальные переопределения (создать этот файл)
- `/etc/fail2ban/jail.d/` — файлы конфигурации-фрагменты

```ini
# /etc/fail2ban/jail.local
[DEFAULT]
bantime  = 3600       # длительность блокировки в секундах (или 3600s, 1h, 1d)
findtime = 600        # временное окно для подсчёта неудач
maxretry = 5          # количество неудач до блокировки

[sshd]
enabled  = true
port     = ssh
logpath  = /var/log/auth.log
maxretry = 3
```

```bash
# Управление
fail2ban-client status                 # показать все активные тюрьмы
fail2ban-client status sshd            # показать статус тюрьмы sshd (заблокированные IP)
fail2ban-client set sshd unbanip 1.2.3.4   # разблокировать IP
fail2ban-client reload                 # перезагрузить конфигурацию
```

fail2ban использует **фильтры** (шаблоны регулярных выражений в `/etc/fail2ban/filter.d/`) и **действия** (что делать при срабатывании, в `/etc/fail2ban/action.d/`). Действие SSH по умолчанию блокирует через iptables.

### portsentry

portsentry обнаруживает сканирование портов и блокирует сканера. Он прослушивает неиспользуемые порты; любая попытка подключения сигнализирует о сканировании.

Конфиг: `/etc/portsentry/portsentry.conf`

```bash
# Режимы
portsentry -tcp      # обнаружение сканирования TCP-портов
portsentry -udp      # обнаружение сканирования UDP-портов
portsentry -atcp     # расширенный TCP (привязка ко всем зарезервированным портам)
portsentry -audp     # расширенный UDP
```

Заблокированные хосты добавляются в `/etc/hosts.deny` или правило iptables.

> **Для LPIC-2:** Понимайте назначение portsentry (обнаружение сканирования портов) и его основной конфигурационный файл.

---

## Инструменты аудита безопасности

### nmap — сетевой сканер

```bash
# Базовое сканирование (топ 1000 портов)
nmap 192.168.1.100

# Сканировать все порты
nmap -p- 192.168.1.100

# Сканировать конкретные порты
nmap -p 22,80,443 192.168.1.100

# Определение сервисов/версий
nmap -sV 192.168.1.100

# Определение ОС
nmap -O 192.168.1.100

# Агрессивное сканирование (ОС, версии, скрипты, трассировка)
nmap -A 192.168.1.100

# Типы сканирования
nmap -sS host    # SYN-сканирование (скрытое, по умолчанию от root)
nmap -sT host    # TCP-сканирование с установкой соединения (полное рукопожатие)
nmap -sU host    # UDP-сканирование
nmap -sP 192.168.1.0/24   # Ping-сканирование (только обнаружение хостов)
nmap -sn 192.168.1.0/24   # Без сканирования портов (то же что -sP в новых версиях)

# Сканировать сеть
nmap 192.168.1.0/24

# Вывод в файл
nmap -oN scan.txt host     # обычный вывод
nmap -oX scan.xml host     # XML-вывод
nmap -oG scan.gnmap host   # вывод для grep
```

### netstat / ss

```bash
# Показать прослушиваемые порты
netstat -tlnp       # TCP прослушиваемые, числовой, с PID
netstat -ulnp       # UDP прослушиваемые
netstat -anp        # все соединения с PID
ss -tlnp            # современный эквивалент netstat -tlnp
ss -anp             # все сокеты

# Показать установленные соединения
netstat -tn
ss -tn
```

### lsof — список открытых файлов

```bash
lsof                              # все открытые файлы
lsof -u alice                     # файлы, открытые пользователем alice
lsof -p 1234                      # файлы, открытые процессом PID 1234
lsof -i                           # все сетевые соединения
lsof -i :80                       # что использует порт 80
lsof -i tcp                       # только TCP-соединения
lsof /var/log/auth.log            # кто держит этот файл открытым
lsof +D /tmp                      # все файлы в /tmp
```

### fuser — поиск процессов, использующих файлы/сокеты

```bash
fuser /var/log/messages           # PID процессов, использующих этот файл
fuser -m /mnt/usb                 # все процессы, использующие эту файловую систему
fuser -k /var/log/messages        # завершить процессы, использующие этот файл
fuser 80/tcp                      # PID, использующий TCP-порт 80
fuser -n tcp 443                  # то же, явное пространство имён

# Сигнал
fuser -k -TERM 80/tcp             # отправить SIGTERM процессу, использующему порт 80
```

### arp

```bash
arp -n                    # показать ARP-таблицу (числовой формат)
arp -a                    # показать в формате BSD
arp -d 192.168.1.1        # удалить запись ARP
arp -s 192.168.1.1 aa:bb:cc:dd:ee:ff   # добавить статическую запись ARP
```

---

## Безопасность паролей

### /etc/shadow — хеширование паролей

Файл shadow хранит хешированные пароли в формате:

```
user:$id$salt$hash:lastchange:min:max:warn:inactive:expire:
```

`$id$` идентифицирует алгоритм хеширования:

| id | Алгоритм |
|---|---|
| `$1$` | MD5 (устаревший, слабый) |
| `$5$` | SHA-256 |
| `$6$` | SHA-512 (текущий стандарт) |
| `$y$` | yescrypt (современный, похожий на bcrypt) |
| `$2b$` | bcrypt |

```bash
# Проверить используемый алгоритм
grep username /etc/shadow | cut -d'$' -f2
```

### john — взломщик паролей

John the Ripper проверяет хеши паролей по словарям и методом перебора. Используется для аудита надёжности паролей.

```bash
# Взломать /etc/shadow (требует root)
john /etc/shadow

# Использовать словарь
john --wordlist=/usr/share/wordlists/rockyou.txt /etc/shadow

# Показать взломанные пароли
john --show /etc/shadow

# Взломать конкретные форматы хешей
john --format=sha512crypt hashes.txt
```

> **Для LPIC-2:** Знайте, что john проверяет надёжность паролей путём взлома. Это легитимный инструмент аудита.

### chage — управление устареванием паролей

```bash
chage -l username              # список информации об устаревании пароля
chage -M 90 username           # максимум дней до обязательной смены пароля
chage -m 7 username            # минимум дней между сменами
chage -W 14 username           # предупреждать за N дней до истечения срока
chage -E 2026-12-31 username   # установить дату истечения срока аккаунта
chage -d 0 username            # принудить к смене пароля при следующем входе
```

---

## Целостность файлов

### Контрольные суммы

```bash
md5sum file.txt                    # создать контрольную сумму MD5
md5sum -c checksums.md5            # проверить контрольные суммы

sha256sum file.txt
sha256sum -c checksums.sha256

sha512sum file.txt
```

### Поиск файлов SUID/SGID

```bash
# Найти все файлы с SUID
find / -perm -4000 -type f 2>/dev/null

# Найти все файлы с SGID
find / -perm -2000 -type f 2>/dev/null

# Найти и те и другие
find / -perm /6000 -type f 2>/dev/null

# Найти файлы с правом записи для всех
find / -perm -0002 -type f 2>/dev/null

# Найти файлы без владельца
find / -nouser -o -nogroup 2>/dev/null
```

---

## Шпаргалка для экзамена

### Краткий справочник GPG

```bash
gpg --gen-key                          # создать пару ключей
gpg --list-keys                        # список публичных ключей
gpg --export -a "user" > key.asc       # экспортировать публичный ключ
gpg --import key.asc                   # импортировать ключ
gpg -e -r recipient file.txt           # зашифровать
gpg -d file.txt.gpg                    # расшифровать
gpg --detach-sign file.txt             # подписать (отдельная подпись)
gpg --verify file.txt.sig file.txt     # проверить подпись
gpg --gen-revoke user > revoke.asc     # создать сертификат отзыва
```

### Файлы и пути

| Путь | Описание |
|---|---|
| `~/.gnupg/` | Домашний каталог GPG (0700) |
| `/etc/fail2ban/jail.conf` | Настройки fail2ban по умолчанию (не редактировать) |
| `/etc/fail2ban/jail.local` | Локальные переопределения fail2ban |
| `/etc/fail2ban/filter.d/` | Шаблоны обнаружения fail2ban |
| `/etc/fail2ban/action.d/` | Действия fail2ban |
| `/etc/portsentry/portsentry.conf` | Конфиг portsentry |

### Типичные ошибки на экзамене

| Ошибка | Правило |
|---|---|
| `jail.conf` vs `jail.local` | Никогда не редактируйте `jail.conf`; создайте `jail.local` для переопределений |
| Сертификат отзыва GPG | Должен быть создан сразу после генерации ключа |
| `$6$` в shadow | SHA-512 — текущий стандарт; `$1$` = MD5 (слабый) |
| lsof vs fuser | `lsof` показывает файлы на процесс; `fuser` показывает процессы на файл |
| nmap `-sS` | Требует root (сырой сокет); `-sT` работает от обычного пользователя |
| Поиск SUID | `-perm -4000` (обратите внимание на `-` перед 4000 = "хотя бы эти биты установлены") |
