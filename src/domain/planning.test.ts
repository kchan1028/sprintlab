import { describe, expect, it } from 'vitest'
import {
  assignWorkItem,
  assignableSprints,
  filterToParam,
  matchesFilter,
  parseSprintFilter,
} from './planning'
import { createSprint } from './sprint'
import type { Sprint } from './types'
import { createWorkItem, emptyWorkItemInput } from './workItem'

const sprint = (id: string, state: Sprint['state'], projectId = 'p1'): Sprint => ({
  ...createSprint({ name: id, goal: 'G', startDate: '2026-11-16', endDate: '2026-11-22' }, projectId, id),
  state,
})
const item = (sprintId: string | null = null) => ({
  ...createWorkItem({ ...emptyWorkItemInput(), title: 'T' }, 'p1', 'w1', 'T1'),
  sprintId,
})

describe('assignableSprints', () => {
  it('lists planned and active sprints of the project only', () => {
    const list = [sprint('done', 'completed'), sprint('plan', 'planned'), sprint('act', 'active'), sprint('other', 'active', 'p2')]
    expect(assignableSprints(list, 'p1').map((s) => s.id)).toEqual(['act', 'plan'])
  })
})

describe('assignWorkItem', () => {
  it('assigns to a planned or active sprint and updates updatedAt', () => {
    for (const state of ['planned', 'active'] as const) {
      const result = assignWorkItem(item(), sprint('s1', state), 'T2')
      expect(result).toEqual({ ok: true, item: { ...item(), sprintId: 's1', updatedAt: 'T2' } })
    }
  })

  it('removes from a sprint with null', () => {
    expect(assignWorkItem(item('s1'), null, 'T2')).toMatchObject({ ok: true, item: { sprintId: null, updatedAt: 'T2' } })
  })

  it('returns the same item when nothing changes', () => {
    const it1 = item('s1')
    const result = assignWorkItem(it1, sprint('s1', 'active'), 'T2')
    expect(result.ok && result.item).toBe(it1)
  })

  it('refuses a completed sprint', () => {
    expect(assignWorkItem(item(), sprint('Sprint 1', 'completed'), 'T2')).toEqual({
      ok: false,
      reason: '“Sprint 1” is completed, so work can’t be added to it.',
    })
  })

  it('refuses a sprint from another project', () => {
    expect(assignWorkItem(item(), sprint('s9', 'active', 'p2'), 'T2').ok).toBe(false)
  })
})

describe('filters', () => {
  const sprints = [sprint('s1', 'active')]

  it('parses and serializes URL values', () => {
    expect(parseSprintFilter(null, sprints)).toEqual({ kind: 'all' })
    expect(parseSprintFilter('none', sprints)).toEqual({ kind: 'none' })
    expect(parseSprintFilter('s1', sprints)).toEqual({ kind: 'sprint', sprintId: 's1' })
    expect(parseSprintFilter('deleted', sprints)).toEqual({ kind: 'all' })
    expect(filterToParam({ kind: 'all' })).toBeNull()
    expect(filterToParam({ kind: 'none' })).toBe('none')
    expect(filterToParam({ kind: 'sprint', sprintId: 's1' })).toBe('s1')
  })

  it('matches items to filters', () => {
    expect(matchesFilter(item(), { kind: 'all' })).toBe(true)
    expect(matchesFilter(item(), { kind: 'none' })).toBe(true)
    expect(matchesFilter(item('s1'), { kind: 'none' })).toBe(false)
    expect(matchesFilter(item('s1'), { kind: 'sprint', sprintId: 's1' })).toBe(true)
    expect(matchesFilter(item('s2'), { kind: 'sprint', sprintId: 's1' })).toBe(false)
  })
})
