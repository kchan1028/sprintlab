import type { AppData } from '../domain/types'
import { hasValidRecords } from './validate'

export const STORAGE_KEY = 'sprintlab:data'
export const CURRENT_SCHEMA_VERSION = 1

/** The subset of the Web Storage API we use; lets tests pass a fake. */
export type KeyValueStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

export type LoadError =
  /** Stored value is not valid JSON or not shaped like AppData. */
  | 'corrupt'
  /** Stored data was written by a newer version of the app. */
  | 'unsupported_version'
  /** The browser blocked storage access (e.g. disabled site data). */
  | 'unavailable'

export type LoadResult =
  | { ok: true; data: AppData }
  | { ok: false; error: LoadError; raw: string | null }

export type SaveError = 'quota_exceeded' | 'unavailable'
export type SaveResult = { ok: true } | { ok: false; error: SaveError }

export function emptyData(): AppData {
  return { schemaVersion: CURRENT_SCHEMA_VERSION, projects: [], workItems: [], sprints: [] }
}

function defaultStorage(): KeyValueStorage {
  return window.localStorage
}

function isAppDataShape(value: unknown): value is AppData {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  return (
    Number.isInteger(v.schemaVersion) &&
    Array.isArray(v.projects) &&
    Array.isArray(v.workItems) &&
    Array.isArray(v.sprints)
  )
}

/**
 * Upgrades older stored data to the current schema. Each entry migrates
 * version N to N + 1. Empty while we're on version 1.
 */
const migrations: Record<number, (data: AppData) => AppData> = {}

function migrate(data: AppData): AppData {
  let current = data
  while (current.schemaVersion < CURRENT_SCHEMA_VERSION) {
    const step = migrations[current.schemaVersion]
    if (!step) throw new Error(`No migration from schema version ${current.schemaVersion}`)
    current = { ...step(current), schemaVersion: current.schemaVersion + 1 }
  }
  return current
}

export type ParseResult = { ok: true; data: AppData } | { ok: false; error: 'corrupt' | 'unsupported_version' }

/**
 * Turns stored or imported JSON text into checked, migrated AppData.
 * Shared by loading and import, so both apply the same rules.
 */
export function parseAppData(raw: string): ParseResult {
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return { ok: false, error: 'corrupt' }
  }

  if (!isAppDataShape(parsed)) return { ok: false, error: 'corrupt' }
  if (parsed.schemaVersion > CURRENT_SCHEMA_VERSION) return { ok: false, error: 'unsupported_version' }

  let data: AppData
  try {
    data = migrate(parsed)
  } catch {
    return { ok: false, error: 'corrupt' }
  }
  // Check every record after migrating, so components never see a wrongly typed field.
  if (!hasValidRecords(data)) return { ok: false, error: 'corrupt' }
  return { ok: true, data }
}

/** Reads app data. Never throws: problems come back as a LoadResult error. */
export function loadData(storage: KeyValueStorage = defaultStorage()): LoadResult {
  let raw: string | null
  try {
    raw = storage.getItem(STORAGE_KEY)
  } catch {
    return { ok: false, error: 'unavailable', raw: null }
  }

  if (raw === null) return { ok: true, data: emptyData() }
  const result = parseAppData(raw)
  return result.ok ? result : { ok: false, error: result.error, raw }
}

function isQuotaError(err: unknown): boolean {
  if (!(err instanceof DOMException)) return false
  // Firefox historically used a different name and code for the same error.
  return (
    err.name === 'QuotaExceededError' ||
    err.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
    err.code === 22 ||
    err.code === 1014
  )
}

/** Writes app data. Never throws: problems come back as a SaveResult error. */
export function saveData(data: AppData, storage: KeyValueStorage = defaultStorage()): SaveResult {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(data))
    return { ok: true }
  } catch (err) {
    return { ok: false, error: isQuotaError(err) ? 'quota_exceeded' : 'unavailable' }
  }
}

/** Deletes all stored app data. Callers must confirm with the user first. */
export function resetData(storage: KeyValueStorage = defaultStorage()): SaveResult {
  try {
    storage.removeItem(STORAGE_KEY)
    return { ok: true }
  } catch {
    return { ok: false, error: 'unavailable' }
  }
}
