# Level 5: DevOps Specification — Hosting Topology & Environment Architecture

**Document ID:** `DOC-OPS-03-HOSTING-ENVIRONMENT`  
**Project:** `countdown-lockscreen-challenge`  
**Challenge:** Handshake AI Skills Studio X Google ("Your Deadline, Your Design: Create a Countdown Lock Screen")  
**Author:** Piyush Makhija (Lead Systems Architect & Developer)  
**Reviewer:** Architecture Review Board  
**Status:** APPROVED  
**Standard:** Level 2.3 Documentation Governance (Edge CDN & Infrastructure Topology)

---

## 1. Global Edge CDN Infrastructure Topology

The application is hosted on **GitHub Pages**, globally accelerated by Fastly's Anycast Edge CDN:

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

## 2. Network Performance & Compression Protocols

- **HTTP Protocol:** HTTP/2 multiplexing enabled by default, reducing TCP handshake overhead.
- **Transport Security:** Strict TLS 1.3 encryption with ECDHE key exchange and automated Let's Encrypt certificates.
- **Compression Algorithms:** Brotli (`br`) and Gzip fallback; asset payload sizes:
  - HTML + Inline CSS: $\approx 14\text{ KB}$ (Gzipped).
  - Core JavaScript: $\approx 22\text{ KB}$ (Gzipped).
  - Total Transfer Size: $< 40\text{ KB}$, guaranteeing sub-second load over 3G/4G cellular networks.
