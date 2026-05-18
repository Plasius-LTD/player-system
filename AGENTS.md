# AGENTS.md

## Scope
- This repository contains `@plasius/player-system`.
- The package provides non-rendering Player System orchestration contracts and helpers for Plasius game experiences.

## Setup
- Use Node.js 24 or later (see `.nvmrc`) and npm.
- Install dependencies with `npm ci`.

## Common Commands
- `npm run build`
- `npm run test`
- `npm run test:coverage`
- `npm run lint`
- `npm run typecheck`
- `npm run pack:check`

## Repo Conventions
- Source lives in `src/`; tests live in `tests/`; package docs live in `docs/`; demos live in `demo/`.
- `dist/` and `coverage/` are generated output and must not be edited by hand.
- Keep TypeScript `strict`, preserve dual ESM/CJS packaging, and keep public exports intentional.
- Update `README.md`, `CHANGELOG.md`, and ADR/TDR/design docs for user-facing or architectural changes.

## Safety
- Never commit secrets, production tokens, or real player data.
- Keep package scope limited to orchestration and contracts; do not embed renderer or world-authority behavior here.
