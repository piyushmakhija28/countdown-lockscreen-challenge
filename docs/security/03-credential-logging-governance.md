# Level 6: Security Specification — Credential & Logging Governance

**Document ID:** `DOC-SEC-03-CREDENTIAL-LOGGING`  
**Project:** `countdown-lockscreen-challenge`  
**Challenge:** Handshake AI Skills Studio X Google ("Your Deadline, Your Design: Create a Countdown Lock Screen")  
**Author:** Piyush Makhija (Lead Systems Architect & Developer)  
**Reviewer:** Architecture Review Board  
**Status:** APPROVED  
**Standard:** Level 2.3 Documentation Governance (Zero-Credential & Zero-PII Standard)

---

## 1. Ephemeral Client-Side API Key Governance

To allow arbitrary users and judges to optionally supply their own Google Gemini API key:
1. **Memory-Only Retention:** The API key is stored strictly in JavaScript runtime closure memory (`GeminiClient`).
2. **Zero Storage Persistence:** The API key is **NEVER** written to `localStorage`, `sessionStorage`, `IndexedDB`, or cookies.
3. **URL Exclusion Invariant:** The API key is **NEVER** serialized into the `#v1=` shareable URL hash.
4. **Console Log Masking:** All console debug interceptors mask API keys matching the regex `AIza[0-9A-Za-z-_]{35}` into `AIza...[REDACTED]`.

---

## 2. Zero-PII Telemetry Policy

Under our Zero-PII policy:
- No user goal titles, deadlines, or personal identifiers are logged.
- Client telemetry is restricted to anonymous performance timings:
  - FCP, LCP, CLS metrics.
  - Canvas render duration.
  - Success/Failure boolean flags for AI generation.
