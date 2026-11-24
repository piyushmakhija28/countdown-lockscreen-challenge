/**
 * Adaptive Buffer Allocator for High-DPI Mobile Lockscreen Wallpapers.
 * Solves closed-form dual-constraint optimization formula ensuring rasterization
 * never exceeds WebKit Safari 16.7M px area or 4096px hardware texture dimensions.
 *
 * @module canvas/AdaptiveBufferAllocator
 */

/**
 * Closed-form buffer dimension allocator protecting against GPU allocation crashes.
 */
export class AdaptiveBufferAllocator {
  /**
   * Maximum allowed pixel area ceiling on iOS WebKit Safari (2^24 pixels).
   *
   * @type {number}
   */
  static WEBKIT_MAX_AREA = 16777216;

  /**
   * Default hardware maximum texture dimension for mobile GPUs.
   *
   * @type {number}
   */
  static DEFAULT_MAX_DIMENSION = 4096;

  /**
   * Cached maximum hardware texture dimension.
   *
   * @type {number | null}
   */
  static #cachedMaxDim = null;

  /**
   * Probes GPU WebGL context for maximum hardware texture dimension.
   *
   * @returns {number} Maximum safe texture dimension (4096 or 8192)
   */
  static getMaxTextureDimension() {
    if (AdaptiveBufferAllocator.#cachedMaxDim !== null) {
      return AdaptiveBufferAllocator.#cachedMaxDim;
    }

    try {
      if (typeof document !== 'undefined') {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (gl) {
          const maxDim = gl.getParameter(gl.MAX_TEXTURE_SIZE);
          if (typeof maxDim === 'number' && maxDim > 0) {
            AdaptiveBufferAllocator.#cachedMaxDim = maxDim;
          }
        }
      }
    } catch {
      AdaptiveBufferAllocator.#cachedMaxDim = AdaptiveBufferAllocator.DEFAULT_MAX_DIMENSION;
    }

    if (AdaptiveBufferAllocator.#cachedMaxDim === null) {
      AdaptiveBufferAllocator.#cachedMaxDim = AdaptiveBufferAllocator.DEFAULT_MAX_DIMENSION;
    }

    try {
      if (typeof navigator !== 'undefined') {
        const isConstrainedIos =
          /iPhone OS (1[2-9]|[2-9][0-9])|CPU OS (1[2-9]|[2-9][0-9])/i.test(navigator.userAgent || '') &&
          (navigator.hardwareConcurrency || 4) <= 4;
        if (isConstrainedIos && AdaptiveBufferAllocator.#cachedMaxDim > 4096) {
          AdaptiveBufferAllocator.#cachedMaxDim = 4096;
        }
      }
    } catch {
      // Retain resolved dimension
    }

    return AdaptiveBufferAllocator.#cachedMaxDim;
  }

  /**
   * Overrides or resets maximum texture dimension (primarily for test environments).
   *
   * @param {number | null} dim Texture dimension in pixels or null to reset
   */
  static setMaxTextureDimension(dim) {
    AdaptiveBufferAllocator.#cachedMaxDim = dim;
  }

  /**
   * Clears cached texture dimension probe.
   */
  static resetCache() {
    AdaptiveBufferAllocator.#cachedMaxDim = null;
  }

  /**
   * Computes optimal canvas buffer dimensions respecting GPU limits and WebKit ceilings.
   * Closed-form formula: S = min(requestedDpr, sqrt(16.7M / (W * H)), maxDim / max(W, H)).
   *
   * @param {number} baseWidth Base logical canvas width in pixels
   * @param {number} baseHeight Base logical canvas height in pixels
   * @param {number} [requestedDpr=2.0] Desired supersampling device pixel ratio
   * @returns {{ width: number, height: number, scaleFactor: number, isConstrained: boolean, totalPixels: number, maxDimension: number }}
   */
  static computeOptimalBuffer(baseWidth, baseHeight, requestedDpr = 2.0) {
    const validWidth = Math.max(1, Math.floor(baseWidth));
    const validHeight = Math.max(1, Math.floor(baseHeight));
    const maxDim = AdaptiveBufferAllocator.getMaxTextureDimension();

    const areaScale = Math.sqrt(AdaptiveBufferAllocator.WEBKIT_MAX_AREA / (validWidth * validHeight));
    const dimensionScale = maxDim / Math.max(validWidth, validHeight);
    const scaleFactor = Math.min(requestedDpr, areaScale, dimensionScale);

    const width = Math.floor(validWidth * scaleFactor);
    const height = Math.floor(validHeight * scaleFactor);
    const totalPixels = width * height;

    return {
      width,
      height,
      scaleFactor,
      isConstrained: scaleFactor < requestedDpr,
      totalPixels,
      maxDimension: Math.max(width, height)
    };
  }
}
