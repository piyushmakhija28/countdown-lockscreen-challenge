# Level 6: Security Specification — STRIDE Threat Model & DREAD Risk Assessment

**Document ID:** `DOC-SEC-01-THREAT-MODEL`  
**Project:** `countdown-lockscreen-challenge`  
**Challenge:** Handshake AI Skills Studio X Google ("Your Deadline, Your Design: Create a Countdown Lock Screen")  
**Author:** Piyush Makhija (Lead Systems Architect & Developer)  
**Reviewer:** Architecture Review Board  
**Status:** APPROVED  
**Standard:** Level 2.2 Documentation Governance (Microsoft STRIDE + DREAD Methodology)

---

## 1. STRIDE Threat Model & Quantitative DREAD Analysis

Every architectural component of the client-side Progressive Web Application is systematically evaluated across the 6 Microsoft STRIDE threat categories, scored quantitatively using the **DREAD framework**:

$$\text{DREAD Risk Score} = \frac{D + R + E + A + D_{\text{isc}}}{5} \quad (\text{Scale } 1\text{ to } 10)$$

Where:
- **D (Damage Potential):** How severe is the harm if exploited?
- **R (Reproducibility):** How easy is it to replicate the exploit?
- **E (Exploitability):** How much technical effort is required?
- **A (Affected Users):** What percentage of users are impacted?
- **D (Discoverability):** How easy is the vulnerability to find?

```
+---------------------------------------------------------------------------------------------------------------+
|                                      STRIDE + DREAD THREAT MODEL MATRIX                                       |
+---+--------------------+------------------------+---+---+---+---+---+-------+--------+------------------------+
| ID| Threat Category    | Threat Description     | D | R | E | A | D | Score | Level  | Mitigation Mechanism   |
+---+--------------------+------------------------+---+---+---+---+---+-------+--------+------------------------+
| T1| **Spoofing**       | Malicious URL hash     | 2 | 4 | 3 | 1 | 2 | 2.4   | LOW    | Strict schema assert   |
|   |                    | crafts fake deadline.  |   |   |   |   |   |       |        | on URL hash parsing.   |
+---+--------------------+------------------------+---+---+---+---+---+-------+--------+------------------------+
| T2| **Tampering**      | Cross-Site Scripting   | 8 | 4 | 3 | 2 | 4 | 4.2   | LOW    | Programmatic TextNode  |
|   |                    | (XSS & SVG breakout).  |   |   |   |   |   |       |        | DOM & strict CSP L3.   |
+---+--------------------+------------------------+---+---+---+---+---+-------+--------+------------------------+
| T3| **Repudiation**    | Dispute of milestone   | 1 | 1 | 1 | 1 | 1 | 1.0   | NEGLIG.| Stateless client; no   |
|   |                    | completion timestamps. |   |   |   |   |   |       |        | legal audit needed.    |
+---+--------------------+------------------------+---+---+---+---+---+-------+--------+------------------------+
| T4| **Info Disclosure**| User goal or Gemini    | 6 | 3 | 2 | 1 | 3 | 3.0   | LOW    | Zero server storage;   |
|   |                    | API key exfiltration.  |   |   |   |   |   |       |        | header-only auth transport|
+---+--------------------+------------------------+---+---+---+---+---+-------+--------+------------------------+
|T4b| **Info Disclosure**| Console Error Log      | 5 | 2 | 2 | 1 | 3 | 2.6   | LOW    | Defensive Console Proxy|
|   |                    | WebIDL key leak.       |   |   |   |   |   |       |        | scrubs all log outputs.|
+---+--------------------+------------------------+---+---+---+---+---+-------+--------+------------------------+
| T5| **Denial of Serv.**| Canvas & Decompress    | 5 | 5 | 3 | 2 | 4 | 3.8   | LOW    | 32KB deflate bomb guard|
|   |                    | OOM attack.            |   |   |   |   |   |       |        | & WebKit 16.7M ceiling.|
+---+--------------------+------------------------+---+---+---+---+---+-------+--------+------------------------+
|T5b| **Denial of Serv.**| Storage Quota Crash    | 4 | 3 | 3 | 1 | 3 | 2.8   | LOW    | ResilientStorage LRU   |
|   |                    | (LocalStorage full).   |   |   |   |   |   |       |        | eviction & degradation.|
+---+--------------------+------------------------+---+---+---+---+---+-------+--------+------------------------+
|T5c| **Denial of Serv.**| SW Cache Flooding via  | 4 | 4 | 3 | 1 | 2 | 2.8   | LOW    | Strip URL search params|
|   |                    | random query params.   |   |   |   |   |   |       |        | before cache matching. |
+---+--------------------+------------------------+---+---+---+---+---+-------+--------+------------------------+
| T6| **Elev. Privilege**| Sandbox escape via     | 7 | 2 | 2 | 1 | 2 | 2.8   | LOW    | No eval(); strict CSP  |
|   |                    | service worker hook.   |   |   |   |   |   |       |        | script-src 'self' only.|
+---+--------------------+------------------------+---+---+---+---+---+-------+--------+------------------------+
```

---

## 2. Threat Mitigation Architecture

- **Tampering (XSS, Prototype Pollution & Font Injection) Defense:** 
  1. All user-supplied goal titles, milestone descriptions, and affirmations are passed through strict Unicode NFKC normalization, Bidi override stripping, and whitelist regex checks (`InputSanitizer`).
  2. The Canvas 2D engine draws text exclusively using `fillText()`, which treats input strictly as raw character sequences, completely immune to DOM injection sinks.
  3. SVG text rendering in `SafeZoneOverlay.js` and complex typography bridges use programmatic `document.createElementNS` and `div.textContent` bindings, never evaluating raw HTML or SVG strings.
  4. URL hash Base64URL decoding validates bit-quantum length constraints ($L \pmod 4 \ne 1$), rejecting truncated payloads with `ERR_HASH_CORRUPT`.
  5. URL hash JSON parsing uses a recursive reviver that discards `__proto__`, `constructor`, and `prototype` keys across all nested levels, hydrating state into `Object.create(null)` dictionaries with frozen records.
  6. Dynamic canvas font construction is enforced via `SafeFontEngine`, preventing CSS injection into `ctx.font` by restricting families to `AUTHORIZED_FAMILIES`.
- **Information Disclosure (API Key Zero-Leakage Invariant):** 
  User-supplied Google Gemini API keys are transmitted exclusively via the `x-goog-api-key` HTTP header, eliminating query parameter leakage in logs. Global unhandled error and rejection interceptors scrub all patterns matching `AIza[0-9A-Za-z-_]{35,40}`.
- **Denial of Service (OOM & Quota Crash) Defense:** 
  1. Decompression of URL payloads is bound by a strict $32\text{ KB}$ ceiling, rejecting decompression bomb payloads.
  2. Canvas allocations are constrained by `AdaptiveBufferAllocator`, guaranteeing that total buffer area never exceeds $16,777,216\text{ pixels}$ ($2^{24}$) and maximum linear dimension never exceeds $4096\text{px}$ on memory-constrained devices.
  3. WebKit `history.replaceState` 100-call quota DoS is mitigated via `TokenBucketHistoryGuard` enforcing a 30-token capacity with 2 tokens/second refill rate, combined with immediate synchronous `sessionStorage` micro-persistence.
