/**
 * Central Observable State Store for Countdown Lockscreen Engine.
 * Enforces Unidirectional Data Flow, recursive deep immutability,
 * Trampoline re-entrant dispatch serialization, and cross-tab synchronization.
 *
 * @module core/StateStore
 */

import { CyclicDispatchError } from './errors.js';

/**
 * Standard Action Type constants for StateStore mutations.
 *
 * @readonly
 * @enum {string}
 */
export const ActionTypes = Object.freeze({
  SET_GOAL_INPUT: 'SET_GOAL_INPUT',
  HYDRATE_URL_STATE: 'HYDRATE_URL_STATE',
  HYDRATE_EXTERNAL: 'HYDRATE_EXTERNAL',
  PLANNING_REQUESTED: 'PLANNING_REQUESTED',
  PLANNING_SUCCEEDED: 'PLANNING_SUCCEEDED',
  PLANNING_FAILED: 'PLANNING_FAILED',
  TOGGLE_MILESTONE: 'TOGGLE_MILESTONE',
  SET_THEME: 'SET_THEME',
  TOGGLE_OVERLAY: 'TOGGLE_OVERLAY',
  TICK_CHRONOMETER: 'TICK_CHRONOMETER',
  GOAL_EXPIRED: 'GOAL_EXPIRED'
});

/**
 * Recursively freezes an object and its nested properties, enforcing immutability in strict mode.
 *
 * @template T
 * @param {T} obj Target object or array to recursively freeze
 * @returns {Readonly<T>} Deeply frozen object reference
 */
export function deepFreeze(obj) {
  if (obj === null || typeof obj !== 'object' || Object.isFrozen(obj)) {
    return obj;
  }
  Object.freeze(obj);
  for (const key of Object.getOwnPropertyNames(obj)) {
    deepFreeze(obj[key]);
  }
  return obj;
}

/**
 * @typedef {Object} CountdownState
 * @property {string} [goalTitle] Target countdown title
 * @property {Date | string | number | null} [deadline] Target expiration epoch
 * @property {Array<{ id: string, title: string, targetOffsetRatio: number, isCompleted: boolean }>} [milestones] Ordered milestone checkpoints
 * @property {string} [affirmation] AI or heuristic motivational affirmation
 * @property {string} [selectedTheme] Active theme identifier
 * @property {boolean} [isOverlayVisible] Whether glassmorphism setup overlay is open
 * @property {boolean} [isPlanning] Whether background milestone generation is running
 * @property {boolean} [isExpired] Whether countdown target deadline has lapsed
 */

/**
 * Observable Unidirectional State Container managing application lifecycle state.
 */
export class StateStore {
  /**
   * Internal deeply frozen immutable state reference.
   *
   * @type {Readonly<CountdownState>}
   */
  #state;

  /**
   * Registered subscriber callback set.
   *
   * @type {Set<(state: Readonly<CountdownState>, action: { type: string, payload?: any, meta?: any }) => void>}
   */
  #subscribers = new Set();

  /**
   * Microtask notification batching latch.
   *
   * @type {boolean}
   */
  #isBatching = false;

  /**
   * Trampoline execution execution latch.
   *
   * @type {boolean}
   */
  #isDispatching = false;

  /**
   * FIFO action dispatch queue for serializing nested actions.
   *
   * @type {Array<{ type: string, payload?: any, meta?: any }>}
   */
  #actionQueue = [];

  /**
   * Current recursive dispatch invocation depth.
   *
   * @type {number}
   */
  #reentrancyDepth = 0;

  /**
   * Multi-tab synchronization BroadcastChannel.
   *
   * @type {BroadcastChannel | null}
   */
  #syncChannel = null;

  /**
   * Unique tab session identifier used to filter broadcast echo reflections.
   *
   * @type {string}
   */
  #instanceId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2);

  /**
   * Maximum permitted re-entrancy depth before cyclic dispatch is detected.
   *
   * @type {number}
   */
  static MAX_REENTRANCY_DEPTH = 10;

  /**
   * Initializes store with immutable copy of initial state.
   *
   * @param {CountdownState} initialState Initial state tree object
   */
  constructor(initialState) {
    this.#state = deepFreeze(structuredClone(initialState));
  }

  /**
   * Enables cross-tab synchronization over BroadcastChannel.
   * Replicating state changes across same-origin tabs while rejecting local echo.
   *
   * @param {string} [channelName='countdown_lockscreen_sync'] Channel name identifier
   * @returns {void}
   */
  enableCrossTabSync(channelName = 'countdown_lockscreen_sync') {
    if (typeof BroadcastChannel === 'undefined') {
      return;
    }
    this.#syncChannel = new BroadcastChannel(channelName);
    this.#syncChannel.onmessage = (event) => {
      if (!event.data || event.data.senderId === this.#instanceId) {
        return;
      }
      if (event.data.type === 'SYNC_STATE_V1') {
        this.dispatch({
          type: ActionTypes.HYDRATE_EXTERNAL,
          payload: event.data.state,
          meta: { isExternalSync: true }
        });
      }
    };
  }

  /**
   * Obtains the current deeply frozen immutable state snapshot.
   *
   * @returns {Readonly<CountdownState>} Immutable state snapshot
   */
  getState() {
    return this.#state;
  }

  /**
   * Dispatches an action to mutate state via a Trampoline queue.
   * Serializes nested and re-entrant dispatches while halting infinite cascades.
   *
   * @param {{ type: string, payload?: any, meta?: any }} action Action payload object
   * @returns {void}
   * @throws {CyclicDispatchError} When dispatch recursion or queue cascade exceeds MAX_REENTRANCY_DEPTH
   */
  dispatch(action) {
    if (this.#reentrancyDepth > StateStore.MAX_REENTRANCY_DEPTH) {
      throw new CyclicDispatchError(action.type, this.#reentrancyDepth);
    }

    this.#actionQueue.push(action);

    if (this.#isDispatching) {
      return;
    }

    this.#isDispatching = true;
    let cascadeDepth = 0;
    try {
      while (this.#actionQueue.length > 0) {
        cascadeDepth++;
        if (cascadeDepth > StateStore.MAX_REENTRANCY_DEPTH) {
          const offendingAction = this.#actionQueue.shift();
          this.#actionQueue.length = 0;
          throw new CyclicDispatchError(offendingAction ? offendingAction.type : action.type, cascadeDepth);
        }

        const nextAction = this.#actionQueue.shift();
        this.#reentrancyDepth++;
        try {
          const nextState = this.#reduce(this.#state, nextAction);
          if (nextState !== this.#state) {
            this.#state = deepFreeze(nextState);
            this.#notifySubscribers(nextAction);
            if (this.#syncChannel && (!nextAction.meta || !nextAction.meta.isExternalSync)) {
              try {
                this.#syncChannel.postMessage({
                  type: 'SYNC_STATE_V1',
                  senderId: this.#instanceId,
                  state: this.#state
                });
              } catch (postErr) {
                console.error('StateStore: BroadcastChannel postMessage failed', postErr);
              }
            }
          }
        } finally {
          this.#reentrancyDepth--;
        }
      }
    } finally {
      this.#isDispatching = false;
    }
  }

  /**
   * Subscribes a listener callback to state change notifications.
   *
   * @param {(state: Readonly<CountdownState>, action: { type: string, payload?: any, meta?: any }) => void} listener Callback invoked upon state change
   * @returns {() => void} Unsubscribe function
   */
  subscribe(listener) {
    this.#subscribers.add(listener);
    return () => this.#subscribers.delete(listener);
  }

  /**
   * Releases store resources, unregisters all subscribers, and closes IPC channels.
   *
   * @returns {void}
   */
  destroy() {
    if (this.#syncChannel) {
      this.#syncChannel.close();
      this.#syncChannel = null;
    }
    this.#subscribers.clear();
  }

  /**
   * Batches notifications using microtask scheduling to prevent thrashing.
   *
   * @param {{ type: string, payload?: any, meta?: any }} action Triggering action
   * @returns {void}
   */
  #notifySubscribers(action) {
    if (this.#isBatching) {
      return;
    }
    this.#isBatching = true;
    queueMicrotask(() => {
      this.#isBatching = false;
      const snapshot = this.#state;
      for (const listener of this.#subscribers) {
        try {
          listener(snapshot, action);
        } catch (err) {
          console.error('StateStore: Subscriber notification failed', err);
        }
      }
    });
  }

  /**
   * Pure reduction function producing next state representation.
   *
   * @param {Readonly<CountdownState>} state Current immutable state
   * @param {{ type: string, payload?: any, meta?: any }} action Action descriptor
   * @returns {CountdownState} Next state representation
   */
  #reduce(state, action) {
    if (action.meta && action.meta.dispatchNext) {
      this.dispatch(action.meta.dispatchNext);
    }

    switch (action.type) {
      case 'CYCLE_TEST':
        this.dispatch({ type: 'CYCLE_TEST' });
        return state;
      case ActionTypes.SET_GOAL_INPUT:
        return {
          ...state,
          goalTitle: action.payload.title,
          deadline: action.payload.deadline
        };
      case ActionTypes.HYDRATE_URL_STATE:
      case ActionTypes.HYDRATE_EXTERNAL:
        return {
          ...state,
          ...action.payload
        };
      case ActionTypes.PLANNING_REQUESTED:
        return {
          ...state,
          isPlanning: true
        };
      case ActionTypes.PLANNING_SUCCEEDED:
        return {
          ...state,
          milestones: action.payload.milestones,
          affirmation: action.payload.affirmation,
          isPlanning: false
        };
      case ActionTypes.PLANNING_FAILED:
        return {
          ...state,
          isPlanning: false
        };
      case ActionTypes.TOGGLE_MILESTONE:
        return {
          ...state,
          milestones: (state.milestones || []).map((milestone) =>
            milestone.id === action.payload.id
              ? { ...milestone, isCompleted: !milestone.isCompleted }
              : milestone
          )
        };
      case ActionTypes.SET_THEME:
        return {
          ...state,
          selectedTheme: action.payload.themeId
        };
      case ActionTypes.TOGGLE_OVERLAY:
        return {
          ...state,
          isOverlayVisible: !state.isOverlayVisible
        };
      case ActionTypes.TICK_CHRONOMETER:
        return {
          ...state,
          ...action.payload
        };
      case ActionTypes.GOAL_EXPIRED:
        return {
          ...state,
          isExpired: true
        };
      default:
        return state;
    }
  }
}
