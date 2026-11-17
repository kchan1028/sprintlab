import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createProject } from '../domain/project'
import { createSprint } from '../domain/sprint'
import type { Sprint } from '../domain/types'
import { createWorkItem, emptyWorkItemInput } from '../domain/workItem'
import { STORAGE_KEY, emptyData, saveData } from '../repository/storage'
import { axeViolations } from '../test/axe'
import { renderApp } from '../test/renderApp'

const project = createProject({ name: 'Bike calculator', description: 'Gear ratios' }, 'p1', 'T0')
const sprint = (id: string, name: string, state: Sprint['state']): Sprint => ({
  ...createSprint({ name, goal: 'Goal', startDate: '2026-11-16', endDate: '2026-11-22' }, 'p1', id),
  state,
  review: state === 'completed' ? 'Shipped' : '',
})

function seedFull() {
  saveData({
    ...emptyData(),
    projects: [project],
    sprints: [sprint('s1', 'Sprint 1', 'active'), sprint('s2', 'Sprint 2', 'planned'), sprint('s0', 'Sprint 0', 'completed')],
    workItems: [
      { ...createWorkItem({ ...emptyWorkItemInput(), title: 'Export data', acceptanceCriteria: ['Works'] }, 'p1', 'w1', 'T1'), sprintId: 's1' },
      { ...createWorkItem({ ...emptyWorkItemInput(), type: 'bug', title: 'Crash' }, 'p1', 'w2', 'T1'), status: 'done' as const },
    ],
  })
}

beforeEach(() => {
  localStorage.clear()
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('axe checks (structure, names, roles; contrast is checked in a browser)', () => {
  it('the helper does report real problems (sanity check)', async () => {
    const box = document.createElement('div')
    box.innerHTML = '<input type="text"><button></button>'
    document.body.append(box)
    const violations = await axeViolations(box)
    box.remove()
    expect(violations.map((v) => v.split(' ')[0])).toEqual(expect.arrayContaining(['button-name', 'label']))
  })

  it('projects list, empty', async () => {
    renderApp('/')
    expect(await axeViolations()).toEqual([])
  })

  it('projects list with a project and the edit form open', async () => {
    seedFull()
    renderApp('/')
    await userEvent.click(screen.getByRole('button', { name: 'Edit Bike calculator' }))
    expect(await axeViolations()).toEqual([])
  })

  it('project page with sprints, board and filter', async () => {
    seedFull()
    renderApp('/projects/p1')
    expect(await axeViolations()).toEqual([])
  })

  it('work item form', async () => {
    seedFull()
    renderApp('/projects/p1')
    await userEvent.click(screen.getByRole('button', { name: 'New work item' }))
    expect(await axeViolations()).toEqual([])
  })

  it('sprint form, completion panel and review form', async () => {
    seedFull()
    renderApp('/projects/p1')
    await userEvent.click(screen.getByRole('button', { name: 'New sprint' }))
    expect(await axeViolations()).toEqual([])
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    await userEvent.click(screen.getByRole('button', { name: 'Complete Sprint 1' }))
    expect(await axeViolations()).toEqual([])
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    await userEvent.click(screen.getByRole('button', { name: /review and retro for Sprint 0$/i }))
    expect(await axeViolations()).toEqual([])
  })

  it('error screens', async () => {
    localStorage.setItem(STORAGE_KEY, '{oops')
    renderApp('/')
    expect(await axeViolations()).toEqual([])
  })

  it('not found pages', async () => {
    renderApp('/projects/missing')
    expect(await axeViolations()).toEqual([])
  })
})

describe('focus returns to the control that opened a form', () => {
  it('New project → Cancel and → Create', async () => {
    const user = userEvent.setup()
    renderApp('/')
    await user.click(screen.getByRole('button', { name: 'New project' }))
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(screen.getByRole('button', { name: 'New project' })).toHaveFocus()

    await user.click(screen.getByRole('button', { name: 'New project' }))
    await user.type(screen.getByLabelText('Name (required)'), 'Demo')
    await user.click(screen.getByRole('button', { name: 'Create project' }))
    expect(screen.getByRole('button', { name: 'New project' })).toHaveFocus()
  })

  it('Edit project → Save returns to that Edit button', async () => {
    const user = userEvent.setup()
    seedFull()
    renderApp('/')
    await user.click(screen.getByRole('button', { name: 'Edit Bike calculator' }))
    await user.click(screen.getByRole('button', { name: 'Save changes' }))
    expect(screen.getByRole('button', { name: 'Edit Bike calculator' })).toHaveFocus()
  })

  it('work item create and edit', async () => {
    const user = userEvent.setup()
    seedFull()
    renderApp('/projects/p1')
    await user.click(screen.getByRole('button', { name: 'New work item' }))
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(screen.getByRole('button', { name: 'New work item' })).toHaveFocus()

    await user.click(screen.getByRole('button', { name: 'Edit Export data' }))
    await user.click(screen.getByRole('button', { name: 'Save changes' }))
    expect(screen.getByRole('button', { name: 'Edit Export data' })).toHaveFocus()
  })

  it('sprint form and panels', async () => {
    const user = userEvent.setup()
    seedFull()
    renderApp('/projects/p1')
    await user.click(screen.getByRole('button', { name: 'New sprint' }))
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(screen.getByRole('button', { name: 'New sprint' })).toHaveFocus()

    await user.click(screen.getByRole('button', { name: 'Complete Sprint 1' }))
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(screen.getByRole('button', { name: 'Complete Sprint 1' })).toHaveFocus()

    await user.click(screen.getByRole('button', { name: /review and retro for Sprint 0$/i }))
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(screen.getByRole('button', { name: /review and retro for Sprint 0$/i })).toHaveFocus()
  })
})

describe('keyboard only', () => {
  it('creates a project and opens it without a mouse', async () => {
    const user = userEvent.setup()
    renderApp('/')
    await user.tab()
    expect(screen.getByRole('link', { name: 'Projects' })).toHaveFocus()
    await user.tab()
    expect(screen.getByRole('link', { name: 'Your data' })).toHaveFocus()
    await user.tab()
    expect(screen.getByLabelText('Appearance')).toHaveFocus()
    await user.tab()
    expect(screen.getByRole('button', { name: 'New project' })).toHaveFocus()
    await user.keyboard('{Enter}')
    expect(screen.getByLabelText('Name (required)')).toHaveFocus()
    await user.keyboard('Keyboard project{Enter}')
    expect(screen.getByRole('button', { name: 'New project' })).toHaveFocus()

    await user.tab()
    expect(screen.getByRole('link', { name: 'Keyboard project' })).toHaveFocus()
    await user.keyboard('{Enter}')
    expect(screen.getByRole('heading', { level: 2, name: 'Keyboard project' })).toBeInTheDocument()
  })
})

describe('page titles', () => {
  it('names each page in the browser tab', async () => {
    seedFull()
    const { unmount } = renderApp('/')
    await waitFor(() => expect(document.title).toBe('Projects · SprintLab'))
    unmount()
    const second = renderApp('/projects/p1')
    await waitFor(() => expect(document.title).toBe('Bike calculator · SprintLab'))
    second.unmount()
    const third = renderApp('/projects/missing')
    await waitFor(() => expect(document.title).toBe('Project not found · SprintLab'))
    third.unmount()
    renderApp('/nope')
    await waitFor(() => expect(document.title).toBe('Page not found · SprintLab'))
  })
})
