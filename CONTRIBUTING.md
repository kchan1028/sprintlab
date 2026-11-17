# Contributing

SprintLab is a solo project, so this guide mostly documents how its own author works. Outside suggestions are welcome as issues.

## Workflow

1. **Issue first.** Every change starts as an issue with acceptance criteria. Use the feature or bug template.
2. **Branch.** `<type>/<issue#>-<slug>`, for example `feat/6-projects` or `fix/23-empty-title`.
3. **Commit.** Small commits using [Conventional Commits](https://www.conventionalcommits.org/): `feat:`, `fix:`, `docs:`, `chore:`, `test:`, `refactor:`.
4. **Pull request.** Fill in the template, link the issue with `Closes #N`, and include verification evidence (check output, screenshots, preview link).
5. **Review.** Self-review the diff against the Definition of Done. AI review, when used, is labelled as such.
6. **Merge.** Squash-merge once checks pass.

## Definition of Done

An issue is done when:

- Its acceptance criteria are met.
- Relevant checks pass.
- Loading, empty and error states are handled where applicable.
- The feature can be verified using documented steps.
- Changes have been reviewed.
- Relevant documentation is updated.
- No known blocking defect remains.

## Local setup

Requires Node 22.12 or newer. The repo pins Node 24 in `.nvmrc`.

```bash
nvm use
npm install
npm run dev
```

Before opening a PR, run `npm run lint`, `npm run typecheck` and `npm test`. CI runs the same checks, a production build, and the Playwright smoke test (`npm run test:e2e`). See [test plan](docs/testing/test-plan.md).

## The one rule that applies to every change

Review [PRODUCT.md](PRODUCT.md), [roadmap.md](roadmap.md), [feature.md](feature.md), [SECURITY.md](SECURITY.md), [AUDIT.md](AUDIT.md), and the [test plan](docs/testing/test-plan.md) for impact. Update their owning sections when facts change; otherwise state why no update is needed. Requirements have one home in PRODUCT.md, and priorities/status have one home in roadmap.md. Keep summaries and every affected tracked Markdown mention consistent.

Use the [documentation guide](docs/documentation-guide.md), [coding guide](docs/coding-guide.md), and [code of conduct](CODE_OF_CONDUCT.md). Record unanswered scope, implementation, or delivery questions with date, owner, impact, provisional assumption, what can proceed, and revisit trigger in the product open decisions or roadmap risks. Silence is not approval; continue independent work.

Run `npm run check:docs` for every PR. Documentation-only work needs link/checker validation; existing CI still runs its checks. Local agent instruction files remain untracked; shared rules belong in these guides. Never merge without the owner's explicit approval. Repository settings and additional labels/milestones remain owner decisions.

## Change summary

Use this format in the PR description:

```text
What changed:
Why:
Product impact (PRODUCT.md): <updated sections or None with reason>
Roadmap impact (roadmap.md): <updated rows or None with reason>
Feature impact (feature.md): <updated rows or None with reason>
Security impact (SECURITY.md): <updated sections or None with reason>
Audit impact (AUDIT.md): <updated gaps or None with reason>
Docs updated:
Test plan: <Test plan updated: what and why, or No test plan update needed: why>
Status: <In progress, Implemented, or Verified; scope and evidence>
Open questions:
```

New commit messages and PR titles/descriptions use author, reviewer, and verifier role names, without naming tools. This does not erase the existing honest collaboration log, factual feature names, or labelled review history.

## Review expectations

The author runs appropriate checks and records exact results. Independent verification is by someone other than the author; if unavailable, record Pending. Do not describe self-review as independent review. Changes involving local data loss, import integrity, sprint integrity, or secrets need failure-case coverage. The owner approves merges after reviewing criteria, evidence, and gaps.

Record author, verifier or Pending, tested commit, checks/results, and remaining gaps. Follow [the test plan](docs/testing/test-plan.md#3-independent-verification). Preserve the existing issue/branch/PR and release approval workflow.

## Architecture decisions

New expensive-to-reverse choices need an ADR. Preserve existing accepted records and use the [decision index and template](docs/decisions/README.md).

## Reporting a problem

Use the existing feature/bug forms or the documentation form for public-safe reports. Security weaknesses follow [the private reporting policy](SECURITY.md#how-to-report); never include real data or secrets in an issue.
