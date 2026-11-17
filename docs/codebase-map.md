# Codebase map

Paths inspected 2026-11-17 against the current source. This is navigation; read current code before editing. [Architecture](architecture.md) owns structure and the data model.

## How the pieces fit

`src/main.tsx` mounts the router and `src/App.tsx` routes screens. Feature components dispatch actions through the state provider. Pure domain functions validate transitions; the repository reads and saves browser data. The optional Pages Function delegates to a tested server handler.

## By task area

| Area | Start here | Shared rules | Tests |
|---|---|---|---|
| Routing and shell | `src/main.tsx`, `src/App.tsx` | Base path from Vite configuration | `src/App.test.tsx`, `e2e/main-flow.e2e.ts` |
| Projects | `src/features/projects/` | `src/domain/project.ts`, `deletion.ts` | Domain and project component tests |
| Work and board | `src/features/workItems/` | `src/domain/workItem.ts`, `planning.ts` | `Board.test.tsx`, `WorkItems.test.tsx`, domain tests |
| Sprints | `src/features/sprints/` | `src/domain/sprint.ts`, `completion.ts`, `dates.ts` | Planning, completion, sprint, and date tests |
| Storage and state | `src/repository/`, `src/state/` | `src/domain/types.ts` | Storage, validation, and reducer tests |
| Backup/import and demo | `src/features/data/` | `src/domain/demo.ts` | `DataSafety.test.tsx`, import and demo tests |
| Drafter | `src/features/drafts/`, `functions/api/draft-stories.ts`, `server/draftStories.ts` | `src/domain/drafts.ts` | Client, UI, domain, and server tests |
| Appearance | `src/components/AppearanceSelect.tsx`, `src/repository/appearance.ts` | Separate preference key; `src/main.tsx` applies it before mount | Appearance component tests and `e2e/workspace.e2e.ts` |
| Accessibility and errors | `src/components/`, `src/test/axe.ts` | Shared focus and title helpers in `src/lib/` | Accessibility and error-state tests |
| Progress presentation | `src/components/WorkProgress.tsx` | Caller supplies correctly scoped project or active-sprint items; native progress plus textual counts | `src/features/Progress.test.tsx`, `e2e/workspace.e2e.ts` |
| Styling | `src/index.css` | [Design baseline](../DESIGN.md) | Existing browser screenshots; no visual regression claim |
| Documentation CI | `scripts/check-doc-links.mjs` | [Documentation guide](documentation-guide.md) | `npm run check:docs` |

## Constraints that are easy to miss

Only the repository accesses localStorage. Work-item backlog status and having no assigned sprint are different concepts. Completion and multi-item addition save once. The drafter is optional and never saves before review. Pages uses a `/sprintlab/` base and a 404 fallback. Local-only runtime verification is the owner's policy. Do not stop a dev server unless this session started it.

## Tests and commands

See the [test plan](testing/test-plan.md#commands) and [local setup](runbooks/local-setup.md).
