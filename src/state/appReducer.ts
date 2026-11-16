import { deleteProject } from '../domain/deletion'
import type { AppData, Project, Sprint, WorkItem } from '../domain/types'

export type AppAction =
  | { type: 'project/created'; project: Project }
  | { type: 'project/updated'; project: Project }
  | { type: 'workItem/created'; workItem: WorkItem }
  | { type: 'workItem/updated'; workItem: WorkItem }
  /** Adds several work items in one save, e.g. accepted AI drafts. */
  | { type: 'workItems/added'; workItems: WorkItem[] }
  | { type: 'sprint/created'; sprint: Sprint }
  | { type: 'sprint/updated'; sprint: Sprint }
  /** Removes a project with its work items and sprints. */
  | { type: 'project/deleted'; projectId: string }
  /** Adds a whole project's records at once, e.g. the demo project. */
  | { type: 'records/added'; project: Project; sprints: Sprint[]; workItems: WorkItem[] }
  /** Replaces all data, e.g. after an import. */
  | { type: 'data/replaced'; data: AppData }
  /** Completes a sprint and moves its unfinished items in one save. */
  | { type: 'sprint/completed'; sprint: Sprint; movedItems: WorkItem[] }

function replaceById<T extends { id: string }>(list: T[], next: T): T[] {
  return list.map((item) => (item.id === next.id ? next : item))
}

export function appReducer(state: AppData, action: AppAction): AppData {
  switch (action.type) {
    case 'project/created':
      return { ...state, projects: [...state.projects, action.project] }
    case 'project/updated':
      return { ...state, projects: replaceById(state.projects, action.project) }
    case 'project/deleted':
      return deleteProject(state, action.projectId)
    case 'records/added':
      return {
        ...state,
        projects: [...state.projects, action.project],
        sprints: [...state.sprints, ...action.sprints],
        workItems: [...state.workItems, ...action.workItems],
      }
    case 'data/replaced':
      return action.data
    case 'workItem/created':
      return { ...state, workItems: [...state.workItems, action.workItem] }
    case 'workItem/updated':
      return { ...state, workItems: replaceById(state.workItems, action.workItem) }
    case 'workItems/added':
      return { ...state, workItems: [...state.workItems, ...action.workItems] }
    case 'sprint/created':
      return { ...state, sprints: [...state.sprints, action.sprint] }
    case 'sprint/updated':
      return { ...state, sprints: replaceById(state.sprints, action.sprint) }
    case 'sprint/completed': {
      const moved = new Map(action.movedItems.map((w) => [w.id, w]))
      return {
        ...state,
        sprints: replaceById(state.sprints, action.sprint),
        workItems: state.workItems.map((w) => moved.get(w.id) ?? w),
      }
    }
  }
}
