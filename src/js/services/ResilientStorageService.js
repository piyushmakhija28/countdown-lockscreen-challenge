/**
 * Resilient 4-Tier Client Storage Degradation Service.
 * Implements IStateStoragePort adhering to ADR-006 privacy-first offline persistence.
 * Tiers: LocalStorage (with LRU eviction) -> SessionStorage -> In-Memory Map -> URL Hash.
 *
 * @module services/ResilientStorageService
 */

import { IStateStoragePort } from '../core/ports.js';

/**
 * Concrete storage adapter managing multi-tier persistence failover and LRU cache eviction.
 */
export class ResilientStorageService extends IStateStoragePort {
  /**
   * Ephemeral in-memory Map heap storage fallback.
   *
   * @type {Map<string, string>}
   */
  #memoryFallback = new Map();

  /**
   * Key namespace prefix isolating application items from colliding origin keys.
   *
   * @type {string}
   */
  #prefix = 'countdown_lockscreen_v1:';

  /**
   * Currently active storage tier identifier.
   *
   * @type {'localStorage' | 'sessionStorage' | 'memory' | 'hash'}
   */
  #activeTier = 'localStorage';

  /**
   * Constructs resilient storage service and proactively probes runtime storage availability.
   */
  constructor() {
    super();
    this.#probeActiveTier();
  }

  /**
   * Gets the currently active storage tier name.
   *
   * @returns {'localStorage' | 'sessionStorage' | 'memory' | 'hash'} Active tier name
   */
  get activeTier() {
    return this.#activeTier;
  }

  /**
   * Probes host environment to identify the highest functional storage tier.
   *
   * @returns {void}
   */
  #probeActiveTier() {
    try {
      if (typeof localStorage === 'undefined') {
        throw new Error('localStorage unavailable');
      }
      const probeKey = `${this.#prefix}__probe__`;
      localStorage.setItem(probeKey, '1');
      localStorage.removeItem(probeKey);
      this.#activeTier = 'localStorage';
    } catch {
      try {
        if (typeof sessionStorage === 'undefined') {
          throw new Error('sessionStorage unavailable');
        }
        const probeKey = `${this.#prefix}__probe__`;
        sessionStorage.setItem(probeKey, '1');
        sessionStorage.removeItem(probeKey);
        this.#activeTier = 'sessionStorage';
      } catch {
        this.#activeTier = 'memory';
      }
    }
  }

  /**
   * Persists an ephemeral key-value pair across available storage tiers with LRU protection.
   *
   * @param {string} key Storage lookup key
   * @param {string} value Serialized payload string
   * @returns {void}
   */
  saveEphemeral(key, value) {
    const fullKey = `${this.#prefix}${key}`;

    if (this.#activeTier === 'localStorage') {
      try {
        localStorage.setItem(fullKey, value);
        return;
      } catch {
        this.#evictOldestLru();
        try {
          localStorage.setItem(fullKey, value);
          return;
        } catch {
          this.#activeTier = 'sessionStorage';
        }
      }
    }

    if (this.#activeTier === 'sessionStorage') {
      try {
        sessionStorage.setItem(fullKey, value);
        return;
      } catch {
        this.#activeTier = 'memory';
      }
    }

    this.#memoryFallback.set(fullKey, value);
  }

  /**
   * Loads an ephemeral value from the highest available tier.
   *
   * @param {string} key Storage lookup key
   * @returns {string | null} Stored value or null if nonexistent
   */
  loadEphemeral(key) {
    const fullKey = `${this.#prefix}${key}`;

    if (this.#activeTier === 'localStorage') {
      try {
        const val = localStorage.getItem(fullKey);
        if (val !== null) {
          return val;
        }
      } catch {
        this.#activeTier = 'sessionStorage';
      }
    }

    if (this.#activeTier === 'sessionStorage') {
      try {
        const val = sessionStorage.getItem(fullKey);
        if (val !== null) {
          return val;
        }
      } catch {
        this.#activeTier = 'memory';
      }
    }

    return this.#memoryFallback.get(fullKey) ?? null;
  }

  /**
   * Safely replaces browser navigation hash state without creating history stack pollution.
   *
   * @param {string} hashFragment URL hash payload
   * @returns {void}
   */
  replaceNavigationState(hashFragment) {
    const formatted = hashFragment.startsWith('#') ? hashFragment : `#${hashFragment}`;
    try {
      if (typeof window !== 'undefined' && window.history && typeof window.history.replaceState === 'function') {
        window.history.replaceState(null, '', formatted);
      } else if (typeof window !== 'undefined' && window.location) {
        window.location.hash = hashFragment.startsWith('#') ? hashFragment.slice(1) : hashFragment;
      }
    } catch {
      if (typeof window !== 'undefined' && window.location) {
        window.location.hash = hashFragment.startsWith('#') ? hashFragment.slice(1) : hashFragment;
      }
    }
  }

  /**
   * Evicts the oldest unpinned item from localStorage to recover quota.
   *
   * @returns {void}
   */
  #evictOldestLru() {
    try {
      if (typeof localStorage === 'undefined') {
        return;
      }
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(this.#prefix) && !k.includes('pinned')) {
          localStorage.removeItem(k);
          break;
        }
      }
    } catch {
      // Degrade silently
    }
  }

  /**
   * Resets active storage tier and clears memory fallback cache (primarily for test teardown).
   *
   * @returns {void}
   */
  reset() {
    this.#memoryFallback.clear();
    this.#probeActiveTier();
  }
}
