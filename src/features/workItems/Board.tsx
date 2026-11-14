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
}

function criteriaLabel(count: number) {
  return count === 1 ? '1 acceptance criterion' : `${count} acceptance criteria`
}

function sprintOptionLabel(sprint: Sprint) {
  return `${sprint.name} (${SPRINT_STATE_LABELS[sprint.state]})`
}

export function Board({ items, sprints, assignable, pendingFocus, canEdit, onMove, onAssign, onEdit }: BoardProps) {
  return (
    <div className="board">
      {STATUSES.map((status) => {
        const columnItems = items.filter((item) => item.status === status)
        const headingId = `column-${status}`
        return (
          <section key={status} className="board-column" aria-labelledby={headingId}>
            <h3 id={headingId}>
              {STATUS_LABELS[status]} <span className="column-count">({columnItems.length})</span>
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
                      <h4>
                        <span className={`badge badge-${item.type}`}>{TYPE_LABELS[item.type]}</span> {item.title}
                      </h4>
                      <p className="item-meta">
                        {PRIORITY_LABELS[item.priority]} priority · {criteriaLabel(item.acceptanceCriteria.length)}
                      </p>
                      <div className="card-actions">
                        <label className="visually-hidden" htmlFor={selectId}>
                          Status of {item.title}
                        </label>
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
                        <label className="visually-hidden" htmlFor={sprintSelectId}>
                          Sprint for {item.title}
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
                        {canEdit && (
                          <button type="button" aria-label={`Edit ${item.title}`} onClick={() => onEdit(item)}>
                            Edit
                          </button>
                        )}
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </section>
        )
      })}
    </div>
  )
}
