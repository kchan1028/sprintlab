import { useId, useRef, useState, type FormEvent } from 'react'
import type { Priority, WorkItemType } from '../../domain/types'
import {
  PRIORITIES,
  PRIORITY_LABELS,
  TYPE_LABELS,
  WORK_ITEM_TITLE_MAX,
  emptyWorkItemInput,
  validateWorkItem,
  type WorkItemErrors,
  type WorkItemInput,
} from '../../domain/workItem'

interface WorkItemFormProps {
  title: string
  submitLabel: string
  initial?: WorkItemInput
  onSubmit: (input: WorkItemInput) => void
  onCancel: () => void
}

interface CriterionRow {
  key: number
  text: string
}

export function WorkItemForm({ title, submitLabel, initial, onSubmit, onCancel }: WorkItemFormProps) {
  const id = useId()
  const start = initial ?? emptyWorkItemInput()
  // Initial rows use keys 0..n-1; rows added later continue from n. Only read in event handlers.
  const nextKey = useRef(start.acceptanceCriteria.length)

  const [type, setType] = useState<WorkItemType>(start.type)
  const [itemTitle, setItemTitle] = useState(start.title)
  const [priority, setPriority] = useState<Priority>(start.priority)
  const [description, setDescription] = useState(start.description)
  const [criteria, setCriteria] = useState<CriterionRow[]>(() =>
    start.acceptanceCriteria.map((text, key) => ({ key, text })),
  )
  const [errors, setErrors] = useState<WorkItemErrors>({})
  const titleRef = useRef<HTMLInputElement>(null)
  const focusKey = useRef<number | null>(null)

  function addCriterion() {
    const row: CriterionRow = { key: nextKey.current++, text: '' }
    focusKey.current = row.key
    setCriteria((rows) => [...rows, row])
  }

  function removeCriterion(key: number) {
    setCriteria((rows) => rows.filter((r) => r.key !== key))
  }

  function updateCriterion(key: number, text: string) {
    setCriteria((rows) => rows.map((r) => (r.key === key ? { ...r, text } : r)))
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const input: WorkItemInput = {
      type,
      title: itemTitle,
      description,
      priority,
      acceptanceCriteria: criteria.map((r) => r.text),
    }
    const found = validateWorkItem(input)
    setErrors(found)
    if (found.title) {
      titleRef.current?.focus()
      return
    }
    onSubmit(input)
  }

  const titleErrorId = `${id}-title-error`
  const titleHintId = `${id}-title-hint`

  return (
    <form className="item-form" onSubmit={handleSubmit} noValidate aria-labelledby={`${id}-heading`}>
      <h3 id={`${id}-heading`}>{title}</h3>

      <fieldset className="field">
        <legend>Type</legend>
        <div className="inline-options">
          {(['story', 'bug'] as const).map((t) => (
            <label key={t}>
              <input type="radio" name={`${id}-type`} value={t} checked={type === t} onChange={() => setType(t)} />{' '}
              {TYPE_LABELS[t]}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="field">
        <label htmlFor={`${id}-title`}>Title (required)</label>
        <input
          id={`${id}-title`}
          ref={titleRef}
          value={itemTitle}
          onChange={(e) => setItemTitle(e.target.value)}
          aria-invalid={errors.title ? true : undefined}
          aria-describedby={errors.title ? titleErrorId : titleHintId}
          autoFocus
        />
        {errors.title ? (
          <p id={titleErrorId} className="field-error">
            {errors.title}
          </p>
        ) : (
          <p id={titleHintId} className="field-hint">
            Up to {WORK_ITEM_TITLE_MAX} characters.
          </p>
        )}
      </div>

      <div className="field">
        <label htmlFor={`${id}-priority`}>Priority</label>
        <select id={`${id}-priority`} value={priority} onChange={(e) => setPriority(e.target.value as Priority)}>
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {PRIORITY_LABELS[p]}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor={`${id}-description`}>Description</label>
        <textarea
          id={`${id}-description`}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
      </div>

      <fieldset className="field">
        <legend>Acceptance criteria</legend>
        <p className="field-hint">Blank rows are ignored.</p>
        <ol className="criteria-list">
          {criteria.map((row, index) => (
            <li key={row.key} className="criterion-row">
              <label className="visually-hidden" htmlFor={`${id}-criterion-${row.key}`}>
                Criterion {index + 1}
              </label>
              <input
                id={`${id}-criterion-${row.key}`}
                value={row.text}
                onChange={(e) => updateCriterion(row.key, e.target.value)}
                ref={(el) => {
                  if (el && focusKey.current === row.key) {
                    el.focus()
                    focusKey.current = null
                  }
                }}
              />
              <button type="button" onClick={() => removeCriterion(row.key)} aria-label={`Remove criterion ${index + 1}`}>
                Remove
              </button>
            </li>
          ))}
        </ol>
        <button type="button" onClick={addCriterion}>
          Add criterion
        </button>
      </fieldset>

      <div className="actions">
        <button type="submit" className="primary-button">{submitLabel}</button>
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  )
}
