# Sprint 3: Quality

- **Planned length:** one week. **Actual:** all four issues were completed on 2026-11-14, in the same session as Sprints 1 and 2.
- **Goal:** *"Someone can use SprintLab with only a keyboard, can't lose data by mistake, and gets a clear message whenever something goes wrong, and an end-to-end test proves the main flow works."* Claude suggested it, and the owner replied "continue". It was recorded on the milestone before #12 started, as the Sprint 2 retro asked. It was agreed, but only lightly.
- **Drafted by:** Claude Code, from issues, PRs, CI runs and the browser checks recorded in each PR. *Owner reflections* is for the owner.

## Sprint review

### Did we meet the goal?

| Part of the goal | Met? | Evidence | Caveats |
|---|---|---|---|
| Usable with only a keyboard | **Mostly** | Focus returns after every form (#13); a keyboard-only test creates and opens a project; real Enter-key flow checked in the browser; owner confirmed the board's status menu (#8); a visible focus ring | **No screen-reader test** (VoiceOver/NVDA) |
| Can't lose data by mistake | **Mostly** | Failed saves keep changes in memory with retry, download and a leave-page warning (#12); malformed stored data goes to recovery instead of a crash loop (#12); delete and import show exact counts and offer a download first (#15); invalid imports change nothing (#15) | No undo; data lives in one browser with no automatic backup |
| A clear message whenever something goes wrong | **Yes** | Save failure, reset failure, crash fallback, malformed data, import errors with reasons, not-found pages (#12, #15); axe found no violations on any of these screens, with contrast measured | Messages only checked in English and Chromium |
| An end-to-end test proves the main flow | **Yes** | Playwright test against the production build, run in a separate `e2e` CI job; shown to fail when status changes were broken (#14) | Chromium only |

### What shipped

| Issue | Result | PR |
|---|---|---|
| #12 Validation and error states | Save-failure recovery (retry, download, leave warning), reset-failure message, crash fallback, per-record validation on load | #33 |
| #13 Accessibility | Focus return for every inline form, page titles, badges out of headings, a focus ring, label-in-name fix, axe in tests and in the browser | #34 |
| #14 Testing strategy and e2e | `docs/testing-strategy.md`, Playwright 1.64.1 smoke test, `e2e` CI job with a report artifact | #35 |
| #15 Data safety | Delete with confirmation, Your data page with export and validated import (preview, then replace) | #36 |

**Planned 4, done 4.**

### By the numbers

- 4 PRs merged (#33–#36). The Sprint 2 retro (#32) is still open, waiting for owner reflections.
- Tests went from 138 to **198** Vitest tests in 21 files, plus **1** Playwright test.
- Mutation checks made targeted tests fail in every PR:
  - #12: 2, 1 and 1 failures, plus **one that failed nothing** (removing `preventDefault()` didn't matter, because `returnValue = ''` also cancels the event). This was reported, not hidden.
  - #13: 3
  - #14: the e2e test failed against broken status changes
  - #15: 2 and 6
- New checks were proved able to fail before being trusted: the axe helper (a deliberately unlabelled input) and the e2e test.
- CI since #33 opened: 7 successful runs and 1 cancelled (a superseded push on #36). No failures. (The run for this retro's merge base was still in progress when counted.)

### Found by local browser checks, not by tests

- **#12:** the crash fallback alone trapped malformed data in a reload loop. Fixed at the source with per-record validation.
- **#13:** axe in jsdom passed everything. Axe in a real browser found a **label-in-name** violation (voice-control users couldn't target the review buttons), and only a browser can measure contrast.
- **#15:** a one-frame "Project not found" flash after deleting, caught with a title and heading MutationObserver. `flushSync` didn't fix it, because React Router applies navigation as a transition. Rendering nothing while the page leaves did.

## Retrospective

### What went well

- **The goal was set before the sprint started** (Sprint 2 action 1), and the review above can answer it clause by clause.
- **Browser checks paid off again:** three real problems found that the automated tests missed, all fixed before merge.
- **"Prove it can fail" became a habit:** applied to the axe helper, the e2e test and every mutation check. An honest zero-failure result was investigated and explained rather than dropped.
- **Process discipline held:** every dev server used a port checked to be free, and only its recorded PID was stopped (the #9 correction). The e2e config refuses an occupied port for the same reason.
- **Supply-chain care:** Playwright pinned to 1.64.1 instead of a release one day old.

### What didn't go well

- **The goal was agreed by a one-word reply.** It was recorded honestly as such, but it's thinner than the owner writing or editing it.
- **Understanding-check questions are still unanswered** (raised in Sprints 1 and 2).
- **The Sprint 2 retro PR (#32) is still open,** so this retro can't update the README status or the AI log without a merge conflict. Those updates are deferred.
- **No screen-reader testing yet.** It's the main gap in the keyboard and accessibility part of the goal.
- **A confusing console:** old errors from #12's deliberate crash test showed up during #15's check and needed explaining. The browser console keeps history per tab.
- **The pace is still a single-day, AI-driven run.** It says nothing about 6–8 hours a week.
- **Board cards are still moved by script** after each merge.

### Actions for Sprint 4 (Release)

1. **Merge the open retros first** (owner): add reflections to #32 and to this PR, then merge both. After that, update the README status and the AI log.
2. **Write the Sprint 4 goal yourself** (owner), even one line, on the milestone.
3. **Do a 10-minute VoiceOver pass** before tagging v1.0.0 (owner, with Claude preparing a script of steps).
4. **#16 release work** (AI): demo data, screenshots, README completion, release checklist, v1.0.0 notes, final retro and case study, all based on what actually happened, including the gaps above.
5. **Decide the fate of the understanding checks** (owner): answer a few for the case study, or remove step 7 from the workflow.
6. **#17 AI drafter stays a stretch goal** (owner decision), only after #16 is done.

## Owner reflections

_To be written by the owner. Claude does not fill this section._
