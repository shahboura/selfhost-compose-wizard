## Project Context

This repository contains a privacy-first Docker Compose generator wizard built with React + TypeScript + Vite.

### Active conventions
- Active templates live under `src/templates/services/*`.
- Root legacy templates are archived under `templates-legacy/root-imports/*`.
- Add new services via `npm run scaffold:service -- ...` when possible.
- Keep package choices mainstream and stable; verify with audit + CI.

### Quality gates
- `npm run lint`
- `npm run test`
- `npm run test:e2e`
- `npm run build`

### CI
- Workflow: `.github/workflows/ci.yml`
- Includes security audit, lint, unit tests, build, e2e, and Lighthouse step.

### 2026-03-13 16:05 - UX simplification and quality hardening rollout
**Agent:** orchestrator
**Summary:** Coordinated final UX simplification + QA automation updates.
- Simplified Step 1 with reduced copy and privacy footnote only on first page.
- Added direct card-to-config navigation, Home reset, import guards, risk warnings, and export constraints.
- Added Playwright e2e and CI pipeline gates; attempted Lighthouse local run (blocked by missing Chrome binary in local shell).
- Established project context and conventions in this file for future orchestration continuity.
