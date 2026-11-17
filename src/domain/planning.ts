import { sortSprints } from './sprint'
import type { Sprint, Timestamp, WorkItem } from './types'

/** Board filter: every item, items in no sprint, or one sprint's items. */
export type SprintFilter = { kind: 'all' } | { kind: 'none' } | { kind: 'sprint'; sprintId: string }

/** Sprints that can receive work: planned or active, in the same project. */
export function assignableSprints(sprints: Sprint[], projectId: string): Sprint[] {
  return sortSprints(sprints.filter((s) => s.projectId === projectId && s.state !== 'completed'))
}

export type AssignResult = { ok: true; item: WorkItem } | { ok: false; reason: string }

/**
 * Puts an item into a sprint, or back in the product backlog with `null`.
 * Returns the same object when nothing changes, so callers can skip the save.
 */
export function assignWorkItem(item: WorkItem, sprint: Sprint | null, now: Timestamp): AssignResult {
  const sprintId = sprint?.id ?? null
  if (item.sprintId === sprintId) return { ok: true, item }
  if (sprint && sprint.projectId !== item.projectId) {
    return { ok: false, reason: 'That sprint belongs to another project.' }
  }
  if (sprint && sprint.state === 'completed') {
    return { ok: false, reason: `“${sprint.name}” is completed, so work can’t be added to it.` }
  }
  return { ok: true, item: { ...item, sprintId, updatedAt: now } }
}

export function matchesFilter(item: WorkItem, filter: SprintFilter): boolean {
  if (filter.kind === 'all') return true
  if (filter.kind === 'none') return item.sprintId === null
  return item.sprintId === filter.sprintId
}

/** Reads the `?sprint=` URL value; unknown sprint ids fall back to showing everything. */
export function parseSprintFilter(value: string | null, sprints: Sprint[]): SprintFilter {
  if (value === 'none') return { kind: 'none' }
  if (value && sprints.some((s) => s.id === value)) return { kind: 'sprint', sprintId: value }
  return { kind: 'all' }
}

export function filterToParam(filter: SprintFilter): string {
  if (filter.kind === 'all') return 'all'
  if (filter.kind === 'none') return 'none'
  return filter.sprintId
}
