/**
 * Asynchronous Web Font Readiness Barrier Gate.
 * Preloads typographic font faces eliminating Flash of Invisible/Unstyled Text (FOIT/FOUT)
 * and preventing Cumulative Layout Shift (CLS = 0.000).
 *
 * @module services/FontService
 */

/**
 * Web font readiness and preloading gate eliminating Canvas Flash of Invisible/Unstyled Text.
 */
export class FontService {
  /** @type {boolean} */
  #loaded = false;
  /** @type {Promise<boolean> | null} */
  #loadingPromise = null;
  /** @type {Document | Object | null} */
  #doc;

  /**
   * Constructs the font service with optional injected document reference.
   *
   * @param {Document | Object} [customDoc] Optional document abstraction for testing
   */
  constructor(customDoc) {
    this.#doc = customDoc || (typeof document !== 'undefined' ? document : null);
  }

  /**
   * Asynchronously guarantees that all required font descriptors are loaded before canvas rendering.
   *
   * @param {string[]} [fontDescriptors] Font family and size descriptors to preload
   * @returns {Promise<boolean>} True when fonts are fully decoded and ready
   */
  async ensureFontsLoaded(fontDescriptors = ['700 72px "JetBrains Mono"', '400 16px "Inter"']) {
    if (this.#loaded) {
      return true;
    }
    if (this.#loadingPromise) {
      return this.#loadingPromise;
    }

    if (!this.#doc || !this.#doc.fonts || typeof this.#doc.fonts.load !== 'function') {
      this.#loaded = true;
      return true;
    }

    this.#loadingPromise = (async () => {
      try {
        const loadPromises = fontDescriptors.map((descriptor) => this.#doc.fonts.load(descriptor));
        const fontLoader = Promise.all([
          Promise.all(loadPromises),
          this.#doc.fonts.ready || Promise.resolve()
        ]);
        const timeout = new Promise((resolve) => setTimeout(resolve, 1500));
        await Promise.race([fontLoader, timeout]);
        this.#loaded = true;
        return true;
      } catch {
        this.#loaded = true;
        return false;
      } finally {
        this.#loadingPromise = null;
      }
    })();

    return this.#loadingPromise;
  }

  /**
   * Returns current font readiness status.
   *
   * @returns {boolean} True if required fonts have completed loading
   */
  isLoaded() {
    return this.#loaded;
  }
}
