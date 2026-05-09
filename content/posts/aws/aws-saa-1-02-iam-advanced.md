---
title: "AWS SAA — 1.02 IAM Advanced: Organizations, SCPs, Identity Center, Cognito"
date: 2026-05-09
draft: true
description: "AWS Organizations, Service Control Policies, IAM Identity Center (SSO), SAML/OIDC federation, Amazon Cognito User Pools vs Identity Pools, and RAM — complete SAA-C03 coverage."
tags: ["AWS", "SAA-C03", "IAM", "Organizations", "Cognito", "SSO", "RAM"]
categories: ["AWS SAA"]
page_lang: "en"
lang_pair: "/posts/aws/ru/aws-saa-1-02-iam-advanced/"
---

## AWS Organizations

AWS Organizations lets you centrally manage **multiple AWS accounts** under a single hierarchy.

### Structure

```
Root
├── Management Account (master)
├── OU: Production
│   ├── Account: prod-web
│   └── Account: prod-db
├── OU: Development
│   └── Account: dev-sandbox
└── OU: Security
    ├── Account: log-archive
    └── Account: security-tooling
```

| Concept | Description |
|---|---|
| **Root** | Top of the hierarchy; contains all OUs and accounts |
| **Management account** | Creates and manages the organization; billing rolls up here |
| **Member account** | Any account other than the management account |
| **OU (Organizational Unit)** | Logical grouping of accounts; can be nested up to 5 levels |

### Consolidated Billing

All member accounts' costs roll up to the management account. Benefit: **volume discounts** (EC2 RI sharing, S3 usage tiers) are pooled across all accounts.

> **📌 Tip:** The management account is also called the "master account" in older docs. On the exam, both terms refer to the same thing.

---

## Service Control Policies (SCPs)

SCPs are **organizational guardrails** — they limit what IAM policies in member accounts can allow. They do **not** grant permissions.

### How SCPs work

- Applied at Root, OU, or Account level
- **Inherited downward**: an SCP on an OU applies to all child OUs and accounts
- Evaluated **before** identity-based policies
- The **management account is ALWAYS exempt** from SCPs — they never apply to it

### SCP inheritance example

```
Root SCP: Allow all (default FullAWSAccess)
  └── OU: Production  SCP: Deny ec2:TerminateInstances
        └── Account: prod-web  (inherits Deny from OU)
```

### Allowlist vs Denylist strategies

| Strategy | How it works | When to use |
|---|---|---|
| **Denylist** (default) | Attach `FullAWSAccess` to Root; add Deny SCPs lower | Most flexible; deny specific risky actions |
| **Allowlist** | Remove `FullAWSAccess`; explicitly Allow only needed services | High security environments; strict compliance |

```json
// SCP: prevent disabling CloudTrail in any member account
{
  "Version": "2012-10-17",
  "Statement": [{
    "Sid": "DenyCloudTrailDisable",
    "Effect": "Deny",
    "Action": [
      "cloudtrail:StopLogging",
      "cloudtrail:DeleteTrail",
      "cloudtrail:UpdateTrail"
    ],
    "Resource": "*"
  }]
}
```

### What SCPs cannot do

| Cannot | Notes |
|---|---|
| Grant permissions | SCPs are purely restrictive |
| Affect the management account | Management account is always exempt |
| Affect service-linked roles | SLRs bypass SCPs |
| Replace IAM policies | Both must Allow for access to be granted |

> **📌 Tip:** The most-tested SCP trap: even if an SCP allows an action, the IAM policy in the account must also allow it. Both layers must permit the action. Conversely, an SCP Deny blocks even the account root user (except management account root).

---

## IAM Identity Center (formerly AWS SSO)

IAM Identity Center provides **centralized SSO** across all AWS accounts in an Organization, plus third-party SaaS apps.

### Key components

| Component | Description |
|---|---|
| **Identity source** | Where users/groups come from: built-in directory, Active Directory (via AD Connector or AWS Managed AD), or external IdP |
| **Permission set** | Collection of IAM policies that define access in an AWS account |
| **Account assignment** | Links a user/group + permission set to a specific account |
| **AWS access portal** | Self-service web UI where users choose an account and role |

### Permission sets

A permission set is **not** an IAM role — it becomes one when provisioned into an account. Identity Center creates roles like `AWSReservedSSO_<PermissionSetName>_<hash>`.

```yaml
# Example permission set (conceptual)
Name: ReadOnlyAccess
ManagedPolicies:
  - arn:aws:iam::aws:policy/ReadOnlyAccess
SessionDuration: PT8H   # 8 hours
```

### Attribute-Based Access Control (ABAC)

Map user attributes (department, team, costCenter) from the identity source to IAM condition keys. Write one policy that works for all teams:

```json
{
  "Condition": {
    "StringEquals": {
      "aws:ResourceTag/Project": "${aws:PrincipalTag/Project}"
    }
  }
}
```

> **📌 Tip:** The exam favors Identity Center over managing IAM users per account. Any scenario asking "hundreds of accounts, centralized login, single set of credentials" → IAM Identity Center.

---

## SAML 2.0 and OIDC Federation

### SAML 2.0 (corporate IdP → AWS)

Used when an enterprise already has an Identity Provider (Active Directory, Okta, Ping).

```
User → Corporate IdP → SAML assertion → AWS STS:AssumeRoleWithSAML → Temporary credentials
```

**Required setup:**
1. Configure trust between AWS and the IdP (upload IdP metadata)
2. Create an IAM role with a SAML trust policy
3. IdP issues SAML assertion with role ARN and provider ARN attributes

### OIDC (OpenID Connect)

Used for workloads that have an OIDC-compatible identity token (GitHub Actions, Kubernetes IRSA, mobile apps).

```bash
# GitHub Actions — no static credentials needed
- uses: aws-actions/configure-aws-credentials@v4
  with:
    role-to-assume: arn:aws:iam::123456789012:role/GitHubActionsRole
    aws-region: us-east-1
```

| Federation type | When to use |
|---|---|
| SAML 2.0 | Enterprise users, AD/LDAP, existing IdP |
| OIDC | Workload identity, GitHub Actions, EKS pods |
| Identity Center | Best choice when possible; wraps SAML/OIDC internally |
| Cognito | Customer-facing apps with social login |

---

## Amazon Cognito

Cognito provides **authentication and authorization for application users** (not AWS account users).

### User Pools vs Identity Pools

| | **User Pool** | **Identity Pool** |
|---|---|---|
| **Purpose** | User directory; handles sign-up/sign-in | Exchange tokens for temporary AWS credentials |
| **Output** | JWT tokens (ID token, access token, refresh token) | STS credentials (Access Key + Secret + Token) |
| **Handles** | Passwords, MFA, email verification, social login | Mapping authenticated/unauthenticated users to IAM roles |
| **Use case** | "Log in to my app" | "My app users need to call S3/DynamoDB directly" |

### Combined flow (most common)

```
App user → Cognito User Pool (authenticate) → JWT
        → Cognito Identity Pool (exchange JWT) → STS credentials
        → App calls AWS API directly (e.g., upload to S3)
```

### Social identity providers with Cognito

User pools support federation with:
- Google, Facebook, Apple (built-in)
- Any OIDC or SAML provider
- Amazon

### Unauthenticated (guest) access

Identity pools can issue AWS credentials to **unauthenticated** users — useful for anonymous read access to public S3 assets or DynamoDB tables.

> **📌 Tip:** Exam trap: **User Pools authenticate users** (no AWS credentials); **Identity Pools authorize AWS access** (provide credentials). If the question says "mobile app needs to access DynamoDB" → you need both, or just an Identity Pool if using an external IdP. If the question says "add social login to web app" → User Pool.

---

## Resource Access Manager (RAM)

AWS RAM lets you **share resources across AWS accounts** (within or outside an Organization) without duplicating them.

### Shareable resources (commonly tested)

| Resource | Notes |
|---|---|
| VPC Subnets | Share a subnet across accounts in an Org — instances in different accounts share the same VPC |
| Transit Gateway | Share a TGW attachment across accounts |
| Route 53 Resolver rules | Centralize DNS resolution |
| License Manager configurations | Centralize BYOL license tracking |
| AWS Glue Data Catalog | Share metadata across accounts |

### VPC subnet sharing (key scenario)

```
Account A: owns VPC + subnets (resource owner)
Account B: launches EC2 instances into Account A's subnets
           (EC2 billed to Account B; subnet resources in Account A)
```

Benefits: no VPC peering required; security groups in Account B; centralized network management.

> **📌 Tip:** RAM vs VPC Peering: RAM sharing subnets is preferred for Organization-wide workloads — simpler than peering every pair of VPCs. Exam questions about "multiple accounts, same VPC network, no peering overhead" → RAM subnet sharing.

---

## Comparison: Cross-Account Access Patterns

| Pattern | When to use | Mechanism |
|---|---|---|
| IAM Role + AssumeRole | Any cross-account AWS API access | Trust policy + STS |
| RAM | Share infrastructure (VPC, TGW) | Resource sharing, no credentials exchange |
| S3 bucket policy | Grant another account access to S3 | Resource-based policy |
| VPC Peering | Network connectivity between VPCs | Route table + SG rules |
| IAM Identity Center | Humans SSO across many accounts | Permission sets |
| Cognito Identity Pools | App users calling AWS APIs | JWT → STS swap |

---

## Key Exam Traps

| Trap | Correct understanding |
|---|---|
| "SCPs apply to management account" | False — management account is always exempt |
| "SCPs grant permissions like IAM policies" | False — SCPs only restrict; IAM policy must also Allow |
| "SCP on Root applies only to Root" | False — SCPs inherit down through all OUs and accounts |
| "Identity Center replaces IAM" | False — it manages access to AWS accounts; IAM still controls within accounts |
| "Cognito User Pool gives AWS credentials" | False — User Pools give JWT tokens; Identity Pools give STS credentials |
| "RAM copies resources to each account" | False — resources are shared in place; billed to the owner |
| "SAML federation needs IAM users" | False — federated users assume IAM roles; no IAM user required |
| "SLRs are blocked by SCPs" | False — service-linked roles bypass SCPs |
