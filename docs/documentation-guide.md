# Documentation guide

Where each kind of information lives, how to describe the status of work honestly, and how to write documentation a new contributor can act on. Follow it for every document in this repository.

## Document maintenance rule (mandatory)

Every change reviews [PRODUCT.md](../PRODUCT.md) and [roadmap.md](../roadmap.md) for impact, as [CONTRIBUTING.md](../CONTRIBUTING.md#the-one-rule-that-applies-to-every-change) describes. When a change affects neither, the change summary says so.

## Where things live

Each fact has one home. Other documents link to it instead of copying it.

| Information | Home | Notes |
|---|---|---|
| Requirements, scope, flows, business rules, acceptance criteria | [PRODUCT.md](../PRODUCT.md) | Source of truth |
| Phases, priorities, dependencies, risks, delivery status | [roadmap.md](../roadmap.md) | Source of truth; the only roadmap |
| Feature overview | [feature.md](../feature.md) | Summary; not a competing roadmap |
| Project summary and document map | [README.md](../README.md) | Must match the two sources |
| How to propose and review changes | [CONTRIBUTING.md](../CONTRIBUTING.md) | Issue forms and the pull request template follow it |
| Conduct | [CODE_OF_CONDUCT.md](../CODE_OF_CONDUCT.md) | |
| Audit findings and closure evidence | [AUDIT.md](../AUDIT.md) | Public-safe |
| Security reporting and requirement summary | [SECURITY.md](../SECURITY.md) | |
| Accessibility target, checks, barrier reports | [ACCESSIBILITY.md](../ACCESSIBILITY.md) | |
| Visual system | [DESIGN.md](../DESIGN.md) | |
| Technical structure and constraints | [architecture.md](architecture.md) | Current implementation and accepted ADRs |
| Significant technical decisions | [decisions/](decisions/README.md) | One file per decision |
| Domain rules for code | [coding-guide.md](coding-guide.md) | |
| Where code lives | [codebase-map.md](codebase-map.md) | Navigation only; the code wins |
| Test scope, verification, release gates, evidence | [testing/test-plan.md](testing/test-plan.md) | |
| Setup and troubleshooting | [runbooks/](runbooks/local-setup.md) | |
| Writing rules, status vocabulary, glossary | This file | |

## Status vocabulary

Describe every feature, phase, or behavior with one of these words. Do not use "done", "ready", or "supported" on their own.

| Status | Meaning | Evidence needed |
|---|---|---|
| Planned | Described in `PRODUCT.md` or `roadmap.md`; not started | A requirement or roadmap item |
| Proposed | A design or decision under discussion | A document or ADR marked Proposed |
| In progress | Started but not usable | A branch or partial change |
| Implemented | Exists in `main` | The commit or file |
| Verified | Implemented, and the stated acceptance criteria have been independently checked on a named commit | Test results or sign-off, linked from `roadmap.md` |
| Blocked | Cannot proceed until a named dependency is resolved | The dependency and its owner |

Only Verified work counts as complete on the roadmap.

## How to write

Write for a reader who is smart, busy, and may not be a software engineer.

- **Lead with the point.** Conclusion or instruction first, then reasons in order of importance.
- **One idea per paragraph.** Headings state the point, not vague labels such as "Notes".
- **Define technical terms** the first time, or link to the glossary.
- **Be specific.** Name the role, screen, field, and number.
- **Be honest about uncertainty.** Say what is unknown and who owns the question.
- **Cut filler.** No "it's important to note", "seamless", "robust", "leverage". No em dashes as sentence separators. No closing paragraph that repeats the page.
- **Instructions are numbered steps**, each starting with a verb and saying what you should see.

## Diagrams

- Use Mermaid in fenced `mermaid` blocks, with a plain-English explanation directly below.
- Label diagrams of unbuilt behavior as proposed. Quote node labels (`A["Label"]`). Keep to one idea, about 20 nodes at most.

## Links

- Relative paths between repository files; heading anchors for sections. When you rename a heading, search for links to its old anchor.
- Descriptive link text, never "click here".
- External sources include the date reviewed when the content can change.
- `npm run check:docs` checks every relative link and anchor in tracked Markdown.

## Setup and troubleshooting docs

Setup lives in [runbooks/local-setup.md](runbooks/local-setup.md) and symptoms in [runbooks/troubleshooting.md](runbooks/troubleshooting.md). Record the actual date/environment when commands were run. If they were only checked against source or historical evidence, say so; never fill "Last verified" with the edit date. Never put real secrets or personal data in a runbook.

## Glossary

If a definition here conflicts with `PRODUCT.md`, `PRODUCT.md` wins.

| Term | Meaning in this project |
|---|---|
| ADR | Architecture decision record: one significant decision and its tradeoffs |
| Idempotency | Processing a repeated request only once, so retries cannot create duplicates |
| Project | A personal work container with its own work items and sprints |
| Work item | A story or bug with status, priority, and acceptance criteria |
| Sprint | A goal and date range with planned, active, or completed state |
| Backlog status | The first board column; independent of sprint assignment |
| Product backlog | Work without a sprint assignment, regardless of board status |
| Review and retro | Notes on results and on how to improve the process |

## Review checklist for documentation changes

- [ ] Product and roadmap impact stated in the change summary
- [ ] Status words match the [status vocabulary](#status-vocabulary)
- [ ] Each fact lives in one home; other documents link to it
- [ ] Terms match the glossary
- [ ] `npm run check:docs` passes
- [ ] Every Mermaid diagram parses and has a plain-English explanation
- [ ] No secrets, real personal data, or unsupported claims
