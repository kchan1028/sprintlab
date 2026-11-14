# Product brief: SprintLab v1

## Problem

Solo developers working on side projects often track work across scattered notes, TODO comments and memory. Without a lightweight structure they skip planning, lose bugs and never look back at what went well. Team tools like Jira are too heavy for one person.

## Audience

One developer managing one or more personal projects who wants a small, honest Agile loop: a backlog, a board, short sprints and a retro.

## MVP scope (v1.0.0)

A user can:

- Create and edit a project.
- Create and edit user stories and bugs with a title, description, priority and acceptance criteria.
- Move items through Backlog → Ready → In Progress → Review → Done.
- Create a sprint, set a goal and assign work to it.
- Record a sprint review and retrospective, and complete the sprint.
- Keep their data across sessions, and export or import it as JSON.

## Explicit exclusions

- Accounts, authentication, teams, permissions
- Sync across devices or browsers
- Real-time collaboration
- Payments
- Integrations (GitHub, Slack)
- Drag-and-drop (status changes use accessible controls)
- Story points, velocity and burndown charts
- Attachments, comments, notifications

## Stretch goal

An AI drafter that turns a rough feature request into draft user stories and acceptance criteria. The user reviews every draft before anything is saved. The core app works without an API key.

## Success criteria

v1 is successful when:

1. Every MVP capability above works on the deployed site and is verified by documented steps.
2. SprintLab's own Sprint 4 is planned, run and retro'd inside SprintLab.
3. Main flows are keyboard-usable, and automated accessibility checks pass on the main screens.
4. CI runs lint, typecheck, unit/component tests and one end-to-end test on every PR.
5. The repo shows the process: an issue and PR per change, release notes, sprint retros and a case study based on actual results.

## Constraints

- One developer, about 6–8 hours a week, four one-week sprints.
- Free hosting only. No server in v1, except an optional serverless function for the stretch goal.
