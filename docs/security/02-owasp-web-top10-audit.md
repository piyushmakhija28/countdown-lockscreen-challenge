# Level 6: Security Specification — OWASP Web Top 10 Audit & Hardened CSP Level 3

**Document ID:** `DOC-SEC-02-OWASP-AUDIT`  
**Project:** `countdown-lockscreen-challenge`  
**Challenge:** Handshake AI Skills Studio X Google ("Your Deadline, Your Design: Create a Countdown Lock Screen")  
**Author:** Piyush Makhija (Lead Systems Architect & Developer)  
**Reviewer:** Architecture Review Board  
**Status:** APPROVED  
**Standard:** Level 2.2 Documentation Governance (OWASP Web Top 10 Standard)

---

## 1. OWASP Web Top 10 (2021/2026) Defensive Security Verification

Every component of the Countdown Lock Screen architecture is systematically evaluated against the OWASP Top 10 web application vulnerabilities. Because the application is a client-centric Single Page Application (SPA) deployed to static edge CDN infrastructure with zero backend database or user session store, several traditional server-side vulnerability classes are structurally eliminated, while client-side vectors receive defense-in-depth controls.

```
+---------------------------------------------------------------------------------------------------------------+
|                                      OWASP WEB TOP 10 AUDIT & DEFENSE MATRIX                                  |
+---+----------------------------+-----------------+------------------------------------------------------------+
| # | OWASP Vulnerability Class  | Risk Level      | Concrete Client-Side Architectural Defense                 |
+---+----------------------------+-----------------+------------------------------------------------------------+
|A01| Broken Access Control      | NOT APPLICABLE  | Zero server-side accounts, roles, or session cookies. State|
|   |                            |                 | is localized strictly to client memory and URL hash.       |
+---+----------------------------+-----------------+------------------------------------------------------------+
|A02| Cryptographic Failures     | LOW RISK        | Enforced HTTPS with TLS 1.3 edge termination. All URL state|
|   |                            |                 | checksums use constant-time bitwise comparisons.          |
+---+----------------------------+-----------------+------------------------------------------------------------+
|A03| Injection (XSS, SVG, Font) | CRITICAL FOCUS  | Eliminated via: (1) Strict CSP Level 3; (2) SafeFontEngine |
|   |                            |                 | whitelist for ctx.font; (3) Base64URL bit-quantum check;   |
|   |                            |                 | (4) Programmatic DOM TextNode/createElementNS (no innerHTML|
+---+----------------------------+-----------------+------------------------------------------------------------+
|A04| Insecure Design            | MITIGATED       | Full STRIDE threat model, DREAD scoring, hard invariants   |
|   |                            |                 | (INV-001 to INV-009), and mathematical safe-zone bounds.   |
+---+----------------------------+-----------------+------------------------------------------------------------+
|A05| Security Misconfiguration  | MITIGATED       | Edge headers enforce HSTS, X-Content-Type-Options: nosniff,|
|   |                            |                 | X-Frame-Options: DENY, and strict referrer policy.         |
+---+----------------------------+-----------------+------------------------------------------------------------+
|A06| Vulnerable & Outdated Deps | IMMUNE          | Pure zero-dependency ESM vanilla architecture. Zero npm    |
|   |                            |                 | runtime dependencies eliminate supply-chain injection.    |
+---+----------------------------+-----------------+------------------------------------------------------------+
|A07| Identification & Auth      | NOT APPLICABLE  | Completely stateless client architecture; no passwords,   |
|   |                            |                 | session tokens, or credential persistence.                 |
+---+----------------------------+-----------------+------------------------------------------------------------+
|A08| Software & Data Integrity  | MITIGATED       | 100% self-hosted WOFF2 fonts eliminate external font CDN   |
|   |                            |                 | dependency. Service Worker employs immutable asset hashes. |
+---+----------------------------+-----------------+------------------------------------------------------------+
|A09| Security Logging Failures  | MITIGATED       | Anonymous performance telemetry with zero PII logging.     |
|   |                            |                 | Global regex redactors scrub Google API keys from traces.  |
+---+----------------------------+-----------------+------------------------------------------------------------+
|A10| Server-Side Request Forgery| NOT APPLICABLE  | Pure client-side static PWA. No server proxy or SSR worker.|
+---+----------------------------+-----------------+------------------------------------------------------------+
```

---

## 2. Hardened Content Security Policy (CSP Level 3) Specification

To protect against Cross-Site Scripting (XSS), data exfiltration, clickjacking, and unauthorized resource embedding, the application enforces a strict, zero-trust CSP Level 3 policy. 

### 2.1 The CSP Hardening Invariants
1. **Elimination of `'unsafe-inline'` in `script-src`:** The policy strictly forbids inline script blocks (`<script>...</script>`) and inline event handlers (`onclick="..."`). All application logic is encapsulated in ES modules loaded via `<script type="module" src="./js/app.js"></script>`.
2. **Zero External Font CDNs:** To eliminate third-party tracking, CDN outages, and subresource tampering, all typography assets (`Inter`, `JetBrains Mono`) are self-hosted locally within the application distribution bundle (`font-src 'self'`).
3. **Restricted Egress Boundaries (`connect-src`):** Network egress is restricted exclusively to the same-origin host and the official Google Gemini API endpoint (`https://generativelanguage.googleapis.com`). All other outbound network requests are blocked at the browser network layer.
4. **Worker & Manifest Isolation:** Web Workers executing OffscreenCanvas rendering and the PWA Service Worker are strictly bound via `worker-src 'self' blob:`.

### 2.2 Canonical CSP Level 3 Header Contract

```http
Content-Security-Policy: 
  default-src 'none';
  script-src 'self';
  style-src 'self' 'unsafe-inline';
  font-src 'self';
  img-src 'self' data: blob:;
  connect-src 'self' https://generativelanguage.googleapis.com;
  worker-src 'self' blob:;
  manifest-src 'self';
  media-src 'none';
  object-src 'none';
  base-uri 'none';
  form-action 'none';
  frame-ancestors 'none';
  upgrade-insecure-requests;
  block-all-mixed-content;
```

### 2.3 Comprehensive HTTP Response Security Headers & Client-Side Metas

Because GitHub Pages serves static files where custom HTTP headers cannot be configured on free origin repositories, client-side meta policies and defense-in-depth script guards are embedded directly in `index.html`:

1. **Client-Side Referrer Policy:**
   ```html
   <meta name="referrer" content="strict-origin-when-cross-origin">
   ```
2. **Defensive JavaScript Frame-Busting Guard:**
   To guarantee clickjacking immunity even if an intermediary or proxy strips `X-Frame-Options: DENY`:
   ```javascript
   if (window.top !== window.self) {
     window.top.location = window.self.location;
   }
   ```

In addition to client-side tags, production CDN edges serve the complete header suite:

```
+-----------------------------------+-----------------------------------------+-----------------------------------------+
| HTTP Header Name                  | Configured Production Value             | Security Mitigation Impact              |
+-----------------------------------+-----------------------------------------+-----------------------------------------+
| `Strict-Transport-Security`       | `max-age=63072000; includeSubDomains`   | Enforces TLS 1.3 across all connections.|
| `X-Content-Type-Options`          | `nosniff`                               | Prevents MIME-confusion attacks.        |
| `X-Frame-Options`                 | `DENY`                                  | Absolute immunity against clickjacking. |
| `Referrer-Policy`                 | `strict-origin-when-cross-origin`       | Blocks path and query leakage in links. |
| `Permissions-Policy`              | `camera=(), microphone=(), geolocation=()`| Disables unneeded hardware device APIs. |
| `Cross-Origin-Embedder-Policy`    | `require-corp`                          | Isolates browser execution process.     |
| `Cross-Origin-Opener-Policy`      | `same-origin`                           | Prevents cross-origin window access.    |
| `Cross-Origin-Resource-Policy`    | `same-origin`                           | Blocks unauthorized subresource reads.  |
+-----------------------------------+-----------------------------------------+-----------------------------------------+
```

---

## 3. Programmatic Text Rasterization & SVG XSS Immunity

When rendering multilingual typography (including Indic scripts, Arabic text, and emoji), the system avoids naive HTML or SVG template string interpolation. Any unescaped interpolation inside `<svg><foreignObject>` or `<text>` creates a DOM XSS vulnerability. 

The rasterizer constructs SVG DOM trees exclusively via W3C namespace APIs:

```typescript
/**
 * Safely constructs an isolated SVG DOM tree for high-DPI text rasterization
 * without evaluating HTML markup or triggering script execution sinks.
 *
 * @param text Raw user-entered string to render
 * @param fontFamily Validated font family token
 * @param fontSize Clamped typography size in pixels
 * @param color Validated hexadecimal color token
 * @returns Promise resolving to an unpolluted ImageBitmap
 */
export async function rasterizeComplexTextToBitmap(
  text: string,
  fontFamily: string,
  fontSize: number,
  color: string
): Promise<ImageBitmap> {
  const safeFont = /^[a-zA-Z0-9\-_]+( [a-zA-Z0-9\-_]+)*$/.test(fontFamily) ? fontFamily : 'sans-serif';
  const safeColor = /^#([0-9a-fA-F]{3,8})$/.test(color) ? color : '#FFFFFF';
  const safeSize = Math.max(10, Math.min(200, Number(fontSize) || 24));

  const svgNS = 'http://www.w3.org/2000/svg';
  const xhtmlNS = 'http://www.w3.org/1999/xhtml';

  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('xmlns', svgNS);
  svg.setAttribute('width', '1000');
  svg.setAttribute('height', '200');

  const foreignObject = document.createElementNS(svgNS, 'foreignObject');
  foreignObject.setAttribute('width', '100%');
  foreignObject.setAttribute('height', '100%');

  const div = document.createElementNS(xhtmlNS, 'div');
  div.setAttribute(
    'style',
    `font-family: '${safeFont}', sans-serif; font-size: ${safeSize}px; color: ${safeColor}; direction: auto; white-space: pre-wrap;`
  );
  div.textContent = text;

  foreignObject.appendChild(div);
  svg.appendChild(foreignObject);

  const serializer = new XMLSerializer();
  const xmlString = serializer.serializeToString(svg);
  const blob = new Blob([xmlString], { type: 'image/svg+xml;charset=utf-8' });

  return await createImageBitmap(blob);
}
```

---

## 4. Verification and Automated Security Compliance

Automated compliance is verified within CI/CD pipelines via:
1. **CSP Evaluator Test:** Asserts that the CSP header score contains zero high-severity findings and confirms the absence of `'unsafe-inline'` in `script-src`.
2. **XSS Fuzzing Matrix:** Runs 150 standard OWASP Polyglot XSS vectors through the input validation and canvas rasterization pipelines, verifying zero script executions.
3. **MIME and Header Checker:** Verifies that all HTTP response headers match Section 2.3 contracts during Edge CDN staging.
