# ADR-003: State Serialization & Sharing Protocol — Stateless URL Hash vs. Cloud DB

**Status:** APPROVED  
**Date:** 2026-11-22  
**Author:** Piyush Makhija (Lead Systems Architect & Developer)  
**Deciders:** System Architecture & Engineering Review Board  
**Standard:** MADR 3.0 (Markdown Architectural Decision Records)

---

## 1. Context and Problem Statement
Contestants, students, and evaluators must be able to share their configured countdown lock screens via a single URL. We must decide how application state (goal title, target deadline timestamp, milestones, selected theme) is persisted and shared.

---

## 2. Decision Drivers
- **Zero Infrastructure Cost:** Solution must not require ongoing database hosting or server operations.
- **Zero-PII Compliance:** Complete absence of personal data retention to comply with global privacy regimes (GDPR, DPDP 2023).
- **Instant Link Sharing:** Clicking a shared link must immediately hydrate the countdown on any device without account creation.
- **Link Length Feasibility:** URL length must remain strictly within browser safe limits ($L \le 2048\text{ characters}$).

---

## 3. Considered Options
- **Option 1: Centralized Cloud Relational Database (PostgreSQL + REST API)**
- **Option 2: Serverless Key-Value Store (Redis / Upstash KV + Short URLs)**
- **Option 3: Pure Client-Side Stateless URL Hash Base64 Serialization (`#v1=...`)**

---

## 4. Comprehensive Comparison Matrix

```
+---------------------------------------------------------------------------------------------------+
|                                  ADR-003 STATE SERIALIZATION COMPARISON                          |
+--------------------------+--------+-----------------------+-------------------+-------------------+
| Criteria                 | Weight | Option 1: Cloud DB    | Option 2: KV Store| Option 3: URL Hash|
+--------------------------+--------+-----------------------+-------------------+-------------------+
| Infrastructure TCO       | 25%    | 1/5 ($15+/mo hosting) | 2/5 (Tier limits) | 5/5 ($0.00 / mo)  |
| Privacy & Data Security  | 25%    | 2/5 (PII honeypot)    | 2/5 (Cloud leaks) | 5/5 (Zero PII)    |
| Evaluation Friction      | 20%    | 3/5 (Server dep)      | 4/5 (Network hit) | 5/5 (Instant link)|
| URL Length Budget        | 15%    | 5/5 (Short URL)       | 5/5 (Short URL)   | 4/5 (Compressed)  |
| Resilience to Outages    | 15%    | 1/5 (DB down = 500)   | 2/5 (KV outage)   | 5/5 (Unbreakable) |
+--------------------------+--------+-----------------------+-------------------+-------------------+
| Weighted Score           | 100%   | 2.25 / 5.0            | 2.85 / 5.0        | 4.85 / 5.0        |
+--------------------------+--------+-----------------------+-------------------+-------------------+
```

---

## 5. Decision Outcome
**Chosen Option: Option 3 (Pure Client-Side Stateless URL Hash Base64 Serialization).**

### 5.1 Rationale
- State is serialized into a compact JSON schema, converted to UTF-8 bytes, and Base64 URL-safe encoded into `window.location.hash`.
- Total generated URL length is typically between **$280\text{ and } 450\text{ characters}$**, well below the $2048\text{ character}$ ceiling.
- Judges can evaluate any shared countdown link with zero server dependencies.
