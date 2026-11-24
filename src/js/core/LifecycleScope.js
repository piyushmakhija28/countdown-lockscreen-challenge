/**
 * RAII Lifecycle Management Scope.
 * Automates AbortController signal chaining and teardown disposal registries.
 * Guarantees zero DOM listener or asynchronous timer memory leaks.
 *
 * @module core/LifecycleScope
 */

/**
 * Lifecycle Scope providing deterministic RAII cleanup for event listeners,
 * worker channels, and asynchronous abort signals.
 */
export class LifecycleScope {
  /**
   * Internal abort controller for managing cancellation signals.
   *
   * @type {AbortController}
   */
  #controller = new AbortController();

  /**
   * Set of registered disposable teardown callbacks.
   *
   * @type {Set<() => void>}
   */
  #disposables = new Set();

  /**
   * Gets the active AbortSignal for passing to fetch, addEventListener, or worker APIs.
   *
   * @returns {AbortSignal} Active cancellation signal
   */
  get signal() {
    return this.#controller.signal;
  }

  /**
   * Registers a disposable teardown function executed upon scope termination.
   *
   * @param {() => void} disposable Callback executed when scope is disposed
   * @returns {() => void} Unregister function to remove callback prior to disposal
   */
  register(disposable) {
    this.#disposables.add(disposable);
    return () => this.#disposables.delete(disposable);
  }

  /**
   * Aborts the active signal and executes all registered disposal routines.
   * Clears the disposable registry to prevent retaining references.
   *
   * @returns {void}
   */
  dispose() {
    this.#controller.abort();
    for (const disposeFn of this.#disposables) {
      try {
        disposeFn();
      } catch (err) {
        console.error('LifecycleScope: disposal routine threw an uncaught error', err);
      }
    }
    this.#disposables.clear();
  }
}
