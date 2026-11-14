# Sprint 2: Core workflow

- **Planned length:** one week. **Actual:** all four issues were completed on 2026-11-14, in the same AI-assisted session as Sprint 1.
- **Goal:** not recorded. Claude suggested "Work moves across the board and into sprints with a recorded goal, review and retro", but it was never confirmed or added to the milestone. Sprint 1's first action wasn't followed.
- **Drafted by:** Claude Code, from issues, PRs, CI runs, the AI log and the local browser checks recorded in each PR. *Owner reflections* is for the owner.

## Sprint review: what shipped

| Issue | Result | PR |
|---|---|---|
| #8 Board | Five status columns with counts and empty states; a labelled status select per card; focus follows a moved card | #28 |
| #9 Sprints | Create sprints with a required goal and dates; start one; only one active sprint per project | #29 |
| #10 Sprint planning | Assign items to planned or active sprints; board filter kept in the URL (`?sprint=`); sprint item counts | #30 |
| #11 Completion, review and retro | Complete a sprint, sending unfinished work to the backlog or the next sprint in one save; record review and retro; completed sprints are read-only | #31 |

**Planned 4, done 4.** Also merged: #27, the Sprint 1 review.

SprintLab can now run its own loop: plan a sprint, work the board, complete it, and record what happened.

### By the numbers

- 5 PRs merged (#27–#31), one per issue plus the Sprint 1 retro.
- Tests went from 57 to **138** in 15 files. Each feature PR had a mutation check that made targeted tests fail: 1, 2, 3 and 7 failing tests for #8–#11.
- CI: 12 successful runs and 1 cancelled run (a superseded push on #30). No failures.

### Verification

Every feature PR in this sprint was checked **locally in a browser** before merging, as Sprint 1's actions asked. The results are recorded in each PR.

- **#8, keyboard-only status change:** couldn't be driven by synthetic keys in the embedded browser. **The owner checked it** in a real browser and confirmed it works.
- **Production deploy:** not checked, by the owner's decision (local verification only).

## Retrospective

### What went well

- **Local browser checks found real bugs that tests missed.** In #9, a new sprint defaulted to the same dates as the previous one. In #11, sprint rows were squeezed on a phone-width screen. Both were fixed before merging.
- **Accessibility was designed in, not bolted on.** Focus follows a moved card (#8), moves to the filter when a card leaves the view (#10), and moves to the completion message (#11). Each has a test.
- **Domain rules stayed in pure functions.** The one-active-sprint rule, completed-sprint assignment and carry-over are all enforced in `src/domain/` and tested there, not just hidden in the UI.
- **No merge conflicts.** Each AI log row was added on its own feature branch (Sprint 1 action 6).
- **The owner closed a gap the AI couldn't.** Claude reported the keyboard check as unverified instead of claiming it, and the owner tested it.

### What didn't go well

- **No sprint goal again.** A goal was suggested but never agreed or recorded. The app now requires a goal for sprints created *inside* SprintLab; the repo's own milestones don't.
- **Claude stopped the owner's dev server.** While verifying #9, it killed a SprintLab Vite process on port 5173, assuming it was its own leftover. It was the owner's, and Claude's first explanation was wrong. This was corrected on #29, in the AI log, and in Claude's memory: stop only processes you can prove you started, and pick a free port.
- **Two Cloudflare checks were started after verification had been ruled local-only.** The owner stopped both. The decision is now in CLAUDE.md.
- **Understanding-check questions are still unanswered** (Sprint 1 action 5).
- **Board automation is still manual.** Items were moved on the project board by script after every merge. Whether the board's built-in workflows were enabled wasn't checked (Sprint 1 action 4).
- **Pace is still unrealistic.** Sprint 2 ran in the same day as Sprint 1, so it says nothing about capacity at 6–8 hours a week.

### Accessibility and UX debt carried into Sprint 3 (#12, #13)

- Focus drops to the page body after the project and work item forms close (#6, #7).
- Cards now have two selects plus Edit, which is crowded in narrow columns (#10).
- The browser tab title doesn't change per page (#7).
- The type badge sits inside item headings (#7).
- A completed sprint's meta line ("1 item · 1 done") repeats the same number (#11).

### Actions for Sprint 3

1. **Agree the goal before the first issue starts** (owner). Write it on the Sprint 3 milestone description. Claude asks for it and waits.
2. **Keep local browser checks per PR** (AI), with keyboard-only checks handed to the owner when the embedded browser can't do them.
3. **Never stop a process this session didn't start** (AI). Use a free port.
4. **Decide on the understanding checks** (owner): answer them, or drop them from the workflow.
5. **Turn on board workflows or keep moving cards by script** (owner): pick one and say which.
6. **Work through the debt list above in #12 and #13** (AI).

## Owner reflections

_To be written by the owner. Claude does not fill this section._
