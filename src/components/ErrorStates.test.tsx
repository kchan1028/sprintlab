import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { STORAGE_KEY, emptyData, loadData } from '../repository/storage'
import { AppDataProvider } from '../state/AppDataProvider'
import { renderApp } from '../test/renderApp'
import { ErrorBoundary } from './ErrorBoundary'

function blockWrites() {
  return vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new DOMException('full', 'QuotaExceededError')
  })
}

async function createProject(name: string) {
  const user = userEvent.setup()
  await user.click(screen.getByRole('button', { name: 'New project' }))
  await user.type(screen.getByLabelText('Name (required)'), name)
  await user.click(screen.getByRole('button', { name: 'Create project' }))
}

beforeEach(() => {
  localStorage.clear()
  vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test')
  vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('Save failures', () => {
  it('keeps the change on screen and explains it was not saved', async () => {
    blockWrites()
    renderApp()
    await createProject('Unsaved')
    const alert = screen.getByRole('alert', { name: 'Changes not saved' })
    expect(alert).toHaveTextContent('Browser storage is full')
    expect(screen.getByRole('heading', { name: 'Unsaved' })).toBeInTheDocument()
  })

  it('saves everything when "Try saving again" succeeds, and hides the banner', async () => {
    const setItem = blockWrites()
    renderApp()
    await createProject('Recovered')
    setItem.mockRestore()

    await userEvent.click(screen.getByRole('button', { name: 'Try saving again' }))

    expect(screen.queryByRole('alert', { name: 'Changes not saved' })).not.toBeInTheDocument()
    const result = loadData()
    expect(result.ok && result.data.projects.map((p) => p.name)).toEqual(['Recovered'])
  })

  it('keeps the banner when retrying still fails', async () => {
    blockWrites()
    renderApp()
    await createProject('Still unsaved')
    await userEvent.click(screen.getByRole('button', { name: 'Try saving again' }))
    expect(screen.getByRole('alert', { name: 'Changes not saved' })).toBeInTheDocument()
  })

  it('downloads the unsaved data as a backup file', async () => {
    blockWrites()
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    renderApp()
    await createProject('Backed up')
    await userEvent.click(screen.getByRole('button', { name: 'Download a copy' }))

    expect(click).toHaveBeenCalledOnce()
    const blob = vi.mocked(URL.createObjectURL).mock.calls[0][0] as Blob
    const saved = JSON.parse(await blob.text())
    expect(saved.projects.map((p: { name: string }) => p.name)).toEqual(['Backed up'])
  })

  it('asks for confirmation before leaving while changes are unsaved, and stops once saved', async () => {
    const setItem = blockWrites()
    renderApp()

    const before = new Event('beforeunload', { cancelable: true })
    window.dispatchEvent(before)
    expect(before.defaultPrevented).toBe(false)

    await createProject('Unsaved')
    const during = new Event('beforeunload', { cancelable: true })
    window.dispatchEvent(during)
    expect(during.defaultPrevented).toBe(true)

    setItem.mockRestore()
    await userEvent.click(screen.getByRole('button', { name: 'Try saving again' }))
    const after = new Event('beforeunload', { cancelable: true })
    window.dispatchEvent(after)
    expect(after.defaultPrevented).toBe(false)
  })
})

describe('Reset failures', () => {
  it('explains when reset could not remove corrupt data', async () => {
    localStorage.setItem(STORAGE_KEY, '{oops')
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new DOMException('blocked', 'SecurityError')
    })
    renderApp()
    await userEvent.click(screen.getByRole('button', { name: 'Reset data' }))
    await userEvent.click(screen.getByRole('button', { name: 'Reset everything' }))
    expect(screen.getByText(/Reset didn't work/)).toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveTextContent("Your saved data couldn't be read")
  })
})

describe('Unexpected errors', () => {
  function Broken(): never {
    throw new Error('boom')
  }

  it('shows a recovery message instead of a blank page', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    render(
      <AppDataProvider initialData={emptyData()}>
        <ErrorBoundary>
          <Broken />
        </ErrorBoundary>
      </AppDataProvider>,
    )
    expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong')
    expect(screen.getByRole('button', { name: 'Reload page' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Download a copy' })).toBeInTheDocument()
  })
})
