# Roadmap: SprintLab

This is the only current roadmap. Requirements live in [PRODUCT.md](PRODUCT.md); historical sprint plans and release notes are evidence, not competing future commitments. Status follows the [documentation guide](docs/documentation-guide.md#status-vocabulary).

## Delivery status

| Item | Status | Evidence and limits |
|---|---|---|
| Projects, stories, bugs, five-column board | Implemented, released in v1.0.0 | [Release notes](docs/releases/v1.0.0.md), existing domain and flow tests; historical local checks recorded in linked PRs |
| Sprint planning, assignment, completion, review and retro | Implemented, released in v1.0.0 | [Sprint 2 record](docs/sprints/sprint-2.md), tests under `src/domain/` and `src/features/sprints/` |
| Save recovery, JSON backup/import, project deletion | Implemented, released in v1.0.0 | [Sprint 3 record](docs/sprints/sprint-3.md), storage and data-safety tests |
| Optional story drafter | Implemented, released in v1.1.0 | [Release notes](docs/releases/v1.1.0.md); successful real-key drafting remains unverified |
| GitHub Pages demo | Implemented | [Deployment guide](docs/deployment.md#github-pages-demo-45); no production verification claimed |
| Documentation ownership and link CI | In progress | [Issue #47](https://github.com/kchan1028/sprintlab/issues/47); independent verification Pending until reviewed |
| Screen-reader and cross-browser validation | Planned | [Accessibility gaps](ACCESSIBILITY.md#known-limitations); no new product features committed |

A released feature is not automatically Verified across every environment. Historical local results remain evidence for their tested commits; this scaffold does not rerun or upgrade them.

## Delivery approach

The initial solo Agile exercise is released. Future work uses one issue, one isolated branch, and one focused pull request with acceptance criteria. The owner approves scope and merging. Next-release scope and dates are undecided.

## Priority definitions

P0 blocks an explicitly approved release gate. P1 is expected work that may slip with an owner decision. P2 requires observed demand. No new feature priorities are assigned by this scaffold.

## Responsibilities

| Role | Owns |
|---|---|
| Project owner | Requirements, priorities, scope expansion, repository settings, merge and release approval |
| Change author | Focused implementation, checks, documentation, honest evidence |
| Independent verifier | Review and verification of the tested commit; Pending when unavailable |

## Critical risks and decision points

| Risk or decision | Raised | Owner | Why it matters / assumption | Can proceed / blocked | Revisit |
|---|---|---|---|---|---|
| Screen-reader, real-device, and non-Chromium coverage | 2026-11-17 | Project owner | Existing release gaps; no conformance claim | Documentation can proceed; stronger verification claims blocked | Before a release claiming that coverage |
| Successful real-key draft | 2026-11-17 | Project owner | Costs money and sends typed context to an external service | Core app can proceed; end-to-end draft success remains unverified | Owner authorizes a local real-key check |
| Public drafter abuse protection | 2026-11-17 | Project owner | Unauthenticated calls could spend credits; production key stays off | Core app can proceed; public enablement blocked | Approved protection design and ADR |
| Required Documentation links check, automatic merged-branch deletion, private vulnerability reporting, labels and milestones | 2026-11-17 | Project owner | Settings are not inspected or changed by this work | Workflow and docs can proceed; enforcement is unverified | Owner reviews repository settings after this PR |
| Closed unmerged branch deletion | 2026-11-17 | Project owner | Deleting an unmerged branch may discard work; workflow is opt-in and disabled by default | Other work can proceed | Owner explicitly enables `DELETE_CLOSED_BRANCHES=true` |
| Private conduct/security contact and response targets | 2026-11-17 | Project owner | No confirmed private fallback contact or response SLA | Public-safe documentation can proceed; do not promise a response time | Before accepting private reports or advertising support |

## Next actions

Review this documentation PR and its check evidence. The owner then decides repository settings and any next release scope. No deployment, merge, live model call, or settings change is authorized by the scaffold.
