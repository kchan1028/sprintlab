import type { Priority, Status, Timestamp, WorkItem, WorkItemType } from './types'

export const WORK_ITEM_TITLE_MAX = 120

export const PRIORITIES: readonly Priority[] = ['low', 'medium', 'high', 'critical']

export const PRIORITY_LABELS: Record<Priority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
}

export const TYPE_LABELS: Record<WorkItemType, string> = {
  story: 'Story',
  bug: 'Bug',
}

export interface WorkItemInput {
  type: WorkItemType
  title: string
  description: string
  priority: Priority
  acceptanceCriteria: string[]
}

export interface WorkItemErrors {
  title?: string
}

export function emptyWorkItemInput(): WorkItemInput {
  return { type: 'story', title: '', description: '', priority: 'medium', acceptanceCriteria: [''] }
}

export function validateWorkItem(input: WorkItemInput): WorkItemErrors {
  const title = input.title.trim()
  if (title.length === 0) return { title: 'Title is required.' }
  if (title.length > WORK_ITEM_TITLE_MAX) {
    return { title: `Title must be ${WORK_ITEM_TITLE_MAX} characters or fewer.` }
  }
  return {}
}

/** Trims criteria and drops blank ones, so empty rows in the form are not saved. */
export function cleanCriteria(criteria: string[]): string[] {
  return criteria.map((c) => c.trim()).filter((c) => c.length > 0)
}

export function createWorkItem(
  input: WorkItemInput,
  projectId: string,
  id: string,
  now: Timestamp,
): WorkItem {
  return {
    id,
    projectId,
    type: input.type,
    title: input.title.trim(),
    description: input.description.trim(),
    priority: input.priority,
    acceptanceCriteria: cleanCriteria(input.acceptanceCriteria),
    status: 'backlog',
    sprintId: null,
    createdAt: now,
    updatedAt: now,
  }
}

/** Updates editable fields only; status, sprint and ownership are unchanged. */
export function updateWorkItem(item: WorkItem, input: WorkItemInput, now: Timestamp): WorkItem {
  return {
    ...item,
    type: input.type,
    title: input.title.trim(),
    description: input.description.trim(),
    priority: input.priority,
    acceptanceCriteria: cleanCriteria(input.acceptanceCriteria),
    updatedAt: now,
  }
}

export function toWorkItemInput(item: WorkItem): WorkItemInput {
  return {
    type: item.type,
    title: item.title,
    description: item.description,
    priority: item.priority,
    acceptanceCriteria: item.acceptanceCriteria.length > 0 ? [...item.acceptanceCriteria] : [''],
  }
}

export const STATUS_LABELS: Record<Status, string> = {
  backlog: 'Backlog',
  ready: 'Ready',
  in_progress: 'In Progress',
  review: 'Review',
  done: 'Done',
}
