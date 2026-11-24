/**
 * Deterministic Offline Heuristic Milestone Planner.
 * Generates 4 equidistant milestone intervals using pure local arithmetic in < 5ms.
 * Provides resilient fallback when offline, rate-limited, or API keys are absent.
 *
 * @module ai/HeuristicGenerator
 */

import { IMilestonePlanner } from '../core/ports.js';

/**
 * Deterministic retrograde milestone generator calculating equidistant milestone arcs.
 */
export class HeuristicGenerator extends IMilestonePlanner {
  /**
   * Canonical milestone phase title templates.
   *
   * @type {readonly string[]}
   */
  static GENERIC_TITLES = Object.freeze([
    'Phase 1: Foundation & Requirements Mastery',
    'Phase 2: Deep Core Execution & Build Sprint',
    'Phase 3: Validation, Mock Review & Refinement',
    'Phase 4: Final Polish & Deadline Achievement'
  ]);

  /**
   * Default daily affirmation string.
   *
   * @type {string}
   */
  static DEFAULT_AFFIRMATION = 'Focus on the process today. Consistency compounds into mastery.';

  /**
   * Default recommended theme identifier.
   *
   * @type {string}
   */
  static DEFAULT_THEME = 'cyber_obsidian';

  /**
   * Synthesizes 4 equidistant milestone intervals using pure local arithmetic in < 5ms.
   *
   * @param {string} goalTitle Sanitized goal title string
   * @param {Date | string | number} deadline Target deadline timestamp
   * @param {Date | string | number} [now=new Date()] Reference timestamp
   * @returns {{ title: string, deadline_iso: string, milestones: Array<{ id: string, step: number, title: string, offset_days: number, offsetDays: number, completed: boolean, isCompleted: boolean }>, daily_affirmation: string, recommended_theme: string }} Milestone plan response
   */
  static generatePlan(goalTitle, deadline, now = new Date()) {
    const targetDate = deadline instanceof Date ? deadline : new Date(deadline);
    const nowDate = now instanceof Date ? now : new Date(now);

    const totalMs = targetDate.getTime() - nowDate.getTime();
    const totalDays = Math.max(1, Math.floor(totalMs / 86400000));

    const offsets = [
      Math.round(totalDays * 0.75),
      Math.round(totalDays * 0.50),
      Math.round(totalDays * 0.25),
      0
    ];

    const milestones = HeuristicGenerator.GENERIC_TITLES.map((title, idx) => ({
      id: `m-${idx + 1}`,
      step: idx + 1,
      title,
      offset_days: offsets[idx],
      offsetDays: offsets[idx],
      completed: false,
      isCompleted: false
    }));

    return {
      title: typeof goalTitle === 'string' && goalTitle.trim().length > 0 ? goalTitle.trim() : 'Goal Countdown',
      deadline_iso: targetDate.toISOString(),
      milestones,
      daily_affirmation: HeuristicGenerator.DEFAULT_AFFIRMATION,
      recommended_theme: HeuristicGenerator.DEFAULT_THEME
    };
  }

  /**
   * Deconstructs a goal into backward sequential milestones adhering to IMilestonePlanner.
   *
   * @param {string} goalTitle Sanitized goal title
   * @param {Date} deadline Target deadline timestamp
   * @returns {Promise<{ title: string, deadline_iso: string, milestones: Array<{ id: string, step: number, title: string, offset_days: number, offsetDays: number, completed: boolean, isCompleted: boolean }>, daily_affirmation: string, recommended_theme: string }>} Milestone plan response
   */
  async generatePlan(goalTitle, deadline) {
    return Promise.resolve(HeuristicGenerator.generatePlan(goalTitle, deadline));
  }
}
