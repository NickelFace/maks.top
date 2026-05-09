---
title: "CCNA — 6.3 Configuration Tools"
date: 2026-09-25
description: "Ansible (agentless, YAML, push), Puppet and Chef (agent-based, pull), comparison of automation tools, Terraform for IaC, and built-in IOS tools: EEM and TCL scripting."
tags: ["CCNA", "Cisco", "Ansible", "automation", "configuration"]
categories: ["CCNA"]
page_lang: "en"
lang_pair: "/posts/ccna/ru/ccna-6-03-config-tools/"
---

## Why Configuration Automation is Needed

| Manual management problem | Solution |
|---|---|
| Errors from manual input | Templates, declarative approach |
| Inconsistent configurations | Idempotency — only differences are applied |
| Slow deployments | Parallel application to hundreds of devices |
| No change history | Git integration (IaC — Infrastructure as Code) |

---

## Ansible

**Ansible** is the most popular tool for network automation.

| Characteristic | Description |
|---|---|
| Language | YAML (Playbooks) |
| Agent | None (agentless) |
| Transport | SSH or API (for network devices — NETCONF, HTTP) |
| Developer | Red Hat |

### Ansible Components

| Component | Description |
|---|---|
| Inventory | List of hosts (IPs, groups, variables) |
| Playbook | Set of tasks in YAML |
| Task | A single operation (module call) |
| Module | Plugin for interacting with a device |
| Role | Collection of Playbooks for a specific function |
| Jinja2 | Templating engine for generating configurations |

### Ansible Playbook Example for Cisco IOS

```yaml
---
- name: Configure Cisco Router
  hosts: routers
  gather_facts: no

  vars:
    interface: GigabitEthernet0/0
    ip_address: 192.168.1.1
    subnet_mask: 255.255.255.0

  tasks:
    - name: Set hostname
      cisco.ios.ios_hostname:
        config:
          hostname: R1

    - name: Configure interface
      cisco.ios.ios_interfaces:
        config:
          - name: "{{ interface }}"
            description: "LAN Interface"
            enabled: true

    - name: Configure IP address
      cisco.ios.ios_l3_interfaces:
        config:
          - name: "{{ interface }}"
            ipv4:
              - address: "{{ ip_address }}/24"
```

### Inventory File

```ini
[routers]
192.168.1.1 ansible_user=admin ansible_password=cisco123 ansible_network_os=ios

[switches]
192.168.1.10 ansible_user=admin ansible_password=cisco123 ansible_network_os=ios
192.168.1.11

[all:vars]
ansible_connection=network_cli
```

---

## Puppet

| Characteristic | Description |
|---|---|
| Language | Puppet DSL (Ruby-based) |
| Agent | Yes (Puppet Agent on each node) |
| Model | Pull (agent requests config from Puppet Master) |
| Developer | Puppet, Inc. |

**How it works:**
1. Puppet Master stores "manifests" (desired state)
2. Puppet Agent (on devices) periodically requests the manifest
3. Agent applies changes if the current state differs from desired

```puppet
# Example Puppet manifest
class network_config {
  cisco_interface { 'GigabitEthernet0/0':
    ensure      => present,
    description => 'LAN Interface',
    shutdown    => false,
    ipv4_address => '192.168.1.1/24',
  }
}
```

---

## Chef

| Characteristic | Description |
|---|---|
| Language | Ruby (Recipes/Cookbooks) |
| Agent | Yes (Chef Client) |
| Model | Pull (Chef Client → Chef Server) |
| Developer | Progress (formerly Chef Software) |

**Components:**
- **Chef Server** — stores configurations
- **Chef Client** — agent on managed nodes
- **Workstation** — where developers write recipes
- **Cookbook** — collection of recipes for a single task

---

## Tool Comparison

| Characteristic | Ansible | Puppet | Chef |
|---|---|---|---|
| Agent | No | Yes | Yes |
| Config language | YAML | Puppet DSL | Ruby |
| Model | Push | Pull | Pull |
| Learning curve | Low | Medium | High |
| Network modules | Excellent (cisco.ios, cisco.nxos) | Limited | Limited |
| Popularity for networks | Very high | Medium | Low |

> **💡 Tip:** For the CCNA exam, key facts are: **Ansible = agentless = YAML = push**; **Puppet/Chef = agent-based = pull**. Ansible is the most widely used tool for Cisco network automation.

---

## Terraform

**Terraform** (HashiCorp) — Infrastructure as Code for cloud and on-premises resources.

| Characteristic | Description |
|---|---|
| Language | HCL (HashiCorp Configuration Language) |
| Approach | Declarative (describe the desired end state) |
| Providers | AWS, Azure, GCP, Cisco ACI, VMware, and more |
| Use case | Creating infrastructure (VMs, networks, routers) |

```hcl
resource "cisco-asa_access_rules" "example" {
  interface = "inside"
  action    = "permit"
  source    = "192.168.1.0/24"
  destination = "any"
  protocols = ["tcp"]
}
```

---

## Cisco IOS and Automation

### EEM (Embedded Event Manager)

A built-in IOS tool for automating responses to events:

```bash
# Example: when an interface goes down — send syslog + backup config
Router(config)# event manager applet LINK_DOWN
Router(config-applet)# event syslog pattern "Interface.*down"
Router(config-applet)# action 1.0 syslog msg "Interface went down - alerting"
Router(config-applet)# action 2.0 cli command "enable"
Router(config-applet)# action 3.0 cli command "copy running-config tftp://10.0.0.1/backup.cfg"
```

### TCL Scripting

Cisco IOS supports TCL scripts:

```tcl
# Simple TCL script on IOS
Router# tclsh
Router(tcl)# puts [exec "show version | include IOS"]
```

---

## Resources

| Resource | Description |
|---|---|
| [Ansible for Network Automation — Ansible Docs](https://docs.ansible.com/ansible/latest/network/index.html) | Official Ansible documentation for network automation |
| [RFC 6241 — NETCONF](https://www.rfc-editor.org/rfc/rfc6241) | Network Configuration Protocol: operations, XML, capabilities |
| [RESTCONF — RFC 8040](https://www.rfc-editor.org/rfc/rfc8040) | RESTCONF Protocol: HTTP interface for YANG models |
| [Configuration Management Tools — networklessons.com](https://networklessons.com/cisco/ccna-routing-switching-icnd2-200-105/configuration-management) | Ansible vs Puppet vs Chef: agent-based and agentless approaches |
| [Jeremy's IT Lab — Configuration Management (YouTube)](https://www.youtube.com/watch?v=_k_v_-0TH_k) | Ansible, Puppet, Chef, Terraform, YANG from the Free CCNA series |
| [Cisco DevNet — Network Automation](https://developer.cisco.com/network-automation/) | Cisco DevNet: NETCONF, RESTCONF, YANG, Ansible resources |
