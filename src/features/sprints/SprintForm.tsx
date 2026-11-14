import { useId, useRef, useState, type FormEvent } from 'react'
import { validateSprint, type SprintErrors, type SprintInput } from '../../domain/sprint'

interface SprintFormProps {
  initial: SprintInput
  onSubmit: (input: SprintInput) => void
  onCancel: () => void
}

const FIELD_ORDER: (keyof SprintInput)[] = ['name', 'goal', 'startDate', 'endDate']

export function SprintForm({ initial, onSubmit, onCancel }: SprintFormProps) {
  const id = useId()
  const [values, setValues] = useState<SprintInput>(initial)
  const [errors, setErrors] = useState<SprintErrors>({})
  const refs = useRef<Partial<Record<keyof SprintInput, HTMLInputElement | HTMLTextAreaElement | null>>>({})

  const set = (field: keyof SprintInput) => (e: { target: { value: string } }) =>
    setValues((v) => ({ ...v, [field]: e.target.value }))

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const found = validateSprint(values)
    setErrors(found)
    const firstInvalid = FIELD_ORDER.find((f) => found[f])
    if (firstInvalid) {
      refs.current[firstInvalid]?.focus()
      return
    }
    onSubmit(values)
  }

  const fieldId = (f: keyof SprintInput) => `${id}-${f}`
  const errorId = (f: keyof SprintInput) => `${id}-${f}-error`
  const a11y = (f: keyof SprintInput) => ({
    id: fieldId(f),
    'aria-invalid': errors[f] ? true : undefined,
    'aria-describedby': errors[f] ? errorId(f) : undefined,
  })
  const error = (f: keyof SprintInput) =>
    errors[f] && (
      <p id={errorId(f)} className="field-error">
        {errors[f]}
      </p>
    )

  return (
    <form className="item-form" onSubmit={handleSubmit} noValidate aria-labelledby={`${id}-heading`}>
      <h3 id={`${id}-heading`}>New sprint</h3>
      <div className="field">
        <label htmlFor={fieldId('name')}>Name (required)</label>
        <input
          {...a11y('name')}
          ref={(el) => {
            refs.current.name = el
          }}
          value={values.name}
          onChange={set('name')}
          autoFocus
        />
        {error('name')}
      </div>
      <div className="field">
        <label htmlFor={fieldId('goal')}>Sprint goal (required)</label>
        <textarea
          {...a11y('goal')}
          ref={(el) => {
            refs.current.goal = el
          }}
          value={values.goal}
          onChange={set('goal')}
          rows={2}
        />
        {error('goal')}
      </div>
      <div className="date-fields">
        <div className="field">
          <label htmlFor={fieldId('startDate')}>Start date</label>
          <input
            {...a11y('startDate')}
            ref={(el) => {
              refs.current.startDate = el
            }}
            type="date"
            value={values.startDate}
            onChange={set('startDate')}
          />
          {error('startDate')}
        </div>
        <div className="field">
          <label htmlFor={fieldId('endDate')}>End date</label>
          <input
            {...a11y('endDate')}
            ref={(el) => {
              refs.current.endDate = el
            }}
            type="date"
            value={values.endDate}
            onChange={set('endDate')}
          />
          {error('endDate')}
        </div>
      </div>
      <div className="actions">
        <button type="submit">Create sprint</button>
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  )
}
