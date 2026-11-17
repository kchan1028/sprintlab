import type { RefObject } from 'react'
import type { Sprint, Status, WorkItem } from '../../domain/types'
import { SPRINT_STATE_LABELS } from '../../domain/sprint'
import { PRIORITY_LABELS, STATUSES, STATUS_LABELS, TYPE_LABELS } from '../../domain/workItem'

interface BoardProps {
  items: WorkItem[]
  /** All of the project's sprints; completed ones only appear on items already in them. */
  sprints: Sprint[]
  /** Planned and active sprints that items can be moved into. */
  assignable: Sprint[]
  /** Id of an item whose status control should take focus after it renders in its new column. */
  pendingFocus: RefObject<string | null>
  canEdit: boolean
  onMove: (item: WorkItem, status: Status) => void
  onAssign: (item: WorkItem, sprintId: string | null) => void
  onEdit: (item: WorkItem) => void
  /** Lets the parent return focus to an item's Edit button after its form closes. */
  editButtonRef?: (itemId: string) => (el: HTMLButtonElement | null) => void
}

function criteriaLabel(count: number) {
  return count === 1 ? '1 acceptance criterion' : `${count} acceptance criteria`
}

function sprintOptionLabel(sprint: Sprint) {
  return `${sprint.name} (${SPRINT_STATE_LABELS[sprint.state]})`
}

export function Board({
  items,
  sprints,
  assignable,
  pendingFocus,
  canEdit,
  onMove,
  onAssign,
  onEdit,
  editButtonRef,
}: BoardProps) {
  return (
    <>
    <nav aria-label="Board columns" className="board-jump-links">
      {STATUSES.map((status) => (
        <a key={status} data-empty={items.every((item) => item.status !== status)} href={`#column-${status}`}>
          {STATUS_LABELS[status]} <span>({items.filter((item) => item.status === status).length})</span>
        </a>
      ))}
    </nav>
    <div className="board" data-has-items={items.length > 0}>
      {STATUSES.map((status) => {
        const columnItems = items.filter((item) => item.status === status)
        const headingId = `column-${status}`
        return (
          <section key={status} className={`board-column${columnItems.length === 0 ? ' board-column-empty' : ''}`} data-status={status} aria-labelledby={headingId}>
            <h3 id={headingId}>
              <span className="column-label"><span className="status-dot" aria-hidden="true" />{STATUS_LABELS[status]}</span>{' '}<span className="column-count">({columnItems.length})</span>
            </h3>
            {columnItems.length === 0 ? (
              <p className="empty-state">No items</p>
            ) : (
              <ul className="card-list">
                {columnItems.map((item) => {
                  const selectId = `status-${item.id}`
                  const sprintSelectId = `sprint-${item.id}`
                  const current = sprints.find((s) => s.id === item.sprintId)
                  const showCurrentCompleted = current?.state === 'completed'
                  return (
                    <li key={item.id} className="card">
                      <div className="card-topline">
                        <span className={`badge badge-${item.type}`}>{TYPE_LABELS[item.type]}</span>
                        <span className={`priority priority-${item.priority}`}>{PRIORITY_LABELS[item.priority]} priority</span>
                      </div>
                      <h4>{item.title}</h4>
                      <p className="item-meta">
                        {criteriaLabel(item.acceptanceCriteria.length)}
                      </p>
                      <div className="card-actions">
                        <label className="card-control-label" htmlFor={selectId}>Status{' '}<span className="visually-hidden">of {item.title}</span></label>
                        <select
                          id={selectId}
                          value={item.status}
                          onChange={(e) => onMove(item, e.target.value as Status)}
                          ref={(el) => {
                            if (el && pendingFocus.current === item.id) {
                              el.focus()
                              pendingFocus.current = null
                            }
                          }}
                        >
                          {STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {STATUS_LABELS[s]}
                            </option>
                          ))}
                        </select>
                        {canEdit && (
                          <button
                            type="button"
                            ref={editButtonRef?.(item.id)}
                            aria-label={`Edit ${item.title}`}
                            onClick={() => onEdit(item)}
                          >
                            Edit
                          </button>
                        )}
                      </div>
                      <p className="card-sprint">{current ? `Sprint: ${current.name}` : 'No sprint assigned'}</p>
                      <details className="item-details">
                        <summary>Details and sprint</summary>
                        <div className="card-assignment">
                        <label className="card-control-label" htmlFor={sprintSelectId}>
                          Sprint{' '}<span className="visually-hidden">for {item.title}</span>
                        </label>
                        <select
                          id={sprintSelectId}
                          value={item.sprintId ?? ''}
                          onChange={(e) => onAssign(item, e.target.value || null)}
                        >
                          <option value="">No sprint</option>
                          {showCurrentCompleted && current && (
                            <option value={current.id} disabled>
                              {sprintOptionLabel(current)}
                            </option>
                          )}
                          {assignable.map((s) => (
                            <option key={s.id} value={s.id}>
                              {sprintOptionLabel(s)}
                            </option>
                          ))}
                        </select>
                        </div>
                        {item.description && <p className="item-description">{item.description}</p>}
                        {item.acceptanceCriteria.length > 0 ? (
                          <ul className="item-criteria">
                            {item.acceptanceCriteria.map((criterion, index) => <li key={index}>{criterion}</li>)}
                          </ul>
                        ) : <p className="field-hint">No acceptance criteria yet.</p>}
                      </details>
                    </li>
                  )
                })}
              </ul>
            )}
          </section>
        )
      })}
    </div>
    </>
  )
}
