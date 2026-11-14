import { Link, useParams } from 'react-router'
import { useAppData } from '../../state/useAppData'
import { SprintsSection } from '../sprints/SprintsSection'
import { WorkItemsSection } from '../workItems/WorkItemsSection'

export function ProjectPage() {
  const { projectId } = useParams()
  const { data } = useAppData()
  const project = data.projects.find((p) => p.id === projectId)

  if (!project) {
    return (
      <section aria-labelledby="not-found-heading">
        <h2 id="not-found-heading">Project not found</h2>
        <p>It may have been deleted, or the link is wrong.</p>
        <Link to="/">Back to all projects</Link>
      </section>
    )
  }

  return (
    <>
      <nav aria-label="Breadcrumb">
        <Link to="/">All projects</Link>
      </nav>
      <header className="project-header">
        <h2>{project.name}</h2>
        {project.description && <p>{project.description}</p>}
      </header>
      <SprintsSection project={project} />
      <WorkItemsSection project={project} />
    </>
  )
}
