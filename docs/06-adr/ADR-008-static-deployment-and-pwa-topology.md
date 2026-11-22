# ADR-008: Edge Static Hosting & Progressive Web App (PWA) Topology

**Status:** APPROVED  
**Date:** 2026-11-22  
**Author:** Piyush Makhija (Lead Systems Architect & Developer)  
**Deciders:** System Architecture & Engineering Review Board  
**Standard:** MADR 3.0 (Markdown Architectural Decision Records)

---

## 1. Context and Problem Statement
Contest rules require a public, accessible deployment URL for evaluation by Handshake and Google judges. The hosting infrastructure must guarantee global low-latency delivery, zero maintenance, and automatic HTTPS security, while enabling full offline PWA installation on mobile devices.

We must decide on the hosting platform and deployment topology.

---

## 2. Decision Drivers
- **Global Edge Latency:** Fast Time-to-First-Byte (TTFB) across North America, Europe, and Asia.
- **Continuous Integration / Continuous Deployment:** Fully automated build and deployment upon `git push` to `main`.
- **Zero Cost & High Reliability:** Zero hosting maintenance overhead; immune to bandwidth overage charges.
- **PWA Service Worker Support:** Proper MIME-type serving and HTTPS headers for Cache-First service workers.

---

## 3. Considered Options
- **Option 1: Containerized Cloud Deployment (AWS ECS / Google Cloud Run)**
- **Option 2: Commercial Jamstack Platform (Vercel / Netlify)**
- **Option 3: GitHub Pages Edge CDN with GitHub Actions CI/CD**

---

## 4. Comprehensive Trade-off Matrix

```
+---------------------------------------------------------------------------------------------------+
|                                  ADR-008 HOSTING TOPOLOGY COMPARISON                             |
+--------------------------+--------+-----------------------+-------------------+-------------------+
| Criteria                 | Weight | Option 1: Cloud Run   | Option 2: Vercel  | Option 3: GH Pages|
+--------------------------+--------+-----------------------+-------------------+-------------------+
| Global Edge TTFB         | 30%    | 3/5 (Regional origin) | 5/5 (Fastly/AWS)  | 5/5 (Fastly CDN)  |
| Deployment Automation    | 25%    | 2/5 (Docker build/push| 5/5 (Git hook)    | 5/5 (GH Actions)  |
| Cost & Overage Immunity  | 25%    | 2/5 (Credit card req) | 3/5 (Bandwidth cap| 5/5 ($0.00 / Free)|
| Repo Single-Source Truth | 20%    | 2/5 (Separate infra)  | 3/5 (Third-party) | 5/5 (Same GitHub) |
+--------------------------+--------+-----------------------+-------------------+-------------------+
| Weighted Score           | 100%   | 2.35 / 5.0            | 4.10 / 5.0        | 5.00 / 5.0        |
+--------------------------+--------+-----------------------+-------------------+-------------------+
```

---

## 5. Decision Outcome
**Chosen Option: Option 3 (GitHub Pages Edge CDN with GitHub Actions CI/CD).**

### 5.1 Rationale
- Direct deployment to `https://piyushmakhija28.github.io/countdown-lockscreen-challenge/`.
- Automated GitHub Actions workflow runs testing, linting, and deploys static assets to `gh-pages` branch upon every commit.
- Served through Fastly's global CDN with native HTTP/2 and TLS 1.3 encryption.
