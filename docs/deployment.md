# Deployment guide

SprintLab is a static site hosted on **Cloudflare Pages** through its Git integration. Cloudflare builds directly from this GitHub repo. The only server code is the optional AI drafter's Pages Function, and production has no secrets set (see below).

A second copy is published to **GitHub Pages** as the public demo (see [GitHub Pages demo](#github-pages-demo-45)).

## GitHub Pages demo (#45)

`.github/workflows/pages.yml` publishes https://kchan1028.github.io/sprintlab/ on every push to `main` (or by hand from the Actions tab).

| Detail | Why |
|---|---|
| Built with `BASE_PATH=/sprintlab/` | The site lives under a subpath. `vite.config.ts` reads `BASE_PATH` for asset URLs, and the router uses the same base (`import.meta.env.BASE_URL`). Other builds default to `/`. |
| `dist/index.html` copied to `dist/404.html` | GitHub Pages has no SPA fallback. Reloading a deep link like `/sprintlab/projects/<id>` serves the app with status 404, and the router takes over. |
| Built with `VITE_AI_DRAFTER=off` | There's no Pages Function on GitHub Pages, so the app skips the drafter check instead of requesting a URL that can only 404. |
| No `_headers` | GitHub Pages ignores `public/_headers`, so the security headers apply on Cloudflare only. |

One-time setup (owner): repo **Settings → Pages → Source: GitHub Actions**. Storage note: every `*.github.io` project site of the same account shares one localStorage, and SprintLab's data lives under its own key (`sprintlab:data`).

## How deploys happen

| Event | Result |
|---|---|
| Push or merge to `main` | Production deploy to the `*.pages.dev` URL |
| Push to any other branch / open a PR | Preview deploy with its own URL, posted on the PR |
| Commit message containing `[skip ci]` or `[CI Skip]` | Build skipped |

Cloudflare also reports a build status check on each PR, next to the GitHub Actions `check`.

## Build settings

| Setting | Value |
|---|---|
| Production branch | `main` |
| Framework preset | React (Vite) |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Node version | read from `.nvmrc` (exact version pinned; Cloudflare's default is 18, which is too old for Vite 8) |

`public/_headers` sets basic security headers. Pages serves `index.html` for unknown paths because there is no `404.html` (SPA fallback), which client-side routing will rely on.

## One-time setup (done by the repo owner in the dashboard)

1. Cloudflare dashboard → **Workers & Pages** → **Create application** → **Pages** → **Import an existing Git repository**.
2. Authorize the Cloudflare GitHub app for `kchan1028/sprintlab` only.
3. Enter the build settings above and save. The first production build starts immediately.

## Checking a deploy

Runtime verification is local only by owner decision. Use the PR's local verification steps and record the tested commit and actual results. Do not check production or preview URLs unless the owner explicitly changes that policy. Publishing and a successful build do not establish runtime verification. Release evidence remains in the [release checklist](release-checklist.md).

## Pages Function and the API key (#17)

Cloudflare builds `functions/` into a Pages Function at `/api/draft-stories` on every deploy. It reads one secret, `ANTHROPIC_API_KEY`.

- **Production: no key is set, on purpose.** Without it the function answers `{ "enabled": false }` and the app hides the AI drafter. The app has no accounts, so an enabled public endpoint would let anyone spend the owner's credits ([ADR-0002](adr/0002-ai-drafter.md)).
- **To enable it later:** first add abuse protection (rate limiting or Cloudflare Access), then Pages project → **Settings** → **Variables and Secrets** → add `ANTHROPIC_API_KEY` as a **Secret** for Production only, and redeploy.
- **Locally:** copy `.dev.vars.example` to `.dev.vars`, add a key and run `npm run dev:ai` (port 8788). `.dev.vars` is gitignored.
- Never use a `VITE_` variable for the key: Vite bundles those into the public JavaScript.

## Rollback

Production can be reverted instantly without a new build:

1. Cloudflare dashboard → the Pages project → **Deployments**.
2. On a previous successful production deployment, open the **⋯** menu → **Rollback to this deployment** → confirm.
3. Fix forward with a normal PR, then merge to deploy again.

Preview deployments are not rollback targets.

## Data note

User data lives in each visitor's browser (localStorage), not on Cloudflare. Deploys and rollbacks never touch it. Schema changes must stay backward-compatible or ship a migration (#5).
