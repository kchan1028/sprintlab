import { describe, expect, it } from 'vitest'
import {
  DRAFT_MAX_STORIES,
  DRAFT_REQUEST_MAX,
  DRAFT_TITLE_MAX,
  parseDraftRequest,
  parseDrafts,
  validateDraftRequest,
} from './drafts'
import { WORK_ITEM_TITLE_MAX } from './workItem'

const story = {
  title: '  Archive a project  ',
  description: ' Hide finished projects. ',
  priority: 'medium',
  acceptanceCriteria: [' Archived projects leave the list ', '  ', 'They can be restored'],
}

describe('validateDraftRequest', () => {
  it('rejects blank and overlong requests', () => {
    expect(validateDraftRequest('   ')).toBe('Describe the feature you want drafted.')
    expect(validateDraftRequest('x'.repeat(DRAFT_REQUEST_MAX + 1))).toMatch(/2000 characters or fewer/)
  })

  it('accepts a request at the limit once trimmed', () => {
    expect(validateDraftRequest(` ${'x'.repeat(DRAFT_REQUEST_MAX)} `)).toBeNull()
  })
})

describe('parseDrafts', () => {
  it('trims fields and drops blank criteria', () => {
    expect(parseDrafts({ stories: [story] })).toEqual([
      {
        title: 'Archive a project',
        description: 'Hide finished projects.',
        priority: 'medium',
        acceptanceCriteria: ['Archived projects leave the list', 'They can be restored'],
      },
    ])
  })

  it('accepts zero stories', () => {
    expect(parseDrafts({ stories: [] })).toEqual([])
  })

  it.each([
    ['not an object', 'nope'],
    ['no stories array', { stories: 'x' }],
    ['a blank title', { stories: [{ ...story, title: ' ' }] }],
    ['an unknown priority', { stories: [{ ...story, priority: 'urgent' }] }],
    ['a non-string criterion', { stories: [{ ...story, acceptanceCriteria: [1] }] }],
    ['no usable criteria', { stories: [{ ...story, acceptanceCriteria: [' '] }] }],
    ['a missing description', { stories: [{ ...story, description: undefined }] }],
    ['too many stories', { stories: Array.from({ length: DRAFT_MAX_STORIES + 1 }, () => story) }],
  ])('rejects %s', (_label, value) => {
    expect(parseDrafts(value)).toBeNull()
  })
})

describe('parseDraftRequest', () => {
  it('trims the request and clips project context', () => {
    expect(
      parseDraftRequest({ request: ' Archive projects ', projectName: ' SprintLab ', projectDescription: 'd'.repeat(600) }),
    ).toEqual({ request: 'Archive projects', projectName: 'SprintLab', projectDescription: 'd'.repeat(500) })
  })

  it('defaults missing context to empty strings', () => {
    expect(parseDraftRequest({ request: 'Archive projects' })).toEqual({
      request: 'Archive projects',
      projectName: '',
      projectDescription: '',
    })
  })

  it('returns an error message for a bad body', () => {
    expect(parseDraftRequest(null)).toBe('Describe the feature you want drafted.')
    expect(parseDraftRequest({ request: '' })).toBe('Describe the feature you want drafted.')
  })
})

it('keeps the draft title limit in step with work items', () => {
  expect(DRAFT_TITLE_MAX).toBe(WORK_ITEM_TITLE_MAX)
})
