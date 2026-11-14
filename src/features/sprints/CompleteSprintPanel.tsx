import { useId, useState, type FormEvent } from 'react'
import type { CarryOver } from '../../domain/completion'
import type { Sprint } from '../../domain/types'

interface CompleteSprintPanelProps {
  sprint: Sprint
  doneCount: number
  unfinishedCount: number
  nextPlanned?: Sprint
  onConfirm: (carryOver: CarryOver) => void
  onCancel: () => void
}

export function CompleteSprintPanel({
  sprint,
  doneCount,
  unfinishedCount,
  nextPlanned,
  onConfirm,
  onCancel,
}: CompleteSprintPanelProps) {
  const id = useId()
  const [choice, setChoice] = useState<'backlog' | 'next'>('backlog')

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    onConfirm(choice === 'next' && nextPlanned ? { kind: 'sprint', sprintId: nextPlanned.id } : { kind: 'backlog' })
  }

  const unfinishedLabel = unfinishedCount === 1 ? '1 unfinished item' : `${unfinishedCount} unfinished items`

  return (
    <form className="item-form" onSubmit={handleSubmit} aria-labelledby={`${id}-heading`}>
      <h4 id={`${id}-heading`}>Complete {sprint.name}?</h4>
      <p>
        {doneCount} done · {unfinishedLabel}. Done items stay in this sprint as a record.
      </p>
      {unfinishedCount > 0 && (
        <fieldset className="field">
          <legend>Where should the {unfinishedLabel} go?</legend>
          <label>
            <input
              type="radio"
              name={`${id}-carry`}
              checked={choice === 'backlog'}
              onChange={() => setChoice('backlog')}
              autoFocus
            />{' '}
            Return to the product backlog (no sprint)
          </label>
          {nextPlanned ? (
            <label>
              <input type="radio" name={`${id}-carry`} checked={choice === 'next'} onChange={() => setChoice('next')} />{' '}
              Move to {nextPlanned.name}
            </label>
          ) : (
            <p className="field-hint">To carry work into the next sprint, create a planned sprint first.</p>
          )}
          <p className="field-hint">Items keep their board status either way.</p>
        </fieldset>
      )}
      <p className="field-hint">Afterwards the sprint is read-only, except its review and retro.</p>
      <div className="actions">
        <button type="submit" autoFocus={unfinishedCount === 0}>
          Complete sprint
        </button>
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  )
}
