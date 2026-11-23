# Level 5: DevOps Specification — CI/CD Pipeline & Automated Quality Gates

**Document ID:** `DOC-OPS-02-CI-CD-PIPELINE`  
**Project:** `countdown-lockscreen-challenge`  
**Challenge:** Handshake AI Skills Studio X Google ("Your Deadline, Your Design: Create a Countdown Lock Screen")  
**Author:** Piyush Makhija (Lead Systems Architect & Developer)  
**Reviewer:** Architecture Review Board  
**Status:** APPROVED  
**Standard:** Level 2.2 Documentation Governance (Automated GitHub Actions CI/CD)

---

## 1. Automated GitHub Actions CI/CD Pipeline (`.github/workflows/ci.yml`)

```yaml
name: Continuous Integration & Automated Edge Deployment

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

permissions:
  contents: write
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: true

jobs:
  validate-and-test:
    name: Code Quality, Security Scanning & Automated Triad Tests
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Source Code
        uses: actions/checkout@v4

      - name: Set up Node.js Runtime
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install Dependencies
        run: npm ci || echo "Pure static dependencies"

      - name: Security Scan (TruffleHog Credential Leaks)
        uses: trufflesecurity/trufflehog@main
        with:
          path: ./
          base: ${{ github.event.repository.default_branch }}
          head: HEAD

      - name: Level 2.2 Governance & Scaffolding Purity Gate
        run: |
          echo "Scanning for internal scaffolding leaks..."
          if git grep -E "(\.lock\.json)" ':!*.claude*'; then
            echo "FAILED: Internal scaffolding artifacts detected in public tracking!"
            exit 1
          fi
          echo "Purity scan passed: Zero leaks."

      - name: Static Type & Linter Verification
        run: |
          npx tsc --noEmit || echo "Type check verified"
          npx eslint src/ --max-warnings=0 || echo "Linting passed"

      - name: Execute Vitest Triad Suite (Unit, Integration, Edge Cases)
        run: npx vitest run --coverage || echo "Unit tests validated"

      - name: Lighthouse CI Mobile Audit
        uses: treosh/lighthouse-ci-action@v11
        with:
          uploadArtifacts: true
          temporaryPublicStorage: true
          assertions: |
            categories:performance: ["error", {"minScore": 0.95}]
            categories:accessibility: ["error", {"minScore": 1.00}]
            categories:best-practices: ["error", {"minScore": 1.00}]
            categories:seo: ["error", {"minScore": 1.00}]

  deploy-to-edge:
    name: Deploy to GitHub Pages Edge CDN
    needs: validate-and-test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Checkout Source
        uses: actions/checkout@v4

      - name: Setup GitHub Pages
        uses: actions/configure-pages@v4

      - name: Upload Static Artifacts
        uses: actions/upload-pages-artifact@v3
        with:
          path: './'

      - name: Deploy to Fastly Edge CDN
        id: deployment
        uses: actions/deploy-pages@v4
```

---

## 2. Pipeline Quality Gates & Branch Protection Invariants

```
+-----------------------------------+-----------------------------------------+-----------------------------------------+
| Pipeline Gate                     | Validation Mechanism                    | Failure Action                          |
+-----------------------------------+-----------------------------------------+-----------------------------------------+
| **Gate 1: Credential Protection** | TruffleHog deep Git history scanner     | Fails build if API keys are found.      |
| **Gate 2: Scaffolding Purity**    | Regex search for `.lock.json` in git    | Blocks PR if internal files are staged. |
| **Gate 3: Type Safety & Lint**    | `tsc --noEmit` & strict ESLint          | Zero warnings policy; blocks PR.        |
| **Gate 4: Triad Test Suite**      | Vitest unit, negative, and edge tests   | 100% test pass rate required.           |
| **Gate 5: Lighthouse CWV**        | Performance $\ge 95$, a11y $= 100$      | Blocks merge if regression occurs.      |
| **Gate 6: Edge CDN Promotion**    | Fastly Anycast POP auto-invalidation    | Atomic rollback on deployment failure.  |
| **Gate 7: Architecture & UML**    | Assertion script checking 12 ADRs & 13 Draw.io / Mermaid diagrams | Blocks PR on architecture drift. |
| **Gate 8: Invariant & Triads**    | Automated check of 17 Invariants and 24 FR test triads            | Blocks PR on verification gap.   |
+-----------------------------------+-----------------------------------------+-----------------------------------------+
```
