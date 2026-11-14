import type { Retro, Sprint, Timestamp, WorkItem } from './types'

/** Where unfinished items go when a sprint is completed. */
export type CarryOver = { kind: 'backlog' } | { kind: 'sprint'; sprintId: string }

export interface SprintNotes {
  review: string
  retro: Retro
}

/** Items in the sprint whose status is not Done. */
export function unfinishedItems(sprint: Sprint, items: WorkItem[]): WorkItem[] {
  return items.filter((w) => w.sprintId === sprint.id && w.status !== 'done')
}

/** The planned sprint that starts soonest in the same project, if any: the default carry-over target. */
export function nextPlannedSprint(sprint: Sprint, sprints: Sprint[]): Sprint | undefined {
  return sprints
    .filter((s) => s.projectId === sprint.projectId && s.state === 'planned' && s.id !== sprint.id)
    .sort((a, b) => a.startDate.localeCompare(b.startDate))[0]
}

export type CompleteResult =
  | { ok: true; sprint: Sprint; movedItems: WorkItem[] }
  | { ok: false; reason: string }

/**
 * Completes an active sprint. Done items stay in it as a record; unfinished
 * items move to the product backlog or to a planned sprint, keeping their status.
 */
export function completeSprint(
  sprint: Sprint,
  sprints: Sprint[],
  items: WorkItem[],
  carryOver: CarryOver,
  now: Timestamp,
): CompleteResult {
  if (sprint.state !== 'active') return { ok: false, reason: `“${sprint.name}” is not active.` }

  let targetId: string | null = null
  if (carryOver.kind === 'sprint') {
    const target = sprints.find((s) => s.id === carryOver.sprintId)
    if (!target || target.projectId !== sprint.projectId || target.state !== 'planned') {
      return { ok: false, reason: 'Unfinished work can only move to a planned sprint in this project.' }
    }
    targetId = target.id
  }

  const movedItems = unfinishedItems(sprint, items).map((w) => ({ ...w, sprintId: targetId, updatedAt: now }))
  return { ok: true, sprint: { ...sprint, state: 'completed' }, movedItems }
}

/** Review and retro text stay editable in every sprint state; nothing else changes. */
export function updateSprintNotes(sprint: Sprint, notes: SprintNotes): Sprint {
  return {
    ...sprint,
    review: notes.review.trim(),
    retro: {
      wentWell: notes.retro.wentWell.trim(),
      toImprove: notes.retro.toImprove.trim(),
      actions: notes.retro.actions.trim(),
    },
  }
}
