import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { createProject } from '../domain/project'
import { createSprint } from '../domain/sprint'
import type { WorkItem } from '../domain/types'
import { createWorkItem, emptyWorkItemInput } from '../domain/workItem'
import { emptyData, saveData } from '../repository/storage'
import { renderApp } from '../test/renderApp'

const first = createProject({ name: 'First project', description: '' }, 'p1', 'T0')
const second = createProject({ name: 'Second project', description: '' }, 'p2', 'T0')
const active = {
  ...createSprint({ name: 'Current goal', goal: 'Ship useful work', startDate: '2026-11-17', endDate: '2026-11-23' }, 'p1', 's1'),
  state: 'active' as const,
}
const past = { ...active, id: 's0', name: 'Previous goal', state: 'completed' as const }
const work = (id: string, title: string, status: WorkItem['status'], sprintId: string | null, projectId = 'p1') => ({
  ...createWorkItem({ ...emptyWorkItemInput(), title, acceptanceCriteria: ['First criterion', 'Second criterion', 'Third criterion'] }, projectId, id, 'T0'),
  status,
  sprintId,
})

beforeEach(() => {
  localStorage.clear()
  saveData({
    ...emptyData(), projects: [first, second], sprints: [active, past],
    workItems: [
      work('w1', 'Ready story', 'ready', 's1'),
      work('w2', 'Done story', 'done', 's1'),
      work('w3', 'Historical story', 'done', 's0'),
      work('w4', 'Unassigned idea', 'backlog', null),
      work('w5', 'Other project', 'done', null, 'p2'),
    ],
  })
})

describe('Visible work progress', () => {
  it('shows project-wide completion without counting work from another project', () => {
    renderApp()
    const progress = screen.getByRole('progressbar', { name: 'Project work for First project' })
    expect(progress).toHaveAttribute('value', '2')
    expect(progress).toHaveAttribute('max', '4')
    expect(progress).toHaveAttribute('aria-valuetext', '2 of 4 items done')
    expect(screen.getByRole('progressbar', { name: 'Project work for Second project' })).toHaveAttribute('value', '1')
    expect(screen.getByText('Current goal')).toBeInTheDocument()
  })

  it('counts assigned sprint items, not historical work, other projects, or criteria', () => {
    renderApp('/projects/p1?sprint=all')
    const progress = screen.getByRole('progressbar', { name: 'Sprint work for Current goal' })
    expect(progress).toHaveAttribute('value', '1')
    expect(progress).toHaveAttribute('max', '2')
    const breakdown = within(screen.getByLabelText('Assigned items by status'))
    expect(breakdown.getByText('Ready').nextElementSibling).toHaveTextContent('1')
    expect(breakdown.getByText('Done').nextElementSibling).toHaveTextContent('1')
  })

  it('updates when status changes and keeps the new progress after a reload', async () => {
    const firstView = renderApp('/projects/p1')
    await userEvent.selectOptions(screen.getByLabelText('Status of Ready story'), 'done')
    expect(screen.getByRole('progressbar', { name: 'Sprint work for Current goal' })).toHaveAttribute('value', '2')
    firstView.unmount()
    renderApp('/projects/p1')
    expect(screen.getByRole('progressbar', { name: 'Sprint work for Current goal' })).toHaveAttribute('aria-valuetext', '2 of 2 items done')
  })

  it('keeps the active sprint scope when the board shows unassigned work', () => {
    renderApp('/projects/p1?sprint=none')
    expect(screen.getByRole('heading', { name: 'Unassigned idea' })).toBeInTheDocument()
    expect(screen.getByRole('progressbar', { name: 'Sprint work for Current goal' })).toHaveAttribute('aria-valuetext', '1 of 2 items done')
  })

  it('shows an honest empty project state without an undefined progress ratio', () => {
    saveData({ ...emptyData(), projects: [first] })
    renderApp()
    expect(screen.getByText('No active sprint')).toBeInTheDocument()
    expect(screen.getByText('No work items yet')).toBeInTheDocument()
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
  })

  it('does not turn an empty active sprint into a fake percentage', () => {
    saveData({ ...emptyData(), projects: [first], sprints: [active] })
    renderApp('/projects/p1')
    expect(within(screen.getByRole('region', { name: 'Sprints' })).getByText('No work items yet')).toBeInTheDocument()
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
  })
})
