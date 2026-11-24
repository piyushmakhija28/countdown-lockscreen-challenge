/**
 * Master Compositional Application Root for Countdown Lock Screen Challenge.
 * Orchestrates domain state store, DualClock chronometer engine, Gemini AI client,
 * 9-stage canvas wallpaper renderer, safe-zone simulator, and tri-modal sensory immersion.
 *
 * @module app
 */

import { ActionTypes, StateStore } from './core/StateStore.js';
import { InputSanitizer } from './core/InputSanitizer.js';
import { UrlStateService } from './core/UrlStateService.js';
import { TokenBucketHistoryGuard } from './core/TokenBucketHistoryGuard.js';
import { ResilientStorageService } from './services/ResilientStorageService.js';
import { DualClockTimeEngine } from './core/DualClockTimeEngine.js';
import { WorkerTickerAdapter } from './services/WorkerTickerAdapter.js';
import { MilestoneManager } from './core/MilestoneManager.js';
import { GeminiAiClient } from './ai/GeminiAiClient.js';
import { HeuristicGenerator } from './ai/HeuristicGenerator.js';
import { AdaptiveBufferAllocator } from './canvas/AdaptiveBufferAllocator.js';
import { ResponsiveLayoutEngine } from './canvas/ResponsiveLayoutEngine.js';
import { CanvasTextWrapper } from './canvas/CanvasTextWrapper.js';
import { SafeZoneOverlay } from './canvas/SafeZoneOverlay.js';
import { CanvasRenderer } from './canvas/CanvasRenderer.js';
import { FontService } from './services/FontService.js';
import { SensoryCoordinator } from './services/SensoryCoordinator.js';
import { AudioChimeService } from './services/AudioChimeService.js';
import { HapticService } from './services/HapticService.js';
import { ParticleEngine } from './canvas/ParticleEngine.js';

/**
 * Compositional application root orchestrating state store, chronometer, DOM views, and export engine.
 */
export class CountdownApp {
  /** @type {StateStore} */
  #store;
  /** @type {DualClockTimeEngine} */
  #timeEngine;
  /** @type {WorkerTickerAdapter} */
  #tickerAdapter;
  /** @type {MilestoneManager} */
  #milestoneManager;
  /** @type {GeminiAiClient} */
  #geminiClient;
  /** @type {HeuristicGenerator} */
  #heuristicGenerator;
  /** @type {UrlStateService} */
  #urlStateService;
  /** @type {TokenBucketHistoryGuard} */
  #historyGuard;
  /** @type {ResilientStorageService} */
  #storageService;
  /** @type {CanvasRenderer | null} */
  #canvasRenderer;
  /** @type {SafeZoneOverlay} */
  #safeZoneOverlay;
  /** @type {FontService} */
  #fontService;
  /** @type {SensoryCoordinator} */
  #sensoryCoordinator;
  /** @type {AudioChimeService} */
  #audioService;
  /** @type {HapticService} */
  #hapticService;
  /** @type {ParticleEngine} */
  #particleEngine;
  /** @type {Window | Object | null} */
  #window;
  /** @type {Document | Object | null} */
  #document;
  /** @type {boolean} */
  #isInitialized = false;
  /** @type {(() => void) | null} */
  #unsubscribeStore = null;

  /**
   * Constructs application root with full dependency injection support.
   *
   * @param {Object} [deps={}] Optional injected subsystems and environment references
   */
  constructor(deps = {}) {
    this.#window = deps.window || (typeof window !== 'undefined' ? window : null);
    this.#document = deps.document || (typeof document !== 'undefined' ? document : null);

    this.#storageService = deps.storageService || new ResilientStorageService();
    this.#urlStateService = deps.urlStateService || new UrlStateService();
    this.#tickerAdapter = deps.tickerAdapter || new WorkerTickerAdapter();
    this.#fontService = deps.fontService || new FontService(this.#document);
    this.#safeZoneOverlay = deps.safeZoneOverlay || new SafeZoneOverlay();
    this.#heuristicGenerator = deps.heuristicGenerator || new HeuristicGenerator();
    this.#geminiClient = deps.geminiClient || new GeminiAiClient();
    this.#audioService = deps.audioService || new AudioChimeService({
      window: this.#window,
      document: this.#document,
      navigator: this.#window?.navigator
    });
    this.#hapticService = deps.hapticService || new HapticService(this.#window?.navigator);
    this.#particleEngine = deps.particleEngine || new ParticleEngine(this.#window);

    this.#sensoryCoordinator = deps.sensoryCoordinator || new SensoryCoordinator(
      this.#audioService,
      this.#hapticService,
      this.#particleEngine
    );

    const lifecycleAdapter = {
      onWake: (cb) => {
        if (this.#document && typeof this.#document.addEventListener === 'function') {
          this.#document.addEventListener('visibilitychange', () => {
            if (this.#document.visibilityState === 'visible') cb();
          });
        }
        return () => {};
      },
      onSleep: (cb) => {
        if (this.#document && typeof this.#document.addEventListener === 'function') {
          this.#document.addEventListener('visibilitychange', () => {
            if (this.#document.visibilityState === 'hidden') cb();
          });
        }
        return () => {};
      },
      isDocumentVisible: () => (this.#document ? this.#document.visibilityState === 'visible' : true)
    };

    this.#historyGuard = deps.historyGuard || new TokenBucketHistoryGuard(
      this.#storageService,
      lifecycleAdapter
    );

    const defaultDeadline = new Date(Date.now() + 7 * 86400000).toISOString();
    const defaultMilestones = HeuristicGenerator.generatePlan(
      'Master AI Skills Studio Challenge',
      new Date(defaultDeadline)
    ).milestones;

    const initialState = {
      goalTitle: 'Master AI Skills Studio Challenge',
      deadline: defaultDeadline,
      milestones: defaultMilestones,
      affirmation: 'Every day of disciplined execution brings the summit closer.',
      selectedTheme: 'cyber_obsidian',
      isOverlayVisible: false,
      isPlanning: false,
      isExpired: false
    };

    this.#store = deps.store || new StateStore(initialState);
    this.#milestoneManager = deps.milestoneManager || new MilestoneManager(initialState.milestones);

    this.#timeEngine = deps.timeEngine || new DualClockTimeEngine(
      this.#tickerAdapter,
      lifecycleAdapter
    );

    this.#canvasRenderer = deps.canvasRenderer || null;
  }

  /**
   * Initializes and boots application lifecycle.
   * Hydrates state, preloads fonts, mounts canvas, starts chronometer, and binds UI events.
   *
   * @returns {Promise<boolean>} True when boot completes successfully
   */
  async init() {
    if (this.#isInitialized) {
      return true;
    }

    await this.#hydrateState();
    await this.#fontService.ensureFontsLoaded();
    this.#mountCanvas();
    this.#connectTimeEngine();
    this.#subscribeState();
    this.#bindDomEvents();
    this.#registerServiceWorker();

    this.#isInitialized = true;
    return true;
  }

  /**
   * Hydrates state from URL hash or persistent local storage.
   */
  async #hydrateState() {
    let hydrated = null;

    if (this.#window && this.#window.location && this.#window.location.hash) {
      const hash = this.#window.location.hash.startsWith('#')
        ? this.#window.location.hash.slice(1)
        : this.#window.location.hash;
      try {
        hydrated = await this.#urlStateService.deserialize(hash);
      } catch {}
    }

    if (!hydrated) {
      try {
        const stored = this.#storageService.loadEphemeral('cls_active_state');
        if (stored) {
          hydrated = JSON.parse(stored);
        }
      } catch {}
    }

    if (hydrated) {
      this.#store.dispatch({
        type: ActionTypes.HYDRATE_URL_STATE,
        payload: {
          goalTitle: hydrated.goalTitle || this.#store.getState().goalTitle,
          deadline: hydrated.deadline || this.#store.getState().deadline,
          milestones: hydrated.milestones || this.#store.getState().milestones,
          affirmation: hydrated.affirmation || this.#store.getState().affirmation,
          selectedTheme: hydrated.selectedTheme || hydrated.theme || this.#store.getState().selectedTheme
        }
      });

      if (hydrated.milestones) {
        this.#milestoneManager.setMilestones(hydrated.milestones);
      }
    }
  }

  /**
   * Mounts canvas wallpaper renderer onto DOM canvas or target abstraction.
   */
  #mountCanvas() {
    if (this.#canvasRenderer) {
      return;
    }

    let canvasElement = null;
    if (this.#document && typeof this.#document.getElementById === 'function') {
      canvasElement = this.#document.getElementById('lockscreen-canvas');
    }

    if (canvasElement) {
      this.#canvasRenderer = new CanvasRenderer({
        target: canvasElement,
        allocator: AdaptiveBufferAllocator,
        layoutEngine: ResponsiveLayoutEngine,
        fontService: this.#fontService,
        textWrapper: new CanvasTextWrapper(),
        safeZoneOverlay: this.#safeZoneOverlay
      });

      const currentTheme = this.#store.getState().selectedTheme;
      if (currentTheme) {
        this.#canvasRenderer.updateThemePalette(currentTheme);
      }
    }
  }

  /**
   * Connects chronometer time engine tick and expiration events.
   */
  #connectTimeEngine() {
    const currentState = this.#store.getState();
    const targetDate = new Date(currentState.deadline);

    const onTick = (timeSnapshot) => {
      this.#store.dispatch({
        type: ActionTypes.TICK_CHRONOMETER,
        payload: { timeRemaining: timeSnapshot }
      });
      this.#renderWallpaper(timeSnapshot);
    };

    const onExpire = async () => {
      this.#store.dispatch({ type: ActionTypes.GOAL_EXPIRED });
      const state = this.#store.getState();
      const ctx = this.#canvasRenderer?.getContext();
      const width = this.#canvasRenderer?.getTarget()?.width || 1170;
      const height = this.#canvasRenderer?.getTarget()?.height || 2532;

      await this.#sensoryCoordinator.triggerVictoryCelebration(state.selectedTheme, {
        ctx,
        width,
        height
      });
    };

    if (this.#timeEngine && typeof this.#timeEngine.startTicker === 'function') {
      this.#timeEngine.startTicker(targetDate, onTick, onExpire);
    }
  }

  /**
   * Subscribes store updates to render wallpaper, sync URL hash, and update DOM.
   */
  #subscribeState() {
    this.#unsubscribeStore = this.#store.subscribe((state) => {
      this.#syncUrlAndStorage(state);
      this.#syncDom(state);
      this.#renderWallpaper();
    });
  }

  /**
   * Synchronizes current state into throttled URL hash and persistent storage.
   *
   * @param {Object} state Active state snapshot
   */
  async #syncUrlAndStorage(state) {
    try {
      const serializableState = {
        goalTitle: state.goalTitle,
        deadline: state.deadline,
        milestones: state.milestones,
        affirmation: state.affirmation,
        selectedTheme: state.selectedTheme
      };

      const serializedJson = JSON.stringify(serializableState);
      this.#storageService.saveEphemeral('cls_active_state', serializedJson);

      const encodedHash = await this.#urlStateService.serialize(serializableState);
      this.#historyGuard.pushStateUpdate(encodedHash);
    } catch {}
  }

  /**
   * Renders wallpaper onto canvas surface.
   *
   * @param {Object} [timeSnapshot] Optional chronometer snapshot
   */
  #renderWallpaper(timeSnapshot) {
    if (!this.#canvasRenderer) {
      return;
    }

    const state = this.#store.getState();
    const snap = timeSnapshot || state.timeRemaining || (
      this.#timeEngine && typeof this.#timeEngine.calculateRemaining === 'function'
        ? this.#timeEngine.calculateRemaining(new Date(state.deadline).getTime(), Date.now())
        : null
    );

    this.#canvasRenderer.renderWallpaper({
      goalTitle: state.goalTitle,
      deadline: state.deadline,
      timeRemaining: snap,
      milestones: state.milestones,
      affirmation: state.affirmation,
      theme: state.selectedTheme,
      showSafeZones: this.#safeZoneOverlay.isVisible()
    }).catch(() => {});
  }

  /**
   * Synchronizes DOM input elements, milestone lists, and theme selections.
   *
   * @param {Object} state Active state snapshot
   */
  #syncDom(state) {
    if (!this.#document) {
      return;
    }

    const titleInput = this.#document.getElementById('goal-title-input');
    if (titleInput && titleInput.value !== state.goalTitle) {
      titleInput.value = state.goalTitle || '';
    }

    const charCount = this.#document.getElementById('char-count');
    if (charCount) {
      charCount.textContent = `${(state.goalTitle || '').length}/60`;
    }

    const deadlineInput = this.#document.getElementById('deadline-input');
    if (deadlineInput && state.deadline) {
      const formattedIso = new Date(state.deadline).toISOString().slice(0, 16);
      if (deadlineInput.value !== formattedIso) {
        deadlineInput.value = formattedIso;
      }
    }

    const themeChips = this.#document.querySelectorAll('[data-theme-id]');
    themeChips.forEach((chip) => {
      const chipTheme = chip.getAttribute('data-theme-id');
      const isActive = chipTheme === state.selectedTheme;
      chip.setAttribute('data-active', String(isActive));
      chip.setAttribute('aria-checked', String(isActive));
    });

    const affirmationBox = this.#document.getElementById('affirmation-container');
    const affirmationText = this.#document.getElementById('affirmation-text');
    if (affirmationBox && affirmationText) {
      if (state.affirmation) {
        affirmationText.textContent = state.affirmation;
        affirmationBox.style.display = 'block';
      } else {
        affirmationBox.style.display = 'none';
      }
    }

    const milestones = state.milestones || [];
    const completedCount = milestones.filter((m) => m.isCompleted || m.completed).length;
    const totalCount = milestones.length;
    const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    const progressBadge = this.#document.getElementById('progress-badge-text');
    if (progressBadge) {
      progressBadge.textContent = `${completedCount} / ${totalCount} Complete (${pct}%)`;
    }

    const progressBar = this.#document.getElementById('milestone-progress-bar');
    if (progressBar) {
      progressBar.style.width = `${pct}%`;
    }

    const urgencyBadge = this.#document.getElementById('urgency-badge-text');
    if (urgencyBadge && state.deadline) {
      const remainingMs = new Date(state.deadline).getTime() - Date.now();
      const remainingDays = Math.max(0, Math.ceil(remainingMs / 86400000));
      urgencyBadge.textContent = `${remainingDays} Day${remainingDays === 1 ? '' : 's'} Left · ${remainingDays <= 3 ? 'Urgent Sprint' : 'High Focus'}`;
    }

    this.#renderMilestonesDom(state.milestones || []);
  }

  /**
   * Renders milestone checklist nodes into the container.
   *
   * @param {Array<Object>} milestones Milestone list
   */
  #renderMilestonesDom(milestones) {
    const container = this.#document?.getElementById('milestones-container');
    if (!container) {
      return;
    }

    container.innerHTML = '';
    milestones.forEach((item) => {
      const node = this.#document.createElement('div');
      node.className = 'milestone-item';
      node.setAttribute('role', 'listitem');

      const checkbox = this.#document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'milestone-checkbox fitts-touch-target';
      checkbox.checked = Boolean(item.isCompleted);
      checkbox.setAttribute('aria-label', `Mark "${item.title}" complete`);
      checkbox.addEventListener('change', () => {
        this.toggleMilestone(item.id);
      });

      const titleSpan = this.#document.createElement('span');
      titleSpan.className = 'milestone-title-text';
      titleSpan.textContent = item.title;
      titleSpan.setAttribute('data-completed', String(Boolean(item.isCompleted)));

      const pillSpan = this.#document.createElement('span');
      pillSpan.className = 'milestone-offset-pill';
      const pct = Math.round((item.targetOffsetRatio || 0) * 100);
      pillSpan.textContent = `${pct}%`;

      node.appendChild(checkbox);
      node.appendChild(titleSpan);
      node.appendChild(pillSpan);
      container.appendChild(node);
    });
  }

  /**
   * Attaches event listeners to interactive DOM elements.
   */
  #bindDomEvents() {
    if (!this.#document) {
      return;
    }

    const titleInput = this.#document.getElementById('goal-title-input');
    if (titleInput) {
      titleInput.addEventListener('input', (evt) => {
        const raw = evt.target.value;
        const sanitized = InputSanitizer.sanitizeGoalTitle(raw);
        this.#store.dispatch({
          type: ActionTypes.SET_GOAL_INPUT,
          payload: {
            title: sanitized,
            deadline: this.#store.getState().deadline
          }
        });
      });
    }

    const deadlineInput = this.#document.getElementById('deadline-input');
    if (deadlineInput) {
      const nowIso = new Date().toISOString().slice(0, 16);
      deadlineInput.min = nowIso;
      deadlineInput.addEventListener('change', (evt) => {
        const val = evt.target.value;
        if (!val) return;
        const d = new Date(val);
        if (InputSanitizer.validateFutureDeadline(d)) {
          const iso = d.toISOString();
          this.#store.dispatch({
            type: ActionTypes.SET_GOAL_INPUT,
            payload: {
              title: this.#store.getState().goalTitle,
              deadline: iso
            }
          });
          this.#connectTimeEngine();
        }
      });
    }

    const aiBtn = this.#document.getElementById('ai-generate-btn');
    if (aiBtn) {
      aiBtn.addEventListener('click', async () => {
        await this.generateAiPlan();
      });
    }

    const themePicker = this.#document.getElementById('theme-picker');
    if (themePicker) {
      themePicker.addEventListener('click', (evt) => {
        const chip = evt.target.closest('[data-theme-id]');
        if (!chip) return;
        const themeId = chip.getAttribute('data-theme-id');
        this.setTheme(themeId);
      });
    }

    const safeZoneBtn = this.#document.getElementById('safe-zone-toggle-btn');
    if (safeZoneBtn) {
      safeZoneBtn.addEventListener('click', () => {
        this.toggleSafeZones();
      });
    }

    const exportBtn = this.#document.getElementById('export-btn');
    if (exportBtn) {
      exportBtn.addEventListener('click', async () => {
        await this.exportWallpaper();
      });
    }

    const shareBtn = this.#document.getElementById('share-link-btn');
    if (shareBtn) {
      shareBtn.addEventListener('click', async () => {
        await this.copyShareUrl();
      });
    }
  }

  /**
   * Registers PWA cache-first service worker if supported by host runtime.
   */
  #registerServiceWorker() {
    if (this.#window?.navigator?.serviceWorker && typeof this.#window.navigator.serviceWorker.register === 'function') {
      try {
        this.#window.navigator.serviceWorker.register('./sw.js').catch(() => {});
      } catch {}
    }
  }

  /**
   * Toggles milestone completion state, updates store, and triggers tri-modal feedback.
   *
   * @param {string} milestoneId Target milestone identifier
   */
  async toggleMilestone(milestoneId) {
    this.#store.dispatch({
      type: ActionTypes.TOGGLE_MILESTONE,
      payload: { id: milestoneId }
    });

    const activeTheme = this.#store.getState().selectedTheme;
    await this.#sensoryCoordinator.triggerMilestoneFeedback(activeTheme);
    this.#renderWallpaper();

    const state = this.#store.getState();
    const milestones = state.milestones || [];
    const completed = milestones.filter((m) => m.isCompleted || m.completed).length;
    const total = milestones.length;
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
    this.showToast(`Milestone updated: ${completed}/${total} completed (${pct}%)`);
  }

  /**
   * Switches active aesthetic color theme.
   *
   * @param {string} themeId Theme palette identifier
   */
  setTheme(themeId) {
    this.#store.dispatch({
      type: ActionTypes.SET_THEME,
      payload: { themeId }
    });
    if (this.#canvasRenderer) {
      this.#canvasRenderer.updateThemePalette(themeId);
    }
    this.#renderWallpaper();

    const themeNames = {
      cyber_obsidian: 'Cyber Obsidian (OLED Black)',
      deep_focus_zen: 'Deep Focus Zen (Warm Amber)',
      aurora_botanical: 'Aurora Botanical (Emerald Mint)'
    };
    this.showToast(`Theme switched to ${themeNames[themeId] || themeId}`);
  }

  /**
   * Toggles visual safe-zone guides on the wallpaper preview canvas.
   *
   * @returns {boolean} New visibility flag
   */
  toggleSafeZones() {
    const isVisible = this.#safeZoneOverlay.toggle();
    const btn = this.#document?.getElementById('safe-zone-toggle-btn');
    if (btn) {
      btn.setAttribute('aria-pressed', String(isVisible));
    }
    this.#renderWallpaper();
    this.showToast(isVisible ? 'Lock Screen Simulator: ON (Dynamic Island & Gestures)' : 'Lock Screen Simulator: OFF');
    return isVisible;
  }

  /**
   * Deconstructs current goal into backward milestones utilizing Gemini AI client.
   *
   * @returns {Promise<boolean>} True if planning succeeded
   */
  async generateAiPlan() {
    const state = this.#store.getState();
    const aiBtn = this.#document?.getElementById('ai-generate-btn');

    if (aiBtn) {
      aiBtn.setAttribute('aria-busy', 'true');
      aiBtn.disabled = true;
    }

    this.#store.dispatch({ type: ActionTypes.PLANNING_REQUESTED });

    try {
      const plan = await this.#geminiClient.generatePlan(
        state.goalTitle,
        new Date(state.deadline)
      );

      this.#store.dispatch({
        type: ActionTypes.PLANNING_SUCCEEDED,
        payload: {
          milestones: plan.milestones,
          affirmation: plan.affirmation
        }
      });

      this.#milestoneManager.setMilestones(plan.milestones);
      this.showToast('Milestones planned with Gemini 3.8 Flash!');
      return true;
    } catch {
      this.#store.dispatch({ type: ActionTypes.PLANNING_FAILED });
      this.showToast('AI planning error; fallback heuristic retained.');
      return false;
    } finally {
      if (aiBtn) {
        aiBtn.setAttribute('aria-busy', 'false');
        aiBtn.disabled = false;
      }
    }
  }

  /**
   * Exports high-DPI wallpaper via Web Share API or triggers lossless PNG download.
   *
   * @returns {Promise<boolean>} True if export succeeded
   */
  async exportWallpaper() {
    if (!this.#canvasRenderer) {
      return false;
    }
    try {
      await this.#canvasRenderer.shareOrDownload();
      this.showToast('Wallpaper exported successfully!');
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Copies fresh state-reflecting URL to clipboard and announces confirmation.
   *
   * @returns {Promise<boolean>} True if copied successfully
   */
  async copyShareUrl() {
    const url = this.#historyGuard ? this.#historyGuard.getFreshUrl() : (this.#window?.location?.href || '');
    try {
      if (this.#window?.navigator?.clipboard && typeof this.#window.navigator.clipboard.writeText === 'function') {
        await this.#window.navigator.clipboard.writeText(url);
      } else if (this.#document && typeof this.#document.createElement === 'function') {
        const textarea = this.#document.createElement('textarea');
        textarea.value = url;
        this.#document.body.appendChild(textarea);
        textarea.select();
        this.#document.execCommand('copy');
        this.#document.body.removeChild(textarea);
      }
      this.showToast('Countdown link copied to clipboard!');
      return true;
    } catch {
      this.showToast('Copy failed; please copy URL from address bar.');
      return false;
    }
  }

  /**
   * Displays transient status toast message.
   *
   * @param {string} message Text message to display
   */
  showToast(message) {
    if (!this.#document) {
      return;
    }
    const toast = this.#document.getElementById('toast');
    const toastText = this.#document.getElementById('toast-text');
    const ariaStatus = this.#document.getElementById('aria-status');

    if (toast && toastText) {
      toastText.textContent = message;
      toast.setAttribute('data-visible', 'true');
      setTimeout(() => {
        toast.setAttribute('data-visible', 'false');
      }, 3000);
    }

    if (ariaStatus) {
      ariaStatus.textContent = message;
    }
  }

  /**
   * Returns current immutable application state.
   *
   * @returns {Readonly<Object>} Current state snapshot
   */
  getState() {
    return this.#store.getState();
  }

  /**
   * Releases chronometer ticker, subscriptions, and sensory subsystems.
   */
  dispose() {
    if (this.#timeEngine && typeof this.#timeEngine.stopTicker === 'function') {
      this.#timeEngine.stopTicker();
    }
    if (this.#unsubscribeStore) {
      this.#unsubscribeStore();
      this.#unsubscribeStore = null;
    }
    if (this.#sensoryCoordinator) {
      this.#sensoryCoordinator.dispose();
    }
    if (this.#store) {
      this.#store.destroy();
    }
    this.#isInitialized = false;
  }
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    const app = new CountdownApp();
    app.init().catch(console.error);
    window.__COUNTDOWN_APP__ = app;
  });
}
