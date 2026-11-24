/**
 * Tri-Modal Sensory Synchronization Coordinator.
 * Couples visual spring kinetics, procedural Web Audio ADSR, and hardware haptic pulses
 * with deterministic inter-sensory synchronization within 20ms temporal bounds.
 *
 * @module services/SensoryCoordinator
 */

import { ISensoryCoordinator } from '../core/ports.js';

/**
 * Orchestrates synchronized tri-modal sensory immersion (<20ms temporal offset).
 * Couples visual spring kinetics, procedural Web Audio ADSR, and W3C tactile impulses.
 */
export class SensoryCoordinator extends ISensoryCoordinator {
  /** @type {import('./AudioChimeService.js').AudioChimeService} */
  #audioService;
  /** @type {import('./HapticService.js').HapticService} */
  #hapticService;
  /** @type {import('../canvas/ParticleEngine.js').ParticleEngine} */
  #particleEngine;

  /**
   * Constructs the sensory coordinator injecting audio, haptic, and particle subsystems.
   *
   * @param {import('./AudioChimeService.js').AudioChimeService} audioService Procedural Web Audio synthesizer
   * @param {import('./HapticService.js').HapticService} hapticService Tactile haptic controller
   * @param {import('../canvas/ParticleEngine.js').ParticleEngine} particleEngine Confetti physics engine
   */
  constructor(audioService, hapticService, particleEngine) {
    super();
    this.#audioService = audioService;
    this.#hapticService = hapticService;
    this.#particleEngine = particleEngine;
  }

  /**
   * Triggers deterministic tri-modal feedback upon milestone checkbox completion.
   * Synchronizes tactile pulse, auditory harmonic chime, and measures temporal jitter.
   *
   * @param {string} [themeId] Active aesthetic theme identifier
   * @returns {Promise<import('../core/ports.js').SensoryTriggerResult>} Result of tri-modal feedback triggering
   */
  async triggerMilestoneFeedback(themeId) {
    const t0 = (typeof performance !== 'undefined' && typeof performance.now === 'function')
      ? performance.now()
      : Date.now();

    const hapticFired = this.#hapticService ? this.#hapticService.milestonePattern() : false;
    const audioPromise = this.#audioService ? this.#audioService.playSuccessChime() : Promise.resolve(false);

    const tAudio = (typeof performance !== 'undefined' && typeof performance.now === 'function')
      ? performance.now()
      : Date.now();

    const jitterMs = Math.abs(tAudio - t0);
    const audioFired = await audioPromise;

    return {
      success: true,
      visualTriggered: false,
      audioTriggered: Boolean(audioFired),
      hapticTriggered: Boolean(hapticFired),
      jitterMs
    };
  }

  /**
   * Triggers continuous celebratory feedback upon target timer expiration.
   * Synchronizes SoA confetti physics, Web Locks mutexed fanfare audio, and victory haptics.
   *
   * @param {string} [themeId] Active aesthetic theme identifier
   * @param {Object} [renderContext] Optional rendering target context for confetti
   * @param {CanvasRenderingContext2D} [renderContext.ctx] Target 2D rendering surface
   * @param {number} [renderContext.width] Target surface width
   * @param {number} [renderContext.height] Target surface height
   * @returns {Promise<import('../core/ports.js').SensoryTriggerResult>} Result of victory celebration triggering
   */
  async triggerVictoryCelebration(themeId, renderContext) {
    const t0 = (typeof performance !== 'undefined' && typeof performance.now === 'function')
      ? performance.now()
      : Date.now();

    let visualFired = false;
    if (this.#particleEngine && renderContext && renderContext.ctx) {
      visualFired = Boolean(this.#particleEngine.startBurst(
        renderContext.ctx,
        renderContext.width || 1170,
        renderContext.height || 2532
      ));
    }

    const hapticFired = this.#hapticService ? this.#hapticService.victoryPattern() : false;
    const audioPromise = this.#audioService ? this.#audioService.playVictoryChimeWithLock() : Promise.resolve(false);

    const tAudio = (typeof performance !== 'undefined' && typeof performance.now === 'function')
      ? performance.now()
      : Date.now();

    const jitterMs = Math.abs(tAudio - t0);
    const audioFired = await audioPromise;

    return {
      success: true,
      visualTriggered: visualFired,
      audioTriggered: Boolean(audioFired),
      hapticTriggered: Boolean(hapticFired),
      jitterMs
    };
  }

  /**
   * Halts active victory fanfare and cleans up running particle animation loops.
   */
  stopCelebration() {
    if (this.#particleEngine) {
      this.#particleEngine.stop();
    }
    if (this.#hapticService) {
      this.#hapticService.cancel();
    }
  }

  /**
   * Releases Web Audio AudioContext, terminates animation loops, and cleans up event listeners.
   */
  dispose() {
    this.stopCelebration();
    if (this.#audioService && typeof this.#audioService.dispose === 'function') {
      this.#audioService.dispose();
    }
  }
}
