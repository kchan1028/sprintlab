# Release checklist

Used for every release. The v1.0.0 column records what was actually done; nothing is ticked on someone's behalf.

| Step | Who | v1.0.0 |
|---|---|---|
| All issues in the release milestone closed or moved out | Owner | ✅ #16 closed after the release; #17 stays in *Stretch* |
| `main` CI green (`check` and `e2e`) | AI | ✅ `dab3450` (release merge commit): check and e2e both passed before tagging |
| `npm run lint`, `typecheck`, `test`, `build`, `test:e2e` pass locally on Node from `.nvmrc` | AI | ✅ On the #16 branch (see PR) |
| Manual browser check of the main flow on a fresh profile, with demo data | AI | ✅ On the #16 branch (see PR) |
| Screen-reader pass with [the script](screen-reader-check.md) | Owner | ⏭ **Skipped for v1.0.0** (owner decision, 2026-11-15); listed as a known limitation |
| Screenshots regenerated (`npm run screenshots`) and README reviewed | AI, then owner | ✅ Generated / ⬜ owner review |
| Demo link in README points to a working deployment, or says why not | Owner | ✅ Says why not: no URL confirmed, so run locally |
| Release notes drafted from merged PRs ([v1.0.0](releases/v1.0.0.md)) | AI | ✅ Final text, including known limitations |
| `package.json` version bumped | AI | ✅ 1.0.0 in the release PR |
| Tag `v1.0.0` and GitHub release published | **Owner approves**, AI runs | ✅ Owner merged #40 and said "continue" to the merge-and-publish question; [published](https://github.com/kchan1028/sprintlab/releases/tag/v1.0.0) 2026-11-15 |
| Final retrospective and case study updated with the release outcome | AI drafts, owner reflects | ✅ [Sprint 4 retro](sprints/sprint-4.md) and case study drafted / ⬜ owner reflections |
