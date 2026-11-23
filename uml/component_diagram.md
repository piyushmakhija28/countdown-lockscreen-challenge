# Component Diagram — System Components & External Boundaries

```mermaid
graph TD
    Client[Browser Client] -->|HTTP GET /| CDN[GitHub Pages Fastly CDN]

    subgraph PWARuntime [Countdown Lock Screen PWA Container]
        subgraph PresentationLayer [Presentation & Interaction Layer]
            UIView[Responsive DOM UI & Glassmorphism Styles]
            Simulator[Lock Screen Ergonomics Overlay Simulator]
            SaveModal[Press & Hold Standalone PWA Modal]
        end

        subgraph CoreEngineLayer [Core Logic & Chronometry Layer]
            StateMgr[Unidirectional State Manager]
            TimeEng[Drift-Compensated Time Engine]
            UrlCodec[Base64 URL Hash Serializer]
            HistoryGuard[HistoryQuotaGuard: 300ms Leaky Bucket]
        end

        subgraph RenderingLayer [High-DPI Wallpaper Rendering Engine]
            CanvasEng[OffscreenCanvas 2D Supersampled Renderer]
            TextWrapper[CanvasTextWrapper: Greedy Wrap & Font Fit]
            ParticleEng[ParticleEngine: Float32Array Confetti Physics]
            BlobGen[Blob Exporter & Image Streamer]
        end

        subgraph SensoryLayer [Audio & Haptic Feedback Subsystems]
            AudioChime[AudioChimeService: Procedural Web Audio]
            HapticCtrl[HapticFeedbackService: Vibration API]
        end

        subgraph AILayer [Google Gemini Intelligence Layer]
            GeminiSDK[Gemini 3.8 Flash Client]
            FallbackGen[Heuristic Milestone Synthesizer]
        end
    end

    subgraph ExternalCloud [External Third-Party APIs]
        GoogleGeminiAPI[Google Gemini AI REST API]
    end

    UIView --> HistoryGuard
    HistoryGuard --> UrlCodec
    UIView --> StateMgr
    Simulator --> StateMgr
    StateMgr --> TimeEng
    StateMgr --> UrlCodec
    StateMgr --> AudioChime
    StateMgr --> HapticCtrl
    StateMgr --> CanvasEng
    CanvasEng --> TextWrapper
    CanvasEng --> ParticleEng
    CanvasEng --> BlobGen
    BlobGen --> SaveModal
    StateMgr --> GeminiSDK
    GeminiSDK --> FallbackGen
    GeminiSDK -->|HTTPS REST| GoogleGeminiAPI
```
