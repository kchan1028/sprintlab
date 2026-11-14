import { useState } from 'react'
import type { Project } from '../../domain/types'
import {
  PRIORITY_LABELS,
  STATUS_LABELS,
  TYPE_LABELS,
  createWorkItem,
  toWorkItemInput,
  updateWorkItem,
  type WorkItemInput,
} from '../../domain/workItem'
import { useAppData } from '../../state/useAppData'
import { WorkItemForm } from './WorkItemForm'

type Editing = { mode: 'none' } | { mode: 'create' } | { mode: 'edit'; itemId: string }

function now() {
  return new Date().toISOString()
}

export function WorkItemsSection({ project }: { project: Project }) {
  const { data, dispatch } = useAppData()
  const [editing, setEditing] = useState<Editing>({ mode: 'none' })
  const close = () => setEditing({ mode: 'none' })
  const items = data.workItems.filter((w) => w.projectId === project.id)

  function handleCreate(input: WorkItemInput) {
    dispatch({ type: 'workItem/created', workItem: createWorkItem(input, project.id, crypto.randomUUID(), now()) })
    close()
  }

  function handleUpdate(itemId: string, input: WorkItemInput) {
    const item = data.workItems.find((w) => w.id === itemId)
    if (item) dispatch({ type: 'workItem/updated', workItem: updateWorkItem(item, input, now()) })
    close()
  }

  return (
    <section aria-labelledby="work-items-heading">
      <div className="section-header">
        <h2 id="work-items-heading">Work items</h2>
        {editing.mode === 'none' && (
          <button type="button" onClick={() => setEditing({ mode: 'create' })}>
            New work item
          </button>
        )}
      </div>

      {editing.mode === 'create' && (
        <WorkItemForm title="New work item" submitLabel="Create work item" onSubmit={handleCreate} onCancel={close} />
      )}

      {items.length === 0 ? (
        editing.mode !== 'create' && <p className="empty-state">No work items yet.</p>
      ) : (
        <ul className="item-list">
          {items.map((item) =>
            editing.mode === 'edit' && editing.itemId === item.id ? (
              <li key={item.id}>
                <WorkItemForm
                  title={`Edit ${item.title}`}
                  submitLabel="Save changes"
                  initial={toWorkItemInput(item)}
                  onSubmit={(input) => handleUpdate(item.id, input)}
                  onCancel={close}
                />
              </li>
            ) : (
              <li key={item.id} className="item-row">
                <div>
                  <h3>
                    <span className={`badge badge-${item.type}`}>{TYPE_LABELS[item.type]}</span> {item.title}
                  </h3>
                  <p className="item-meta">
                    {PRIORITY_LABELS[item.priority]} priority · {STATUS_LABELS[item.status]} ·{' '}
                    {item.acceptanceCriteria.length === 1
                      ? '1 acceptance criterion'
                      : `${item.acceptanceCriteria.length} acceptance criteria`}
                  </p>
                  {item.description && <p>{item.description}</p>}
                </div>
                {editing.mode === 'none' && (
                  <button type="button" aria-label={`Edit ${item.title}`} onClick={() => setEditing({ mode: 'edit', itemId: item.id })}>
                    Edit
                  </button>
                )}
              </li>
            ),
          )}
        </ul>
      )}
    </section>
  )
}
