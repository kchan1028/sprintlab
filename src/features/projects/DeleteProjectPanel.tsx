import { useId } from 'react'
import type { ProjectFootprint } from '../../domain/deletion'
import type { Project } from '../../domain/types'

interface DeleteProjectPanelProps {
  project: Project
  footprint: ProjectFootprint
  onDownload: () => void
  onConfirm: () => void
  onCancel: () => void
}

function plural(n: number, one: string, many: string) {
  return `${n} ${n === 1 ? one : many}`
}

export function DeleteProjectPanel({ project, footprint, onDownload, onConfirm, onCancel }: DeleteProjectPanelProps) {
  const id = useId()
  return (
    <section className="danger-panel" aria-labelledby={`${id}-heading`}>
      <h3 id={`${id}-heading`}>Delete “{project.name}”?</h3>
      <p>
        This deletes the project, its {plural(footprint.workItems, 'work item', 'work items')} and{' '}
        {plural(footprint.sprints, 'sprint', 'sprints')} from this browser. <strong>It can't be undone.</strong>
      </p>
      <div className="actions">
        <button type="button" onClick={onDownload}>
          Download a copy first
        </button>
        <button type="button" className="danger-button" onClick={onConfirm}>
          Delete project
        </button>
        <button type="button" onClick={onCancel} autoFocus>
          Cancel
        </button>
      </div>
    </section>
  )
}
