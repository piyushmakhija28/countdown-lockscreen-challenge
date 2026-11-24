/**
 * Stateless URL State Serialization and Sharing Codec.
 * Encodes application state snapshots into compact Base64URL `#v1=` hash fragments
 * with 32KB decompression bomb defense and prototype pollution sanitization.
 *
 * @module core/UrlStateService
 */

import {
  StateSerializationError,
  PayloadTooLargeError,
  DecompressionBombError
} from './errors.js';

/**
 * Service managing state encoding, compression, and tamper-resistant decoding
 * within browser URL hash fragments.
 */
export class UrlStateService {
  /**
   * Versioned URL hash prefix identifier.
   *
   * @type {string}
   */
  static PREFIX = '#v1=';

  /**
   * Maximum permitted character length for URL hash fragments.
   *
   * @type {number}
   */
  static MAX_URL_LENGTH = 2048;

  /**
   * Maximum permitted size in bytes for decompressed payload streams (32 KB).
   *
   * @type {number}
   */
  static MAX_DECOMPRESSED_BYTES = 32768;

  /**
   * Encodes application state into compressed Base64URL string.
   *
   * @param {Object} state Application state snapshot
   * @returns {Promise<string>} Formatted #v1= URL hash fragment
   * @throws {PayloadTooLargeError} If serialized fragment exceeds MAX_URL_LENGTH
   * @throws {StateSerializationError} If serialization or compression fails
   */
  static async serializeState(state) {
    try {
      const payload = {
        title: state.goalTitle || '',
        deadline: state.deadline ? new Date(state.deadline).toISOString() : null,
        milestones: Array.isArray(state.milestones) ? state.milestones : [],
        affirmation: state.affirmation || '',
        theme: state.selectedTheme || 'theme-midnight',
        isOverlay: Boolean(state.isOverlayVisible)
      };

      const jsonStr = JSON.stringify(payload);
      const rawBytes = new TextEncoder().encode(jsonStr);

      let compressedBytes;
      if (typeof CompressionStream !== 'undefined') {
        const stream = new ReadableStream({
          start(controller) {
            controller.enqueue(rawBytes);
            controller.close();
          }
        }).pipeThrough(new CompressionStream('deflate-raw'));

        const response = new Response(stream);
        const buffer = await response.arrayBuffer();
        compressedBytes = new Uint8Array(buffer);
      } else {
        compressedBytes = rawBytes;
      }

      const base64Url = UrlStateService.#bytesToBase64Url(compressedBytes);
      const fullHash = `${UrlStateService.PREFIX}${base64Url}`;

      if (fullHash.length > UrlStateService.MAX_URL_LENGTH) {
        throw new PayloadTooLargeError(
          `Serialized URL state exceeds ${UrlStateService.MAX_URL_LENGTH} character limit`,
          'ERR_PAYLOAD_TOO_LARGE',
          fullHash.length,
          UrlStateService.MAX_URL_LENGTH
        );
      }

      return fullHash;
    } catch (err) {
      if (err instanceof PayloadTooLargeError) {
        throw err;
      }
      throw new StateSerializationError(
        `Failed to serialize state: ${err.message}`,
        'ERR_HASH_CORRUPT',
        String(state)
      );
    }
  }

  /**
   * Deserializes Base64URL payload into clean, prototype-free state dictionary.
   * Defends against decompression bombs, prototype pollution, and malformed inputs.
   *
   * @param {string} hashOrPayload URL hash fragment or raw Base64URL payload
   * @returns {Promise<Record<string, any>>} Prototype-free state dictionary
   * @throws {PayloadTooLargeError} If incoming payload string exceeds MAX_URL_LENGTH
   * @throws {DecompressionBombError} If decompressed payload exceeds 32KB
   * @throws {StateSerializationError} If decoding or JSON parsing fails
   */
  static async deserializeState(hashOrPayload) {
    if (typeof hashOrPayload !== 'string') {
      throw new StateSerializationError('Payload must be a string', 'ERR_HASH_CORRUPT', String(hashOrPayload));
    }

    let payload = hashOrPayload;
    if (payload.startsWith(UrlStateService.PREFIX)) {
      payload = payload.slice(UrlStateService.PREFIX.length);
    } else if (payload.startsWith('#')) {
      payload = payload.slice(1);
    }

    if (payload.length > UrlStateService.MAX_URL_LENGTH) {
      throw new PayloadTooLargeError(
        `URL hash payload exceeds ${UrlStateService.MAX_URL_LENGTH} character limit`,
        'ERR_PAYLOAD_TOO_LARGE',
        payload.length,
        UrlStateService.MAX_URL_LENGTH
      );
    }

    let compressedBytes;
    try {
      compressedBytes = UrlStateService.#base64UrlToBytes(payload);
    } catch (decodeErr) {
      throw new StateSerializationError(
        `Failed to decode Base64URL payload: ${decodeErr.message}`,
        'ERR_HASH_CORRUPT',
        payload
      );
    }

    let jsonString = '';
    let isDecompressed = false;

    if (typeof DecompressionStream !== 'undefined') {
      try {
        const stream = new ReadableStream({
          start(controller) {
            controller.enqueue(compressedBytes);
            controller.close();
          }
        }).pipeThrough(new DecompressionStream('deflate-raw'));

        const reader = stream.getReader();
        const chunks = [];
        let totalBytes = 0;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          totalBytes += value.byteLength;
          if (totalBytes > UrlStateService.MAX_DECOMPRESSED_BYTES) {
            await reader.cancel();
            throw new DecompressionBombError(
              `Decompressed bytes (${totalBytes}) exceeded ${UrlStateService.MAX_DECOMPRESSED_BYTES} ceiling`,
              'ERR_DECOMPRESSION_BOMB',
              totalBytes,
              UrlStateService.MAX_DECOMPRESSED_BYTES
            );
          }
          chunks.push(value);
        }

        const merged = new Uint8Array(totalBytes);
        let offset = 0;
        for (const chunk of chunks) {
          merged.set(chunk, offset);
          offset += chunk.byteLength;
        }

        jsonString = new TextDecoder().decode(merged);
        isDecompressed = true;
      } catch (streamErr) {
        if (streamErr instanceof DecompressionBombError) {
          throw streamErr;
        }
      }
    }

    if (!isDecompressed) {
      if (compressedBytes.byteLength > UrlStateService.MAX_DECOMPRESSED_BYTES) {
        throw new DecompressionBombError(
          `Payload bytes (${compressedBytes.byteLength}) exceeded ${UrlStateService.MAX_DECOMPRESSED_BYTES} ceiling`,
          'ERR_DECOMPRESSION_BOMB',
          compressedBytes.byteLength,
          UrlStateService.MAX_DECOMPRESSED_BYTES
        );
      }
      try {
        jsonString = new TextDecoder().decode(compressedBytes);
      } catch (textErr) {
        throw new StateSerializationError(
          `Failed to decode payload text: ${textErr.message}`,
          'ERR_HASH_CORRUPT',
          payload
        );
      }
    }

    let parsed;
    try {
      parsed = JSON.parse(jsonString, (key, value) => {
        if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
          return undefined;
        }
        return value;
      });
    } catch (parseErr) {
      throw new StateSerializationError(
        `Failed to parse state JSON: ${parseErr.message}`,
        'ERR_HASH_CORRUPT',
        payload
      );
    }

    if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new StateSerializationError(
        'Parsed state root must be an object',
        'ERR_HASH_CORRUPT',
        payload
      );
    }

    const cleanResult = Object.create(null);
    Object.assign(cleanResult, parsed);
    return cleanResult;
  }

  /**
   * Converts binary Uint8Array into URL-safe Base64 without padding.
   *
   * @param {Uint8Array} bytes Input binary buffer
   * @returns {string} URL-safe Base64 string
   */
  static #bytesToBase64Url(bytes) {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }

  /**
   * Converts URL-safe Base64 string back into binary Uint8Array.
   *
   * @param {string} base64Url Input URL-safe Base64 string
   * @returns {Uint8Array} Binary byte buffer
   */
  static #base64UrlToBytes(base64Url) {
    let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4 !== 0) {
      base64 += '=';
    }
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }
}
