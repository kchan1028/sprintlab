# Sprint 4: Release

- **Planned length:** one week. **Actual:** 2026-11-14 to 2026-11-15, in the same AI-assisted session as Sprints 1–3.
- **Goal:** *"Someone who has never seen SprintLab can understand what it does, try it online, and see honest evidence of how it was built; I can demo it in five minutes and explain every decision in it; it has been tried with a screen reader; and v1.0.0 is tagged with release notes."* This was Claude's draft with every option the owner chose ("all and continue"), recorded on the milestone before #16 started.
- **Drafted by:** Claude Code, from the PRs, the release, CI runs and #16. *Owner reflections* is for the owner.

## Sprint review

### Did we meet the goal?

| Part of the goal | Met? | Evidence / reason |
|---|---|---|
| A newcomer can understand what it does | **Yes** | README with the problem, audience, features, screenshots and a demo project (#39) |
| …can try it online | **No** | No hosted URL was provided or verified (verification stayed local by owner decision). README and release notes say to run it locally. |
| …can see honest evidence of how it was built | **Yes** | Case study, AI collaboration log, four sprint reviews, an AI review on every PR, known limitations in the release notes |
| The owner can demo it in 5 minutes and explain every decision | **Unverified** | It's the owner's to judge; the demo project and case study are meant to support it |
| It has been tried with a screen reader | **No** | Owner skipped the VoiceOver check for v1.0.0 (2026-11-15); listed as a known limitation |
| v1.0.0 is tagged with release notes | **Yes** | [v1.0.0](https://github.com/kchan1028/sprintlab/releases/tag/v1.0.0), tagged on `dab3450` after `check` and `e2e` passed on that commit |

**Result:** the release shipped, but the sprint goal was **only partly met**: three parts yes, two no, and one for the owner to judge.

### What shipped

| Item | PR |
|---|---|
| Demo project from SprintLab's own backlog (illustrative dates, new ids, passes the import validators) | #39 |
| Scripted screenshots from the production build (`npm run screenshots`) | #39 |
| README rewrite, release checklist, release notes, case study draft, VoiceOver script | #39 |
| README status and AI log after Sprint 3 | #38 |
| Version 1.0.0, final release notes, checklist statuses | #40 |
| Tag and GitHub release v1.0.0 | (release, not a PR) |

The Sprint 2 and Sprint 3 retros (#32, #37) were also merged at the start of this sprint, without owner reflections, by the owner's choice.

## Retrospective

### What went well

- **Known limitations were published, not hidden.** The release notes list the skipped screen-reader check, the missing hosted demo and the lack of undo.
- **The tag points at a commit whose CI passed** (both jobs), and the release used the notes from the repo.
- **The demo data is useful and honest:** realistic content from SprintLab's own backlog, labelled as illustrative, and checked by the same validators as an import.
- **The screenshots are reproducible,** generated from the production build rather than captured by hand.

### What didn't go well

- **The goal included things that never happened.** Choosing "all" options added "try it online" and a screen-reader test, neither of which was done. A goal should only promise what the sprint will actually do.
- **Owner input is still missing:** reflections in all four retros and in the case study, the learning outcomes (still Claude's draft), and the understanding-check questions (unanswered since Sprint 1).
- **Stacked PRs caused two merge conflicts** (#39 on top of #38). Both were resolved by keeping the newer text, but merging #38 first would have avoided them.
- **A process slip, caught before merge:** the release PR first said "Closes #16", which would have closed the issue before the tag existed. Changed to "Refs".

## Project retrospective (v1.0.0)

- **Planned vs done:** 16 core issues planned. 15 were closed before the release PR; #16 closes with this PR. The stretch #17 (AI drafter) was not started.
- **The process held up:** one issue per PR, evidence in every PR, mutation checks, browser checks that kept finding bugs the tests missed, and every mistake recorded in the log.
- **Biggest lesson:** "verified" has to name *what* and *where*. The deploy and the screen reader were never verified, and saying so plainly is what makes the rest of the evidence believable.

## Next steps (not committed)

1. Owner: write the reflections and learning outcomes in your own words; they're the part a reviewer will value most.
2. Owner: do the VoiceOver check and decide whether to link a hosted demo; either could be a v1.0.1.
3. #17 (AI story drafter) stays in *Stretch*: only if you want to continue.

## Owner reflections

_To be written by the owner. Claude does not fill this section._
