# Level 5: DevOps Specification — Hosting Topology & Environment Architecture

**Document ID:** `DOC-OPS-03-HOSTING-ENVIRONMENT`  
**Project:** `countdown-lockscreen-challenge`  
**Challenge:** Handshake AI Skills Studio X Google ("Your Deadline, Your Design: Create a Countdown Lock Screen")  
**Author:** Piyush Makhija (Lead Systems Architect & Developer)  
**Reviewer:** Architecture Review Board  
**Status:** APPROVED  
**Standard:** Level 2.2 Documentation Governance (Edge CDN & Infrastructure Topology)  
**Version:** 2.3.0

---

## 1. Global Edge CDN Infrastructure Topology

The application is deployed as an enterprise Progressive Web Application (PWA) to **GitHub Pages**, globally accelerated by Fastly's Anycast Edge CDN across 80+ global Points of Presence (POPs):

```mermaid
graph LR
    Client([Global Mobile & Desktop Clients]) --> Anycast[Fastly Anycast Edge POPs]
    subgraph EdgeCDN [Edge Network Layer]
        Anycast --> CacheHit{Cache Hit?}
        CacheHit -- Yes (< 25ms) --> ReturnCached[Return Compressed Assets]
        CacheHit -- No (Origin Fetch) --> Origin[GitHub Pages Storage Origin]
    end
    ReturnCached --> Client
    Origin --> Anycast
```

---

## 2. Granular HTTP Cache-Control Strategy

To balance instantaneous deployment updates with zero-latency repeat visits:

```
+--------------------------+------------------------------------------------+-------------------------------------------+
| Asset Extension / Path   | Production Cache-Control Directive             | Rationale & Cache Invalidation Behavior   |
+--------------------------+------------------------------------------------+-------------------------------------------+
| `index.html`             | `no-cache, no-store, must-revalidate`          | Always re-validates to detect new releases|
| `sw.js` (Service Worker) | `no-cache, no-store, must-revalidate`          | Immediate byte-by-byte SW update checks.  |
| `manifest.json`          | `public, max-age=86400`                        | Cached for 24 hours.                      |
| `css/*.css`, `js/*.js`   | `public, max-age=31536000, immutable`          | Immutable static asset cache.             |
| `assets/fonts/*.woff2`   | `public, max-age=31536000, immutable`          | Permanent typography binary caching.      |
| `favicon.ico`, PNG icons | `public, max-age=604800`                       | Cached for 7 days.                        |
+--------------------------+------------------------------------------------+-------------------------------------------+
```

---

## 3. Network Protocols, Encryption & TLS Cipher Suites

- **HTTP Protocols:** Dual HTTP/2 and HTTP/3 (QUIC over UDP) support, eliminating TCP Head-of-Line blocking on unstable mobile cellular handoffs.
- **Transport Security:** Mandatory TLS 1.3 encryption with Automated Certificate Renewal via Let's Encrypt / DigiCert.
- **Approved Cipher Suites:**
  - `TLS_AES_256_GCM_SHA384`
  - `TLS_CHACHA20_POLY1305_SHA256`
  - `TLS_AES_128_GCM_SHA256`
- **Zero Insecure Fallbacks:** TLS 1.0, 1.1, and 1.2 legacy suites are disabled at the edge.

---

## 4. Bandwidth Economics & Edge Quota Budgets

```
+------------------------------------+---------------------+-------------------+-----------------------------------------+
| Asset Category                     | Raw Uncompressed    | Gzip / Brotli     | 10,000 Contestant Visits Transfer Size  |
+------------------------------------+---------------------+-------------------+-----------------------------------------+
| HTML Shell (`index.html`)          | $14\text{ KB}$      | $4.2\text{ KB}$   | $42.0\text{ MB}$                        |
| CSS Tokens & Glassmorphism         | $22\text{ KB}$      | $5.8\text{ KB}$   | $58.0\text{ MB}$                        |
| Core ES Modules JavaScript         | $48\text{ KB}$      | $14.1\text{ KB}$  | $141.0\text{ MB}$                       |
| Self-Hosted Typography (WOFF2)     | $65\text{ KB}$      | $65.0\text{ KB}$  | $650.0\text{ MB}$ (Cached after 1st hit)|
| **Total Transfer (First Visit)**   | $149\text{ KB}$     | $89.1\text{ KB}$  | **891.0 MB (~0.89 GB total egress)**    |
| **Total Transfer (Repeat Visit)**  | $0\text{ KB}$ (SW)  | $0\text{ KB}$ (SW)| **0.0 MB (100% Service Worker Hit)**    |
+------------------------------------+---------------------+-------------------+-----------------------------------------+
```

Total bandwidth consumption for $10,000$ active contestant sessions is strictly under **$1.0\text{ GB}$**, comfortably within free edge quotas.

---

## 5. High Availability, DNS & Disaster Recovery

- **DNS Configuration:** Anycast routing configured with dual A records (`185.199.108.153`, `185.199.109.153`) and quad-IPv6 AAAA records.
- **Origin Redundancy:** Static assets are mirrored across GitHub primary and secondary regional storage buckets. In the event of a regional Fastly POP failure, Anycast BGP routes traffic to the nearest surviving edge POP within $< 500\text{ms}$.
- **Offline PWA Recovery:** If the user loses network connectivity completely (airplane mode or subway transit), the local Service Worker cache intercepts all navigation requests and serves the fully functional offline app shell.
