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

### Not verified

- **Production deploy.** The owner connected Cloudflare Pages, but nobody has confirmed the live URL, a PR preview, or the security headers on a real response. Issue #4 is closed with that gap, and it's the main open risk.
- **Manual browser checks.** Every PR lists manual steps, but none were run in a browser. Evidence comes from automated tests only.

## Retrospective

### What went well

- **Checking current versions first paid off.** Vite 8, Vitest 5, TypeScript 7 and React Router 8 were all newer than the AI's training. Engine requirements and changelogs caught a Node 20 vs 22.12 mismatch and a Cloudflare default of Node 18 before they broke a build.
- **Linters found real bugs, not style nits.** oxlint flagged saving from a `useEffect` (#6) and reading a ref during render (#7). Both fixes made the code simpler.
- **Probing the checks themselves.** A `debugger` probe showed lint warnings didn't fail CI, which led to `--deny-warnings`. The failing-test PR proved CI blocks broken tests. Mutation checks showed the tests guard real rules.
- **The data layer never throws.** Load and save return results, so the UI handles corrupt, blocked and full storage without any try/catch scattered through the components.

### What didn't go well

- **No sprint goal was set at the start.** The issue list stood in for a goal.
- **"Done" was declared without the deploy being verified.** #4 closed on config and docs alone, which bends the Definition of Done ("can be verified using documented steps").
- **No manual browser checks.** The "How to verify" steps in each PR were written but never run.
- **The pace isn't realistic for a solo developer at 6–8 hours a week.** Seven issues landed in one AI-driven day, so Sprint 1 says little about future capacity.
- **Understanding-check questions went unanswered.** The learning loop's step 7 was asked but never closed.
- **Small process friction:** the GitHub CLI token lacked the `project` scope, board automation didn't move closed issues to Done, and two PRs editing the AI log at once caused a merge conflict.
- **Accessibility debt is piling up for #13:** focus is lost after forms close, page titles don't change per route, and the badge sits inside item headings.

### Actions for Sprint 2

1. **Write the sprint goal before starting** (owner): in this file's Sprint 2 sibling and on the milestone description.
2. **Verify production** (owner + AI): confirm the `*.pages.dev` URL, one PR preview and the response headers. Record the URL in the README and deployment guide.
3. **Run "How to verify" before merging** (AI, in the built-in browser, or owner): paste what was actually seen into the PR.
4. **Enable board workflows** (owner): *Item closed → Done* and *Pull request merged → Done*, under the board's ⋯ → Workflows.
5. **Answer or drop the understanding checks** (owner): keep them only if they're useful.
6. **One PR edits the AI log at a time** (AI): append log rows on the feature branch right before merging, to avoid conflicts.

## Owner reflections

_To be written by the owner: what you learned, what felt off, what to change. Claude does not fill this section._
