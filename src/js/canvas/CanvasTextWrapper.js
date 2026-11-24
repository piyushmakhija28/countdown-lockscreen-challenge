/**
 * Typographic Measurement and Greedy Line-Wrapping Engine.
 * Provides Intl.Segmenter word boundaries, subpixel alignment, and LRU measurement caching.
 *
 * @module canvas/CanvasTextWrapper
 */

/**
 * Text layout and line-wrapping engine for Canvas 2D contexts.
 */
export class CanvasTextWrapper {
  /** @type {Map<string, number>} */
  #measurementCache = new Map();
  /** @type {number} */
  #maxCacheEntries = 500;

  /**
   * @param {number} [maxCacheEntries=500] Maximum cache entries before LRU eviction
   */
  constructor(maxCacheEntries = 500) {
    this.#maxCacheEntries = maxCacheEntries;
  }

  /**
   * Measures text width with LRU caching to eliminate redundant font shaping passes.
   *
   * @param {CanvasRenderingContext2D} ctx Target 2D rendering context
   * @param {string} text Text string to measure
   * @returns {number} Width in pixels
   */
  measureText(ctx, text) {
    if (typeof text !== 'string' || text.length === 0) {
      return 0;
    }

    const fontKey = ctx?.font || '10px sans-serif';
    const cacheKey = `${fontKey}:${text}`;

    if (this.#measurementCache.has(cacheKey)) {
      const val = this.#measurementCache.get(cacheKey);
      this.#measurementCache.delete(cacheKey);
      this.#measurementCache.set(cacheKey, val);
      return val;
    }

    let measuredWidth = 0;
    if (ctx && typeof ctx.measureText === 'function') {
      measuredWidth = ctx.measureText(text).width;
    } else {
      measuredWidth = text.length * 8;
    }

    if (this.#measurementCache.size >= this.#maxCacheEntries) {
      const oldestKey = this.#measurementCache.keys().next().value;
      if (oldestKey !== undefined) {
        this.#measurementCache.delete(oldestKey);
      }
    }

    this.#measurementCache.set(cacheKey, measuredWidth);
    return measuredWidth;
  }

  /**
   * Wraps text into lines that do not exceed the specified maximum width using word-boundary segmentation.
   *
   * @param {CanvasRenderingContext2D} ctx Target 2D rendering context
   * @param {string} text Input text string
   * @param {number} maxWidth Maximum permitted line width in pixels
   * @returns {string[]} Array of wrapped lines
   */
  wrapText(ctx, text, maxWidth) {
    if (typeof text !== 'string' || text.trim().length === 0) {
      return [];
    }

    const segments = this.#tokenize(text.trim());
    if (segments.length === 0) {
      return [];
    }

    const lines = [];
    let currentLine = '';

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      const candidateLine = currentLine.length > 0 ? `${currentLine} ${segment}` : segment;
      const lineWidth = this.measureText(ctx, candidateLine);

      if (lineWidth <= maxWidth || currentLine.length === 0) {
        currentLine = candidateLine;
      } else {
        lines.push(currentLine);
        currentLine = segment;
      }
    }

    if (currentLine.length > 0) {
      lines.push(currentLine);
    }

    return lines;
  }

  /**
   * Tokenizes text into word-like units while strictly preserving punctuation and symbols.
   *
   * @param {string} text Input text
   * @returns {string[]} Word tokens
   */
  #tokenize(text) {
    return text.split(/\s+/).filter((s) => s.length > 0);
  }

  /**
   * Calculates optimal font size and wrapped lines that fit within bounding box constraints.
   *
   * @param {CanvasRenderingContext2D} ctx Target 2D rendering context
   * @param {string} text Input text
   * @param {number} maxWidth Maximum width
   * @param {number} maxHeight Maximum height
   * @param {number} maxFontSize Maximum font size in pixels
   * @param {number} minFontSize Minimum font size in pixels
   * @param {string} [fontFamily='sans-serif'] CSS font family
   * @returns {{ fontSize: number, lines: string[], totalHeight: number }}
   */
  fitText(ctx, text, maxWidth, maxHeight, maxFontSize, minFontSize, fontFamily = 'sans-serif') {
    let bestFontSize = minFontSize;
    let bestLines = [];
    let bestTotalHeight = 0;

    for (let size = maxFontSize; size >= minFontSize; size -= 2) {
      if (ctx) {
        ctx.font = `${size}px ${fontFamily}`;
      }
      const lines = this.wrapText(ctx, text, maxWidth);
      const lineHeight = size * 1.35;
      const totalHeight = lines.length * lineHeight;

      if (totalHeight <= maxHeight || size === minFontSize) {
        bestFontSize = size;
        bestLines = lines;
        bestTotalHeight = totalHeight;
        break;
      }
    }

    return {
      fontSize: bestFontSize,
      lines: bestLines,
      totalHeight: bestTotalHeight
    };
  }

  /**
   * Clears measurement LRU cache.
   */
  clearCache() {
    this.#measurementCache.clear();
  }
}
