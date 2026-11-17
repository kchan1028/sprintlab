import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import { APPEARANCE_KEY, readAppearance } from '../repository/appearance'
import { STORAGE_KEY, emptyData, saveData } from '../repository/storage'
import { renderApp } from '../test/renderApp'

beforeEach(() => localStorage.clear())
afterEach(() => vi.restoreAllMocks())

describe('Appearance', () => {
  it('defaults to system and rejects an invalid stored value', () => {
    localStorage.setItem(APPEARANCE_KEY, 'invalid')
    renderApp()
    expect(screen.getByLabelText('Appearance')).toHaveValue('system')
    expect(document.documentElement).toHaveAttribute('data-appearance', 'system')
  })

  it('remembers light, dark, and system without modifying saved project data', async () => {
    const user = userEvent.setup()
    saveData(emptyData())
    const saved = localStorage.getItem(STORAGE_KEY)
    const first = renderApp()
    await user.selectOptions(screen.getByLabelText('Appearance'), 'dark')
    expect(document.documentElement).toHaveAttribute('data-appearance', 'dark')
    expect(localStorage.getItem(APPEARANCE_KEY)).toBe('dark')
    expect(localStorage.getItem(STORAGE_KEY)).toBe(saved)
    first.unmount()
    renderApp()
    expect(screen.getByLabelText('Appearance')).toHaveValue('dark')
    await user.selectOptions(screen.getByLabelText('Appearance'), 'light')
    expect(document.documentElement).toHaveAttribute('data-appearance', 'light')
    await user.selectOptions(screen.getByLabelText('Appearance'), 'system')
    expect(document.documentElement).toHaveAttribute('data-appearance', 'system')
    expect(localStorage.getItem(APPEARANCE_KEY)).toBe('system')
  })

  it('applies the theme for this visit when the preference cannot be saved', async () => {
    renderApp()
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('blocked') })
    await userEvent.selectOptions(screen.getByLabelText('Appearance'), 'dark')
    expect(document.documentElement).toHaveAttribute('data-appearance', 'dark')
    expect(screen.getByRole('status')).toHaveTextContent('Applied for this visit')
    expect(screen.getByRole('button', { name: 'New project' })).toBeEnabled()
  })

  it('handles blocked reads and keeps appearance available on the recovery screen', async () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked') })
    expect(readAppearance()).toBe('system')
    renderApp()
    expect(screen.getByRole('heading', { name: "SprintLab can't access browser storage" })).toBeInTheDocument()
    await userEvent.selectOptions(screen.getByLabelText('Appearance'), 'dark')
    expect(document.documentElement).toHaveAttribute('data-appearance', 'dark')
  })
})
