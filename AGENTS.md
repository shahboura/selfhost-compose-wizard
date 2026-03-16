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
