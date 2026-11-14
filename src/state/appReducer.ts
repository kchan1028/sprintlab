import type { AppData, Project, WorkItem } from '../domain/types'

export type AppAction =
  | { type: 'project/created'; project: Project }
  | { type: 'project/updated'; project: Project }
  | { type: 'workItem/created'; workItem: WorkItem }
  | { type: 'workItem/updated'; workItem: WorkItem }

function replaceById<T extends { id: string }>(list: T[], next: T): T[] {
  return list.map((item) => (item.id === next.id ? next : item))
}

export function appReducer(state: AppData, action: AppAction): AppData {
  switch (action.type) {
    case 'project/created':
      return { ...state, projects: [...state.projects, action.project] }
    case 'project/updated':
      return { ...state, projects: replaceById(state.projects, action.project) }
    case 'workItem/created':
      return { ...state, workItems: [...state.workItems, action.workItem] }
    case 'workItem/updated':
      return { ...state, workItems: replaceById(state.workItems, action.workItem) }
  }
}
