# ADR-0002: AI story drafter through a Pages Function

- **Status:** Accepted
- **Date:** 2026-11-16
- **Issue:** #17 (stretch)

## Context

The stretch goal turns a rough feature request into draft user stories with acceptance criteria. Calling a model needs an API key, and v1 has no server. Anything in the browser bundle, including `VITE_*` variables, is readable by every visitor, so the key can't live there. The app also has no accounts, so a public endpoint can't tell its owner from anyone else.

## Options considered

1. **Cloudflare Pages Function** next to the static site (`functions/api/draft-stories.ts`). Same host and deploy, secret stored by Cloudflare, free tier.
2. **A separate server** (for example a small Node app). More to host and deploy for one endpoint.
3. **Browser asks the user for their own key.** No server, but the key sits in the page and in localStorage, and it teaches the pattern the issue rules out ("API key exists only server-side").

## Decision

Option 1, with these choices:

- **Model:** `claude-opus-5-5` (the current default model), `effort: "low"`, structured output against a JSON schema, `max_tokens` 8,000, a 45-second server timeout with one retry. Cheaper models (for example `claude-haiku-5-5`) were offered; the owner chose the default.
- **Refusals:** the server-side fallback (`fallbacks: "default"`, beta `server-side-fallback-2026-07-01`) re-runs a refused request on another model; a refusal that still comes back is shown as a message.
- **Validation twice:** the function checks the model's output, and the app checks the function's reply, with the same pure `parseDrafts` in `src/domain/drafts.ts`.
- **Nothing saved without review:** drafts live in component state until the user adds them; one `workItems/added` action saves them together.
- **Feature detection:** `GET /api/draft-stories` returns `{ enabled }`. With no key, or no function (plain `npm run dev`), the section isn't rendered.
- **No key in production for now.** The deployed site ships the function but no secret, so the button is hidden there. Verification is local only (owner decision), and without accounts or rate limiting an enabled public endpoint would let anyone spend the owner's credits.

## Consequences

- Two new dependencies: `@anthropic-ai/sdk` (runtime, used only by the function, not bundled into the app) and `wrangler` (dev only, runs the function locally).
- Local use needs `npm run dev:ai` with a key in `.dev.vars`; `npm run dev` keeps working without one.
- Enabling it in production later needs a new decision on abuse protection (rate limiting or Cloudflare Access) before setting the secret.
- The request text and the project's name and description are sent to Anthropic; the UI says so.
