import { useRef, useState } from 'react'
import { useSearchParams } from 'react-router'
import {
  assignWorkItem,
  assignableSprints,
  filterToParam,
  matchesFilter,
  parseSprintFilter,
  type SprintFilter,
} from '../../domain/planning'
import { SPRINT_STATE_LABELS, sortSprints } from '../../domain/sprint'
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
  const [assignError, setAssignError] = useState<string | null>(null)
  const pendingFocus = useRef<string | null>(null)
  const filterRef = useRef<HTMLSelectElement>(null)
  const [searchParams, setSearchParams] = useSearchParams()
  const close = () => setEditing({ mode: 'none' })

  const items = data.workItems.filter((w) => w.projectId === project.id)
  const sprints = sortSprints(data.sprints.filter((s) => s.projectId === project.id))
  const assignable = assignableSprints(sprints, project.id)
  const filter = parseSprintFilter(searchParams.get('sprint'), sprints)
  const visibleItems = items.filter((w) => matchesFilter(w, filter))

  function setFilter(next: SprintFilter) {
    const value = filterToParam(next)
    setSearchParams(
      (current) => {
        // Copy rather than mutate the router's current params.
        const next = new URLSearchParams(current)
        if (value === null) next.delete('sprint')
        else next.set('sprint', value)
        return next
      },
      { replace: true },
    )
  }

  function handleFilterChange(value: string) {
    setFilter(value === 'all' ? { kind: 'all' } : value === 'none' ? { kind: 'none' } : { kind: 'sprint', sprintId: value })
  }
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

  function handleAssign(item: WorkItem, sprintId: string | null) {
    const sprint = sprintId ? (sprints.find((s) => s.id === sprintId) ?? null) : null
    const result = assignWorkItem(item, sprint, now())
    if (!result.ok) {
      setAssignError(result.reason)
      return
    }
    setAssignError(null)
    if (result.item === item) return
    // If the item no longer matches the filter its card disappears; keep keyboard focus nearby.
    if (!matchesFilter(result.item, filter)) filterRef.current?.focus()
    dispatch({ type: 'workItem/updated', workItem: result.item })
  }

  const filterValue = filter.kind === 'sprint' ? filter.sprintId : filter.kind

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

      <div className="board-toolbar">
        <label htmlFor="sprint-filter">Show</label>
        <select id="sprint-filter" ref={filterRef} value={filterValue} onChange={(e) => handleFilterChange(e.target.value)}>
          <option value="all">All items</option>
          <option value="none">No sprint (product backlog)</option>
          {sprints.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} ({SPRINT_STATE_LABELS[s.state]})
            </option>
          ))}
        </select>
        {filter.kind !== 'all' && (
          <p className="filter-status" role="status">
            Showing {visibleItems.length} of {items.length} items.{' '}
            <button type="button" className="link-button" onClick={() => setFilter({ kind: 'all' })}>
              Show all
            </button>
          </p>
        )}
      </div>
      {assignError && (
        <p role="alert" className="field-error">
          {assignError}
        </p>
      )}

      <Board
        items={visibleItems}
        sprints={sprints}
        assignable={assignable}
        pendingFocus={pendingFocus}
        canEdit={editing.mode === 'none'}
        onMove={handleMove}
        onAssign={handleAssign}
        onEdit={(item) => setEditing({ mode: 'edit', itemId: item.id })}
      />
    </section>
  )
}
