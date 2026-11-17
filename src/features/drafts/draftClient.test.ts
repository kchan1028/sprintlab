import { afterEach, describe, expect, it, vi } from 'vitest'
import { CLIENT_MESSAGES, DRAFT_TIMEOUT_MS, checkDraftsEnabled, requestDrafts } from './draftClient'

const draft = { request: 'Archive projects', projectName: '', projectDescription: '' }

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
}

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
})

describe('checkDraftsEnabled', () => {
  it('is true only for a JSON reply saying enabled', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => json({ enabled: true })))
    expect(await checkDraftsEnabled()).toBe(true)
    vi.stubGlobal('fetch', vi.fn(async () => json({ enabled: 'yes' })))
    expect(await checkDraftsEnabled()).toBe(false)
    vi.stubGlobal('fetch', vi.fn(async () => json({ enabled: true }, 500)))
    expect(await checkDraftsEnabled()).toBe(false)
  })

  it('makes no request in a build without the function', async () => {
    vi.stubEnv('VITE_AI_DRAFTER', 'off')
    const fetchMock = vi.fn(async () => json({ enabled: true }))
    vi.stubGlobal('fetch', fetchMock)
    expect(await checkDraftsEnabled()).toBe(false)
    expect(fetchMock).not.toHaveBeenCalled()
  })
})

describe('requestDrafts', () => {
  it('rejects a reply whose stories are malformed', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => json({ stories: [{ title: 'No criteria' }] })))
    expect(await requestDrafts(draft, new AbortController().signal)).toEqual({ ok: false, error: CLIENT_MESSAGES.incomplete })
  })

  it('falls back to a generic message when an error reply has no message', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('Bad gateway', { status: 502 })))
    expect(await requestDrafts(draft, new AbortController().signal)).toEqual({ ok: false, error: CLIENT_MESSAGES.failed })
  })

  it('reports a network failure', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => Promise.reject(new TypeError('offline'))))
    expect(await requestDrafts(draft, new AbortController().signal)).toEqual({ ok: false, error: CLIENT_MESSAGES.network })
  })

  it('stops waiting after the timeout', async () => {
    vi.useFakeTimers()
    vi.stubGlobal(
      'fetch',
      vi.fn(
        (_url: string, init?: RequestInit) =>
          new Promise<Response>((_resolve, reject) => {
            init?.signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')))
          }),
      ),
    )
    const pending = requestDrafts(draft, new AbortController().signal)
    await vi.advanceTimersByTimeAsync(DRAFT_TIMEOUT_MS)
    expect(await pending).toEqual({ ok: false, error: CLIENT_MESSAGES.timeout })
  })

  it('reports a cancel as aborted rather than as an error', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(
        (_url: string, init?: RequestInit) =>
          new Promise<Response>((_resolve, reject) => {
            init?.signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')))
          }),
      ),
    )
    const controller = new AbortController()
    const pending = requestDrafts(draft, controller.signal)
    controller.abort()
    expect(await pending).toEqual({ ok: false, aborted: true })
  })
})
