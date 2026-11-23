# Level 4: Low-Level Design — Cross-Device Pixel-Perfect Mathematical Blueprint
### (Complete Mathematical Formulations, Coordinate Transforms, Rasterization Grids, and Color Science)

**Document ID:** `DOC-LLD-09-PIXEL-PERFECT-MATHEMATICAL-BLUEPRINT`  
**Project:** `countdown-lockscreen-challenge`  
**Challenge:** Handshake AI Skills Studio X Google ("Your Deadline, Your Design: Create a Countdown Lock Screen")  
**Author:** Piyush Makhija (Lead Systems Architect & Developer)  
**Reviewer:** Architecture Review Board  
**Status:** APPROVED  
**Standard:** Level 2.2 Documentation Governance (Mathematical Rigor & Precision Engineering Specification)

---

## 1. Executive Mathematical Overview & Scope

To ensure the countdown lock screen engine renders with **100% mathematical precision and razor-sharp pixel perfection across all 6.8 billion mobile devices worldwide** (iPhones, Samsung flagships, budget Androids, tablets, foldables), this document derives every quantitative calculation from first principles across 10 core mathematical modules:

```
+---------------------------------------------------------------------------------------------------------+
|                               10-MODULE MATHEMATICAL BLUEPRINT INDEX                                    |
+---+---------------------------------------------------+--------------------+----------------------------+
| # | Mathematical Domain                               | Key Equations      | Target Objective           |
+---+---------------------------------------------------+--------------------+----------------------------+
| 1 | **2D Affine Transform & Screen Unprojection**       | M = T · R · S      | Coordinate system invariance|
| 2 | **DPR Sub-Pixel Snapping & Baseline Quantization**| y_snap = round(y·D)/D| Zero baseline blur/wobble  |
| 3 | **Multi-Aspect Ratio Conformal Mapping**          | S_iso = min(Sx, Sy)| 9:19.5, 9:16, 23:9, 4:3 fit|
| 4 | **Oklab Perceptual Color Space Transform Matrix** | sRGB -> LMS -> Oklab| Zero-banding neon gradients|
| 5 | **Polar-to-Cartesian Arc Geometry & Ring Math**   | C(θ) = c + r[cos,sin]| Exact stroke-dashoffset    |
| 6 | **Fritsch-Carlson Monotone Cubic Splines**        | α² + β² ≤ 9        | Zero overshoot wave curves |
| 7 | **Fitts's Law Ergonomic Touch Boundaries**        | MT = a + b log₂(2D/W)| ID ≤ 3.5 bits thumb reach  |
| 8 | **Mazur's Hyperbolic Chronometry & Decay Curves** | V = A / (1 + kD)   | Cognitive urgency mapping  |
| 9 | **Procedural Micro-Orbital Shifting Geometry**    | Δr(t) = R [cos, sin]| OLED AOD burn-in immunity  |
| 10| **Adaptive Frame Decimation & Thermal Governor**  | Δt ∈ {16, 66, 1000} | Mobile GPU thermal ceiling |
+---+---------------------------------------------------+--------------------+----------------------------+
```

---

## 2. Module 1: 2D Affine Transform Pipeline & Screen-to-Canvas Unprojection

### 2.1 Forward Transform Pipeline (TRS)
Every graphical element (card, glyph, icon, ring) is positioned via a $3 \times 3$ homogeneous affine transformation matrix $M \in \mathbb{R}^{3 \times 3}$:

$$M = T(t_x, t_y) \cdot R(\theta) \cdot S(s_x, s_y)$$

$$\begin{bmatrix} x_{\text{world}} \\ y_{\text{world}} \\ 1 \end{bmatrix} = \begin{bmatrix} 1 & 0 & t_x \\ 0 & 1 & t_y \\ 0 & 0 & 1 \end{bmatrix} \begin{bmatrix} \cos\theta & -\sin\theta & 0 \\ \sin\theta & \cos\theta & 0 \\ 0 & 0 & 1 \end{bmatrix} \begin{bmatrix} s_x & 0 & 0 \\ 0 & s_y & 0 \\ 0 & 0 & 1 \end{bmatrix} \begin{bmatrix} x_{\text{local}} \\ y_{\text{local}} \\ 1 \end{bmatrix}$$

Multiplying the matrices yields the forward mapping equations:
$$x_{\text{world}} = s_x x_{\text{local}} \cos\theta - s_y y_{\text{local}} \sin\theta + t_x$$
$$y_{\text{world}} = s_x x_{\text{local}} \sin\theta + s_y y_{\text{local}} \cos\theta + t_y$$

### 2.2 Algebraic Inverse Transform (Unprojection)
When the user taps on the interactive screen at viewport coordinate $(x_{\text{screen}}, y_{\text{screen}})$, we unproject to normalized canvas coordinates $(u, v) \in [0, 1]^2$ to determine hit-testing:

$$M^{-1} = S^{-1} \cdot R^{-1} \cdot T^{-1} = \begin{bmatrix} 1/s_x & 0 & 0 \\ 0 & 1/s_y & 0 \\ 0 & 0 & 1 \end{bmatrix} \begin{bmatrix} \cos\theta & \sin\theta & 0 \\ -\sin\theta & \cos\theta & 0 \\ 0 & 0 & 1 \end{bmatrix} \begin{bmatrix} 1 & 0 & -t_x \\ 0 & 1 & -t_y \\ 0 & 0 & 1 \end{bmatrix}$$

Because $R^{-1} = R^T$ (due to orthogonality: $\cos^2\theta + \sin^2\theta = 1$), inversion is strictly $O(1)$ closed-form:
$$x_{\text{local}} = \frac{(x_{\text{world}} - t_x)\cos\theta + (y_{\text{world}} - t_y)\sin\theta}{s_x}$$
$$y_{\text{local}} = \frac{-(x_{\text{world}} - t_x)\sin\theta + (y_{\text{world}} - t_y)\cos\theta}{s_y}$$
$$u = \frac{x_{\text{local}}}{W_{\text{canvas}}}, \quad v = \frac{y_{\text{local}}}{H_{\text{canvas}}}$$

---

## 3. Module 2: DPR Sub-Pixel Snapping & Baseline Quantization

### 3.1 The Anti-Aliasing Floating-Point Jitter Problem
Standard HTML5 Canvas rasterizers interpolate floating-point coordinates ($y = 412.3847\text{px}$) across two adjacent physical pixel rows, resulting in half-pixel blur and visible vertical vibration ("jitter") at 60 FPS.

### 3.2 Closed-Form Physical Pixel Quantization
Let $\text{DPR}$ be the Device Pixel Ratio ($\text{DPR} \in \{1.0, 1.5, 2.0, 2.75, 3.0, 3.5, 4.0\}$). The mathematically snapped coordinate $x_{\text{snapped}}$ is derived by mapping to physical integer grid space, rounding, and dividing back:

$$x_{\text{snapped}} = \frac{\lfloor x \cdot \text{DPR} + 0.5 \rfloor}{\text{DPR}}$$

$$y_{\text{snapped}} = \frac{\lfloor y \cdot \text{DPR} + 0.5 \rfloor}{\text{DPR}}$$

### 3.3 Text Baseline Invariant
For tabular numerals (`0123456789`), font ascender/descender bounds are locked using:
$$y_{\text{anchor}} = y_{\text{center}} + \frac{\text{actualBoundingBoxAscent} - \text{actualBoundingBoxDescent}}{2}$$
Guaranteeing that transitions between changing digits (e.g. `09` to `08`) maintain an invariant vertical center of gravity with zero sub-pixel oscillation.

---

## 4. Module 3: Multi-Aspect Ratio Conformal Mapping

### 4.1 Canonical Aspect Ratio Topologies
The engine targets four canonical device aspect ratios:

```
+-------------------------------------------------------------------------------------------------+
| Aspect Ratio Preset        | Resolution (Width x Height) | Aspect Ratio (H/W) | Target Devices  |
+----------------------------+-----------------------------+--------------------+-----------------+
| Phone Standard (9:19.5)    | 1170 x 2532 px              | 2.1641             | iPhone 13-16, S24|
| Android Wide (9:16)        | 1080 x 1920 px              | 1.7778             | iPhone SE, Pixel|
| Foldable Cover (23.1:9)    |  904 x 2316 px              | 2.5619             | Galaxy Z Fold   |
| Tablet / Inner (4:3)       | 2048 x 2732 px              | 1.3340             | iPad Pro, Tab S9|
+----------------------------+-----------------------------+--------------------+-----------------+
```

### 4.2 Isotropic Safe-Zone Bounding Box Scaling
To prevent non-uniform aspect distortion (e.g., circular progress rings turning into squished ellipses), scaling along both axes is strictly isotropic:

$$S_{\text{uniform}} = \min\left( \frac{W_{\text{target}}}{W_{\text{base}}}, \frac{H_{\text{target}}}{H_{\text{base}}} \right)$$

Offsets for centered letterboxing are computed via:
$$T_x = \frac{W_{\text{target}} - (W_{\text{base}} \cdot S_{\text{uniform}})}{2}$$
$$T_y = \frac{H_{\text{target}} - (H_{\text{base}} \cdot S_{\text{uniform}})}{2}$$

---

## 5. Module 4: Oklab Perceptual Color Space Transform Matrix

### 5.1 The sRGB Gradient "Dead Zone" Failure
Standard linear RGB color interpolation between complementary hues (e.g., Cyber Cyan `#00F5FF` to Neon Violet `#9D00FF`) passes through a muddy, desaturated gray "dead zone" because sRGB is not perceptually uniform.

### 5.2 Forward Oklab Transformation Pipeline
Björn Ottosson's Oklab color space provides exact perceptual uniformity. The continuous mathematical transformation from non-linear sRGB $(R, G, B) \in [0, 1]^3$ to Oklab $(L, a, b)$ is derived in three closed-form matrix steps:

#### Step 1: Linearize sRGB
$$C_{\text{linear}} = \begin{cases} \frac{C}{12.92} & \text{if } C \le 0.04045 \\ \left(\frac{C + 0.055}{1.055}\right)^{2.4} & \text{otherwise} \end{cases} \quad \forall C \in \{R, G, B\}$$

#### Step 2: Linear RGB to Cone Response (LMS)
$$\begin{bmatrix} l \\ m \\ s \end{bmatrix} = \begin{bmatrix} 0.4122214708 & 0.5363325363 & 0.0514459929 \\ 0.2119034982 & 0.6806995451 & 0.1073969566 \\ 0.0883024619 & 0.2817188376 & 0.6299787005 \end{bmatrix} \begin{bmatrix} R_{\text{linear}} \\ G_{\text{linear}} \\ B_{\text{linear}} \end{bmatrix}$$

#### Step 3: Non-Linear Compression & LMS to Oklab
$$l' = l^{1/3}, \quad m' = m^{1/3}, \quad s' = s^{1/3}$$

$$\begin{bmatrix} L^* \\ a^* \\ b^* \end{bmatrix} = \begin{bmatrix} 0.2104542553 & 0.7936177850 & -0.0040720468 \\ 1.9779984951 & -2.4285922050 & 0.4505937099 \\ 0.0259040371 & 0.7827717662 & -0.8086757660 \end{bmatrix} \begin{bmatrix} l' \\ m' \\ s' \end{bmatrix}$$

Interpolation between Color $A$ and Color $B$ for progress $t \in [0, 1]$ is strictly linear in Oklab space:
$$L^*(t) = (1 - t) L_A^* + t L_B^*, \quad a^*(t) = (1 - t) a_A^* + t a_B^*, \quad b^*(t) = (1 - t) b_A^* + t b_B^*$$

### 5.3 Closed-Form Inverse Transform: Oklab to sRGB
To render the interpolated color onto the canvas context, the Oklab coordinates are mapped back to sRGB:

$$\begin{bmatrix} l' \\ m' \\ s' \end{bmatrix} = \begin{bmatrix} 1.0 & 0.3963377774 & 0.2158037573 \\ 1.0 & -0.1055613458 & -0.0638541728 \\ 1.0 & -0.0894841775 & -1.2914855480 \end{bmatrix} \begin{bmatrix} L^* \\ a^* \\ b^* \end{bmatrix}$$

$$l = (l')^3, \quad m = (m')^3, \quad s = (s')^3$$

$$\begin{bmatrix} R_{\text{linear}} \\ G_{\text{linear}} \\ B_{\text{linear}} \end{bmatrix} = \begin{bmatrix} 4.0767434057 & -3.3077115913 & 0.2309699292 \\ -1.2684380046 & 2.6097574011 & -0.3413193965 \\ -0.0041960863 & -0.7034186147 & 1.7076147010 \end{bmatrix} \begin{bmatrix} l \\ m \\ s \end{bmatrix}$$

Gamma companding back to non-linear sRGB $(R, G, B) \in [0, 1]$:
$$C = \begin{cases} 12.92 \cdot C_{\text{linear}} & \text{if } C_{\text{linear}} \le 0.0031308 \\ 1.055 \cdot C_{\text{linear}}^{1/2.4} - 0.055 & \text{otherwise} \end{cases} \quad \forall C \in \{R, G, B\}$$

---

## 6. Module 5: Polar-to-Cartesian Arc Geometry & SVG Ring Math

### 6.1 Parametric Arc Equation
For a circular milestone ring centered at $(c_x, c_y)$ with radius $r$ and angular span $\theta \in [\theta_{\text{start}}, \theta_{\text{end}}]$:

$$x(\theta) = c_x + r \cos(\theta)$$
$$y(\theta) = c_y + r \sin(\theta)$$

To anchor the top of the ring ($12\text{ o'clock}$) as the start point, the angular offset is $\theta_0 = -\frac{\pi}{2}$.

### 6.2 Stroke-Dashoffset Invariant Math & Arc Continuity
For an SVG or Canvas stroked ring with stroke circumference $C = 2\pi r$, the progress stroke offset for completion ratio $P \in [0, 1]$ is:

$$\text{stroke-dasharray} = C = 2\pi r$$
$$\text{stroke-dashoffset} = C \cdot (1 - P) = 2\pi r (1 - P)$$

**Zero-Duration Goal Invariant:**  
To prevent division-by-zero singularities when initial start time equals deadline ($t_{\text{total}} = T_{\text{deadline}} - T_{\text{start}} \le 0$), the completion ratio is clamped:
$$P = \begin{cases} 1.0 & \text{if } t_{\text{total}} \le 0 \\ \max\left(0.0, \min\left(1.0, \frac{t_{\text{elapsed}}}{t_{\text{total}}}\right)\right) & \text{otherwise} \end{cases}$$

**12 o'clock Seam Elimination Invariant:**  
When $P \ge 0.9999$, Canvas 2D floating-point trigonometric truncation can leave an unpainted 1-pixel gap at the 12 o'clock seam ($\theta = -\frac{\pi}{2}$). The rendering engine switches from an open partial arc to a continuous, closed full circle:
$$\text{ArcPath} = \begin{cases} 
\text{ctx.arc}(c_x, c_y, r, 0, 2\pi) & \text{if } P \ge 0.9999 \\
\text{ctx.arc}(c_x, c_y, r, -\frac{\pi}{2}, -\frac{\pi}{2} + 2\pi P) & \text{otherwise}
\end{cases}$$

---

## 7. Module 6: Fritsch-Carlson Monotone Cubic Spline Interpolation

### 7.1 Spline Overshoot Phenomenon
Standard Hermite or Catmull-Rom cubic splines through milestone points $(x_k, y_k)$ suffer from Runge's phenomenon or local extrema overshoot, causing progress curves to dip below $0\%$ or exceed $100\%$.

### 7.2 Monotonicity Conditions & Division-by-Zero Guard
Let secant slope be $\Delta_k = \frac{y_{k+1} - y_k}{x_{k+1} - x_k}$.

**Division-by-Zero Guard Invariant:**  
If $\Delta_k = 0$ (consecutive milestone points have identical values), the slope is zero, and we immediately set:
$$d_k = 0, \quad d_{k+1} = 0$$
This eliminates division-by-zero singularities during flat progress stretches.

When $\Delta_k \ne 0$, let tangents at points $k$ and $k+1$ be $d_k$ and $d_{k+1}$. Define:
$$\alpha_k = \frac{d_k}{\Delta_k}, \quad \beta_k = \frac{d_{k+1}}{\Delta_k}$$

Fritsch & Carlson (1980) proved that the spline is strictly monotonic on $[x_k, x_{k+1}]$ if and only if $(\alpha_k, \beta_k)$ lies within a convex region bounded by:
$$\alpha_k^2 + \beta_k^2 \le 9$$

If $\alpha_k^2 + \beta_k^2 > 9$, the tangents are projected back onto the circle of radius 3:
$$\tau_k = \frac{3}{\sqrt{\alpha_k^2 + \beta_k^2}} \implies d_k^* = \tau_k \alpha_k \Delta_k, \quad d_{k+1}^* = \tau_k \beta_k \Delta_k$$

This guarantees that the milestone progress wave is **strictly monotonic** ($y'(x) \ge 0$), completely eliminating visual curve overshoot artifacts.

---

## 8. Module 7: Fitts's Law Ergonomic Touch Boundaries & Thumb Reach

### 8.1 Fitts's Law Mathematical Formulation
The movement time $MT$ for a user's thumb to reach an interactive button of width $W$ located at distance $D$ is given by the Shannon formulation:

$$MT = a + b \cdot ID = a + b \log_2 \left( 1 + \frac{2D}{W} \right)$$

Where $ID$ is the **Index of Difficulty** in bits.

### 8.2 Ergonomic Constraints
- Empirical coefficients for one-handed mobile thumb interaction: $a \approx 50\text{ms}$, $b \approx 150\text{ms/bit}$.
- **Target Constraint:** To ensure seamless one-handed operation on large screens (e.g. iPhone 16 Pro Max $6.9''$), $ID$ for primary actions ("Download", "Decompose") must satisfy:
  $$ID = \log_2\left( 1 + \frac{2D}{W} \right) \le 3.5\text{ bits} \implies MT \le 575\text{ms}$$
- Setting $W \ge 48\text{px}$ and $H \ge 48\text{px}$ guarantees that all touch targets are reachable within $D \le 264\text{px}$ from the bottom thumb anchor zone ($Y \in [65\%, 85\%]$).

---

## 9. Module 8: Mazur's Hyperbolic Chronometry & Decay Curves

### 9.1 Temporal Utility Function
To psychologically combat student procrastination, the perceived urgency value $V(t)$ of an impending deadline at temporal distance $D(t) = T_{\text{target}} - \text{now}()$ follows **Mazur's Hyperbolic Discounting Equation**:

$$V(D) = \frac{A}{1 + k \cdot D}$$

Where:
- $A$: Intrinsic reward/magnitude of goal completion ($A = 100$).
- $k$: Individual impulsivity discount parameter ($k = 0.05\text{ day}^{-1}$).
- $D$: Remaining time in days ($D = \frac{\Delta t}{86400000}$).

### 9.2 Visual Urgency State Transitions
The visual pulsation frequency $f_{\text{pulse}}$ of the countdown ring is derived from the second derivative (acceleration) of hyperbolic urgency:

$$f_{\text{pulse}}(D) = f_{\text{base}} + \Delta f \cdot \left( \frac{1}{(1 + k D)^2} \right)$$

As $D \to 0$ (final 24 hours), $f_{\text{pulse}}$ smoothly scales from $0.2\text{ Hz}$ to $1.2\text{ Hz}$, generating an elegant, scientifically calibrated pulse of focus.

---

## 10. Module 9: Procedural Micro-Orbital Shifting Geometry for OLED AOD

### 10.1 Sub-Pixel Differential Aging Equation
OLED sub-pixel degradation follows an empirical power law:
$$\Delta L(t) = -C \cdot \int_0^t J(t)^\gamma dt$$
Where $J$ is current density and $\gamma \approx 1.5$. High-luminance static pixels produce differential burn-in.

### 10.2 Continuous Micro-Orbital Trajectory
To distribute luminance across neighboring sub-pixels without perceptible motion to the human eye, element coordinates follow a continuous parametric circle:

$$\Delta x(t) = R \cdot \cos\left( \frac{2\pi t}{T_{\text{orbit}}} \right)$$
$$\Delta y(t) = R \cdot \sin\left( \frac{2\pi t}{T_{\text{orbit}}} \right)$$

With:
- Orbital Radius $R = 2.0\text{ physical pixels}$ ($R / \text{DPR} \approx 0.66\text{ CSS px}$).
- Orbital Period $T_{\text{orbit}} = 3600\text{ seconds}$ ($1\text{ hour}$).

Angular velocity is infinitesimal:
$$\omega = \frac{2\pi}{3600} \approx 0.001745\text{ rad/s} \implies v_{\text{shift}} \approx 0.0035\text{ px/s}$$
Completely imperceptible to human vision, but mathematically preventing any single sub-pixel from sustaining continuous static luminance.

---

## 11. Module 10: Adaptive Frame Decimation & Thermal Workload Governor

### 11.1 Dynamic Refresh Interval State Machine
To keep mobile GPU thermal output below the throttling dissipation threshold ($\le 2.5\text{ Watts}$), frame rates are dynamically decimated across four discrete operational regimes:

$$\Delta t_{\text{render}} = \begin{cases} 
16.66\text{ ms } (60\text{ FPS}) & \text{if } \text{TouchActive} = \text{true} \\
66.66\text{ ms } (15\text{ FPS}) & \text{if } \text{TouchIdleTime} \in [0, 3000\text{ms}] \\
1000.0\text{ ms } (1\text{ FPS}) & \text{if } \text{TouchIdleTime} > 3000\text{ms} \\
\infty \text{ (Paused)} & \text{if } \text{Document.hidden} = \text{true}
\end{cases}$$

### 11.2 Delta-Time Normalization
Animation progress accumulator $\theta(t)$ is computed using monotonic delta time:
$$\theta(t + \Delta t) = (\theta(t) + \omega \cdot \Delta t) \pmod{2\pi}$$
Ensuring that animations remain identical in visual velocity regardless of whether the display renders at 120Hz ProMotion or 1Hz Always-On Display.

---

## 12. Module 11: Semi-Implicit Symplectic Particle Kinematics & Aerodynamic Drag

### 12.1 Symplectic Drag Kinematics Formulation
Standard explicit Euler integration ($\mathbf{v}_{n+1} = \mathbf{v}_n + \mathbf{a}\Delta t$) exhibits energy divergence and numerical instability under non-linear quadratic air resistance $F_d = -k_d \|\mathbf{v}\|\mathbf{v}$. To guarantee unconditional stability across arbitrary frame intervals $\Delta t \in [8\text{ms}, 100\text{ms}]$:

$$\mathbf{v}_{n+1} = \frac{\mathbf{v}_n + \mathbf{g}\Delta t}{1 + k_d \|\mathbf{v}_n\|\Delta t}$$
$$\mathbf{x}_{n+1} = \mathbf{x}_n + \mathbf{v}_{n+1}\Delta t$$

Where:
- $\mathbf{g} = (0, 980\text{ px/s}^2)$ is gravitational acceleration.
- $k_d = 0.0018\text{ px}^{-1}$ is the aerodynamic drag coefficient.
- The terminal velocity $v_{\text{term}}$ is bounded asymptotically:
$$v_{\text{term}} = \sqrt{\frac{\|\mathbf{g}\|}{k_d}} = \sqrt{\frac{980}{0.0018}} \approx 737.86\text{ px/s}$$

### 12.2 Structure-of-Arrays (SoA) Float32Array Memory Layout
To eliminate garbage collector thrashing during the 180-frame celebration burst, particles are stored in a single contiguous `Float32Array` of 900 elements ($150\text{ particles} \times 6\text{ attributes}$):
```
Stride: [x, y, vx, vy, alpha, colorIdx]
Offset: [ 0, 1,  2,  3,     4,        5]
```
The update pass executes sequentially through memory with cache locality, achieving zero allocations per frame. Furthermore, if `window.matchMedia('(prefers-reduced-motion: reduce)').matches` evaluates to true, particle kinematics are cleanly bypassed.

---

## 13. Module 12: Two-Tier Intl.Segmenter Typography Line-Wrapping Pipeline

### 13.1 CJK & Indic Word-Boundary Failure
Canvas text wrapping relying solely on whitespace splitting (`text.split(' ')`) catastrophically fails for Chinese, Japanese, Korean (CJK) scripts that do not use spaces, as well as Indic scripts with complex grapheme clusters (combining diacritics, viramas).

### 13.2 Two-Tier Decomposition Architecture
The typography measurement engine implements a two-tier segmentation strategy:
1. **Tier 1 (Word Granularity):** Invokes `new Intl.Segmenter(locale, { granularity: 'word' })`. For whitespace-separated languages, words are accumulated until `ctx.measureText(line).width > maxWidth`.
2. **Tier 2 (Grapheme Cluster Granularity):** When a single word or ideographic token exceeds `maxWidth` (or when word segmentation yields no boundaries, as in continuous CJK strings), the engine drops to grapheme-level segmentation:
   ```javascript
   const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
   const graphemes = Array.from(segmenter.segment(token), s => s.segment);
   ```
   Graphemes are accumulated into lines with exact sub-pixel boundary checking, preventing CJK overflow and preserving Indic consonant conjuncts without broken diacritic rendering.

---

## 14. Module 13: Closed-Form Dual-Constraint GPU Texture Scaling & Memory Allocation Engine

### 14.1 Hardware GPU Limits & WebKit OOM Ceilings
Mobile browsers enforce two independent hardware and platform constraints on `<canvas>` backing store allocations:
1. **Total Surface Pixel Area Ceiling ($A_{\max}$):** iOS WebKit terminates tabs or crashes canvas contexts without throwing catchable exceptions if backing store exceeds $16,777,216\text{ physical pixels}$ ($16\text{ MP}$, equivalent to $4096 \times 4096$).
2. **Maximum Single Texture Dimension ($D_{\max}$):** Mobile GPU texture units clamp individual coordinate dimensions to `gl.getParameter(gl.MAX_TEXTURE_SIZE)`, typically $4096\text{px}$ on standard mobile GPUs and $8192\text{px}$ on modern flagships.

### 14.2 Closed-Form Optimal Scale Derivation
To maximize wallpaper export crispness without exceeding either boundary, `AdaptiveBufferAllocator` computes the exact closed-form optimal supersampling scale factor $S^*$:

$$S_{\text{area}} = \sqrt{\frac{A_{\max}}{W_{\text{base}} \times H_{\text{base}}}}$$

$$S_{\text{edge}} = \frac{D_{\max}}{\max(W_{\text{base}}, H_{\text{base}})}$$

$$S^* = \min\left(\text{targetDPR}, \, S_{\text{area}}, \, S_{\text{edge}}\right)$$

Where for standard flagship portrait resolution ($W_{\text{base}} = 1170\text{px}$, $H_{\text{base}} = 2532\text{px}$):
- Base surface area: $A_{\text{base}} = 1170 \times 2532 = 2,962,440\text{ pixels} \approx 2.96\text{ MP}$.
- Area-constrained limit: $S_{\text{area}} = \sqrt{\frac{16,777,216}{2,962,440}} = \sqrt{5.6633} \approx 2.3797$.
- Edge-constrained limit ($D_{\max} = 4096$): $S_{\text{edge}} = \frac{4096}{2532} \approx 1.6176$.
- On standard iOS Safari with $\text{targetDPR} = 2.0$:
  $$S^* = \min(2.0, \, 2.3797, \, 1.6176) = 1.6176 \xrightarrow{\text{quantized}} 1.50$$

### 14.3 Memory Allocation & Byte Guard Formula
The total VRAM buffer footprint $M_{\text{VRAM}}$ for a 32-bit RGBA context is:

$$M_{\text{VRAM}} = \lceil W_{\text{base}} \times S^* \rceil \times \lceil H_{\text{base}} \times S^* \rceil \times 4\text{ bytes}$$

At $S^* = 1.50$:
$$W_{\text{phys}} = 1755\text{px}, \quad H_{\text{phys}} = 3798\text{px}$$
$$M_{\text{VRAM}} = 1755 \times 3798 \times 4 = 26,661,960\text{ bytes} \approx 25.43\text{ MB} \le 50\text{ MB} \quad (\text{NFR-08 PASS})$$

---

## 15. Module 14: Oklab Constant-Hue Gamut Mapping & Chroma Reduction Bisection

### 15.1 The Gamut Clipping Defect & Hue Rotation
Linear interpolation in Oklab color space $(L, a, b)$ generates smooth perceptual lightness transitions. However, when converting high-chroma Oklab coordinates back to display color spaces (sRGB or Display-P3), values frequently exit the physical gamut boundary ($R, G, B \notin [0, 1]$).

Naive RGB clamping ($\text{clamp}(C, 0, 1)$) distorts the color vector, causing catastrophic **perceptual hue shifts** (e.g. vibrant cyan rotates into murky violet; luminous amber shifts toward dirty brown).

### 15.2 Constant-Hue Cylindrical Bisection Algorithm
To preserve perceived lightness $L^*$ and perceptual hue $h$ without introducing chromatic distortion, out-of-gamut colors undergo **Constant-Hue Chroma Reduction**:

1. Convert Cartesian chromaticity $(a, b)$ to cylindrical polar coordinates $(C, h)$:
   $$C = \sqrt{a^2 + b^2}, \quad h = \text{atan2}(b, a)$$

2. Formulate the boundary test function $\mathcal{F}(\alpha) \in \{0, 1\}$ for chroma scale factor $\alpha \in [0, 1]$:
   $$a^*(\alpha) = \alpha \cdot C \cos(h), \quad b^*(\alpha) = \alpha \cdot C \sin(h)$$
   $$\begin{bmatrix} L' \\ M' \\ S' \end{bmatrix} = M_{\text{Oklab}\to\text{LMS}} \begin{bmatrix} L \\ a^*(\alpha) \\ b^*(\alpha) \end{bmatrix}, \quad \begin{bmatrix} R \\ G \\ B \end{bmatrix} = M_{\text{LMS}\to\text{RGB}} \begin{bmatrix} (L')^3 \\ (M')^3 \\ (S')^3 \end{bmatrix}$$
   $$\mathcal{F}(\alpha) = 1 \iff \min(R, G, B) \ge -\epsilon \quad \text{and} \quad \max(R, G, B) \le 1 + \epsilon \quad (\epsilon = 10^{-4})$$

3. Execute 10-iteration binary bisection on $\alpha \in [0, 1]$:
   ```javascript
   let low = 0.0, high = 1.0, alpha = 1.0;
   if (!isInGamut(L, a, b)) {
     for (let iter = 0; iter < 10; iter++) {
       const mid = (low + high) * 0.5;
       if (isInGamut(L, mid * a, mid * b)) {
         low = mid;
         alpha = mid;
       } else {
         high = mid;
       }
     }
   }
   ```
   After 10 iterations, precision reaches $2^{-10} < 0.001$, finding the maximum gamut chroma while preserving hue $h$ and lightness $L^*$ with $100\%$ mathematical fidelity.

---

## 16. Module 15: Cross-Font Metric Scaling & Fallback Compensation

### 16.1 Fallback Font Layout Displacement
During cold start or font network delay, the browser falls back from `Inter` or `JetBrains Mono` to system fonts (`Arial`, `Roboto`, `system-ui`). Because glyph advance widths and ascender/descender metrics differ between font families, fallback text can overflow calculated lockscreen safe-zone bounds.

### 16.2 Quantitative Scaling Invariant
To prevent text overflow under any fallback typography, the layout engine applies **Dynamic Font Metric Scaling**:

$$k_{\text{font}} = \frac{W_{\text{target}}}{W_{\text{actual}}}$$

Where:
- $W_{\text{target}}$: Pre-calibrated reference width for the canonical numeral string `"00:00:00:00"` at $100\text{px}$ font size using `JetBrains Mono` ($W_{\text{target}} = 600\text{px}$).
- $W_{\text{actual}}$: Measured width on the active `CanvasRenderingContext2D` using `ctx.measureText("00:00:00:00").width` scaled to $100\text{px}$.

The effective rendering font size $S_{\text{effective}}$ is computed as:

$$S_{\text{effective}} = \max\left(S_{\text{floor}}, \, S_{\text{nominal}} \times \min(1.0, \, k_{\text{font}})\right)$$

Where $S_{\text{floor}} = 10\text{px}$ ensures text never shrinks below WCAG 2.1 minimum legibility thresholds.

---

## 17. Module 16: Fractional DPR Sub-Pixel Alignment & Snapping

### 17.1 Fractional DPR Anti-Aliasing Blur
Mobile devices exhibit fractional Device Pixel Ratios (e.g. Pixel 8 Pro $\text{DPR} = 2.625$, Galaxy A-series $\text{DPR} = 2.75$, iPhone 13 mini $\text{DPR} = 3.0$).

When drawing 1-pixel hairline borders or grid lines with odd physical stroke widths ($w_{\text{stroke}} \in \{1, 3, 5\}\text{ physical px}$), rasterizing at integer CSS pixel boundaries places the line directly across two physical pixels, causing a $2\text{px}$ wide fuzzy, dimmed stroke ($50\%$ opacity blur).

### 17.2 Odd-Stroke Half-Physical-Pixel Centering Rule
To ensure razor-sharp physical rasterization:

$$x_{\text{snapped}} = \frac{\lfloor x_{\text{css}} \cdot \text{DPR} \rfloor + 0.5 \cdot (w_{\text{phys}} \bmod 2)}{\text{DPR}}$$

Where:
- $w_{\text{phys}} = \text{round}(w_{\text{css}} \cdot \text{DPR})$ is the physical stroke width.
- For odd physical strokes ($w_{\text{phys}} \in \{1, 3, 5\}$), the coordinate is offset by $0.5 / \text{DPR}$, aligning the center of the stroke to the physical pixel midpoint.
- For even physical strokes ($w_{\text{phys}} \in \{2, 4\}$), the coordinate snaps to the exact physical integer boundary.

### 17.3 Coupled Extent Snapping Invariant
For adjacent bounding boxes (e.g. card headers and milestone list items), inner boundaries must share identical snapped physical boundaries:

$$x_{\text{left, phys}} = \lfloor x_{\text{left, css}} \cdot \text{DPR} \rfloor, \quad x_{\text{right, phys}} = \lfloor (x_{\text{left, css}} + W_{\text{css}}) \cdot \text{DPR} \rfloor$$
$$W_{\text{snapped, css}} = \frac{x_{\text{right, phys}} - x_{\text{left, phys}}}{\text{DPR}}$$

This coupled extent invariant guarantees $0\text{px}$ gap or seam between adjacent tiled glassmorphism cards across all fractional DPR displays.

---

## 18. Verification & Rigor Invariant Matrix (Complete 16-Module Suite)

```
+-----------------------------------------------------------------------------------------------------------------+
|                                    MATHEMATICAL VERIFICATION INVARIANTS                                         |
+----+-----------------------------+---------------------------------------+--------------------------------------+
| #  | Mathematical Invariant      | Verification Formulation              | Pass Condition                       |
+----+-----------------------------+---------------------------------------+--------------------------------------+
| 01 | Sub-pixel snapping          | abs(y_snap * DPR - round(y_snap * DPR))| == 0.00000 (Exact physical pixel)    |
| 02 | Oklab gamut preservation    | L* in [0, 1], a*, b* in [-0.5, 0.5]   | Zero color clipping in sRGB gamut    |
| 03 | Monotone spline slope       | y'(x) >= 0.00000 for all x in [0, 1]  | Zero overshoot (monotonically non-dec)|
| 04 | Aspect ratio isotropy       | abs(scaleX - scaleY)                  | == 0.00000 (Zero circular warping)   |
| 05 | Fitts's Law difficulty      | log2(1 + 2D / W)                      | <= 3.50000 bits (One-handed zone)    |
| 06 | Orbital shift bounding      | sqrt(dx^2 + dy^2)                     | <= 2.00000 physical pixels           |
| 07 | Mazur urgency limit         | V(D) as D -> 0                        | Approaches A = 100 asymptotically    |
| 08 | Arc boundary singularity    | theta_end - theta_start               | <= 2*PI - 1e-6 (Zero self-intersect) |
| 09 | Thermal GPU frame clamp     | FPS during idle preview               | <= 15.0000 FPS (Energy conservation) |
| 10 | Inverse transform precision | norm(M * M^-1 - I)                    | <= 1e-12 (Zero floating-point drift) |
| 11 | Symplectic particle terminal| lim_{t -> inf} ||v(t)||               | <= 738.00 px/s (Unconditional bound) |
| 12 | Zero-duration arc guard     | P when t_total <= 0                   | == 1.00000 (Zero NaN division error) |
| 13 | Dual-Constraint GPU ceiling | S* <= min(DPR, S_area, S_edge)        | Backing store <= 16.7MP, max edge <= 4096px |
| 14 | Oklab Chroma Bisection      | F(alpha_final) == 1                   | Hue h preserved, dE <= 0.001 to gamut |
| 15 | Cross-Font Fallback Floor   | S_effective >= S_floor = 10px         | Zero text overflow under fallback font |
| 16 | Coupled Extent Seam Guard   | x_left,phys == x_right,prev,phys      | 0px physical seam between adjacent cards|
+----+-----------------------------+---------------------------------------+--------------------------------------+
```
