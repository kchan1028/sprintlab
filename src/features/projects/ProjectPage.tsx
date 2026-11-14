import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { projectFootprint } from '../../domain/deletion'
import { backupFilename, downloadText } from '../../lib/download'
import { useDocumentTitle } from '../../lib/useDocumentTitle'
import { useFocusReturn } from '../../lib/useFocusReturn'
import { useAppData } from '../../state/useAppData'
import { SprintsSection } from '../sprints/SprintsSection'
import { WorkItemsSection } from '../workItems/WorkItemsSection'
import { DeleteProjectPanel } from './DeleteProjectPanel'

function plural(n: number, one: string, many: string) {
  return `${n} ${n === 1 ? one : many}`
}

export function ProjectPage() {
  const { projectId } = useParams()
  const { data, dispatch } = useAppData()
  const navigate = useNavigate()
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  // True between confirming a delete and the navigation away finishing.
  const [deleted, setDeleted] = useState(false)
  const { returnTo, focusTarget } = useFocusReturn()
  const project = data.projects.find((p) => p.id === projectId)
  useDocumentTitle(project ? project.name : deleted ? 'Projects' : 'Project not found')

  // Navigation is applied as a transition, so the delete can render first; show nothing meanwhile.
  if (!project && deleted) return null

  if (!project) {
    return (
      <section aria-labelledby="not-found-heading">
        <h2 id="not-found-heading">Project not found</h2>
        <p>It may have been deleted, or the link is wrong.</p>
        <Link to="/">Back to all projects</Link>
      </section>
    )
  }

  const footprint = projectFootprint(data, project.id)

  function handleDelete() {
    if (!project) return
    const message = `Deleted “${project.name}” with ${plural(footprint.workItems, 'work item', 'work items')} and ${plural(footprint.sprints, 'sprint', 'sprints')}.`
    setDeleted(true)
    navigate('/', { state: { announcement: message } })
    dispatch({ type: 'project/deleted', projectId: project.id })
  }

  function cancelDelete() {
    returnTo('delete')
    setConfirmingDelete(false)
  }

  return (
    <>
      <nav aria-label="Breadcrumb">
        <Link to="/">All projects</Link>
      </nav>
      <header className="project-header">
        <div className="section-header">
          <h2>{project.name}</h2>
          {!confirmingDelete && (
            <button type="button" ref={focusTarget('delete')} onClick={() => setConfirmingDelete(true)}>
              Delete project
            </button>
          )}
        </div>
        {project.description && <p>{project.description}</p>}
        {confirmingDelete && (
          <DeleteProjectPanel
            project={project}
            footprint={footprint}
            onDownload={() => downloadText(backupFilename(), JSON.stringify(data, null, 2))}
            onConfirm={handleDelete}
            onCancel={cancelDelete}
          />
        )}
      </header>
      <SprintsSection project={project} />
      <WorkItemsSection project={project} />
    </>
  )
}
