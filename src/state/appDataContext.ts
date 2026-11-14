import { createContext, type Dispatch } from 'react'
import type { AppData } from '../domain/types'
import type { SaveError } from '../repository/storage'
import type { AppAction } from './appReducer'

export interface AppDataContextValue {
  data: AppData
  dispatch: Dispatch<AppAction>
  /** Set when the most recent save failed; cleared by the next successful save. */
  saveError: SaveError | null
}

export const AppDataContext = createContext<AppDataContextValue | null>(null)
