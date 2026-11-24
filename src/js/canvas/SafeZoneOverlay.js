/**
 * @fileoverview Interactive Safe-Zone Simulator Overlay.
 * Renders ergonomic lock screen visual clearance guides simulating iOS Dynamic Island,
 * top clock exclusion corridors, and Android gesture navigation bars with flagship resolution scaling.
 * Adheres strictly to Level 2.2 Docstrings-Only specification.
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

    ctx.fillStyle = 'rgba(239, 68, 68, 0.12)';
    ctx.fillRect(0, 0, width, bounds.top);

    ctx.setLineDash([16, 16]);
    ctx.lineWidth = 5;
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.85)';
    ctx.beginPath();
    ctx.moveTo(0, bounds.top);
    ctx.lineTo(width, bounds.top);
    ctx.stroke();

    const islandW = Math.round(width * 0.32);
    const islandH = Math.round(islandW * 0.28);
    const islandX = (width - islandW) * 0.5;
    const islandY = Math.round(height * 0.022);
    const islandR = islandH * 0.5;

    ctx.setLineDash([]);
    ctx.fillStyle = '#000000';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 2;
    if (typeof ctx.roundRect === 'function') {
      ctx.beginPath();
      ctx.roundRect(islandX, islandY, islandW, islandH, islandR);
      ctx.fill();
      ctx.stroke();
    } else if (typeof ctx.rect === 'function') {
      ctx.beginPath();
      ctx.rect(islandX, islandY, islandW, islandH);
      ctx.fill();
      ctx.stroke();
    } else if (typeof ctx.fillRect === 'function') {
      ctx.fillRect(islandX, islandY, islandW, islandH);
      if (typeof ctx.strokeRect === 'function') ctx.strokeRect(islandX, islandY, islandW, islandH);
    }

    ctx.fillStyle = 'rgba(255, 255, 255, 0.60)';
    ctx.font = `600 ${Math.round(width * 0.032)}px "Inter", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Tuesday, November 24', width * 0.5, bounds.top * 0.40);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.font = `700 ${Math.round(width * 0.14)}px "Inter", sans-serif`;
    ctx.fillText('09:41', width * 0.5, bounds.top * 0.68);

    ctx.fillStyle = '#ef4444';
    ctx.font = `700 ${Math.round(width * 0.026)}px "Inter", sans-serif`;
    ctx.fillText('SYSTEM STATUS BAR & CLOCK EXCLUSION (TOP 28%)', width * 0.5, bounds.top - 24);

    ctx.fillStyle = 'rgba(59, 130, 246, 0.12)';
    ctx.fillRect(0, bounds.bottom, width, height - bounds.bottom);

    ctx.setLineDash([16, 16]);
    ctx.lineWidth = 5;
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.85)';
    ctx.beginPath();
    ctx.moveTo(0, bounds.bottom);
    ctx.lineTo(width, bounds.bottom);
    ctx.stroke();

    ctx.fillStyle = '#3b82f6';
    ctx.font = `700 ${Math.round(width * 0.026)}px "Inter", sans-serif`;
    ctx.fillText('GESTURE NAVIGATION CORRIDOR (BOTTOM 18%)', width * 0.5, bounds.bottom + 36);

    const shortcutR = Math.round(width * 0.055);
    const shortcutY = height - Math.round(height * 0.08);

    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    if (typeof ctx.arc === 'function') {
      ctx.beginPath();
      ctx.arc(width * 0.14, shortcutY, shortcutR, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(width * 0.86, shortcutY, shortcutR, 0, Math.PI * 2);
      ctx.fill();
    }

    const homeW = Math.round(width * 0.38);
    const homeH = Math.round(width * 0.014);
    const homeX = (width - homeW) * 0.5;
    const homeY = height - Math.round(height * 0.028);
    const homeR = homeH * 0.5;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    if (typeof ctx.roundRect === 'function') {
      ctx.beginPath();
      ctx.roundRect(homeX, homeY, homeW, homeH, homeR);
      ctx.fill();
    } else if (typeof ctx.rect === 'function') {
      ctx.beginPath();
      ctx.rect(homeX, homeY, homeW, homeH);
      ctx.fill();
    } else if (typeof ctx.fillRect === 'function') {
      ctx.fillRect(homeX, homeY, homeW, homeH);
    }

    ctx.setLineDash([8, 8]);
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(52, 211, 153, 0.50)';
    if (typeof ctx.strokeRect === 'function') {
      ctx.strokeRect(bounds.left, bounds.top, bounds.safeWidth, bounds.safeHeight);
    }

    ctx.font = `700 ${Math.round(width * 0.024)}px "Inter", sans-serif`;
    ctx.fillStyle = '#34d399';
    ctx.textAlign = 'left';
    ctx.fillText('SAFE CONTENT ZONE (54% CLEARANCE)', bounds.left + 16, bounds.top + 36);

    ctx.restore();
  }
}
