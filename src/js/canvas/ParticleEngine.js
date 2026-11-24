/**
 * Zero-Allocation Structure-of-Arrays (SoA) Celebration Confetti Physics Engine.
 * Simulates semi-implicit symplectic particle dynamics with aerodynamic quadratic drag,
 * terminal velocity bounds, alpha decay, and prefers-reduced-motion accessibility bypass.
 *
 * @module canvas/ParticleEngine
 */

/**
 * Celebration confetti physics engine using Structure-of-Arrays (SoA) Float32Array.
 * Buffer layout per particle (stride 6): [x, y, vx, vy, alpha, colorIdx].
 */
export class ParticleEngine {
  /** @type {number} */
  static TOTAL_PARTICLES = 150;
  /** @type {number} */
  static STRIDE = 6;
  /** @type {number} Total float capacity (150 * 6 = 900) */
  static BUFFER_SIZE = 150 * 6;
  /** @type {number} Quadratic aerodynamic drag coefficient in px^-1 */
  static DRAG_COEFFICIENT = 0.0018;
  /** @type {number} Gravitational acceleration in px/s^2 */
  static GRAVITY_Y = 980;
  /** @type {number} Asymptotic terminal velocity bound in px/s */
  static TERMINAL_VELOCITY = 737.86;

  /** @type {string[]} Palette colors for confetti flakes */
  static PALETTE = Object.freeze([
    '#38bdf8',
    '#fbbf24',
    '#34d399',
    '#f43f5e',
    '#a855f7',
    '#3b82f6'
  ]);

  /** @type {Float32Array} Contiguous 900-element typed memory buffer */
  #buffer = new Float32Array(ParticleEngine.BUFFER_SIZE);
  /** @type {number | null} Active requestAnimationFrame handle */
  #rafId = null;
  /** @type {number} Remaining animation frames (180 frames = 3000ms at 60Hz) */
  #framesRemaining = 0;
  /** @type {number} Total simulation frame count */
  #totalFrames = 180;
  /** @type {boolean} */
  #isRunning = false;
  /** @type {Window | Object | null} */
  #window;

  /**
   * Constructs the particle engine with optional injected window reference.
   *
   * @param {Window | Object} [customWindow] Optional window object for testing
   */
  constructor(customWindow) {
    this.#window = customWindow || (typeof window !== 'undefined' ? window : null);
  }

  /**
   * Checks whether reduced motion has been requested by the user.
   *
   * @returns {boolean} True if prefers-reduced-motion: reduce matches
   */
  isReducedMotionActive() {
    if (!this.#window || typeof this.#window.matchMedia !== 'function') {
      return false;
    }
    try {
      return Boolean(this.#window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    } catch {
      return false;
    }
  }

  /**
   * Initializes 150 particles with polar velocities and triggers 180-frame animation burst.
   * Automatically bypasses execution if prefers-reduced-motion is active.
   *
   * @param {CanvasRenderingContext2D} ctx Target 2D rendering surface
   * @param {number} width Canvas pixel width
   * @param {number} height Canvas pixel height
   * @returns {boolean} True if burst initiated, false if reduced motion bypassed
   */
  startBurst(ctx, width, height) {
    if (this.isReducedMotionActive()) {
      return false;
    }

    this.stop();

    const originX = width * 0.5;
    const originY = height * 0.6;
    const count = ParticleEngine.TOTAL_PARTICLES;
    const stride = ParticleEngine.STRIDE;

    for (let i = 0; i < count; i++) {
      const offset = i * stride;
      const angle = -Math.PI * 0.5 + (Math.random() - 0.5) * 1.5;
      const speed = 300 + Math.random() * 450;

      this.#buffer[offset + 0] = originX + (Math.random() - 0.5) * 40;
      this.#buffer[offset + 1] = originY + (Math.random() - 0.5) * 20;
      this.#buffer[offset + 2] = Math.cos(angle) * speed;
      this.#buffer[offset + 3] = Math.sin(angle) * speed;
      this.#buffer[offset + 4] = 1.0;
      this.#buffer[offset + 5] = Math.floor(Math.random() * ParticleEngine.PALETTE.length);
    }

    this.#totalFrames = 180;
    this.#framesRemaining = 180;
    this.#isRunning = true;

    if (this.#window && typeof this.#window.requestAnimationFrame === 'function') {
      let lastTime = (this.#window.performance && typeof this.#window.performance.now === 'function')
        ? this.#window.performance.now()
        : Date.now();

      const loop = (currentTime) => {
        if (!this.#isRunning || this.#framesRemaining <= 0) {
          this.stop();
          return;
        }

        const dt = Math.min(0.033, Math.max(0.001, (currentTime - lastTime) / 1000));
        lastTime = currentTime;

        this.updateStep(dt);
        this.renderStep(ctx);

        this.#framesRemaining--;
        if (this.#framesRemaining > 0) {
          this.#rafId = this.#window.requestAnimationFrame(loop);
        } else {
          this.stop();
        }
      };

      this.#rafId = this.#window.requestAnimationFrame(loop);
    }

    return true;
  }

  /**
   * Executes a single semi-implicit symplectic kinematic simulation step across all particles.
   *
   * @param {number} dt Frame delta time in seconds
   */
  updateStep(dt) {
    const count = ParticleEngine.TOTAL_PARTICLES;
    const stride = ParticleEngine.STRIDE;
    const g = ParticleEngine.GRAVITY_Y;
    const kd = ParticleEngine.DRAG_COEFFICIENT;
    const vTerm = ParticleEngine.TERMINAL_VELOCITY;
    const alphaDecay = 1.0 / this.#totalFrames;

    for (let i = 0; i < count; i++) {
      const offset = i * stride;
      let vx = this.#buffer[offset + 2];
      let vy = this.#buffer[offset + 3];

      const vMag = Math.sqrt(vx * vx + vy * vy);
      const dragFactor = 1.0 + kd * vMag * dt;

      vx = (vx * 0.95) / dragFactor;
      vy = ((vy + g * dt) * 0.95) / dragFactor;

      const newSpeed = Math.sqrt(vx * vx + vy * vy);
      if (newSpeed > vTerm && newSpeed > 0) {
        const clampRatio = vTerm / newSpeed;
        vx *= clampRatio;
        vy *= clampRatio;
      }

      this.#buffer[offset + 0] += vx * dt;
      this.#buffer[offset + 1] += vy * dt;
      this.#buffer[offset + 2] = vx;
      this.#buffer[offset + 3] = vy;
      this.#buffer[offset + 4] = Math.max(0, this.#buffer[offset + 4] - alphaDecay);
    }
  }

  /**
   * Renders the current particle buffer onto the supplied 2D context.
   *
   * @param {CanvasRenderingContext2D} ctx Target 2D rendering surface
   */
  renderStep(ctx) {
    if (!ctx) {
      return;
    }

    const count = ParticleEngine.TOTAL_PARTICLES;
    const stride = ParticleEngine.STRIDE;
    const palette = ParticleEngine.PALETTE;

    for (let i = 0; i < count; i++) {
      const offset = i * stride;
      const alpha = this.#buffer[offset + 4];
      if (alpha <= 0.001) {
        continue;
      }

      const x = this.#buffer[offset + 0];
      const y = this.#buffer[offset + 1];
      const colorIdx = this.#buffer[offset + 5] | 0;
      const color = palette[colorIdx % palette.length];

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = color;
      ctx.fillRect(x - 3, y - 3, 6, 6);
      ctx.restore();
    }
  }

  /**
   * Stops active particle animation loop and resets buffer.
   */
  stop() {
    this.#isRunning = false;
    this.#framesRemaining = 0;
    if (this.#rafId !== null && this.#window && typeof this.#window.cancelAnimationFrame === 'function') {
      this.#window.cancelAnimationFrame(this.#rafId);
      this.#rafId = null;
    }
  }

  /**
   * Returns current underlying Float32Array particle memory buffer.
   *
   * @returns {Float32Array}
   */
  getBuffer() {
    return this.#buffer;
  }

  /**
   * Returns whether the particle simulation is currently running.
   *
   * @returns {boolean} True if active
   */
  isRunning() {
    return this.#isRunning;
  }
}
