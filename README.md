# Selfhost Compose Wizard

[![Validation](https://img.shields.io/github/actions/workflow/status/shahboura/selfhost-compose-wizard/ci.yml?branch=main&label=validation&logo=githubactions)](https://github.com/shahboura/selfhost-compose-wizard/actions/workflows/ci.yml)
[![Live Site](https://img.shields.io/badge/live%20site-GitHub%20Pages-blue?logo=github)](https://shahboura.github.io/selfhost-compose-wizard/)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](./LICENSE)

![Lighthouse Performance](https://img.shields.io/endpoint?url=https%3A%2F%2Fshahboura.github.io%2Fselfhost-compose-wizard%2Flighthouse%2Flighthouse-performance.json)
![Lighthouse Accessibility](https://img.shields.io/endpoint?url=https%3A%2F%2Fshahboura.github.io%2Fselfhost-compose-wizard%2Flighthouse%2Flighthouse-accessibility.json)
![Lighthouse Best Practices](https://img.shields.io/endpoint?url=https%3A%2F%2Fshahboura.github.io%2Fselfhost-compose-wizard%2Flighthouse%2Flighthouse-best-practices.json)

Privacy-first web wizard for generating `docker-compose.yaml` and `.env` files for self-hosted services.

## What it does

- Guided service selection and environment variable setup
- Service-specific defaults, references, and risk warnings
- In-form secure secret generation for supported fields
- In-browser generation (no server-side form processing)
- Bundle export: `docker-compose.yaml` + `.env` (missing required values exported as explicit placeholders)

## Supported services

| Service | Category | Variant |
|---|---|---|
| Audiobookshelf | media | base |
| BentoPDF | documents | base |
| BentoPDF | documents | oauth2-proxy |
| Dozzle | operations | base |
| Dozzle | operations | oauth2-proxy |
| Immich | media | base |
| IT Tools | developer-tools | base |
| Jellyfin | media | base |
| GetArcane | operations | base |
| GetArcane + OIDC | operations | oidc |
| Plex | media | base |
| Watchtower | operations | base |

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

## Run with Docker

```bash
docker compose -f docker-compose.app.yml up --build
```

App URL: `http://localhost:8080`

## Validation

```bash
npm run test:all
```

`test:all` runs lint, unit tests (Vitest), template validation, link validation, E2E tests, Lighthouse audit, and build.

> Lighthouse badges are published from CI to the `gh-pages` branch under `lighthouse/*.json`.

## Add a new service template

```bash
npm run scaffold:service -- --service my-service --variant base --name "My Service" --category operations --description "My service description"

# categories: media, documents, operations, developer-tools, security
```

This scaffolds entries in:

- `src/templates/services/<service>/<variant>.compose.yaml`
- `src/templates/services/<service>/<variant>.meta.json` (field coverage and metadata starter)
- `src/templates/registry.ts`
- `src/data/service-catalog.ts`

## Agentic Development

This project is developed with AI-assisted workflows using [agents-opencode](https://github.com/shahboura/agents-opencode) — a set of specialized agents for orchestration, implementation, review, and documentation.
