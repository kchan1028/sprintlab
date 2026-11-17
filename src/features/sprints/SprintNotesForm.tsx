import { useId, useState, type FormEvent } from 'react'
import type { SprintNotes } from '../../domain/completion'
import type { Sprint } from '../../domain/types'

interface SprintNotesFormProps {
  sprint: Sprint
  onSave: (notes: SprintNotes) => void
  onCancel: () => void
}

export function SprintNotesForm({ sprint, onSave, onCancel }: SprintNotesFormProps) {
  const id = useId()
  const [review, setReview] = useState(sprint.review)
  const [wentWell, setWentWell] = useState(sprint.retro.wentWell)
  const [toImprove, setToImprove] = useState(sprint.retro.toImprove)
  const [actions, setActions] = useState(sprint.retro.actions)

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    onSave({ review, retro: { wentWell, toImprove, actions } })
  }

  const field = (key: string, label: string, hint: string, value: string, set: (v: string) => void, autoFocus = false) => (
    <div className="field">
      <label htmlFor={`${id}-${key}`}>{label}</label>
      <textarea
        id={`${id}-${key}`}
        value={value}
        onChange={(e) => set(e.target.value)}
        rows={3}
        aria-describedby={`${id}-${key}-hint`}
        autoFocus={autoFocus}
      />
      <p id={`${id}-${key}-hint`} className="field-hint">
        {hint}
      </p>
    </div>
  )

  return (
    <form className="item-form" onSubmit={handleSubmit} aria-labelledby={`${id}-heading`}>
      <h4 id={`${id}-heading`}>Review and retro: {sprint.name}</h4>
      <h5>Sprint review</h5>
      {field('review', 'What was delivered?', 'Compare the result with the sprint goal.', review, setReview, true)}
      <h5>Retrospective</h5>
      {field('went-well', 'What went well?', 'Practices worth keeping.', wentWell, setWentWell)}
      {field('to-improve', 'What should improve?', 'Problems, not people.', toImprove, setToImprove)}
      {field('actions', 'Actions for next sprint', 'One or two concrete changes.', actions, setActions)}
      <div className="actions">
        <button type="submit" className="primary-button">Save review and retro</button>
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  )
}
