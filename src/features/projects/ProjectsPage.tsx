import { useState } from 'react'
import { createProject, updateProject, type ProjectInput } from '../../domain/project'
import { useAppData } from '../../state/useAppData'
import { ProjectForm } from './ProjectForm'

type Editing = { mode: 'none' } | { mode: 'create' } | { mode: 'edit'; projectId: string }

function now() {
  return new Date().toISOString()
}

export function ProjectsPage() {
  const { data, dispatch } = useAppData()
  const [editing, setEditing] = useState<Editing>({ mode: 'none' })
  const close = () => setEditing({ mode: 'none' })

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
          <button type="button" onClick={() => setEditing({ mode: 'create' })}>
            New project
          </button>
        )}
      </div>

      {editing.mode === 'create' && (
        <ProjectForm title="New project" submitLabel="Create project" onSubmit={handleCreate} onCancel={close} />
      )}

      {data.projects.length === 0 ? (
        editing.mode !== 'create' && <p className="empty-state">No projects yet.</p>
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
                  <h3>{project.name}</h3>
                  {project.description && <p>{project.description}</p>}
                </div>
                {editing.mode === 'none' && (
                  <button
                    type="button"
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
