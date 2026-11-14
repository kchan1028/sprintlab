import { useContext } from 'react'
import { AppDataContext, type AppDataContextValue } from './appDataContext'

export function useAppData(): AppDataContextValue {
  const value = useContext(AppDataContext)
  if (!value) throw new Error('useAppData must be used inside <AppDataProvider>')
  return value
}
