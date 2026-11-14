import { beforeEach, describe, expect, it } from 'vitest'
import type { AppData } from '../domain/types'
import {
  CURRENT_SCHEMA_VERSION,
  STORAGE_KEY,
  emptyData,
  loadData,
  resetData,
  saveData,
  type KeyValueStorage,
} from './storage'

const sample: AppData = {
  schemaVersion: CURRENT_SCHEMA_VERSION,
  projects: [
    {
      id: 'p1',
      name: 'SprintLab',
      description: '',
      createdAt: '2026-11-14T10:00:00.000Z',
      updatedAt: '2026-11-14T10:00:00.000Z',
    },
  ],
  workItems: [],
  sprints: [],
}

function throwingStorage(error: unknown): KeyValueStorage {
  return {
    getItem: () => {
      throw error
    },
    setItem: () => {
      throw error
    },
    removeItem: () => {
      throw error
    },
  }
}

beforeEach(() => {
  localStorage.clear()
})

describe('loadData', () => {
  it('returns empty data when nothing is stored', () => {
    expect(loadData()).toEqual({ ok: true, data: emptyData() })
  })

  it('round-trips saved data', () => {
    expect(saveData(sample)).toEqual({ ok: true })
    expect(loadData()).toEqual({ ok: true, data: sample })
  })

  it('reports corrupt data when the stored value is not JSON', () => {
    localStorage.setItem(STORAGE_KEY, '{not json')
    expect(loadData()).toEqual({ ok: false, error: 'corrupt', raw: '{not json' })
  })

  it.each([
    ['null', 'null'],
    ['an array', '[]'],
    ['missing collections', JSON.stringify({ schemaVersion: 1, projects: [] })],
    ['a non-integer version', JSON.stringify({ ...sample, schemaVersion: '1' })],
  ])('reports corrupt data for %s', (_label, raw) => {
    localStorage.setItem(STORAGE_KEY, raw)
    expect(loadData()).toEqual({ ok: false, error: 'corrupt', raw })
  })

  it('refuses data from a newer schema version and keeps the raw value', () => {
    const raw = JSON.stringify({ ...sample, schemaVersion: CURRENT_SCHEMA_VERSION + 1 })
    localStorage.setItem(STORAGE_KEY, raw)
    expect(loadData()).toEqual({ ok: false, error: 'unsupported_version', raw })
  })

  it('reports corrupt data for an old version with no migration path', () => {
    const raw = JSON.stringify({ ...sample, schemaVersion: 0 })
    localStorage.setItem(STORAGE_KEY, raw)
    expect(loadData()).toEqual({ ok: false, error: 'corrupt', raw })
  })

  it('reports unavailable storage instead of throwing', () => {
    const storage = throwingStorage(new DOMException('blocked', 'SecurityError'))
    expect(loadData(storage)).toEqual({ ok: false, error: 'unavailable', raw: null })
  })

  it('does not modify stored data when it is corrupt', () => {
    localStorage.setItem(STORAGE_KEY, '{not json')
    loadData()
    expect(localStorage.getItem(STORAGE_KEY)).toBe('{not json')
  })
})

describe('saveData', () => {
  it('reports a full quota instead of throwing', () => {
    const storage = throwingStorage(new DOMException('full', 'QuotaExceededError'))
    expect(saveData(sample, storage)).toEqual({ ok: false, error: 'quota_exceeded' })
  })

  it('recognises the Firefox quota error name', () => {
    const storage = throwingStorage(new DOMException('full', 'NS_ERROR_DOM_QUOTA_REACHED'))
    expect(saveData(sample, storage)).toEqual({ ok: false, error: 'quota_exceeded' })
  })

  it('reports other write failures as unavailable', () => {
    const storage = throwingStorage(new Error('nope'))
    expect(saveData(sample, storage)).toEqual({ ok: false, error: 'unavailable' })
  })
})

describe('resetData', () => {
  it('removes stored data so the next load is empty', () => {
    saveData(sample)
    expect(resetData()).toEqual({ ok: true })
    expect(loadData()).toEqual({ ok: true, data: emptyData() })
  })
})
