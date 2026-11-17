import { useRef, useState, type ReactNode } from 'react'
import {
  completeSprint,
  nextPlannedSprint,
  unfinishedItems,
  updateSprintNotes,
  type CarryOver,
  type SprintNotes,
} from '../../domain/completion'
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
import { useFocusReturn } from '../../lib/useFocusReturn'
import { useAppData } from '../../state/useAppData'
import { WorkProgress } from '../../components/WorkProgress'
import { CompleteSprintPanel } from './CompleteSprintPanel'
import { SprintForm } from './SprintForm'
import { SprintNotesForm } from './SprintNotesForm'

type Panel = { sprintId: string; kind: 'notes' | 'complete' } | null

function defaultInput(existing: Sprint[]): SprintInput {
  return { name: `Sprint ${existing.length + 1}`, goal: '', ...defaultSprintDates(existing, toDateString(new Date())) }
}

function hasNotes(sprint: Sprint) {
  return Boolean(sprint.review || sprint.retro.wentWell || sprint.retro.toImprove || sprint.retro.actions)
}

function plural(n: number, one: string, many: string) {
  return `${n} ${n === 1 ? one : many}`
}

export function SprintsSection({ project, children }: { project: Project; children?: ReactNode }) {
  const { data, dispatch } = useAppData()
  const [creating, setCreating] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [panel, setPanel] = useState<Panel>(null)
  const [startError, setStartError] = useState<{ sprintId: string; reason: string } | null>(null)
  const [announcement, setAnnouncement] = useState<string | null>(null)
  const announcementRef = useRef<HTMLParagraphElement>(null)
  const { returnTo, focusTarget } = useFocusReturn()

  function closeCreate() {
    returnTo('new')
    setCreating(false)
  }

  function closePanel() {
    if (panel) returnTo(`${panel.kind}-${panel.sprintId}`)
    setPanel(null)
  }
  const sprints = sortSprints(data.sprints.filter((s) => s.projectId === project.id))

  function announce(message: string) {
    setAnnouncement(message)
    // Move focus to the confirmation so keyboard and screen-reader users hear the result.
    requestAnimationFrame(() => announcementRef.current?.focus())
  }

  function itemsIn(sprintId: string) {
    return data.workItems.filter((w) => w.sprintId === sprintId)
  }

  function handleCreate(input: SprintInput) {
    dispatch({ type: 'sprint/created', sprint: createSprint(input, project.id, crypto.randomUUID()) })
    closeCreate()
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

  function handleComplete(sprint: Sprint, carryOver: CarryOver) {
    const result = completeSprint(sprint, data.sprints, data.workItems, carryOver, new Date().toISOString())
    if (!result.ok) {
      setStartError({ sprintId: sprint.id, reason: result.reason })
      return
    }
    setHistoryOpen(true)
    dispatch({ type: 'sprint/completed', sprint: result.sprint, movedItems: result.movedItems })
    setPanel(null)
    setStartError(null)
    const moved = result.movedItems.length
    const target =
      carryOver.kind === 'sprint' ? data.sprints.find((s) => s.id === carryOver.sprintId)?.name : 'the product backlog'
    announce(
      moved === 0
        ? `${sprint.name} completed. Add its review and retro below.`
        : `${sprint.name} completed. ${plural(moved, 'unfinished item', 'unfinished items')} moved to ${target}.`,
    )
  }

  function handleSaveNotes(sprint: Sprint, notes: SprintNotes) {
    dispatch({ type: 'sprint/updated', sprint: updateSprintNotes(sprint, notes) })
    setPanel(null)
    announce(`Review and retro saved for ${sprint.name}.`)
  }

  function renderSprint(sprint: Sprint) {
    const items = itemsIn(sprint.id)
    const unfinished = unfinishedItems(sprint, data.workItems)
    const startCheck = canStartSprint(sprint, data.sprints)
    const open = panel?.sprintId === sprint.id ? panel.kind : null
    return (
      <li key={sprint.id} className={`sprint-row sprint-${sprint.state}`}>
        <div className="sprint-summary">
          <div>
            <h3>
              {sprint.name}{' '}
              <span className={`state state-${sprint.state}`}>{SPRINT_STATE_LABELS[sprint.state]}</span>
            </h3>
            <p className="item-meta">
              {formatDateRange(sprint.startDate, sprint.endDate)} ·{' '}
              {sprint.state === 'completed'
                ? `${plural(items.length, 'item', 'items')} done`
                : plural(items.length, 'item', 'items')}
            </p>
            <p className="sprint-goal">
              <strong>Goal:</strong> {sprint.goal}
            </p>
            {startError?.sprintId === sprint.id && (
              <p role="alert" className="field-error">
                {startError.reason}
              </p>
            )}
          </div>
          {open === null && (
            <div className="actions">
              {sprint.state === 'planned' && (
                <button type="button" disabled={!startCheck.ok} aria-describedby={!startCheck.ok ? `start-help-${sprint.id}` : undefined} aria-label={`Start ${sprint.name}`} onClick={() => handleStart(sprint)}>
                  Start sprint
                </button>
              )}
              {sprint.state === 'active' && (
                <button
                  type="button"
                  className="primary-button"
                  ref={focusTarget(`complete-${sprint.id}`)}
                  aria-label={`Complete ${sprint.name}`}
                  onClick={() => {
                    setAnnouncement(null)
                    setPanel({ sprintId: sprint.id, kind: 'complete' })
                  }}
                >
                  Complete sprint
                </button>
              )}
              {sprint.state !== 'planned' && (
                <button
                  type="button"
                  ref={focusTarget(`notes-${sprint.id}`)}
                  // Accessible name starts with the visible text so voice control can target it.
                  aria-label={`${hasNotes(sprint) ? 'Edit' : 'Add'} review and retro for ${sprint.name}`}
                  onClick={() => {
                    setAnnouncement(null)
                    setPanel({ sprintId: sprint.id, kind: 'notes' })
                  }}
                >
                  {hasNotes(sprint) ? 'Edit review and retro' : 'Add review and retro'}
                </button>
              )}
            </div>
          )}
        </div>

        {sprint.state === 'active' && <WorkProgress items={items} label="Sprint work" context={sprint.name} />}
        {sprint.state === 'planned' && !startCheck.ok && <p id={`start-help-${sprint.id}`} className="field-hint">{startCheck.reason}</p>}
        {open === 'complete' && (
          <CompleteSprintPanel
            sprint={sprint}
            doneCount={items.length - unfinished.length}
            unfinishedCount={unfinished.length}
            nextPlanned={nextPlannedSprint(sprint, data.sprints)}
            onConfirm={(carry) => handleComplete(sprint, carry)}
            onCancel={closePanel}
          />
        )}
        {open === 'notes' && (
          <SprintNotesForm
            sprint={sprint}
            onSave={(notes) => handleSaveNotes(sprint, notes)}
            onCancel={closePanel}
          />
        )}

        {open !== 'notes' && hasNotes(sprint) && (
          <dl className="sprint-notes">
            {sprint.review && (
              <>
                <dt>Review</dt>
                <dd>{sprint.review}</dd>
              </>
            )}
            {sprint.retro.wentWell && (
              <>
                <dt>Went well</dt>
                <dd>{sprint.retro.wentWell}</dd>
              </>
            )}
            {sprint.retro.toImprove && (
              <>
                <dt>To improve</dt>
                <dd>{sprint.retro.toImprove}</dd>
              </>
            )}
            {sprint.retro.actions && (
              <>
                <dt>Actions</dt>
                <dd>{sprint.retro.actions}</dd>
              </>
            )}
          </dl>
        )}
      </li>
    )
  }

  const active = sprints.filter((sprint) => sprint.state === 'active')
  const planned = sprints.filter((sprint) => sprint.state === 'planned')
  const completed = sprints.filter((sprint) => sprint.state === 'completed')

  return (
    <>
      <section aria-label="Sprints" className="sprints current-sprint">
        <div className="section-header">
          <h2 id="sprints-heading">Current sprint</h2>
          {!creating && <button type="button" ref={focusTarget('new')} onClick={() => setCreating(true)}>New sprint</button>}
        </div>
        {announcement && <p ref={announcementRef} tabIndex={-1} role="status" className="announcement">{announcement}</p>}
        {creating && <SprintForm initial={defaultInput(sprints)} onSubmit={handleCreate} onCancel={closeCreate} />}
        {active.length > 0 ? <ul className="sprint-list">{active.map(renderSprint)}</ul> : (
          <p className="empty-state">{sprints.length === 0 ? 'No sprints yet. Create one to plan a week of work.' : 'No active sprint. Start an upcoming sprint below, or create one.'}</p>
        )}
      </section>
      {children}
      {planned.length > 0 && (
        <section aria-labelledby="upcoming-heading" className="sprints sprint-planning">
          <h2 id="upcoming-heading">Upcoming sprints</h2>
          <ul className="sprint-list">{planned.map(renderSprint)}</ul>
        </section>
      )}
      {completed.length > 0 && (
        <details className="sprint-history" open={historyOpen} onToggle={(event) => setHistoryOpen(event.currentTarget.open)}>
          <summary>Completed sprints ({completed.length})</summary>
          <p className="field-hint">Review what you delivered and reflect on how to improve the next sprint.</p>
          <ul className="sprint-list">{completed.map(renderSprint)}</ul>
        </details>
      )}
    </>
  )
}
