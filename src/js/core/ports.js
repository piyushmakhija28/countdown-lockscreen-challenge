/**
 * Clean Architecture Abstract Port Interfaces for Countdown Lockscreen Engine.
 * Decouples core business logic from browser DOM, Web APIs, and external networks.
 *
 * @module core/ports
 */

/**
 * Abstract Port: Tick Scheduling strategy decoupled from window.requestAnimationFrame.
 *
 * @interface ITickScheduler
 */
export class ITickScheduler {
  /**
   * Schedules a chronometer tick callback.
   *
   * @param {(timestamp: number) => void} callback Function invoked on tick with high-resolution timestamp
   * @returns {number} Cancellation handle
   * @throws {Error} When invoked directly on abstract port interface
   */
  requestTick(callback) {
    throw new Error('ITickScheduler.requestTick: abstract method must be implemented by adapter');
  }

  /**
   * Cancels a scheduled chronometer tick.
   *
   * @param {number} handle Cancellation handle previously returned by requestTick
   * @returns {void}
   * @throws {Error} When invoked directly on abstract port interface
   */
  cancelTick(handle) {
    throw new Error('ITickScheduler.cancelTick: abstract method must be implemented by adapter');
  }
}

/**
 * Abstract Port: Milestone planning strategy decoupled from Google Gemini network client.
 *
 * @interface IMilestonePlanner
 */
export class IMilestonePlanner {
  /**
   * Deconstructs a goal into backward sequential milestones.
   *
   * @param {string} goalTitle Sanitized goal title
   * @param {Date} deadline Target deadline timestamp
   * @returns {Promise<{ milestones: Array<{ id: string, title: string, targetOffsetRatio: number, isCompleted: boolean }>, affirmation: string }>} Milestone plan response
   * @throws {Error} When invoked directly on abstract port interface
   */
  async generatePlan(goalTitle, deadline) {
    throw new Error('IMilestonePlanner.generatePlan: abstract method must be implemented by adapter');
  }
}

/**
 * Abstract Port: Abstract render target decoupling CanvasRenderer from DOM HTMLCanvasElement.
 *
 * @interface IRenderTarget
 */
export class IRenderTarget {
  /**
   * Gets target pixel width.
   *
   * @returns {number} Target pixel width
   * @throws {Error} When invoked directly on abstract port interface
   */
  get width() {
    throw new Error('IRenderTarget.width: abstract getter must be implemented by adapter');
  }

  /**
   * Sets target pixel width.
   *
   * @param {number} val New width in physical pixels
   * @throws {Error} When invoked directly on abstract port interface
   */
  set width(val) {
    throw new Error('IRenderTarget.width: abstract setter must be implemented by adapter');
  }

  /**
   * Gets target pixel height.
   *
   * @returns {number} Target pixel height
   * @throws {Error} When invoked directly on abstract port interface
   */
  get height() {
    throw new Error('IRenderTarget.height: abstract getter must be implemented by adapter');
  }

  /**
   * Sets target pixel height.
   *
   * @param {number} val New height in physical pixels
   * @throws {Error} When invoked directly on abstract port interface
   */
  set height(val) {
    throw new Error('IRenderTarget.height: abstract setter must be implemented by adapter');
  }

  /**
   * Obtains 2D rendering context from the target surface.
   *
   * @param {'2d'} contextType Context type identifier
   * @param {CanvasRenderingContext2DSettings} [options] Context creation attributes
   * @returns {CanvasRenderingContext2D | null} Rendering context or null if unavailable
   * @throws {Error} When invoked directly on abstract port interface
   */
  getContext(contextType, options) {
    throw new Error('IRenderTarget.getContext: abstract method must be implemented by adapter');
  }

  /**
   * Converts render target surface to a Blob representation.
   *
   * @param {string} [type='image/png'] MIME type format
   * @param {number} [quality=1.0] Encoding quality between 0.0 and 1.0
   * @returns {Promise<Blob>} Encoded binary blob
   * @throws {Error} When invoked directly on abstract port interface
   */
  convertToBlob(type, quality) {
    throw new Error('IRenderTarget.convertToBlob: abstract method must be implemented by adapter');
  }
}

/**
 * Abstract Port: Wallpaper rendering contract.
 *
 * @interface IWallpaperRenderer
 */
export class IWallpaperRenderer {
  /**
   * Renders lockscreen wallpaper onto target canvas.
   *
   * @param {Object} renderState Snapshot of state required for canvas composition
   * @returns {Promise<void>} Resolves when render pass completes
   * @throws {Error} When invoked directly on abstract port interface
   */
  async renderWallpaper(renderState) {
    throw new Error('IWallpaperRenderer.renderWallpaper: abstract method must be implemented by adapter');
  }

  /**
   * Exports rendered wallpaper as PNG Blob.
   *
   * @returns {Promise<Blob>} Encoded image blob
   * @throws {Error} When invoked directly on abstract port interface
   */
  async exportBlob() {
    throw new Error('IWallpaperRenderer.exportBlob: abstract method must be implemented by adapter');
  }
}

/**
 * Abstract Port: Persistent state storage and navigation synchronization.
 *
 * @interface IStateStoragePort
 */
export class IStateStoragePort {
  /**
   * Persists an ephemeral key-value pair.
   *
   * @param {string} key Storage lookup key
   * @param {string} value Serialized value string
   * @returns {void}
   * @throws {Error} When invoked directly on abstract port interface
   */
  saveEphemeral(key, value) {
    throw new Error('IStateStoragePort.saveEphemeral: abstract method must be implemented by adapter');
  }

  /**
   * Loads an ephemeral value by key.
   *
   * @param {string} key Storage lookup key
   * @returns {string | null} Stored string value or null if non-existent
   * @throws {Error} When invoked directly on abstract port interface
   */
  loadEphemeral(key) {
    throw new Error('IStateStoragePort.loadEphemeral: abstract method must be implemented by adapter');
  }

  /**
   * Updates navigation state hash without causing page reload.
   *
   * @param {string} hashFragment URL hash fragment string
   * @returns {void}
   * @throws {Error} When invoked directly on abstract port interface
   */
  replaceNavigationState(hashFragment) {
    throw new Error('IStateStoragePort.replaceNavigationState: abstract method must be implemented by adapter');
  }
}

/**
 * Abstract Port: Host environment platform lifecycle observer.
 *
 * @interface IPlatformLifecycle
 */
export class IPlatformLifecycle {
  /**
   * Registers a callback invoked when document becomes visible or system wakes.
   *
   * @param {() => void} callback Function invoked on wake transition
   * @returns {() => void} Unbind cleanup function
   * @throws {Error} When invoked directly on abstract port interface
   */
  onWake(callback) {
    throw new Error('IPlatformLifecycle.onWake: abstract method must be implemented by adapter');
  }

  /**
   * Registers a callback invoked when document is hidden or page unloads.
   *
   * @param {() => void} callback Function invoked on sleep transition
   * @returns {() => void} Unbind cleanup function
   * @throws {Error} When invoked directly on abstract port interface
   */
  onSleep(callback) {
    throw new Error('IPlatformLifecycle.onSleep: abstract method must be implemented by adapter');
  }

  /**
   * Returns true if document is active and in foreground.
   *
   * @returns {boolean} Visibility state
   * @throws {Error} When invoked directly on abstract port interface
   */
  isDocumentVisible() {
    throw new Error('IPlatformLifecycle.isDocumentVisible: abstract method must be implemented by adapter');
  }
}

/**
 * @typedef {Object} SensoryTriggerResult
 * @property {boolean} success Whether feedback was successfully triggered
 * @property {boolean} visualTriggered Whether visual animation pop or particles fired
 * @property {boolean} audioTriggered Whether Web Audio synthesizer chime or fanfare sounded
 * @property {boolean} hapticTriggered Whether device vibration feedback was executed
 * @property {number} jitterMs Inter-sensory timing delta in milliseconds
 */

/**
 * Abstract Port: Tri-modal sensory immersion coordinator.
 * Synchronizes visual particle dynamics, procedural Web Audio ADSR, and hardware haptic pulses.
 *
 * @interface ISensoryCoordinator
 */
export class ISensoryCoordinator {
  /**
   * Triggers deterministic tri-modal feedback upon milestone checkbox completion.
   *
   * @param {string} themeId Active aesthetic theme identifier
   * @returns {Promise<SensoryTriggerResult>} Result of tri-modal feedback triggering
   * @throws {Error} When invoked directly on abstract port interface
   */
  async triggerMilestoneFeedback(themeId) {
    throw new Error('ISensoryCoordinator.triggerMilestoneFeedback: abstract method must be implemented by adapter');
  }

  /**
   * Triggers continuous celebratory feedback upon target timer expiration.
   *
   * @param {string} themeId Active aesthetic theme identifier
   * @returns {Promise<SensoryTriggerResult>} Result of victory celebration triggering
   * @throws {Error} When invoked directly on abstract port interface
   */
  async triggerVictoryCelebration(themeId) {
    throw new Error('ISensoryCoordinator.triggerVictoryCelebration: abstract method must be implemented by adapter');
  }

  /**
   * Halts active victory fanfare and cleans up running particle animation loops.
   *
   * @returns {void}
   * @throws {Error} When invoked directly on abstract port interface
   */
  stopCelebration() {
    throw new Error('ISensoryCoordinator.stopCelebration: abstract method must be implemented by adapter');
  }

  /**
   * Releases Web Audio AudioContext, terminates animation loops, and cleans up event listeners.
   *
   * @returns {void}
   * @throws {Error} When invoked directly on abstract port interface
   */
  dispose() {
    throw new Error('ISensoryCoordinator.dispose: abstract method must be implemented by adapter');
  }
}
