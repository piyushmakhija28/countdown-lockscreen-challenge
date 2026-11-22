# Communication Diagram — Inter-Module Collaboration

```mermaid
graph LR
    User((User)) -->|1: Enters Goal & Deadline| UI[AppUI View]
    UI -->|2: Invokes decomposeGoal| Gemini[GeminiClient]
    Gemini -->|3: Returns structured milestones| UI
    UI -->|4: Dispatches action SET_MILESTONES| Store[StateStore]
    Store -->|5: Notifies state change| Engine[TimeEngine]
    Engine -->|6: Emits 60fps tick events| UI
    User -->|7: Requests Wallpaper Download| UI
    UI -->|8: render(state, options)| Canvas[CanvasRenderer]
    Canvas -->|9: Emits 1170x2532 Blob| UI
    UI -->|10: Delivers PNG file download| User
    Store -->|11: Syncs URL hash #v1=| URLService[UrlStateService]
```
