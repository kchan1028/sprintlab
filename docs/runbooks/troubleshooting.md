# Troubleshooting

Entries reviewed against source and existing records on 2026-11-17; not reproduced in this documentation change. Use fake data and preserve backups. Escalate a public-safe reproduction through the bug form, or follow [SECURITY.md](../../SECURITY.md) for a security weakness.

## Dependencies reject the Node version

For local developers: compare `node --version` with `.nvmrc`, use the pinned version, then rerun `npm ci`. The newer Vite and test stack requires a recent Node runtime. Do not change dependency versions as a setup workaround.

## The drafter is missing

For users of the public static demo: this is expected. For local developers: ordinary `npm run dev` has no Pages Function; use `npm run dev:ai` with an owner-provided key in `.dev.vars`. The section stays hidden without a configured key. Do not publish the key or enable the public endpoint to troubleshoot local setup.

## The browser cannot save changes

For app users: storage may be full or blocked. Keep the tab open, download a copy using the save-error banner, and retry after resolving storage access. Do not clear browser storage or reset before preserving a backup. If it persists, report the visible error without attaching real project data.

## The app opens a recovery screen

For app users: stored data is malformed, unsupported, or unavailable. Download the raw data when offered. Reset is destructive and requires confirmation; preserve the download first. Import only a validated known-good backup.

## Browser tests refuse port 4317

For local developers: the e2e configuration intentionally refuses an occupied port. Find who owns the process. Stop it only if this task started it; otherwise ask its owner or wait. Do not silently test an unrelated server.

## A deep link reload returns 404 on the static demo

GitHub Pages serves the app through its generated 404 fallback; the HTTP status can be 404 while the app renders. If assets fail or the page is blank, check the local production build's `/sprintlab/` base and `404.html` fallback against the [deployment guide](../deployment.md#github-pages-demo-45). The owner's verification policy is local only.
