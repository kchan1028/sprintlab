export type Status = 'backlog' | 'ready' | 'in_progress' | 'review' | 'done'
export type Priority = 'low' | 'medium' | 'high' | 'critical'
export type WorkItemType = 'story' | 'bug'
export type SprintState = 'planned' | 'active' | 'completed'

/** ISO 8601 timestamp, e.g. 2026-11-14T10:00:00.000Z */
export type Timestamp = string
/** Calendar date, YYYY-MM-DD */
export type DateString = string

export interface Project {
  id: string
  name: string
  description: string
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface WorkItem {
  id: string
  projectId: string
  type: WorkItemType
  title: string
  description: string
  priority: Priority
  acceptanceCriteria: string[]
  status: Status
  /** null means the item is in the backlog, not in a sprint */
  sprintId: string | null
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface Retro {
  wentWell: string
  toImprove: string
  actions: string
}

export interface Sprint {
  id: string
  projectId: string
  name: string
  goal: string
  startDate: DateString
  endDate: DateString
  state: SprintState
  review: string
  retro: Retro
}

export interface AppData {
  schemaVersion: number
  projects: Project[]
  workItems: WorkItem[]
  sprints: Sprint[]
}
