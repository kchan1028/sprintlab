import type { RefObject } from 'react'
import type { Status, WorkItem } from '../../domain/types'
import { PRIORITY_LABELS, STATUSES, STATUS_LABELS, TYPE_LABELS } from '../../domain/workItem'

interface BoardProps {
  items: WorkItem[]
  /** Id of an item whose status control should take focus after it renders in its new column. */
  pendingFocus: RefObject<string | null>
  canEdit: boolean
  onMove: (item: WorkItem, status: Status) => void
  onEdit: (item: WorkItem) => void
}

function criteriaLabel(count: number) {
  return count === 1 ? '1 acceptance criterion' : `${count} acceptance criteria`
}

export function Board({ items, pendingFocus, canEdit, onMove, onEdit }: BoardProps) {
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
