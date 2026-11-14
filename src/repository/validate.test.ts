import { describe, expect, it } from 'vitest'
import { createProject } from '../domain/project'
import { createSprint } from '../domain/sprint'
import { createWorkItem, emptyWorkItemInput } from '../domain/workItem'
import { emptyData } from './storage'
import { hasValidRecords, isProject, isSprint, isWorkItem } from './validate'

const project = createProject({ name: 'P', description: '' }, 'p1', 'T1')
const item = createWorkItem({ ...emptyWorkItemInput(), title: 'W' }, 'p1', 'w1', 'T1')
const sprint = createSprint({ name: 'S', goal: 'G', startDate: '2026-11-16', endDate: '2026-11-22' }, 'p1', 's1')

describe('record validation', () => {
  it('accepts records created by the domain functions', () => {
    expect(isProject(project)).toBe(true)
    expect(isWorkItem(item)).toBe(true)
    expect(isWorkItem({ ...item, sprintId: 's1' })).toBe(true)
    expect(isSprint(sprint)).toBe(true)
    expect(hasValidRecords({ ...emptyData(), projects: [project], workItems: [item], sprints: [sprint] })).toBe(true)
  })

  it.each([
    ['null criteria', { ...item, acceptanceCriteria: null }],
    ['non-string criterion', { ...item, acceptanceCriteria: [1] }],
    ['unknown status', { ...item, status: 'blocked' }],
    ['unknown priority', { ...item, priority: 'urgent' }],
    ['numeric title', { ...item, title: 42 }],
    ['missing sprintId', (({ sprintId: _s, ...rest }) => rest)(item)],
  ])('rejects a work item with %s', (_label, bad) => {
    expect(isWorkItem(bad)).toBe(false)
  })

  it.each([
    ['missing retro', (({ retro: _r, ...rest }) => rest)(sprint)],
    ['unknown state', { ...sprint, state: 'paused' }],
    ['numeric goal', { ...sprint, goal: 1 }],
  ])('rejects a sprint with %s', (_label, bad) => {
    expect(isSprint(bad)).toBe(false)
  })

  it('rejects a project without a name', () => {
    expect(isProject({ ...project, name: undefined })).toBe(false)
  })
})
