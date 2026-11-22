# Level 10: Management Specification — Requirements Traceability Matrix (RTM)

**Document ID:** `DOC-MGT-03-RTM`  
**Project:** `countdown-lockscreen-challenge`  
**Challenge:** Handshake AI Skills Studio X Google ("Your Deadline, Your Design: Create a Countdown Lock Screen")  
**Author:** Piyush Makhija (Lead Systems Architect & Developer)  
**Reviewer:** Architecture Review Board  
**Status:** APPROVED  
**Standard:** Level 2.3 Documentation Governance (Bidirectional Traceability Standard)

---

## 1. Bidirectional Requirements Traceability Matrix

```
+-------------------------------------------------------------------------------------------------------+
|                                  COMPLETE BIDIRECTIONAL TRACEABILITY MATRIX                           |
+---------+--------------------+---------------------+----------------------+---------------------------+
| Req ID  | PRD Feature Link   | HLD Component       | LLD Class / File     | Test Case Verification ID |
+---------+--------------------+---------------------+----------------------+---------------------------+
| FR-01   | F-02 Countdown     | InputController     | TimeEngine.ts        | TC-POS-01, TC-NEG-01      |
| FR-02   | F-01 Gemini AI     | GeminiGateway       | GeminiClient.ts      | TC-POS-02, TC-EDGE-01     |
| FR-03   | F-01 Fallback      | HeuristicEngine     | HeuristicGen.ts      | TC-NEG-02                 |
| FR-04   | F-01 Affirmation   | GeminiGateway       | GeminiClient.ts      | TC-POS-03                 |
| FR-05   | F-02 Chronometer   | TimeEngine          | TimeEngine.ts        | TC-POS-04                 |
| FR-06   | F-02 Zero Drift    | TimeEngine          | TimeEngine.ts        | TC-POS-05, TC-EDGE-02     |
| FR-07   | F-03 Milestones    | MilestoneStore      | MilestoneMgr.ts      | TC-POS-06                 |
| FR-08   | F-03 Progress Calc | MilestoneStore      | MilestoneMgr.ts      | TC-POS-07                 |
| FR-09   | F-04 Safe Zone     | SimulatorOverlay    | SafeZoneOverlay.ts   | TC-POS-08                 |
| FR-10   | F-04 28% Margin    | CanvasCompositor    | CanvasRenderer.ts    | TC-POS-08                 |
| FR-11   | F-05 1170x2532     | CanvasCompositor    | CanvasRenderer.ts    | TC-POS-09                 |
| FR-12   | F-05 2x Supersample| CanvasCompositor    | CanvasRenderer.ts    | TC-POS-09                 |
| FR-13   | F-06 Themes        | ThemeController     | ThemeConfig.ts       | TC-POS-11, TC-POS-12      |
| FR-14   | F-07 URL Hash      | UrlSerializer       | UrlStateService.ts   | TC-POS-13, TC-POS-14      |
| FR-15   | F-05 Download      | BlobExporter        | CanvasRenderer.ts    | TC-POS-10                 |
+---------+--------------------+---------------------+----------------------+---------------------------+
```
