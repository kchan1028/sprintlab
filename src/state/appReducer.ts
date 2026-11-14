import type { AppData, Project } from '../domain/types'

export type AppAction =
  | { type: 'project/created'; project: Project }
  | { type: 'project/updated'; project: Project }

export function appReducer(state: AppData, action: AppAction): AppData {
  switch (action.type) {
    case 'project/created':
      return { ...state, projects: [...state.projects, action.project] }
    case 'project/updated':
      return {
        ...state,
        projects: state.projects.map((p) => (p.id === action.project.id ? action.project : p)),
      }
  }
}
