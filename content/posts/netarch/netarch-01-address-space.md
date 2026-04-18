---
title: "Network Architect — 01. Address Space Design (CLOS)"
date: 2025-09-03
description: "OTUS Network Architect: CLOS topology with 3 Spine + 4 Leaf, address space distribution for Underlay network"
tags:
  - "Networking"
  - "DC Design"
  - "CLOS"
  - "Spine-Leaf"
  - "OTUS"
categories: ["Network Architect"]
code_toggle: true
page_lang: "en"
lang_pair: "/posts/netarch/ru/netarch-01-address-space/"
---

## Address Space Design

Goal: Build a CLOS topology and distribute the address space.

Lab objectives:

1. Build a CLOS topology with 3 Spine and 4 Leaf. Three Leaf nodes connect to 2 Spine. One Leaf connects to the remaining Spine. All Spine are interconnected via an additional router (IOL recommended).
2. Interconnect Leaf nodes for future VPC pair configuration.
3. Add 3 clients to the future fabric. One client connects to the VPC pair; the rest connect to the remaining Leaf nodes (IOL images recommended for clients).
4. Distribute the address space for the Underlay network.
5. Document the work plan, address space, network diagram, and configurations.

![Schema](/img/netarch/1/Schema.png)

*Network Architect Course | Lab 01*