# AI collaboration log

Records meaningful AI assistance (Claude Code), the human decisions behind it, corrections, and lessons. Routine edits are not logged.

| Date | Issue | What AI did | Human decision / correction | Lesson |
|---|---|---|---|---|
| 2026-11-14 | Planning | Drafted the plan: stack options, MVP scope, data model, 16-issue backlog plus one stretch issue, sprint mapping | Chose React + browser storage over Supabase and Next.js; set 6–8 hrs/week; moved #7 into Sprint 1 | Settle experience and time constraints before sizing sprints |
| 2026-11-14 | #1 | Created the repo, labels, milestones and issues #1–#17; drafted templates, CONTRIBUTING and CLAUDE.md | Approved the plan and the public repo | Project board creation needs the `project` token scope, which the CLI token lacked |
| 2026-11-14 | #1 | Created the project board after the owner refreshed the token scope; replaced default statuses with Backlog, Ready, In Progress, Review, Done | Owner completed the `gh auth refresh` device flow | Board automation did not move closed issues to Done; statuses were set by hand |
| 2026-11-14 | #2 | Drafted the product brief, sketches, architecture/data model and ADR-0001 | Owner merged after reading the AI review | AI review caught a Mermaid label in its own draft that could fail to render; fixed before merge |
| 2026-11-14 | #3 | Scaffolded Vite + React + TS from create-vite 9, added Vitest + Testing Library and the CI workflow | Plan said ESLint + Prettier; kept the template's oxlint and deferred Prettier (ADR-0001 amendment) | Checked engine requirements before installing: Vitest 5 needs Node 22.12+, local default was 20. A probe file showed oxlint warnings exit 0, so lint now uses `--deny-warnings` |
| 2026-11-14 | #4 | Wrote the Cloudflare Pages config, security headers and the deployment guide from current Cloudflare docs | Owner picked Cloudflare Pages over Netlify and GitHub Pages; owner connects the repo in the dashboard | Cloudflare's build image defaults to Node 18, so `.nvmrc` now pins an exact Node 24 release used by both CI and Cloudflare |
