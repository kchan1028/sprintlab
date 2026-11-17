# Test plan

Proposed working policy for this documentation PR (2026-11-17); existing automated layers and historical gaps are retained below. Requirements live in [PRODUCT.md](../../PRODUCT.md), delivery status in [roadmap.md](../../roadmap.md).

## Commands

| Purpose | Command |
|---|---|
| Dependencies | `npm ci` |
| Development | `npm run dev` |
| Lint | `npm run lint` |
| Typecheck | `npm run typecheck` |
| One domain file | `npx vitest run src/domain/completion.test.ts` |
| Unit/component suite | `npm test` |
| One browser flow | `npx playwright test e2e/main-flow.e2e.ts` |
| Browser suite | `npm run test:e2e` |
| Production build | `npm run build` |
| Link checker regression fixtures | `npm run test:docs` |
| Markdown links and anchors | `npm run check:docs` |

## 1. Pull request testing

Preserve the existing requirement to run lint, typecheck, and tests before a PR. Code changes add checks for their changed behavior and failure cases; risky shared changes include affected callers. Documentation-only changes run the link checker and its relevant failure probes. CI continues to run existing application checks, build, and e2e; no checks are removed by this scaffold. State exact scope, results, and anything not run.

## 2. Risk-based coverage

| Area | Failure | Coverage |
|---|---|---|
| Storage/import | Overwrite, corruption, lost data | Repository validation/storage tests, data-safety and import-file tests |
| Sprint transitions | Multiple active sprints, invalid assignment, partial carry-over | Domain sprint/planning/completion tests and component flows |
| Routing and persistence | Reload loses state or deep link breaks | Main-flow e2e, App tests, local subpath check when routing/build changes |
| Drafter | Untrusted output, premature save, key leakage | Domain parser, client/UI, and server tests; no real API calls in CI |
| Accessibility | Unnamed controls or lost focus | Axe component tests, keyboard/browser checks; limits below |
| Documentation | Broken target or anchor | Link checker across tracked Markdown, positive and negative fixtures when checker changes |

## 3. Independent verification

Author checks are not independent verification. A separate verifier reviews requirements, edge cases, and the tested commit without editing the change. If unavailable, record **Pending**. Existing honestly labelled review history must remain intact. The owner explicitly approves merges. Fix findings in the PR; deferred defects get an issue, while exploitable security details remain private.

Record: Author; Verifier or Pending with reason; Tested commit; commands and results; scenarios; remaining gaps. Do not claim a reviewer or test that did not happen.

## 4. Predeployment testing

Follow the existing [release checklist](../release-checklist.md): full automated checks, local browser main flow with fake data, data export/recovery checks when affected, and explicit owner approval for releases. The owner's local-only runtime verification policy remains in effect. Record unperformed production or provider checks as gaps. A real billable model call needs owner authorization; no key is enabled in production by this scaffold.

## 5. Manual checks

| Check | When | Method |
|---|---|---|
| Keyboard, focus, contrast | Changed screens or interactions | Local real-browser flow with fake data |
| Phone layout and enlarged text | Layout/form changes | Local desktop and phone-width checks; real device before claiming device coverage |
| Screen reader | Before claiming screen-reader coverage | [Screen-reader script](../screen-reader-check.md) |
| Import/backup restore | Persistence or schema changes | Fake backup, preview, confirm, verify resulting records and failure recovery |

## 6. Release blockers

Failing required checks, unresolved acceptance criteria, data-loss defects, or missing owner merge/release approval block release. Independent verification is Pending until performed. Owner-accepted gaps remain explicit in release notes; this scaffold does not retroactively mark releases failed or Verified.

## 7. Evidence template

| Requirement | Scenario | Expected | Actual | Environment | Commit | Verifier | Evidence | Status |
|---|---|---|---|---|---|---|---|---|

Use Pass, Fail, Blocked, or Not Run. Only actual Pass evidence supports a verification claim.

## 8. Keeping this plan current

Review this plan on every change. Update when workflows, failure handling, commands, CI, fixtures, coverage, or responsibilities change. Every PR includes **Test plan updated:** what and why, or **No test plan update needed:** why. Results belong in the PR or linked report.

# Existing test layers and conventions

SprintLab is a single-user app with no backend, so most risk sits in **domain rules** (what's allowed), **data safety** (nothing is lost or corrupted), and **usability** (keyboard, screen readers, clear errors). The tests follow that.

## Layers

| Layer | Tool | What it covers | Where | Runs |
|---|---|---|---|---|
| Domain unit tests | Vitest | Pure rules: validation, status and sprint rules, assignment, completion, date handling, filters | `src/domain/*.test.ts` | `npm test`, CI `check` |
| Storage and state | Vitest | Load/save/reset, schema version, per-record validation, import integrity checks, reducer actions | `src/repository/*.test.ts`, `src/state/*.test.ts` | `npm test`, CI `check` |
| Component and flow tests | Vitest + Testing Library + jsdom | User-visible behaviour through the whole app (`renderApp(path)`): forms, errors, focus, persistence across a remount | `src/**/*.test.tsx` | `npm test`, CI `check` |
| AI drafter function | Vitest (Node environment) | Request checks, status codes, refusal and malformed-output handling, friendly errors. The model call is injected, so tests and CI **never call the real API** | `server/*.test.ts` | `npm test`, CI `check` |
| Accessibility (automated) | axe-core in jsdom | Names, roles, labels and structure on every main screen and form. **Not** color contrast (jsdom has no layout). | `src/features/Accessibility.test.tsx` | `npm test`, CI `check` |
| End-to-end smoke test | Playwright (Chromium) | The main flow in a real browser against the **production build**: create project, add item, move to Done, reload | `e2e/*.e2e.ts` | `npm run test:e2e`, CI `e2e` |
| Manual browser checks | Built-in browser, axe-core with contrast | Each PR's "How to verify" steps against the local dev server; axe including contrast; phone width; console | Recorded in each PR | Before merging (local only, per owner decision) |

Rough proportion: many domain tests, a solid layer of component/flow tests, and one end-to-end test. Rules are cheapest to test as pure functions; the e2e test proves the pieces are wired together in a real browser.

## Conventions

- **Test behaviour, not implementation.** Query by role and accessible name (`getByRole('button', { name: 'New sprint' })`). This also checks accessibility.
- **Domain functions take `id` and `now` as arguments**, so tests are deterministic without mocking globals.
- **Seed with domain functions** (`createProject`, `createWorkItem`, …) and `saveData`, not hand-written JSON, so seeds stay valid as the schema grows.
- **Each feature PR includes a mutation check:** temporarily break the rule under test, confirm the intended tests fail, restore. The PR records how many failed. A check that fails nothing is reported, not hidden (see #12).
- **Prove new checks can fail.** The axe helper has a sanity test with a deliberately unlabelled input; the e2e test was run against a deliberately broken status change before merging (#14).
- `*.test.ts(x)` is for Vitest; `*.e2e.ts` is for Playwright. The suffixes keep the two runners apart.

## What is not tested (known gaps)

- **Screen readers:** no VoiceOver/NVDA pass yet. Skipped for v1.0.0 and still unperformed in v1.1.0; see [release checklist](../release-checklist.md).
- **Browsers other than Chromium:** the e2e test runs in Chromium only. Firefox/Safari behaviour (for example native `<select>` and `<input type=date>`) is unverified.
- **Production deploy:** not checked, by owner decision. Verification is local.
- **Keyboard operation of native menus** can't be driven by synthetic keys in the embedded browser; the owner checked the board's status menu manually (#8).
- **Draft quality from the real model:** not tested automatically (it costs money and varies). Requires an owner-authorized check with `npm run dev:ai` and a real key; successful drafting remains unverified. The e2e test runs without a key, which proves the core app is unaffected.
- **Performance and very large data sets:** not tested. A solo user's data is small.

## Running tests

```bash
nvm use
npm test              # Vitest: unit, component, axe (jsdom)
npm run test:watch    # Vitest in watch mode
npx playwright install chromium   # once, to download the browser
npm run test:e2e      # Playwright: builds, serves on port 4317, runs the smoke test
```

The e2e run refuses to start if port 4317 is already in use, so it never tests a different app by accident.

## When to add which test

- **A new rule** (what's allowed or how data changes): a domain unit test first.
- **A new screen, form or error state:** a component test through `renderApp`, plus an axe check if it's a new screen or form.
- **A change to the main flow's wiring** (routing, build, storage key): make sure the e2e smoke test still covers it; add an e2e test only for flows that can't be checked in jsdom.
- **A bug:** a failing test that reproduces it, then the fix.
