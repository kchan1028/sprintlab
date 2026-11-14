import { useState } from 'react'
import { formatDateRange, toDateString } from '../../domain/dates'
import {
  SPRINT_STATE_LABELS,
  canStartSprint,
  createSprint,
  defaultSprintDates,
  sortSprints,
  startSprint,
  type SprintInput,
} from '../../domain/sprint'
import type { Project, Sprint } from '../../domain/types'
import { useAppData } from '../../state/useAppData'
import { SprintForm } from './SprintForm'

function defaultInput(existing: Sprint[]): SprintInput {
  return { name: `Sprint ${existing.length + 1}`, goal: '', ...defaultSprintDates(existing, toDateString(new Date())) }
}

export function SprintsSection({ project }: { project: Project }) {
  const { data, dispatch } = useAppData()
  const [creating, setCreating] = useState(false)
  const [startError, setStartError] = useState<{ sprintId: string; reason: string } | null>(null)
  const sprints = sortSprints(data.sprints.filter((s) => s.projectId === project.id))

  function handleCreate(input: SprintInput) {
    dispatch({ type: 'sprint/created', sprint: createSprint(input, project.id, crypto.randomUUID()) })
    setCreating(false)
  }

  function handleStart(sprint: Sprint) {
    const check = canStartSprint(sprint, data.sprints)
    if (!check.ok) {
      setStartError({ sprintId: sprint.id, reason: check.reason })
      return
    }
    setStartError(null)
    dispatch({ type: 'sprint/updated', sprint: startSprint(sprint) })
  }

  return (
    <section aria-labelledby="sprints-heading" className="sprints">
      <div className="section-header">
        <h2 id="sprints-heading">Sprints</h2>
        {!creating && (
          <button type="button" onClick={() => setCreating(true)}>
            New sprint
          </button>
        )}
      </div>

      {creating && (
        <SprintForm initial={defaultInput(sprints)} onSubmit={handleCreate} onCancel={() => setCreating(false)} />
      )}

      {sprints.length === 0 ? (
        !creating && <p className="empty-state">No sprints yet. Create one to plan a week of work.</p>
      ) : (
        <ul className="sprint-list">
          {sprints.map((sprint) => (
            <li key={sprint.id} className={`sprint-row sprint-${sprint.state}`}>
              <div>
                <h3>
                  {sprint.name} <span className={`state state-${sprint.state}`}>{SPRINT_STATE_LABELS[sprint.state]}</span>
                </h3>
                <p className="item-meta">{formatDateRange(sprint.startDate, sprint.endDate)}</p>
                <p>
                  <strong>Goal:</strong> {sprint.goal}
                </p>
                {startError?.sprintId === sprint.id && (
                  <p role="alert" className="field-error">
                    {startError.reason}
                  </p>
                )}
              </div>
              {sprint.state === 'planned' && (
                <button type="button" aria-label={`Start ${sprint.name}`} onClick={() => handleStart(sprint)}>
                  Start sprint
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
