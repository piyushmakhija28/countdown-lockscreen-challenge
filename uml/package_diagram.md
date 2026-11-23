# Package Diagram — Module Layering & Namespace Boundaries

```mermaid
graph TD
    subgraph RootPackage [countdown-lockscreen-challenge]
        subgraph ConfigLayer [src/js/config]
            ThemeConfig[themes.js: Color Palettes & Glassmorphism Tokens]
            AppConstants[constants.js: Screen Sizes & Hardware Safe Zones]
        end

        subgraph CoreLayer [src/js/core]
            PortsPkg[ports.js: Clean Architecture Abstract Ports]
            StateStorePkg[StateStore.js: State Store & Trampoline Queue]
            LifecycleScopePkg[LifecycleScope.js: RAII Scope & Listener Guard]
            TimeEnginePkg[DualClockTimeEngine.js: Drift-Compensated RAF Ticker]
            MilestonePkg[MilestoneManager.js: Backward Planning State Logic]
            UrlStatePkg[UrlStateService.js: URL Hash Base64 Codec]
            HistoryGuardPkg[TokenBucketHistoryGuard.js: Safari Rate-Limit Guard]
            SanitizerPkg[InputSanitizer.js: Unicode Sanitizer & Whitelist]
        end

        subgraph ServicesLayer [src/js/services]
            WorkerTickerPkg[WorkerTickerAdapter.js: 1Hz Background Worker Ticker]
            AudioServicePkg[AudioChimeService.js: Procedural Web Audio Synthesizer]
            HapticServicePkg[HapticService.js: Haptic Vibration Feedback]
            FontServicePkg[FontService.js: WebFont Loader & Kerning Ready Guard]
            ResilientStoragePkg[ResilientStorageService.js: Tiered Persistence Adapter (IndexedDB/LocalStorage)]
            SensoryCoordPkg[SensoryCoordinator.js: Tri-Modal Sensory Coordinator (ADR-015, INV-020)]
        end

        subgraph AILayer [src/js/ai]
            GeminiClientPkg[GeminiAiClient.js: Gemini 3.8 Flash REST Gateway]
            RateLimiterPkg[GeminiRateLimiter.js: 15 RPM Token Bucket Guard]
            HeuristicPkg[HeuristicGenerator.js: Offline Retrograde Sprints]
        end

        subgraph CanvasLayer [src/js/canvas]
            CanvasRendererPkg[CanvasRenderer.js: 1170x2532 2D Engine]
            AdaptiveAllocPkg[AdaptiveBufferAllocator.js: Dynamic Scale Solver]
            LayoutEnginePkg[ResponsiveLayoutEngine.js: Tri-Modal Aspect Solver]
            TextWrapperPkg[CanvasTextWrapper.js: Greedy Line Wrap & Ellipsis]
            ParticleEnginePkg[ParticleEngine.js: Float32Array Confetti Physics]
            SafeZoneOverlayPkg[SafeZoneOverlay.js: Ergonomic Occlusion Overlay]
        end

        subgraph AppEntry [src/js]
            AppBootstrap[app.js: Application Orchestrator & View Controller]
        end
    end

    AppBootstrap --> CoreLayer
    AppBootstrap --> ServicesLayer
    AppBootstrap --> AILayer
    AppBootstrap --> CanvasLayer
    AppBootstrap --> ConfigLayer
    
    CanvasLayer --> ConfigLayer
    CanvasLayer --> CoreLayer
    CanvasLayer --> ServicesLayer
    AILayer --> CoreLayer
    CoreLayer --> ConfigLayer
```
