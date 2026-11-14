import { useRef, useState } from 'react'
import type { Project, Status, WorkItem } from '../../domain/types'
import {
  createWorkItem,
  moveWorkItem,
  toWorkItemInput,
  updateWorkItem,
  type WorkItemInput,
} from '../../domain/workItem'
import { useAppData } from '../../state/useAppData'
import { Board } from './Board'
import { WorkItemForm } from './WorkItemForm'

type Editing = { mode: 'none' } | { mode: 'create' } | { mode: 'edit'; itemId: string }

function now() {
  return new Date().toISOString()
}

export function WorkItemsSection({ project }: { project: Project }) {
  const { data, dispatch } = useAppData()
  const [editing, setEditing] = useState<Editing>({ mode: 'none' })
  const pendingFocus = useRef<string | null>(null)
  const close = () => setEditing({ mode: 'none' })
  const items = data.workItems.filter((w) => w.projectId === project.id)
  const editingItem = editing.mode === 'edit' ? items.find((w) => w.id === editing.itemId) : undefined

  function handleCreate(input: WorkItemInput) {
    dispatch({ type: 'workItem/created', workItem: createWorkItem(input, project.id, crypto.randomUUID(), now()) })
    close()
  }

  function handleUpdate(item: WorkItem, input: WorkItemInput) {
    dispatch({ type: 'workItem/updated', workItem: updateWorkItem(item, input, now()) })
    close()
  }

  function handleMove(item: WorkItem, status: Status) {
    const moved = moveWorkItem(item, status, now())
    if (moved === item) return
    // The card remounts in its new column; return focus to its status control there.
    pendingFocus.current = item.id
    dispatch({ type: 'workItem/updated', workItem: moved })
  }

  return (
    <section aria-labelledby="board-heading">
      <div className="section-header">
        <h2 id="board-heading">Board</h2>
        {editing.mode === 'none' && (
          <button type="button" onClick={() => setEditing({ mode: 'create' })}>
            New work item
          </button>
        )}
      </div>

      {editing.mode === 'create' && (
        <WorkItemForm title="New work item" submitLabel="Create work item" onSubmit={handleCreate} onCancel={close} />
      )}
      {editingItem && (
        <WorkItemForm
          key={editingItem.id}
          title={`Edit ${editingItem.title}`}
          submitLabel="Save changes"
          initial={toWorkItemInput(editingItem)}
          onSubmit={(input) => handleUpdate(editingItem, input)}
          onCancel={close}
        />
      )}

      {items.length === 0 && editing.mode === 'none' && (
        <p className="empty-state">No work items yet. New items start in Backlog.</p>
      )}
      <Board
        items={items}
        pendingFocus={pendingFocus}
        canEdit={editing.mode === 'none'}
        onMove={handleMove}
        onEdit={(item) => setEditing({ mode: 'edit', itemId: item.id })}
      />
    </section>
  )
}
