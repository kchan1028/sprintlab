# Case study: SprintLab

_Based on the repository's actual record at [v1.0.0](https://github.com/kchan1028/sprintlab/releases/tag/v1.0.0) (2026-11-15). Numbers come from GitHub and local runs. The owner's own reflections are still to be added._

## Summary

SprintLab is a single-user project and bug tracker built as a portfolio project to practise the software development lifecycle, Agile in a solo setting, GitHub collaboration, and responsible AI-assisted coding. It runs entirely in the browser, and its own development was planned as four sprints.

## Goals and constraints

- **Learning goals:** SDLC vs Agile, issue → branch → PR workflow, CI, releases, and working with an AI assistant without overstating what was done.
- **Product goal:** a backlog, board, sprints with goals, and review and retro, for one person, with data that survives a reload.
- **Constraints:** about 6–8 hours a week, free hosting, no server in v1.

## What was built

See the [README](../README.md) and the [v1.0.0 notes](releases/v1.0.0.md). In short: projects and work items, a five-status board, sprints with planning and completion, review and retro, error recovery, an accessibility pass, export and import, and a demo project.

## How it was built

| | |
|---|---|
| Issues | 17 planned (16 core + 1 stretch); all 16 core issues closed, stretch not started |
| Pull requests | 23 merged (including this wrap-up), 1 deliberately failing PR closed to prove CI blocks it |
| Tests | 208 Vitest + 1 Playwright; ~2,800 lines of app code, ~2,200 lines of tests |
| CI | 45 successful runs before this wrap-up, 1 failure (the deliberate one), 2 cancelled (superseded pushes) |
| Runtime dependencies | 3 (`react`, `react-dom`, `react-router`) |
| Calendar time | All four sprints in one AI-assisted session, 2026-11-14 to 15 |
| Release | [v1.0.0](https://github.com/kchan1028/sprintlab/releases/tag/v1.0.0), tagged on a commit with both CI jobs green |

**Process:** each issue had acceptance criteria; each PR recorded evidence (check output, mutation checks, local browser checks) and an AI review labelled as AI. Each sprint ended with a written review and retro whose actions fed the next sprint.

**Division of work:** Claude Code (an AI assistant) wrote most of the code, tests and docs. The owner set direction, chose the stack and host, made scope decisions (local-only verification, import replaces rather than merges, the default carry-over), approved every merge, and did checks the AI couldn't (keyboard operation of native menus).

## Decisions worth explaining

- **Browser storage instead of a backend** ([ADR-0001](adr/0001-stack.md)): fewest moving parts for one user; a repository module keeps a later move to a server contained.
- **No drag-and-drop:** a labelled status control works by keyboard and screen reader.
- **Save in `dispatch`, not in an effect:** the linter pushed back on the first version, and the result was simpler (one action, one save, nothing written on load).
- **Validate every record on load:** a crash fallback alone turned bad data into a reload loop; checking records sends it to a recovery screen instead.
- **Strict checks on import, lenient on load:** one dangling reference shouldn't lock anyone out of their data, but a file being imported can simply be refused.

## What went wrong, and what changed

- **No sprint goal in Sprints 1 and 2.** Fixed from Sprint 3 by recording the goal on the milestone first, though it was agreed lightly ("continue").
- **The AI stopped the owner's dev server,** assuming it was its own leftover process. This was corrected publicly in the PR and log, and the rule since then is to stop only processes it can prove it started, on a port checked to be free.
- **Verification scope drifted.** The AI twice started checking the deployed site after the owner had chosen local-only checks; the decision was then written into CLAUDE.md.
- **Tests passed while bugs remained.** Local browser checks found a date-default bug, a phone layout issue, a crash loop, a voice-control naming issue and a one-frame "not found" flash, all after tests passed.

## Evidence quality

- Every new kind of check was shown to fail before being trusted (CI with a failing PR, the axe helper, the e2e test, mutation checks per PR). One mutation that failed nothing was reported and explained, not hidden.
- Known gaps are listed rather than rounded up: no screen-reader test (skipped for v1.0.0), no hosted demo, Chromium only, sprints compressed into one session.

## Outcome against the final sprint goal

The v1.0.0 goal was only partly met: the release, the README and the honest evidence are done, but "try it online" and "tried with a screen reader" are not. See the [Sprint 4 review](sprints/sprint-4.md).

## Owner reflections

_To be written by the owner: what you learned, what you'd do differently, and how you'd explain SprintLab in an interview._
