import type { DateString } from './types'

const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/

/** True for a real calendar date in YYYY-MM-DD form (rejects 2026-02-30). */
export function isValidDateString(value: string): value is DateString {
  const match = DATE_PATTERN.exec(value)
  if (!match) return false
  const [, y, m, d] = match.map(Number)
  const date = new Date(y, m - 1, d)
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d
}

/** Formats a local Date as YYYY-MM-DD without a UTC shift. */
export function toDateString(date: Date): DateString {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function addDays(value: DateString, days: number): DateString {
  const [y, m, d] = value.split('-').map(Number)
  return toDateString(new Date(y, m - 1, d + days))
}

/** "Nov 16 – Nov 22, 2026", or with both years when they differ. */
export function formatDateRange(start: DateString, end: DateString): string {
  const parse = (v: DateString) => {
    const [y, m, d] = v.split('-').map(Number)
    return new Date(y, m - 1, d)
  }
  const a = parse(start)
  const b = parse(end)
  const short = new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' })
  const long = new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' })
  return a.getFullYear() === b.getFullYear()
    ? `${short.format(a)} – ${long.format(b)}`
    : `${long.format(a)} – ${long.format(b)}`
}
