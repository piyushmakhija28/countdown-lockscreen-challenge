/**
 * 9-Stage Offscreen Canvas Wallpaper Composition Engine.
 * Renders high-DPI wallpapers conforming to flagship hardware safe zones,
 * dynamic ambient contrast scrims, tabular chronometer numerals, and lossless PNG export.
 *
 * @module canvas/CanvasRenderer
 */

import { IWallpaperRenderer } from '../core/ports.js';
import { Context2DUnavailableError, CanvasRenderError } from '../core/errors.js';
import { AdaptiveBufferAllocator } from './AdaptiveBufferAllocator.js';
import { ResponsiveLayoutEngine } from './ResponsiveLayoutEngine.js';
import { CanvasTextWrapper } from './CanvasTextWrapper.js';

/**
 * Master presentation-tier graphics coordinator rendering high-DPI wallpapers onto HTML5 Canvas 2D.
 */
export class CanvasRenderer extends IWallpaperRenderer {
  /** @type {Object} */
  #target;
  /** @type {CanvasRenderingContext2D} */
  #ctx;
  /** @type {typeof AdaptiveBufferAllocator} */
  #allocator;
  /** @type {typeof ResponsiveLayoutEngine} */
  #layoutEngine;
  /** @type {CanvasTextWrapper} */
  #textWrapper;
  /** @type {Object | null} */
  #safeZoneOverlay;
  /** @type {Object | null} */
  #fontService;
  /** @type {string} */
  #activeTheme = 'cyber_obsidian';

  /**
   * Palette token definitions for theme styling.
   *
   * @type {Record<string, { bgBase: string, primaryAccent: string, textPrimary: string, textSecondary: string, ringTrack: string, cardBg: string, cardBorder: string }>}
   */
  static PALETTES = Object.freeze({
    cyber_obsidian: {
      bgBase: '#08090d',
      primaryAccent: '#38bdf8',
      textPrimary: '#ffffff',
      textSecondary: '#94a3b8',
      ringTrack: 'rgba(255, 255, 255, 0.08)',
      cardBg: 'rgba(15, 23, 42, 0.65)',
      cardBorder: 'rgba(56, 189, 248, 0.25)'
    },
    deep_focus_zen: {
      bgBase: '#0d0d0f',
      primaryAccent: '#fbbf24',
      textPrimary: '#ffffff',
      textSecondary: '#a1a1aa',
      ringTrack: 'rgba(255, 255, 255, 0.08)',
      cardBg: 'rgba(24, 24, 27, 0.65)',
      cardBorder: 'rgba(251, 191, 36, 0.25)'
    },
    aurora_botanical: {
      bgBase: '#080d0a',
      primaryAccent: '#34d399',
      textPrimary: '#ffffff',
      textSecondary: '#a7f3d0',
      ringTrack: 'rgba(255, 255, 255, 0.08)',
      cardBg: 'rgba(6, 78, 59, 0.45)',
      cardBorder: 'rgba(52, 211, 153, 0.25)'
    }
  });

  /**
   * @param {Object} [targetOrOptions] Render target or options bundle
   * @param {typeof AdaptiveBufferAllocator} [allocator] Buffer dimension allocator
   * @param {typeof ResponsiveLayoutEngine} [layoutEngine] Layout computation engine
   * @param {Object} [fontService] Font readiness gate
   * @param {CanvasTextWrapper} [textWrapper] Typographic text wrapper
   * @param {Object} [safeZoneOverlay] Safe zone overlay visualizer
   */
  constructor(targetOrOptions, allocator, layoutEngine, fontService, textWrapper, safeZoneOverlay) {
    super();

    let target = targetOrOptions;
    if (targetOrOptions && typeof targetOrOptions === 'object' && ('target' in targetOrOptions || !('getContext' in targetOrOptions))) {
      target = targetOrOptions.target;
      allocator = targetOrOptions.allocator || allocator;
      layoutEngine = targetOrOptions.layoutEngine || layoutEngine;
      fontService = targetOrOptions.fontService || fontService;
      textWrapper = targetOrOptions.textWrapper || textWrapper;
      safeZoneOverlay = targetOrOptions.safeZoneOverlay || safeZoneOverlay;
    }

    this.#target = target || null;

    let ctx = null;
    if (this.#target && typeof this.#target.getContext === 'function') {
      try {
        ctx = this.#target.getContext('2d', { colorSpace: 'display-p3' }) || this.#target.getContext('2d');
      } catch {
        ctx = this.#target.getContext('2d');
      }
    }

    this.#ctx = ctx;
    if (this.#target && !ctx) {
      throw new Context2DUnavailableError('CanvasRenderingContext2D could not be acquired');
    }
    this.#allocator = allocator || AdaptiveBufferAllocator;
    this.#layoutEngine = layoutEngine || ResponsiveLayoutEngine;
    this.#fontService = fontService || null;
    this.#textWrapper = textWrapper || new CanvasTextWrapper();
    this.#safeZoneOverlay = safeZoneOverlay || null;
  }

  /**
   * Updates active color theme palette.
   *
   * @param {string} themeId Theme palette identifier
   */
  updateThemePalette(themeId) {
    if (themeId in CanvasRenderer.PALETTES) {
      this.#activeTheme = themeId;
    }
  }

  /**
   * Returns active 2D rendering context.
   *
   * @returns {CanvasRenderingContext2D | null}
   */
  getContext() {
    return this.#ctx;
  }

  /**
   * Returns active render target.
   *
   * @returns {Object | null}
   */
  getTarget() {
    return this.#target;
  }

  /**
   * Stage 1: Buffer dimension and high-DPI scaling initialization.
   *
   * @param {CanvasRenderingContext2D} ctx Context
   * @param {number} baseWidth Base width
   * @param {number} baseHeight Base height
   * @param {number} [requestedDpr=2.0] Desired device pixel ratio
   * @returns {{ width: number, height: number, scaleFactor: number }} Sizing metrics
   */
  #stage1_InitBuffer(ctx, baseWidth, baseHeight, requestedDpr = 2.0) {
    const buffer = this.#allocator.computeOptimalBuffer(baseWidth, baseHeight, requestedDpr);

    if (this.#target) {
      this.#target.width = buffer.width;
      this.#target.height = buffer.height;
    }

    if (ctx && typeof ctx.setTransform === 'function') {
      ctx.setTransform(buffer.scaleFactor, 0, 0, buffer.scaleFactor, 0, 0);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
    }

    return buffer;
  }

  /**
   * Stage 2: Background OLED substrate and 4x4 Bayer dither rasterization.
   *
   * @param {CanvasRenderingContext2D} ctx Context
   * @param {number} width Logical width
   * @param {number} height Logical height
   * @param {string} bgBase Base background color hex
   */
  #stage2_BackgroundBase(ctx, width, height, bgBase) {
    ctx.fillStyle = bgBase;
    ctx.fillRect(0, 0, width, height);

    const bayer4x4 = [
      [0, 8, 2, 10],
      [12, 4, 14, 6],
      [3, 11, 1, 9],
      [15, 7, 13, 5]
    ];

    ctx.fillStyle = 'rgba(255, 255, 255, 0.008)';
    for (let y = 0; y < Math.min(height, 80); y += 4) {
      for (let x = 0; x < width; x += 4) {
        const threshold = bayer4x4[(y / 4) % 4][(x / 4) % 4];
        if (threshold > 10) {
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }
  }

  /**
   * Stage 3: Safe-zone boundary calculations and guide stroke overlays.
   *
   * @param {CanvasRenderingContext2D} ctx Context
   * @param {Object} layout Layout geometry metrics
   * @param {boolean} showGuides Whether to draw visual hardware guides
   */
  #stage3_SafeZoneBounds(ctx, layout, showGuides) {
    if (!showGuides) return;

    ctx.save();
    ctx.setLineDash([8, 8]);
    ctx.lineWidth = 1;

    ctx.strokeStyle = 'rgba(239, 68, 68, 0.45)';
    const topY = Math.floor(layout.topSafeY) + 0.5;
    ctx.beginPath();
    ctx.moveTo(0, topY);
    ctx.lineTo(layout.canvasWidth, topY);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(59, 130, 246, 0.45)';
    const bottomY = Math.floor(layout.bottomSafeY) + 0.5;
    ctx.beginPath();
    ctx.moveTo(0, bottomY);
    ctx.lineTo(layout.canvasWidth, bottomY);
    ctx.stroke();

    ctx.restore();
  }

  /**
   * Stage 4: Ambient radial glow bloom synthesis behind chronometer ring.
   *
   * @param {CanvasRenderingContext2D} ctx Context
   * @param {Object} layout Layout geometry metrics
   * @param {string} accentColor Theme primary accent color
   */
  #stage4_AmbientRadialGlow(ctx, layout, accentColor) {
    if (typeof ctx.createRadialGradient !== 'function') return;

    ctx.save();
    const { ringCenter, ringRadius } = layout;
    const glowRadius = ringRadius * 1.75;
    const gradient = ctx.createRadialGradient(
      ringCenter.x,
      ringCenter.y,
      0,
      ringCenter.x,
      ringCenter.y,
      glowRadius
    );

    gradient.addColorStop(0, `${accentColor}26`);
    gradient.addColorStop(1, 'transparent');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(ringCenter.x, ringCenter.y, glowRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  /**
   * Stage 5: Specular circular chronometer arc with progress indicator.
   *
   * @param {CanvasRenderingContext2D} ctx Context
   * @param {Object} layout Layout geometry metrics
   * @param {number} progressRatio Normalized completion progress (0.0 to 1.0)
   * @param {Object} palette Palette tokens
   */
  #stage5_SpecularChronometerArc(ctx, layout, progressRatio, palette) {
    ctx.save();
    const { ringCenter, ringRadius } = layout;
    const strokeWidth = Math.max(6, Math.round(ringRadius * 0.08));

    ctx.beginPath();
    ctx.arc(ringCenter.x, ringCenter.y, ringRadius, 0, Math.PI * 2);
    ctx.strokeStyle = palette.ringTrack;
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = 'round';
    ctx.stroke();

    const clampedRatio = Math.max(0, Math.min(1.0, progressRatio || 0));
    if (clampedRatio > 0) {
      const startAngle = -Math.PI / 2;
      const endAngle = startAngle + clampedRatio * Math.PI * 2;

      ctx.beginPath();
      ctx.arc(ringCenter.x, ringCenter.y, ringRadius, startAngle, endAngle);
      ctx.strokeStyle = palette.primaryAccent;
      ctx.lineWidth = strokeWidth;
      ctx.lineCap = 'round';
      ctx.stroke();

      const headX = ringCenter.x + ringRadius * Math.cos(endAngle);
      const headY = ringCenter.y + ringRadius * Math.sin(endAngle);

      ctx.beginPath();
      ctx.arc(headX, headY, strokeWidth * 0.75, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    }

    ctx.restore();
  }

  /**
   * Stage 6: Tabular chronometer numerals and unit label typography.
   *
   * @param {CanvasRenderingContext2D} ctx Context
   * @param {Object} layout Layout geometry metrics
   * @param {Object} timeRemaining Time remaining snapshot
   * @param {Object} palette Palette tokens
   */
  #stage6_TabularChronometer(ctx, layout, timeRemaining, palette) {
    ctx.save();
    const { ringCenter, ringRadius, fontSizeHero } = layout;

    const days = timeRemaining?.days || 0;
    const hours = timeRemaining?.hours || 0;
    const minutes = timeRemaining?.minutes || 0;
    const seconds = timeRemaining?.seconds || 0;

    const pad = (n) => String(n).padStart(2, '0');
    const heroDigits = days > 0 ? String(days) : `${pad(hours)}:${pad(minutes)}`;
    const heroUnit = days > 0 ? 'DAYS REMAINING' : 'HOURS : MINUTES';

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.font = `700 ${fontSizeHero}px "JetBrains Mono", monospace`;
    ctx.fillStyle = palette.textPrimary;
    ctx.fillText(heroDigits, ringCenter.x, ringCenter.y - ringRadius * 0.12);

    ctx.font = `600 ${Math.round(fontSizeHero * 0.22)}px "Inter", sans-serif`;
    ctx.fillStyle = palette.primaryAccent;
    ctx.fillText(heroUnit, ringCenter.x, ringCenter.y + ringRadius * 0.28);

    if (days > 0) {
      const subDigits = `${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`;
      ctx.font = `500 ${Math.round(fontSizeHero * 0.20)}px "JetBrains Mono", monospace`;
      ctx.fillStyle = palette.textSecondary;
      ctx.fillText(subDigits, ringCenter.x, ringCenter.y + ringRadius * 0.50);
    }

    ctx.restore();
  }

  /**
   * Stage 7: Milestone chronometry ladder and checkpoint checklist.
   *
   * @param {CanvasRenderingContext2D} ctx Context
   * @param {Object} layout Layout geometry metrics
   * @param {Array<Object>} milestones Milestone items
   * @param {Object} palette Palette tokens
   */
  #stage7_MilestoneLadder(ctx, layout, milestones, palette) {
    if (!Array.isArray(milestones) || milestones.length === 0) return;

    ctx.save();
    const { milestoneBox, fontSizeMilestone } = layout;
    const count = milestones.length;
    const availableHeight = milestoneBox.height;
    const rowHeight = Math.min(68, availableHeight / Math.max(1, count));
    const railX = milestoneBox.x + 24;

    ctx.strokeStyle = palette.ringTrack;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(railX, milestoneBox.y + 16);
    ctx.lineTo(railX, milestoneBox.y + 16 + (count - 1) * rowHeight);
    ctx.stroke();

    for (let i = 0; i < count; i++) {
      const m = milestones[i];
      const rowY = milestoneBox.y + 16 + i * rowHeight;
      const isDone = Boolean(m.completed || m.isCompleted);

      ctx.beginPath();
      ctx.arc(railX, rowY, 9, 0, Math.PI * 2);

      if (isDone) {
        ctx.fillStyle = palette.primaryAccent;
        ctx.fill();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(railX - 4, rowY);
        ctx.lineTo(railX - 1, rowY + 3);
        ctx.lineTo(railX + 4, rowY - 3);
        ctx.stroke();
      } else {
        ctx.fillStyle = palette.bgBase;
        ctx.fill();
        ctx.strokeStyle = palette.textSecondary;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.font = `500 ${fontSizeMilestone}px "Inter", sans-serif`;
      ctx.fillStyle = isDone ? palette.textSecondary : palette.textPrimary;

      const titleX = railX + 22;
      const maxWidth = milestoneBox.width - 50;
      const lines = this.#textWrapper.wrapText(ctx, m.title || `Phase ${i + 1}`, maxWidth);
      const displayTitle = lines.length > 0 ? lines[0] : (m.title || `Phase ${i + 1}`);
      ctx.fillText(displayTitle, titleX, rowY);
    }

    ctx.restore();
  }

  /**
   * Stage 8: Tailored motivational affirmation block and subpixel hairlines.
   *
   * @param {CanvasRenderingContext2D} ctx Context
   * @param {Object} layout Layout geometry metrics
   * @param {string} affirmation Motivational copy
   * @param {Object} palette Palette tokens
   */
  #stage8_MotivationalBlock(ctx, layout, affirmation, palette) {
    if (typeof affirmation !== 'string' || affirmation.trim().length === 0) return;

    ctx.save();
    const { canvasWidth, bottomSafeY, fontSizeTitle } = layout;
    const cardY = bottomSafeY - 48;

    ctx.strokeStyle = palette.ringTrack;
    ctx.lineWidth = 1;
    const lineY = Math.floor(cardY - 24) + 0.5;
    ctx.beginPath();
    ctx.moveTo(canvasWidth * 0.15, lineY);
    ctx.lineTo(canvasWidth * 0.85, lineY);
    ctx.stroke();

    ctx.font = `italic 500 ${Math.round(fontSizeTitle * 0.72)}px "Inter", sans-serif`;
    ctx.fillStyle = palette.textSecondary;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const maxTextWidth = canvasWidth * 0.78;
    const lines = this.#textWrapper.wrapText(ctx, `"${affirmation.trim()}"`, maxTextWidth);

    const displayLines = lines.slice(0, 2);
    const lineHeight = Math.round(fontSizeTitle * 0.90);
    const startY = cardY - (displayLines.length - 1) * (lineHeight / 2);

    for (let i = 0; i < displayLines.length; i++) {
      ctx.fillText(displayLines[i], canvasWidth / 2, startY + i * lineHeight);
    }

    ctx.restore();
  }

  /**
   * Stage 5 Scrim: Samples background luminance and injects dynamic dark scrim when washed out.
   *
   * @param {CanvasRenderingContext2D} ctx Context
   * @param {number} width Width
   * @param {number} height Height
   * @param {Object} layout Layout metrics
   */
  #stage5_DynamicScrim(ctx, width, height, layout) {
    if (typeof ctx.getImageData !== 'function') return;

    try {
      const topY = Math.floor(layout.topSafeY);
      const sampleHeight = Math.floor(layout.bottomSafeY - layout.topSafeY);
      const imgData = ctx.getImageData(0, topY, width, Math.max(1, sampleHeight));
      const pixels = imgData.data;

      let totalLuminance = 0;
      const sampleStep = Math.max(4, Math.floor(pixels.length / (256 * 4)));
      let samplesCount = 0;

      for (let i = 0; i < pixels.length; i += sampleStep * 4) {
        const r = pixels[i] / 255;
        const g = pixels[i + 1] / 255;
        const b = pixels[i + 2] / 255;
        const y = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        totalLuminance += y;
        samplesCount++;
      }

      const meanLuminance = samplesCount > 0 ? totalLuminance / samplesCount : 0;

      if (meanLuminance > 0.35 && typeof ctx.createLinearGradient === 'function') {
        ctx.save();
        const gradient = ctx.createLinearGradient(0, layout.topSafeY, 0, layout.bottomSafeY);
        gradient.addColorStop(0, 'rgba(8, 9, 13, 0.45)');
        gradient.addColorStop(0.5, 'rgba(8, 9, 13, 0.65)');
        gradient.addColorStop(1, 'rgba(8, 9, 13, 0.75)');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, layout.topSafeY, width, sampleHeight);
        ctx.restore();
      }
    } catch {
      // Graceful fallback if tainted canvas prevents getImageData
    }
  }

  /**
   * Renders lockscreen wallpaper onto target canvas through the 9-stage offscreen composition pipeline.
   *
   * @param {Object} renderState Complete state payload for rendering
   * @param {number} [renderState.width=1170] Logical canvas width
   * @param {number} [renderState.height=2532] Logical canvas height
   * @param {number} [renderState.dpr=2.0] Supersampling device pixel ratio
   * @param {string} [renderState.theme] Thematic palette identifier
   * @param {string} [renderState.title] Goal title
   * @param {Object} [renderState.timeRemaining] Time remaining snapshot
   * @param {Array<Object>} [renderState.milestones] Milestone items
   * @param {string} [renderState.affirmation] Tailored daily affirmation
   * @param {boolean} [renderState.showSafeZones=false] Whether to show hardware safe-zone guide lines
   * @returns {Promise<void>}
   * @throws {CanvasRenderError} If 2D rendering pipeline encounters unrecoverable failure
   */
  async renderWallpaper(renderState = {}) {
    const ctx = this.#ctx;
    if (!ctx) {
      throw new Context2DUnavailableError('CanvasRenderingContext2D unavailable for wallpaper composition');
    }

    try {
      const baseW = renderState.width || 1170;
      const baseH = renderState.height || 2532;
      const dpr = renderState.dpr || 2.0;
      const themeId = renderState.theme || this.#activeTheme;
      const palette = CanvasRenderer.PALETTES[themeId] || CanvasRenderer.PALETTES.cyber_obsidian;

      this.#stage1_InitBuffer(ctx, baseW, baseH, dpr);
      this.#stage2_BackgroundBase(ctx, baseW, baseH, palette.bgBase);

      const layout = this.#layoutEngine.computeLayout(baseW, baseH);
      this.#stage3_SafeZoneBounds(ctx, layout, Boolean(renderState.showSafeZones));
      this.#stage4_AmbientRadialGlow(ctx, layout, palette.primaryAccent);

      const progressRatio = renderState.timeRemaining?.progressPercent !== undefined
        ? renderState.timeRemaining.progressPercent / 100
        : 0;

      this.#stage5_DynamicScrim(ctx, baseW, baseH, layout);
      this.#stage5_SpecularChronometerArc(ctx, layout, progressRatio, palette);
      this.#stage6_TabularChronometer(ctx, layout, renderState.timeRemaining, palette);
      this.#stage7_MilestoneLadder(ctx, layout, renderState.milestones || [], palette);
      this.#stage8_MotivationalBlock(ctx, layout, renderState.affirmation || '', palette);
    } catch (err) {
      if (err instanceof Context2DUnavailableError) {
        throw err;
      }
      throw new CanvasRenderError(
        `Wallpaper rendering failed: ${err instanceof Error ? err.message : String(err)}`,
        'ERR_CANVAS_RENDER',
        renderState.width || 1170,
        renderState.height || 2532
      );
    }
  }

  /**
   * Stage 9: Lossless PNG Blob export.
   *
   * @param {string} [type='image/png'] MIME format type
   * @param {number} [quality=1.0] Encoding quality
   * @returns {Promise<Blob>}
   */
  async exportBlob(type = 'image/png', quality = 1.0) {
    if (!this.#target) {
      throw new CanvasRenderError('Target canvas unavailable for blob conversion', 'ERR_CANVAS_RENDER');
    }

    if (typeof this.#target.convertToBlob === 'function') {
      return this.#target.convertToBlob({ type, quality });
    }

    if (typeof this.#target.toBlob === 'function') {
      return new Promise((resolve, reject) => {
        this.#target.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new CanvasRenderError('Canvas toBlob returned null', 'ERR_CANVAS_RENDER'));
            }
          },
          type,
          quality
        );
      });
    }

    throw new CanvasRenderError('Target surface does not support blob export', 'ERR_CANVAS_RENDER');
  }

  /**
   * Dispatches native Web Share API with PNG Blob or triggers direct anchor download.
   *
   * @param {string} [filename='countdown-lockscreen.png'] Download filename
   * @returns {Promise<boolean>} True if shared or downloaded successfully
   */
  async shareOrDownload(filename = 'countdown-lockscreen.png') {
    const blob = await this.exportBlob('image/png', 1.0);

    try {
      if (typeof navigator !== 'undefined' && typeof File !== 'undefined' && navigator.canShare) {
        const file = new File([blob], filename, { type: 'image/png' });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: 'Countdown Lock Screen',
            text: 'Your Deadline, Your Design'
          });
          return true;
        }
      }
    } catch {
      // Fallback to programmatic anchor download
    }

    if (typeof document !== 'undefined' && typeof URL !== 'undefined') {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      return true;
    }

    return false;
  }

  /**
   * Tears down context and clears references.
   */
  destroy() {
    this.#ctx = null;
    this.#target = null;
  }
}
