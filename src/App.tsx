import { useState } from 'react'
import { Route, Routes } from 'react-router'
import { NotFound } from './components/NotFound'
import { SaveErrorBanner } from './components/SaveErrorBanner'
import { StorageError } from './components/StorageError'
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

  function handleReset() {
    const confirmed = window.confirm(
      'Reset deletes all SprintLab data saved in this browser. This cannot be undone. Continue?',
    )
    if (!confirmed) return
    resetData()
    setLoaded(loadData())
  }

  return (
    <main className="app">
      <h1>SprintLab</h1>
      <p>A small project and bug tracker for a solo developer.</p>
      {loaded.ok ? (
        <AppDataProvider initialData={loaded.data}>
          <SaveStatus />
          <Routes>
            <Route path="/" element={<ProjectsPage />} />
            <Route path="/projects/:projectId" element={<ProjectPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppDataProvider>
      ) : (
        <StorageError error={loaded.error} raw={loaded.raw} onReset={handleReset} />
      )}
    </main>
  )
}

export default App
