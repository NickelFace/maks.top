---
title: "LPIC-2 212.3 — Secure Shell (OpenSSH)"
date: 2026-06-14
description: "Настройка клиента и сервера OpenSSH, аутентификация по ключам, ssh-keygen/ssh-agent/ssh-copy-id, проброс портов, перенаправление X11, SCP/SFTP, усиление безопасности sshd_config. Тема экзамена LPIC-2 212.3."
tags: ["Linux", "LPIC-2", "OpenSSH", "SSH", "SCP", "SFTP", "port forwarding", "X11"]
categories: ["LPIC-2"]
page_lang: "ru"
lang_pair: "/posts/lpic2/lpic2-212-3-openssh/"
pagefind_ignore: true
build:
  list: never
  render: always
---

> **Тема экзамена 212.3** — Secure shell (OpenSSH) (вес: 4). Охватывает настройку клиента и сервера SSH, управление ключами, проброс портов и перенаправление X11.

---

## Компоненты OpenSSH

OpenSSH — стандартный пакет для безопасного подключения к удалённым Linux-серверам. Заменяет небезопасные `rlogin` и `rsh`. SSH шифрует весь трафик и использует цифровые ключи для аутентификации.

| Двоичный файл | Роль |
|---|---|
| `ssh` | Клиент — подключение к удалённым хостам |
| `sshd` | Серверный демон — принимает входящие соединения |
| `ssh-keygen` | Генерация и управление парами ключей |
| `ssh-agent` | Агент аутентификации (кэширует приватные ключи) |
| `ssh-add` | Добавление ключей в ssh-agent |
| `ssh-copy-id` | Копирование публичного ключа в authorized_keys на удалённом сервере |
| `scp` | Безопасное копирование (передача файлов через SSH) |
| `sftp` | Подсистема безопасного FTP через SSH |
| `ssh-keyscan` | Сбор публичных ключей с серверов |

Порт по умолчанию: **22**

**Важно:** `sshd_config` — конфиг сервера, `ssh_config` — конфиг клиента. На экзамене спрашивают именно `/etc/ssh/sshd_config`.

---

## Файлы и структура OpenSSH

| Файл / путь | Назначение |
|---|---|
| `/etc/ssh/sshd_config` | Конфигурация сервера sshd |
| `/etc/ssh/sshd_config.d/*.conf` | Drop-in конфиги сервера |
| `/etc/ssh/ssh_config` | Конфигурация клиента ssh (глобальная) |
| `/etc/ssh/` | Директория с host keys и конфигами |
| `~/.ssh/id_rsa` | Приватный ключ пользователя (RSA) |
| `~/.ssh/id_rsa.pub` | Публичный ключ пользователя (RSA) |
| `~/.ssh/authorized_keys` | Публичные ключи, которым разрешён вход (0600) |
| `~/.ssh/known_hosts` | Известные хосты (fingerprints серверов) |
| `~/.ssh/config` | Персональный конфиг клиента |
| `/etc/ssh/ssh_host_*_key` | Приватные ключи хоста сервера (0600) |
| `/etc/hosts.allow` | TCP Wrappers — разрешённые хосты |
| `/etc/hosts.deny` | TCP Wrappers — запрещённые хосты |

Права на файлы: `~/.ssh/` должна иметь права `700`, файлы внутри — `600`. Если права шире, SSH откажется использовать ключи для аутентификации.

---

## Протоколы SSH: версии 1 и 2

SSH v1 поддерживает только RSA-ключи. Считается устаревшим и небезопасным.

SSH v2 — текущий стандарт. Поддерживает DSA, ECDSA и RSA. Обеспечивает forward security через Diffie-Hellman key agreement. Шифрование сессии: 128-bit AES, 256-bit AES, Blowfish, 3DES. Целостность сессии проверяется через HMAC (hmac-sha2-256, hmac-sha2-512).

```bash
# В /etc/ssh/sshd_config — разрешить только протокол версии 2
Protocol 2
```

На экзамене `Protocol 2` — правильный ответ почти всегда.

---

## Host keys — ключи хоста

Host keys генерируются автоматически при установке OpenSSH. Они однозначно идентифицируют сервер. Хранятся в `/etc/ssh/`:

```
/etc/ssh/ssh_host_rsa_key        # приватный RSA host key
/etc/ssh/ssh_host_rsa_key.pub    # публичный RSA host key
/etc/ssh/ssh_host_ecdsa_key      # приватный ECDSA host key
/etc/ssh/ssh_host_ed25519_key    # приватный Ed25519 host key
```

При первом подключении клиент получает fingerprint сервера и предлагает добавить его в `~/.ssh/known_hosts`. Это защищает от атаки man-in-the-middle.

### Когда host keys нужно регенерировать

Две типичные ситуации:

1. **Клонированные образы**: если сервер развёрнут из VM-снапшота или шаблона, у всех клонов одинаковые host keys → MITM между ними тривиален.
2. **Вендорские ключи**: были случаи, когда производители embedded-устройств рассылали одинаковый приватный ключ всем клиентам. Ключи «из коробки» — потенциальный риск.

### Процедура регенерации

```bash
# 1. Удалить старые ключи
sudo rm /etc/ssh/ssh_host_*

# SSH не перезапускать до генерации новых — иначе sshd не поднимется
# Порядок строго: удалить → сгенерировать → перезапустить

# 2a. RSA 4096 бит (компромисс стойкости и совместимости)
sudo ssh-keygen -q -N "" -t rsa -b 4096 -f /etc/ssh/ssh_host_rsa_key

# 2b. Ed25519 (современный, быстрый)
sudo ssh-keygen -q -N "" -t ed25519 -f /etc/ssh/ssh_host_ed25519_key

# 3. Перезапустить
sudo sshd -t && sudo systemctl restart ssh
```

Флаги:

- `-q` — тихий режим
- `-N ""` — **без** passphrase (для host keys passphrase нельзя, sshd читает ключи автоматически при старте)
- `-f` — путь к файлу

Генерировать host keys с passphrase нельзя — sshd не может их прочитать автоматически. Всегда используй `-N ""`.

Можно также пересоздать все отсутствующие ключи:

```bash
ssh-keygen -A    # пересоздать все отсутствующие ключи хоста
dpkg-reconfigure openssh-server    # Debian
```

### HostKeyAlgorithms — ограничение алгоритмов

В drop-in `hardened.conf`:

```conf
HostKey /etc/ssh/ssh_host_rsa_key
HostKey /etc/ssh/ssh_host_ed25519_key

# Принимаем только Ed25519 и RSA с SHA-2
HostKeyAlgorithms ssh-ed25519,rsa-sha2-512,rsa-sha2-256
```

Алгоритмы `ssh-rsa` (использует SHA-1) и `ssh-dss` (DSA) считаются слабыми. OpenSSH 8.8+ отключает `ssh-rsa` по умолчанию.

---

## User keys — ключи пользователя

### Создание пары ключей

```bash
ssh-keygen                        # RSA по умолчанию
ssh-keygen -t ed25519             # Ed25519 (рекомендуется)
ssh-keygen -t rsa -b 4096         # RSA 4096 бит
ssh-keygen -t ed25519 -C "alice@example.com"
```

Созданные файлы:
- `~/.ssh/id_ed25519` — приватный ключ (права доступа 0600)
- `~/.ssh/id_ed25519.pub` — публичный ключ

Типы ключей: RSA — традиционный выбор. Ed25519 — современный, короче и быстрее. DSA устарел и отключён в OpenSSH 7.0+.

### Копирование публичного ключа на сервер

```bash
# Способ 1 — автоматически
ssh-copy-id user@server
ssh-copy-id -i ~/.ssh/id_ed25519.pub user@server

# Способ 2 — вручную
cat ~/.ssh/id_rsa.pub >> ~/.ssh/authorized_keys  # на сервере
# или
cat ~/.ssh/id_ed25519.pub | ssh user@server "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"
```

### authorized_keys

`~/.ssh/authorized_keys` — один публичный ключ на строку. Права: файл `0600`, директория `~/.ssh/` `0700`.

Опции ключа (перед типом ключа):

- `command="cmd"` — принудительно выполнять указанную команду при использовании этого ключа
- `no-port-forwarding` — отключить проброс портов для этого ключа
- `no-x11-forwarding` — отключить перенаправление X11
- `no-agent-forwarding` — отключить пересылку агента
- `from="192.168.1.*"` — разрешить этот ключ только с совпадающих IP

Пример:
```
command="backup.sh",no-port-forwarding,no-x11-forwarding ssh-ed25519 AAAAC3Nza... backup@server
```

### known_hosts

При первом подключении к серверу ssh сохраняет его ключ хоста:
- `~/.ssh/known_hosts` — для пользователя
- `/etc/ssh/ssh_known_hosts` — общесистемный

```bash
ssh-keyscan -H hostname >> ~/.ssh/known_hosts    # предварительно заполнить
ssh-keygen -R hostname                           # удалить ключ хоста (после пересборки сервера)
```

---

## Настройка sshd

Основной файл: `/etc/ssh/sshd_config`. Формат: `ОпцияИмя значение`. После изменений — перезапуск сервиса.

```bash
systemctl restart sshd
systemctl reload sshd      # перезагрузить конфиг без разрыва соединений
# или
service ssh restart
```

### Проверка конфига без перезапуска

```bash
sshd -t             # проверить синтаксис конфига
sshd -T             # вывести итоговый конфиг с дефолтами (включая merged drop-in)
```

### Drop-in конфигурация через sshd_config.d/

Правки в `/etc/ssh/sshd_config` при обновлении `openssh-server` могут быть затёрты. Правильный подход — создать drop-in файл:

```bash
sudo $EDITOR /etc/ssh/sshd_config.d/hardened.conf
```

В основном `sshd_config` уже присутствует директива:

```
Include /etc/ssh/sshd_config.d/*.conf
```

Типичный `hardened.conf`:

```conf
# /etc/ssh/sshd_config.d/hardened.conf

# Доступ
AllowUsers maks
AllowGroups admins sshusers
PermitRootLogin no

# Только ключи
PasswordAuthentication no
ChallengeResponseAuthentication no
UsePAM no
PubkeyAuthentication yes

# Явно указать используемые host keys
HostKey /etc/ssh/ssh_host_rsa_key
HostKey /etc/ssh/ssh_host_ed25519_key
```

`sshd -T` выводит **итоговую** конфигурацию с учётом всех drop-in-ов.

### Ключевые параметры sshd_config

```ini
Port 22                          # порт прослушивания
ListenAddress 0.0.0.0            # слушать на всех IPv4-интерфейсах
ListenAddress ::                 # слушать на всех IPv6-интерфейсах

PermitRootLogin no               # отключить вход root (рекомендуется)
PasswordAuthentication yes       # разрешить аутентификацию по паролю
PubkeyAuthentication yes         # разрешить аутентификацию по ключу
AuthorizedKeysFile .ssh/authorized_keys

PermitEmptyPasswords no          # запретить аккаунты с пустыми паролями
MaxAuthTries 3                   # максимум попыток входа перед отключением
MaxSessions 10                   # максимум сессий на одно соединение

UsePAM yes                       # использовать PAM для аутентификации

X11Forwarding yes                # разрешить перенаправление X11
AllowTcpForwarding yes           # разрешить проброс портов

AllowUsers alice bob             # только эти пользователи могут входить
AllowGroups ssh-users            # только члены этой группы
DenyUsers mallory                # запретить конкретным пользователям
DenyGroups badgroup

# Тайм-аут простоя
ClientAliveInterval 300          # отправлять keepalive каждые 300 секунд
ClientAliveCountMax 2            # отключить после 2 пропущенных keepalive

LoginGraceTime 120               # время на аутентификацию (секунды)
Banner /etc/issue.net            # показывать содержимое файла до входа
Subsystem sftp /usr/lib/openssh/sftp-server   # включить подсистему SFTP
```

---

## Ограничение входа для root и пользователей

### PermitRootLogin

| Значение | Поведение |
|---|---|
| `yes` | Root может войти по паролю или ключу |
| `no` | Root не может войти вообще |
| `without-password` / `prohibit-password` | Root может войти только по ключу, не по паролю |
| `forced-commands-only` | Root может войти по ключу и только выполнить команду из authorized_keys |

Для `forced-commands-only` в файле `~/.ssh/authorized_keys` добавляют команду перед ключом:

```
command="/bin/date" ssh-rsa AAAA... root@client
```

Лучшая практика: установи `PermitRootLogin no`. Тогда атакующий сначала должен получить доступ через обычного пользователя.

### AllowUsers и DenyUsers

```bash
# /etc/ssh/sshd_config
AllowUsers alice bob deploy@192.168.1.*   # разрешить только этих пользователей
DenyUsers guest tempuser                   # запретить этих пользователей
```

Поддерживается синтаксис `user@host`. Если указан `AllowUsers` — все остальные пользователи автоматически запрещены.

Порядок обработки: сначала проверяется `DenyUsers`, затем `AllowUsers`, затем `DenyGroups`, затем `AllowGroups`. Отказ на любом шаге — вход запрещён.

### Полное отключение парольного входа

Для полного запрета аутентификации по паролю нужно выставить `no` во всех трёх параметрах:

```bash
# /etc/ssh/sshd_config
PasswordAuthentication no
ChallengeResponseAuthentication no
UsePAM no
```

Одного `PasswordAuthentication no` недостаточно — PAM может обойти это ограничение. На экзамене правильный ответ включает все три параметра.

### Ограничение через TCP Wrappers

TCP Wrappers — технология ограничения доступа на уровне приложения. Работает через библиотеку `libwrap` для сервисов, которые с ней скомпилированы (`sshd`, `vsftpd`, xinetd-сервисы).

Проверить поддержку:

```bash
ldd $(which sshd) | grep libwrap
```

Два файла:

- **`/etc/hosts.allow`** — кому разрешено
- **`/etc/hosts.deny`** — кому запрещено

Пример — SSH только из локальной подсети:

```
# /etc/hosts.allow
sshd : LOCAL, 10.222.0.
sshd : 192.168.1.0/24
```

```
# /etc/hosts.deny
sshd : ALL
```

Синтаксис совпадения IP — **текстовый префикс**: `10.222.0.` матчит всю подсеть `10.222.0.0/24` без указания маски. Ключевые слова: `LOCAL`, `ALL`, `KNOWN`, `UNKNOWN`.

**Порядок проверки:**

1. `hosts.allow` — если совпадение, **доступ разрешён** (проверка останавливается)
2. Если нет совпадения — проверяется `hosts.deny`
3. Если нет совпадения и там — **доступ разрешён** (fail-open)

**Fail-open поведение:** без явного `hosts.deny: sshd : ALL` в качестве catch-all TCP Wrappers **не блокируют** никого. Забытый `hosts.deny` — частая причина «ничего не работает, но я же настроил wrappers».

---

## Беспарольная аутентификация

Схема работы:

1. На клиенте: `ssh-keygen` генерирует пару `id_rsa` + `id_rsa.pub`
2. Публичный ключ копируется на сервер в `~/.ssh/authorized_keys`
3. При подключении SSH сравнивает приватный ключ клиента с публичным ключом на сервере
4. Совпадение — вход без пароля

```bash
# Генерация ключей на клиенте
ssh-keygen -t rsa -b 2048

# Копирование публичного ключа на сервер
ssh-copy-id username@server_ip

# Ручной способ
cat ~/.ssh/id_rsa.pub | ssh user@server "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"

# Проверка входа
ssh user@server
```

```bash
PubkeyAuthentication yes    # включено по умолчанию, только для протокола v2
```

---

## ssh-agent

`ssh-agent` хранит расшифрованные приватные ключи в памяти. Пользователь вводит passphrase один раз за сессию.

```bash
# Запуск агента и установка переменных окружения
eval `ssh-agent`
# или
eval "$(ssh-agent)"

# Добавление ключа в агент
ssh-add                          # добавит ~/.ssh/id_rsa по умолчанию
ssh-add ~/.ssh/id_ed25519        # указать конкретный ключ
ssh-add -l                       # показать загруженные ключи
ssh-add -d ~/.ssh/id_ed25519     # удалить ключ
ssh-add -D                       # удалить все ключи

# Завершение агента
ssh-agent -k
```

### Forwarding агента

```bash
# В ~/.ssh/config или глобально в /etc/ssh/ssh_config
ForwardAgent yes

# Или при подключении
ssh -A user@server
```

ForwardAgent yes даёт серверу временный доступ к твоим ключам. Включай только на доверенных хостах. Любой, кто имеет root на промежуточном сервере, может использовать ваши ключи пока вы подключены.

### Автозапуск в bash-сессии

```bash
# ~/.bash_profile
eval `ssh-agent`
ssh-add

# ~/.bash_logout
ssh-agent -k
```

---

## Port Forwarding — туннелирование

SSH может пробрасывать TCP-порты через зашифрованный туннель. Трафик идёт через SSH-соединение к целевому хосту.

### Синтаксис

```bash
ssh -L [bind_address:]port:host:host_port [user@]hostname
ssh -R [bind_address:]port:host:host_port [user@]hostname
```

### Local forwarding (-L)

Открывает локальный порт, перенаправляющий на удалённый хост/порт через SSH.

```bash
# Пример: подключение к MySQL на удалённом сервере через SSH
# Firewall не пропускает 3306, но пропускает 22
ssh -L 13306:localhost:3306 john@101.102.103.104

# Теперь подключаемся к локальному порту — трафик идёт через SSH-туннель
mysql -P 13306 -h 127.0.0.1
```

```bash
# Доступ к внутреннему веб-серверу через SSH jump-хост
ssh -L 8080:internal-web:80 user@jumphost
# Теперь открыть: http://localhost:8080
```

### Remote forwarding (-R)

Открывает порт на **удалённом** сервере, который перенаправляет обратно к локальному хосту/порту.

```bash
# На Machine1: открываем обратный туннель к Machine2
ssh -R 13306:localhost:3306 user@machine2

# На Machine2: sql-клиент подключается на localhost:13306
# и попадает на MySQL сервер на Machine1
mysql -P 13306 -h 127.0.0.1
```

```bash
# Сделать локальный веб-сервер (порт 80) доступным на порту 8080 удалённого сервера
ssh -R 8080:localhost:80 user@remoteserver
```

Применение `-R`: открыть локальный сервис через брандмауэр (обратный туннель).

### Динамический проброс портов (-D)

Создаёт прокси SOCKS:

```bash
ssh -D 1080 user@sshserver
# Настроить браузер на использование прокси SOCKS5 localhost:1080
```

### Флаги -N и -f

```bash
ssh -N -L 3307:localhost:3306 user@server   # -N: не выполнять удалённую команду
ssh -f -N -L 3307:localhost:3306 user@server  # -f: перейти в фоновый режим
# или
ssh -f -L 13306:localhost:3306 john@server sleep 10
```

`-L` — local forwarding (клиент открывает порт у себя). `-R` — remote forwarding (сервер открывает порт у себя). Туннель живёт пока активна SSH-сессия.

### Включение в sshd_config

```bash
AllowTcpForwarding yes    # разрешить TCP-туннелирование (по умолчанию yes)
X11Forwarding yes         # разрешить X11 tunneling
```

---

## Перенаправление X11

Позволяет запускать GUI-приложения на удалённом сервере и отображать их локально.

**Сервер (`/etc/ssh/sshd_config`):**

```ini
X11Forwarding yes
X11DisplayOffset 10      # первый номер дисплея для использования (по умолчанию: 10)
```

**Клиент:**

```bash
ssh -X user@server       # включить перенаправление X11 (ненадёжное, безопаснее)
ssh -Y user@server       # доверенное перенаправление X11 (менее безопасно, меньше ограничений)

# После подключения с -X:
firefox &                # открывает окно Firefox на вашем локальном дисплее
```

---

## SCP — безопасное копирование

```bash
# Скопировать локальный файл на удалённый сервер
scp file.txt user@host:/remote/path/

# Скопировать удалённый файл локально
scp user@host:/remote/file.txt /local/path/

# Рекурсивно скопировать каталог
scp -r /local/dir/ user@host:/remote/dir/

# Использовать другой порт
scp -P 2222 file.txt user@host:/path/

# Сохранить временные метки и права доступа
scp -p file.txt user@host:/path/
```

---

## SFTP — протокол передачи файлов через SSH

SFTP — подсистема SSH, а не FTP через SSH. Совершенно другой протокол.

```bash
sftp user@host
sftp> ls
sftp> cd /remote/dir
sftp> get remotefile.txt
sftp> put localfile.txt
sftp> mkdir newdir
sftp> rm file.txt
sftp> bye
```

Ограничить пользователя только SFTP (без оболочки) через `sshd_config`:

```ini
Match User ftpuser
    ForceCommand internal-sftp
    ChrootDirectory /var/sftp/%u
    AllowTcpForwarding no
    X11Forwarding no
```

```bash
# /var/sftp/ftpuser должен принадлежать root
chown root:root /var/sftp/ftpuser
chmod 755 /var/sftp/ftpuser
mkdir /var/sftp/ftpuser/upload
chown ftpuser:ftpuser /var/sftp/ftpuser/upload
```

---

## Безопасная работа при смене конфигурации

При изменении `sshd_config` на удалённом сервере есть риск заблокировать себя после перезапуска демона.

Защита:

1. Открой две или три SSH-сессии к серверу одновременно.
2. Внести изменения в `sshd_config`.
3. Проверить конфиг: `sshd -t`.
4. Перезапустить демон, не закрывая текущие сессии.
5. Из одной из открытых сессий проверить новое подключение в отдельном окне.
6. Если новое подключение работает — всё хорошо. Если нет — откатить изменения через уже открытую сессию.

Именно поэтому открытые сессии не разрываются при `systemctl restart sshd` — они уже аутентифицированы.

```bash
# Проверить конфиг перед перезапуском
sshd -t

# Перезапустить без разрыва существующих сессий
systemctl reload sshd    # reload применяет конфиг без убийства сессий
systemctl restart sshd   # полный перезапуск — существующие сессии остаются живыми
```

---

## Шпаргалка для экзамена

### Файлы и пути

| Путь | Описание |
|---|---|
| `/etc/ssh/sshd_config` | Конфиг сервера |
| `/etc/ssh/sshd_config.d/*.conf` | Drop-in конфиги сервера (рекомендуется править здесь) |
| `/etc/ssh/ssh_config` | Конфиг клиента (глобальный) |
| `~/.ssh/config` | Конфиг клиента (пользовательский) |
| `~/.ssh/authorized_keys` | Публичные ключи для входа (0600) |
| `~/.ssh/known_hosts` | Fingerprints известных серверов |
| `~/.ssh/id_rsa` | Приватный ключ (0600) |
| `~/.ssh/id_rsa.pub` | Публичный ключ |
| `/etc/ssh/ssh_host_*_key` | Приватные host keys сервера (0600) |
| `/etc/hosts.allow` | TCP Wrappers — разрешённые хосты |
| `/etc/hosts.deny` | TCP Wrappers — запрещённые хосты |

### Ключевые команды

```bash
ssh user@host                    # подключиться к серверу
ssh -p 2222 user@host            # подключиться на нестандартный порт
ssh-keygen -t rsa -b 4096        # создать пару ключей RSA
ssh-keygen -t ed25519            # создать пару ключей Ed25519
ssh-copy-id user@host            # скопировать публичный ключ на сервер
ssh -L local_port:dest:dest_port user@host  # local port forwarding
ssh -R remote_port:dest:dest_port user@host # remote port forwarding
ssh -D 1080 user@server          # прокси SOCKS
ssh -X user@host                 # включить X11 forwarding
ssh -A user@host                 # включить agent forwarding
sshd -t                          # проверить синтаксис sshd_config
sshd -T                          # вывести итоговый конфиг
eval `ssh-agent`                 # запустить ssh-agent
ssh-add                          # добавить ключ в агент
ssh-add -l                       # список ключей в агенте
ssh-agent -k                     # остановить агент
ssh-keygen -A                    # пересоздать все отсутствующие host keys
ssh-keygen -R hostname           # удалить ключ хоста из known_hosts
scp file.txt user@host:/path/    # безопасное копирование
```

### Часто встречаемые параметры sshd_config

```bash
Protocol 2
Port 22
PermitRootLogin no
PasswordAuthentication no
ChallengeResponseAuthentication no
UsePAM no
PubkeyAuthentication yes
AllowUsers alice bob
DenyUsers guest
X11Forwarding no
AllowTcpForwarding yes
LoginGraceTime 60
MaxAuthTries 3
```

### Типичные ошибки на экзамене

- Забыл выставить права 700 на `~/.ssh` и 600 на ключи — вход по ключу не работает
- Остановил PasswordAuthentication, но UsePAM остался yes — пароль всё ещё работает через PAM
- Изменил конфиг и перезапустил sshd без предварительного `sshd -t` — заблокировал доступ
- Скопировал публичный ключ вместо приватного на сервер — перепутал файлы
- `PermitRootLogin without-password` — root входит по ключу, но не по паролю (не полный запрет)
- Правишь монолитный `sshd_config` вместо drop-in в `sshd_config.d/` — правки могут слететь при обновлении
- TCP Wrappers без `hosts.deny: sshd : ALL` — правила в `hosts.allow` есть, но всех остальных всё равно пропускает (fail-open)
- Удалил старые host keys и сразу перезапустил sshd до генерации новых — демон не поднялся
- Регенерировал host keys с passphrase — sshd не может их прочитать, используй `-N ""`
- `-L` vs `-R`: `-L` = локальный порт перенаправляется на удалённый; `-R` = удалённый порт перенаправляется на локальный
- `-X` vs `-Y`: `-X` = ненадёжное (безопаснее); `-Y` = доверенное (некоторые приложения могут требовать)
- SFTP vs FTP: SFTP — подсистема SSH, не FTP через SSH — совершенно разные протоколы
- `reload` сохраняет соединения; `restart` разрывает их (но уже открытые сессии остаются)
- DSA-ключи отключены в OpenSSH 7.0+ — не использовать

---

## Практические вопросы

**1. Какой параметр в `sshd_config` разрешает только определённым пользователям входить по SSH?**

`AllowUsers`. Формат: `AllowUsers alice bob deploy@192.168.1.*`. Все остальные пользователи при этом автоматически блокируются.

**2. Какую команду нужно выполнить, чтобы проверить синтаксис `sshd_config` без перезапуска демона?**

`sshd -t`. Флаг `-T` дополнительно выводит итоговую конфигурацию со всеми дефолтными значениями.

**3. Ты хочешь разрешить root-у входить по SSH только с публичным ключом, запретив вход по паролю. Какое значение нужно установить для `PermitRootLogin`?**

`PermitRootLogin without-password`. Вариант `forced-commands-only` тоже запрещает пароль, но дополнительно ограничивает выполняемые команды.

**4. Какие три параметра нужно установить в `no`, чтобы полностью отключить парольную аутентификацию?**

`PasswordAuthentication no`, `ChallengeResponseAuthentication no`, `UsePAM no`. Одного параметра недостаточно, так как PAM может обойти ограничение.

**5. Тебе нужно подключиться к MySQL на порту 3306 удалённого сервера `10.0.0.5`, но firewall блокирует этот порт. SSH на стандартном порту доступен. Какую команду использовать?**

`ssh -L 13306:localhost:3306 user@10.0.0.5`. Затем подключиться через `mysql -P 13306 -h 127.0.0.1`. Трафик пройдёт через SSH-туннель.

**6. В каком файле и в какой строке нужно указать публичный ключ, чтобы пользователь мог входить по этому ключу на удалённый сервер?**

`~/.ssh/authorized_keys` на сервере. Каждый ключ занимает одну строку. Права на файл — `600`, на директорию `~/.ssh` — `700`.

**7. Зачем держать несколько SSH-сессий открытыми при изменении `sshd_config`?**

Если новая конфигурация ошибочна и блокирует вход, уже открытые сессии остаются активными. Через них можно откатить изменения и не потерять доступ к серверу.

**8. Что делает команда `ssh -R 8080:localhost:80 user@jump_host`?**

Открывает обратный туннель. `jump_host` начинает слушать порт 8080 у себя. Все подключения на `jump_host:8080` перенаправляются на `localhost:80` со стороны клиента, который инициировал SSH-соединение.
