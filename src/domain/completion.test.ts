import { describe, expect, it } from 'vitest'
import { completeSprint, nextPlannedSprint, unfinishedItems, updateSprintNotes } from './completion'
import { createSprint } from './sprint'
import type { Sprint, Status, WorkItem } from './types'
import { createWorkItem, emptyWorkItemInput } from './workItem'

const sprint = (id: string, state: Sprint['state'], startDate = '2026-11-16', projectId = 'p1'): Sprint => ({
  ...createSprint({ name: id, goal: 'G', startDate, endDate: startDate }, projectId, id),
  state,
})
const item = (id: string, sprintId: string | null, status: Status): WorkItem => ({
  ...createWorkItem({ ...emptyWorkItemInput(), title: id }, 'p1', id, 'T1'),
  sprintId,
  status,
})

const s1 = sprint('s1', 'active')
const items = [item('done', 's1', 'done'), item('wip', 's1', 'in_progress'), item('review', 's1', 'review'), item('other', null, 'backlog')]

describe('unfinishedItems', () => {
  it('returns items in the sprint that are not Done', () => {
    expect(unfinishedItems(s1, items).map((w) => w.id)).toEqual(['wip', 'review'])
  })
})

describe('nextPlannedSprint', () => {
  it('picks the earliest planned sprint in the same project', () => {
    const list = [s1, sprint('late', 'planned', '2026-12-01'), sprint('soon', 'planned', '2026-11-23'), sprint('x', 'planned', '2026-11-20', 'p2')]
    expect(nextPlannedSprint(s1, list)?.id).toBe('soon')
  })

  it('returns undefined when there is no planned sprint', () => {
    expect(nextPlannedSprint(s1, [s1, sprint('old', 'completed')])).toBeUndefined()
  })
})

describe('completeSprint', () => {
  it('completes the sprint and returns unfinished items to the backlog, keeping status', () => {
    const result = completeSprint(s1, [s1], items, { kind: 'backlog' }, 'T2')
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.sprint.state).toBe('completed')
    expect(result.movedItems).toEqual([
      { ...items[1], sprintId: null, updatedAt: 'T2' },
      { ...items[2], sprintId: null, updatedAt: 'T2' },
    ])
  })

  it('moves unfinished items to a planned sprint', () => {
    const s2 = sprint('s2', 'planned', '2026-11-23')
    const result = completeSprint(s1, [s1, s2], items, { kind: 'sprint', sprintId: 's2' }, 'T2')
    expect(result.ok && result.movedItems.map((w) => w.sprintId)).toEqual(['s2', 's2'])
  })

  it('leaves Done items in the completed sprint', () => {
    const result = completeSprint(s1, [s1], items, { kind: 'backlog' }, 'T2')
    expect(result.ok && result.movedItems.some((w) => w.id === 'done')).toBe(false)
  })

  it('refuses to complete a sprint that is not active', () => {
    expect(completeSprint(sprint('p', 'planned'), [], items, { kind: 'backlog' }, 'T2').ok).toBe(false)
  })

  it.each([
    ['a completed sprint', sprint('s0', 'completed')],
    ['an active sprint', sprint('s9', 'active')],
    ['another project', sprint('s3', 'planned', '2026-11-23', 'p2')],
  ])('refuses to carry work into %s', (_label, target) => {
    expect(completeSprint(s1, [s1, target], items, { kind: 'sprint', sprintId: target.id }, 'T2')).toEqual({
      ok: false,
      reason: 'Unfinished work can only move to a planned sprint in this project.',
    })
  })
})

describe('updateSprintNotes', () => {
  it('trims and saves review and retro on a completed sprint without touching anything else', () => {
    const done = sprint('s0', 'completed')
    const updated = updateSprintNotes(done, {
      review: ' Shipped board ',
      retro: { wentWell: ' tests ', toImprove: ' goal ', actions: ' write goal ' },
    })
    expect(updated).toEqual({
      ...done,
      review: 'Shipped board',
      retro: { wentWell: 'tests', toImprove: 'goal', actions: 'write goal' },
    })
  })
})
