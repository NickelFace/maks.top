---
title: "CCNA 200-301 — Руководство по подготовке"
date: 2026-03-01
description: "Полный список ресурсов для подготовки к экзамену CCNA 200-301: книги, видеокурсы, практические лабораторные работы, советы и регистрация."
tags: ["Networking", "CCNA", "Cisco", "Certification"]
categories: ["CCNA"]
page_lang: "ru"
lang_pair: "/posts/ccna-prep-guide/"
pagefind_ignore: true
build:
  list: never
  render: always
---

> Код экзамена: **200-301** · Актуальная версия: **v1.1** (2024) · Длительность: **120 мин** · Проходной балл: ~825/1000

## Разделы экзамена

| Раздел | Вес |
|---|---|
| 1. Network Fundamentals (Основы сетей) | 20% |
| 2. Network Access (Доступ к сети) | 20% |
| 3. IP Connectivity (IP-связность) | 25% |
| 4. IP Services (IP-сервисы) | 10% |
| 5. Security Fundamentals (Основы безопасности) | 15% |
| 6. Automation and Programmability (Автоматизация) | 10% |

Официальные темы экзамена (PDF): [200-301-CCNA-v1.1.pdf](https://learningcontent.cisco.com/documents/marketing/exam-topics/200-301-CCNA-v1.1.pdf)

---

## Книги

### Official Cert Guide (Wendell Odom) — рекомендуется

Де-факто стандарт. Два тома, охватывает все разделы экзамена.

- **Том 1** — Network Fundamentals, Network Access, IP Connectivity
- **Том 2** — IP Services, Security, Automation, итоговый обзор

Последнее издание: **v1.1 (2024)** — обновлено под актуальную версию экзамена.

- [Cisco Press — Official Cert Guide Library (v1.1)](https://www.ciscopress.com/store/ccna-200-301-official-cert-guide-library-premium-edition-9780138221447)
- [Amazon](https://www.amazon.com/CCNA-200-301-Official-Cert-Guide/dp/0135792738)

> В конце каждой главы есть тест. Используйте его систематически — не пропускайте.

### 31 Days Before Your CCNA Exam

Компактная книга для повторения. Лучше всего использовать в последний месяц перед экзаменом как структурированное повторение. В чате сообщества распространяется как `Book 31days before exam.pdf`.

### All Cheat Sheets

Сборник шпаргалок от сообщества: подсеть, протоколы, команды CLI. В чате распространяется как `All Cheat Sheets.pdf`.

---

## Видеокурсы

### Jeremy's IT Lab (YouTube) — бесплатно, настоятельно рекомендуется

Полное покрытие 200-301, понятные объяснения, бесплатно на YouTube. Отмечается сообществом как основной ресурс.

Поиск: **"Jeremy's IT Lab CCNA"** на YouTube.

### CiscoStr (Данил) — курс на русском языке

Структурированный платный курс от опытного преподавателя. Есть бесплатные записи на YouTube:

- [Плейлист YouTube (запись 2020 г.)](https://www.youtube.com/playlist?list=PLHpWwR6fSBN76MvCxsfJwOnsQIloB3-Mo)
- [Сайт CiscoStr](https://ciscostr.ru)

### Cisco NetAcad — бесплатно, самостоятельное обучение

Три официальных курса Cisco, полностью охватывающих программу 200-301:

1. **CCNA: Introduction to Networks**
2. **CCNA: Switching, Routing, and Wireless Essentials**
3. **CCNA: Enterprise Networking, Security, and Automation**

Регистрация: [netacad.com](https://www.netacad.com) · Итоговые тесты в конце каждого раздела соответствуют формату реального экзамена.

### CBT Nuggets

Платный профессиональный видеокурс. Хорош для тех, кто предпочитает структурированный платный вариант.

---

## Практические лаборатории

### Cisco Packet Tracer — рекомендуется для начинающих

Бесплатный симулятор от Cisco. Не требует оборудования. Скачать:

- [netacad.com/courses/packet-tracer](https://www.netacad.com/courses/packet-tracer)

Покрывает ~90% того, что нужно для экзамена. Сообщество рекомендует начинать здесь, прежде чем переходить на GNS3 или EVE-NG.

> Лабораторные работы Packet Tracer (`.pka`) из курса охватывают: статическую маршрутизацию, VLANs, OSPF, IPv6, EtherChannel, беспроводные сети.

### EVE-NG / GNS3 — для продвинутых

Полноценные эмуляторы сети, работающие с реальными образами Cisco IOS.

- [EVE-NG community edition](https://www.eve-ng.net) — бесплатно
- [Cisco DevNet Sandboxes](https://developer.cisco.com/site/sandbox/) — бесплатные облачные лаборатории, установка не требуется

> **Предупреждение сообщества:** EVE-NG может вести себя непредсказуемо. Начинающие могут перепутать баги эмулятора с ошибками конфигурации. Используйте Packet Tracer, пока не сформируете крепкую базу.

### Cisco DevNet Sandboxes

Бесплатные облачные лабораторные среды. Для ряда сценариев предоставляет больше возможностей, чем EVE-NG.

- [developer.cisco.com/site/sandbox/](https://developer.cisco.com/site/sandbox/)

---

## Подготовка и тренировочные тесты

### ExamTopics

Большой банк вопросов с обсуждением каждого вопроса сообществом. Помогает понять, почему ответ правильный.

- [examtopics.com](https://www.examtopics.com)

### ITExams

Ещё одна база тренировочных вопросов:

- [itexams.com/exam/200-301](https://www.itexams.com/exam/200-301)

### 9tut

Тренировочные вопросы, включая раздел по IPv6:

- [9tut.com](https://www.9tut.com)

### Boson ExSim

Платный симулятор экзамена. Вопросы высокого качества, близкие к реальной сложности экзамена.

### Anki (карточки)

Интервальное повторение эффективно для запоминания команд, таймеров протоколов и номеров портов.

- Скачать Anki: [apps.ankiweb.net](https://apps.ankiweb.net)
- Колода CCNA: [ankiweb.net/shared/info/591991787](https://ankiweb.net/shared/info/591991787)

---

## Регистрация на экзамен

### Pearson VUE

CCNA сдаётся через Pearson VUE — как в очных центрах тестирования, так и с онлайн-наблюдателем.

- [home.pearsonvue.com/cisco.aspx](https://home.pearsonvue.com/cisco.aspx)

### Дополнительное время для не носителей английского языка

Можно запросить **+30 минут** дополнительного времени, если английский не является родным языком.

- [Запрос accommodations](https://www.pearsonvue.com/accommodations/pv_review.asp?clientName=Cisco%20Systems)
- Или через: [Cisco Learning Network](https://learningnetwork.cisco.com/s/question/0D56e0000D6DrnJCQS/ccna-200301-non-native-english-speaker-extra-time)

### Необходимые документы

Принесите **2 удостоверения личности** в центр тестирования (требование Pearson VUE):
- Заграничный паспорт (основной)
- Второй документ (внутренний паспорт, водительское удостоверение)

---

## Ключевые темы для изучения

По опыту сообщества:

**Обязательно знать:**
- **Двоичная и шестнадцатеричная математика** — подсеть вручную, вычисление префиксов IPv6
- **OSPF** — однозонный и многозонный, состояния соседей, типы LSA
- **Основы BGP** — отношения eBGP и iBGP, атрибуты
- **VLANs и транкинг** — 802.1Q, DTP, VTP, маршрутизация между VLANs
- **STP / RSTP** — состояния портов, роли портов, изменения топологии (STP всё ещё в 200-301 несмотря на слухи)
- **ACL** — стандартные, расширенные, именованные; wildcard-маски
- **NAT/PAT** — статический, динамический, overload
- **Беспроводные сети** — стандарты 802.11, WLC, lightweight AP
- **Автоматизация** — REST API, JSON, основы Python, DNA Center, обзор SD-WAN/SD-Access

**Типичные ошибки:**
- Официальный курс (NetAcad) не покрывает 100% вопросов экзамена — дополняйте OCG
- Глюки EVE-NG могут вводить в заблуждение начинающих; используйте Packet Tracer для начальных лабораторных работ
- IPv6 выделен в отдельный раздел — не пропускайте его

---

## План обучения (примерные сроки)

| Фаза | Продолжительность | Фокус |
|---|---|---|
| Основы | 4–6 недель | Разделы 1–2: Fundamentals, switching |
| Ядро | 6–8 недель | Разделы 3–4: Routing, IP services |
| Безопасность + Автоматизация | 2–3 недели | Разделы 5–6 |
| Повторение | 3–4 недели | Практические тесты, слабые места, шпаргалки |
| Финальный спурт | 1 месяц | Книга «31 Days Before», Anki, ежедневные тесты |

---

## Полезные ссылки

| Ресурс | Ссылка |
|---|---|
| Официальные сертификации Cisco | [cisco.com/training-certifications](https://www.cisco.com/c/en/us/training-events/training-certifications/certifications.html) |
| Cisco Learning Network | [learningnetwork.cisco.com](https://learningnetwork.cisco.com) |
| Темы экзамена (PDF) | [200-301-CCNA-v1.1.pdf](https://learningcontent.cisco.com/documents/marketing/exam-topics/200-301-CCNA-v1.1.pdf) |
| NetAcad | [netacad.com](https://www.netacad.com) |
| Скачать Packet Tracer | [netacad.com/courses/packet-tracer](https://www.netacad.com/courses/packet-tracer) |
| Pearson VUE | [home.pearsonvue.com/cisco.aspx](https://home.pearsonvue.com/cisco.aspx) |
| ExamTopics | [examtopics.com](https://www.examtopics.com) |
| Anki (карточки) | [apps.ankiweb.net](https://apps.ankiweb.net) |
| Колода CCNA для Anki | [ankiweb.net/shared/info/591991787](https://ankiweb.net/shared/info/591991787) |
| Cisco DevNet Sandboxes | [developer.cisco.com/site/sandbox/](https://developer.cisco.com/site/sandbox/) |
| CiscoStr (Данил) | [ciscostr.ru](https://ciscostr.ru) |
| Плейлист CiscoStr YouTube | [youtube.com/playlist](https://www.youtube.com/playlist?list=PLHpWwR6fSBN76MvCxsfJwOnsQIloB3-Mo) |
| 9tut | [9tut.com](https://www.9tut.com) |
| EVE-NG | [eve-ng.net](https://www.eve-ng.net) |

---

*На основе опыта сообщества из Telegram-группы CiscoStr.*
