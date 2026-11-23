# Deployment Diagram — Runtime Infrastructure & Edge CDN

```mermaid
graph TD
    subgraph ClientEnvironment [User Hardware Runtime & Progressive Web App]
        subgraph BrowserTabs [Multi-Tab Browser Client Instances]
            MainTab[Foreground Tab: Active RAF 60Hz Engine]
            PeerTab[Background / Sibling Tab: Low-Power Standby]
        end

        subgraph ClientRuntimePWA [Client PWA Execution Container]
            UIThread[Main UI Thread: Reactive DOM + OffscreenCanvas 2D]
            BgWorker[WorkerTickerAdapter: 1Hz Dedicated Web Worker]
            AudioHW[Web Audio API Engine: Master Compressor & Voice Synthesizer]
            HapticHW[Navigator Vibration API: Physical Haptic Actuator]
            StorageEngine[Client Storage: IndexedDB + LocalStorage Tier]
            WebLockMgr[Navigator Web Locks API: Alarm Single-Instance Mutex]
            TabSyncBus[BroadcastChannel: Same-Origin State Bus 'countdown_lockscreen_sync']
        end
    end

    subgraph EdgeCDN [GitHub Pages Fastly Edge CDN]
        EdgeAnycast[Fastly Anycast CDN Edge PoP Nodes]
        OriginStorage[GitHub Pages Static Repository Origin]
        
        subgraph SWCachePolicy [Service Worker Cache-First Topology: sw.js]
            ShellCache[Cache 1: Network-First App Shell - index.html]
            AssetCache[Cache 2: Stale-While-Revalidate - tokens.css, glassmorphism.css, fonts]
            NetworkOnly[Cache 3: Network-Only Bypass - Gemini API Ingress]
        end
    end

    subgraph CloudAPIs [Google Cloud Generative AI Platform]
        GeminiGateway[Google Generative Language REST Gateway: HTTPS Port 443]
        AuthShield[Header Authentication Filter: x-goog-api-key]
        HarmFilters[Safety & Harm Threshold Classifiers]
        GeminiCluster[Gemini 3.8 Flash TPU Inference Cluster]
    end

    MainTab --> UIThread
    PeerTab --> TabSyncBus
    UIThread <--> TabSyncBus
    UIThread --> BgWorker
    UIThread --> AudioHW
    UIThread --> HapticHW
    UIThread --> StorageEngine
    AudioHW <--> WebLockMgr

    MainTab -->|HTTPS TLS 1.3 / Port 443| EdgeAnycast
    EdgeAnycast -->|Cache Miss Origin Fetch| OriginStorage
    OriginStorage --> SWCachePolicy
    SWCachePolicy --> ShellCache
    SWCachePolicy --> AssetCache
    SWCachePolicy --> NetworkOnly

    UIThread -->|HTTPS POST REST: x-goog-api-key header| GeminiGateway
    GeminiGateway --> AuthShield
    AuthShield --> HarmFilters
    HarmFilters --> GeminiCluster
```
