# Architecture decision records

An architecture decision record (ADR) records one significant decision, the options considered, and its consequences. One file per decision.

## When to write an ADR

Before a choice that is expensive to reverse or affects several parts of the system: the stack, data store, hosting, authentication, a provider, or an integration pattern.

## Process

1. Preserve the existing `docs/adr/` location. Copy the template below there with the next number (0003 onward); list the record in this index.
2. Open it as **Proposed** in a pull request and discuss it.
3. Mark it **Accepted** or **Rejected** with the date and the deciding role.
4. Preserve accepted decision text and its original date. Never silently rewrite an accepted decision. Write a new ADR that supersedes it, and mark the old one **Superseded by NNNN**.

## Template

```markdown
# NNNN. <Decision title>

Status: Proposed | Accepted | Rejected | Superseded by NNNN (<date>, <deciding role>)

## Context
<the problem, constraints, and requirements it serves, linked to PRODUCT.md>

## Options considered
### Option A
<description, benefits, costs, risks>
### Option B
...

## Decision
<the choice and the main reasons>

## Consequences
<what becomes easier, harder, and what must now be done>
```

## Index

| ADR | Title | Status |
|---|---|---|
| [0001](../adr/0001-stack.md) | React, TypeScript, Vite and browser storage | Accepted, 2026-11-14 |
| [0002](../adr/0002-ai-drafter.md) | Optional AI story drafter | Accepted, see record |

## Decision backlog

Decisions that need an ADR before the work that depends on them:

- No new technical choice is approved by this scaffold. Accounts, sync, or public drafter enablement require owner decisions before implementation.
