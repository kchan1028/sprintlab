# ADR-0001: React + TypeScript + Vite with browser storage

- **Status:** Accepted
- **Date:** 2026-11-14

## Context

SprintLab v1 is a single-user tracker built by one developer in about four weeks at 6–8 hours a week. The goal is practicing the SDLC and Agile workflow, not learning a large framework. Data has to survive between sessions. Sync across devices isn't required. Hosting must be free.

## Options considered

1. **React + TypeScript + Vite, data in localStorage.** No server, free static hosting, fewest moving parts. No sync across devices.
2. **React + Supabase (Postgres + auth).** Real database and sync across devices. Adds auth, row-level security and migrations in week 1.
3. **Next.js full-stack with a database.** One framework for client and server. Server/client component boundaries and a database to run add the most up-front learning.

## Decision

Option 1. Data access goes through a repository module, so moving to a backend later (option 2) changes that module rather than the UI.

Supporting choices: React Router for routing, `useReducer` + Context for state, Vitest + Testing Library for unit and component tests, Playwright for one end-to-end smoke test, a linter, GitHub Actions for CI, and a free static host with PR previews (Netlify or Cloudflare Pages, decided in #4).

## Consequences

- Data lives in one browser. JSON export/import (#15) is the backup path.
- localStorage is synchronous and limited to roughly 5 MB. That's ample for one user's text data. Write failures must be handled (#12).
- The AI stretch goal needs a serverless function so the API key never reaches the browser.
- If sync across devices becomes a goal, a new ADR will cover the move to a backend.

## Amendment (2026-11-14, #3)

- **Linter:** the current Vite React template (create-vite 9) ships oxlint, not ESLint. We kept oxlint: less config and much faster, with the React hooks rules we need. `--deny-warnings` makes warnings fail CI.
- **Formatter:** Prettier is deferred. One developer, and lint plus typecheck catch what matters. Revisit if formatting churn shows up in diffs.
- **Node:** Vitest 5 and jsdom 31 require Node 22.12+. The repo pins Node 24 (`.nvmrc`), and CI reads the same file.
