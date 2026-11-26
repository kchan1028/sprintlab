export type Appearance = 'system' | 'light' | 'dark'
export const APPEARANCE_KEY = 'sprintlab:appearance'

export function readAppearance(): Appearance {
  try {
    const value = window.localStorage.getItem(APPEARANCE_KEY)
    return value === 'light' || value === 'dark' ? value : 'system'
  } catch {
    return 'system'
  }
}

export function saveAppearance(value: Appearance): boolean {
  try {
    // System is the default: store nothing, so the page keeps following the OS.
    if (value === 'system') window.localStorage.removeItem(APPEARANCE_KEY)
    else window.localStorage.setItem(APPEARANCE_KEY, value)
    return true
  } catch {
    return false
  }
}
