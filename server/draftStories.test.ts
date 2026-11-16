// @vitest-environment node
import Anthropic from '@anthropic-ai/sdk'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MESSAGES, handleDraftStories, userPrompt, type CallModel } from './draftStories.ts'

const env = { ANTHROPIC_API_KEY: 'test-key' }
const story = { title: 'Archive a project', description: 'Hide old work.', priority: 'low', acceptanceCriteria: ['Leaves the list'] }

function post(body: unknown, contentType = 'application/json') {
  return new Request('http://localhost/api/draft-stories', {
    method: 'POST',
    headers: { 'Content-Type': contentType },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  })
}

const returning = (text: string): CallModel => async () => ({ kind: 'text', text })
const never: CallModel = async () => {
  throw new Error('model should not be called')
}

async function read(response: Response) {
  return { status: response.status, body: await response.json() }
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('GET /api/draft-stories', () => {
  it('reports whether a key is configured', async () => {
    const get = new Request('http://localhost/api/draft-stories')
    expect(await read(await handleDraftStories(get, env, never))).toEqual({ status: 200, body: { enabled: true } })
    expect(await read(await handleDraftStories(get, {}, never))).toEqual({ status: 200, body: { enabled: false } })
    expect(await read(await handleDraftStories(get, { ANTHROPIC_API_KEY: '  ' }, never))).toMatchObject({ body: { enabled: false } })
  })
})

describe('POST /api/draft-stories', () => {
  it('returns cleaned stories and passes the parsed request to the model', async () => {
    const callModel = vi.fn<CallModel>(returning(JSON.stringify({ stories: [{ ...story, title: ' Archive a project ' }] })))
    const response = await handleDraftStories(post({ request: ' Archive projects ', projectName: 'SprintLab' }), env, callModel)
    expect(await read(response)).toEqual({ status: 200, body: { stories: [story] } })
    expect(callModel).toHaveBeenCalledWith('test-key', { request: 'Archive projects', projectName: 'SprintLab', projectDescription: '' })
    expect(response.headers.get('Cache-Control')).toBe('no-store')
  })

  it('refuses when no key is configured', async () => {
    expect(await read(await handleDraftStories(post({ request: 'x' }), {}, never))).toEqual({
      status: 503,
      body: { error: MESSAGES.notConfigured },
    })
  })

  it('rejects other methods, non-JSON bodies and bad input', async () => {
    const put = new Request('http://localhost/api/draft-stories', { method: 'PUT' })
    expect((await handleDraftStories(put, env, never)).status).toBe(405)
    expect((await handleDraftStories(post('{"request":"x"}', 'text/plain'), env, never)).status).toBe(415)
    expect((await handleDraftStories(post('{not json'), env, never)).status).toBe(400)
    expect((await handleDraftStories(post('x'.repeat(16_001)), env, never)).status).toBe(413)
    expect(await read(await handleDraftStories(post({ request: '  ' }), env, never))).toEqual({
      status: 400,
      body: { error: 'Describe the feature you want drafted.' },
    })
  })

  it('reports a refusal and incomplete or malformed output', async () => {
    expect(await read(await handleDraftStories(post({ request: 'x' }), env, async () => ({ kind: 'refusal' })))).toEqual({
      status: 422,
      body: { error: MESSAGES.refused },
    })
    const incomplete = { status: 502, body: { error: MESSAGES.incomplete } }
    expect(await read(await handleDraftStories(post({ request: 'x' }), env, async () => ({ kind: 'incomplete' })))).toEqual(incomplete)
    expect(await read(await handleDraftStories(post({ request: 'x' }), env, returning('{"stories": [')))).toEqual(incomplete)
    expect(await read(await handleDraftStories(post({ request: 'x' }), env, returning('{"stories": [{"title": ""}]}')))).toEqual(incomplete)
  })

  it('turns API failures into friendly messages without leaking details', async () => {
    const logged = vi.spyOn(console, 'error').mockImplementation(() => {})
    const failing = (error: unknown): CallModel => async () => {
      throw error
    }
    expect(await read(await handleDraftStories(post({ request: 'x' }), env, failing(new Anthropic.APIConnectionTimeoutError())))).toEqual({
      status: 504,
      body: { error: MESSAGES.timeout },
    })
    expect(await read(await handleDraftStories(post({ request: 'x' }), env, failing(new Error('boom'))))).toEqual({
      status: 502,
      body: { error: MESSAGES.unavailable },
    })
    expect(logged).toHaveBeenCalledWith('draft-stories: Claude call failed (Error: boom)')
  })
})

describe('userPrompt', () => {
  it('wraps the typed text in tags and includes project context when present', () => {
    expect(userPrompt({ request: 'Archive', projectName: '', projectDescription: '' })).toBe(
      '<feature_request>\nArchive\n</feature_request>',
    )
    expect(userPrompt({ request: 'Archive', projectName: 'SprintLab', projectDescription: 'Tracker' })).toContain(
      '<project_name>SprintLab</project_name>',
    )
  })
})
