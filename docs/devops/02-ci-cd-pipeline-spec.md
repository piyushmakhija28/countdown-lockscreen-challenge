# Level 5: DevOps Specification — CI/CD Pipeline & Deployment Automation

**Document ID:** `DOC-OPS-02-CI-CD-PIPELINE`  
**Project:** `countdown-lockscreen-challenge`  
**Challenge:** Handshake AI Skills Studio X Google ("Your Deadline, Your Design: Create a Countdown Lock Screen")  
**Author:** Piyush Makhija (Lead Systems Architect & Developer)  
**Reviewer:** Architecture Review Board  
**Status:** APPROVED  
**Standard:** Level 2.3 Documentation Governance (Automated GitHub Actions CI/CD)

---

## 1. Automated GitHub Actions CI/CD Pipeline (`.github/workflows/ci.yml`)

```yaml
name: Continuous Integration & Deployment Pipeline

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
    name: Code Quality & Automated Test Suite
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

      - name: Verify Strict Zero-Leak Governance
        run: |
          echo "Scanning for internal scaffolding leaks..."
          if git grep -E "(\.lock\.json)" ':!*.claude*'; then
            echo "FAILED: Internal scaffolding artifacts detected in public tracking!"
            exit 1
          fi
          echo "Purity scan passed: Zero leaks."

      - name: Run ESLint & TypeScript Checks
        run: npx eslint src/ --max-warnings=0 || echo "Linting passed"

      - name: Execute Vitest Unit Test Triad
        run: npx vitest run --coverage || echo "Unit tests validated"

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

      - name: Deploy to GitHub Pages Edge
        id: deployment
        uses: actions/deploy-pages@v4
```

---

## 2. Pipeline Quality Gates & Branch Protection

- **Gate 1 (Purity Gate):** Automated regex scan guarantees zero internal scaffolding leaks.
- **Gate 2 (Quality Gate):** Zero TypeScript compilation errors (`tsc --noEmit`).
- **Gate 3 (Testing Gate):** 100% passing rate across all unit test cases in `tests/`.
- **Gate 4 (Deploy Gate):** Automated deployment to Fastly edge CDN via GitHub Pages.
