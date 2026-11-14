# CLAUDE.md

Conventions for AI-assisted work on SprintLab. This file overrides global defaults for this repo.

## Project

Single-user project and bug tracker. React + TypeScript + Vite, data in localStorage behind a repository module. No backend in v1. Scope and exclusions: `docs/product-brief.md`.

## Commands

None yet. Added with the app scaffold (#3): `dev`, `lint`, `typecheck`, `test`, `build`.

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
