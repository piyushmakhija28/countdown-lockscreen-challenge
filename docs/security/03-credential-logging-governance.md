# Level 6: Security Specification — Ephemeral Credential & Zero-PII Telemetry Governance

**Document ID:** `DOC-SEC-03-CREDENTIAL-LOGGING`  
**Project:** `countdown-lockscreen-challenge`  
**Challenge:** Handshake AI Skills Studio X Google ("Your Deadline, Your Design: Create a Countdown Lock Screen")  
**Author:** Piyush Makhija (Lead Systems Architect & Developer)  
**Reviewer:** Architecture Review Board  
**Status:** APPROVED  
**Standard:** Level 2.2 Documentation Governance (Zero-Credential & Zero-PII Standard)

---

## 1. Ephemeral Client-Side Google Gemini API Key Governance

To allow arbitrary users, contestants, and judges to optionally supply their own Google Gemini API key (Bring-Your-Own-Key model) while guaranteeing complete protection against credential leaks, the application implements five architectural invariants:

### 1.1 The Five Credential Security Invariants
1. **Header Transmission Invariant:** The Google Gemini API key is strictly transmitted via the `x-goog-api-key` HTTP request header. It is **strictly forbidden** from being passed as a URL query parameter (`?key=...`), preventing cleartext key leakage in CDN access logs, proxy caches, or browser history.
2. **Private Memory Closure Retention:** The API key is stored exclusively within private lexical closures inside `GeminiAiClient`. It is never attached to the global `window` object or exported to shared modules.
3. **Zero Persistence Invariant:** The API key is **NEVER** serialized or written to `localStorage`, `sessionStorage`, `IndexedDB`, cookies, or Service Worker cache stores. Closing the browser tab completely zeroizes the key from memory.
4. **URL Hash Exclusion Invariant:** The state serializer (`UrlStateService`) strictly filters out credentials. The `#v1=` URL state payload contains only the goal title, deadline timestamp, theme ID, and milestone offsets.
5. **Immediate Input Scavenging:** Upon entry in the settings modal, the input element value is immediately transferred to memory and wiped from the DOM element (`input.value = ''`), preventing credential extraction via browser autofill snapshots or extensions.

### 1.2 Enterprise Secret Redaction Engine

All diagnostics, error boundaries, and telemetry dispatchers route through an automated redaction engine supporting both 35-character and modern 39-to-40-character Google Cloud API keys:

```typescript
/**
 * Scans a string and replaces Google API key patterns with redacted tokens.
 * Supports standard 35-character and modern 39-character keys (AIzaSy...).
 *
 * @param rawText Unsanitized log message, stack trace, or URI
 * @returns Fully sanitized string with zero exposed credentials
 */
export function scrubSecrets(rawText: string): string {
  if (typeof rawText !== 'string') return '';
  return rawText.replace(/AIza[0-9A-Za-z\-_]{35,40}/g, 'AIza...[REDACTED]');
}
```

### 1.3 Defensive Console Proxy & Uncaught Error Interceptors

In browser environments adhering to the W3C WebIDL specification, `ErrorEvent.prototype.message` is defined as a `readonly attribute DOMString message`. In ES strict mode, attempting direct reassignment (`event.message = scrubSecrets(...)`) throws an uncatchable `TypeError: Cannot assign to read only property 'message' of object '#<ErrorEvent>'`.

To reliably scrub all secrets before they reach the browser console or telemetry sinks, `app.js` deploys an **Unforgeable Console Redaction Proxy** coupled with global unhandled listeners:

```typescript
/**
 * Installs unforgeable proxy wrappers over console output methods to scrub sensitive credentials.
 */
export function installDefensiveConsoleProxy(): void {
  const methods: Array<'error' | 'warn' | 'info' | 'log'> = ['error', 'warn', 'info', 'log'];
  for (const method of methods) {
    const original = console[method].bind(console);
    console[method] = (...args: any[]) => {
      const sanitized = args.map((arg) => {
        if (typeof arg === 'string') {
          return scrubSecrets(arg);
        } else if (arg instanceof Error) {
          arg.message = scrubSecrets(arg.message);
          if (arg.stack) arg.stack = scrubSecrets(arg.stack);
          return arg;
        } else if (arg && typeof arg === 'object') {
          try {
            return JSON.parse(scrubSecrets(JSON.stringify(arg)));
          } catch {
            return arg;
          }
        }
        return arg;
      });
      original(...sanitized);
    };
  }

  // Intercept unhandled promise rejections safely
  window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
    if (event.reason instanceof Error) {
      event.reason.message = scrubSecrets(event.reason.message);
      if (event.reason.stack) {
        event.reason.stack = scrubSecrets(event.reason.stack);
      }
    }
  });
}
```

---

## 2. Zero-PII Telemetry & Privacy Governance

The application enforces a **Strict Zero-PII Policy** ensuring user privacy and compliance with global privacy regulations (GDPR, CCPA, and India Digital Personal Data Protection Act):

```
+---------------------------------------------------------------------------------------------------------------+
|                                      TELEMETRY FIELD GOVERNANCE MATRIX                                        |
+--------------------------+-----------------------+------------------------------------------------------------+
| Telemetry Category       | Classification        | Governance Policy & Permitted Data                         |
+--------------------------+-----------------------+------------------------------------------------------------+
| User Goal Titles         | PII / SENSITIVE       | NEVER collected, logged, or transmitted off-device.         |
| Target Deadlines         | PII / SENSITIVE       | NEVER collected, logged, or transmitted off-device.         |
| Milestone Text           | PII / SENSITIVE       | NEVER collected, logged, or transmitted off-device.         |
| Google Gemini API Keys   | SECRET CREDENTIAL     | Strictly memory-only; redacted from all error logs.        |
| Core Web Vitals (CWV)    | ANONYMOUS TECHNICAL   | Aggregated FCP, LCP, CLS, and INP numeric latency values.  |
| Canvas Render Timings    | ANONYMOUS TECHNICAL   | High-DPI wallpaper rasterization duration in milliseconds. |
| AI Generation Metrics    | ANONYMOUS OPERATIONAL | Status boolean (`success`/`failed`) and duration (ms).    |
+--------------------------+-----------------------+------------------------------------------------------------+
```

### 2.1 Beacon Ingress Specifications
When performance metrics are emitted via `navigator.sendBeacon()`, payloads conform to an anonymous schema containing zero user identifiers, zero IP addresses, and zero goal strings:

```json
{
  "timestamp": 1795411200000,
  "metrics": {
    "fcp_ms": 620,
    "lcp_ms": 890,
    "canvas_render_ms": 280,
    "ai_latency_ms": 1450,
    "ai_engine": "gemini_3_8_flash"
  },
  "flags": {
    "is_pwa": true,
    "is_offline": false,
    "theme": "cyber_obsidian"
  }
}
```
