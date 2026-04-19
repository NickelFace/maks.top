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

## Attack surface: локальная разведка

**Attack surface** — совокупность точек, через которые возможна атака: открытые порты, слушающие сервисы, доступные сокеты. Снижение attack surface — первая задача администратора безопасности: всё лишнее выключить или закрыть firewall'ом.

Три взгляда на attack surface:

- **Локально** (`ss`, `netstat`) — что машина **думает**, что слушает
- **Удалённо** (`nmap`) — что **реально видно** снаружи
- **Разница** — это работа firewall'а

### netstat

`netstat` из пакета `net-tools` официально deprecated на Linux. На современных Ubuntu/RHEL пакета часто нет из коробки. Заменён на `ss` из `iproute2`. На экзамене LPIC-2 команда всё ещё встречается.

```bash
# TCP слушающие порты + PID + имя процесса
sudo netstat -tlnp

# UDP слушающие
sudo netstat -ulnp

# Все активные соединения
sudo netstat -anp

# Таблица маршрутизации
netstat -rn
```

Флаги: `-t` / `-u` — TCP / UDP; `-l` — только LISTEN; `-n` — числовой вывод (без DNS-резолва); `-p` — показать процесс (требует root); `-a` — все состояния.

### ss — современная замена netstat

`ss` (socket statistics) получает данные напрямую из ядра через netlink, работает быстрее на системах с тысячами сокетов.

```bash
# Все TCP в LISTEN
sudo ss -tlnp

# UDP в LISTEN
sudo ss -ulnp

# Все TCP+UDP в LISTEN с PID
sudo ss -tulnp

# Все соединения в состоянии ESTABLISHED
ss -t state established

# Фильтр по порту
ss -tnp sport = :22
ss -tnp dport = :443

# Сводная статистика
ss -s
```

| Флаг ss | Назначение |
|---|---|
| `-t` | TCP |
| `-u` | UDP |
| `-l` | только LISTEN |
| `-n` | числовой вывод |
| `-p` | показать процесс |
| `-a` | все состояния |
| `-4` / `-6` | только IPv4 / IPv6 |

Самая полезная однострочка: `sudo ss -tulnp` — показывает всё, что слушает машина по TCP и UDP с PID процессов.

### Практический чек-лист снижения attack surface

1. `sudo ss -tulnp` — зафиксировать baseline слушающих портов
2. `sudo systemctl list-units --type=service --state=running` — какие сервисы крутятся
3. `nmap` с соседней машины — сверить, что видно снаружи
4. Всё лишнее выключить: `sudo systemctl disable --now <service>`
5. Нужное, но не для всех — ограничить firewall'ом

---

## GPG — GNU Privacy Guard

GPG реализует стандарт OpenPGP (RFC 4880). Используется для шифрования файлов и электронной почты, подписи данных и проверки целостности.

### Основные понятия

| Термин | Значение |
|---|---|
| Публичный ключ | Передаётся всем; используется для шифрования данных или проверки подписей |
| Приватный ключ (секретный) | Хранится в тайне; используется для расшифровки данных или подписи |
| Связка ключей | Коллекция хранимых ключей |
| Отпечаток | Короткий хеш, идентифицирующий ключ |
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

# Редактировать ключ
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

# Встроенная подпись
gpg --sign file.txt                 # создаёт file.txt.gpg

# Подпись в открытом тексте
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

**Факт для экзамена:** Создайте сертификат отзыва сразу после генерации пары ключей — если вы потеряете доступ к приватному ключу, вы не сможете отозвать его позже.

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

# Создать самоподписанный сертификат
openssl req -x509 -nodes -newkey rsa:2048 \
  -keyout private.key -out certificate.crt -days 365

# Создать CSR (запрос на подпись сертификата) из существующего ключа
openssl req -new -key private.key -out request.csr

# Подписать CSR с помощью CA
openssl x509 -req -in request.csr -CA ca.crt -CAkey ca.key \
  -CAcreateserial -out signed.crt -days 365

# Просмотреть детали сертификата
openssl x509 -in certificate.crt -text -noout

# Проверить срок действия сертификата
openssl x509 -in certificate.crt -noout -dates
```

### Тестирование SSL/TLS-соединений

```bash
openssl s_client -connect host:443              # тест HTTPS
openssl s_client -connect host:993              # тест IMAPS
openssl s_client -starttls smtp -connect host:587  # тест STARTTLS
```

---

## Инструменты сканирования портов

### telnet

`telnet` — самый простой способ проверить один порт по TCP.

```bash
# Проверка одного порта
telnet 192.168.1.10 80
telnet 192.168.1.10 22
telnet 192.168.1.10 25
```

Проверка открытого mail relay через telnet:

```bash
$ telnet localhost 25
220 linux.mailserver ESMTP Exim 4.80
MAIL FROM: bob@example.com
250 OK
RCPT TO: root@localhost
250 Accepted
DATA
354 Enter message, ending with "." on a line by itself
Open Mail Relay test message
.
250 OK
QUIT
221 linux.mailserver closing connection
```

Если сервер принял и доставил письмо для чужого домена — он открытый relay, попадёт в спам-блэклисты.

### nc (netcat)

`nc` (netcat) — "швейцарский нож TCP/IP". Флаг `-z` запускает режим сканирования портов без отправки данных.

```bash
# Сканирование диапазона портов
nc -vz localhost 75-85

# Проверка одного порта
nc -z 192.168.1.10 22

# Сканирование UDP-портов
nc -vzu 192.168.1.10 53
```

Две версии netcat в Linux:

- OpenBSD-версия: поддерживает флаг `-z`
- nmap-версия: флаг `-z` не поддерживается

На Red Hat-системах по умолчанию стоит nmap-версия. Для сканирования портов установи OpenBSD-версию вручную.

```bash
# Передача файла через netcat
# На приёмнике:
nc -l 1234 > received_file.txt

# На отправителе:
nc 192.168.1.10 1234 < file_to_send.txt
```

### nmap

`nmap` — специализированный сканер сети и портов. По умолчанию сканирует 1000 наиболее распространённых портов.

```bash
# Базовое сканирование (топ 1000 портов)
nmap 192.168.1.100

# Сканировать все порты
nmap -p- 192.168.1.100
nmap -p 1-65535 192.168.1.100

# Сканировать конкретные порты
nmap -p 22,80,443 192.168.1.100

# TCP-сканирование (не требует root)
nmap -sT localhost

# SYN-сканирование (stealth, только root)
sudo nmap -sS 192.168.1.10

# UDP-сканирование (требует root)
sudo nmap -sU localhost
sudo nmap -sU -p 630-640 192.168.1.10

# Определение ОС и версий сервисов (fingerprinting)
sudo nmap -A 192.168.1.10

# Определение сервисов/версий
nmap -sV 192.168.1.100

# Ping-сканирование (только обнаружение хостов)
nmap -sn 192.168.1.0/24

# Принудительно сканировать, даже если пинг не отвечает
sudo nmap -Pn -sT 192.168.1.10

# Вывод в файл
nmap -oN scan.txt host     # обычный вывод
nmap -oX scan.xml host     # XML-вывод
```

| Опция | Описание |
|---|---|
| `-sT` | TCP connect scan (без root) |
| `-sS` | SYN scan / stealth (root) |
| `-sU` | UDP scan (root) |
| `-sN` | NULL scan |
| `-sX` | Xmas Tree scan |
| `-sF` | FIN scan |
| `-p` | Диапазон портов |
| `-A` | Определение ОС и версий (fingerprint) |
| `-Pn` | Не пинговать хост перед сканом (полезно против систем, блокирующих ICMP) |

**Привилегии nmap:** запущенный без root использует `-sT` (полное TCP-соединение). Запущенный с root использует `-sS` (SYN/half-open scan). UDP-сканирование требует root всегда.

По умолчанию nmap сначала пингует цель. Если пинг не прошёл — дальше хост не сканируется. Windows 10/11, многие корпоративные хосты блокируют ICMP по умолчанию. Флаг `-Pn` позволяет принудительно сканировать.

### Состояния портов в выводе nmap

| State | Смысл |
|---|---|
| `open` | Порт открыт, софт слушает и отвечает |
| `closed` | Хост доступен, но на этом порту ничего не слушает (connection refused) |
| `filtered` | Firewall блокирует трафик — nmap не может определить, открыт порт или нет |
| `unfiltered` | Порт доступен, но nmap не может определить open/closed (редко) |
| `open\|filtered` | nmap не смог различить между open и filtered (типично для UDP) |

---

## Системы обнаружения вторжений (IDS)

IDS (Intrusion Detection System) — программа, которая обнаруживает подозрительную активность и отправляет предупреждения. IDS не блокирует атаки сама по себе — это делает IPS (Intrusion Prevention System).

Два типа IDS:

- HIDS (Host IDS) — анализирует логи и активность на хосте
- NIDS (Network IDS) — анализирует сетевой трафик

---

### fail2ban

`fail2ban` — HIDS, который читает лог-файлы и блокирует IP-адреса, совершающие слишком много неудачных попыток входа.

Мониторит системные логи: `/var/log/pwdfail`, `/var/log/auth.log`, а также логи приложений.

При обнаружении проблемы — добавляет правило в `iptables`, блокируя IP-адрес нарушителя на заданное время.

```bash
apt install fail2ban
systemctl start fail2ban
systemctl enable fail2ban
```

### Структура конфигурации fail2ban

| Файл / папка | Назначение |
|---|---|
| `fail2ban.conf` | Конфигурация самого демона |
| `jail.conf` | Определения тюрем. **Не редактировать** — перезаписывается при обновлении пакета |
| `jail.local` | **Локальные** настройки пользователя. Переопределяет значения из `jail.conf` |
| `jail.d/` | Дополнительные файлы с настройками jail |
| `filter.d/` | Фильтры — regex'ы для распознавания неудачных входов |
| `action.d/` | Действия при срабатывании (ban через iptables, ufw, email) |

**Принцип:** всё, что задано в `jail.local`, переопределяет значения из `jail.conf`. `jail.conf` поставляется с пакетом и перезаписывается при обновлении — все правки туда сотрутся.

### Параметры по умолчанию

| Параметр | Значение по умолчанию | Что делает |
|---|---|---|
| `maxretry` | `5` | Попыток до бана |
| `findtime` | `10m` | В каком окне считаются попытки |
| `bantime` | `10m` | Длительность бана |

### Минимальный jail.local для SSH

```ini
# /etc/fail2ban/jail.conf (пример секции)
[sshd]
enabled  = true
port     = ssh
filter   = sshd
logpath  = /var/log/auth.log
maxretry = 5
bantime  = 600
findtime = 600
```

```ini
# /etc/fail2ban/jail.local (правь здесь)
[DEFAULT]
bantime = 1h
banaction = ufw
ignoreip = 127.0.0.1/8 ::1 10.222.0.50 192.168.1.0/24

[sshd]
enabled = true
```

Разбор параметров:

| Параметр | Значение | Зачем |
|---|---|---|
| `bantime = 1h` | Блокировка на час | Для автоматических сканеров этого достаточно |
| `banaction = ufw` | Блокировать через UFW | Иначе fail2ban пишет в iptables **мимо UFW** |
| `ignoreip` | Whitelist IP/сетей | Спасает от самоблокировки |
| `[sshd]` | Имя jail | Должно совпадать с именем фильтра в `filter.d/` |

**Критично на Ubuntu: banaction = ufw.** Без этой строки fail2ban добавляет правила напрямую в iptables. В `sudo ufw status` их **не видно** — классическая головная боль при отладке.

### Форматы параметра action

| Формат | Что делает |
|---|---|
| `%(action_)s` | Только правило firewall (по умолчанию) |
| `%(action_mw)s` | Firewall + email-уведомление |
| `%(action_mwl)s` | Firewall + email с приложением строк лога, которые вызвали бан |

### Команды управления fail2ban

```bash
# Просмотр статуса
fail2ban-client status
fail2ban-client status sshd

# Разблокировать IP вручную
fail2ban-client set sshd unbanip 192.168.1.100

# Перезагрузить конфигурацию
fail2ban-client reload

# Перезапуск сервиса
systemctl restart fail2ban
```

### Проверка после настройки

```bash
sudo systemctl restart fail2ban
sudo fail2ban-client status          # список активных тюрем
sudo fail2ban-client status sshd     # детали тюрьмы — счётчики и забаненные IP
sudo ufw status                      # при banaction=ufw здесь появятся REJECT для забаненных
sudo tail -f /var/log/fail2ban.log
sudo tail -f /var/log/auth.log
```

Whitelist — защита от самоблокировки: `127.0.0.1/8` защищает только от локального бана. Если работаешь удалённо — всегда добавляй в `ignoreip` свой admin IP или домашнюю подсеть.

---

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

---

### Snort IDS

`Snort` — NIDS, который анализирует сетевой трафик в реальном времени. Работает в трёх режимах:

| Режим | Описание |
|---|---|
| Sniffer | Выводит пакеты на экран (как tcpdump) |
| Packet logger | Пишет пакеты в лог-файлы |
| NIDS | Анализирует трафик по правилам, отправляет алерты |

Конфигурационный файл: `/etc/snort/snort.conf`  
Лог-файлы: `/var/log/snort/`

```bash
# Ключевые переменные в snort.conf
var HOME_NET 192.168.1.0/24      # Локальная сеть для мониторинга
var EXTERNAL_NET any             # Внешние адреса
```

### Структура правил Snort

```
action protocol src_addr src_port direction dst_addr dst_port (options)
```

```bash
# Алерт на любой ICMP-трафик с TTL=100
alert icmp any any -> any any (msg: "Ping with TTL=100"; ttl: 100;)

# Алерт на UDP из портов 1024-2048
alert udp any 1024:2048 -> any any (msg: "UDP ports";)

# Двунаправленный мониторинг TCP, поиск слова "confidential"
alert tcp 192.168.2.0/24 23 <> any any (content: "confidential"; msg: "Detected confidential";)

# Алерт на ICMP в подсеть 192.168.1.0/24
alert icmp any any -> 192.168.1.0/24 any (msg: "ICMP traffic detected")
```

| Символ направления | Значение |
|---|---|
| `->` | Однонаправленный (от src к dst) |
| `<>` | Двунаправленный |

Snort видит только тот трафик, который проходит через его интерфейс. Для мониторинга всей сети подключи сервер к порту с функцией SPAN (port mirroring) на коммутаторе.

```bash
# Запуск Snort в режиме sniffer
snort

# Запуск в NIDS-режиме с конфигом
snort -c /etc/snort/snort.conf -i eth0
```

---

### OpenVAS

`OpenVAS` (Open Vulnerability Assessment System) — инструмент для сканирования уязвимостей.

OpenVAS использует базу NVT (Network Vulnerability Tests) — более 50 000 тестов. База обновляется ежедневно. Управление происходит через веб-интерфейс (разработан Greenbone Networks).

OpenVAS активно сканирует хосты на уязвимости — это не пассивный мониторинг трафика. Snort и fail2ban обнаруживают атаки в реальном времени, OpenVAS ищет потенциальные уязвимости до того, как их используют.

---

## Источники информации о безопасности

### Bugtraq

BugTraq — модерируемый список рассылки на securityfocus.com для полного раскрытия информации об уязвимостях. Публикует детали о найденных уязвимостях: что это, как эксплуатировать, как исправить.

Подписка через форму на http://www.securityfocus.com/

### CERT

CERT/CC (CERT Coordination Center) — центр экспертизы по безопасности в интернете при Software Engineering Institute (SEI) в университете Карнеги-Меллон. Финансируется федеральным правительством США.

Публикует предупреждения об уязвимостях и координирует реакцию на инциденты. Сайт: http://www.cert.org

### CIAC

CIAC (Computer Incident Advisory Capability) — служба компьютерной безопасности Министерства энергетики США (DOE). Основана в 1989 году после червя Morris Worm.

Списки рассылки CIAC:

| Список | Содержание |
|---|---|
| CIAC-BULLETIN | Срочные advisory и bulletins |
| CIAC-NOTES | Сборник статей по безопасности |
| SPI-ANNOUNCE | Новости об обновлениях SPI |
| SPI-NOTES | Обсуждение проблем SPI |

Подписка: отправь письмо на ciac-listproc@llnl.gov с телом: `subscribe list-name Фамилия, Имя, Телефон`

---

## IDS vs IPS

| Характеристика | IDS | IPS |
|---|---|---|
| Функция | Обнаруживает и предупреждает | Обнаруживает и блокирует |
| Действие | Пассивное (алерт) | Активное (блокировка) |
| Примеры | Snort (NIDS), fail2ban (HIDS) | Snort в inline-режиме |

Терминология результатов обнаружения:

| Термин | Описание |
|---|---|
| True positive | Обнаружение реальной угрозы |
| False positive | Ложное срабатывание (угрозы нет) |
| True negative | Нет события — нет алерта |
| False negative | Реальная угроза не обнаружена |

**False negative — худший сценарий:** атака идёт, IDS молчит. Цель настройки — минимизировать false negative при разумном уровне false positive.

---

## Инструменты аудита безопасности

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
fuser -k -TERM 80/tcp             # отправить SIGTERM процессу, использующему порт 80
```

`lsof` показывает файлы на процесс; `fuser` показывает процессы на файл.

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
```

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

| Путь | Назначение |
|---|---|
| `~/.gnupg/` | Домашний каталог GPG (0700) |
| `/etc/fail2ban/jail.conf` | Дефолтная конфигурация fail2ban (не редактировать) |
| `/etc/fail2ban/jail.local` | Локальная конфигурация fail2ban (редактировать здесь) |
| `/etc/fail2ban/filter.d/` | Фильтры — regex для неудачных входов |
| `/etc/fail2ban/action.d/` | Действия при бане (ufw, iptables, email) |
| `/var/log/fail2ban.log` | Лог работы fail2ban |
| `/etc/snort/snort.conf` | Конфигурация Snort (переменные, правила) |
| `/var/log/snort/` | Лог-файлы Snort |
| `/var/log/auth.log` | Лог аутентификации (мониторится fail2ban) |
| `/var/log/pwdfail` | Лог неудачных паролей (мониторится fail2ban) |
| `/etc/portsentry/portsentry.conf` | Конфиг portsentry |
| `/etc/services` | Список стандартных портов и сервисов |

### Ключевые команды

```bash
# ss - локальная разведка
sudo ss -tulnp                 # все TCP+UDP в LISTEN с PID
ss -t state established        # установленные TCP-соединения
ss -s                          # сводная статистика

# netstat (legacy, тестируется на экзамене)
sudo netstat -tulnp            # эквивалент ss -tulnp
netstat -rn                    # таблица маршрутизации

# telnet - проверка одного порта
telnet <host> <port>

# nc - сканирование диапазона портов
nc -vz <host> <port_start>-<port_end>

# nmap
nmap -sT <host>                        # TCP scan
nmap -sT -p 1-65535 <host>             # все порты
sudo nmap -sU <host>                   # UDP scan
sudo nmap -A <host>                    # fingerprint ОС и сервисов

# fail2ban
fail2ban-client status
fail2ban-client status <jail_name>
fail2ban-client set <jail_name> unbanip <ip>

# Snort
snort -c /etc/snort/snort.conf -i <interface>
```

### Ключевые факты для экзамена

- `nc -z` — режим сканирования портов (OpenBSD-версия)
- `nmap -sT` — TCP scan, работает без root
- `nmap -sU` — UDP scan, требует root
- `nmap -sS` — SYN/stealth scan, требует root
- `nmap -A` — fingerprint (ОС + версии сервисов)
- `nmap -Pn` — пропустить ping перед сканом
- `fail2ban` — HIDS, читает логи, блокирует через iptables/ufw
- `fail2ban` конфиг: `/etc/fail2ban/jail.conf` (не редактировать) и `jail.local` (сюда)
- `Snort` — NIDS, анализирует сетевой трафик
- `Snort` конфиг: `/etc/snort/snort.conf`
- `HOME_NET` в Snort — локальные адреса для мониторинга
- `OpenVAS` — сканер уязвимостей (не IDS), использует NVT
- `Bugtraq` — рассылка securityfocus.com
- `CERT/CC` — Carnegie Mellon University, SEI, сайт cert.org
- `CIAC` — Министерство энергетики США (DOE), основана 1989, рассылка ciac-listproc@llnl.gov

### Типичные ошибки на экзамене

- `jail.conf` vs `jail.local` — никогда не редактируйте `jail.conf`; создайте `jail.local` для переопределений
- Сертификат отзыва GPG — должен быть создан сразу после генерации ключа
- `$6$` в shadow — SHA-512 — текущий стандарт; `$1$` = MD5 (слабый)
- `lsof` показывает файлы на процесс; `fuser` показывает процессы на файл
- `nmap -sS` — требует root (сырой сокет); `-sT` работает от обычного пользователя
- Поиск SUID: `-perm -4000` (обратите внимание на `-` перед 4000 = "хотя бы эти биты установлены")
- fail2ban без `banaction = ufw` на Ubuntu — правила видны в iptables, но не в `ufw status`

---

## Практические вопросы

**1. Какой флаг nc позволяет сканировать диапазон портов?**

Флаг `-z` активирует режим сканирования без отправки данных. Доступен только в OpenBSD-версии netcat.

**2. Какой файл содержит конфигурацию правил fail2ban, которую нужно редактировать?**

`/etc/fail2ban/jail.local` — локальные переопределения. Файл `jail.conf` не редактировать — перезаписывается при обновлении пакета.

**3. Какой режим Snort выводит пакеты на экран без записи в файл?**

Sniffer-режим выводит краткое описание каждого пакета в терминал.

**4. Какой тип IDS анализирует сетевой трафик (а не логи хоста)?**

NIDS (Network Intrusion Detection System) — Snort. HIDS (Host IDS) — fail2ban.

**5. Какая опция nmap определяет ОС и версии сервисов удалённого хоста?**

Опция `-A` запускает агрессивное сканирование с fingerprinting. Требует root.

**6. Что такое false negative в контексте IDS?**

Система не обнаружила реальную атаку. Самый опасный сценарий: атака идёт, IDS молчит.

**7. Какую функцию выполняет OpenVAS?**

OpenVAS активно тестирует хосты через базу NVT (Network Vulnerability Tests) — это сканер уязвимостей, не пассивный IDS.

**8. Где хранится конфигурационный файл Snort?**

`/etc/snort/snort.conf`
