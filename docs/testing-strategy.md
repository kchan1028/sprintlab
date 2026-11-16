# Testing strategy

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

- **Screen readers:** no VoiceOver/NVDA pass yet. Recommended before v1.0.0 (#16).
- **Browsers other than Chromium:** the e2e test runs in Chromium only. Firefox/Safari behaviour (for example native `<select>` and `<input type=date>`) is unverified.
- **Production deploy:** not checked, by owner decision. Verification is local.
- **Keyboard operation of native menus** can't be driven by synthetic keys in the embedded browser; the owner checked the board's status menu manually (#8).
- **Draft quality from the real model:** not tested automatically (it costs money and varies). Checked by hand with `npm run dev:ai` and a real key. The e2e test runs without a key, which proves the core app is unaffected.
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
