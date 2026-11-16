import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { DRAFT_REQUEST_MAX, validateDraftRequest } from '../../domain/drafts'
import type { Project } from '../../domain/types'
import { PRIORITY_LABELS, TYPE_LABELS, createWorkItem, validateWorkItem, type WorkItemInput } from '../../domain/workItem'
import { useFocusReturn } from '../../lib/useFocusReturn'
import { useAppData } from '../../state/useAppData'
import { WorkItemForm } from '../workItems/WorkItemForm'
import { checkDraftsEnabled, requestDrafts } from './draftClient'

interface DraftRow {
  key: number
  input: WorkItemInput
}

function plural(n: number, one: string, many: string) {
  return `${n} ${n === 1 ? one : many}`
}

export const EMPTY_RESULT_MESSAGE = 'Claude found nothing to draft. Add more detail and try again.'

/**
 * Drafts stories with Claude through /api/draft-stories. Renders nothing unless the server
 * reports a configured API key. Drafts live only in this component until the user adds them.
 */
export function DraftStoriesSection({ project }: { project: Project }) {
  const { dispatch } = useAppData()
  const id = useId()
  const [enabled, setEnabled] = useState(false)
  const [text, setText] = useState('')
  const [inputError, setInputError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState('')
  const [drafts, setDrafts] = useState<DraftRow[]>([])
  const [editingKey, setEditingKey] = useState<number | null>(null)
  const nextKey = useRef(0)
  const inFlight = useRef<AbortController | null>(null)
  const textRef = useRef<HTMLTextAreaElement>(null)
  const { returnTo, focusTarget } = useFocusReturn()

  useEffect(() => {
    const controller = new AbortController()
    checkDraftsEnabled(controller.signal).then((on) => {
      if (!controller.signal.aborted) setEnabled(on)
    })
    return () => {
      controller.abort()
      // Leaving the page cancels a request that is still running.
      inFlight.current?.abort()
    }
  }, [])

  if (!enabled) return null

  async function handleGenerate(event: FormEvent) {
    event.preventDefault()
    const problem = validateDraftRequest(text)
    setInputError(problem)
    if (problem) {
      textRef.current?.focus()
      return
    }
    const controller = new AbortController()
    inFlight.current = controller
    returnTo('cancel')
    setLoading(true)
    setError(null)
    setStatus('Drafting stories. This can take up to a minute.')

    const result = await requestDrafts(
      { request: text, projectName: project.name, projectDescription: project.description },
      controller.signal,
    )
    if ('aborted' in result) return
    inFlight.current = null
    setLoading(false)
    if (!result.ok) {
      returnTo('generate')
      setStatus('')
      setError(result.error)
      return
    }
    if (result.stories.length === 0) {
      returnTo('generate')
      setStatus(EMPTY_RESULT_MESSAGE)
      return
    }
    const rows = result.stories.map((story) => ({ key: nextKey.current++, input: { type: 'story' as const, ...story } }))
    returnTo('review')
    setDrafts((current) => [...current, ...rows])
    setStatus(`${plural(rows.length, 'draft', 'drafts')} ready to review.`)
  }

  function handleCancel() {
    inFlight.current?.abort()
    inFlight.current = null
    returnTo('generate')
    setLoading(false)
    setStatus('Drafting cancelled.')
  }

  function saveDraft(key: number, input: WorkItemInput) {
    setDrafts((rows) => rows.map((row) => (row.key === key ? { key, input } : row)))
    returnTo(`edit-${key}`)
    setEditingKey(null)
  }

  function cancelEdit(key: number) {
    returnTo(`edit-${key}`)
    setEditingKey(null)
  }

  function discardDraft(row: DraftRow) {
    const remaining = drafts.filter((r) => r.key !== row.key)
    returnTo(remaining.length > 0 ? 'review' : 'status')
    setDrafts(remaining)
    setError(null)
    setStatus(`Discarded “${row.input.title}”.`)
  }

  function discardAll() {
    returnTo('status')
    setDrafts([])
    setError(null)
    setStatus('Discarded all drafts.')
  }

  function addAll() {
    const invalid = drafts.find((row) => validateWorkItem(row.input).title)
    if (invalid) {
      setError(`“${invalid.input.title.slice(0, 40)}…” needs a shorter title. Edit it before adding.`)
      return
    }
    const now = new Date().toISOString()
    const items = drafts.map((row) => createWorkItem(row.input, project.id, crypto.randomUUID(), now))
    dispatch({ type: 'workItems/added', workItems: items })
    returnTo('status')
    setDrafts([])
    setText('')
    setError(null)
    setStatus(`Added ${plural(items.length, 'work item', 'work items')} to the backlog.`)
  }

  const hintId = `${id}-hint`
  const errorId = `${id}-error`

  return (
    <section className="drafts" aria-labelledby={`${id}-heading`}>
      <h2 id={`${id}-heading`}>Draft stories with AI</h2>
      <p>
        Describe a feature in a few sentences and Claude drafts stories with acceptance criteria. You review every
        draft before anything is saved. Your text and this project&apos;s name and description are sent to Anthropic.
      </p>

      <form className="item-form" onSubmit={handleGenerate} noValidate>
        <div className="field">
          <label htmlFor={`${id}-request`}>Feature request</label>
          <textarea
            id={`${id}-request`}
            ref={textRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            readOnly={loading}
            aria-invalid={inputError ? true : undefined}
            aria-describedby={inputError ? errorId : hintId}
          />
          {inputError ? (
            <p id={errorId} className="field-error">
              {inputError}
            </p>
          ) : (
            <p id={hintId} className="field-hint">
              Up to {DRAFT_REQUEST_MAX} characters.
            </p>
          )}
        </div>
        <div className="actions">
          {loading ? (
            <button type="button" ref={focusTarget('cancel')} onClick={handleCancel}>
              Cancel drafting
            </button>
          ) : (
            <button type="submit" ref={focusTarget('generate')}>
              Draft stories
            </button>
          )}
        </div>
      </form>

      <p role="status" tabIndex={-1} ref={focusTarget('status')} className="draft-status">
        {status}
      </p>
      {error && (
        <p role="alert" className="field-error">
          {error}
        </p>
      )}

      {drafts.length > 0 && (
        <div className="draft-review">
          <h3 tabIndex={-1} ref={focusTarget('review')}>
            Review drafts ({drafts.length})
          </h3>
          <p className="field-hint">Nothing is saved until you add the drafts. Edit or discard any you don&apos;t want.</p>
          <ol className="card-list">
            {drafts.map((row) =>
              row.key === editingKey ? (
                <li key={row.key}>
                  <WorkItemForm
                    title={`Edit draft ${row.input.title}`}
                    submitLabel="Save draft"
                    initial={row.input}
                    onSubmit={(input) => saveDraft(row.key, input)}
                    onCancel={() => cancelEdit(row.key)}
                  />
                </li>
              ) : (
                <li key={row.key} className="card">
                  <span className={`badge badge-${row.input.type}`}>{TYPE_LABELS[row.input.type]}</span>
                  <h4>{row.input.title}</h4>
                  <p className="item-meta">
                    {PRIORITY_LABELS[row.input.priority]} priority ·{' '}
                    {plural(row.input.acceptanceCriteria.length, 'acceptance criterion', 'acceptance criteria')}
                  </p>
                  {row.input.description && <p>{row.input.description}</p>}
                  <ul>
                    {row.input.acceptanceCriteria.map((criterion, index) => (
                      <li key={index}>{criterion}</li>
                    ))}
                  </ul>
                  <div className="card-actions">
                    <button
                      type="button"
                      ref={focusTarget(`edit-${row.key}`)}
                      onClick={() => setEditingKey(row.key)}
                      disabled={editingKey !== null}
                      aria-label={`Edit draft ${row.input.title}`}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => discardDraft(row)}
                      disabled={editingKey !== null}
                      aria-label={`Discard draft ${row.input.title}`}
                    >
                      Discard
                    </button>
                  </div>
                </li>
              ),
            )}
          </ol>
          <div className="actions">
            <button type="button" onClick={addAll} disabled={editingKey !== null}>
              Add {plural(drafts.length, 'draft', 'drafts')} to backlog
            </button>
            <button type="button" onClick={discardAll} disabled={editingKey !== null}>
              Discard all
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
