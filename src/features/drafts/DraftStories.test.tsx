import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createProject } from '../../domain/project'
import { emptyData, loadData, saveData } from '../../repository/storage'
import { axeViolations } from '../../test/axe'
import { renderApp } from '../../test/renderApp'
import { EMPTY_RESULT_MESSAGE } from './DraftStoriesSection'

const project = createProject({ name: 'Bike calculator', description: 'Gear ratios' }, 'p1', '2026-11-14T09:00:00.000Z')

const stories = [
  { title: 'Save favourite gear setups', description: 'Riders reuse setups.', priority: 'high', acceptanceCriteria: ['Setups persist', 'Can be renamed'] },
  { title: 'Compare two setups', description: '', priority: 'medium', acceptanceCriteria: ['Shows both side by side'] },
  { title: 'Share a setup link', description: 'Send to friends.', priority: 'low', acceptanceCriteria: ['Link opens the setup'] },
]

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
}

/** Stubs fetch: GET reports whether the feature is enabled, POST is answered by `post`. */
function mockServer(post: (body: unknown, signal?: AbortSignal | null) => Response | Promise<Response>, enabled = true) {
  const fetchMock = vi.fn(async (_url: string, init?: RequestInit) => {
    if (!init?.method || init.method === 'GET') return json({ enabled })
    return post(JSON.parse(String(init.body)), init.signal)
  })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

function storedItems() {
  const result = loadData()
  if (!result.ok) throw new Error('expected readable data')
  return result.data.workItems
}

async function openDrafter() {
  renderApp('/projects/p1')
  return screen.findByRole('heading', { name: 'Draft stories with AI' })
}

beforeEach(() => {
  localStorage.clear()
  saveData({ ...emptyData(), projects: [project] })
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('AI story drafter', () => {
  it.each([
    ['the server reports no key', () => mockServer(() => json({}), false)],
    [
      'there is no function (the dev server returns HTML)',
      () => vi.stubGlobal('fetch', vi.fn(async () => new Response('<!doctype html>', { headers: { 'Content-Type': 'text/html' } }))),
    ],
    ['the request fails', () => vi.stubGlobal('fetch', vi.fn(async () => Promise.reject(new TypeError('offline'))))],
  ])('stays hidden when %s', async (_label, setup) => {
    setup()
    renderApp('/projects/p1')
    expect(await screen.findByRole('heading', { name: 'Board' })).toBeInTheDocument()
    await waitFor(() => expect(fetch).toHaveBeenCalled())
    expect(screen.queryByRole('heading', { name: 'Draft stories with AI' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Draft stories' })).not.toBeInTheDocument()
  })

  it('drafts stories, lets you edit and discard them, and saves only what you add', async () => {
    const user = userEvent.setup()
    const fetchMock = mockServer(() => json({ stories }))
    await openDrafter()

    await user.type(screen.getByLabelText('Feature request'), 'Riders want to save and share gear setups')
    await user.click(screen.getByRole('button', { name: 'Draft stories' }))

    const review = await screen.findByRole('heading', { name: 'Review drafts (3)' })
    expect(review).toHaveFocus()
    expect(screen.getByRole('status')).toHaveTextContent('3 drafts ready to review.')
    expect(fetchMock).toHaveBeenLastCalledWith('/api/draft-stories', expect.objectContaining({ method: 'POST' }))
    expect(JSON.parse(String(fetchMock.mock.lastCall?.[1]?.body))).toEqual({
      request: 'Riders want to save and share gear setups',
      projectName: 'Bike calculator',
      projectDescription: 'Gear ratios',
    })
    expect(storedItems()).toEqual([])

    await user.click(screen.getByRole('button', { name: 'Edit draft Compare two setups' }))
    const title = screen.getByLabelText('Title (required)')
    await user.clear(title)
    await user.type(title, 'Compare setups side by side')
    await user.click(screen.getByRole('radio', { name: 'Bug' }))
    await user.click(screen.getByRole('button', { name: 'Save draft' }))
    expect(screen.getByRole('button', { name: 'Edit draft Compare setups side by side' })).toHaveFocus()
    expect(storedItems()).toEqual([])

    await user.click(screen.getByRole('button', { name: 'Discard draft Share a setup link' }))
    expect(screen.getByRole('heading', { name: 'Review drafts (2)' })).toHaveFocus()
    expect(screen.getByRole('status')).toHaveTextContent('Discarded “Share a setup link”.')

    await user.click(screen.getByRole('button', { name: 'Add 2 drafts to backlog' }))
    expect(screen.getByRole('status')).toHaveTextContent('Added 2 work items to the backlog.')
    expect(screen.getByRole('status')).toHaveFocus()
    expect(screen.queryByRole('heading', { name: /Review drafts/ })).not.toBeInTheDocument()
    expect(screen.getByLabelText('Feature request')).toHaveValue('')

    expect(storedItems()).toMatchObject([
      {
        projectId: 'p1',
        type: 'story',
        title: 'Save favourite gear setups',
        priority: 'high',
        status: 'backlog',
        sprintId: null,
        acceptanceCriteria: ['Setups persist', 'Can be renamed'],
      },
      { projectId: 'p1', type: 'bug', title: 'Compare setups side by side', priority: 'medium', status: 'backlog', sprintId: null },
    ])
    const backlog = screen.getByRole('region', { name: /Backlog/ })
    expect(within(backlog).getByRole('heading', { name: 'Save favourite gear setups' })).toBeInTheDocument()
  })

  it('checks the request before sending it', async () => {
    const user = userEvent.setup()
    const fetchMock = mockServer(() => json({ stories }))
    await openDrafter()
    await user.click(screen.getByRole('button', { name: 'Draft stories' }))
    expect(screen.getByText('Describe the feature you want drafted.')).toBeInTheDocument()
    expect(screen.getByLabelText('Feature request')).toHaveFocus()
    expect(screen.getByLabelText('Feature request')).toHaveAttribute('aria-invalid', 'true')
    expect(fetchMock).toHaveBeenCalledTimes(1) // only the GET
  })

  it('shows the server error and keeps the typed request', async () => {
    const user = userEvent.setup()
    mockServer(() => json({ error: 'Claude declined this request. Try rephrasing it.' }, 422))
    await openDrafter()
    await user.type(screen.getByLabelText('Feature request'), 'Something odd')
    await user.click(screen.getByRole('button', { name: 'Draft stories' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Claude declined this request. Try rephrasing it.')
    expect(screen.getByLabelText('Feature request')).toHaveValue('Something odd')
    expect(screen.getByRole('button', { name: 'Draft stories' })).toHaveFocus()
  })

  it('says when there was nothing to draft', async () => {
    const user = userEvent.setup()
    mockServer(() => json({ stories: [] }))
    await openDrafter()
    await user.type(screen.getByLabelText('Feature request'), 'stuff')
    await user.click(screen.getByRole('button', { name: 'Draft stories' }))
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent(EMPTY_RESULT_MESSAGE))
    expect(screen.queryByRole('heading', { name: /Review drafts/ })).not.toBeInTheDocument()
  })

  it('can cancel a request that is still running', async () => {
    const user = userEvent.setup()
    mockServer(
      (_body, signal) =>
        new Promise<Response>((_resolve, reject) => {
          signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')))
        }),
    )
    await openDrafter()
    await user.type(screen.getByLabelText('Feature request'), 'Archive projects')
    await user.click(screen.getByRole('button', { name: 'Draft stories' }))
    expect(screen.getByRole('status')).toHaveTextContent('Drafting stories. This can take up to a minute.')
    expect(screen.getByRole('button', { name: 'Cancel drafting' })).toHaveFocus()

    await user.click(screen.getByRole('button', { name: 'Cancel drafting' }))
    expect(screen.getByRole('status')).toHaveTextContent('Drafting cancelled.')
    expect(screen.getByRole('button', { name: 'Draft stories' })).toHaveFocus()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('blocks adding a draft whose title is too long until it is edited', async () => {
    const user = userEvent.setup()
    mockServer(() => json({ stories: [{ ...stories[0], title: 'x'.repeat(121) }] }))
    await openDrafter()
    await user.type(screen.getByLabelText('Feature request'), 'Long one')
    await user.click(screen.getByRole('button', { name: 'Draft stories' }))
    await user.click(await screen.findByRole('button', { name: 'Add 1 draft to backlog' }))
    expect(screen.getByRole('alert')).toHaveTextContent('needs a shorter title. Edit it before adding.')
    expect(storedItems()).toEqual([])
  })

  it('has no automated accessibility violations while reviewing drafts', async () => {
    const user = userEvent.setup()
    mockServer(() => json({ stories }))
    await openDrafter()
    await user.type(screen.getByLabelText('Feature request'), 'Gear setups')
    await user.click(screen.getByRole('button', { name: 'Draft stories' }))
    await screen.findByRole('heading', { name: 'Review drafts (3)' })
    expect(await axeViolations()).toEqual([])
  })
})
