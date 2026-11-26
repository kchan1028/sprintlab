import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderApp } from './test/renderApp'
import { STORAGE_KEY } from './repository/storage'

beforeEach(() => {
  localStorage.clear()
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('App', () => {
  it('renders the app heading', () => {
    renderApp()
    expect(screen.getByRole('heading', { level: 1, name: 'SprintLab' })).toBeInTheDocument()
  })

  it('shows the empty state when no data is stored', () => {
    renderApp()
    expect(screen.getByText('No projects yet.')).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('shows a recoverable error instead of crashing when stored data is corrupt', () => {
    localStorage.setItem(STORAGE_KEY, '{not json')
    renderApp()
    expect(screen.getByRole('alert')).toHaveTextContent("Your saved data couldn't be read")
    expect(screen.getByRole('button', { name: 'Download a copy' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reset data' })).toBeInTheDocument()
  })

  it('keeps the data when the user cancels a reset', async () => {
    localStorage.setItem(STORAGE_KEY, '{not json')
    renderApp()
    await userEvent.click(screen.getByRole('button', { name: 'Reset data' }))
    const dialog = screen.getByRole('dialog', { name: 'Reset all SprintLab data?' })
    await userEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }))
    expect(dialog).not.toHaveAttribute('open')
    expect(localStorage.getItem(STORAGE_KEY)).toBe('{not json')
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('clears the data and shows the empty state after a confirmed reset', async () => {
    localStorage.setItem(STORAGE_KEY, '{not json')
    renderApp()
    await userEvent.click(screen.getByRole('button', { name: 'Reset data' }))
    await userEvent.click(screen.getByRole('button', { name: 'Reset everything' }))
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.getByText('No projects yet.')).toBeInTheDocument()
  })
})
