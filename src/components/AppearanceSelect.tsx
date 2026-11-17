import { useEffect, useState } from 'react'
import { readAppearance, saveAppearance, type Appearance } from '../repository/appearance'

export function AppearanceSelect() {
  const [appearance, setAppearance] = useState<Appearance>(readAppearance)
  const [remembered, setRemembered] = useState(true)

  useEffect(() => {
    document.documentElement.dataset.appearance = appearance
  }, [appearance])

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
