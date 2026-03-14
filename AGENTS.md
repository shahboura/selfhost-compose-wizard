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

### 2026-03-14 00:00 - SEO/GEO canonical URL switch and README agentic section
**Agent:** blogger
**Summary:** Updated discoverability metadata to the live GitHub Pages URL and added AI workflow documentation.
- Switched canonical/public URL targets in `index.html` (`canonical`, `og:url`, and JSON-LD `url`) to `https://shahboura.github.io/selfhost-compose-wizard/`.
- Updated GEO files: `public/sitemap.xml` `<loc>` and `public/llms.txt` canonical + primary README link to the live site.
- Added `## Agentic Development` section to `README.md`, aligned to the requested reference wording and tailored for this repo.
- Left repository references (`codeRepository` and repo links) on GitHub for source attribution.

### 2026-03-13 22:31 - CI supply-chain hardening and Pages deployment modernization
**Agent:** orchestrator
**Summary:** Replaced third-party Pages publish action with official GitHub Pages actions and tightened CI permissions.
- Pinned all referenced GitHub Actions to immutable SHAs (`checkout`, `setup-node`, `upload-artifact`, `configure-pages`, `upload-pages-artifact`, `deploy-pages`).
- Migrated deployment from `peaceiris/actions-gh-pages` to artifact-based `configure-pages` + `upload-pages-artifact` + `deploy-pages` flow.
- Pruned CI by splitting deploy into `deploy-pages` job with scoped `pages/id-token` permissions; kept top-level permissions at `contents: read`.
- Consolidated duplicate Lighthouse steps into a single conditional step with PR non-blocking behavior retained.

### 2026-03-13 22:20 - Env variable naming convention consolidation across templates
**Agent:** orchestrator
**Summary:** Standardized service env variable naming with explicit prefixes/suffixes across active and legacy templates.
- Renamed generic and inconsistent keys to service-prefixed forms (GetArcane, Immich, BentoPDF OAuth2, Dozzle OAuth2) and aligned `_DIR`/`_FILE`/`_PORT` usage.
- Updated generator metadata sources (`defaults.ts`, `service-catalog.ts`, `field-security.ts`) and adjusted secret/URL validation to new key patterns.
- Extended template metadata inference to classify `*_FILE` as `path`, then rewrote all template meta files.
- Verified with `validate:templates`, unit tests, and lint; no stale old-key references in templates.

### 2026-03-13 20:08 - GetArcane onboarding, mobile overflow hardening, and containerization
**Agent:** orchestrator
**Summary:** Added GetArcane templates, tightened mobile layout behavior, and introduced production container artifacts.
- Added `getarcane` base/OIDC templates + metadata, service catalog entries, and references aligned to official docs/generator.
- Hardened mobile layout for Step 2/3 by improving wrapping/min-width behavior in field headers, action rows, service details, and code panels.
- Added Docker runtime artifacts (`Dockerfile`, `.dockerignore`, `docker-compose.app.yml`, `docker/nginx.conf`) and verified image build locally.
- Ran full quality gates plus dependency freshness checks (`npm outdated`, `npm update`, tests/build/e2e/link/template validation).

### 2026-03-13 18:52 - Template scaffolding and field-coverage automation
**Agent:** em-advisor
**Summary:** Expanded service scaffolding to generate metadata and added template field-coverage validation in CI.
- Reworked `scaffold:service` to create `.meta.json` alongside compose templates with inferred field metadata and optional docs/risk/tags.
- Added `scripts/validate-templates.mjs` and CI step (`npm run validate:templates`) to enforce compose-to-metadata field coverage.
- Added `scripts/sync-template-meta.mjs` and generated metadata files for all existing templates.
- Updated test orchestration (`test:all`) and README scaffold notes to include template validation and metadata generation.

### 2026-03-13 18:29 - GEO metadata baseline and repository canonicalization
**Agent:** em-advisor
**Summary:** Added generative/search discoverability metadata aligned to the new GitHub repository URL.
- Updated `index.html` with canonical/OG metadata and JSON-LD (`SoftwareApplication`) using repo URL as temporary canonical.
- Added `public/robots.txt`, `public/sitemap.xml`, and `public/llms.txt` for crawler and LLM discoverability.
- Documented GEO/discoverability guidance in README with instructions to swap URLs once public site is live.
- Confirmed no hardcoded secrets detected via pattern-based pre-push scan.

### 2026-03-13 16:05 - UX simplification and quality hardening rollout
**Agent:** orchestrator
**Summary:** Coordinated final UX simplification + QA automation updates.
- Simplified Step 1 with reduced copy and privacy footnote only on first page.
- Added direct card-to-config navigation, Home reset, import guards, risk warnings, and export constraints.
- Added Playwright e2e and CI pipeline gates; attempted Lighthouse local run (blocked by missing Chrome binary in local shell).
- Established project context and conventions in this file for future orchestration continuity.
