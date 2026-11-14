import { useRef, useState } from 'react'
import { Link, useLocation } from 'react-router'
import { createProject, updateProject, type ProjectInput } from '../../domain/project'
import { useDocumentTitle } from '../../lib/useDocumentTitle'
import { useFocusReturn } from '../../lib/useFocusReturn'
import { useAppData } from '../../state/useAppData'
import { useAddDemo } from '../data/useAddDemo'
import { ProjectForm } from './ProjectForm'

type Editing = { mode: 'none' } | { mode: 'create' } | { mode: 'edit'; projectId: string }

function now() {
  return new Date().toISOString()
}

export function ProjectsPage() {
  const { data, dispatch } = useAppData()
  const [editing, setEditing] = useState<Editing>({ mode: 'none' })
  const { returnTo, focusTarget } = useFocusReturn()
  const addDemo = useAddDemo()
  useDocumentTitle('Projects')
  const location = useLocation()
  // Set by a page that sent the user here after a change, e.g. deleting a project.
  const announcement = (location.state as { announcement?: string } | null)?.announcement
  // Focus the announcement once per navigation, not on every re-render.
  const announcedFor = useRef<string | null>(null)

  /** Closes the form and sends focus back to the button that opened it. */
  const close = () => {
    returnTo(editing.mode === 'edit' ? `edit-${editing.projectId}` : 'new')
    setEditing({ mode: 'none' })
  }

  function handleCreate(input: ProjectInput) {
    dispatch({ type: 'project/created', project: createProject(input, crypto.randomUUID(), now()) })
    close()
  }

  function handleUpdate(projectId: string, input: ProjectInput) {
    const project = data.projects.find((p) => p.id === projectId)
    if (project) dispatch({ type: 'project/updated', project: updateProject(project, input, now()) })
    close()
  }

  return (
    <section aria-labelledby="projects-heading">
      <div className="section-header">
        <h2 id="projects-heading">Projects</h2>
        {editing.mode === 'none' && (
          <button type="button" ref={focusTarget('new')} onClick={() => setEditing({ mode: 'create' })}>
            New project
          </button>
        )}
      </div>

      {announcement && (
        <p
          className="announcement"
          role="status"
          tabIndex={-1}
          ref={(el) => {
            if (el && announcedFor.current !== location.key) {
              announcedFor.current = location.key
              el.focus()
            }
          }}
        >
          {announcement}
        </p>
      )}

      {editing.mode === 'create' && (
        <ProjectForm title="New project" submitLabel="Create project" onSubmit={handleCreate} onCancel={close} />
      )}

      {data.projects.length === 0 ? (
        editing.mode !== 'create' && (
          <div className="empty-state">
            <p>No projects yet.</p>
            <p>
              Create one, or{' '}
              <button type="button" className="link-button" onClick={addDemo}>
                add a demo project
              </button>{' '}
              to explore with sample sprints and work items.
            </p>
          </div>
        )
      ) : (
        <ul className="project-list">
          {data.projects.map((project) =>
            editing.mode === 'edit' && editing.projectId === project.id ? (
              <li key={project.id}>
                <ProjectForm
                  title={`Edit ${project.name}`}
                  submitLabel="Save changes"
                  initial={{ name: project.name, description: project.description }}
                  onSubmit={(input) => handleUpdate(project.id, input)}
                  onCancel={close}
                />
              </li>
            ) : (
              <li key={project.id} className="project-row">
                <div>
                  <h3>
                    <Link to={`/projects/${project.id}`}>{project.name}</Link>
                  </h3>
                  {project.description && <p>{project.description}</p>}
                </div>
                {editing.mode === 'none' && (
                  <button
                    type="button"
                    ref={focusTarget(`edit-${project.id}`)}
                    aria-label={`Edit ${project.name}`}
                    onClick={() => setEditing({ mode: 'edit', projectId: project.id })}
                  >
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
