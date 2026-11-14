import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createProject } from '../../domain/project'
import { emptyData, loadData, saveData } from '../../repository/storage'
import { renderApp } from '../../test/renderApp'

const project = createProject({ name: 'Bike calculator', description: 'Gear ratios' }, 'p1', '2026-11-14T09:00:00.000Z')
const other = createProject({ name: 'Other', description: '' }, 'p2', '2026-11-14T09:00:00.000Z')

function storedItems() {
  const result = loadData()
  if (!result.ok) throw new Error('expected readable data')
  return result.data.workItems
}

beforeEach(() => {
  localStorage.clear()
  saveData({ ...emptyData(), projects: [project, other] })
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('Work items', () => {
  it('opens a project from the projects list', async () => {
    renderApp('/')
    await userEvent.click(screen.getByRole('link', { name: 'Bike calculator' }))
    expect(screen.getByRole('heading', { level: 2, name: 'Bike calculator' })).toBeInTheDocument()
    expect(screen.getByText('No work items yet.')).toBeInTheDocument()
  })

  it('shows not found for an unknown project id', () => {
    renderApp('/projects/missing')
    expect(screen.getByRole('heading', { name: 'Project not found' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Back to all projects' })).toBeInTheDocument()
  })

  it('creates a bug with priority, description and acceptance criteria', async () => {
    const user = userEvent.setup()
    renderApp('/projects/p1')
    await user.click(screen.getByRole('button', { name: 'New work item' }))
    await user.click(screen.getByRole('radio', { name: 'Bug' }))
    await user.type(screen.getByLabelText('Title (required)'), 'Crash on empty name')
    await user.selectOptions(screen.getByLabelText('Priority'), 'High')
    await user.type(screen.getByLabelText('Description'), 'Steps in notes')
    await user.type(screen.getByLabelText('Criterion 1'), 'No crash')
    await user.click(screen.getByRole('button', { name: 'Add criterion' }))
    expect(screen.getByLabelText('Criterion 2')).toHaveFocus()
    await user.type(screen.getByLabelText('Criterion 2'), 'Shows an error')
    await user.click(screen.getByRole('button', { name: 'Add criterion' }))
    await user.click(screen.getByRole('button', { name: 'Create work item' }))

    const list = screen.getByRole('list')
    expect(within(list).getByRole('heading', { name: 'Bug Crash on empty name' })).toBeInTheDocument()
    expect(within(list).getByText(/High priority · Backlog · 2 acceptance criteria/)).toBeInTheDocument()
    expect(storedItems()).toMatchObject([
      {
        projectId: 'p1',
        type: 'bug',
        title: 'Crash on empty name',
        priority: 'high',
        description: 'Steps in notes',
        acceptanceCriteria: ['No crash', 'Shows an error'],
        status: 'backlog',
        sprintId: null,
      },
    ])
  })

  it('requires a title and saves nothing without one', async () => {
    const user = userEvent.setup()
    renderApp('/projects/p1')
    await user.click(screen.getByRole('button', { name: 'New work item' }))
    await user.click(screen.getByRole('button', { name: 'Create work item' }))
    const title = screen.getByLabelText('Title (required)')
    expect(title).toHaveAttribute('aria-invalid', 'true')
    expect(title).toHaveAccessibleDescription('Title is required.')
    expect(title).toHaveFocus()
    expect(storedItems()).toEqual([])
  })

  it('removes an acceptance criterion before saving', async () => {
    const user = userEvent.setup()
    renderApp('/projects/p1')
    await user.click(screen.getByRole('button', { name: 'New work item' }))
    await user.type(screen.getByLabelText('Title (required)'), 'Story')
    await user.type(screen.getByLabelText('Criterion 1'), 'Keep')
    await user.click(screen.getByRole('button', { name: 'Add criterion' }))
    await user.type(screen.getByLabelText('Criterion 2'), 'Drop')
    await user.click(screen.getByRole('button', { name: 'Remove criterion 2' }))
    await user.click(screen.getByRole('button', { name: 'Create work item' }))
    expect(storedItems()[0].acceptanceCriteria).toEqual(['Keep'])
  })

  it('edits an item in place and keeps it after a reload', async () => {
    const user = userEvent.setup()
    const { unmount } = renderApp('/projects/p1')
    await user.click(screen.getByRole('button', { name: 'New work item' }))
    await user.type(screen.getByLabelText('Title (required)'), 'Old title')
    await user.click(screen.getByRole('button', { name: 'Create work item' }))

    await user.click(screen.getByRole('button', { name: 'Edit Old title' }))
    const title = screen.getByLabelText('Title (required)')
    await user.clear(title)
    await user.type(title, 'New title')
    await user.selectOptions(screen.getByLabelText('Priority'), 'Low')
    await user.click(screen.getByRole('button', { name: 'Save changes' }))

    unmount()
    renderApp('/projects/p1')
    expect(screen.getByRole('heading', { name: 'Story New title' })).toBeInTheDocument()
    expect(screen.queryByText(/Old title/)).not.toBeInTheDocument()
    expect(storedItems()).toHaveLength(1)
    expect(storedItems()[0]).toMatchObject({ title: 'New title', priority: 'low' })
  })

  it("shows only the current project's items", async () => {
    const user = userEvent.setup()
    renderApp('/projects/p1')
    await user.click(screen.getByRole('button', { name: 'New work item' }))
    await user.type(screen.getByLabelText('Title (required)'), 'Only in p1')
    await user.click(screen.getByRole('button', { name: 'Create work item' }))
    await user.click(screen.getByRole('link', { name: 'All projects' }))
    await user.click(screen.getByRole('link', { name: 'Other' }))
    expect(screen.getByText('No work items yet.')).toBeInTheDocument()
  })
})
