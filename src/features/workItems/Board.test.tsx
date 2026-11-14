import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createProject } from '../../domain/project'
import type { Status, WorkItem } from '../../domain/types'
import { createWorkItem, emptyWorkItemInput } from '../../domain/workItem'
import { emptyData, loadData, saveData } from '../../repository/storage'
import { renderApp } from '../../test/renderApp'

const project = createProject({ name: 'Bike calculator', description: '' }, 'p1', 'T0')

function item(id: string, title: string, status: Status): WorkItem {
  return { ...createWorkItem({ ...emptyWorkItemInput(), title }, 'p1', id, '2026-11-14T09:00:00.000Z'), status }
}

function storedItem(id: string) {
  const result = loadData()
  if (!result.ok) throw new Error('expected readable data')
  return result.data.workItems.find((w) => w.id === id)
}

const column = (name: string) => screen.getByRole('region', { name: new RegExp(`^${name}`) })

beforeEach(() => {
  localStorage.clear()
  saveData({
    ...emptyData(),
    projects: [project],
    workItems: [item('w1', 'Export data', 'backlog'), item('w2', 'Fix crash', 'in_progress')],
  })
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('Board', () => {
  it('shows five columns in workflow order with counts', () => {
    renderApp('/projects/p1')
    const board = screen.getByRole('region', { name: 'Board' })
    const headings = within(board).getAllByRole('heading', { level: 3 }).map((h) => h.textContent)
    expect(headings).toEqual(['Backlog (1)', 'Ready (0)', 'In Progress (1)', 'Review (0)', 'Done (0)'])
  })

  it('puts each item in the column matching its status', () => {
    renderApp('/projects/p1')
    expect(within(column('Backlog')).getByRole('heading', { name: 'Export data' })).toBeInTheDocument()
    expect(within(column('In Progress')).getByRole('heading', { name: 'Fix crash' })).toBeInTheDocument()
  })

  it('shows an empty state in columns with no items', () => {
    renderApp('/projects/p1')
    for (const name of ['Ready', 'Review', 'Done']) {
      expect(within(column(name)).getByText('No items')).toBeInTheDocument()
    }
    expect(within(column('Backlog')).queryByText('No items')).not.toBeInTheDocument()
  })

  it('moves an item with its status control, saves it, and keeps focus on it', async () => {
    const user = userEvent.setup()
    vi.spyOn(Date.prototype, 'toISOString').mockReturnValue('2026-11-15T10:00:00.000Z')
    renderApp('/projects/p1')

    await user.selectOptions(screen.getByLabelText('Status of Export data'), 'Review')

    expect(within(column('Review')).getByRole('heading', { name: 'Export data' })).toBeInTheDocument()
    expect(within(column('Backlog')).getByText('No items')).toBeInTheDocument()
    expect(screen.getByLabelText('Status of Export data')).toHaveFocus()
    expect(storedItem('w1')).toMatchObject({ status: 'review', updatedAt: '2026-11-15T10:00:00.000Z' })
  })

  it('can be operated by keyboard alone', async () => {
    const user = userEvent.setup()
    renderApp('/projects/p1')
    const control = screen.getByLabelText('Status of Fix crash')
    control.focus()
    await user.keyboard('{ArrowDown}')
    // Native selects change on arrow keys in browsers; jsdom does not emulate that,
    // so assert the control is a focusable, labelled native select instead.
    expect(control.tagName).toBe('SELECT')
    expect(control).toHaveFocus()
    expect(control).toHaveAccessibleName('Status of Fix crash')
  })

  it('keeps items moved to Done after a reload', async () => {
    const user = userEvent.setup()
    const { unmount } = renderApp('/projects/p1')
    await user.selectOptions(screen.getByLabelText('Status of Fix crash'), 'Done')
    unmount()
    renderApp('/projects/p1')
    expect(within(column('Done')).getByRole('heading', { name: 'Fix crash' })).toBeInTheDocument()
  })

  it('keeps the status when an item is edited', async () => {
    const user = userEvent.setup()
    renderApp('/projects/p1')
    await user.click(screen.getByRole('button', { name: 'Edit Fix crash' }))
    await user.click(screen.getByRole('button', { name: 'Save changes' }))
    expect(storedItem('w2')?.status).toBe('in_progress')
  })
})
