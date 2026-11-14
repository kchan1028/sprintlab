# Deployment guide

SprintLab is a static site hosted on **Cloudflare Pages** through its Git integration. There's no server and no secrets: Cloudflare builds directly from this GitHub repo.

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

1. Open the PR's Cloudflare comment or status check and follow the preview link.
2. Confirm the SprintLab heading loads and the browser console has no errors.
3. After merging, confirm the production URL shows the same change.

## Rollback

Production can be reverted instantly without a new build:

1. Cloudflare dashboard → the Pages project → **Deployments**.
2. On a previous successful production deployment, open the **⋯** menu → **Rollback to this deployment** → confirm.
3. Fix forward with a normal PR, then merge to deploy again.

Preview deployments are not rollback targets.

## Data note

User data lives in each visitor's browser (localStorage), not on Cloudflare. Deploys and rollbacks never touch it. Schema changes must stay backward-compatible or ship a migration (#5).
