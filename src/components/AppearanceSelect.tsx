import { useEffect, useState } from 'react'
import { applyAppearance } from '../lib/colorScheme'
import { APPEARANCE_KEY, readAppearance, saveAppearance, type Appearance } from '../repository/appearance'

export function AppearanceSelect() {
  const [appearance, setAppearance] = useState<Appearance>(readAppearance)
  const [remembered, setRemembered] = useState(true)

  useEffect(() => {
    applyAppearance(appearance)
  }, [appearance])

  // Follow a change made in another tab (null key means storage was cleared).
  useEffect(() => {
    function sync(event: StorageEvent) {
      if (event.key === APPEARANCE_KEY || event.key === null) setAppearance(readAppearance())
    }
    window.addEventListener('storage', sync)
    return () => window.removeEventListener('storage', sync)
  }, [])

  return (
    <div className="appearance-control">
      <label htmlFor="appearance">Appearance</label>
      <select
        id="appearance"
        value={appearance}
        onChange={(event) => {
          const value = event.target.value as Appearance
          setAppearance(value)
          setRemembered(saveAppearance(value))
        }}
      >
        <option value="system">System</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
      {!remembered && <p role="status" className="field-hint">Applied for this visit. Your browser could not remember this choice.</p>}
    </div>
  )
}
