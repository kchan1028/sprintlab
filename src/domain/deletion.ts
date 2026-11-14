import type { AppData } from './types'

export interface ProjectFootprint {
  workItems: number
  sprints: number
}

/** How much will be deleted with a project, for the confirmation message. */
export function projectFootprint(data: AppData, projectId: string): ProjectFootprint {
  return {
    workItems: data.workItems.filter((w) => w.projectId === projectId).length,
    sprints: data.sprints.filter((s) => s.projectId === projectId).length,
  }
}

/** Removes a project with all of its work items and sprints. */
export function deleteProject(data: AppData, projectId: string): AppData {
  return {
    ...data,
    projects: data.projects.filter((p) => p.id !== projectId),
    workItems: data.workItems.filter((w) => w.projectId !== projectId),
    sprints: data.sprints.filter((s) => s.projectId !== projectId),
  }
}
