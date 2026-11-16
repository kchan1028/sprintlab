# CLAUDE.md

Conventions for AI-assisted work on SprintLab. This file overrides global defaults for this repo.

## Project

Single-user project and bug tracker. React + TypeScript + Vite, data in localStorage behind a repository module. No backend in v1. Scope and exclusions: `docs/product-brief.md`.

## Commands

Requires Node 22.12+ (the repo pins an exact Node 24 release in `.nvmrc`; run `nvm use`).

| Command | What it does |
|---|---|
| `npm install` | Install dependencies |
| `npm run dev` | Start the dev server (AI drafter hidden: no function) |
| `npm run dev:ai` | Build, then serve with the Pages Function on port 8788 (AI drafter; key from `.dev.vars`, see `.dev.vars.example`) |
| `npm run lint` | oxlint; warnings fail the run |
| `npm run typecheck` | TypeScript project check (`tsc -b`) |
| `npm test` | Vitest, single run |
| `npm run test:watch` | Vitest in watch mode |
| `npm run build` | Typecheck and production build to `dist/` |
| `npm run screenshots` | Regenerates `docs/screenshots/` from the production build with demo data |
| `npm run test:e2e` | Playwright smoke test against the production build on port 4317 (run `npx playwright install chromium` once) |

CI (`.github/workflows/ci.yml`) runs two jobs on every PR and on pushes to `main`: `check` (lint, typecheck, test, build) and `e2e` (Playwright). Testing approach: `docs/testing-strategy.md`.

Deploys: Cloudflare Pages Git integration. `main` → production, every PR → preview URL. See `docs/deployment.md`.

Verification is **local only** (owner decision, 2026-11-14): run `npm run dev` and follow the PR's "How to verify" steps in a browser. Don't check Cloudflare production or preview URLs.

## Workflow

- One issue → one branch → one PR. Branch names: `<type>/<issue#>-<slug>` (e.g. `feat/6-projects`).
- Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`, `test:`).
- PRs link their issue (`Closes #N`) and fill in the PR template, including verification evidence.
- Run lint, typecheck and tests before opening a PR, and report the actual output.
- Never merge without the owner's explicit OK.

## Code conventions

- Domain rules (validation, status and sprint rules) live in pure TypeScript functions under `src/domain/` and get unit tests.
- Only `src/repository/` touches localStorage.
- Handle loading, empty and error states for every screen.
- Accessible by default: labelled controls, keyboard operable, no drag-only interactions.
- No new dependencies without a stated reason in the PR.

## Collaboration rules

- Explain decisions in plain language. For each feature: problem, approach, acceptance criteria, edge cases, change, checks, how to verify, one understanding-check question.
- Clearly separate *proposed* GitHub actions from actions actually completed.
- Never invent reviews, collaborators, test results or history. AI review is labelled as AI review, not peer review.
- Record meaningful AI assistance, human decisions and corrections in `docs/ai-collaboration-log.md`.
- Never commit credentials. Secrets go in `.env` (gitignored); document names in `.env.example`.
