import { describe, expect, it } from 'vitest'
import {
  canStartSprint,
  createSprint,
  defaultSprintDates,
  sortSprints,
  startSprint,
  validateSprint,
  type SprintInput,
} from './sprint'
import type { Sprint } from './types'

const input = (o: Partial<SprintInput> = {}): SprintInput => ({
  name: 'Sprint 1',
  goal: 'Ship the board',
  startDate: '2026-11-16',
  endDate: '2026-11-22',
  ...o,
})

const sprint = (id: string, state: Sprint['state'], projectId = 'p1', startDate = '2026-11-16'): Sprint => ({
  ...createSprint(input({ name: id, startDate, endDate: startDate }), projectId, id),
  state,
})

describe('validateSprint', () => {
  it('accepts a complete sprint', () => {
    expect(validateSprint(input())).toEqual({})
  })

  it('allows a one-day sprint (end equals start)', () => {
    expect(validateSprint(input({ endDate: '2026-11-16' }))).toEqual({})
  })

  it('rejects an end date before the start date', () => {
    expect(validateSprint(input({ endDate: '2026-11-15' }))).toEqual({
      endDate: 'End date cannot be before the start date.',
    })
  })

  it('requires name, goal and both dates', () => {
    expect(validateSprint({ name: ' ', goal: ' ', startDate: '', endDate: '' })).toEqual({
      name: 'Name is required.',
      goal: 'Goal is required. One sentence on what this sprint should achieve.',
      startDate: 'Start date is required.',
      endDate: 'End date is required.',
    })
  })

  it('rejects an impossible date', () => {
    expect(validateSprint(input({ startDate: '2026-02-30' })).startDate).toBe('Start date is required.')
  })
})

describe('createSprint', () => {
  it('starts planned with empty review and retro, trimmed text', () => {
    expect(createSprint(input({ name: ' S1 ', goal: ' G ' }), 'p1', 's1')).toEqual({
      id: 's1',
      projectId: 'p1',
      name: 'S1',
      goal: 'G',
      startDate: '2026-11-16',
      endDate: '2026-11-22',
      state: 'planned',
      review: '',
      retro: { wentWell: '', toImprove: '', actions: '' },
    })
  })
})

describe('canStartSprint', () => {
  it('allows starting when no other sprint in the project is active', () => {
    const s = sprint('S2', 'planned')
    expect(canStartSprint(s, [sprint('S1', 'completed'), s])).toEqual({ ok: true })
  })

  it('blocks a second active sprint in the same project and names the active one', () => {
    const s = sprint('S2', 'planned')
    expect(canStartSprint(s, [sprint('S1', 'active'), s])).toEqual({
      ok: false,
      reason: '“S1” is already active. Complete it before starting “S2”.',
    })
  })

  it('ignores active sprints in other projects', () => {
    const s = sprint('S2', 'planned')
    expect(canStartSprint(s, [sprint('Other', 'active', 'p2'), s])).toEqual({ ok: true })
  })

  it('only starts planned sprints', () => {
    const s = sprint('S1', 'completed')
    expect(canStartSprint(s, [s]).ok).toBe(false)
  })
})

describe('startSprint', () => {
  it('marks the sprint active', () => {
    expect(startSprint(sprint('S1', 'planned')).state).toBe('active')
  })
})

describe('sortSprints', () => {
  it('orders active, then planned by start date, then completed newest first', () => {
    const list = [
      sprint('done-old', 'completed', 'p1', '2026-10-01'),
      sprint('plan-late', 'planned', 'p1', '2026-12-01'),
      sprint('active', 'active', 'p1', '2026-11-16'),
      sprint('done-new', 'completed', 'p1', '2026-11-01'),
      sprint('plan-early', 'planned', 'p1', '2026-11-23'),
    ]
    expect(sortSprints(list).map((s) => s.id)).toEqual(['active', 'plan-early', 'plan-late', 'done-new', 'done-old'])
  })
})

describe('defaultSprintDates', () => {
  it('starts today for the first sprint', () => {
    expect(defaultSprintDates([], '2026-11-14')).toEqual({ startDate: '2026-11-14', endDate: '2026-11-20' })
  })

  it('starts the day after the latest sprint ends', () => {
    const existing = [createSprint(input({ startDate: '2026-11-14', endDate: '2026-11-20' }), 'p1', 's1')]
    expect(defaultSprintDates(existing, '2026-11-14')).toEqual({ startDate: '2026-11-21', endDate: '2026-11-27' })
  })

  it('starts today when every existing sprint ended in the past', () => {
    const existing = [createSprint(input({ startDate: '2026-10-01', endDate: '2026-10-07' }), 'p1', 's1')]
    expect(defaultSprintDates(existing, '2026-11-14').startDate).toBe('2026-11-14')
  })
})
