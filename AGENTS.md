## Project Context

This repository contains a privacy-first Docker Compose generator wizard built with React + TypeScript + Vite.

### Active conventions
- Active templates live under `src/templates/services/*`.
- Add new services via `npm run scaffold:service -- ...` when possible.
- Keep package choices mainstream and stable; verify with audit + CI.
- For UI/context additions, proactively load `ux-responsive` and apply responsive + accessibility-first practices.

### Quality gates
- `npm run lint`
- `npm run test`
- `npm run test:e2e`
- `npm run build`

### CI
- Workflow: `.github/workflows/ci.yml`
- Includes security audit, lint, unit tests, build, e2e, and Lighthouse step.

### 2026-06-01 17:05 - Package upgrades + comprehensive UX/accessibility/safety hardening
**Agent:** orchestrator
**Summary:** Upgraded 11 packages (including Vite 8.0.15 for 3 CVE fixes), applied 15 UX/accessibility improvements across 6 files, added CSP header, and resolved all npm audit vulnerabilities.
- Phase 1: Upgraded vite→8.0.15 (3 CVEs: 2 HIGH), react→19.2.6, 9 other minor bumps; `npm audit fix` resolved all vulnerabilities (0 remaining). Kept vitest at 4.x.
- Phase 2-4 (Critical a11y): Added `role="status" aria-live="polite"` to importStatus + generatedNotice; wrapped CSS transitions in `@media (prefers-reduced-motion: no-preference)`; added step `role="region" aria-live="polite"` wrappers for screen-reader step announcements.
- Phase 5-6 (Mobile/High UX): Added `padding: max(1rem, 2vw)` to .app-shell, 480px breakpoint with single-column layout, `env(safe-area-inset-bottom)` on sticky footer, 2.75rem min touch targets, start-over confirmation dialog, Content-Security-Policy meta tag.
- Phase 7 (Medium UX): Fixed aria-pressed misuse (removed from ServiceCard, added to category chips); added aria-required/invalid/errormessage to FieldEditor; enhanced jumpToMissingFields with pulse highlight animation; sr-only copy confirmations in CodePanel/CopyableCodeBlock; fixed color-scheme:light→dark.
- Workflow patterns: Delegated deep analysis to @planner (UX audit), @codebase (package audit), and @review (code quality) in parallel; then delegated phased implementation to @codebase.
- All quality gates pass: lint clean, 17/17 tests, 14 templates validated, 33 links validated, build (348KB JS, 10KB CSS).

### 2026-06-01 17:02 - UX and accessibility improvements (medium-priority batch)
**Agent:** codebase
**Summary:** Fixed aria-pressed misuse, added aria-required/invalid/errormessage, enhanced jumpToMissingFields with field highlighting, added screen-reader copy announcements, and fixed color-scheme.
- Removed `aria-pressed` from ServiceCard (selection trigger, not toggle); added correct `aria-pressed` to category chip buttons in App.tsx.
- Added `aria-required`, `aria-invalid`, and `aria-errormessage` to both input variants in FieldEditor.tsx; gave validation message an id anchor.
- Enhanced `jumpToMissingFields` to set `highlightedFieldKeys` state, added `field-card-highlighted` CSS with pulse animation (respects `prefers-reduced-motion`).
- Added visually-hidden `sr-only` copy-confirmation spans with `aria-live="polite"` to CodePanel.tsx and CopyableCodeBlock.tsx.
- Fixed `color-scheme: light` → `dark` in index.css root.

### 2026-06-01 16:57 - Accessibility and mobile UX hardening
**Agent:** codebase
**Summary:** Applied aria-live regions, prefers-reduced-motion, touch target, safe-area, and CSP fixes across the app.
- Added `role="status" aria-live="polite"` to dynamic status messages in App.tsx (importStatus x2) and FieldEditor.tsx (generatedNotice).
- Wrapped CSS transitions on `.service-card` and `.copy-indicator` inside `@media (prefers-reduced-motion: no-preference)`.
- Wrapped each step section in `role="region" aria-live="polite"` divs for screen-reader step announcements.
- Added 480px mobile breakpoint, `max()`-based horizontal padding, `safe-area-inset-bottom` on sticky footer, and larger touch targets on `.inline-icon-button`.
- Added start-over confirmation dialog with `confirmStartOver` state in App.tsx.
- Added `Content-Security-Policy` meta tag to `index.html`.

### 2026-03-17 01:24 - SEO/GEO attribution refresh + UX-responsive convention
**Agent:** orchestrator
**Summary:** Applied discoverability/attribution updates and codified proactive responsive-design guidance.
- Updated `index.html` SEO metadata (author/creator/publisher, OG author, Twitter cards, `rel="me"` links).
- Enriched JSON-LD with author/creator `sameAs` links (GitHub + LinkedIn) and updated visible author naming.
- Updated `public/llms.txt` attribution fields for GEO consumers.
- Added site footer attribution links in `src/App.tsx` and styling in `src/index.css`.
- Added active convention to proactively load `ux-responsive` for future UI/context changes.

### 2026-03-14 18:20 - SEO/GEO + README agentic updates (consolidated)
**Agent:** orchestrator
**Summary:** Consolidated all 2026-03-14 documentation/discoverability work into one entry for cleaner history.
- Switched canonical/public URL targets in `index.html` (`canonical`, `og:url`, and JSON-LD `url`) to `https://shahboura.github.io/selfhost-compose-wizard/`.
- Updated GEO files: `public/sitemap.xml` `<loc>` and `public/llms.txt` canonical + primary README link to the live site.
- Added `## Agentic Development` section to `README.md`, aligned to the requested reference wording and tailored for this repo, then moved it toward the end of README for cleaner onboarding flow.
- Condensed AGENTS history by collapsing older verbose logs into `Historical milestones (condensed)` while preserving chronology.
- Left repository references (`codeRepository` and repo links) on GitHub for source attribution.

### 2026-03-13 22:31 - CI supply-chain hardening and Pages deployment modernization
**Agent:** orchestrator
**Summary:** Replaced third-party Pages publish action with official GitHub Pages actions and tightened CI permissions.
- Pinned all referenced GitHub Actions to immutable SHAs (`checkout`, `setup-node`, `upload-artifact`, `configure-pages`, `upload-pages-artifact`, `deploy-pages`).
- Migrated deployment from `peaceiris/actions-gh-pages` to artifact-based `configure-pages` + `upload-pages-artifact` + `deploy-pages` flow.
- Pruned CI by splitting deploy into `deploy-pages` job with scoped `pages/id-token` permissions; kept top-level permissions at `contents: read`.
- Consolidated duplicate Lighthouse steps into a single conditional step with PR non-blocking behavior retained.

### Historical milestones (condensed)
- 2026-03-13 22:20 — Standardized env variable naming across templates; aligned metadata + validation rules.
- 2026-03-13 20:08 — Added GetArcane templates, hardened mobile overflow behavior, and introduced Docker runtime artifacts.
- 2026-03-13 18:52 — Expanded `scaffold:service` to emit metadata and added template field-coverage CI validation.
- 2026-03-13 18:29 — Established GEO baseline (`robots.txt`, `sitemap.xml`, `llms.txt`) with initial repo canonicalization.
- 2026-03-13 16:05 — Delivered UX simplification and QA hardening (navigation guards, Playwright, CI checks).
