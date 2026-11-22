# Component Diagram — System Components & External Boundaries

```mermaid
graph TD
    Client[Browser Client] -->|HTTP GET /| CDN[GitHub Pages Fastly CDN]

    subgraph PWARuntime [Countdown Lock Screen PWA Container]
        subgraph PresentationLayer [Presentation & Interaction Layer]
            UIView[Responsive DOM UI & Glassmorphism Styles]
            Simulator[Lock Screen Ergonomics Overlay Simulator]
        end

        subgraph CoreEngineLayer [Core Logic & Chronometry Layer]
            StateMgr[Unidirectional State Manager]
            TimeEng[Drift-Compensated Time Engine]
            UrlCodec[Base64 URL Hash Serializer]
        end

        subgraph RenderingLayer [High-DPI Wallpaper Rendering Engine]
            CanvasEng[OffscreenCanvas 2D Supersampled Renderer]
            BlobGen[Blob Exporter & Image Streamer]
        end

        subgraph AILayer [Google Gemini Intelligence Layer]
            GeminiSDK[Gemini 3.8 Flash Client]
            FallbackGen[Heuristic Milestone Synthesizer]
        end
    end

    subgraph ExternalCloud [External Third-Party APIs]
        GoogleGeminiAPI[Google Gemini AI REST API]
    end

    UIView --> StateMgr
    Simulator --> StateMgr
    StateMgr --> TimeEng
    StateMgr --> UrlCodec
    StateMgr --> CanvasEng
    CanvasEng --> BlobGen
    StateMgr --> GeminiSDK
    GeminiSDK --> FallbackGen
    GeminiSDK -->|HTTPS REST| GoogleGeminiAPI
```
