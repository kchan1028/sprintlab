import { describe, expect, it } from 'vitest'
import { emptyData } from '../repository/storage'
import { hasValidRecords, integrityProblem } from '../repository/validate'
import { DEMO_PROJECT_NAME, buildDemo } from './demo'

let counter = 0
const newId = () => `id-${++counter}`
const demo = buildDemo('2026-11-14', '2026-11-14T09:00:00.000Z', newId)
const data = { ...emptyData(), projects: [demo.project], sprints: demo.sprints, workItems: demo.workItems }

describe('buildDemo', () => {
  it('passes the same validation and integrity checks as an import', () => {
    expect(hasValidRecords(data)).toBe(true)
    expect(integrityProblem(data)).toBeNull()
  })

  it('is clearly labelled as demo data', () => {
    expect(demo.project.name).toBe(DEMO_PROJECT_NAME)
    expect(demo.project.description).toMatch(/Dates are illustrative/)
  })

  it('has completed, active and planned sprints, with one active sprint', () => {
    expect(demo.sprints.map((s) => s.state)).toEqual(['completed', 'completed', 'active', 'planned'])
  })

  it('keeps only Done work in completed sprints, as completion would', () => {
    const completed = new Set(demo.sprints.filter((s) => s.state === 'completed').map((s) => s.id))
    const inCompleted = demo.workItems.filter((w) => w.sprintId && completed.has(w.sprintId))
    expect(inCompleted.length).toBeGreaterThan(0)
    expect(inCompleted.every((w) => w.status === 'done')).toBe(true)
  })

  it('records review and retro on completed sprints only', () => {
    for (const s of demo.sprints) {
      expect(Boolean(s.review)).toBe(s.state === 'completed')
    }
  })

  it('uses dates relative to today with end on or after start', () => {
    for (const s of demo.sprints) expect(s.endDate >= s.startDate).toBe(true)
    expect(demo.sprints.find((s) => s.state === 'active')).toMatchObject({ startDate: '2026-11-11', endDate: '2026-11-17' })
  })

  it('creates new ids every time so it can sit next to existing data', () => {
    const again = buildDemo('2026-11-14', 'T', newId)
    expect(again.project.id).not.toBe(demo.project.id)
  })
})
