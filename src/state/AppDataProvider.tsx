import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import type { AppData } from '../domain/types'
import { saveData, type SaveError } from '../repository/storage'
import { AppDataContext } from './appDataContext'
import { appReducer, type AppAction } from './appReducer'

interface AppDataProviderProps {
  initialData: AppData
  children: ReactNode
}

interface State {
  data: AppData
  saveError: SaveError | null
}

export function AppDataProvider({ initialData, children }: AppDataProviderProps) {
  const [state, setState] = useState<State>({ data: initialData, saveError: null })
  // Latest data, so consecutive dispatches in one event build on each other.
  const dataRef = useRef(initialData)

  // Save in the same event that caused the change, rather than in an effect afterwards.
  const dispatch = useCallback((action: AppAction) => {
    const next = appReducer(dataRef.current, action)
    dataRef.current = next
    const result = saveData(next)
    setState({ data: next, saveError: result.ok ? null : result.error })
  }, [])

  const retrySave = useCallback(() => {
    const result = saveData(dataRef.current)
    setState((s) => ({ ...s, saveError: result.ok ? null : result.error }))
  }, [])

  // While changes are unsaved, ask the browser to confirm before the tab closes or reloads.
  useEffect(() => {
    if (!state.saveError) return
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      // Older browsers need returnValue set to show the prompt.
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [state.saveError])

  return (
    <AppDataContext.Provider value={{ data: state.data, dispatch, saveError: state.saveError, retrySave }}>
      {children}
    </AppDataContext.Provider>
  )
}
