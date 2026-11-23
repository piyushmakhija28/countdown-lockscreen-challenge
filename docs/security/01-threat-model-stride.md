# Level 6: Security Specification — STRIDE Threat Model & DREAD Risk Assessment

**Document ID:** `DOC-SEC-01-THREAT-MODEL`  
**Project:** `countdown-lockscreen-challenge`  
**Challenge:** Handshake AI Skills Studio X Google ("Your Deadline, Your Design: Create a Countdown Lock Screen")  
**Author:** Piyush Makhija (Lead Systems Architect & Developer)  
**Reviewer:** Architecture Review Board  
**Status:** APPROVED  
**Standard:** Level 2.3 Documentation Governance (Microsoft STRIDE + DREAD Methodology)

---

## 1. STRIDE Threat Model & Quantitative DREAD Analysis

Every component of the client-side architecture is evaluated across the 6 Microsoft STRIDE threat categories, scored quantitatively using the **DREAD framework**:

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
| T2| **Tampering**      | Cross-Site Scripting   | 8 | 7 | 6 | 4 | 7 | 6.4   | MEDIUM | DOMPurify sanitization |
|   |                    | (XSS) in goal string.  |   |   |   |   |   |       |        | & CSP Level 3 policy.  |
+---+--------------------+------------------------+---+---+---+---+---+-------+--------+------------------------+
| T3| **Repudiation**    | Dispute of milestone   | 1 | 1 | 1 | 1 | 1 | 1.0   | NEGLIG.| Stateless client; no   |
|   |                    | completion timestamps. |   |   |   |   |   |       |        | legal audit needed.    |
+---+--------------------+------------------------+---+---+---+---+---+-------+--------+------------------------+
| T4| **Info Disclosure**| User goal or Gemini    | 6 | 3 | 2 | 1 | 3 | 3.0   | LOW    | Zero server storage;   |
|   |                    | API key exfiltration.  |   |   |   |   |   |       |        | API key in memory only.|
+---+--------------------+------------------------+---+---+---+---+---+-------+--------+------------------------+
| T5| **Denial of Serv.**| Canvas allocation bomb | 5 | 6 | 4 | 2 | 5 | 4.4   | LOW    | Fixed 1170x2532 bounds;|
|   |                    | (OOM attack).          |   |   |   |   |   |       |        | max milestones = 5.    |
+---+--------------------+------------------------+---+---+---+---+---+-------+--------+------------------------+
| T6| **Elev. Privilege**| Sandbox escape via     | 7 | 2 | 2 | 1 | 2 | 2.8   | LOW    | No eval(); strict CSP  |
|   |                    | service worker hook.   |   |   |   |   |   |       |        | script-src restrictions|
+---+--------------------+------------------------+---+---+---+---+---+-------+--------+------------------------+
```

---

## 2. Threat Mitigation Architecture

- **Tampering (XSS & Prototype Pollution) Defense:** 
  1. All user-supplied goal titles, milestone descriptions, and affirmations are passed through HTML entity encoding before DOM insertion. The Canvas 2D engine draws text using `fillText()`, which treats input strictly as raw character sequences, completely immune to DOM injection.
  2. URL hash JSON parsing strips `__proto__`, `constructor`, and `prototype` keys recursively, storing state in `Object.create(null)` dictionaries to prevent prototype pollution.
- **Information Disclosure (API Key Zero-Leakage Invariant):** 
  User-supplied Google Gemini API keys are held exclusively within private lexical closures. They are strictly prohibited from being serialized into `window.location.hash`, written to `localStorage`, or emitted in diagnostic logs.
- **Denial of Service (OOM & Quota Crash) Defense:** 
  1. Memory allocation is hard-capped: milestone count is bounded ($3 \le N \le 5$) and canvas buffer dimensions are fixed to $2340 \times 5064\text{ pixels}$.
  2. WebKit `history.replaceState` 100-call quota DoS is mitigated via `HistoryQuotaGuard` enforcing a trailing-edge 300ms leaky bucket ($f_{\max} \le 3.33\text{ Hz} < 100 / 30\text{s}$).
