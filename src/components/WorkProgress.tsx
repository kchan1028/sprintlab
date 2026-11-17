import { useId } from 'react'
import type { WorkItem } from '../domain/types'
import { STATUSES, STATUS_LABELS } from '../domain/workItem'

interface WorkProgressProps {
  items: WorkItem[]
  label: string
  context: string
  compact?: boolean
}

/** Current item counts, not capacity, effort, or a historical commitment measure. */
export function WorkProgress({ items, label, context, compact = false }: WorkProgressProps) {
  const id = useId()
  const done = items.filter((item) => item.status === 'done').length
  const total = items.length

  return (
    <div className={`work-progress${compact ? ' work-progress-compact' : ''}`}>
      <div className="progress-caption">
        <span id={id}>{label}{' '}<span className="visually-hidden">for {context}</span></span>
        <span className="progress-count">{total === 0 ? 'No work items yet' : `${done} of ${total} items done`}</span>
      </div>
      {total > 0 && (
        <>
          <progress
            aria-labelledby={id}
            aria-valuetext={`${done} of ${total} items done`}
            value={done}
            max={total}
          />
          {!compact && (
            <dl className="status-breakdown" aria-label="Assigned items by status">
              {STATUSES.map((status) => (
                <div key={status} data-status={status} data-empty={items.every((item) => item.status !== status)}>
                  <dt>{STATUS_LABELS[status]}</dt>
                  <dd>{items.filter((item) => item.status === status).length}</dd>
                </div>
              ))}
            </dl>
          )}
        </>
      )}
    </div>
  )
}
