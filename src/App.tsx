import { useState } from 'react'
import { NavLink, Route, Routes } from 'react-router'
import { ErrorBoundary } from './components/ErrorBoundary'
import { NotFound } from './components/NotFound'
import { SaveErrorBanner } from './components/SaveErrorBanner'
import { StorageError } from './components/StorageError'
import { DataPage } from './features/data/DataPage'
import { ProjectPage } from './features/projects/ProjectPage'
import { ProjectsPage } from './features/projects/ProjectsPage'
import { loadData, resetData, type LoadResult } from './repository/storage'
import { AppDataProvider } from './state/AppDataProvider'
import { useAppData } from './state/useAppData'

function SaveStatus() {
  const { saveError } = useAppData()
  return saveError ? <SaveErrorBanner error={saveError} /> : null
}

function App() {
  const [loaded, setLoaded] = useState<LoadResult>(() => loadData())
  const [resetFailed, setResetFailed] = useState(false)

  function handleReset() {
    const confirmed = window.confirm(
      'Reset deletes all SprintLab data saved in this browser. This cannot be undone. Continue?',
    )
    if (!confirmed) return
    const result = resetData()
    setResetFailed(!result.ok)
    if (result.ok) setLoaded(loadData())
  }

  return (
    <main className="app">
      <header className="app-header">
        <div>
          <h1>SprintLab</h1>
          <p>A small project and bug tracker for a solo developer.</p>
        </div>
        {loaded.ok && (
          <nav aria-label="Main" className="main-nav">
            <NavLink to="/" end>
              Projects
            </NavLink>
            <NavLink to="/data">Your data</NavLink>
          </nav>
        )}
      </header>
      {loaded.ok ? (
        <AppDataProvider initialData={loaded.data}>
          <SaveStatus />
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<ProjectsPage />} />
              <Route path="/projects/:projectId" element={<ProjectPage />} />
              <Route path="/data" element={<DataPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </ErrorBoundary>
        </AppDataProvider>
      ) : (
        <StorageError error={loaded.error} raw={loaded.raw} onReset={handleReset} resetFailed={resetFailed} />
      )}
    </main>
  )
}

export default App
