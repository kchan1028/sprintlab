import { addDays, isValidDateString } from './dates'
import type { Sprint, SprintState } from './types'

export const SPRINT_NAME_MAX = 80

export const SPRINT_STATE_LABELS: Record<SprintState, string> = {
  planned: 'Planned',
  active: 'Active',
  completed: 'Completed',
}

export interface SprintInput {
  name: string
  goal: string
  startDate: string
  endDate: string
}

export type SprintErrors = Partial<Record<keyof SprintInput, string>>

export function validateSprint(input: SprintInput): SprintErrors {
  const errors: SprintErrors = {}
  const name = input.name.trim()
  if (name.length === 0) errors.name = 'Name is required.'
  else if (name.length > SPRINT_NAME_MAX) errors.name = `Name must be ${SPRINT_NAME_MAX} characters or fewer.`

  if (input.goal.trim().length === 0) errors.goal = 'Goal is required. One sentence on what this sprint should achieve.'

  const startOk = isValidDateString(input.startDate)
  const endOk = isValidDateString(input.endDate)
  if (!startOk) errors.startDate = 'Start date is required.'
  if (!endOk) errors.endDate = 'End date is required.'
  // ISO dates compare correctly as strings.
  if (startOk && endOk && input.endDate < input.startDate) {
    errors.endDate = 'End date cannot be before the start date.'
  }
  return errors
}

export function createSprint(input: SprintInput, projectId: string, id: string): Sprint {
  return {
    id,
    projectId,
    name: input.name.trim(),
    goal: input.goal.trim(),
    startDate: input.startDate,
    endDate: input.endDate,
    state: 'planned',
    review: '',
    retro: { wentWell: '', toImprove: '', actions: '' },
  }
}

export type StartCheck = { ok: true } | { ok: false; reason: string }

/** A project can have at most one active sprint, and only planned sprints can start. */
export function canStartSprint(sprint: Sprint, allSprints: Sprint[]): StartCheck {
  if (sprint.state !== 'planned') return { ok: false, reason: `“${sprint.name}” is not a planned sprint.` }
  const active = allSprints.find(
    (s) => s.projectId === sprint.projectId && s.state === 'active' && s.id !== sprint.id,
  )
  if (active) {
    return {
      ok: false,
      reason: `“${active.name}” is already active. Complete it before starting “${sprint.name}”.`,
    }
  }
  return { ok: true }
}

export function startSprint(sprint: Sprint): Sprint {
  return { ...sprint, state: 'active' }
}

/** Active first, then planned by start date, then completed (most recent first). */
export function sortSprints(sprints: Sprint[]): Sprint[] {
  const rank: Record<SprintState, number> = { active: 0, planned: 1, completed: 2 }
  return [...sprints].sort((a, b) => {
    if (a.state !== b.state) return rank[a.state] - rank[b.state]
    return a.state === 'completed' ? b.startDate.localeCompare(a.startDate) : a.startDate.localeCompare(b.startDate)
  })
}

/**
 * Default dates for a new sprint: a one-week range starting today, or the day
 * after the latest existing sprint ends if that is later, so sprints don't overlap.
 */
export function defaultSprintDates(existing: Sprint[], today: string): { startDate: string; endDate: string } {
  const latestEnd = existing.reduce<string | null>((max, s) => (max === null || s.endDate > max ? s.endDate : max), null)
  const dayAfter = latestEnd ? addDays(latestEnd, 1) : today
  const startDate = dayAfter > today ? dayAfter : today
  return { startDate, endDate: addDays(startDate, 6) }
}
