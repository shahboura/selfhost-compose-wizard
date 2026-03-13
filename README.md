# Selfhost Compose Wizard

Privacy-first web wizard for generating `docker-compose.yaml` and `.env` files for self-hosted services.

## What it does

- Guided service selection and environment variable setup
- Service-specific defaults, references, and risk warnings
- In-browser generation (no server-side form processing)
- Bundle export: `docker-compose.yaml` + `.env`

## Supported services

| Service | Category | Variant |
|---|---|---|
| BentoPDF | utilities | base |
| BentoPDF | utilities | oauth2-proxy |
| Dozzle | observability | base |
| Dozzle | observability | oauth2-proxy |
| Immich | media | base |
| IT Tools | utilities | base |
| Jellyfin | media | base |

## Tech stack

- React 19 + TypeScript
- Vite 8
- ESLint
- **Vitest** (unit tests)
- Playwright (E2E)

## Run locally

```bash
npm install
npm run dev
```

## Validation

```bash
npm run test:all
```

`test:all` runs lint, unit tests (Vitest), template validation, link validation, E2E tests, Lighthouse audit, and build.

## Add a new service template

```bash
npm run scaffold:service -- --service my-service --variant base --name "My Service" --category utilities --description "My service description"
```

This scaffolds entries in:

- `src/templates/services/<service>/<variant>.compose.yaml`
- `src/templates/services/<service>/<variant>.meta.json` (field coverage and metadata starter)
- `src/templates/registry.ts`
- `src/data/service-catalog.ts`
