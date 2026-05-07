---
title: "CCNA — 5.5 IPsec и VPN"
date: 2026-05-07
description: "Типы VPN (site-to-site и remote access), протоколы IPsec (AH и ESP), режимы Transport и Tunnel, фазы IKE и алгоритмы согласования, GRE over IPsec и SSL VPN (Cisco AnyConnect)."
tags: ["CCNA", "Cisco", "IPsec", "VPN", "безопасность"]
categories: ["CCNA"]
page_lang: "ru"
lang_pair: "/posts/ccna/ccna-5-05-ipsec-vpn/"
pagefind_ignore: true
build:
  list: never
  render: always
---

**Экзаменационная тема:** 5.5 Describe IPsec remote access and site-to-site VPNs
**Odom:** Vol.2, Security chapters

---

## Что такое VPN

**VPN** (Virtual Private Network) — создаёт зашифрованный туннель через публичную сеть (интернет), обеспечивая конфиденциальность и целостность данных.

**Цели VPN:**
- **Confidentiality** — шифрование данных
- **Integrity** — защита от изменения данных в пути
- **Authentication** — проверка подлинности участников
- **Anti-replay** — защита от повторных атак

---

## Типы VPN

### Site-to-Site VPN (Межсайтовый VPN)

Соединяет два офиса через интернет. Туннель постоянный, настраивается на роутерах/файрволах.

```
Офис A                         Офис B
[LAN] → [Router] ==IPsec==> [Router] → [LAN]
           ↑                      ↑
     192.168.1.0/24          192.168.2.0/24
```

- Прозрачно для конечных пользователей
- Пример: соединение филиала с головным офисом

### Remote Access VPN (Удалённый доступ)

Отдельный пользователь подключается к корпоративной сети из любой точки.

```
[Ноутбук сотрудника] ==IPsec/SSL==> [VPN Concentrator/ASA] → [Корпоративная сеть]
```

- Требует VPN-клиент на устройстве пользователя
- Пример: Cisco AnyConnect (SSL/TLS VPN)

---

## IPsec — протокольный стек

**IPsec** (IP Security) — набор протоколов для защиты IP-трафика.

### Режимы IPsec

| Режим | Что шифруется | Применение |
|---|---|---|
| **Transport Mode** | Только payload (данные) | Host-to-Host |
| **Tunnel Mode** | Весь IP-пакет (новый IP-заголовок снаружи) | Site-to-Site VPN |

### Протоколы IPsec

| Протокол | Шифрование | Аутентификация | Описание |
|---|---|---|---|
| **AH** (Authentication Header) | Нет | Да | Только целостность, без шифрования |
| **ESP** (Encapsulating Security Payload) | **Да** | Да | Шифрование + целостность. Используется в реальных VPN |

> На экзамене: **ESP** — стандарт для IPsec VPN (AH не шифрует).

---

## IKE — согласование параметров

**IKE** (Internet Key Exchange) — протокол автоматического согласования параметров IPsec.

**Фаза 1 (IKE Phase 1):**
- Создаёт защищённый канал для управления (ISAKMP SA)
- Согласование: алгоритм шифрования, хэш, аутентификация, DH-группа
- Режимы: Main Mode (6 сообщений, защищён) / Aggressive Mode (3 сообщения, быстрее)

**Фаза 2 (IKE Phase 2):**
- Создаёт IPsec SA (Security Association) для данных
- Согласование: протокол (ESP/AH), алгоритмы шифрования и аутентификации

**IKEv2** — более современная версия, проще и эффективнее IKEv1.

---

## Алгоритмы IPsec

| Тип | Алгоритмы | Рекомендация |
|---|---|---|
| Шифрование | DES, 3DES, **AES-128/256** | AES-256 |
| Хэш/целостность | MD5, SHA-1, **SHA-256/384** | SHA-256+ |
| Аутентификация | Pre-Shared Key (PSK), RSA | PKI/сертификаты |
| DH Group | 1, 2, 5, **14, 19, 20** | 14+ |

> DES и MD5 — устаревшие, использовать только если требуется совместимость.

---

## GRE over IPsec

**GRE** (Generic Routing Encapsulation) — туннельный протокол, поддерживает маршрутизирующие протоколы (OSPF, EIGRP) внутри туннеля. IPsec шифрует GRE.

```
interface Tunnel0
 ip address 10.0.0.1 255.255.255.252
 tunnel source GigabitEthernet0/0
 tunnel destination 203.0.113.2
 tunnel mode gre ip
```

---

## SSL/TLS VPN — Cisco AnyConnect

**SSL VPN** — использует HTTPS (TCP 443). Не требует IPsec-клиента — работает через браузер или AnyConnect.

| Тип | Описание |
|---|---|
| **Clientless SSL VPN** | Через браузер, без клиента — ограниченный доступ |
| **Full Tunnel (AnyConnect)** | Полный сетевой доступ, клиент на ПК |

---

## Сравнение Site-to-Site vs Remote Access

| Параметр | Site-to-Site | Remote Access |
|---|---|---|
| Участники | Два устройства (роутеры) | Устройство — VPN сервер |
| Туннель | Постоянный | По требованию |
| Настройка | На роутерах/файрволах | VPN-клиент на пользователе |
| Протокол | IPsec (ESP, IKEv1/v2) | IPsec или SSL/TLS |
| Пример Cisco | Crypto map / VTI | ASA + AnyConnect |
