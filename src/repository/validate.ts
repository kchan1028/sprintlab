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
