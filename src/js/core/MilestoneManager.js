/**
 * Deterministic Milestone Sequencing and Progress Management Engine.
 * Manages monotonic milestone intervals, status toggling, and progress calculations
 * with zero-division IEEE 754 NaN protection.
 *
 * @module core/MilestoneManager
 */

/**
 * @typedef {Object} MilestoneItem
 * @property {string} id Unique milestone identifier (e.g. "ms-1")
 * @property {number} step 1-based sequential step index (1-5)
 * @property {string} title Actionable milestone description
 * @property {number} [offsetDays=0] Days prior to deadline for milestone achievement
 * @property {number} [targetOffsetRatio=0] Normalized offset ratio along the timeline (0.0 to 1.0)
 * @property {boolean} isCompleted Completion status toggle
 */

/**
 * Manager handling sequencing, progress metrics, and state mutations for milestone items.
 */
export class MilestoneManager {
  /**
   * Internal ordered milestone checkpoint collection.
   *
   * @type {MilestoneItem[]}
   */
  #milestones = [];

  /**
   * Constructs milestone manager with optional initial milestone items.
   *
   * @param {readonly MilestoneItem[]} [initialMilestones=[]] Initial milestone collection
   */
  constructor(initialMilestones = []) {
    this.setMilestones(initialMilestones);
  }

  /**
   * Replaces current milestone collection with validated, monotonically sorted items.
   * Enforces the Inverted Milestones Guard by ordering checkpoints sequentially.
   *
   * @param {readonly MilestoneItem[]} milestones New milestone checkpoint array
   * @returns {void}
   */
  setMilestones(milestones) {
    if (!Array.isArray(milestones)) {
      this.#milestones = [];
      return;
    }

    const sanitized = milestones
      .filter((item) => item !== null && typeof item === 'object')
      .map((item, idx) => ({
        id: String(item.id || `ms-${idx + 1}`),
        step: typeof item.step === 'number' ? item.step : idx + 1,
        title: String(item.title || `Milestone ${idx + 1}`),
        offsetDays: typeof item.offsetDays === 'number' ? Math.max(0, item.offsetDays) : 0,
        targetOffsetRatio: typeof item.targetOffsetRatio === 'number'
          ? Math.min(1.0, Math.max(0.0, item.targetOffsetRatio))
          : Math.min(1.0, Math.max(0.0, (idx + 1) / Math.max(1, milestones.length))),
        isCompleted: Boolean(item.isCompleted)
      }));

    sanitized.sort((a, b) => {
      if (a.targetOffsetRatio !== b.targetOffsetRatio) {
        return a.targetOffsetRatio - b.targetOffsetRatio;
      }
      return a.step - b.step;
    });

    this.#milestones = sanitized;
  }

  /**
   * Returns a deeply cloned read-only snapshot of the current milestone collection.
   *
   * @returns {readonly MilestoneItem[]} Snapshot array of milestones
   */
  getMilestones() {
    return this.#milestones.map((item) => ({ ...item }));
  }

  /**
   * Toggles completion status of a specific milestone by its identifier.
   *
   * @param {string} id Milestone identifier to toggle
   * @returns {boolean} True if milestone was found and toggled; false otherwise
   */
  toggleMilestone(id) {
    const target = this.#milestones.find((item) => item.id === id);
    if (!target) {
      return false;
    }

    target.isCompleted = !target.isCompleted;
    return true;
  }

  /**
   * Gets total number of milestone checkpoints.
   *
   * @returns {number} Milestone count
   */
  get totalCount() {
    return this.#milestones.length;
  }

  /**
   * Gets number of completed milestone checkpoints.
   *
   * @returns {number} Completed milestone count
   */
  get completedCount() {
    return this.#milestones.filter((item) => item.isCompleted).length;
  }

  /**
   * Returns the milestone completion ratio (c / n).
   *
   * @returns {number} Completion ratio between 0.0 and 1.0
   */
  get completionRatio() {
    if (this.#milestones.length === 0) {
      return 0.0;
    }
    return this.completedCount / this.#milestones.length;
  }

  /**
   * Calculates aggregate progress percentage combining elapsed time and milestone checks.
   * Enforces the Zero-Duration Arc Guard (INV-012) where P = 100.0% when totalDuration <= 0.
   *
   * @param {Date | string | number} startTime Initial goal creation timestamp
   * @param {Date | string | number} deadline Target deadline timestamp
   * @param {Date | string | number} [referenceTime=new Date()] Optional evaluation timestamp
   * @returns {number} Progress percentage between 0.0 and 100.0
   */
  calculateProgress(startTime, deadline, referenceTime = new Date()) {
    const start = startTime instanceof Date ? startTime.getTime() : new Date(startTime).getTime();
    const end = deadline instanceof Date ? deadline.getTime() : new Date(deadline).getTime();
    const now = referenceTime instanceof Date ? referenceTime.getTime() : new Date(referenceTime).getTime();

    const totalDuration = end - start;

    if (totalDuration <= 0) {
      return 100.0;
    }

    const elapsed = Math.max(0, now - start);
    const timeProgress = Math.min(1.0, elapsed / totalDuration);

    if (this.#milestones.length === 0) {
      return Number((timeProgress * 100).toFixed(2));
    }

    const milestoneProgress = this.completionRatio;
    const aggregate = (timeProgress * 0.5) + (milestoneProgress * 0.5);

    return Number((Math.min(1.0, Math.max(0.0, aggregate)) * 100).toFixed(2));
  }
}
