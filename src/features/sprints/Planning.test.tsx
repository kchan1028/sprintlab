import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createProject } from '../../domain/project'
import { createSprint } from '../../domain/sprint'
import type { Sprint, WorkItem } from '../../domain/types'
import { createWorkItem, emptyWorkItemInput } from '../../domain/workItem'
import { emptyData, loadData, saveData } from '../../repository/storage'
import { renderApp } from '../../test/renderApp'

const project = createProject({ name: 'Bike calculator', description: '' }, 'p1', 'T0')
const sprint = (id: string, name: string, state: Sprint['state']): Sprint => ({
  ...createSprint({ name, goal: 'G', startDate: '2026-11-16', endDate: '2026-11-22' }, 'p1', id),
  state,
})
const item = (id: string, title: string, sprintId: string | null = null): WorkItem => ({
  ...createWorkItem({ ...emptyWorkItemInput(), title }, 'p1', id, 'T1'),
  sprintId,
})

function stored(id: string) {
  const result = loadData()
  if (!result.ok) throw new Error('expected readable data')
  return result.data.workItems.find((w) => w.id === id)
}

const board = () => screen.getByRole('region', { name: 'Board' })
const cardTitles = () =>
  within(board())
    .queryAllByRole('heading', { level: 4 })
    .map((h) => h.textContent?.replace(/^(Story|Bug) /, ''))

beforeEach(() => {
  localStorage.clear()
  saveData({
    ...emptyData(),
    projects: [project],
    sprints: [sprint('s1', 'Sprint 1', 'active'), sprint('s2', 'Sprint 2', 'planned'), sprint('s0', 'Sprint 0', 'completed')],
    workItems: [item('w1', 'Export data'), item('w2', 'Fix crash', 's1'), item('w3', 'Old work', 's0')],
  })
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('Sprint planning', () => {
  it('offers only planned and active sprints, plus No sprint', () => {
    renderApp('/projects/p1?sprint=all')
    const options = within(screen.getByLabelText('Sprint for Export data'))
      .getAllByRole('option')
      .map((o) => o.textContent)
    expect(options).toEqual(['No sprint', 'Sprint 1 (Active)', 'Sprint 2 (Planned)'])
  })

  it('assigns an item to a sprint and saves it', async () => {
    renderApp('/projects/p1?sprint=all')
    await userEvent.selectOptions(screen.getByLabelText('Sprint for Export data'), 'Sprint 2 (Planned)')
    expect(stored('w1')?.sprintId).toBe('s2')
    expect(within(screen.getByRole('region', { name: 'Upcoming sprints' })).getByRole('heading', { name: 'Sprint 2 Planned' }).closest('li')).toHaveTextContent(
      '1 item',
    )
  })

  it('removes an item from a sprint', async () => {
    renderApp('/projects/p1?sprint=all')
    await userEvent.selectOptions(screen.getByLabelText('Sprint for Fix crash'), 'No sprint')
    expect(stored('w2')?.sprintId).toBeNull()
  })

  it('shows a completed sprint on its items but does not let anything be reassigned to it', () => {
    renderApp('/projects/p1?sprint=all')
    const select = screen.getByLabelText('Sprint for Old work')
    expect(select).toHaveDisplayValue('Sprint 0 (Completed)')
    expect(within(select).getByRole('option', { name: 'Sprint 0 (Completed)' })).toBeDisabled()
    expect(
      within(screen.getByLabelText('Sprint for Export data')).queryByRole('option', { name: /Sprint 0/ }),
    ).not.toBeInTheDocument()
  })

  it('filters the board by sprint and by no sprint', async () => {
    const user = userEvent.setup()
    renderApp('/projects/p1?sprint=all')
    expect(cardTitles()).toEqual(['Export data', 'Fix crash', 'Old work'])

    await user.selectOptions(screen.getByLabelText('Show'), 'Sprint 1 (Active)')
    expect(cardTitles()).toEqual(['Fix crash'])
    expect(screen.getByRole('status')).toHaveTextContent('Showing 1 of 3 items.')

    await user.selectOptions(screen.getByLabelText('Show'), 'No sprint (product backlog)')
    expect(cardTitles()).toEqual(['Export data'])

    await user.click(screen.getByRole('button', { name: 'Show all' }))
    expect(cardTitles()).toHaveLength(3)
  })

  it('reads the filter from the URL so it survives a reload', () => {
    renderApp('/projects/p1?sprint=s1')
    expect(screen.getByLabelText('Show')).toHaveDisplayValue('Sprint 1 (Active)')
    expect(cardTitles()).toEqual(['Fix crash'])
  })

  it('falls back to all items for an unknown sprint in the URL', () => {
    renderApp('/projects/p1?sprint=deleted')
    expect(screen.getByLabelText('Show')).toHaveDisplayValue('All items')
    expect(cardTitles()).toHaveLength(3)
  })

  it('moves focus to the filter when an assigned item leaves the filtered view', async () => {
    renderApp('/projects/p1?sprint=s1')
    await userEvent.selectOptions(screen.getByLabelText('Sprint for Fix crash'), 'No sprint')
    expect(cardTitles()).toEqual([])
    expect(screen.getByLabelText('Show')).toHaveFocus()
  })
})


describe('Focused workspace', () => {
  it('opens on the active sprint and keeps completed history collapsed after the board', () => {
    renderApp('/projects/p1')
    expect(cardTitles()).toEqual(['Fix crash'])
    expect(screen.getByLabelText('Show')).toHaveDisplayValue('Sprint 1 (Active)')
    const current = screen.getByRole('region', { name: 'Sprints' })
    const upcoming = screen.getByRole('region', { name: 'Upcoming sprints' })
    expect(current.compareDocumentPosition(board()) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(board().compareDocumentPosition(upcoming) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.getByText('Completed sprints (1)').closest('details')).not.toHaveAttribute('open')
  })

  it('respects explicit All items on entry and after a reload', async () => {
    const first = renderApp('/projects/p1')
    await userEvent.click(screen.getByRole('button', { name: 'Show all' }))
    expect(cardTitles()).toHaveLength(3)
    first.unmount()
    renderApp('/projects/p1?sprint=all')
    expect(screen.getByLabelText('Show')).toHaveDisplayValue('All items')
    expect(cardTitles()).toHaveLength(3)
  })

  it('reveals a newly created unassigned item instead of losing it behind the active filter', async () => {
    const user = userEvent.setup()
    renderApp('/projects/p1')
    await user.click(screen.getByRole('button', { name: 'New work item' }))
    await user.type(screen.getByLabelText('Title (required)'), 'New idea')
    await user.click(screen.getByRole('button', { name: 'Create work item' }))
    expect(cardTitles()).toContain('New idea')
    expect(screen.getByLabelText('Show')).toHaveDisplayValue('No sprint (product backlog)')
    const result = loadData()
    expect(result.ok && result.data.workItems.find((work) => work.title === 'New idea')?.sprintId).toBeNull()
  })
})
