/**
 * Interactive Safe-Zone Simulator Overlay.
 * Renders ergonomic lock screen visual clearance guides simulating iOS Dynamic Island,
 * top clock exclusion corridors, and Android gesture navigation bars.
 *
 * @module canvas/SafeZoneOverlay
 */

/**
 * Renders ergonomic lock screen simulator overlays (iOS Dynamic Island, clock, Android gesture bar).
 */
export class SafeZoneOverlay {
  /** @type {boolean} */
  #visible = false;

  /**
   * Constructs the safe-zone overlay visualizer.
   *
   * @param {boolean} [initialVisible=false] Initial visibility state
   */
  constructor(initialVisible = false) {
    this.#visible = Boolean(initialVisible);
  }

  /**
   * Toggles the visual visibility of the lockscreen simulator overlay guides.
   *
   * @returns {boolean} New visibility state
   */
  toggle() {
    this.#visible = !this.#visible;
    return this.#visible;
  }

  /**
   * Returns current guide visibility state.
   *
   * @returns {boolean} True if guide lines are enabled
   */
  isVisible() {
    return this.#visible;
  }

  /**
   * Explicitly sets guide visibility state.
   *
   * @param {boolean} visible New visibility flag
   */
  setVisible(visible) {
    this.#visible = Boolean(visible);
  }

  /**
   * Returns exact pixel bounding box of primary unobstructed content zone.
   *
   * @param {number} width Canvas width in pixels
   * @param {number} height Canvas height in pixels
   * @returns {{ top: number, bottom: number, left: number, right: number, safeHeight: number, safeWidth: number }}
   */
  getSafeTextBounds(width, height) {
    const top = height * 0.28;
    const bottom = height * 0.82;
    const left = width * 0.06;
    const right = width * 0.94;

    return {
      top,
      bottom,
      left,
      right,
      safeHeight: bottom - top,
      safeWidth: right - left
    };
  }

  /**
   * Draws the safe-zone guide overlays onto the target canvas rendering context.
   *
   * @param {CanvasRenderingContext2D} ctx Target 2D rendering surface
   * @param {number} width Canvas pixel width
   * @param {number} height Canvas pixel height
   */
  drawGuides(ctx, width, height) {
    if (!this.#visible || !ctx) {
      return;
    }

    const bounds = this.getSafeTextBounds(width, height);

    ctx.save();

    ctx.fillStyle = 'rgba(239, 68, 68, 0.06)';
    ctx.fillRect(0, 0, width, bounds.top);

    ctx.setLineDash([8, 8]);
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.60)';
    ctx.beginPath();
    ctx.moveTo(0, bounds.top);
    ctx.lineTo(width, bounds.top);
    ctx.stroke();

    const islandW = Math.min(374, width * 0.32);
    const islandH = 35;
    const islandX = (width - islandW) * 0.5;
    const islandY = 14;
    const islandR = islandH * 0.5;

    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.20)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(islandX, islandY, islandW, islandH, islandR);
    } else {
      ctx.rect(islandX, islandY, islandW, islandH);
    }
    ctx.fill();
    ctx.stroke();

    ctx.font = '600 13px "Inter", sans-serif';
    ctx.fillStyle = 'rgba(239, 68, 68, 0.85)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('SYSTEM STATUS BAR & CLOCK EXCLUSION (TOP 28%)', width * 0.5, bounds.top - 20);

    ctx.fillStyle = 'rgba(59, 130, 246, 0.06)';
    ctx.fillRect(0, bounds.bottom, width, height - bounds.bottom);

    ctx.setLineDash([8, 8]);
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.60)';
    ctx.beginPath();
    ctx.moveTo(0, bounds.bottom);
    ctx.lineTo(width, bounds.bottom);
    ctx.stroke();

    const homeW = Math.min(420, width * 0.36);
    const homeH = 5;
    const homeX = (width - homeW) * 0.5;
    const homeY = height - 20;
    const homeR = 2.5;

    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.60)';
    ctx.beginPath();
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(homeX, homeY, homeW, homeH, homeR);
    } else {
      ctx.rect(homeX, homeY, homeW, homeH);
    }
    ctx.fill();

    ctx.font = '600 13px "Inter", sans-serif';
    ctx.fillStyle = 'rgba(59, 130, 246, 0.85)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('GESTURE NAVIGATION CORRIDOR (BOTTOM 18%)', width * 0.5, bounds.bottom + 25);

    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(52, 211, 153, 0.40)';
    ctx.strokeRect(bounds.left, bounds.top, bounds.safeWidth, bounds.safeHeight);

    ctx.font = '500 11px "Inter", sans-serif';
    ctx.fillStyle = 'rgba(52, 211, 153, 0.70)';
    ctx.textAlign = 'left';
    ctx.fillText('SAFE CONTENT ZONE (54% CLEARANCE)', bounds.left + 8, bounds.top + 18);

    ctx.restore();
  }
}
