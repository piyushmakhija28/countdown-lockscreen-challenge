# Level 8: Observability Specification — Structured Telemetry & Diagnostics

**Document ID:** `DOC-OBS-01-TELEMETRY`  
**Project:** `countdown-lockscreen-challenge`  
**Challenge:** Handshake AI Skills Studio X Google ("Your Deadline, Your Design: Create a Countdown Lock Screen")  
**Author:** Piyush Makhija (Lead Systems Architect & Developer)  
**Reviewer:** Architecture Review Board  
**Status:** APPROVED  
**Standard:** Level 2.3 Documentation Governance (Structured JSON Telemetry)

---

## 1. Structured JSON Telemetry Schema

All runtime diagnostic events conform to structured JSON schema formatting:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "TelemetryEvent",
  "type": "object",
  "required": ["timestamp", "level", "event_type", "duration_ms"],
  "properties": {
    "timestamp": { "type": "string", "format": "date-time" },
    "level": { "type": "string", "enum": ["DEBUG", "INFO", "WARN", "ERROR"] },
    "event_type": { 
      "type": "string", 
      "enum": [
        "APP_BOOTSTRAP",
        "AI_DECOMPOSITION",
        "CANVAS_RASTERIZATION",
        "WALLPAPER_DOWNLOAD",
        "URL_HASH_SERIALIZE"
      ] 
    },
    "duration_ms": { "type": "number", "minimum": 0 },
    "metadata": { "type": "object" }
  }
}
```

---

## 2. PII Scrubbing & Credential Masking Filter

Every diagnostic logger applies an in-line interceptor regex filter:
- Any string matching Google API Key pattern `AIza[0-9A-Za-z-_]{35}` is redacted to `AIza...[REDACTED]`.
- Goal titles and personal text are **NEVER** logged to external telemetry endpoints.
