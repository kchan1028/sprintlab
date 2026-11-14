import type { AppData, Project, Sprint, WorkItem } from '../domain/types'

/**
 * Structural checks for stored records. They catch hand-edited or damaged data
 * before it reaches components that assume the right types. Reused by import (#15).
 */

type Obj = Record<string, unknown>

const isObj = (v: unknown): v is Obj => typeof v === 'object' && v !== null && !Array.isArray(v)
const isStr = (v: unknown): v is string => typeof v === 'string'
const oneOf = <T extends string>(v: unknown, options: readonly T[]): v is T =>
  isStr(v) && (options as readonly string[]).includes(v)

export function isProject(v: unknown): v is Project {
  return isObj(v) && isStr(v.id) && isStr(v.name) && isStr(v.description) && isStr(v.createdAt) && isStr(v.updatedAt)
}

export function isWorkItem(v: unknown): v is WorkItem {
  return (
    isObj(v) &&
    isStr(v.id) &&
    isStr(v.projectId) &&
    oneOf(v.type, ['story', 'bug']) &&
    isStr(v.title) &&
    isStr(v.description) &&
    oneOf(v.priority, ['low', 'medium', 'high', 'critical']) &&
    Array.isArray(v.acceptanceCriteria) &&
    v.acceptanceCriteria.every(isStr) &&
    oneOf(v.status, ['backlog', 'ready', 'in_progress', 'review', 'done']) &&
    (v.sprintId === null || isStr(v.sprintId)) &&
    isStr(v.createdAt) &&
    isStr(v.updatedAt)
  )
}

export function isSprint(v: unknown): v is Sprint {
  return (
    isObj(v) &&
    isStr(v.id) &&
    isStr(v.projectId) &&
    isStr(v.name) &&
    isStr(v.goal) &&
    isStr(v.startDate) &&
    isStr(v.endDate) &&
    oneOf(v.state, ['planned', 'active', 'completed']) &&
    isStr(v.review) &&
    isObj(v.retro) &&
    isStr(v.retro.wentWell) &&
    isStr(v.retro.toImprove) &&
    isStr(v.retro.actions)
  )
}

/** True when every record has the expected fields and types. */
export function hasValidRecords(data: AppData): boolean {
  return data.projects.every(isProject) && data.workItems.every(isWorkItem) && data.sprints.every(isSprint)
}

/**
 * Cross-record checks for imported files: unique ids, and every reference
 * points at something that exists in the same project. Returns a reason, or null.
 * Not applied on load, so one dangling reference can't lock someone out of their data.
 */
export function integrityProblem(data: AppData): string | null {
  for (const [label, list] of [
    ['project', data.projects],
    ['work item', data.workItems],
    ['sprint', data.sprints],
  ] as const) {
    const ids = new Set<string>()
    for (const record of list) {
      if (ids.has(record.id)) return `Two ${label}s share the id “${record.id}”.`
      ids.add(record.id)
    }
  }

  const projectIds = new Set(data.projects.map((p) => p.id))
  const sprintProject = new Map(data.sprints.map((s) => [s.id, s.projectId]))

  for (const s of data.sprints) {
    if (!projectIds.has(s.projectId)) return `Sprint “${s.name}” belongs to a project that isn't in the file.`
  }
  for (const w of data.workItems) {
    if (!projectIds.has(w.projectId)) return `Work item “${w.title}” belongs to a project that isn't in the file.`
    if (w.sprintId !== null && sprintProject.get(w.sprintId) !== w.projectId) {
      return `Work item “${w.title}” points to a sprint that isn't in its project.`
    }
  }
  for (const projectId of projectIds) {
    const active = data.sprints.filter((s) => s.projectId === projectId && s.state === 'active')
    if (active.length > 1) return 'A project has more than one active sprint.'
  }
  return null
}
