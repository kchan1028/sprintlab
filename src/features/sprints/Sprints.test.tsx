import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createProject } from '../../domain/project'
import { createSprint } from '../../domain/sprint'
import { emptyData, loadData, saveData } from '../../repository/storage'
import { renderApp } from '../../test/renderApp'

const p1 = createProject({ name: 'Bike calculator', description: '' }, 'p1', 'T0')
const p2 = createProject({ name: 'Other', description: '' }, 'p2', 'T0')

function storedSprints() {
  const result = loadData()
  if (!result.ok) throw new Error('expected readable data')
  return result.data.sprints
}

const sprintsRegion = () => screen.getByRole('region', { name: 'Sprints' })

async function fillDate(label: string, value: string) {
  const field = screen.getByLabelText(label)
  const user = userEvent.setup()
  await user.clear(field)
  if (value) await user.type(field, value)
}

beforeEach(() => {
  localStorage.clear()
  saveData({ ...emptyData(), projects: [p1, p2] })
})

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('Sprints', () => {
  it('shows an empty state before any sprint exists', () => {
    renderApp('/projects/p1')
    expect(within(sprintsRegion()).getByText(/No sprints yet/)).toBeInTheDocument()
  })

  it('prefills a name and a one-week range starting today', async () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(2026, 10, 16, 9, 0))
    renderApp('/projects/p1')
    await userEvent.click(screen.getByRole('button', { name: 'New sprint' }))
    expect(screen.getByLabelText('Name (required)')).toHaveValue('Sprint 1')
    expect(screen.getByLabelText('Start date')).toHaveValue('2026-11-16')
    expect(screen.getByLabelText('End date')).toHaveValue('2026-11-22')
  })

  it('creates a planned sprint with a goal and dates, and saves it', async () => {
    const user = userEvent.setup()
    renderApp('/projects/p1')
    await user.click(screen.getByRole('button', { name: 'New sprint' }))
    await user.type(screen.getByLabelText('Sprint goal (required)'), 'Board works end to end')
    await fillDate('Start date', '2026-11-16')
    await fillDate('End date', '2026-11-22')
    await user.click(screen.getByRole('button', { name: 'Create sprint' }))

    const region = screen.getByRole('region', { name: 'Upcoming sprints' })
    expect(within(region).getByRole('heading', { name: 'Sprint 1 Planned' })).toBeInTheDocument()
    expect(within(region).getByText('Nov 16 – Nov 22, 2026 · 0 items')).toBeInTheDocument()
    expect(within(region).getByText('Board works end to end')).toBeInTheDocument()
    expect(storedSprints()).toMatchObject([
      { projectId: 'p1', name: 'Sprint 1', goal: 'Board works end to end', state: 'planned' },
    ])
  })

  it('rejects an end date before the start date and saves nothing', async () => {
    const user = userEvent.setup()
    renderApp('/projects/p1')
    await user.click(screen.getByRole('button', { name: 'New sprint' }))
    await user.type(screen.getByLabelText('Sprint goal (required)'), 'Goal')
    await fillDate('Start date', '2026-11-16')
    await fillDate('End date', '2026-11-10')
    await user.click(screen.getByRole('button', { name: 'Create sprint' }))

    const end = screen.getByLabelText('End date')
    expect(end).toHaveAttribute('aria-invalid', 'true')
    expect(end).toHaveAccessibleDescription('End date cannot be before the start date.')
    expect(end).toHaveFocus()
    expect(storedSprints()).toEqual([])
  })

  it('requires a goal and focuses it', async () => {
    const user = userEvent.setup()
    renderApp('/projects/p1')
    await user.click(screen.getByRole('button', { name: 'New sprint' }))
    await user.click(screen.getByRole('button', { name: 'Create sprint' }))
    expect(screen.getByLabelText('Sprint goal (required)')).toHaveFocus()
    expect(storedSprints()).toEqual([])
  })

  it('starts a planned sprint', async () => {
    saveData({
      ...emptyData(),
      projects: [p1, p2],
      sprints: [createSprint({ name: 'Sprint 1', goal: 'G', startDate: '2026-11-16', endDate: '2026-11-22' }, 'p1', 's1')],
    })
    renderApp('/projects/p1')
    await userEvent.click(screen.getByRole('button', { name: 'Start Sprint 1' }))
    expect(within(sprintsRegion()).getByRole('heading', { name: 'Sprint 1 Active' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Start Sprint 1' })).not.toBeInTheDocument()
    expect(storedSprints()[0].state).toBe('active')
  })

  it('blocks starting a second sprint while one is active, with a clear message', async () => {
    const s1 = { ...createSprint({ name: 'Sprint 1', goal: 'G', startDate: '2026-11-16', endDate: '2026-11-22' }, 'p1', 's1'), state: 'active' as const }
    const s2 = createSprint({ name: 'Sprint 2', goal: 'G', startDate: '2026-11-23', endDate: '2026-11-29' }, 'p1', 's2')
    saveData({ ...emptyData(), projects: [p1, p2], sprints: [s1, s2] })
    renderApp('/projects/p1')

    expect(screen.getByRole('button', { name: 'Start Sprint 2' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Start Sprint 2' })).toHaveAccessibleDescription('“Sprint 1” is already active. Complete it before starting “Sprint 2”.')
    expect(storedSprints().map((s) => s.state)).toEqual(['active', 'planned'])
  })

  it('allows an active sprint in each project', async () => {
    const other = { ...createSprint({ name: 'Other sprint', goal: 'G', startDate: '2026-11-16', endDate: '2026-11-22' }, 'p2', 'o1'), state: 'active' as const }
    const s1 = createSprint({ name: 'Sprint 1', goal: 'G', startDate: '2026-11-16', endDate: '2026-11-22' }, 'p1', 's1')
    saveData({ ...emptyData(), projects: [p1, p2], sprints: [other, s1] })
    renderApp('/projects/p1')
    expect(screen.queryByText('Other sprint')).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Start Sprint 1' }))
    expect(within(sprintsRegion()).getByRole('heading', { name: 'Sprint 1 Active' })).toBeInTheDocument()
  })
})
