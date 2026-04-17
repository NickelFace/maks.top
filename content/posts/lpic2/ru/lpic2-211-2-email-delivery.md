---
title: "LPIC-2 211.2 — Managing E-Mail Delivery"
date: 2026-05-10
description: "Синтаксис и флаги рецептов procmail, язык фильтрации Sieve (RFC 5228), команды действий/управления/проверки, расширение vacation, форматы mbox и maildir, интеграция Dovecot LDA и LMTP с Postfix. Тема экзамена LPIC-2 211.2."
tags: ["Linux", "LPIC-2", "Postfix", "Dovecot", "Procmail", "Sieve", "email", "MDA"]
categories: ["LPIC-2"]
page_lang: "ru"
lang_pair: "/posts/lpic2/lpic2-211-2-email-delivery/"
pagefind_ignore: true
build:
  list: never
  render: always
---

> **Тема экзамена 211.2** — Managing E-Mail Delivery (вес: 2). Охватывает фильтрацию и сортировку почты с помощью procmail (уровень осведомлённости) и Sieve (уровень написания скриптов), а также форматы хранения mbox и maildir.

---

## Обзор

Тема 211.2 посвящена фильтрации и сортировке входящей почты на стороне MDA (Mail Delivery Agent). Два инструмента: **procmail** (старый стандарт) и **Sieve** (современный язык фильтрации по RFC 5228). Sieve поддерживается Dovecot и Cyrus. Procmail работает с Sendmail и Postfix.

> **Примечание для экзамена:** Sieve необходимо знать на уровне написания скриптов. Procmail — только на уровне осведомлённости.

---

## Procmail

### Подключение к MTA

Procmail редко запускается вручную — MTA автоматически передаёт ему входящие сообщения.

Для Sendmail добавьте в файл m4:

```
MAILER(`procmail')dnl
```

Для Postfix в `main.cf`:

```ini
mailbox_command = /usr/bin/procmail -m /etc/procmailrc
```

Флаг `-m` заставляет procmail выполнять рецепты от имени пользователя-получателя, а не от root.

### Конфигурационные файлы

Procmail читает оба файла последовательно:

| Файл | Область действия |
|---|---|
| `/etc/procmailrc` | Глобальный, для всех пользователей |
| `~/.procmailrc` | Личный, для конкретного пользователя |

> **Внимание:** `/etc/procmailrc` запускается от root. Опечатка в рецепте может перезаписать системный файл. Минимизируйте глобальные рецепты.

### Структура рецепта

```
:0 [флаги] [: файл-блокировки]
* условие1
* условие2
действие
```

Каждое условие начинается с `*`. После условий — одна строка действия.

Если используется `:0:` (с двоеточием после нуля), procmail создаёт стандартный файл блокировки. Для формата mbox файл блокировки всегда обязателен. Для maildir — не нужен.

### Флаги рецептов

| Флаг | Описание |
|---|---|
| `H` | Применить egrep к заголовкам (по умолчанию) |
| `B` | Применить egrep к телу сообщения |
| `b` | Передать тело сообщения в назначение (по умолчанию) |
| `h` | Передать заголовки сообщения в назначение (по умолчанию) |
| `c` | Создать копию сообщения |
| `f` | Использовать пайп как фильтр |
| `D` | Поиск с учётом регистра |
| `A` | Выполнить только если предыдущий рецепт совпал |
| `E` | Выполнить только если предыдущий рецепт не совпал |
| `W` | Ждать завершения программы, проверить код выхода, подавить ошибки |
| `w` | Ждать завершения программы, проверить код выхода, показать ошибки |
| `i` | Игнорировать ошибки записи |
| `r` | Сырой режим — не добавлять завершающую пустую строку |

### Специальные условия

| Символ | Описание |
|---|---|
| `!` | Инвертировать условие |
| `$` | Вычислить с использованием подстановки оболочки |
| `?` | Использовать код выхода программы |
| `<` | Размер сообщения меньше N байт |
| `>` | Размер сообщения больше N байт |
| `variable ??` | Сопоставить с переменной окружения |
| `\` | Экранировать специальные символы |

### Примеры рецептов

Сохранить копию всех сообщений в папку `messages`:

```
:0 c
messages
```

Удалить сообщения с темой "work":

```
:0
* ^Subject.*work
/dev/null
```

Перенаправить сообщения из `guitar-list` и сохранить копию:

```
:0
* ^From.*guitar-list
{
  :0 c
  ! user@example.com

  :0
  guitars
}
```

Автоответ через formail (не от демона, без X-Loop):

```
:0 hc
* !^FROM_DAEMON
* !^X-Loop: user@example.com
| (formail -r -I"Precedence: junk" \
-A"X-Loop: user@example.com"; \
echo "I am out of office") \
| $SENDMAIL -t
```

### Специальные символы в строке действия

| Символ | Описание |
|---|---|
| `!` | Переслать на адреса |
| `\|` | Передать в программу через пайп |
| `{` | Начало блока рецептов |
| `}` | Конец блока рецептов |
| `text` | Сохранить в почтовый ящик с именем text |

---

## Sieve

Sieve — язык фильтрации почты, стандартизованный в RFC 5228. Выполняется на стороне сервера во время доставки в почтовый ящик.

### Настройка Dovecot для Sieve

В `main.cf` Postfix маршрутизируйте почту в Dovecot LDA:

```ini
mailbox_command = /usr/lib/dovecot/dovecot-lda -a "$RECIPIENT"
```

В `/etc/dovecot/conf.d/15-lda.conf`:

```
lda_mailbox_autocreate = yes
lda_mailbox_autosubscribe = yes
protocol lda {
  mail_plugins = $mail_plugins sieve
}
```

В `/etc/dovecot/conf.d/90-sieve.conf`:

```
plugin {
  sieve = ~/.dovecot.sieve
  sieve_dir = ~/sieve
  sieve_default = /var/lib/dovecot/sieve/default.sieve
  sieve_global_dir = /var/lib/dovecot/sieve/global/
}
```

| Параметр | Описание |
|---|---|
| `sieve` | Путь к личному скрипту Sieve пользователя |
| `sieve_dir` | Каталог с несколькими скриптами пользователя |
| `sieve_default` | Глобальный скрипт по умолчанию |
| `sieve_global_dir` | Каталог с глобальными скриптами |

> Если у пользователя есть личный файл Sieve, он переопределяет глобальный скрипт.

### Типы команд

Sieve делит все команды на три группы:

1. **Команды действий** — что делать с сообщением
2. **Команды управления** — управление потоком выполнения
3. **Команды проверки** — условия для `if`

### Команды действий

| Команда | Описание |
|---|---|
| `keep` | Сохранить в почтовый ящик по умолчанию |
| `fileinto "mailbox"` | Сохранить в указанный почтовый ящик (требует `require ["fileinto"]`) |
| `redirect "addr"` | Переслать на адрес без изменений |
| `discard` | Удалить без уведомления отправителя |
| `reject "reason"` | Отклонить и вернуть сообщение отправителю (требует `require ["reject"]`) |

> **Факт для экзамена:** `reject` — это расширение, не входящее в базовый стандарт — необходимо объявить через `require`. `discard` — тихое удаление; отправитель не получает ответа.

### Команды управления

| Команда | Описание |
|---|---|
| `if / elsif / else` | Условная проверка |
| `require ["ext"]` | Загрузить расширение (должно быть в начале скрипта) |
| `stop` | Остановить обработку скрипта |

### Команды проверки

Используются внутри `if`. Можно комбинировать.

| Команда | Описание |
|---|---|
| `address` | Сравнить адрес отправителя или получателя |
| `header` | Проверить наличие или содержимое заголовка SMTP |
| `envelope` | Проверить части конверта SMTP (From, Rcpt) |
| `exists` | Проверить наличие заголовка |
| `size` | Оценить размер сообщения |
| `allof(...)` | Логическое И — все условия должны совпасть |
| `anyof(...)` | Логическое ИЛИ — достаточно одного совпадения |
| `not` | Инвертировать результат проверки |
| `true` | Всегда ИСТИНА |
| `false` | Всегда ЛОЖЬ |

### Операторы сравнения

Используются как теги (`:tag`) в командах проверки:

| Оператор | Описание |
|---|---|
| `:is` | Точное совпадение |
| `:contains` | Содержит подстроку |
| `:matches` | Совпадение по шаблону (`*` и `?`) |
| `:over` | Размер превышает (для `size`) |
| `:under` | Размер меньше (для `size`) |
| `:domain` | Сравнивать только домен адреса |
| `:localpart` | Сравнивать только локальную часть адреса |

### Примеры скриптов Sieve

Переместить все сообщения в `saved`:

```sieve
require ["fileinto"];
fileinto "saved";
```

Сортировать по отправителю:

```sieve
require ["fileinto"];
if header :is "Sender" "guitar-list.org" {
  fileinto "guitars";
} else {
  fileinto "saved";
}
```

Фильтровать спам и вредоносные сообщения:

```sieve
require ["fileinto", "reject"];
if header :contains "subject" "pills" {
  reject "please stop spamming me";
}
elsif address :matches :domain "from" "badhost.com" {
  discard;
}
```

Помещать подозрительные вложения в карантин:

```sieve
if attachment :matches ["*.vbs", "*.exe"] {
  fileinto "INBOX.suspicious";
}
```

Перенаправлять сообщения с вирусами администратору:

```sieve
if exists "x-virus-found" {
  redirect "admin@example.com";
}
```

Удалять сообщения размером больше 2 МБ:

```sieve
if size :over 2M {
  discard;
}
```

### Расширение vacation

Расширение vacation добавляет функцию автоответа «не в офисе». Загружается через `require ["vacation"]`.

| Параметр | Описание |
|---|---|
| `:days N` | Не отвечать одному отправителю чаще одного раза в N дней |
| `:subject "string"` | Тема автоответа |
| `:from "address"` | Поле From в автоответе |
| `:addresses [...]` | Дополнительные адреса получателей для ответа |
| `:mime` | Указать пользовательское MIME-содержимое (например, многоязычный ответ) |
| `:handle "string"` | Отслеживать разные действия vacation как одно |
| `"text"` | Текст автоответа (обязательный аргумент) |

```sieve
require ["fileinto", "vacation"];
vacation
  :days 1
  :subject "Out of office reply"
  :addresses ["j.doe@company.dom", "john.doe@company.dom"]
  "I'm out of office, please contact Joan Doe instead.
Best regards
John Doe";
```

> `:days 1` означает: один и тот же отправитель получит автоответ не более одного раза в день.

---

## Интеграция LMTP (Postfix + Dovecot + Sieve)

Стандартный способ подключить Sieve к Postfix + Dovecot — через LMTP (Local Mail Transfer Protocol). Почта поступает в Postfix, проходит через LMTP в Sieve, фильтруется и только затем попадает в почтовый ящик пользователя.

Установите три пакета:

```bash
sudo apt install dovecot-sieve dovecot-managesieved dovecot-lmtpd
```

| Пакет | Назначение |
|---|---|
| `dovecot-sieve` | Поддержка Sieve в Dovecot |
| `dovecot-managesieved` | Демон управления Sieve, слушает на порту 4190 |
| `dovecot-lmtpd` | Локальный транспорт почты между Postfix и Sieve |

**`/etc/dovecot/conf.d/10-master.conf`** — настройка LMTP unix-слушателя:

```
service lmtp {
  unix_listener /var/spool/postfix/private/dovecot-lmtp {
    mode = 0600
    user = postfix
    group = postfix
  }
}
```

**`/etc/postfix/main.cf`** — маршрутизировать доставку почтового ящика через LMTP:

```ini
mailbox_transport = lmtp:unix:private/dovecot-lmtp
smtp_utf8_enable = no
```

`smtp_utf8_enable = no` отключает UTF-8, который Sieve пока не поддерживает.

**`/etc/dovecot/conf.d/20-lmtp.conf`** — включить Sieve в LMTP:

```
protocol lmtp {
  postmaster_address = admin@example.com
  mail_plugins = $mail_plugins sieve
}
```

`postmaster_address` — адрес для ошибок Sieve. Обязательное поле.

**`/etc/dovecot/conf.d/90-sieve.conf`** — полная настройка путей:

```
plugin {
  sieve = ~/.dovecot.sieve
  sieve_dir = ~/sieve
  sieve_default = /var/lib/dovecot/sieve/default.sieve
  sieve_global_dir = /var/lib/dovecot/sieve/
}
```

Создайте глобальный скрипт:

```bash
sudo mkdir -p /var/lib/dovecot/sieve
sudo touch /var/lib/dovecot/sieve/default.sieve
sudo chown -R dovecot /var/lib/dovecot/sieve
```

Пример глобального скрипта `/var/lib/dovecot/sieve/default.sieve`:

```sieve
require ["fileinto"];

if address :is "from" "bob@aol.com" {
  fileinto "junk";
}

if address :contains "from" "@aol.com" {
  fileinto "junk";
}

if header :contains "x-spam-flag" "yes" {
  fileinto "junk";
}
```

Проверьте, что managesieve работает:

```bash
telnet 127.0.0.1 4190
```

Баннер Dovecot с поддерживаемыми командами подтверждает работу Sieve.

---

## Форматы хранения почты

### Mbox

Все сообщения хранятся в одном текстовом файле. Путь по умолчанию: `/var/spool/mail/<username>`.

При любой операции весь файл блокируется. После операции блокировка снимается.

**Преимущества:** Широко поддерживается, быстро добавлять сообщения, быстрый внутренний поиск.  
**Недостатки:** Проблемы с блокировкой, подвержен повреждению данных.

### Maildir

Каждое сообщение — отдельный файл. Для каждого пользователя создаётся каталог `~/Maildir/` с тремя подкаталогами:

| Каталог | Назначение |
|---|---|
| `new/` | Новые непрочитанные сообщения |
| `cur/` | Прочитанные сообщения |
| `tmp/` | Временные файлы во время доставки |

**Преимущества:** Быстрый поиск/удаление конкретных сообщений, минимальная или нулевая блокировка файлов, работает на сетевых файловых системах, устойчив к повреждению данных.  
**Недостатки:** Некоторые файловые системы плохо справляются с большим количеством маленьких файлов; полнотекстовый поиск медленный.

### Синтаксис procmail для mbox и maildir

Имена папок maildir заканчиваются на `/`. Файл блокировки для maildir не нужен.

**mbox:**
```
:0:
* условие
directory_name
```

**maildir:**
```
:0
* условие
directory_name/
```

> **Факт для экзамена:** Maildir — рекомендуемый формат. При использовании mbox в procmail файл блокировки обязателен (`:0:`). Для maildir блокировка не нужна — используйте `:0` без двоеточия.

---

## Шпаргалка для экзамена

### Файлы и пути

| Файл | Назначение |
|---|---|
| `/etc/procmailrc` | Глобальные рецепты procmail |
| `~/.procmailrc` | Личные рецепты procmail |
| `/etc/dovecot/conf.d/15-lda.conf` | Конфиг Dovecot LDA + включить sieve |
| `/etc/dovecot/conf.d/90-sieve.conf` | Пути к скриптам Sieve |
| `/var/spool/mail/<user>` | Файл mbox пользователя |

### Структура рецепта

```
:0 [флаги] [: файл-блокировки]
* условие (регулярное выражение)
действие
```

### Структура скрипта Sieve

```sieve
require ["extension1", "extension2"];
if TEST {
  ACTION;
} else {
  ACTION;
}
```

### Типичные ошибки на экзамене

| Ошибка | Правило |
|---|---|
| Использование `fileinto` без `require` | `require ["fileinto"]` должно быть в начале |
| Использование `reject` без `require` | `require ["reject"]` должно быть в начале |
| `discard` vs `reject` | `discard` = тихое удаление; `reject` = отправляет уведомление |
| `reject` — базовая команда | Это НЕ так — это расширение, требующее `require` |
| mbox в procmail без блокировки | Всегда используйте `:0:` (с блокировкой) для mbox |
| `/etc/procmailrc` без флага `-m` | Рецепты выполняются от root — опасно |
