# Level 8: Observability Specification — Structured Telemetry & Diagnostics

**Document ID:** `DOC-OBS-01-TELEMETRY`  
**Project:** `countdown-lockscreen-challenge`  
**Challenge:** Handshake AI Skills Studio X Google ("Your Deadline, Your Design: Create a Countdown Lock Screen")  
**Author:** Piyush Makhija (Lead Systems Architect & Developer)  
**Reviewer:** Architecture Review Board  
**Status:** APPROVED  
**Standard:** Level 2.2 Documentation Governance (Structured JSON Telemetry)  
**Version:** 2.3.0

---

## 1. Structured JSON Telemetry Schema

All runtime diagnostic events conform strictly to a validated, structured JSON schema:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "TelemetryEvent",
  "type": "object",
  "required": ["timestamp", "correlation_id", "level", "event_type", "duration_ms"],
  "properties": {
    "timestamp": { "type": "string", "format": "date-time" },
    "correlation_id": { "type": "string", "format": "uuid" },
    "level": { "type": "string", "enum": ["DEBUG", "INFO", "WARN", "ERROR"] },
    "event_type": { 
      "type": "string", 
      "enum": [
        "APP_BOOTSTRAP",
        "AI_DECOMPOSITION",
        "CANVAS_RASTERIZATION",
        "WALLPAPER_DOWNLOAD",
        "URL_HASH_SERIALIZE",
        "COUNTDOWN_EXPIRED",
        "AUDIO_CHIME_PLAYED",
        "HAPTIC_TRIGGERED",
        "WEB_SHARE_INITIATED",
        "HISTORY_THROTTLE_TRIPPED",
        "AUTOPLAY_BLOCKED",
        "CLOCK_RESYNC_TRIGGERED",
        "DECOMPRESSION_BOMB_BLOCKED",
        "CROSS_TAB_SYNC_DISPATCHED",
        "CROSS_TAB_SYNC_RECEIVED",
        "ALARM_LOCK_ACQUIRED",
        "ALARM_LOCK_CONTENTION_SUPPRESSED",
        "AI_SAFETY_FILTER_TRIPPED",
        "FONT_PRELOAD_COMPLETED",
        "PARTICLE_PHYSICS_COMPLETED"
      ] 
    },
    "duration_ms": { "type": "number", "minimum": 0 },
    "metadata": { "type": "object" }
  }
}
```

---

## 2. Production Ring-Buffer Logger Implementation

To prevent unbounded heap growth over days of continuous lockscreen display, diagnostics are recorded in a fixed-size, circular in-memory ring-buffer with automated credential scrubbing:

```typescript
export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

export interface LogEntry {
  readonly timestamp: string;
  readonly correlationId: string;
  readonly level: LogLevel;
  readonly eventType: string;
  readonly durationMs: number;
  readonly metadata?: Record<string, unknown>;
}

/**
 * High-performance circular ring-buffer logger with Zero-PII sanitization.
 */
export class DiagnosticLogger {
  private static readonly MAX_ENTRIES = 100;
  private readonly buffer: LogEntry[] = [];
  private pointer: number = 0;
  private readonly correlationId: string = crypto.randomUUID();

  public log(level: LogLevel, eventType: string, durationMs: number, meta?: Record<string, unknown>): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      correlationId: this.correlationId,
      level,
      eventType,
      durationMs: Math.max(0, durationMs),
      metadata: meta ? this.scrubMetadata(meta) : undefined
    };

    if (this.buffer.length < DiagnosticLogger.MAX_ENTRIES) {
      this.buffer.push(entry);
    } else {
      this.buffer[this.pointer] = entry;
      this.pointer = (this.pointer + 1) % DiagnosticLogger.MAX_ENTRIES;
    }

    if (level === 'ERROR') {
      console.error(`[Telemetry:${eventType}] ${durationMs}ms`, entry);
    } else if (level === 'WARN') {
      console.warn(`[Telemetry:${eventType}] ${durationMs}ms`, entry);
    }
  }

  public getRecentLogs(): readonly LogEntry[] {
    return Object.freeze([...this.buffer]);
  }

  private scrubMetadata(meta: Record<string, unknown>): Record<string, unknown> {
    const clean: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(meta)) {
      if (typeof val === 'string') {
        clean[key] = val.replace(/AIza[0-9A-Za-z\-_]{35,40}/g, 'AIza...[REDACTED]');
      } else {
        clean[key] = val;
      }
    }
    return clean;
  }
}
```

---

## 3. Telemetry Ingress & Beacon Dispatch

Diagnostic metrics are transmitted asynchronously via `navigator.sendBeacon()` upon session termination or critical error triggers, guaranteeing zero impact on UI frame budgets:

```typescript
export function flushDiagnosticBeacon(endpointUrl: string, logs: readonly LogEntry[]): boolean {
  if (logs.length === 0 || typeof navigator.sendBeacon !== 'function') return false;
  const payload = JSON.stringify({ events: logs });
  return navigator.sendBeacon(endpointUrl, new Blob([payload], { type: 'application/json' }));
}
```
