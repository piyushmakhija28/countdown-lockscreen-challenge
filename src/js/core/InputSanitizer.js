/**
 * Defensive Input Sanitization and Verification Perimeter.
 * Enforces Unicode NFKC normalization, Trojan Source Bidi stripping,
 * XML entity escaping, and future deadline temporal bounds.
 *
 * @module core/InputSanitizer
 */

import { ValidationError } from './errors.js';

/**
 * Defensive input sanitizer protecting application inputs against injection,
 * visual obfuscation, and temporal boundary violations.
 */
export class InputSanitizer {
  /**
   * Regular expression matching Trojan Source bidirectional override code points.
   * Strips LTR/RTL marks, embeddings, and directional isolate characters.
   *
   * @type {RegExp}
   */
  static BIDI_OVERRIDE_PATTERN = /[\u200E\u200F\u202A-\u202E\u2066-\u2069]/g;

  /**
   * Regular expression matching HTML and XML markup tags.
   *
   * @type {RegExp}
   */
  static HTML_TAG_PATTERN = /<[^>]*>/g;

  /**
   * Unicode-aware whitelist pattern permitting letters, numbers, spaces, and standard punctuation.
   *
   * @type {RegExp}
   */
  static WHITELIST_PATTERN = /^[\p{L}\p{N}\s\-_.,!?:'"()]+$/u;

  /**
   * Maximum permitted future deadline ceiling in milliseconds (10 years).
   *
   * @type {number}
   */
  static MAX_FUTURE_SPAN_MS = 10 * 365.25 * 86400 * 1000;

  /**
   * Normalizes Unicode, removes Bidi overrides, and validates against whitelist regex.
   *
   * @param {string} raw Raw user input string
   * @returns {string} Sanitized clean goal title
   * @throws {ValidationError} If input violates type, length, or character constraints
   */
  static sanitizeGoalTitle(raw) {
    if (typeof raw !== 'string') {
      throw new ValidationError('Goal title must be a string', 'ERR_TITLE_INVALID_TYPE', 'goalTitle', 'type');
    }

    const normalized = raw.normalize('NFKC');
    const bidiCleaned = normalized.replace(InputSanitizer.BIDI_OVERRIDE_PATTERN, '');

    if (InputSanitizer.HTML_TAG_PATTERN.test(bidiCleaned)) {
      throw new ValidationError('Goal title cannot contain HTML or script markup tags', 'ERR_TITLE_INVALID_CHARS', 'goalTitle', 'no_tags');
    }

    const trimmed = bidiCleaned.trim();

    if (trimmed.length === 0) {
      throw new ValidationError('Goal title cannot be empty', 'ERR_TITLE_EMPTY', 'goalTitle', 'required');
    }

    if (trimmed.length < 3 || trimmed.length > 60) {
      throw new ValidationError('Goal title must be between 3 and 60 characters', 'ERR_TITLE_LENGTH', 'goalTitle', 'length');
    }

    if (!InputSanitizer.WHITELIST_PATTERN.test(trimmed)) {
      throw new ValidationError('Goal title contains invalid characters', 'ERR_TITLE_INVALID_CHARS', 'goalTitle', 'whitelist');
    }

    return trimmed;
  }

  /**
   * Validates target deadline timestamp ensuring it is strictly in the future.
   *
   * @param {Date | string | number} deadline Target timestamp
   * @param {Date | string | number} [referenceTime=new Date()] Optional reference timestamp
   * @returns {Date} Validated future Date instance
   * @throws {ValidationError} If date is invalid, in the past, or exceeds maximum future threshold
   */
  static validateFutureDeadline(deadline, referenceTime = new Date()) {
    const target = deadline instanceof Date ? new Date(deadline.getTime()) : new Date(deadline);

    if (isNaN(target.getTime())) {
      throw new ValidationError('Invalid deadline date format', 'ERR_INVALID_DATE', 'deadline', 'format');
    }

    const ref = referenceTime instanceof Date ? referenceTime.getTime() : new Date(referenceTime).getTime();

    if (isNaN(ref)) {
      throw new ValidationError('Invalid reference time format', 'ERR_INVALID_DATE', 'referenceTime', 'format');
    }

    if (target.getTime() <= ref) {
      throw new ValidationError('Target deadline must be in the future', 'ERR_PAST_DATE', 'deadline', 'future');
    }

    if (target.getTime() > ref + InputSanitizer.MAX_FUTURE_SPAN_MS) {
      throw new ValidationError('Target deadline exceeds maximum 10-year limit', 'ERR_DATE_RANGE', 'deadline', 'max_future');
    }

    return target;
  }

  /**
   * Alias for validateFutureDeadline enforcing future temporal bounds (SYS-INV-001).
   *
   * @param {Date | string | number} deadline Target timestamp
   * @param {Date | string | number} [referenceTime=new Date()] Optional reference timestamp
   * @returns {Date} Validated future Date instance
   * @throws {ValidationError} If date is invalid, in the past, or exceeds maximum future threshold
   */
  static validateDeadline(deadline, referenceTime = new Date()) {
    return InputSanitizer.validateFutureDeadline(deadline, referenceTime);
  }

  /**
   * Escapes XML and HTML entities for safe prompt interpolation and DOM injection.
   *
   * @param {string} input Unsafe text string
   * @returns {string} XML-safe sanitized string
   */
  static escapeXmlEntities(input) {
    if (typeof input !== 'string') {
      return '';
    }

    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
}
