import type { Project, Timestamp } from './types'

export const PROJECT_NAME_MAX = 80

export interface ProjectInput {
  name: string
  description: string
}

export interface ProjectErrors {
  name?: string
}

/** Returns field errors; an empty object means the input is valid. */
export function validateProject(input: ProjectInput): ProjectErrors {
  const name = input.name.trim()
  if (name.length === 0) return { name: 'Name is required.' }
  if (name.length > PROJECT_NAME_MAX) {
    return { name: `Name must be ${PROJECT_NAME_MAX} characters or fewer.` }
  }
  return {}
}

export function hasErrors(errors: ProjectErrors): boolean {
  return Object.keys(errors).length > 0
}

/** Builds a new project. Callers validate first; id and time are passed in so tests are deterministic. */
export function createProject(input: ProjectInput, id: string, now: Timestamp): Project {
  return {
    id,
    name: input.name.trim(),
    description: input.description.trim(),
    createdAt: now,
    updatedAt: now,
  }
}

export function updateProject(project: Project, input: ProjectInput, now: Timestamp): Project {
  return {
    ...project,
    name: input.name.trim(),
    description: input.description.trim(),
    updatedAt: now,
  }
}
