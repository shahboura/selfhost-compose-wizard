# Docker Compose Generator (Self-Hosting Onboarding)

Privacy-first wizard app that helps new self-hosting users generate:

- Docker compose file (template-based)
- `.env` file from guided inputs
- service-specific extra setup hints (e.g., secrets/key generation commands)

All generation happens in-browser in this starter app.

## Why Vite instead of Next.js?

This project is currently Vite-first because the app is a pure client-side generator with no SEO/server-rendering requirement and no backend data dependencies. Vite keeps startup/build fast and complexity low.

If you later want server-side rendering, auth-protected dashboards, API routes, or hybrid rendering, migrating to Next.js is straightforward because the logic is already modularized (`src/lib`, `src/components`, `src/data`, `src/templates`).

## Included service templates

Templates are now colocated with app source for consistency:

- `src/templates/services/bentopdf/base.compose.yaml`
- `src/templates/services/bentopdf/oauth2-proxy.compose.yaml`
- `src/templates/services/dozzle/base.compose.yaml`
- `src/templates/services/dozzle/oauth2-proxy.compose.yaml`
- `src/templates/services/immich/base.compose.yaml`
- `src/templates/services/it-tools/base.compose.yaml`
- `src/templates/services/jellyfin/base.compose.yaml`

They are imported as raw strings via `src/templates/registry.ts`.

## Tech stack

- React 19 + TypeScript strict
- Vite 8
- ESLint
- Vitest

## Development

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

## Validation

```bash
npm run lint
npm run test
npm run validate:links
npm run test:e2e
npm run test:lighthouse
npm run build
```

## CI quality gates

GitHub Actions CI is configured in `.github/workflows/ci.yml` and runs:

- `npm audit --omit=dev`
- `npm run lint`
- `npm run test`
- `npm run validate:links`
- `npm run build`
- `npm run test:e2e`
- `npx @lhci/cli@0.15.1 autorun --config=./lighthouserc.json`

CI optimizations/hardening included:

- Push trigger limited to `main` (PRs run via `pull_request` trigger)
- Concurrency cancellation for superseded runs
- Minimal token permissions (`contents: read`)
- Playwright retries/workers tuned for CI stability
- Playwright and Lighthouse reports uploaded as artifacts
- `npm run test:lighthouse`

## Popular package policy and CVE posture

- Use only mainstream, widely adopted packages with active maintenance.
- Keep dependencies on latest stable versions when ecosystem compatibility allows.
- Run `npm audit` regularly in CI and before release.

Current package baseline includes React, Vite, TypeScript, ESLint, Vitest, Playwright, and JSZip.

## Legacy root compose templates

To keep the root clean, previous compose files were moved to:

- `templates-legacy/root-imports/`

Active generator templates are only under:

- `src/templates/services/...`

## Phase 2 (UX/accessibility) highlights

- Improved top navigation and onboarding flow
- Added selected service details panel
- Improved form accessibility (`htmlFor`, labeled controls, ARIA hints)
- Strengthened responsive layout behavior
- Updated template structure for easier long-term scaling

## Phase 3 highlights

- Service search and category filters in the wizard
- Grouped service cards by category
- `.env` import to prefill wizard values
- Bundle export (`.zip`) including `docker-compose.yaml` and `.env` in a flat structure
- Playwright E2E setup for onboarding flow
- Service scaffold CLI for faster template onboarding

## Context / learnings snapshot

- Keep active templates only under `src/templates/services/*`; archive imported originals in `templates-legacy/root-imports/*`.
- Prefer typed template keys (`TemplateKey`) to avoid runtime path drift.
- Block export when required values are missing to prevent invalid bundle output.
- Highlight high-risk runtime capabilities (docker socket, host networking, device mounts) in both UI and exported notes.
- Prefer famous, stable packages and verify with `npm audit` + CI checks.
- Lighthouse CI checks accessibility/performance regressions as part of CI.

## How defaults work

For each environment variable in a template:

1. If user enters value manually → use that value.
2. If user opts out (use default checked):
   - use researched recommended defaults when available,
   - otherwise use compose inline fallback (`${VAR:-default}`),
   - otherwise keep empty and mark required.

Research references are defined per service in `src/data/service-catalog.ts` via `researchReferences` (service-relevant only).

## Add a new service template

1. Add template file to `src/templates/services/<service>/<variant>.compose.yaml`.
2. Add service entry in `src/data/service-catalog.ts`:
   - `id`, `name`, `templateFile`, `templateKey`, `description`, `tags`
   - optional `fieldOverrides`
   - optional `extraTooling` hints
   - `researchReferences` (service-specific docs/reference URLs)
3. Export the raw template in `src/templates/registry.ts`.
4. (Optional) add recommended defaults or descriptions in `src/data/defaults.ts`.

### Optional fast-path: scaffold a new service

```bash
npm run scaffold:service -- --service my-service --variant base --name "My Service" --category utilities --description "My service description"
```

This creates starter files/entries in:

- `src/templates/services/<service>/<variant>.compose.yaml`
- `src/templates/registry.ts`
- `src/data/service-catalog.ts`

No core UI changes are required for standard templates.

## Notes on template integrity

Templates in `src/templates/services` are copied from the provided root compose files and kept as-is in content.

If you want semantic changes to template content (ports, env vars, images, volumes), review and approve explicitly first.
