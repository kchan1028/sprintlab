import { describe, expect, it } from 'vitest'
import { deleteProject, projectFootprint } from './deletion'
import { createProject } from './project'
import { createSprint } from './sprint'
import { createWorkItem, emptyWorkItemInput } from './workItem'
import { emptyData } from '../repository/storage'

const p1 = createProject({ name: 'One', description: '' }, 'p1', 'T')
const p2 = createProject({ name: 'Two', description: '' }, 'p2', 'T')
const data = {
  ...emptyData(),
  projects: [p1, p2],
  workItems: [
    createWorkItem({ ...emptyWorkItemInput(), title: 'a' }, 'p1', 'w1', 'T'),
    createWorkItem({ ...emptyWorkItemInput(), title: 'b' }, 'p1', 'w2', 'T'),
    createWorkItem({ ...emptyWorkItemInput(), title: 'c' }, 'p2', 'w3', 'T'),
  ],
  sprints: [createSprint({ name: 'S', goal: 'G', startDate: '2026-11-16', endDate: '2026-11-22' }, 'p1', 's1')],
}

describe('projectFootprint', () => {
  it('counts the work items and sprints that belong to the project', () => {
    expect(projectFootprint(data, 'p1')).toEqual({ workItems: 2, sprints: 1 })
    expect(projectFootprint(data, 'p2')).toEqual({ workItems: 1, sprints: 0 })
  })
})

describe('deleteProject', () => {
  it('removes the project, its items and sprints, and nothing else', () => {
    const after = deleteProject(data, 'p1')
    expect(after.projects).toEqual([p2])
    expect(after.workItems.map((w) => w.id)).toEqual(['w3'])
    expect(after.sprints).toEqual([])
    expect(data.projects).toHaveLength(2)
  })
})
