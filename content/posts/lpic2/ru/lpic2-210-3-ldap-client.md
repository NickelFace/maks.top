---
title: "LPIC-2 210.3 — LDAP Client Usage"
date: 2026-04-14
description: "Структура дерева LDAP, DN/RDN, формат LDIF, ldapsearch с фильтрами, ldapadd/ldapdelete/ldapmodify/ldappasswd, области поиска, slapadd vs ldapadd. Тема экзамена LPIC-2 210.3."
tags: ["Linux", "LPIC-2", "LDAP", "OpenLDAP", "directory", "authentication"]
categories: ["LPIC-2"]
page_lang: "ru"
lang_pair: "/posts/lpic2/lpic2-210-3-ldap-client/"
pagefind_ignore: true
build:
  list: never
  render: always
---

> **Тема экзамена 210.3** — LDAP Client Usage (вес: 2). Охватывает использование клиентских инструментов командной строки LDAP, формат LDIF, фильтры поиска и понимание структуры дерева каталогов LDAP.

---

## Что такое LDAP

**LDAP (Lightweight Directory Access Protocol)** — облегчённая версия DAP из стандарта X.500 (RFC 2251). Разработан в Мичиганском университете, сейчас поддерживается проектом OpenLDAP.

LDAP — система клиент-сервер: сервер хранит каталог и отвечает на запросы; клиент подключается, запрашивает или изменяет записи. Каталог оптимизирован для **частых чтений и редких записей**.

Типичное содержимое LDAP-каталога: имена сотрудников, телефонные номера, адреса электронной почты, отделы, корпоративные политики и данные аутентификации пользователей.

---

## Структура дерева LDAP

Каталог LDAP построен в виде иерархического дерева. Каждый объект идентифицируется уникальным **Distinguished Name (DN)**.

Пример DN:
```
cn=John Doe,ou=engineering,dc=example,dc=com
```

Атрибуты DN читаются снизу вверх (от частного к общему):

| Атрибут | Полное название | Пример |
|---|---|---|
| `dc` | Domain Component | `dc=example` |
| `o` | Organization | `o=MyCompany` |
| `ou` | Organizational Unit | `ou=engineering` |
| `cn` | Common Name | `cn=John Doe` |
| `uid` | User ID | `uid=jdoe` |
| `c` | Country | `c=US` |
| `sn` | Surname | `sn=Doe` |

**RDN (Relative Distinguished Name)** — крайний левый компонент DN. Он однозначно идентифицирует запись среди соседних объектов с одинаковым родителем.

> **Вопрос на экзамене:** DN = полный путь к записи. RDN = только крайний левый компонент DN.

Схемы классов объектов хранятся в `/etc/openldap/schema/`. Каждый `objectClass` определяет обязательные и необязательные атрибуты.

---

## Формат LDIF

**LDIF (LDAP Data Interchange Format)** — текстовый формат для описания записей LDAP. Используется для импорта/экспорта.

Структура записи:
```ldif
dn: cn=John Doe,o=bmi,c=us
objectclass: top
objectclass: person
cn: John Doe
sn: Doe
telephonenumber: 555-111-5555
```

Правила LDIF:
- Каждая запись начинается со строки `dn:`
- Пустая строка разделяет записи
- Длинные строки можно переносить с отступом на строках продолжения

Пример переноса строки:
```ldif
dn: cn=some_example_user,dc=example,dc=com
# Эквивалентно:
dn: cn=some_e
 xample_user,
 dc=example,d
 c=com
```

> Ведущий пробел на строках продолжения обязателен. Без него сервер трактует строку как новый атрибут.

---

## ldapsearch

Основной инструмент для запросов к LDAP-каталогу.

```bash
ldapsearch [options] [filter] [attributes]
```

### Ключевые параметры:

| Параметр | Описание |
|---|---|
| `-h host` | Хост LDAP-сервера |
| `-p port` | Порт (по умолчанию 389) |
| `-H uri` | URI (ldap://host:port или ldaps://host) |
| `-D dn` | Bind DN (аутентифицироваться как) |
| `-w pass` | Пароль |
| `-W` | Запросить пароль интерактивно |
| `-x` | Простая аутентификация (не SASL) |
| `-b base` | Базовый DN для начала поиска |
| `-s scope` | Область поиска: base, one, sub |
| `-L` | Вывод в формате LDIF |
| `-v` | Подробный вывод |
| `-A` | Только имена атрибутов, без значений |
| `-z size` | Ограничить количество возвращаемых записей |

### Значения области поиска (`-s`):

| Значение | Описание |
|---|---|
| `base` | Только базовая запись |
| `one` | Один уровень ниже базовой записи |
| `sub` | Все записи в поддереве (по умолчанию) |

### Примеры:

```bash
# Поиск всех записей в OU
ldapsearch -h myhost -p 389 -s base \
  -b "ou=people,dc=example,dc=com" \
  "objectclass=*"

# Аутентифицированный поиск, вывод в LDIF
ldapsearch -x -H ldap://localhost \
  -D "cn=admin,dc=example,dc=com" \
  -W -b "dc=example,dc=com" \
  -L "(cn=John*)"

# Из документации экзамена — все объекты
ldapsearch -b 'dc=ispnet1,dc=net' '(objectclass=*)'

# Поиск только определённых атрибутов
ldapsearch -x -H ldap://localhost \
  -b "ou=People,dc=example,dc=com" \
  "(objectClass=inetOrgPerson)" cn mail
```

> `-x` обязателен для простой аутентификации. Без него ldapsearch пытается использовать SASL. `-x` присутствует почти во всех примерах команд на экзамене.

---

## Фильтры LDAP

Фильтры используют префиксную (польскую) нотацию с обязательными скобками.

| Оператор | Синтаксис | Пример |
|---|---|---|
| Равенство | `attr=val` | `cn=John` |
| Присутствие | `attr=*` | `cn=*` |
| Подстрока | `attr=val*` | `cn=Jo*` |
| Приближение | `attr~=val` | `cn~=Jon` |
| Больше или равно | `attr>=val` | `age>=30` |
| Меньше или равно | `attr<=val` | `age<=65` |
| И | `(&(f1)(f2))` | `(&(cn=J*)(ou=IT))` |
| ИЛИ | `(\|(f1)(f2))` | `(\|(cn=A)(cn=B))` |
| НЕ | `(!(f))` | `(!(cn=admin))` |

```bash
# Записи с cn=marie ИЛИ без телефона, начинающегося с 9
ldapsearch -x "(|(cn=marie)(!(telephoneNumber=9*)))"

# И с вложенным ИЛИ
ldapsearch -x -b "dc=example,dc=com" \
  "(&(objectclass=person)(|(cn=John)(cn=Jane)))"
```

> Скобки обязательны вокруг каждого условия. На экзамене всегда пишите скобки.

---

## ldappasswd

Утилита для смены пароля пользователя LDAP. Использует расширенную операцию LDAPv3 Password Modify (RFC 3062).

Если новый пароль не указан и интерактивный режим не включён, сервер **автоматически генерирует пароль**.

```bash
ldappasswd -x -h localhost \
  -D "cn=root,dc=example,dc=com" \
  -s secretpassword \
  -W uid=admin,ou=users,dc=example,dc=com
```

| Параметр | Описание |
|---|---|
| `-s newpass` | Новый пароль |
| `-S` | Запросить новый пароль интерактивно |
| `-D dn` | DN администратора (кто меняет) |
| `-W` | Запросить пароль администратора |
| `-x` | Простая аутентификация |

> Если DN пользователя не указан, `ldappasswd` меняет пароль пользователя, привязанного через `-D`.

---

## ldapadd

Инструмент для добавления записей в каталог. Технически является **символической ссылкой на `ldapmodify` с флагом `-a`**.

```bash
ldapmodify -a  # то же самое, что ldapadd
```

Данные читаются из LDIF-файла. Сервер должен быть запущен (в отличие от `slapadd`).

```bash
ldapadd -h myhost -p 389 \
  -D "cn=orcladmin" \
  -w welcome \
  -f jhay.ldif
```

Пример LDIF для добавления пользователя:
```ldif
dn: uid=jdoe,ou=people,dc=example,dc=com
objectclass: top
objectclass: person
objectclass: inetOrgPerson
uid: jdoe
cn: John Doe
sn: Doe
mail: jdoe@example.com
userPassword: {SSHA}...
```

> **Ключевое различие для экзамена:** `ldapadd` работает через протокол LDAP с запущенным сервером. `slapadd` работает напрямую с файлами базы данных при **остановленном** сервере.

---

## ldapdelete

Инструмент для удаления записей. Также является символической ссылкой на `ldapmodify`.

```bash
ldapdelete -h myhost -p 389 \
  -D "cn=orcladmin" \
  -w welcome \
  "uid=hricard,ou=sales,ou=people,dc=example,dc=com"
```

> `ldapdelete` НЕ удаляет дочерние записи автоматически. Сначала удалите всех потомков, затем родителя.

---

## ldapmodify

Основной инструмент для изменения существующих записей. `ldapadd` и `ldapdelete` — лишь ссылки на него.

Тип операции указывается через `changetype` в LDIF-файле:

```ldif
dn: uid=jdoe,ou=people,dc=example,dc=com
changetype: modify
replace: mail
mail: newemail@example.com
-
add: telephoneNumber
telephoneNumber: 555-9999
-
delete: description
```

Значения `changetype`:

| Значение | Действие |
|---|---|
| `add` | Добавить новую запись |
| `delete` | Удалить запись |
| `modify` | Изменить атрибуты |
| `modrdn` | Переименовать запись |

Разделитель `-` обязателен между операциями изменения для одной записи.

```bash
ldapmodify -x -h localhost \
  -D "cn=admin,dc=example,dc=com" \
  -W -f changes.ldif
```

Полезные флаги:

| Флаг | Описание |
|---|---|
| `-a` | Добавить новые записи (режим ldapadd) |
| `-c` | Продолжить при ошибках |
| `-n` | Показать, что будет сделано, но не выполнять |
| `-v` | Подробный вывод |

---

## /etc/ldap/ldap.conf

Файл конфигурации на стороне клиента. После его настройки флаги `-H` и `-b` становятся необязательными:

```
BASE    dc=example,dc=com
URI     ldap://192.168.1.100
```

Расположение файла:
- Debian/Ubuntu: `/etc/ldap/ldap.conf`
- Red Hat/CentOS: `/etc/openldap/ldap.conf`

---

## Шпаргалка для экзамена

### Порты LDAP

| Порт | Протокол |
|---|---|
| **389** | LDAP (открытый текст) |
| **636** | LDAPS (LDAP через TLS) |

### Сводная таблица команд

| Команда | Роль |
|---|---|
| `ldapsearch` | Поиск и запрос каталога |
| `ldapadd` | Добавление записей (симлинк на `ldapmodify -a`) |
| `ldapdelete` | Удаление записей (симлинк на `ldapmodify`) |
| `ldappasswd` | Смена пароля пользователя |
| `ldapmodify` | Изменение существующих записей |

### Общие параметры

```
-x        простая аутентификация (не SASL)
-D dn     bind DN (от чьего имени аутентифицируемся)
-w pass   пароль
-W        запросить пароль интерактивно
-h host   хост сервера
-p port   порт сервера
-H uri    URI (ldap://host или ldaps://host)
-b base   базовый DN для поиска
-f file   LDIF-файл
-L        вывод в формате LDIF
-s scope  область поиска (base/one/sub)
```

### Ключевые факты для экзамена

| Факт | Подробности |
|---|---|
| `ldapadd` и `ldapdelete` | Символические ссылки на `ldapmodify` |
| `ldapadd` vs `slapadd` | `ldapadd` = живой сервер через протокол; `slapadd` = прямой доступ к БД, сервер остановлен |
| Флаг `-x` | Обязателен для простой аутентификации (не SASL) |
| Сервер не указан + нет авто-генерации | `ldappasswd` автоматически генерирует пароль |
| DN vs RDN | DN = полный путь; RDN = только крайний левый компонент |
| Схемы классов объектов | `/etc/openldap/schema/` |
