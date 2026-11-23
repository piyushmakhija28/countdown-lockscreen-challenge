# Level 3: Interface & Contract Specifications

**Document ID:** `DOC-03-API-CONTRACT`  
**Project:** `countdown-lockscreen-challenge`  
**Challenge:** Handshake AI Skills Studio X Google ("Your Deadline, Your Design: Create a Countdown Lock Screen")  
**Author:** Piyush Makhija (Lead Systems Architect & Developer)  
**Reviewer:** Architecture Review Board  
**Status:** APPROVED  
**Standard:** Level 2.2 Documentation Governance (ISO/IEC/IEEE 29148 Standard)

---

## 1. External AI Service Contract: Google Gemini 3.8 Flash

The application integrates with the **Google Gemini API** (Gemini 3.8 Flash model) via the official `@google/genai` modern SDK or direct HTTPS REST fetch for retrograde deadline planning and affirmation synthesis.

### 1.1 Header Authentication Invariant
To prevent cleartext credential leaks in CDN access logs, proxy caches, or browser history:
- The Google Gemini API key is **strictly transmitted via HTTP request headers**:
  ```http
  POST /v1beta/models/gemini-1.5-flash:generateContent HTTP/1.1
  Host: generativelanguage.googleapis.com
  Content-Type: application/json
  x-goog-api-key: <API_KEY>
  ```
- Passing the API key via URL query parameter (`?key=...`) is strictly prohibited.

### 1.2 System Instruction & Context Prompt
```typescript
export const GEMINI_SYSTEM_INSTRUCTION = `
You are an elite productivity strategist and cognitive behavioral coach specializing in backward goal decomposition (retrograde planning).
Given a user's goal title and target deadline timestamp, you must:
1. Deconstruct the deadline backward into exactly 3 to 5 actionable, sequential milestones.
2. Each milestone must represent a concrete, verifiable completion phase (not vague intentions).
3. The milestones must have realistic day offsets relative to the deadline (e.g., milestone 1 is farthest away; milestone 4 is closest to deadline).
4. Craft an empowering, psychologically grounded daily affirmation (maximum 120 characters) aligned with the goal.
5. Recommend the ideal thematic aesthetic ('cyber_obsidian', 'deep_focus_zen', or 'aurora_botanical').
You must strictly return valid JSON conforming to the requested schema with zero markdown preamble or conversational filler.
`;
```

### 1.3 Formal OpenAPI 3.1 / JSON Schema (`MilestonePlanResponse`)
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "MilestonePlanResponse",
  "type": "object",
  "required": [
    "title",
    "deadline_iso",
    "milestones",
    "daily_affirmation",
    "recommended_theme"
  ],
  "properties": {
    "title": {
      "type": "string",
      "minLength": 3,
      "maxLength": 60,
      "description": "High-impact, concise title for the countdown lock screen."
    },
    "deadline_iso": {
      "type": "string",
      "format": "date-time",
      "description": "ISO-8601 UTC timestamp of the final deadline."
    },
    "milestones": {
      "type": "array",
      "minItems": 3,
      "maxItems": 5,
      "description": "Chronologically ordered sequential milestones.",
      "items": {
        "type": "object",
        "required": ["step", "title", "offset_days", "completed"],
        "properties": {
          "step": {
            "type": "integer",
            "minimum": 1,
            "maximum": 5,
            "description": "1-based index of the milestone phase."
          },
          "title": {
            "type": "string",
            "minLength": 3,
            "maxLength": 50,
            "description": "Concrete action-oriented milestone title."
          },
          "offset_days": {
            "type": "integer",
            "minimum": 0,
            "maximum": 1825,
            "description": "Days prior to deadline when this milestone should be achieved."
          },
          "completed": {
            "type": "boolean",
            "default": false,
            "description": "Initial completion status."
          }
        }
      }
    },
    "daily_affirmation": {
      "type": "string",
      "minLength": 10,
      "maxLength": 120,
      "description": "Customized motivational affirmation tailored to the user's specific challenge."
    },
    "recommended_theme": {
      "type": "string",
      "enum": ["cyber_obsidian", "deep_focus_zen", "aurora_botanical"],
      "description": "Aesthetic palette best matching the tone of the goal."
    }
  },
  "additionalProperties": false
}
```

---

## 2. Deterministic Heuristic Fallback Engine Algorithm

When the client is offline, when an API key is absent, or if the Gemini service encounters rate limits (HTTP 429), the system deterministically executes the following retrograde chronometric partitioning algorithm:

```typescript
/**
 * Deterministically synthesizes milestone intervals without network dependency.
 * @param goalTitle User entered goal string
 * @param deadline Target deadline date
 * @param now Current reference timestamp
 * @returns Fully populated MilestonePlanResponse
 */
export function generateHeuristicMilestones(
  goalTitle: string,
  deadline: Date,
  now: Date = new Date()
): MilestonePlanResponse {
  const totalMs = deadline.getTime() - now.getTime();
  const totalDays = Math.max(1, Math.floor(totalMs / (1000 * 60 * 60 * 24)));

  const offsets = [
    Math.round(totalDays * 0.75),
    Math.round(totalDays * 0.50),
    Math.round(totalDays * 0.25),
    0
  ];

  const genericTitles = [
    "Phase 1: Foundation & Requirements Mastery",
    "Phase 2: Deep Core Execution & Build Sprint",
    "Phase 3: Validation, Mock Review & Refinement",
    "Phase 4: Final Polish & Deadline Achievement"
  ];

  const milestones = genericTitles.map((title, idx) => ({
    step: idx + 1,
    title,
    offset_days: offsets[idx],
    completed: false
  }));

  return {
    title: goalTitle,
    deadline_iso: deadline.toISOString(),
    milestones,
    daily_affirmation: "Focus on the process today. Consistency compounds into mastery.",
    recommended_theme: "cyber_obsidian"
  };
}
```

---

## 3. Internal TypeScript Contracts & Branded Types

Adhering strictly to `~/.claude/rules/06-typescript-standards.md` (zero `any`, immutable contracts):

```typescript
export type EpochMilliseconds = number & { readonly __brand: unique symbol };
export type Percentage = number & { readonly __brand: unique symbol };
export type ThemeId = 'cyber_obsidian' | 'deep_focus_zen' | 'aurora_botanical';
export type LayoutRegime = 'ultra_tall' | 'standard_portrait' | 'wide_foldable';

export interface TimeRemaining {
  readonly days: number;
  readonly hours: number;
  readonly minutes: number;
  readonly seconds: number;
  readonly totalMilliseconds: EpochMilliseconds;
  readonly progressPercent: Percentage;
  readonly isExpired: boolean;
}

export interface MilestoneItem {
  readonly id: string;
  readonly step: number;
  readonly title: string;
  readonly targetDate: Date;
  readonly isCompleted: boolean;
}

export interface ITimeEngine {
  startTicker(deadline: Date, onTick: (remaining: TimeRemaining) => void, onExpire: () => void): void;
  stopTicker(): void;
  reanchorClocks(wallEpoch: number, monoTime: number): void;
  calculateRemaining(deadline: Date, referenceDate?: Date): TimeRemaining;
}

export interface IAudioChimeService {
  unlockAudioContext(): Promise<boolean>;
  playVictoryChime(): Promise<boolean>;
}

export interface WallpaperRenderOptions {
  readonly width: number;
  readonly height: number;
  readonly aspectRatio: number;
  readonly layoutRegime: LayoutRegime;
  readonly supersampleRatio: number;
  readonly themeId: ThemeId;
  readonly showSafeZoneOverlay: boolean;
}

export interface IWallpaperRenderer {
  renderToCanvas(
    options: WallpaperRenderOptions,
    data: {
      readonly title: string;
      readonly timeRemaining: TimeRemaining;
      readonly milestones: readonly MilestoneItem[];
      readonly affirmation: string;
    }
  ): Promise<HTMLCanvasElement>;

  exportToBlob(
    canvas: HTMLCanvasElement,
    format?: 'image/png' | 'image/jpeg',
    quality?: number
  ): Promise<Blob>;
}
```

---

## 4. URL Hash Serialization Protocol (`#v1=`)

### 4.1 Specification & Size Budget
To enable frictionless sharing without server storage, state is encoded directly in `window.location.hash`.

$$\text{Encoded Hash Length } L_{\text{hash}} \le 2048\text{ characters} \quad (\text{IE/Edge/Mobile Safari Safe})$$

### 4.2 Compact State Serialization Schema
```json
{
  "v": 1,
  "t": "Google SWE Internship",
  "d": "2026-12-20T10:00:00Z",
  "th": "cyber_obsidian",
  "af": "Consistency compounds into mastery.",
  "m": [
    [1, "Data Structures Sprint", 21, false],
    [2, "Dynamic Programming Review", 14, false],
    [3, "Mock Technical Interviews", 7, false],
    [4, "Final Behavioral Rounds", 0, false]
  ]
}
```

### 4.3 Safe Deserialization & Decompression Bomb Guard
- **Decompression Bomb Shield:** Decompressed JSON payload is capped at $32\text{ KB}$.
- **Prototype Pollution Shield:** The native JSON reviver strips `__proto__`, `constructor`, and `prototype` keys across all nesting depths.
- **Constant-Time Verification:** State integrity checksums are verified via bitwise constant-time comparison (`constantTimeEquals`) to eliminate side-channel timing leaks.
