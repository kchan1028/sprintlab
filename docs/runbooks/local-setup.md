# Local setup

Last end-to-end setup verification: not rerun for this documentation change. The link check and its fixtures passed locally on 2026-11-17; application setup was not rerun. Commands below come from the existing scripts and release records; a source review is not runtime verification.

## What you need

Use the exact Node version in `.nvmrc` (24.21.0 at this change), npm, and Git. Run `nvm use` if nvm is installed. Never replace an existing dev server that this task did not start.

## Steps

1. From the repository root, run `npm ci`. Expected result: lockfile dependencies installed without changing the lockfile.
2. Run `npm run dev`. Expected result: a local development URL in the terminal. Open that URL; if a port is occupied, inspect whether this app is already running before starting another.
3. Choose **Your data → Add demo project** to explore with fake data. Expected result: a project with example sprints and work items.

## Check it worked

Create a throwaway project, add an item, change its status, and reload. Expected result: the item remains saved in the same browser. Export a JSON backup before experimenting with import or delete. These are verification instructions, not a claim they were rerun here.

## Configuration

| Setting | Purpose | Source | Secret? |
|---|---|---|---|
| `ANTHROPIC_API_KEY` | Optional local drafter | Owner's key in gitignored `.dev.vars`, copied from `.dev.vars.example` | Yes; never browser code |
| `BASE_PATH` | Static build subpath | Existing deployment workflow | No |
| `VITE_AI_DRAFTER` | Hide drafter on static demo | Existing Pages build sets `off` | No |

The core app needs no key. Optional local drafting uses `npm run dev:ai`; see the [existing deployment guide](../deployment.md#pages-function-and-the-api-key-17). Successful real-key drafting is not yet verified. Do not run billable calls without approval.

## Common problems

See [troubleshooting](troubleshooting.md). Check commands and scope are in the [test plan](../testing/test-plan.md#commands).
