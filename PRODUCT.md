# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

One developer managing one or more personal projects, who needs to keep work out of scattered notes and TODO comments without adopting a team management tool.

## Product Purpose

SprintLab is a small project and bug tracker that supports an honest solo Agile loop: maintain a backlog, plan a short sprint with a goal, move work through a board, and record a review and retrospective. Success means the developer can plan, complete, and reflect on work while keeping their data safe and accessible.

## Positioning

Keep the useful parts of Agile for one person: a backlog, board, sprint goal, review, and retro. Avoid team administration and planning metrics that add overhead to personal projects.

## Operating Context

The product runs in a browser and stores data locally in that browser. Users manage projects, stories, and bugs; plan and start sprints; assign and filter work; complete sprints with an explicit unfinished-work destination; and record their review and retro. JSON export and import support backups and manual transfer.

The repository documents SprintLab's use in planning its own development. Local verification is the owner's established workflow; production verification is not implied by local checks.

## Capabilities and Constraints

- Projects contain stories and bugs with titles, descriptions, priorities, and acceptance criteria.
- The board has five statuses: Backlog, Ready, In Progress, Review, and Done. Labelled controls change status without requiring drag-and-drop.
- Sprints have a required goal and dates. Only one sprint per project can be active. The active goal and board lead the project page; upcoming sprints and collapsible completed history follow. Completion opens history and announces the result without losing keyboard focus.
- With no explicit URL filter, the board shows the active sprint when one exists, otherwise all items. Explicit `?sprint=all`, `none`, and valid sprint IDs remain authoritative; unknown IDs show all. New items stay unassigned and are revealed in the no-sprint view if the current filter would hide them.
- Status remains directly editable. A Details and sprint disclosure provides assignment, description, and acceptance criteria without entering Edit. On phones, jump links reach populated statuses and empty columns are omitted; every status remains available through each item's status control.
- Appearance offers System, Light, and Dark. System follows the browser/OS preference. A saved appearance applies before the app mounts, independently of project data; blocked preference storage falls back safely and reports when a choice cannot be remembered.
- Completing a sprint sends unfinished work to the product backlog or the next sprint in one save, followed by review and retro notes.
- Data persists in localStorage behind a repository module. Failed saves retain changes and offer retry and download; damaged data receives a recovery screen.
- JSON import is validated and previewed before confirmed replacement. Project deletion requires confirmation showing its scope.
- The optional AI story drafter proposes stories and acceptance criteria. Users edit, discard, or explicitly save drafts. Core workflows work without an API key; the feature is hidden when unavailable.
- The public GitHub Pages demo has no AI drafter. A successful real-key draft remains unverified in the existing release evidence.
- Preserve the confirmed single-user scope: no accounts, team permissions, device sync, real-time collaboration, payments, or integrations. Drag-and-drop, story points, velocity, burndown charts, attachments, comments, and notifications remain outside the documented product scope.

## Brand Commitments

Preserve the SprintLab name and plain, direct product language. No new visual direction or reference brand has been selected. The Awesome Design library is reference material, not an active brand commitment.

## Evidence on Hand

- `docs/product-brief.md`: historical pointer; original planning text remains in Git history.
- `README.md`: current capabilities and release limitations.
- `docs/screenshots/`: existing product screenshots.
- `docs/sprints/`, `docs/case-study.md`, and `docs/ai-collaboration-log.md`: development process and recorded outcomes.
- `docs/releases/v1.1.0.md`: optional drafter limitations.
- `src/`: incumbent implementation; preserve existing behavior during refinement.

These records do not establish testimonials, customer adoption, real weekly capacity, or a completed screen-reader check. Do not fabricate those claims.

## Product Principles

- Make planning useful for one person without simulating a team.
- Keep goals, work, and reflection connected in a short repeatable workflow.
- Protect local data and make recovery and destructive actions understandable.
- Keep AI suggestions optional and subject to explicit human review.
- Preserve keyboard access throughout core workflows.

## Accessibility & Inclusion

Keyboard accessibility and labelled controls are confirmed constraints. Status changes must remain usable without dragging. Preserve visible focus, accessible validation and feedback, and usable phone layouts. Existing automated accessibility checks are evidence of tested cases, not proof of full accessibility; the release documentation records the skipped VoiceOver check.

## Core flows and acceptance criteria

These describe the existing release, not newly proposed features. Verification evidence and remaining gaps belong in [roadmap.md](roadmap.md).

1. **Project and work:** given an existing project, creating a valid story or bug adds it to that project's backlog; invalid input explains the error without saving. A status change moves the item to the selected column and preserves keyboard focus.
2. **Planning:** given a project with no active sprint, a sprint with a goal and valid dates can start. Starting a second active sprint in that project is rejected. Assignment only accepts a planned or active sprint in the same project.
3. **Completion:** given an active sprint with unfinished work, completing it keeps Done work in the completed sprint and moves unfinished items to the chosen allowed destination in one save. Review and retro remain editable.
4. **Data safety:** given a valid JSON backup, import previews replacement and waits for confirmation. Invalid imports change nothing. Failed persistence retains in-memory changes with retry and download actions; corrupt stored data receives a recovery screen.
5. **Optional drafts:** given an available drafter, proposed stories remain unsaved until the user reviews and adds them. With no key, the core app remains usable and the drafter is hidden.
6. **Appearance:** given a light, dark, or system choice, the interface and native controls use that appearance across routes and after reload. If preference storage fails, the choice still applies for the visit without altering project data or blocking recovery.

## Quality requirements

Preserve the confirmed keyboard access and data-safety constraints above. Do not put API keys into browser code or enable the unauthenticated public drafter without an approved abuse-protection design. Existing browser-local data does not provide cross-device backup or encryption. Accessibility checks and known gaps are recorded in [ACCESSIBILITY.md](ACCESSIBILITY.md); this record does not establish a new conformance claim or performance threshold.

## Success measures

Core flows should remain locally demonstrable with fake data and covered by the existing automated checks. No customer adoption, weekly capacity, or performance target has been approved. The original learning exercise and its historical outcomes remain in [the case study](docs/case-study.md).

## Open decisions

| Question | Raised | Owner | Why it matters | Provisional assumption | Can proceed / blocked | Revisit when |
|---|---|---|---|---|---|---|
| What requirements would justify accounts, sync, or collaboration? | 2026-11-17 | Project owner | Would replace the browser-local product boundary | None approved; keep these out of scope | Existing solo workflows can proceed; scope expansion blocked pending decision | A concrete user need is proposed |
| Is a formal accessibility standard required beyond the confirmed keyboard and data-safety constraints? | 2026-11-17 | Project owner | Determines conformance coverage and release obligations | No formal conformance claimed | Existing checks can proceed | Before a conformance claim or expanded audience |

## Decision baseline

The owner confirmed the existing solo-developer scope, keyboard accessibility, and data safety on 2026-11-17. This file is the current product authority. [The original product brief](docs/product-brief.md) remains a historical pointer; priorities and delivery status live only in [roadmap.md](roadmap.md).
