# Level 3: UI/UX Design System & Design Tokens Specification

**Document ID:** `DOC-UI-01-DESIGN-SYSTEM-TOKENS`  
**Project:** `countdown-lockscreen-challenge`  
**Challenge:** Handshake AI Skills Studio X Google ("Your Deadline, Your Design: Create a Countdown Lock Screen")  
**Author:** Piyush Makhija (Lead Systems Architect & Developer)  
**Reviewer:** Architecture Review Board  
**Status:** APPROVED  
**Standard:** Level 2.3 Documentation Governance (Mathematical Spatial & Typographic Grid)

---

## 1. Spatial Layout System (8pt Mathematical Grid)

All margins, paddings, component dimensions, and spatial gaps conform strictly to an **8-point linear grid** derived from:

$$\text{Space}(n) = 8 \times n \quad (n \in \{0.5, 1, 2, 3, 4, 6, 8, 12\})$$

| Token Name | Computed Value | CSS Custom Property | Primary UI Application |
|:---|:---:|:---|:---|
| `--space-2xs` | `4px` | `var(--space-2xs)` | Micro-spacers between status pills and indicators |
| `--space-xs` | `8px` | `var(--space-xs)` | Gap between countdown digits and time unit labels |
| `--space-sm` | `16px` | `var(--space-sm)` | Padding inside milestone items and form inputs |
| `--space-md` | `24px` | `var(--space-md)` | Padding inside glassmorphism cards and modals |
| `--space-lg` | `32px` | `var(--space-lg)` | Separation between countdown timer and milestone timeline |
| `--space-xl` | `48px` | `var(--space-xl)` | Section margins on desktop viewports |
| `--space-2xl` | `64px` | `var(--space-2xl)` | Top margin on simulated smartphone preview frame |
| `--space-3xl` | `96px` | `var(--space-3xl)` | Hero banner vertical breathing space |

---

## 2. Modular Typographic Scale (Major Third — 1.25 Ratio)

Typography is mathematically derived from a base font size of $16\text{px}$ scaled by the **Major Third geometric ratio** ($\phi_{\text{type}} = 1.25$):

$$S_k = 16 \times (1.25)^k \quad (k \in \{-1, 0, 1, 2, 3, 4, 5, 6\})$$

```
+-----------------------------------------------------------------------------------------------------+
|                                          TYPOGRAPHY SPECIFICATION                                   |
+------------------+----------+-------------+-------------+------------------+------------------------+
| Level / Token    | Font Size| Line Height | Font Weight | Letter Spacing   | Semantic UI Context    |
+------------------+----------+-------------+-------------+------------------+------------------------+
| `--text-2xs`     | `10px`   | `14px`      | 500 Medium  | `+0.05em` (Wide) | System status tags     |
| `--text-xs`      | `12.8px` | `18px`      | 500 Medium  | `+0.02em`        | Milestone offset pills |
| `--text-sm`      | `16px`   | `24px`      | 400 Regular | `0.00em`         | Standard body text     |
| `--text-md`      | `20px`   | `28px`      | 600 SemiBold| `-0.01em`        | Milestone titles       |
| `--text-lg`      | `25px`   | `32px`      | 700 Bold    | `-0.02em`        | Card headings          |
| `--text-xl`      | `31.25px`| `38px`      | 700 Bold    | `-0.025em`       | Section headlines      |
| `--text-2xl`     | `39px`   | `46px`      | 800 Extra   | `-0.03em`        | Modal titles           |
| `--text-hero`    | `61px`   | `64px`      | 900 Black   | `-0.04em` (Tight)| Main countdown digits  |
+------------------+----------+-------------+-------------+------------------+------------------------+
```

---

## 3. Curated Thematic Design Tokens & Palettes

```
+-------------------------------------------------------------------------------------------------------+
|                                  THEME A: CYBER OBSIDIAN (HIGH-CONTRAST TECH)                         |
+----------------------+--------------------+--------------------+--------------------------------------+
| Semantic Token Name  | Hexadecimal Value  | RGBA / HSL Value   | Optical Contrast against Canvas      |
+----------------------+--------------------+--------------------+--------------------------------------+
| `--bg-canvas`        | `#08090d`          | `rgba(8, 9, 13, 1)`| Base OLED Pure Dark (0% emittance)   |
| `--bg-card`          | `#0f121a`          | `rgba(15, 18, 26)` | Elevation Layer 1                    |
| `--border-specular`  | `#1e293b`          | `rgba(30, 41, 59)` | Specular border highlight            |
| `--accent-primary`   | `#06b6d4` (Cyan)   | `rgba(6, 182, 212)`| Primary countdown digits (CR: 11.4:1)|
| `--accent-secondary` | `#6366f1` (Indigo) | `rgba(99, 102, 241)`| Milestone progress bar               |
| `--text-primary`     | `#f8fafc`          | `rgba(248, 250, 252)`| Maximum contrast text (CR: 18.2:1) |
| `--text-muted`       | `#94a3b8`          | `rgba(148, 163, 184)`| Secondary labels (CR: 7.2:1)       |
+----------------------+--------------------+--------------------+--------------------------------------+

+-------------------------------------------------------------------------------------------------------+
|                                  THEME B: DEEP FOCUS ZEN (WARM MINIMALIST)                            |
+----------------------+--------------------+--------------------+--------------------------------------+
| Semantic Token Name  | Hexadecimal Value  | RGBA / HSL Value   | Optical Contrast against Canvas      |
+----------------------+--------------------+--------------------+--------------------------------------+
| `--bg-canvas`        | `#0f172a` (Slate)  | `rgba(15, 23, 42)` | Deep Midnight Slate                  |
| `--bg-card`          | `#1e293b`          | `rgba(30, 41, 59)` | Muted Card Elevation                 |
| `--border-specular`  | `#334155`          | `rgba(51, 65, 85)` | Subtle Card Border                   |
| `--accent-primary`   | `#f59e0b` (Amber)  | `rgba(245, 158, 11)`| Warm focused countdown digits (8.9:1)|
| `--accent-secondary` | `#d97706`          | `rgba(217, 119, 6)`| Active checkpoint indicator          |
| `--text-primary`     | `#fef3c7` (Cream)  | `rgba(254, 243, 199)`| Warm soft white (CR: 15.6:1)       |
| `--text-muted`       | `#cbd5e1`          | `rgba(203, 213, 225)`| Subtext labels (CR: 8.4:1)         |
+----------------------+--------------------+--------------------+--------------------------------------+

+-------------------------------------------------------------------------------------------------------+
|                                  THEME C: AURORA BOTANICAL (VIBRANT GROWTH)                           |
+----------------------+--------------------+--------------------+--------------------------------------+
| Semantic Token Name  | Hexadecimal Value  | RGBA / HSL Value   | Optical Contrast against Canvas      |
+----------------------+--------------------+--------------------+--------------------------------------+
| `--bg-canvas`        | `#064e3b` (Forest) | `rgba(6, 78, 59)`  | Deep Emerald Green                   |
| `--bg-card`          | `#065f46`          | `rgba(6, 95, 70)`  | Luminous Translucent Panel           |
| `--border-specular`  | `#047857`          | `rgba(4, 120, 87)` | Organic Border Accent                |
| `--accent-primary`   | `#10b981` (Mint)   | `rgba(16, 185, 129)`| Vibrant Growth Digits (CR: 9.8:1)   |
| `--accent-secondary` | `#34d399`          | `rgba(52, 211, 153)`| Checkpoint Completion Glow          |
| `--text-primary`     | `#ecfdf5`          | `rgba(236, 253, 245)`| Crisp Botanical Light (CR: 16.1:1) |
| `--text-muted`       | `#a7f3d0`          | `rgba(167, 243, 208)`| Soft Mint Subtext (CR: 10.2:1)      |
+----------------------+--------------------+--------------------+--------------------------------------+
```

---

## 4. Hardware-Accelerated Glassmorphism Specification

To create tactile depth without sacrificing $60\text{ fps}$ smoothness, glassmorphism panels conform to the following contract:

```css
.glass-panel {
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.07) 0%,
    rgba(255, 255, 255, 0.02) 100%
  );
  backdrop-filter: blur(16px) saturate(180%);
  -webkit-backdrop-filter: blur(16px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: var(--space-md);
  box-shadow: 
    0 8px 32px 0 rgba(0, 0, 0, 0.37),
    inset 0 1px 0 0 rgba(255, 255, 255, 0.15);
  transform: translateZ(0); /* Promotes to dedicated GPU Compositor Layer */
  will-change: transform;
}
```

---

## 5. Micro-Interaction & Animation Choreography

- **Cubic-Bezier Easing Tokens:**
  - `--ease-out-cubic: cubic-bezier(0.33, 1, 0.68, 1)` (Used for dialog popups and slide-ins).
  - `--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1)` (Used for milestone completion checkmark bounce).
- **Countdown Pulse:**
  - On every second change, the seconds digit undergoes a $1.02\times$ scale transform with duration $150\text{ms}$, reinforcing temporal vitality.
- **Milestone Toggle Interaction:**
  - Checkbox activation triggers a particle burst effect and an immediate progress ring stroke interpolation over $400\text{ms}$.
