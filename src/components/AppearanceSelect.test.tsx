import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import { APPEARANCE_KEY, readAppearance } from '../repository/appearance'
import { STORAGE_KEY, emptyData, saveData } from '../repository/storage'
import { renderApp } from '../test/renderApp'

beforeEach(() => localStorage.clear())

/** The scheme CSS follows: index.html and AppearanceSelect write it to <meta name="color-scheme">. */
function expectScheme(scheme: 'light dark' | 'light' | 'dark') {
  expect(document.querySelector('meta[name="color-scheme"]')).toHaveAttribute('content', scheme)
}
afterEach(() => vi.restoreAllMocks())

describe('Appearance', () => {
  it('defaults to system and rejects an invalid stored value', () => {
    localStorage.setItem(APPEARANCE_KEY, 'invalid')
    renderApp()
    expect(screen.getByLabelText('Appearance')).toHaveValue('system')
    expectScheme('light dark')
  })

  it('remembers light, dark, and system without modifying saved project data', async () => {
    const user = userEvent.setup()
    saveData(emptyData())
    const saved = localStorage.getItem(STORAGE_KEY)
    const first = renderApp()
    await user.selectOptions(screen.getByLabelText('Appearance'), 'dark')
    expectScheme('dark')
    expect(localStorage.getItem(APPEARANCE_KEY)).toBe('dark')
    expect(localStorage.getItem(STORAGE_KEY)).toBe(saved)
    first.unmount()
    renderApp()
    expect(screen.getByLabelText('Appearance')).toHaveValue('dark')
    await user.selectOptions(screen.getByLabelText('Appearance'), 'light')
    expectScheme('light')
    await user.selectOptions(screen.getByLabelText('Appearance'), 'system')
    expectScheme('light dark')
    // Back to System stores nothing, so the page follows the OS again.
    expect(localStorage.getItem(APPEARANCE_KEY)).toBeNull()
  })

  it('applies the theme for this visit when the preference cannot be saved', async () => {
    renderApp()
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('blocked') })
    await userEvent.selectOptions(screen.getByLabelText('Appearance'), 'dark')
    expectScheme('dark')
    expect(screen.getByRole('status')).toHaveTextContent('Applied for this visit')
    expect(screen.getByRole('button', { name: 'New project' })).toBeEnabled()
  })

  it('handles blocked reads and keeps appearance available on the recovery screen', async () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked') })
    expect(readAppearance()).toBe('system')
    renderApp()
    expect(screen.getByRole('heading', { name: "SprintLab can't access browser storage" })).toBeInTheDocument()
    await userEvent.selectOptions(screen.getByLabelText('Appearance'), 'dark')
    expectScheme('dark')
  })

  it('follows a change made in another tab', () => {
    renderApp()
    localStorage.setItem(APPEARANCE_KEY, 'dark')
    act(() => window.dispatchEvent(new StorageEvent('storage', { key: APPEARANCE_KEY, newValue: 'dark' })))
    expect(screen.getByLabelText('Appearance')).toHaveValue('dark')
    expectScheme('dark')
  })
})
