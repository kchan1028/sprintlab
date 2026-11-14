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

Before opening a PR, run `npm run lint`, `npm run typecheck` and `npm test`. CI runs the same checks, a production build, and the Playwright smoke test (`npm run test:e2e`). See [docs/testing-strategy.md](docs/testing-strategy.md).
