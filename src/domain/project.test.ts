import { describe, expect, it } from 'vitest'
import { PROJECT_NAME_MAX, createProject, updateProject, validateProject } from './project'

describe('validateProject', () => {
  it.each([
    ['empty', ''],
    ['whitespace only', '   '],
  ])('requires a name (%s)', (_label, name) => {
    expect(validateProject({ name, description: '' })).toEqual({ name: 'Name is required.' })
  })

  it('accepts a name of exactly the maximum length', () => {
    expect(validateProject({ name: 'a'.repeat(PROJECT_NAME_MAX), description: '' })).toEqual({})
  })

  it('rejects a name over the maximum length', () => {
    expect(validateProject({ name: 'a'.repeat(PROJECT_NAME_MAX + 1), description: '' }).name).toMatch(
      /80 characters or fewer/,
    )
  })

  it('measures length after trimming', () => {
    expect(validateProject({ name: `  ${'a'.repeat(PROJECT_NAME_MAX)}  `, description: '' })).toEqual({})
  })

  it('does not require a description', () => {
    expect(validateProject({ name: 'SprintLab', description: '' })).toEqual({})
  })
})

describe('createProject', () => {
  it('trims input and sets both timestamps', () => {
    expect(createProject({ name: '  SprintLab ', description: ' Tracker ' }, 'p1', 'T1')).toEqual({
      id: 'p1',
      name: 'SprintLab',
      description: 'Tracker',
      createdAt: 'T1',
      updatedAt: 'T1',
    })
  })
})

describe('updateProject', () => {
  it('changes fields and updatedAt but keeps id and createdAt', () => {
    const original = createProject({ name: 'Old', description: '' }, 'p1', 'T1')
    expect(updateProject(original, { name: ' New ', description: 'd' }, 'T2')).toEqual({
      id: 'p1',
      name: 'New',
      description: 'd',
      createdAt: 'T1',
      updatedAt: 'T2',
    })
  })
})
