---
title: "AWS SAA — 7.02 ECS, EKS & Fargate"
date: 2026-05-09
draft: true
description: "ECS task definitions, launch types (EC2 vs Fargate), EKS node groups, ECR, service auto scaling, and when to choose each container service — SAA-C03 container deep dive."
tags: ["AWS", "SAA-C03", "ECS", "EKS", "Fargate", "containers"]
categories: ["AWS SAA"]
page_lang: "en"
lang_pair: "/posts/aws/ru/aws-saa-7-02-containers/"
---

## ECS Core Concepts

Amazon ECS (Elastic Container Service) is AWS's native container orchestration platform.

| Concept | Description |
|---|---|
| **Cluster** | Logical grouping of tasks and services; can span AZs |
| **Task Definition** | Blueprint for a container (image, CPU, memory, env vars, volumes, logging, port mappings) |
| **Task** | A running instance of a task definition; ephemeral |
| **Service** | Long-running tasks with desired count; integrates with ALB/NLB |
| **Container Agent** | Runs on each EC2 instance; registers the instance to the cluster |

### Task Placement Strategies (EC2 launch type only)
| Strategy | Behavior |
|---|---|
| `binpack` | Place tasks to maximize utilization; minimize number of active instances |
| `spread` | Place tasks evenly across instances/AZs |
| `random` | Place tasks randomly |

Placement constraints:
- `distinctInstance` — each task on a different EC2 instance
- `memberOf` — tasks placed on instances matching an expression (e.g., instance type)

---

## Launch Types: EC2 vs Fargate

| Feature | EC2 | Fargate |
|---|---|---|
| Instance management | You manage EC2 fleet | AWS manages (serverless) |
| Pricing | EC2 + ECS no cost | Per task vCPU + memory per second |
| Spot support | Yes (EC2 Spot Instances) | Yes (Fargate Spot) |
| GPU support | Yes (G/P instance types) | No |
| SSH to host | Yes | No |
| Visibility into host | Full | None |
| Storage | EBS/EFS attached to EC2 | Ephemeral (20 GB) + EFS for persistent |
| Use case | Large sustained workloads, GPU, custom OS | Serverless, dev/test, variable workloads |

> **📌 Tip:** Fargate doesn't support GPU workloads. Any exam scenario requiring GPU containers → EC2 launch type with G/P instances.

---

## ECS with ALB: Dynamic Port Mapping

On the EC2 launch type, the container can be assigned a **random host port** — ALB target group discovers it dynamically:

```yaml
# Task Definition port mapping (EC2 launch type)
containerPort: 8080
hostPort: 0        # 0 = dynamic port; ALB discovers via ECS API
```

This allows **multiple task copies on the same EC2 host** — useful for bin-packing. On Fargate, each task gets its own ENI, so port mapping is straightforward (containerPort = hostPort).

---

## ECS Service Auto Scaling

ECS Service Auto Scaling uses Application Auto Scaling with three policies:

| Policy | Trigger |
|---|---|
| **Target Tracking** | Keep metric (CPU/memory/ALB requests per target) at a target value |
| **Step Scaling** | Scale by fixed amounts based on CloudWatch alarm thresholds |
| **Scheduled Scaling** | Scale to a specific desired count at a scheduled time |

EC2 cluster capacity: use **EC2 Auto Scaling Group** (or **ECS Cluster Auto Scaling** with Capacity Providers) to add/remove instances as task count changes.

---

## ECS Anywhere

- Run ECS tasks on **on-premises servers** or virtual machines outside AWS
- Register external instances to the ECS cluster using the SSM agent + ECS agent
- AWS manages the control plane; you manage the servers
- Use case: hybrid cloud, data sovereignty, running on existing on-prem hardware

---

## ECR (Elastic Container Registry)

| Feature | Detail |
|---|---|
| Private registry | Per-account, per-region |
| Image scanning | Basic (CVE scan on push) and Enhanced (continuous, powered by Inspector) |
| Lifecycle policies | Automatically delete old/untagged images to control storage costs |
| Cross-region replication | Replicate images to other regions for multi-region deployments |
| Cross-account | Share images across accounts via resource-based policy |
| Encryption | KMS at rest |
| Pull auth | `aws ecr get-login-password` → Docker login |

> **📌 Tip:** ECR stores images; ECS/EKS pulls from ECR. ECR is the AWS-native alternative to Docker Hub. Always use ECR for production images in AWS deployments.

---

## EKS (Elastic Kubernetes Service)

EKS is a **managed Kubernetes control plane** — AWS runs etcd and the API server; you run worker nodes.

### Node Group Types
| Type | Description |
|---|---|
| **Managed Node Group** | AWS provisions/updates EC2 instances; uses Launch Templates; cordon/drain on update |
| **Self-Managed Nodes** | You provision and join EC2 instances manually or via CloudFormation |
| **Fargate Profiles** | Serverless pods — no node management; define namespace/label selectors |

### EKS Anywhere
- Run EKS **on-premises** using bare metal or VMware
- Same Kubernetes API, AWS tools, and control plane model
- Useful for: consistent Kubernetes across hybrid environments, local data processing

### EKS Add-ons
- AWS-managed add-ons: CoreDNS, kube-proxy, Amazon VPC CNI, EBS CSI driver
- Updated independently from the cluster version

---

## App Mesh

- AWS-managed **service mesh** based on Envoy proxy
- Provides: traffic control, retries, timeouts, circuit breakers, mutual TLS between services
- Works with: ECS, EKS, EC2, Lambda
- Use case: microservices needing observability and traffic management without code changes

---

## AWS Copilot

- CLI tool that wraps ECS best practices into simple commands
- `copilot init`, `copilot deploy`, `copilot svc logs`
- Automatically creates: ECS service, task definition, ALB, ECR repo, VPC (if needed)
- Target audience: developers who want ECS without managing infrastructure directly

---

## When to Choose What

| Scenario | Recommended service |
|---|---|
| Simple containerized API, no K8s needed | ECS + Fargate |
| Kubernetes workloads, portability, ecosystem | EKS |
| No instance management, cost per task | Fargate (ECS or EKS) |
| GPU containers for ML inference | ECS EC2 (G/P instance type) |
| On-premises containers managed from AWS | ECS Anywhere / EKS Anywhere |
| Microservices with traffic management | ECS/EKS + App Mesh |
| CI/CD push, simple developer workflow | AWS Copilot |
| Burst/spot container workloads | ECS EC2 with Spot Instances |

---

## Exam Traps Summary

| Trap | Correct answer |
|---|---|
| Fargate supports GPU | False — EC2 launch type required |
| ECS task role = instance role | False — task role is per-task IAM; instance role is for EC2 host |
| EKS managed node group OS control | Limited — AWS manages patching; use self-managed for full control |
| ECR lifecycle policies delete images | Correct — use to control storage costs |
| Dynamic port mapping on Fargate | Not needed — each Fargate task has its own ENI |
| ECS Anywhere needs agents | SSM agent + ECS agent on each external instance |
| Fargate pricing model | Per vCPU + memory per second (not per EC2 instance) |
