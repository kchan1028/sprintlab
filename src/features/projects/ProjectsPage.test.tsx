import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../../App'
import { STORAGE_KEY, loadData } from '../../repository/storage'

function storedProjects() {
  const result = loadData()
  if (!result.ok) throw new Error('expected readable data')
  return result.data.projects
}

async function createProject(name: string, description = '') {
  const user = userEvent.setup()
  await user.click(screen.getByRole('button', { name: 'New project' }))
  await user.type(screen.getByLabelText('Name (required)'), name)
  if (description) await user.type(screen.getByLabelText('Description'), description)
  await user.click(screen.getByRole('button', { name: 'Create project' }))
}

beforeEach(() => {
  localStorage.clear()
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('Projects', () => {
  it('shows an empty state and a New project button when there are no projects', () => {
    render(<App />)
    expect(screen.getByText('No projects yet.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'New project' })).toBeInTheDocument()
  })

  it('does not write to storage just by loading', () => {
    render(<App />)
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
  })

  it('creates a project that appears immediately and is saved', async () => {
    render(<App />)
    await createProject('  Bike calculator  ', 'Gear ratios')
    const list = screen.getByRole('list')
    expect(within(list).getByRole('heading', { name: 'Bike calculator' })).toBeInTheDocument()
    expect(within(list).getByText('Gear ratios')).toBeInTheDocument()
    expect(storedProjects()).toMatchObject([{ name: 'Bike calculator', description: 'Gear ratios' }])
  })

  it('keeps projects after a reload', async () => {
    const { unmount } = render(<App />)
    await createProject('Bike calculator')
    unmount()
    render(<App />)
    expect(screen.getByRole('heading', { name: 'Bike calculator' })).toBeInTheDocument()
  })

  it('shows an inline error for an empty name and saves nothing', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: 'New project' }))
    await user.type(screen.getByLabelText('Name (required)'), '   ')
    await user.click(screen.getByRole('button', { name: 'Create project' }))

    const nameInput = screen.getByLabelText('Name (required)')
    expect(nameInput).toHaveAttribute('aria-invalid', 'true')
    expect(nameInput).toHaveAccessibleDescription('Name is required.')
    expect(nameInput).toHaveFocus()
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
  })

  it('rejects a name longer than 80 characters', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: 'New project' }))
    await user.type(screen.getByLabelText('Name (required)'), 'a'.repeat(81))
    await user.click(screen.getByRole('button', { name: 'Create project' }))
    expect(screen.getByLabelText('Name (required)')).toHaveAccessibleDescription(
      'Name must be 80 characters or fewer.',
    )
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
  })

  it('allows two projects with the same name', async () => {
    render(<App />)
    await createProject('Same')
    await createProject('Same')
    expect(screen.getAllByRole('heading', { name: 'Same' })).toHaveLength(2)
    expect(storedProjects()).toHaveLength(2)
  })

  it('edits a project name and updates updatedAt but not createdAt', async () => {
    const user = userEvent.setup()
    vi.spyOn(Date.prototype, 'toISOString').mockReturnValue('2026-11-14T10:00:00.000Z')
    render(<App />)
    await createProject('Old name')

    vi.spyOn(Date.prototype, 'toISOString').mockReturnValue('2026-11-15T10:00:00.000Z')
    await user.click(screen.getByRole('button', { name: 'Edit Old name' }))
    const nameInput = screen.getByLabelText('Name (required)')
    await user.clear(nameInput)
    await user.type(nameInput, 'New name')
    await user.click(screen.getByRole('button', { name: 'Save changes' }))

    expect(screen.getByRole('heading', { name: 'New name' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Old name' })).not.toBeInTheDocument()
    expect(storedProjects()).toMatchObject([
      { name: 'New name', createdAt: '2026-11-14T10:00:00.000Z', updatedAt: '2026-11-15T10:00:00.000Z' },
    ])
  })

  it('discards changes when editing is cancelled', async () => {
    const user = userEvent.setup()
    render(<App />)
    await createProject('Keep me')
    await user.click(screen.getByRole('button', { name: 'Edit Keep me' }))
    await user.clear(screen.getByLabelText('Name (required)'))
    await user.type(screen.getByLabelText('Name (required)'), 'Changed')
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(screen.getByRole('heading', { name: 'Keep me' })).toBeInTheDocument()
    expect(storedProjects()).toMatchObject([{ name: 'Keep me' }])
  })

  it('warns when a save fails but keeps the project on screen', async () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('full', 'QuotaExceededError')
    })
    render(<App />)
    await createProject('Unsaved')
    expect(screen.getByRole('alert')).toHaveTextContent('Browser storage is full')
    expect(screen.getByRole('heading', { name: 'Unsaved' })).toBeInTheDocument()
  })
})
