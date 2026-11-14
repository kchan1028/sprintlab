import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createProject } from '../../domain/project'
import { createSprint } from '../../domain/sprint'
import type { AppData } from '../../domain/types'
import { createWorkItem, emptyWorkItemInput } from '../../domain/workItem'
import { emptyData, loadData, saveData } from '../../repository/storage'
import { axeViolations } from '../../test/axe'
import { renderApp } from '../../test/renderApp'

const p1 = createProject({ name: 'Bike calculator', description: '' }, 'p1', 'T')
const p2 = createProject({ name: 'Keep me', description: '' }, 'p2', 'T')
const current: AppData = {
  ...emptyData(),
  projects: [p1, p2],
  workItems: [
    createWorkItem({ ...emptyWorkItemInput(), title: 'One' }, 'p1', 'w1', 'T'),
    createWorkItem({ ...emptyWorkItemInput(), title: 'Two' }, 'p1', 'w2', 'T'),
    createWorkItem({ ...emptyWorkItemInput(), title: 'Other' }, 'p2', 'w3', 'T'),
  ],
  sprints: [createSprint({ name: 'S', goal: 'G', startDate: '2026-11-16', endDate: '2026-11-22' }, 'p1', 's1')],
}
const backup: AppData = {
  ...emptyData(),
  projects: [createProject({ name: 'From backup', description: '' }, 'b1', 'T')],
}

function stored() {
  const result = loadData()
  if (!result.ok) throw new Error('expected readable data')
  return result.data
}

const file = (data: unknown, name = 'backup.json') =>
  new File([typeof data === 'string' ? data : JSON.stringify(data)], name, { type: 'application/json' })

beforeEach(() => {
  localStorage.clear()
  saveData(current)
  vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test')
  vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('Deleting a project', () => {
  it('explains what will be deleted and changes nothing on cancel', async () => {
    const user = userEvent.setup()
    renderApp('/projects/p1')
    await user.click(screen.getByRole('button', { name: 'Delete project' }))
    expect(screen.getByRole('region', { name: 'Delete “Bike calculator”?' })).toHaveTextContent(
      'its 2 work items and 1 sprint',
    )
    expect(screen.getByRole('button', { name: 'Cancel' })).toHaveFocus()
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(screen.getByRole('button', { name: 'Delete project' })).toHaveFocus()
    expect(stored()).toEqual(current)
  })

  it('deletes the project with its items and sprints, then confirms on the projects page', async () => {
    const user = userEvent.setup()
    renderApp('/projects/p1')
    await user.click(screen.getByRole('button', { name: 'Delete project' }))
    await user.click(screen.getByRole('button', { name: 'Delete project' }))

    expect(stored()).toEqual({ ...current, projects: [p2], workItems: [current.workItems[2]], sprints: [] })
    const status = screen.getByRole('status')
    expect(status).toHaveTextContent('Deleted “Bike calculator” with 2 work items and 1 sprint.')
    expect(status).toHaveFocus()
    expect(screen.getByRole('link', { name: 'Keep me' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Bike calculator' })).not.toBeInTheDocument()
  })

  it('offers a download before deleting', async () => {
    const user = userEvent.setup()
    renderApp('/projects/p1')
    await user.click(screen.getByRole('button', { name: 'Delete project' }))
    await user.click(screen.getByRole('button', { name: 'Download a copy first' }))
    const blob = vi.mocked(URL.createObjectURL).mock.calls[0][0] as Blob
    expect(JSON.parse(await blob.text())).toEqual(current)
  })
})

describe('Export', () => {
  it('downloads all data as JSON and says what was saved', async () => {
    renderApp('/data')
    await userEvent.click(screen.getByRole('button', { name: 'Download all data' }))
    const blob = vi.mocked(URL.createObjectURL).mock.calls[0][0] as Blob
    expect(JSON.parse(await blob.text())).toEqual(current)
    expect(screen.getByRole('status')).toHaveTextContent(/Downloaded sprintlab-backup-\d{4}-\d{2}-\d{2}\.json with 2 projects, 3 work items and 1 sprint\./)
  })
})

describe('Import', () => {
  it('previews a valid backup and replaces data only after confirmation', async () => {
    const user = userEvent.setup()
    renderApp('/data')
    await user.upload(screen.getByLabelText('Backup file (.json)'), file(backup, 'old-backup.json'))

    const panel = await screen.findByRole('region', { name: 'Replace your data with old-backup.json?' })
    expect(panel).toHaveTextContent('The file contains 1 project, 0 work items and 0 sprints.')
    expect(panel).toHaveTextContent('what’s here now (2 projects, 3 work items and 1 sprint)')
    expect(stored()).toEqual(current)

    await user.click(screen.getByRole('button', { name: 'Replace my data' }))
    expect(stored()).toEqual(backup)
    await waitFor(() => expect(screen.getByRole('status')).toHaveFocus())
    expect(screen.getByRole('status')).toHaveTextContent('Imported old-backup.json: 1 project, 0 work items and 0 sprints.')
  })

  it('changes nothing when the import is cancelled', async () => {
    const user = userEvent.setup()
    renderApp('/data')
    await user.upload(screen.getByLabelText('Backup file (.json)'), file(backup))
    await user.click(await screen.findByRole('button', { name: 'Cancel' }))
    expect(stored()).toEqual(current)
    expect(screen.getByLabelText('Backup file (.json)')).toHaveFocus()
  })

  it.each([
    ['not JSON', 'oops', /isn’t a valid SprintLab backup/],
    ['the wrong kind of JSON', { hello: 'world' }, /isn’t a valid SprintLab backup/],
    ['a newer version', { ...backup, schemaVersion: 99 }, /newer version/],
    ['a dangling reference', { ...backup, workItems: [{ ...current.workItems[0], projectId: 'gone' }] }, /inconsistent/],
  ])('rejects %s with a clear message and leaves data unchanged', async (_label, content, message) => {
    const user = userEvent.setup()
    renderApp('/data')
    await user.upload(screen.getByLabelText('Backup file (.json)'), file(content, 'bad.json'))
    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('bad.json wasn’t imported.')
    expect(alert).toHaveTextContent(message)
    expect(alert).toHaveTextContent('Your current data hasn’t changed.')
    expect(screen.queryByRole('button', { name: 'Replace my data' })).not.toBeInTheDocument()
    expect(stored()).toEqual(current)
  })

  it('refuses an oversized file without reading it', async () => {
    const user = userEvent.setup()
    renderApp('/data')
    const big = file(backup, 'huge.json')
    Object.defineProperty(big, 'size', { value: 6 * 1024 * 1024 })
    const read = vi.spyOn(big, 'text')
    await user.upload(screen.getByLabelText('Backup file (.json)'), big)
    expect(await screen.findByRole('alert')).toHaveTextContent('huge.json wasn’t imported. This file is larger than 5 MB')
    expect(read).not.toHaveBeenCalled()
    expect(stored()).toEqual(current)
  })

  it('round-trips: an exported file imports back to the same data', async () => {
    const user = userEvent.setup()
    renderApp('/data')
    await user.click(screen.getByRole('button', { name: 'Download all data' }))
    const exported = await (vi.mocked(URL.createObjectURL).mock.calls[0][0] as Blob).text()
    saveData(emptyData())
    await user.upload(screen.getByLabelText('Backup file (.json)'), file(exported))
    await user.click(await screen.findByRole('button', { name: 'Replace my data' }))
    expect(stored()).toEqual(current)
  })
})

describe('accessibility of the new screens', () => {
  it('data page, import confirmation and delete panel have no axe violations', async () => {
    const user = userEvent.setup()
    const { unmount } = renderApp('/data')
    expect(await axeViolations()).toEqual([])
    await user.upload(screen.getByLabelText('Backup file (.json)'), file(backup))
    await screen.findByRole('button', { name: 'Replace my data' })
    expect(await axeViolations()).toEqual([])
    unmount()
    renderApp('/projects/p1')
    await user.click(screen.getByRole('button', { name: 'Delete project' }))
    expect(await axeViolations()).toEqual([])
  })
})
