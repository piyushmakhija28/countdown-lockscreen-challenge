/**
 * Google Gemini 3.8 Flash AI Gateway Client.
 * Orchestrates backward deadline deconstruction into structured milestones.
 * Enforces strict header authentication, OpenAPI 3.1 JSON Schema output,
 * 4000ms timeout abort, fail-fast circuit breaker, and heuristic fallback.
 *
 * @module ai/GeminiAiClient
 */

import { IMilestonePlanner } from '../core/ports.js';
import { AiServiceError, AiSafetyBlockError, AsyncAbortedError } from '../core/errors.js';
import { InputSanitizer } from '../core/InputSanitizer.js';
import { HeuristicGenerator } from './HeuristicGenerator.js';
import { GeminiRateLimiter } from './GeminiRateLimiter.js';

/**
 * System instruction provided to Google Gemini for structured retrograde planning.
 *
 * @type {string}
 */
export const GEMINI_SYSTEM_INSTRUCTION = `You are an elite productivity strategist and cognitive behavioral coach specializing in backward goal decomposition (retrograde planning).
Given a user's goal title and target deadline timestamp, you must:
1. Deconstruct the deadline backward into exactly 3 to 5 actionable, sequential milestones.
2. Each milestone must represent a concrete, verifiable completion phase (not vague intentions).
3. The milestones must have realistic day offsets relative to the deadline (e.g., milestone 1 is farthest away; milestone 4 is closest to deadline).
4. Craft an empowering, psychologically grounded daily affirmation (maximum 120 characters) aligned with the goal.
5. Recommend the ideal thematic aesthetic ('cyber_obsidian', 'deep_focus_zen', or 'aurora_botanical').
You must strictly return valid JSON conforming to the requested schema with zero markdown preamble or conversational filler.`;

/**
 * Client gateway for Google Gemini 3.8 Flash model.
 */
export class GeminiAiClient extends IMilestonePlanner {
  /** @type {string | null} */
  #apiKey = null;
  /** @type {string} */
  #model = 'gemini-3.8-flash';
  /** @type {GeminiRateLimiter} */
  #rateLimiter;
  /** @type {AbortController | null} */
  #activeAbortController = null;
  /** @type {number} */
  #currentRequestEpoch = 0;
  /** @type {'CLOSED' | 'OPEN' | 'HALF_OPEN'} */
  #circuitState = 'CLOSED';
  /** @type {number} */
  #circuitFailureCount = 0;
  /** @type {number} */
  #circuitNextAttemptEpoch = 0;
  /** @type {number} */
  #circuitTripCount = 0;
  /** @type {number} */
  #failureThreshold = 2;
  /** @type {number} */
  #coolOffPeriodMs = 60000;
  /** @type {boolean} */
  #fallbackOnFailure = true;
  /** @type {number} */
  #timeoutMs = 4000;
  /** @type {Function | null} */
  #fetchFn = null;

  /**
   * @param {Object} [options={}] Configuration options
   * @param {string} [options.apiKey] Optional Google Gemini API key
   * @param {string} [options.model='gemini-3.8-flash'] Target model identifier
   * @param {GeminiRateLimiter} [options.rateLimiter] Optional rate limiter instance
   * @param {boolean} [options.fallbackOnFailure=true] Whether to fall back to HeuristicGenerator on errors
   * @param {number} [options.timeoutMs=4000] Request timeout in milliseconds
   * @param {Function} [options.fetchFn] Custom fetch implementation for testing
   */
  constructor(options = {}) {
    super();
    this.#apiKey = options.apiKey || null;
    this.#model = options.model || 'gemini-3.8-flash';
    this.#rateLimiter = options.rateLimiter || new GeminiRateLimiter();
    this.#fallbackOnFailure = options.fallbackOnFailure !== undefined ? options.fallbackOnFailure : true;
    this.#timeoutMs = options.timeoutMs || 4000;
    this.#fetchFn = options.fetchFn || null;
  }

  /**
   * Sets or updates Google Gemini API key.
   *
   * @param {string | null} apiKey Google Gemini API key
   */
  setApiKey(apiKey) {
    this.#apiKey = apiKey;
  }

  /**
   * Returns current Google Gemini API key.
   *
   * @returns {string | null}
   */
  getApiKey() {
    return this.#apiKey;
  }

  /**
   * Returns active circuit breaker state ('CLOSED', 'OPEN', 'HALF_OPEN').
   *
   * @returns {'CLOSED' | 'OPEN' | 'HALF_OPEN'}
   */
  getCircuitState() {
    if (this.#circuitState === 'OPEN' && Date.now() > this.#circuitNextAttemptEpoch) {
      this.#circuitState = 'HALF_OPEN';
    }
    return this.#circuitState;
  }

  /**
   * Aborts active in-flight request if present.
   */
  abortActiveRequest() {
    if (this.#activeAbortController) {
      this.#activeAbortController.abort();
      this.#activeAbortController = null;
    }
  }

  /**
   * Trips circuit breaker into OPEN state with exponential cool-off.
   */
  #tripCircuitBreaker() {
    this.#circuitState = 'OPEN';
    this.#circuitTripCount++;
    const dynamicCoolOff = Math.min(600000, this.#coolOffPeriodMs * Math.pow(2, this.#circuitTripCount - 1));
    this.#circuitNextAttemptEpoch = Date.now() + dynamicCoolOff;
  }

  /**
   * Records a successful API interaction, resetting failure and trip counters.
   */
  #onCircuitSuccess() {
    this.#circuitFailureCount = 0;
    this.#circuitTripCount = 0;
    this.#circuitState = 'CLOSED';
  }

  /**
   * Records a failure for circuit breaker assessment.
   *
   * @param {unknown} err Encountered error
   */
  #onCircuitFailure(err) {
    this.#circuitFailureCount++;
    const isRateLimit = err?.httpStatus === 429 || err?.isRateLimit === true || err?.message?.includes('429');

    if (isRateLimit || this.#circuitFailureCount >= this.#failureThreshold || this.#circuitState === 'HALF_OPEN') {
      this.#tripCircuitBreaker();
    }
  }

  /**
   * Deconstructs a goal into backward milestones using Google Gemini 3.8 Flash.
   * Falls back seamlessly to HeuristicGenerator if offline, rate-limited, or misconfigured.
   *
   * @param {string} goalTitle Sanitized goal title
   * @param {Date | string | number} deadline Target deadline timestamp
   * @returns {Promise<{ title: string, deadline_iso: string, milestones: Array<{ id: string, step: number, title: string, offset_days: number, offsetDays: number, completed: boolean, isCompleted: boolean }>, daily_affirmation: string, recommended_theme: string }>} Milestone plan response
   * @throws {AiSafetyBlockError} If content is blocked by safety filters
   * @throws {AiServiceError} If API failure occurs and fallback is disabled
   * @throws {AsyncAbortedError} If request is aborted or superseded
   */
  async generatePlan(goalTitle, deadline) {
    const targetDate = deadline instanceof Date ? deadline : new Date(deadline);

    if (this.getCircuitState() === 'OPEN') {
      if (this.#fallbackOnFailure) {
        return HeuristicGenerator.generatePlan(goalTitle, targetDate);
      }
      throw new AiServiceError('Circuit breaker is OPEN due to repeated rate limits', 'ERR_AI_SERVICE', 429, true);
    }

    if (!this.#apiKey) {
      if (this.#fallbackOnFailure) {
        return HeuristicGenerator.generatePlan(goalTitle, targetDate);
      }
      throw new AiServiceError('Google Gemini API key not provided', 'ERR_AI_SERVICE', 401, false);
    }

    if (!this.#rateLimiter.acquire()) {
      if (this.#fallbackOnFailure) {
        return HeuristicGenerator.generatePlan(goalTitle, targetDate);
      }
      throw new AiServiceError('Gemini API rate limit exceeded (15 RPM or 2.0s pacing)', 'ERR_AI_RATE_LIMIT', 429, true);
    }

    this.abortActiveRequest();

    const requestEpoch = Date.now();
    this.#currentRequestEpoch = requestEpoch;
    const controller = new AbortController();
    this.#activeAbortController = controller;

    const timeoutHandle = setTimeout(() => {
      controller.abort();
    }, this.#timeoutMs);

    try {
      const sanitizedTitle = InputSanitizer.escapeXmlEntities(goalTitle);

      const requestBody = {
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `<user_input>\nGoal: "${sanitizedTitle}"\nTarget Deadline UTC: ${targetDate.toISOString()}\n</user_input>\nDeconstruct this deadline into backward milestones.`
              }
            ]
          }
        ],
        systemInstruction: {
          parts: [{ text: GEMINI_SYSTEM_INSTRUCTION }]
        },
        generationConfig: {
          temperature: 0.2,
          topP: 0.95,
          responseMimeType: 'application/json',
          responseSchema: {
            type: 'OBJECT',
            properties: {
              title: { type: 'STRING' },
              deadline_iso: { type: 'STRING' },
              milestones: {
                type: 'ARRAY',
                items: {
                  type: 'OBJECT',
                  properties: {
                    step: { type: 'INTEGER' },
                    title: { type: 'STRING' },
                    offset_days: { type: 'INTEGER' },
                    completed: { type: 'BOOLEAN' }
                  },
                  required: ['step', 'title', 'offset_days', 'completed']
                }
              },
              daily_affirmation: { type: 'STRING' },
              recommended_theme: {
                type: 'STRING',
                enum: ['cyber_obsidian', 'deep_focus_zen', 'aurora_botanical']
              }
            },
            required: ['title', 'deadline_iso', 'milestones', 'daily_affirmation', 'recommended_theme']
          }
        },
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' }
        ]
      };

      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${this.#model}:generateContent`;
      const fetchFn = this.#fetchFn || globalThis.fetch;

      const response = await fetchFn(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': this.#apiKey
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });

      if (response.status === 429) {
        this.#tripCircuitBreaker();
        if (this.#fallbackOnFailure) {
          return HeuristicGenerator.generatePlan(goalTitle, targetDate);
        }
        throw new AiServiceError('Google Gemini API rate limit reached (HTTP 429)', 'ERR_AI_RATE_LIMIT', 429, true);
      }

      if (!response.ok) {
        throw new AiServiceError(`Gemini API HTTP error ${response.status}`, 'ERR_AI_SERVICE', response.status, false);
      }

      const json = await response.json();

      if (json.promptFeedback?.blockReason) {
        throw new AiSafetyBlockError(
          `AI prompt blocked: ${json.promptFeedback.blockReason}`,
          'ERR_AI_SAFETY_BLOCK',
          json.promptFeedback.blockReason
        );
      }

      const candidate = json.candidates?.[0];
      if (candidate?.finishReason === 'SAFETY') {
        throw new AiSafetyBlockError('AI candidate output blocked by safety filter', 'ERR_AI_SAFETY_BLOCK', 'SAFETY');
      }

      const textPayload = candidate?.content?.parts?.[0]?.text;
      if (!textPayload) {
        throw new AiServiceError('Gemini API returned empty candidate text', 'ERR_AI_SERVICE', 200, false);
      }

      const parsedPlan = JSON.parse(textPayload);
      const validatedPlan = this.#normalizePlan(parsedPlan, goalTitle, targetDate);

      this.#onCircuitSuccess();
      return validatedPlan;
    } catch (err) {
      if (err instanceof AiSafetyBlockError) {
        throw err;
      }

      if (controller.signal.aborted) {
        if (this.#currentRequestEpoch !== requestEpoch) {
          throw new AsyncAbortedError('Request superseded by newer generation call', 'ERR_ASYNC_ABORT', 'superseded', requestEpoch);
        }
        if (this.#fallbackOnFailure) {
          return HeuristicGenerator.generatePlan(goalTitle, targetDate);
        }
        throw new AiServiceError('Gemini API request timed out after 4000ms', 'ERR_AI_SERVICE', 408, false);
      }

      this.#onCircuitFailure(err);

      if (this.#fallbackOnFailure) {
        return HeuristicGenerator.generatePlan(goalTitle, targetDate);
      }

      if (err instanceof AiServiceError) {
        throw err;
      }

      throw new AiServiceError(
        `Gemini API invocation failed: ${err instanceof Error ? err.message : String(err)}`,
        'ERR_AI_SERVICE',
        500,
        false
      );
    } finally {
      clearTimeout(timeoutHandle);
      if (this.#activeAbortController === controller) {
        this.#activeAbortController = null;
      }
    }
  }

  /**
   * Normalizes raw parsed plan from Gemini ensuring schema compliance and cognitive bounds.
   *
   * @param {Object} rawPlan Raw parsed plan
   * @param {string} fallbackTitle User input title
   * @param {Date} targetDate Validated deadline
   * @returns {{ title: string, deadline_iso: string, milestones: Array<{ id: string, step: number, title: string, offset_days: number, offsetDays: number, completed: boolean, isCompleted: boolean }>, daily_affirmation: string, recommended_theme: string }} Normalized plan
   */
  #normalizePlan(rawPlan, fallbackTitle, targetDate) {
    const title = typeof rawPlan?.title === 'string' && rawPlan.title.trim().length > 0
      ? rawPlan.title.trim().slice(0, 60)
      : fallbackTitle;

    const rawMilestones = Array.isArray(rawPlan?.milestones) ? rawPlan.milestones : [];
    const boundedMilestones = rawMilestones.slice(0, 5);

    while (boundedMilestones.length < 3) {
      const idx = boundedMilestones.length;
      boundedMilestones.push({
        step: idx + 1,
        title: HeuristicGenerator.GENERIC_TITLES[idx] || `Milestone Phase ${idx + 1}`,
        offset_days: Math.round((4 - idx) * 5),
        completed: false
      });
    }

    const milestones = boundedMilestones.map((item, idx) => {
      const step = typeof item.step === 'number' ? item.step : idx + 1;
      const offsetDays = typeof item.offset_days === 'number' ? Math.max(0, item.offset_days) : 0;
      return {
        id: `m-${step}`,
        step,
        title: typeof item.title === 'string' ? item.title.trim().slice(0, 50) : `Milestone ${step}`,
        offset_days: offsetDays,
        offsetDays,
        completed: Boolean(item.completed),
        isCompleted: Boolean(item.completed)
      };
    });

    const rawAffirmation = typeof rawPlan?.daily_affirmation === 'string' ? rawPlan.daily_affirmation.trim() : '';
    const dailyAffirmation = rawAffirmation.length >= 10
      ? rawAffirmation.slice(0, 120)
      : HeuristicGenerator.DEFAULT_AFFIRMATION;

    const permittedThemes = ['cyber_obsidian', 'deep_focus_zen', 'aurora_botanical'];
    const recommendedTheme = permittedThemes.includes(rawPlan?.recommended_theme)
      ? rawPlan.recommended_theme
      : 'cyber_obsidian';

    return {
      title,
      deadline_iso: targetDate.toISOString(),
      milestones,
      daily_affirmation: dailyAffirmation,
      recommended_theme: recommendedTheme
    };
  }
}
