# Sprint 1: Foundation

- **Planned length:** one week. **Actual:** every issue was completed on 2026-11-14, in one long AI-assisted session.
- **Goal (set retroactively):** a deployed app skeleton with CI, a safe data layer, and a working list of projects and work items. No goal was written down when the sprint started; that's the first lesson below.
- **Drafted by:** Claude Code, from the repo's issues, PRs, CI runs and AI log. The *Owner reflections* section is for the owner to write.

## Sprint review: what shipped

| Issue | Result | PR |
|---|---|---|
| #1 Repo foundations | Templates, CONTRIBUTING (incl. Definition of Done), CLAUDE.md, AI log, project board | #18, #20 |
| #2 Product brief and ADR-0001 | Brief, sketches, architecture and data model, stack decision | #19 |
| #3 Scaffold and CI | Vite 8 + React 19 + TS 7, Vitest 5, GitHub Actions running lint, typecheck, test, build | #21 (+ #22, a deliberately failing PR, closed) |
| #4 First deploy | Cloudflare Pages config, security headers, deployment guide | #23 |
| #5 Data layer | Typed localStorage repository with schema version and corrupt-data recovery UI | #24 |
| #6 Projects | Create, edit and list projects with validation, persistence and a save-failure warning | #25 |
| #7 Work items | Routing, a project page, and create/edit for stories and bugs with acceptance criteria | #26 |

**Planned 7, done 7.** #7 was the "if there's time" item.

### By the numbers

- 9 PRs merged, 1 throwaway PR closed unmerged on purpose.
- 57 automated tests in 8 files. Each feature PR also had a mutation check: a deliberately broken rule made tests fail, then it was restored.
- CI: 12 successful runs and 1 failure. The failure was the deliberate one in #22.

### Demo

The app runs locally with `nvm use && npm install && npm run dev`. You can create a project, open it, and add stories and bugs. Data survives a reload, and corrupt data shows a recovery screen instead of a crash.

### Local verification (2026-11-14, after the sprint)

Run by Claude Code in the built-in browser against `npm run dev` (Node 24.21.0), starting from empty storage:

| Check | Result |
|---|---|
| Empty state on first load | "No projects yet." and **New project** shown |
| Create project with empty name | Inline "Name is required.", focus on Name, nothing written to storage |
| Create "Bike calculator" with description | Appears in the list; saved with matching `createdAt`/`updatedAt` |
| Open project via its link | Project page with "Work items" and **New work item** |
| Create a High-priority bug with 2 criteria + 1 blank row | Row shows "High priority · Backlog · 2 acceptance criteria"; blank row dropped; `sprintId: null` |
| **Add criterion** | Focus moves to the new row ("Criterion 2") |
| Reload on the project URL | Project and bug still there |
| Edit title and set priority to Critical | Updated in place; `updatedAt` changed, `createdAt` unchanged, still 1 item |
| `/projects/nope` and `/some/bad/path` | "Project not found" / "Page not found" with a link back |
| Corrupt storage (`{oops`) and reload | Recovery panel with **Download a copy** and **Reset data**; stored value left untouched |
| Browser console | No errors |

Not clicked: **Download a copy** (saves a file) and **Reset data** (native confirm dialog). Automated tests cover both.

Observed: after saving a form, focus falls back to the page body. That's already tracked for #13.

### Not verified

- **Production deploy.** Out of scope by owner decision: SprintLab is verified locally only. Cloudflare Pages is connected, but the live URL, PR previews and response headers are not checked.

## Retrospective

### What went well

- **Checking current versions first paid off.** Vite 8, Vitest 5, TypeScript 7 and React Router 8 were all newer than the AI's training. Engine requirements and changelogs caught a Node 20 vs 22.12 mismatch and a Cloudflare default of Node 18 before they broke a build.
- **Linters found real bugs, not style nits.** oxlint flagged saving from a `useEffect` (#6) and reading a ref during render (#7). Both fixes made the code simpler.
- **Probing the checks themselves.** A `debugger` probe showed lint warnings didn't fail CI, which led to `--deny-warnings`. The failing-test PR proved CI blocks broken tests. Mutation checks showed the tests guard real rules.
- **The data layer never throws.** Load and save return results, so the UI handles corrupt, blocked and full storage without any try/catch scattered through the components.

### What didn't go well

- **No sprint goal was set at the start.** The issue list stood in for a goal.
- **"Done" was declared without the deploy being verified.** #4 closed on config and docs alone. The owner has since decided verification is local only, so the deploy stays unchecked by choice, not by accident.
- **No manual browser checks during the sprint.** The "How to verify" steps were written but not run until after the sprint (see *Local verification* above).
- **The pace isn't realistic for a solo developer at 6–8 hours a week.** Seven issues landed in one AI-driven day, so Sprint 1 says little about future capacity.
- **Understanding-check questions went unanswered.** The learning loop's step 7 was asked but never closed.
- **Small process friction:** the GitHub CLI token lacked the `project` scope, board automation didn't move closed issues to Done, and two PRs editing the AI log at once caused a merge conflict.
- **Accessibility debt is piling up for #13:** focus is lost after forms close, page titles don't change per route, and the badge sits inside item headings.

### Actions for Sprint 2

1. **Write the sprint goal before starting** (owner): in this file's Sprint 2 sibling and on the milestone description.
2. **Verify locally, not on the deploy** (owner decision): no Cloudflare checks. Run the dev server for each feature PR.
3. **Run "How to verify" locally before merging** (AI in the built-in browser, or owner): paste what was actually seen into the PR.
4. **Enable board workflows** (owner): *Item closed → Done* and *Pull request merged → Done*, under the board's ⋯ → Workflows.
5. **Answer or drop the understanding checks** (owner): keep them only if they're useful.
6. **One PR edits the AI log at a time** (AI): append log rows on the feature branch right before merging, to avoid conflicts.

## Owner reflections

_To be written by the owner: what you learned, what felt off, what to change. Claude does not fill this section._
