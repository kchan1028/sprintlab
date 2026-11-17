import { parseDrafts, type DraftRequest, type StoryDraft } from '../../domain/drafts'

export const DRAFT_ENDPOINT = '/api/draft-stories'
/** The browser gives up after this long; the server's own timeout is shorter. */
export const DRAFT_TIMEOUT_MS = 60_000

export const CLIENT_MESSAGES = {
  timeout: 'Drafting took longer than a minute, so it was stopped. Try again.',
  network: 'Could not reach the drafting service. Check your connection and try again.',
  failed: 'Drafting failed. Try again.',
  incomplete: 'The drafts came back incomplete. Try again.',
} as const

export type DraftResult =
  | { ok: true; stories: StoryDraft[] }
  | { ok: false; error: string }
  | { ok: false; aborted: true }

/**
 * True only when the server says a key is configured. Under `npm run dev` there is no
 * function, so the request returns the app's HTML (or fails) and the feature stays hidden.
 */
export async function checkDraftsEnabled(signal?: AbortSignal): Promise<boolean> {
  // Static hosts without the function (GitHub Pages) build with VITE_AI_DRAFTER=off to skip a request that can only 404.
  if (import.meta.env.VITE_AI_DRAFTER === 'off') return false
  try {
    const response = await fetch(DRAFT_ENDPOINT, { signal })
    if (!response.ok || !response.headers.get('Content-Type')?.includes('application/json')) return false
    const body: unknown = await response.json()
    return typeof body === 'object' && body !== null && (body as { enabled?: unknown }).enabled === true
  } catch {
    return false
  }
}

async function errorMessage(response: Response): Promise<string> {
  try {
    const body: unknown = await response.json()
    const error = typeof body === 'object' && body !== null ? (body as { error?: unknown }).error : undefined
    return typeof error === 'string' && error.length > 0 ? error : CLIENT_MESSAGES.failed
  } catch {
    return CLIENT_MESSAGES.failed
  }
}

/** Posts a request and validates the reply. `signal` lets the caller cancel. */
export async function requestDrafts(draft: DraftRequest, signal: AbortSignal): Promise<DraftResult> {
  const controller = new AbortController()
  let timedOut = false
  const timer = setTimeout(() => {
    timedOut = true
    controller.abort()
  }, DRAFT_TIMEOUT_MS)
  const cancel = () => controller.abort()
  signal.addEventListener('abort', cancel)
  try {
    const response = await fetch(DRAFT_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(draft),
      signal: controller.signal,
    })
    if (!response.ok) return { ok: false, error: await errorMessage(response) }
    const stories = parseDrafts(await response.json())
    return stories ? { ok: true, stories } : { ok: false, error: CLIENT_MESSAGES.incomplete }
  } catch {
    if (timedOut) return { ok: false, error: CLIENT_MESSAGES.timeout }
    if (signal.aborted) return { ok: false, aborted: true }
    return { ok: false, error: CLIENT_MESSAGES.network }
  } finally {
    clearTimeout(timer)
    signal.removeEventListener('abort', cancel)
  }
}
