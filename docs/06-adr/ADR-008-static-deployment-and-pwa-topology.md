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

### 5.2 Offline Progressive Web App (PWA) Precache Inventory
To ensure flawless offline execution on mobile devices and zero dependency on CDN availability during judging, the Service Worker (`sw.js`) registers a deterministic **Cache-First** strategy using namespaced cache key `countdown-lockscreen-ghpages-v2.0.0` and dynamic relative scope `self.registration.scope`:
- **Core Shell:** `index.html`, `manifest.json`, `favicon.ico`, `assets/icons/*`
- **Stylesheets:** `src/css/main.css`, `src/css/tokens.css`, `src/css/glassmorphism.css`
- **Entry & Config:** `src/js/app.js`, `src/js/config/constants.js`, `src/js/config/themes.js`
- **Core Engine & Ports:** `src/js/core/ports.js`, `src/js/core/LifecycleScope.js`, `src/js/core/StateStore.js`, `src/js/core/DualClockTimeEngine.js`, `src/js/core/MilestoneManager.js`, `src/js/core/UrlStateService.js`, `src/js/core/TokenBucketHistoryGuard.js`, `src/js/core/InputSanitizer.js`
- **Sensory, Worker & Fonts:** `src/js/services/WorkerTickerAdapter.js`, `src/js/services/AudioChimeService.js`, `src/js/services/HapticService.js`, `src/js/services/FontService.js`
- **AI & Fallback:** `src/js/ai/GeminiAiClient.js`, `src/js/ai/GeminiRateLimiter.js`, `src/js/ai/HeuristicGenerator.js`
- **Canvas Subsystem:** `src/js/canvas/CanvasRenderer.js`, `src/js/canvas/AdaptiveBufferAllocator.js`, `src/js/canvas/ResponsiveLayoutEngine.js`, `src/js/canvas/CanvasTextWrapper.js`, `src/js/canvas/ParticleEngine.js`, `src/js/canvas/SafeZoneOverlay.js`
- **Self-Hosted WOFF2 Typography:** `public/fonts/inter-v13-latin-regular.woff2`, `public/fonts/inter-v13-latin-700.woff2`, `public/fonts/jetbrains-mono-v18-latin-700.woff2`

### 5.3 Cache Scoping, Old Version Eviction & Query-Flood Defense
1. **Automated Old Cache Eviction:** During the Service Worker `activate` event, any cache key that does not match `countdown-lockscreen-ghpages-v2.0.0` is deleted via `caches.delete(cacheName)`, guaranteeing atomic version upgrades and zero stale bundle corruption.
2. **Query-Flood Defense:** To prevent malicious or accidental query parameters (e.g. `?fbclid=...`, `?utm_source=...`) from busting the cache or filling quota with duplicate entries, `sw.js` normalizes incoming request URLs via `new URL(request.url)` and strips search parameters before matching against precached assets (`cache.match(cleanUrl)`).
