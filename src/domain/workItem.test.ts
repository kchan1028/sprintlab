import { describe, expect, it } from 'vitest'
import {
  WORK_ITEM_TITLE_MAX,
  cleanCriteria,
  createWorkItem,
  emptyWorkItemInput,
  toWorkItemInput,
  updateWorkItem,
  validateWorkItem,
  type WorkItemInput,
} from './workItem'

const input = (overrides: Partial<WorkItemInput> = {}): WorkItemInput => ({
  ...emptyWorkItemInput(),
  title: 'Export data',
  ...overrides,
})

describe('validateWorkItem', () => {
  it.each(['', '   '])('requires a title (%j)', (title) => {
    expect(validateWorkItem(input({ title }))).toEqual({ title: 'Title is required.' })
  })

  it('accepts a title at the maximum length and rejects one over it', () => {
    expect(validateWorkItem(input({ title: 'a'.repeat(WORK_ITEM_TITLE_MAX) }))).toEqual({})
    expect(validateWorkItem(input({ title: 'a'.repeat(WORK_ITEM_TITLE_MAX + 1) })).title).toMatch(
      /120 characters or fewer/,
    )
  })

  it('does not require description or acceptance criteria', () => {
    expect(validateWorkItem(input({ description: '', acceptanceCriteria: [] }))).toEqual({})
  })
})

describe('cleanCriteria', () => {
  it('trims criteria and drops blank ones', () => {
    expect(cleanCriteria([' a ', '', '  ', 'b'])).toEqual(['a', 'b'])
  })
})

describe('createWorkItem', () => {
  it('starts in the backlog with no sprint, trimmed fields and both timestamps', () => {
    const item = createWorkItem(
      input({ type: 'bug', title: ' Crash ', priority: 'high', acceptanceCriteria: [' No crash ', ''] }),
      'p1',
      'w1',
      'T1',
    )
    expect(item).toEqual({
      id: 'w1',
      projectId: 'p1',
      type: 'bug',
      title: 'Crash',
      description: '',
      priority: 'high',
      acceptanceCriteria: ['No crash'],
      status: 'backlog',
      sprintId: null,
      createdAt: 'T1',
      updatedAt: 'T1',
    })
  })
})

describe('updateWorkItem', () => {
  it('changes editable fields and updatedAt only', () => {
    const original = { ...createWorkItem(input(), 'p1', 'w1', 'T1'), status: 'review' as const, sprintId: 's1' }
    const updated = updateWorkItem(original, input({ title: 'New', priority: 'low', acceptanceCriteria: [] }), 'T2')
    expect(updated).toMatchObject({
      id: 'w1',
      projectId: 'p1',
      title: 'New',
      priority: 'low',
      acceptanceCriteria: [],
      status: 'review',
      sprintId: 's1',
      createdAt: 'T1',
      updatedAt: 'T2',
    })
  })
})

describe('toWorkItemInput', () => {
  it('gives the form one empty criterion row when an item has none', () => {
    const item = createWorkItem(input({ acceptanceCriteria: [] }), 'p1', 'w1', 'T1')
    expect(toWorkItemInput(item).acceptanceCriteria).toEqual([''])
  })
})
