# Call Graph Diagram — Function & Method Invocation Hierarchy

```mermaid
graph TD
    AppInit[app.js: initializeApp] --> StoreInit[StateStore.init]
    AppInit --> TimeInit[TimeEngine.startTicker]
    AppInit --> UrlInit[UrlStateService.deserialize]
    
    UrlInit -->|If Hash Present| StoreDispatch[StateStore.dispatch: SET_STATE]
    
    UserAction[User Clicks Generate with Gemini] --> HandleSubmit[app.js: handleGoalSubmit]
    HandleSubmit --> GeminiInvoke[GeminiClient.decomposeGoal]
    
    GeminiInvoke -->|Try| FetchAPI[fetch https://generativelanguage.googleapis.com]
    GeminiInvoke -->|Catch Error| FallbackInvoke[HeuristicGenerator.generate]
    
    FetchAPI --> ValidateJSON[GeminiClient.validateSchema]
    ValidateJSON --> StoreDispatch
    FallbackInvoke --> StoreDispatch
    
    StoreDispatch --> TimeUpdate[TimeEngine.setDeadline]
    StoreDispatch --> RenderDOM[ViewRenderer.renderAll]
    
    TimeInit --> RAFLoop[TimeEngine.tick]
    RAFLoop --> PerfNow[window.performance.now]
    RAFLoop --> CalcUnits[TimeEngine.calculateRemaining]
    CalcUnits --> UpdateTickerDOM[ViewRenderer.updateTicker]
    
    UserExport[User Clicks Download Wallpaper] --> HandleExport[app.js: handleExportClick]
    HandleExport --> CanvasAlloc[CanvasRenderer.renderToCanvas]
    CanvasAlloc --> DrawBase[CanvasRenderer.drawBackground]
    CanvasAlloc --> DrawSafe[CanvasRenderer.drawSafeZoneMargins]
    CanvasAlloc --> DrawDigits[CanvasRenderer.drawCountdownDigits]
    CanvasAlloc --> DrawSteps[CanvasRenderer.drawMilestoneBadges]
    CanvasAlloc --> DrawQuote[CanvasRenderer.drawAffirmation]
    CanvasAlloc --> CanvasToBlob[HTMLCanvasElement.toBlob]
    CanvasToBlob --> DownloadTrigger[app.js: triggerFileDownload]
```
