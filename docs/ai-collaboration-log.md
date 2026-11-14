# AI collaboration log

Records meaningful AI assistance (Claude Code), the human decisions behind it, corrections, and lessons. Routine edits are not logged.

| Date | Issue | What AI did | Human decision / correction | Lesson |
|---|---|---|---|---|
| 2026-11-14 | Planning | Drafted the plan: stack options, MVP scope, data model, 16-issue backlog plus one stretch issue, sprint mapping | Chose React + browser storage over Supabase and Next.js; set 6–8 hrs/week; moved #7 into Sprint 1 | Settle experience and time constraints before sizing sprints |
| 2026-11-14 | #1 | Created the repo, labels, milestones and issues #1–#17; drafted templates, CONTRIBUTING and CLAUDE.md | Approved the plan and the public repo | Project board creation needs the `project` token scope, which the CLI token lacked |
| 2026-11-14 | #1 | Created the project board after the owner refreshed the token scope; replaced default statuses with Backlog, Ready, In Progress, Review, Done | Owner completed the `gh auth refresh` device flow | Board automation did not move closed issues to Done; statuses were set by hand |
| 2026-11-14 | #2 | Drafted the product brief, sketches, architecture/data model and ADR-0001 | Owner merged after reading the AI review | AI review caught a Mermaid label in its own draft that could fail to render; fixed before merge |
