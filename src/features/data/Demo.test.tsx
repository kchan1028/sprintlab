import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { createProject } from '../../domain/project'
import { emptyData, loadData, saveData } from '../../repository/storage'
import { renderApp } from '../../test/renderApp'

function stored() {
  const result = loadData()
  if (!result.ok) throw new Error('expected readable data')
  return result.data
}

beforeEach(() => {
  localStorage.clear()
})

describe('Demo data', () => {
  it('can be added from the empty projects list', async () => {
    renderApp('/')
    await userEvent.click(screen.getByRole('button', { name: 'add a demo project' }))
    expect(screen.getByRole('link', { name: 'SprintLab (demo)' })).toBeInTheDocument()
    expect(stored()).toMatchObject({ projects: [{ name: 'SprintLab (demo)' }] })
    expect(stored().sprints).toHaveLength(4)
  })

  it('is added next to existing projects from the data page', async () => {
    saveData({ ...emptyData(), projects: [createProject({ name: 'Mine', description: '' }, 'p1', 'T')] })
    renderApp('/data')
    await userEvent.click(screen.getByRole('button', { name: 'Add demo project' }))
    expect(screen.getByRole('status')).toHaveTextContent('Added the demo project “SprintLab (demo)”.')
    expect(stored().projects.map((p) => p.name)).toEqual(['Mine', 'SprintLab (demo)'])
  })

  it('opens with a populated board and sprint history', async () => {
    renderApp('/')
    await userEvent.click(screen.getByRole('button', { name: 'add a demo project' }))
    await userEvent.click(screen.getByRole('link', { name: 'SprintLab (demo)' }))
    expect(screen.getByRole('heading', { level: 3, name: /^Sprint 3 Active/ })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: /^Done \(\d+\)/ })).toBeInTheDocument()
    expect(screen.getAllByText('Edit review and retro')).toHaveLength(2)
  })
})
