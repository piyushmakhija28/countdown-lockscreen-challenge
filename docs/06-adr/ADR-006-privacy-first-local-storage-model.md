# ADR-006: Privacy-First Zero-Server Local Storage Architecture

**Status:** APPROVED  
**Date:** 2026-11-22  
**Author:** Piyush Makhija (Lead Systems Architect & Developer)  
**Deciders:** System Architecture & Engineering Review Board  
**Standard:** MADR 3.0 (Markdown Architectural Decision Records)

---

## 1. Context and Problem Statement
Users configure personal, academic, and career goals that may contain sensitive private aspirations (e.g., job hunt targets, confidential thesis topics, medical/fitness targets). Standard SaaS countdown applications upload these goals to remote multi-tenant databases, creating data leak risks, compliance liabilities, and user hesitation.

We must decide how to handle user data retention while adhering to strict privacy engineering standards.

---

## 2. Decision Drivers
- **Regulatory Compliance:** Adherence to European Union GDPR (General Data Protection Regulation) and India Digital Personal Data Protection (DPDP) Act 2023.
- **Zero Attack Surface:** Eliminating the possibility of remote database leaks, credential harvesting, or SQL injection.
- **Client Sovereignty:** The user retains complete ownership and control over their data on their own device.

---

## 3. Considered Options
- **Option 1: Cloud Multi-Tenant Database with User Accounts (Firebase / Supabase)**
- **Option 2: Anonymous Server Session Storage (Redis with 7-day TTL)**
- **Option 3: Strict Zero-Server Privacy Architecture (Client `localStorage` + URL Hash Base64)**

---

## 4. Comprehensive Trade-off Matrix

```
+---------------------------------------------------------------------------------------------------+
|                                  ADR-006 PRIVACY ARCHITECTURE COMPARISON                          |
+--------------------------+--------+-----------------------+-------------------+-------------------+
| Criteria                 | Weight | Option 1: Cloud DB    | Option 2: Anon KV | Option 3: Client  |
+--------------------------+--------+-----------------------+-------------------+-------------------+
| Zero Data Leak Risk      | 35%    | 1/5 (Honeypot target) | 2/5 (Server logs) | 5/5 (0 bytes sent)|
| Regulatory Compliance    | 25%    | 2/5 (DPA & consent)   | 3/5 (IP logging)  | 5/5 (Exempt-noPII)|
| Operational Maintenance  | 20%    | 1/5 (Backup, security)| 2/5 (Cluster mgmt)| 5/5 ($0.00 upkeep)|
| User Trust & Transparency| 20%    | 2/5 (Requires trust)  | 3/5 (Partial trust| 5/5 (Verifiable)  |
+--------------------------+--------+-----------------------+-------------------+-------------------+
| Weighted Score           | 100%   | 1.45 / 5.0            | 2.45 / 5.0        | 5.00 / 5.0        |
+--------------------------+--------+-----------------------+-------------------+-------------------+
```

---

## 5. Decision Outcome
**Chosen Option: Option 3 (Strict Zero-Server Privacy Architecture).**

### 5.1 Rationale
- Exactly **0 bytes of personal data or goal titles** are transmitted to any external server.
- Conforms to **Privacy by Design (ISO/IEC 27701)**.
- Local state persistence uses isolated browser `localStorage` namespaced under `countdown_lockscreen_v1`.

### 5.2 Quota Resilience & The 4-Tier Degradation Ladder (`ResilientStorageService`)
When mobile browsers enforce aggressive storage limits (e.g. iOS Safari Private Browsing mode throwing `QuotaExceededError` even on minimal writes):
1. **LRU Eviction Policy:** Prior to raising errors, the storage engine evicts the oldest non-pinned countdown history items from `localStorage`.
2. **Tiered Degradation Ladder:**
   - **Tier 1 (Primary):** `localStorage` (Persistent across browser sessions).
   - **Tier 2 (Session Fallback):** `sessionStorage` (Persists for the lifetime of the active tab).
   - **Tier 3 (In-Memory Heap):** Ephemeral `Map` closure in JS memory (Active until page reload).
   - **Tier 4 (URL Hash Memento):** State serialized to `#v1=` hash in window location (Zero data loss even on total storage block).
