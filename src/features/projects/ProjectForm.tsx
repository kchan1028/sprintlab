import { useId, useRef, useState, type FormEvent } from 'react'
import {
  PROJECT_NAME_MAX,
  hasErrors,
  validateProject,
  type ProjectErrors,
  type ProjectInput,
} from '../../domain/project'

interface ProjectFormProps {
  title: string
  submitLabel: string
  initial?: ProjectInput
  onSubmit: (input: ProjectInput) => void
  onCancel: () => void
}

export function ProjectForm({ title, submitLabel, initial, onSubmit, onCancel }: ProjectFormProps) {
  const id = useId()
  const [name, setName] = useState(initial?.name ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [errors, setErrors] = useState<ProjectErrors>({})
  const nameRef = useRef<HTMLInputElement>(null)

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const input = { name, description }
    const found = validateProject(input)
    setErrors(found)
    if (hasErrors(found)) {
      nameRef.current?.focus()
      return
    }
    onSubmit(input)
  }

  const nameErrorId = `${id}-name-error`

  return (
    <form className="project-form" onSubmit={handleSubmit} noValidate aria-labelledby={`${id}-title`}>
      <h3 id={`${id}-title`}>{title}</h3>
      <div className="field">
        <label htmlFor={`${id}-name`}>Name (required)</label>
        <input
          id={`${id}-name`}
          ref={nameRef}
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-invalid={errors.name ? true : undefined}
          aria-describedby={errors.name ? nameErrorId : `${id}-name-hint`}
          autoFocus
        />
        {errors.name ? (
          <p id={nameErrorId} className="field-error">
            {errors.name}
          </p>
        ) : (
          <p id={`${id}-name-hint`} className="field-hint">
            Up to {PROJECT_NAME_MAX} characters.
          </p>
        )}
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
      <div className="actions">
        <button type="submit">{submitLabel}</button>
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  )
}
