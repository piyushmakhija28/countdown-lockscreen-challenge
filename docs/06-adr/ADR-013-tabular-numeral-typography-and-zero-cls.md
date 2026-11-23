# ADR-013: OpenType Tabular Numeral Chronometry and Zero Cumulative Layout Shift (CLS = 0)

**Document ID:** `ADR-013`  
**Project:** `countdown-lockscreen-challenge`  
**Challenge:** Handshake AI Skills Studio X Google ("Your Deadline, Your Design: Create a Countdown Lock Screen")  
**Author:** Piyush Makhija (Lead Systems Architect & Developer)  
**Reviewer:** Architecture Review Board  
**Status:** APPROVED  
**Date:** 2026-11-23  
**Standard:** Level 2.2 Documentation Governance / MADR 3.0  
**Version:** 2.3.5  

---

## 1. Context and Problem Statement
Countdown lock screens update display digits at a frequency of 1Hz ($1000\text{ms}$). In standard proportional web typography, character advance widths vary significantly according to glyph morphology (e.g., digit `'1'` occupies $\approx 0.28\text{em}$ while `'8'` occupies $\approx 0.62\text{em}$). 

When seconds tick from `09` to `08` to `01`, this non-zero width delta ($\Delta W \neq 0$) causes adjacent unit labels (`DAYS`, `HOURS`, `MINUTES`, `SECONDS`) and containers to jitter horizontally every single second. This violates Google Core Web Vitals ($CLS > 0.10$) and creates visual annoyance that destroys cognitive focus during ambient glances.

We must decide how to guarantee zero layout shift ($CLS = 0.000$) across all supported mobile viewports and rendering contexts.

---

## 2. Decision Drivers
- Zero Cumulative Layout Shift ($CLS = 0.000$) during active 1Hz chronometry.
- Pixel-perfect visual stability across both DOM shell and HTML5 Canvas 2D export.
- Universal browser compatibility across Apple Safari, Google Chrome, and Samsung Internet.
- Aesthetic harmony with clean geometric design system (zero digital 7-segment clichés).

---

## 3. Considered Options
- **Option 1:** Proportional Sans with fixed container widths and CSS flex centering.
- **Option 2:** Skeuomorphic 7-segment digital LCD font.
- **Option 3:** OpenType Tabular Numerals (`font-variant-numeric: tabular-nums`) paired with `JetBrains Mono` and asynchronous Font Readiness Gate (`document.fonts.load()`).

---

## 4. Decision Outcome
**Chosen Option:** **Option 3: OpenType Tabular Numerals with JetBrains Mono and Asynchronous Font Loading Gate.**

### Architectural Implementation:
1. **Tabular Numerals via CSS:**
   ```css
   .chronometer-digits {
     font-family: 'JetBrains Mono', monospace;
     font-variant-numeric: tabular-nums;
     font-feature-settings: "tnum" 1;
   }
   ```
2. **Mathematical Invariant:**
   $$\forall g \in \{\text{'0'}, \dots, \text{'9'}\}, \quad w(g) = W_{\text{cell}} = \text{constant} \implies \Delta W \equiv 0 \implies CLS = 0.000$$
3. **Canvas Font Loading Gate (`FontService`):**
   Canvas rendering is locked until `document.fonts.load('700 72px "JetBrains Mono"')` resolves, preventing fallback metric displacement and text clipping.

### Positive Consequences:
- Eliminates horizontal jitter completely ($CLS = 0.000$).
- High visual legibility: JetBrains Mono features dotted zeroes and clear serifs on digit `1`.
- Clean zero-overhead implementation without JavaScript layout recalculation loops.

### Negative Consequences:
- Requires preloading web font assets ($\approx 28\text{ KB}$ WOFF2). Mitigated via local cache-first Service Worker.

---

## 5. Pros and Cons of Options

### Option 1: Proportional Sans with Flex Centering
- *Pros:* Uses existing brand font.
- *Cons:* Fixed-width wrappers cause internal letter spacing to look uneven; subpixel rounding in CSS flex engines still introduces $0.5\text{px}$ rendering vibration on mobile displays.

### Option 2: 7-Segment Digital LCD Font
- *Pros:* Fixed advance widths.
- *Cons:* Visually dated; looks like a 1980s microwave timer; clashes with modern Fresnel acrylic glassmorphism.

---

## 6. Compliance & Validation
- **Governing Specification:** `docs/ui-ux/08-typographic-engineering-and-font-system.md` (`DOC-UI-08`).
- **Test Verification:** `docs/testing/02-test-cases-catalog.md` (`TC-POS-117`).
- **Core Web Vitals:** Verified $CLS = 0.000$ via Lighthouse CI.
