/**
 * Inline Blob Web Worker Chronometer Ticker Adapter.
 * Implements ITickScheduler providing unthrottled 1Hz ticks during background tab throttling.
 *
 * @module services/WorkerTickerAdapter
 */

import { ITickScheduler } from '../core/ports.js';

/**
 * Tick scheduler adapter offloading chronometer timing pulses to an isolated background thread.
 */
export class WorkerTickerAdapter extends ITickScheduler {
  /**
   * Dedicated background Web Worker instance.
   *
   * @type {Worker | null}
   */
  #worker = null;

  /**
   * Monotonically increasing cancellation handle sequence counter.
   *
   * @type {number}
   */
  #handleCounter = 0;

  /**
   * Map of active tick callback listeners indexed by cancellation handle.
   *
   * @type {Map<number, (timestamp: number) => void>}
   */
  #callbacks = new Map();

  /**
   * In-memory fallback timer handle for environments without Worker support.
   *
   * @type {ReturnType<typeof setInterval> | null}
   */
  #fallbackTimer = null;

  /**
   * Instantiates inline worker via URL.createObjectURL using an unthrottled self.setInterval loop.
   */
  constructor() {
    super();

    if (
      typeof Worker !== 'undefined' &&
      typeof Blob !== 'undefined' &&
      typeof URL !== 'undefined' &&
      typeof URL.createObjectURL === 'function'
    ) {
      try {
        const workerScript = `
          let timer = null;
          self.onmessage = (e) => {
            if (e.data === 'start') {
              if (!timer) {
                timer = setInterval(() => {
                  self.postMessage({ type: 'tick', timestamp: performance.now() });
                }, 1000);
              }
            } else if (e.data === 'stop') {
              if (timer) {
                clearInterval(timer);
                timer = null;
              }
            }
          };
        `;
        const blob = new Blob([workerScript], { type: 'application/javascript' });
        const url = URL.createObjectURL(blob);
        this.#worker = new Worker(url);
        URL.revokeObjectURL(url);

        this.#worker.onmessage = (e) => {
          if (e.data && e.data.type === 'tick') {
            const ts = e.data.timestamp;
            for (const cb of this.#callbacks.values()) {
              try {
                cb(ts);
              } catch (cbErr) {
                console.error('WorkerTickerAdapter: callback error', cbErr);
              }
            }
          }
        };
      } catch (workerInitErr) {
        this.#worker = null;
      }
    }
  }

  /**
   * Schedules a chronometer tick callback.
   *
   * @param {(timestamp: number) => void} callback Function invoked on tick
   * @returns {number} Cancellation handle
   */
  requestTick(callback) {
    const handle = ++this.#handleCounter;
    this.#callbacks.set(handle, callback);

    if (this.#callbacks.size === 1) {
      if (this.#worker) {
        this.#worker.postMessage('start');
      } else if (this.#fallbackTimer === null) {
        this.#fallbackTimer = setInterval(() => {
          const ts = typeof performance !== 'undefined' ? performance.now() : Date.now();
          for (const cb of this.#callbacks.values()) {
            try {
              cb(ts);
            } catch (cbErr) {
              console.error('WorkerTickerAdapter: fallback callback error', cbErr);
            }
          }
        }, 1000);
      }
    }

    return handle;
  }

  /**
   * Cancels a scheduled chronometer tick.
   *
   * @param {number} handle Cancellation handle previously returned by requestTick
   * @returns {void}
   */
  cancelTick(handle) {
    this.#callbacks.delete(handle);

    if (this.#callbacks.size === 0) {
      if (this.#worker) {
        this.#worker.postMessage('stop');
      } else if (this.#fallbackTimer !== null) {
        clearInterval(this.#fallbackTimer);
        this.#fallbackTimer = null;
      }
    }
  }

  /**
   * Terminates background worker thread completely and releases resources.
   *
   * @returns {void}
   */
  dispose() {
    if (this.#worker) {
      this.#worker.terminate();
      this.#worker = null;
    }
    if (this.#fallbackTimer !== null) {
      clearInterval(this.#fallbackTimer);
      this.#fallbackTimer = null;
    }
    this.#callbacks.clear();
  }
}
