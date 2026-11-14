import { describe, expect, it } from 'vitest'
import { createProject, updateProject } from '../domain/project'
import { emptyData } from '../repository/storage'
import { appReducer } from './appReducer'

describe('appReducer', () => {
  it('adds a created project without mutating the previous state', () => {
    const before = emptyData()
    const project = createProject({ name: 'A', description: '' }, 'p1', 'T1')
    const after = appReducer(before, { type: 'project/created', project })
    expect(after.projects).toEqual([project])
    expect(before.projects).toEqual([])
  })

  it('allows two projects with the same name', () => {
    let state = emptyData()
    state = appReducer(state, { type: 'project/created', project: createProject({ name: 'A', description: '' }, 'p1', 'T1') })
    state = appReducer(state, { type: 'project/created', project: createProject({ name: 'A', description: '' }, 'p2', 'T2') })
    expect(state.projects.map((p) => p.id)).toEqual(['p1', 'p2'])
  })

  it('replaces only the updated project', () => {
    const a = createProject({ name: 'A', description: '' }, 'p1', 'T1')
    const b = createProject({ name: 'B', description: '' }, 'p2', 'T1')
    const state = { ...emptyData(), projects: [a, b] }
    const edited = updateProject(a, { name: 'A2', description: '' }, 'T2')
    expect(appReducer(state, { type: 'project/updated', project: edited }).projects).toEqual([edited, b])
  })
})
