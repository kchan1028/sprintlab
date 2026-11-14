import { describe, expect, it } from 'vitest'
import { createProject } from '../../domain/project'
import { createSprint } from '../../domain/sprint'
import type { AppData } from '../../domain/types'
import { createWorkItem, emptyWorkItemInput } from '../../domain/workItem'
import { CURRENT_SCHEMA_VERSION, emptyData } from '../../repository/storage'
import { MAX_IMPORT_BYTES, checkImport, summarize } from './importFile'

const project = createProject({ name: 'P', description: '' }, 'p1', 'T')
const sprint = createSprint({ name: 'S1', goal: 'G', startDate: '2026-11-16', endDate: '2026-11-22' }, 'p1', 's1')
const item = { ...createWorkItem({ ...emptyWorkItemInput(), title: 'Item' }, 'p1', 'w1', 'T'), sprintId: 's1' }
const good: AppData = { ...emptyData(), projects: [project], sprints: [sprint], workItems: [item] }
const check = (data: unknown) => {
  const text = JSON.stringify(data)
  return checkImport(text, text.length)
}

describe('checkImport', () => {
  it('accepts a backup exported by SprintLab', () => {
    expect(check(good)).toEqual({ ok: true, data: good })
  })

  it('rejects text that is not JSON', () => {
    expect(checkImport('not json', 8)).toMatchObject({ ok: false, message: expect.stringMatching(/isn’t a valid SprintLab backup/) })
  })

  it('rejects JSON that is not a SprintLab backup', () => {
    expect(check({ hello: 'world' }).ok).toBe(false)
  })

  it('rejects a record with the wrong types', () => {
    expect(check({ ...good, workItems: [{ ...item, status: 'blocked' }] }).ok).toBe(false)
  })

  it('rejects a backup from a newer version', () => {
    expect(check({ ...good, schemaVersion: CURRENT_SCHEMA_VERSION + 1 })).toMatchObject({
      ok: false,
      message: expect.stringMatching(/newer version/),
    })
  })

  it('rejects files over the size limit before parsing', () => {
    expect(checkImport('{}', MAX_IMPORT_BYTES + 1)).toMatchObject({ ok: false, message: expect.stringMatching(/larger than 5 MB/) })
  })

  it.each([
    ['duplicate ids', { ...good, workItems: [item, item] }, /Two work items share the id “w1”/],
    ['an item in a missing project', { ...good, workItems: [{ ...item, projectId: 'gone' }] }, /belongs to a project that isn't in the file/],
    ['an item pointing at a missing sprint', { ...good, workItems: [{ ...item, sprintId: 'gone' }] }, /points to a sprint that isn't in its project/],
    ['a sprint in a missing project', { ...good, sprints: [{ ...sprint, projectId: 'gone' }], workItems: [] }, /Sprint “S1” belongs to a project/],
    [
      'two active sprints in one project',
      { ...good, sprints: [{ ...sprint, state: 'active' }, { ...sprint, id: 's2', state: 'active' }] },
      /more than one active sprint/,
    ],
  ])('rejects %s', (_label, data, message) => {
    const result = check(data)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.message).toMatch(message)
  })
})

describe('summarize', () => {
  it('uses singular and plural forms', () => {
    expect(summarize(good)).toBe('1 project, 1 work item and 1 sprint')
    expect(summarize(emptyData())).toBe('0 projects, 0 work items and 0 sprints')
  })
})
