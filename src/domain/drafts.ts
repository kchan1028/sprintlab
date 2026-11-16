// Shared by the app and the Pages Function, so it has no runtime imports.
// The `.ts` extension keeps the type import valid under both the bundler and nodenext configs.
import type { Priority } from './types.ts'

/** Longest rough request the drafter accepts, in characters. */
export const DRAFT_REQUEST_MAX = 2000
/** Most stories one draft may contain. */
export const DRAFT_MAX_STORIES = 8
/** Same limit as WORK_ITEM_TITLE_MAX in workItem.ts; a test keeps them equal. */
export const DRAFT_TITLE_MAX = 120
/** Project context sent with a request is clipped to this length. */
export const DRAFT_CONTEXT_MAX = 500

const PRIORITY_VALUES: readonly Priority[] = ['low', 'medium', 'high', 'critical']

export interface StoryDraft {
  title: string
  description: string
  priority: Priority
  acceptanceCriteria: string[]
}

export interface DraftRequest {
  request: string
  projectName: string
  projectDescription: string
}

/** JSON schema for Claude's structured output: an object holding a list of stories. */
export const DRAFT_OUTPUT_SCHEMA = {
  type: 'object',
  properties: {
    stories: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
          priority: { type: 'string', enum: [...PRIORITY_VALUES] },
          acceptanceCriteria: { type: 'array', items: { type: 'string' } },
        },
        required: ['title', 'description', 'priority', 'acceptanceCriteria'],
        additionalProperties: false,
      },
    },
  },
  required: ['stories'],
  additionalProperties: false,
}

/** Returns an error message for an unusable request, or null when it is fine. */
export function validateDraftRequest(text: string): string | null {
  const trimmed = text.trim()
  if (trimmed.length === 0) return 'Describe the feature you want drafted.'
  if (trimmed.length > DRAFT_REQUEST_MAX) {
    return `Keep the request to ${DRAFT_REQUEST_MAX} characters or fewer.`
  }
  return null
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isPriority(value: unknown): value is Priority {
  return typeof value === 'string' && (PRIORITY_VALUES as readonly string[]).includes(value)
}

function parseStory(value: unknown): StoryDraft | null {
  if (!isRecord(value)) return null
  const { title, description, priority, acceptanceCriteria } = value
  if (typeof title !== 'string' || title.trim().length === 0) return null
  if (typeof description !== 'string' || !isPriority(priority)) return null
  if (!Array.isArray(acceptanceCriteria)) return null
  const criteria: string[] = []
  for (const c of acceptanceCriteria) {
    if (typeof c !== 'string') return null
    if (c.trim().length > 0) criteria.push(c.trim())
  }
  if (criteria.length === 0) return null
  return { title: title.trim(), description: description.trim(), priority, acceptanceCriteria: criteria }
}

/**
 * Checks untrusted draft output (from the model on the server, from the network in the app).
 * Returns the cleaned stories, or null if anything is malformed. Zero stories is valid.
 */
export function parseDrafts(value: unknown): StoryDraft[] | null {
  if (!isRecord(value) || !Array.isArray(value.stories)) return null
  if (value.stories.length > DRAFT_MAX_STORIES) return null
  const stories: StoryDraft[] = []
  for (const raw of value.stories) {
    const story = parseStory(raw)
    if (!story) return null
    stories.push(story)
  }
  return stories
}

/** Reads a POST body into a DraftRequest, or returns an error message. */
export function parseDraftRequest(value: unknown): DraftRequest | string {
  if (!isRecord(value) || typeof value.request !== 'string') return 'Describe the feature you want drafted.'
  const error = validateDraftRequest(value.request)
  if (error) return error
  const context = (v: unknown) => (typeof v === 'string' ? v.trim().slice(0, DRAFT_CONTEXT_MAX) : '')
  return {
    request: value.request.trim(),
    projectName: context(value.projectName),
    projectDescription: context(value.projectDescription),
  }
}
