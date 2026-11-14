import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { createProject } from '../../domain/project'
import { createSprint } from '../../domain/sprint'
import type { Sprint, Status, WorkItem } from '../../domain/types'
import { createWorkItem, emptyWorkItemInput } from '../../domain/workItem'
import { emptyData, loadData, saveData } from '../../repository/storage'
import { renderApp } from '../../test/renderApp'

const project = createProject({ name: 'Bike calculator', description: '' }, 'p1', 'T0')
const sprint = (id: string, name: string, state: Sprint['state'], startDate: string): Sprint => ({
  ...createSprint({ name, goal: `Goal ${name}`, startDate, endDate: startDate }, 'p1', id),
  state,
})
const item = (id: string, title: string, sprintId: string | null, status: Status): WorkItem => ({
  ...createWorkItem({ ...emptyWorkItemInput(), title }, 'p1', id, 'T1'),
  sprintId,
  status,
})

function stored() {
  const result = loadData()
  if (!result.ok) throw new Error('expected readable data')
  return result.data
}

const row = (name: string) => screen.getByRole('heading', { level: 3, name: new RegExp(`^${name} `) }).closest('li')!

function seed(withNext: boolean) {
  saveData({
    ...emptyData(),
    projects: [project],
    sprints: [
      sprint('s1', 'Sprint 1', 'active', '2026-11-16'),
      ...(withNext ? [sprint('s2', 'Sprint 2', 'planned', '2026-11-23')] : []),
    ],
    workItems: [
      item('w1', 'Shipped', 's1', 'done'),
      item('w2', 'Half done', 's1', 'in_progress'),
      item('w3', 'Waiting', 's1', 'review'),
    ],
  })
}

beforeEach(() => {
  localStorage.clear()
})

describe('Completing a sprint', () => {
  it('summarises done and unfinished work before completing', async () => {
    seed(true)
    renderApp('/projects/p1')
    await userEvent.click(screen.getByRole('button', { name: 'Complete Sprint 1' }))
    const panel = screen.getByRole('form', { name: 'Complete Sprint 1?' })
    expect(panel).toHaveTextContent('1 done · 2 unfinished items.')
    expect(within(panel).getByRole('radio', { name: 'Return to the product backlog (no sprint)' })).toBeChecked()
    expect(within(panel).getByRole('radio', { name: 'Move to Sprint 2' })).not.toBeChecked()
  })

  it('returns unfinished items to the product backlog, keeping their status', async () => {
    seed(true)
    renderApp('/projects/p1')
    await userEvent.click(screen.getByRole('button', { name: 'Complete Sprint 1' }))
    await userEvent.click(screen.getByRole('button', { name: 'Complete sprint' }))

    const data = stored()
    expect(data.sprints.find((s) => s.id === 's1')?.state).toBe('completed')
    expect(data.workItems.map((w) => [w.id, w.sprintId, w.status])).toEqual([
      ['w1', 's1', 'done'],
      ['w2', null, 'in_progress'],
      ['w3', null, 'review'],
    ])
    const status = screen.getByRole('status')
    expect(status).toHaveTextContent('Sprint 1 completed. 2 unfinished items moved to the product backlog.')
    await waitFor(() => expect(status).toHaveFocus())
  })

  it('moves unfinished items to the next planned sprint when chosen', async () => {
    seed(true)
    renderApp('/projects/p1')
    await userEvent.click(screen.getByRole('button', { name: 'Complete Sprint 1' }))
    await userEvent.click(screen.getByRole('radio', { name: 'Move to Sprint 2' }))
    await userEvent.click(screen.getByRole('button', { name: 'Complete sprint' }))
    expect(stored().workItems.map((w) => w.sprintId)).toEqual(['s1', 's2', 's2'])
    expect(screen.getByRole('status')).toHaveTextContent('2 unfinished items moved to Sprint 2.')
  })

  it('explains how to carry work over when there is no planned sprint', async () => {
    seed(false)
    renderApp('/projects/p1')
    await userEvent.click(screen.getByRole('button', { name: 'Complete Sprint 1' }))
    expect(screen.queryByRole('radio', { name: /Move to/ })).not.toBeInTheDocument()
    expect(screen.getByText('To carry work into the next sprint, create a planned sprint first.')).toBeInTheDocument()
  })

  it('changes nothing when cancelled', async () => {
    seed(true)
    renderApp('/projects/p1')
    await userEvent.click(screen.getByRole('button', { name: 'Complete Sprint 1' }))
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(stored().sprints.find((s) => s.id === 's1')?.state).toBe('active')
  })

  it('makes a completed sprint read-only except review and retro', async () => {
    seed(true)
    renderApp('/projects/p1')
    await userEvent.click(screen.getByRole('button', { name: 'Complete Sprint 1' }))
    await userEvent.click(screen.getByRole('button', { name: 'Complete sprint' }))
    const completed = row('Sprint 1')
    expect(within(completed).getByText('Completed')).toBeInTheDocument()
    expect(within(completed).getAllByRole('button').map((b) => b.textContent)).toEqual(['Add review and retro'])
  })

  it('lets the next sprint start once the active one is completed', async () => {
    seed(true)
    renderApp('/projects/p1')
    await userEvent.click(screen.getByRole('button', { name: 'Complete Sprint 1' }))
    await userEvent.click(screen.getByRole('button', { name: 'Complete sprint' }))
    await userEvent.click(screen.getByRole('button', { name: 'Start Sprint 2' }))
    expect(stored().sprints.find((s) => s.id === 's2')?.state).toBe('active')
  })
})

describe('Sprint review and retro', () => {
  it('records review and retro on a completed sprint and shows them', async () => {
    const user = userEvent.setup()
    saveData({ ...emptyData(), projects: [project], sprints: [sprint('s0', 'Sprint 0', 'completed', '2026-11-09')] })
    renderApp('/projects/p1')

    await user.click(screen.getByRole('button', { name: 'Review and retro for Sprint 0' }))
    await user.type(screen.getByLabelText('What was delivered?'), 'Board shipped')
    await user.type(screen.getByLabelText('What went well?'), 'Mutation checks')
    await user.type(screen.getByLabelText('What should improve?'), 'Set the goal first')
    await user.type(screen.getByLabelText('Actions for next sprint'), 'Write the goal on day one')
    await user.click(screen.getByRole('button', { name: 'Save review and retro' }))

    expect(stored().sprints[0]).toMatchObject({
      state: 'completed',
      review: 'Board shipped',
      retro: { wentWell: 'Mutation checks', toImprove: 'Set the goal first', actions: 'Write the goal on day one' },
    })
    const notes = within(row('Sprint 0'))
    expect(notes.getByText('Board shipped')).toBeInTheDocument()
    expect(notes.getByText('Write the goal on day one')).toBeInTheDocument()
    expect(notes.getByRole('button', { name: 'Review and retro for Sprint 0' })).toHaveTextContent('Edit review and retro')
  })

  it('prefills existing notes when editing and keeps them on cancel', async () => {
    const user = userEvent.setup()
    const s0 = { ...sprint('s0', 'Sprint 0', 'completed', '2026-11-09'), review: 'Old review' }
    saveData({ ...emptyData(), projects: [project], sprints: [s0] })
    renderApp('/projects/p1')
    await user.click(screen.getByRole('button', { name: 'Review and retro for Sprint 0' }))
    const review = screen.getByLabelText('What was delivered?')
    expect(review).toHaveValue('Old review')
    await user.clear(review)
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(stored().sprints[0].review).toBe('Old review')
  })

  it('is not offered on planned sprints', () => {
    saveData({ ...emptyData(), projects: [project], sprints: [sprint('s2', 'Sprint 2', 'planned', '2026-11-23')] })
    renderApp('/projects/p1')
    expect(screen.queryByRole('button', { name: 'Review and retro for Sprint 2' })).not.toBeInTheDocument()
  })
})
