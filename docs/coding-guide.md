# Coding guide

Domain and code rules for SprintLab. Where code lives is in the [codebase map](codebase-map.md); system design is in [architecture.md](architecture.md).

## Repository structure and commands

`src/` contains the browser app, domain, state, and storage; `server/` holds the optional handler; `functions/` exposes its Pages route; `e2e/` holds browser checks. See the [codebase map](codebase-map.md). Commands live in the [test plan](testing/test-plan.md#commands) and [local setup](runbooks/local-setup.md).

## Document maintenance rule (mandatory)

See [CONTRIBUTING.md](../CONTRIBUTING.md#the-one-rule-that-applies-to-every-change).

## General principles

- Browser-local data is the core product state. Validate persistence and imports at the repository boundary. The optional server handler validates requests independently and treats model output as untrusted.
- Rules every caller needs live in `src/domain/`, and every caller uses them.
- Fail loudly: no swallowed errors, no silent fallbacks that hide a wrong result.

## Keep the code simple

**One rule, one place**

- Before writing a rule, calculation, query, formatter, or validation, search for one that exists (`src/domain/` first). Use it; if it almost fits, extend it.
- A condition or query used in more than one place is defined once and reused.
- Types shared across a boundary are imported, not retyped.
- Numbers and labels with one meaning are constants, never retyped as text.

**No complexity without a second caller**

- Do not add a helper, option, parameter, or default until two real callers need it.
- No fallback, optional field, or branch for a case that cannot happen.
- No configuration, feature flag, or new dependency for something one line does.
- Prefer deleting code to adding it.

**Leave nothing stale**

- When a change makes code unused, delete it in the same change, including tests of removed behavior.
- When a change makes a comment, name, message, or document untrue, fix it in the same change.
- Do not write "for now" or "until X exists" without checking it is still true.

A duplicate, dead code, or stale assumption found outside your task goes under "Open questions" in the change summary; do not fix it silently.

## Naming conventions

Use PascalCase for components and types, camelCase for functions and variables, `*.test.ts(x)` for Vitest, and `*.e2e.ts` for Playwright. Follow existing TypeScript conventions; do not reformat unrelated files.

## Domain rules

The [product core flows](../PRODUCT.md#core-flows-and-acceptance-criteria) own behavior and the [architecture data model](architecture.md#data-model) owns exact relationships. Keep validation and transitions pure in `src/domain/`; only `src/repository/` touches localStorage. Components dispatch actions instead of duplicating domain logic. Preserve atomic completion and backup/recovery behavior.

## Roles, privacy, secrets, and audit history

- **Secrets** come from the environment, never from the repository. `.env` files are never committed.
- **Privacy:** collect only what a requirement needs; fixtures use clearly fake data.
- There are no app accounts or roles. Do not invent authorization semantics. The repository history and collaboration log record development decisions, not an in-app audit trail.
- Never enable the unauthenticated production drafter or use a real billable API key without owner approval. Preserve the existing honestly labelled review and collaboration history.

## Accessibility and mobile usability

- Preserve confirmed accessibility constraints; a formal conformance target is undecided ([ACCESSIBILITY.md](../ACCESSIBILITY.md)).
- Every action works with a keyboard alone; focus is visible.
- Every form field has a visible label; errors say what is wrong and how to fix it.
- Check layouts at phone width and enlarged text. Prefer generous touch targets; do not claim a measured target or conformance audit without evidence.
- Color is never the only signal.

## Testing and review

### What must be tested

New or changed behavior gets a test, including the failure case for local data loss, corrupt imports, sprint integrity, or secret disclosure. When to run what: [test plan](testing/test-plan.md).

### Review

- Every change is reviewed by someone other than the author when possible ([CONTRIBUTING.md](../CONTRIBUTING.md#review-expectations)).
- Changes touching local data loss, corrupt imports, sprint integrity, or secret disclosure need a reviewer who knows that area.

### Labels and milestones on issues

Use the existing `type: feature` and `type: bug` issue forms. Documentation and usability reports should state the affected area in text. Additional area/severity labels and milestones are owner decisions; do not create or claim them as configured. Acceptance criteria belong in the issue; current delivery status belongs in [roadmap.md](../roadmap.md). Historical project-board and milestone evidence remains intact.

### Branches after a pull request

- Never push follow-up work to a merged or closed PR branch; start a fresh branch from `origin/main`.
- Automatic merged-branch deletion is an unverified repository setting. The [closed-branch workflow](../.github/workflows/delete-closed-branch.yml) is disabled unless the owner sets `DELETE_CLOSED_BRANCHES=true`; it leaves forks, default/base/protected branches, changed heads, and branches used by another open PR alone.
- Preserve worktrees with uncommitted work. Cleanup only branches and worktrees owned by the current task after approval or a completed merge.

## Architecture decision records

Write an ADR before a choice that is expensive to reverse: the stack, data store, hosting, authentication, a provider, or an integration pattern ([process](decisions/README.md)).
