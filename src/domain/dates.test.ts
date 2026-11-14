import { describe, expect, it } from 'vitest'
import { addDays, formatDateRange, isValidDateString, toDateString } from './dates'

describe('isValidDateString', () => {
  it.each(['2026-11-16', '2024-02-29'])('accepts %s', (v) => expect(isValidDateString(v)).toBe(true))
  it.each(['', '2026-11-6', '2026-02-30', '2025-02-29', '16/11/2026', '2026-13-01'])('rejects %j', (v) =>
    expect(isValidDateString(v)).toBe(false),
  )
})

describe('addDays and toDateString', () => {
  it('crosses month and year boundaries in local time', () => {
    expect(addDays('2026-12-29', 6)).toBe('2027-01-04')
    expect(toDateString(new Date(2026, 0, 5))).toBe('2026-01-05')
  })
})

describe('formatDateRange', () => {
  it('shows the year once when both dates share it', () => {
    expect(formatDateRange('2026-11-16', '2026-11-22')).toBe('Nov 16 – Nov 22, 2026')
  })

  it('shows both years when they differ', () => {
    expect(formatDateRange('2026-12-29', '2027-01-04')).toBe('Dec 29, 2026 – Jan 4, 2027')
  })
})
